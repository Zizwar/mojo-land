import type {
  MojoConfig,
  MojoContext,
  EndpointConfig,
  User,
  LogEntry,
  FrameworkAdapter
} from '../types/index.ts';
import AIService from '../services/AIService.ts';
import EndpointGenerator from '../services/EndpointGenerator.ts';
import SmartQueryService from '../services/SmartQueryService.ts';

/**
 * MojoCore - Framework-agnostic core for Mojo Land
 * Can be used with any web framework through adapters
 */
export class MojoCore {
  private config: MojoConfig;
  private addons: Record<string, any> = {};
  private aiService?: AIService;
  private endpointGenerator?: EndpointGenerator;
  private smartQuery?: SmartQueryService;

  constructor(config: MojoConfig) {
    this.config = {
      tableName: 'mojos',
      tokenName: 'token',
      paramName: 'land',
      ...config
    };

    // Initialize AI services if provider is configured
    if (config.aiProvider) {
      this.aiService = new AIService(config.aiProvider);
      if (config.supabase) {
        this.endpointGenerator = new EndpointGenerator(this.aiService, config.supabase);
        this.smartQuery = new SmartQueryService(this.aiService, config.supabase);
      }
    }
  }

  /**
   * Add custom addons/plugins
   */
  use(addon: Record<string, any>): void {
    this.addons = { ...this.addons, ...addon };
  }

  /**
   * Get AI service instance
   */
  getAIService(): AIService | undefined {
    return this.aiService;
  }

  /**
   * Get endpoint generator
   */
  getEndpointGenerator(): EndpointGenerator | undefined {
    return this.endpointGenerator;
  }

  /**
   * Get smart query service
   */
  getSmartQuery(): SmartQueryService | undefined {
    return this.smartQuery;
  }

  /**
   * Main request handler - framework agnostic
   */
  async handleRequest(context: MojoContext): Promise<any> {
    const { request, response } = context;

    try {
      // Get user if authenticated
      const user = await this.getUserByToken(request);

      // Get endpoint configuration
      const endpointName = this.getEndpointName(request);
      const endpoint = await this.getEndpoint(endpointName);

      if (!endpoint) {
        return response.json({ error: 'Endpoint not found' }, 404);
      }

      // Determine method
      let method = this.determineMethod(request, endpoint);

      // Log if enabled
      if (endpoint.log) {
        await this.log({
          action: 'request',
          module: 'mojo',
          status: method,
          log: JSON.stringify({
            user: user?.id,
            endpoint: endpointName,
            method
          })
        });
      }

      // Check permissions
      if (!this.isAuthorized(user, endpoint, method)) {
        return response.json({ error: 'Unauthorized' }, 403);
      }

      // Create execution context
      const execContext = {
        user,
        body: request.body,
        query: request.query,
        params: request.params,
        headers: request.headers,
        json: response.json.bind(response),
        text: response.text.bind(response),
        supabase: this.config.supabase,
        cookies: this.config.cookies,
        log: this.log.bind(this),
        endpointData: endpoint,
        aiService: this.aiService,
        smartQuery: this.smartQuery,
        ...this.addons
      };

      // Handle AI-enabled endpoints
      if (endpoint.ai_enabled && request.body?.ai_query) {
        return await this.handleAIQuery(endpoint, request.body.ai_query, execContext);
      }

      // Execute dynamic function if exists
      if ((method === 'function' || endpoint.checker) && endpoint.function) {
        const result = await this.executeDynamicFunction(
          endpoint.function,
          execContext
        );
        if (result !== 'next') {
          return result;
        }
      }

      // Handle standard CRUD operations
      return await this.handleCRUD(method, endpoint, execContext);
    } catch (error) {
      console.error('Mojo request error:', error);
      await this.log({
        status: 'error',
        module: 'mojo',
        action: 'request',
        error,
        log: 'Request processing error'
      });
      return response.json({ error: 'Internal server error' }, 500);
    }
  }

  /**
   * Handle AI-powered query
   */
  private async handleAIQuery(
    endpoint: EndpointConfig,
    query: string,
    context: any
  ): Promise<any> {
    if (!this.smartQuery) {
      return context.json({ error: 'AI service not configured' }, 500);
    }

    const result = await this.smartQuery.query({
      endpoint: endpoint.endpoint,
      query,
      context: context.body?.context
    });

    if (!result.success) {
      return context.json({ error: result.error }, 400);
    }

    return context.json({
      success: true,
      data: result.data,
      sql: result.sql
    });
  }

  /**
   * Handle CRUD operations
   */
  private async handleCRUD(
    method: string,
    endpoint: EndpointConfig,
    context: any
  ): Promise<any> {
    const { body, query, user, json, supabase } = context;

    switch (method) {
      case 'create':
        return await this.handleCreate(endpoint, body, user, json, supabase);

      case 'read':
      case 'get':
      case 'post':
        return await this.handleRead(endpoint, body, query, user, json, supabase);

      case 'update':
        return await this.handleUpdate(endpoint, body, query, user, json, supabase);

      case 'delete':
        return await this.handleDelete(endpoint, query, user, json, supabase);

      case 'data':
        return json(endpoint.data);

      case 'text':
        return context.text(endpoint.text);

      case 'view':
        return json(endpoint);

      case 'sql':
      case 'rpc':
        return await this.handleRPC(endpoint, body, query, user, json, supabase);

      default:
        return json({ error: 'Method not supported' }, 400);
    }
  }

  /**
   * Handle CREATE operation
   */
  private async handleCreate(
    endpoint: EndpointConfig,
    body: any,
    user: User | undefined,
    json: Function,
    supabase: any
  ): Promise<any> {
    const validData = this.filterValidColumns(
      body?.insert ?? body?.create ?? body,
      endpoint
    );

    if (!validData) {
      return json({ error: 'Invalid data' }, 400);
    }

    // Apply role-based filtering
    if (endpoint.role && user?.id) {
      validData[endpoint.role] = user.id;
    }

    const { data, error } = await supabase
      .from(endpoint.table)
      .insert(validData)
      .select(endpoint.select || endpoint.selects || 'uuid');

    if (error) {
      return json({ error: error.message }, 500);
    }

    return json(data);
  }

  /**
   * Handle READ operation
   */
  private async handleRead(
    endpoint: EndpointConfig,
    body: any,
    query: Function,
    user: User | undefined,
    json: Function,
    supabase: any
  ): Promise<any> {
    let queryBuilder = supabase
      .from(endpoint.table)
      .select(endpoint.select || endpoint.selects || 'uuid');

    queryBuilder = await this.applyDataFilters(
      queryBuilder,
      endpoint,
      body,
      query,
      user
    );

    const { data, error } = await queryBuilder;

    if (error) {
      return json({ error: error.message }, 500);
    }

    return json(data);
  }

  /**
   * Handle UPDATE operation
   */
  private async handleUpdate(
    endpoint: EndpointConfig,
    body: any,
    query: Function,
    user: User | undefined,
    json: Function,
    supabase: any
  ): Promise<any> {
    const validData = this.filterValidColumns(body?.update ?? body, endpoint);

    if (!validData) {
      return json({ error: 'Invalid data' }, 400);
    }

    let queryBuilder = supabase
      .from(endpoint.table)
      .update(validData)
      .select(endpoint.select || endpoint.selects || 'uuid');

    queryBuilder = await this.applyDataFilters(
      queryBuilder,
      endpoint,
      body,
      query,
      user
    );

    const { data, error } = await queryBuilder;

    if (error) {
      return json({ error: error.message }, 500);
    }

    return json(data);
  }

  /**
   * Handle DELETE operation
   */
  private async handleDelete(
    endpoint: EndpointConfig,
    query: Function,
    user: User | undefined,
    json: Function,
    supabase: any
  ): Promise<any> {
    let queryBuilder = supabase.from(endpoint.table).delete().select();

    queryBuilder = await this.applyDataFilters(
      queryBuilder,
      endpoint,
      {},
      query,
      user
    );

    const { data, error } = await queryBuilder;

    if (error) {
      return json({ error: error.message }, 500);
    }

    return json(data);
  }

  /**
   * Handle RPC/SQL operations
   */
  private async handleRPC(
    endpoint: EndpointConfig,
    body: any,
    query: Function,
    user: User | undefined,
    json: Function,
    supabase: any
  ): Promise<any> {
    const rpcName = endpoint.rpc || endpoint.sql;
    if (!rpcName) {
      return json({ error: 'RPC function not specified' }, 400);
    }

    let queryBuilder = supabase.rpc(rpcName, body);

    queryBuilder = await this.applyDataFilters(
      queryBuilder,
      endpoint,
      body,
      query,
      user
    );

    const { data, error } = await queryBuilder;

    if (error) {
      return json({ error: error.message }, 500);
    }

    return json(data);
  }

  /**
   * Apply data filters (pagination, sorting, etc.)
   */
  private async applyDataFilters(
    queryBuilder: any,
    endpoint: EndpointConfig,
    body: any,
    query: Function,
    user?: User
  ): Promise<any> {
    const id = query('id');
    const uuid = query('uuid');
    const limit = query('limit');
    const page = query('page') || 0;
    const order = query('order');
    const ascending = !!query('ascending') || !!query('asc');

    if (order) queryBuilder = queryBuilder.order(order, { ascending });
    if (id) queryBuilder = queryBuilder.eq('id', id);
    else if (uuid) queryBuilder = queryBuilder.eq('uuid', uuid);
    if (endpoint.single) queryBuilder = queryBuilder.single();
    if (limit) queryBuilder = queryBuilder.limit(Math.min(limit, 100));
    if (page) {
      queryBuilder = queryBuilder.range(
        (page - 1) * limit,
        page * ((limit || 10) - 1)
      );
    }

    // Apply custom filters
    queryBuilder = this.applyCustomFilters(queryBuilder, endpoint, body);

    // Apply role-based filtering
    if (endpoint.role && user?.id) {
      queryBuilder = queryBuilder.eq(endpoint.role, user.id);
    }

    if (endpoint.csv) queryBuilder = queryBuilder.csv();

    return queryBuilder;
  }

  /**
   * Apply custom filters from endpoint config
   */
  private applyCustomFilters(
    queryBuilder: any,
    endpoint: EndpointConfig,
    body: any
  ): any {
    const filters = endpoint.filters;

    if (!body?.filters || !filters) {
      return queryBuilder;
    }

    const validFilters: any = {};
    for (const key in filters) {
      if (Object.prototype.hasOwnProperty.call(filters, key)) {
        const properties = (filters as any)[key]
          .map((prop: string) => {
            if (body.filters[key] && body.filters[key][prop]) {
              return [prop, body.filters[key][prop]];
            }
            return null;
          })
          .filter(Boolean);
        validFilters[key] = properties;
      }
    }

    const supportedFilters = [
      'eq', 'gt', 'lt', 'gte', 'lte', 'like', 'ilike',
      'is', 'in', 'neq', 'cs', 'cd', 'or', 'ts'
    ];

    for (const filter in validFilters) {
      if (supportedFilters.includes(filter)) {
        for (const [key, value] of validFilters[filter]) {
          switch (filter) {
            case 'eq': queryBuilder = queryBuilder.eq(key, value); break;
            case 'gt': queryBuilder = queryBuilder.gt(key, value); break;
            case 'lt': queryBuilder = queryBuilder.lt(key, value); break;
            case 'gte': queryBuilder = queryBuilder.gte(key, value); break;
            case 'lte': queryBuilder = queryBuilder.lte(key, value); break;
            case 'like': queryBuilder = queryBuilder.like(key, value); break;
            case 'ilike': queryBuilder = queryBuilder.ilike(key, value); break;
            case 'is': queryBuilder = queryBuilder.is(key, value); break;
            case 'in': queryBuilder = queryBuilder.in(key, value); break;
            case 'neq': queryBuilder = queryBuilder.neq(key, value); break;
            case 'cs': queryBuilder = queryBuilder.cs(key, value); break;
            case 'cd': queryBuilder = queryBuilder.cd(key, value); break;
            case 'or': queryBuilder = queryBuilder.or(value); break;
            case 'ts':
              queryBuilder = queryBuilder.textSearch(key, value, {
                config: 'english'
              });
              break;
          }
        }
      }
    }

    return queryBuilder;
  }

  /**
   * Execute dynamic function
   */
  private async executeDynamicFunction(
    functionCode: string,
    context: any
  ): Promise<any> {
    try {
      const dynamicFunction = new Function(
        'mojo',
        `return (async () => {${functionCode}})();`
      );

      return await dynamicFunction(context);
    } catch (error) {
      console.error('Dynamic function error:', error);
      throw error;
    }
  }

  /**
   * Filter valid columns based on endpoint config
   */
  private filterValidColumns(data: any, endpoint: EndpointConfig): any {
    if (!endpoint.columns || endpoint.columns === 'all' || endpoint.columns === '*') {
      return data;
    }

    const allowedColumns = endpoint.columns.split(',').map(c => c.trim());
    const validData: any = {};

    for (const key in data) {
      if (allowedColumns.includes(key)) {
        validData[key] = data[key];
      }
    }

    return validData;
  }

  /**
   * Check if user is authorized
   */
  private isAuthorized(
    user: User | undefined,
    endpoint: EndpointConfig,
    method: string
  ): boolean {
    if (!endpoint.method) return true;

    let permission: string | undefined;

    if (endpoint.methods) {
      permission = endpoint.methods[method]?.permissions;
    } else if (endpoint.permissions) {
      permission = endpoint.permissions[method];
    }

    if (!permission) return true;
    if (permission.includes('public')) return true;

    if (!user || !user.roles) return false;

    const allowedRoles = permission.split(',').map(r => r.trim());
    return user.roles.some(roleObj =>
      allowedRoles.includes(roleObj?.role?.name)
    );
  }

  /**
   * Determine method from request and endpoint config
   */
  private determineMethod(request: any, endpoint: EndpointConfig): string {
    let method = request.method.toLowerCase();

    if (endpoint.method) {
      if (endpoint.method.includes(',')) {
        method = request.body?.method || request.query('method') || method;
      } else {
        method = endpoint.method;
      }
    }

    return method.trim();
  }

  /**
   * Get endpoint name from request
   */
  private getEndpointName(request: any): string {
    return (
      request.params[this.config.paramName!] ||
      request.query('endpoint') ||
      request.body?.endpoint
    );
  }

  /**
   * Get endpoint configuration from database
   */
  private async getEndpoint(name: string): Promise<EndpointConfig | null> {
    try {
      const { data, error } = await this.config.supabase
        .from(this.config.tableName)
        .select('*')
        .eq('endpoint', name)
        .eq('status', 'active')
        .single();

      if (error || !data) return null;
      return data;
    } catch (error) {
      console.error('Error fetching endpoint:', error);
      return null;
    }
  }

  /**
   * Get user by access token
   */
  private async getUserByToken(request: any): Promise<User | undefined> {
    const token =
      request.query(this.config.tokenName) ||
      request.body?.token ||
      request.headers?.authorization?.replace('Bearer ', '');

    if (!token) return undefined;

    try {
      const { data, error } = await this.config.supabase
        .from('users')
        .select('id,uuid,username,is_active,roles(role(name))')
        .eq('token', token)
        .single();

      if (error || !data) return undefined;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  /**
   * Log event
   */
  private async log(entry: LogEntry): Promise<void> {
    try {
      await this.config.supabase.from('logs').insert(entry);
    } catch (error) {
      console.error('Logging error:', error);
    }
  }
}

export default MojoCore;
