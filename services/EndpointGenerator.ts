import AIService from './AIService.ts';
import type {
  AIGenerateEndpointRequest,
  AIGenerateEndpointResponse,
  EndpointConfig
} from '../types/index.ts';

/**
 * EndpointGenerator - AI-powered endpoint generation service
 * Creates API endpoints from natural language descriptions
 */
export class EndpointGenerator {
  private aiService: AIService;
  private supabase: any;

  constructor(aiService: AIService, supabase: any) {
    this.aiService = aiService;
    this.supabase = supabase;
  }

  /**
   * Generate endpoint from natural language prompt
   */
  async generateFromPrompt(
    request: AIGenerateEndpointRequest
  ): Promise<AIGenerateEndpointResponse> {
    try {
      // Get database schema if table specified
      let tableSchema;
      if (request.table) {
        tableSchema = await this.getTableSchema(request.table);
      } else {
        // Get all tables
        tableSchema = await this.getAllTablesSchema();
      }

      // Generate endpoint configuration using AI
      const config = await this.aiService.generateEndpointConfig(
        request.prompt,
        tableSchema,
        request.model
      );

      // Add default permissions if specified
      if (request.permissions && request.permissions.length > 0) {
        const permissionsStr = request.permissions.join(',');
        if (!config.permissions) {
          config.permissions = {};
        }

        const methods = config.method.split(',').map((m: string) => m.trim());
        methods.forEach((method: string) => {
          if (!config.permissions[method]) {
            config.permissions[method] = permissionsStr;
          }
        });
      }

      // Validate and sanitize the configuration
      const validatedConfig = this.validateEndpointConfig(config);

      // Save to database
      const savedEndpoint = await this.saveEndpoint(validatedConfig);

      return {
        success: true,
        endpoint: savedEndpoint
      };
    } catch (error) {
      console.error('Error generating endpoint:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate CRUD endpoints for a table
   */
  async generateCRUDEndpoints(
    tableName: string,
    baseEndpoint: string,
    permissions?: Record<string, string>
  ): Promise<AIGenerateEndpointResponse[]> {
    const tableSchema = await this.getTableSchema(tableName);
    const columns = tableSchema.columns?.map((c: any) => c.name).join(',') || 'all';

    const defaultPermissions = permissions || {
      get: 'public',
      create: 'user',
      update: 'user',
      delete: 'admin'
    };

    const endpoints: Partial<EndpointConfig>[] = [
      {
        endpoint: `${baseEndpoint}/list`,
        method: 'get',
        table: tableName,
        columns: 'all',
        select: columns,
        permissions: { get: defaultPermissions.get },
        status: 'active',
        log: true
      },
      {
        endpoint: `${baseEndpoint}/create`,
        method: 'create',
        table: tableName,
        columns,
        select: columns,
        permissions: { create: defaultPermissions.create },
        status: 'active',
        log: true
      },
      {
        endpoint: `${baseEndpoint}/update`,
        method: 'update',
        table: tableName,
        columns,
        select: columns,
        permissions: { update: defaultPermissions.update },
        status: 'active',
        log: true
      },
      {
        endpoint: `${baseEndpoint}/delete`,
        method: 'delete',
        table: tableName,
        permissions: { delete: defaultPermissions.delete },
        status: 'active',
        log: true
      }
    ];

    const results: AIGenerateEndpointResponse[] = [];

    for (const endpoint of endpoints) {
      try {
        const saved = await this.saveEndpoint(endpoint);
        results.push({ success: true, endpoint: saved });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Update endpoint using AI
   */
  async updateEndpointFromPrompt(
    endpointName: string,
    updatePrompt: string,
    model?: string
  ): Promise<AIGenerateEndpointResponse> {
    try {
      // Get existing endpoint
      const { data: existing, error } = await this.supabase
        .from('mojos')
        .select('*')
        .eq('endpoint', endpointName)
        .single();

      if (error || !existing) {
        return {
          success: false,
          error: 'Endpoint not found'
        };
      }

      // Generate update using AI
      const updatePromptFull = `Update this endpoint configuration based on this request: "${updatePrompt}"

Current configuration:
${JSON.stringify(existing, null, 2)}

Provide the complete updated configuration.`;

      const tableSchema = existing.table
        ? await this.getTableSchema(existing.table)
        : null;

      const updatedConfig = await this.aiService.generateEndpointConfig(
        updatePromptFull,
        tableSchema,
        model
      );

      // Merge with existing config
      const merged = { ...existing, ...updatedConfig, id: existing.id };
      const validated = this.validateEndpointConfig(merged);

      // Update in database
      const { data, error: updateError } = await this.supabase
        .from('mojos')
        .update(validated)
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return {
        success: true,
        endpoint: data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get table schema from database
   */
  private async getTableSchema(tableName: string): Promise<any> {
    try {
      // Query information_schema to get table structure
      const { data, error } = await this.supabase
        .rpc('get_table_schema', { table_name: tableName });

      if (error) {
        // Fallback: try to get sample data structure
        const { data: sample } = await this.supabase
          .from(tableName)
          .select('*')
          .limit(1)
          .single();

        if (sample) {
          return {
            table: tableName,
            columns: Object.keys(sample).map(key => ({
              name: key,
              type: typeof sample[key]
            }))
          };
        }

        return { table: tableName, columns: [] };
      }

      return { table: tableName, columns: data };
    } catch (error) {
      console.error('Error getting table schema:', error);
      return { table: tableName, columns: [] };
    }
  }

  /**
   * Get all tables schema
   */
  private async getAllTablesSchema(): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_all_tables_schema');

      if (error) {
        console.error('Error getting all tables:', error);
        return { tables: [] };
      }

      return { tables: data };
    } catch (error) {
      console.error('Error getting all tables:', error);
      return { tables: [] };
    }
  }

  /**
   * Validate endpoint configuration
   */
  private validateEndpointConfig(config: any): Partial<EndpointConfig> {
    const validated: Partial<EndpointConfig> = {
      endpoint: config.endpoint,
      method: config.method || 'get',
      status: config.status || 'active'
    };

    // Optional fields
    if (config.table) validated.table = config.table;
    if (config.columns) validated.columns = config.columns;
    if (config.select) validated.select = config.select;
    if (config.selects) validated.selects = config.selects;
    if (config.permissions) validated.permissions = config.permissions;
    if (config.filters) validated.filters = config.filters;
    if (config.role) validated.role = config.role;
    if (config.log !== undefined) validated.log = config.log;
    if (config.single !== undefined) validated.single = config.single;
    if (config.function) validated.function = config.function;
    if (config.checker !== undefined) validated.checker = config.checker;
    if (config.data) validated.data = config.data;
    if (config.text) validated.text = config.text;
    if (config.sql) validated.sql = config.sql;
    if (config.rpc) validated.rpc = config.rpc;
    if (config.csv !== undefined) validated.csv = config.csv;
    if (config.methods) validated.methods = config.methods;

    // AI specific fields
    if (config.ai_enabled !== undefined) validated.ai_enabled = config.ai_enabled;
    if (config.ai_config) validated.ai_config = config.ai_config;

    return validated;
  }

  /**
   * Save endpoint to database
   */
  private async saveEndpoint(config: Partial<EndpointConfig>): Promise<EndpointConfig> {
    const { data, error } = await this.supabase
      .from('mojos')
      .insert(config)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save endpoint: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete endpoint by name
   */
  async deleteEndpoint(endpointName: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('mojos')
        .delete()
        .eq('endpoint', endpointName);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting endpoint:', error);
      return false;
    }
  }

  /**
   * List all endpoints with optional filter
   */
  async listEndpoints(filter?: {
    status?: string;
    table?: string;
    method?: string;
  }): Promise<EndpointConfig[]> {
    try {
      let query = this.supabase.from('mojos').select('*');

      if (filter?.status) {
        query = query.eq('status', filter.status);
      }
      if (filter?.table) {
        query = query.eq('table', filter.table);
      }
      if (filter?.method) {
        query = query.eq('method', filter.method);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error listing endpoints:', error);
      return [];
    }
  }
}

export default EndpointGenerator;
