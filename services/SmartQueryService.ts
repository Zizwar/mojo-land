import AIService from './AIService.ts';
import type { AIQueryRequest, AIQueryResponse } from '../types/index.ts';

/**
 * SmartQueryService - AI-powered data querying
 * Allows natural language queries to fetch data
 */
export class SmartQueryService {
  private aiService: AIService;
  private supabase: any;

  constructor(aiService: AIService, supabase: any) {
    this.aiService = aiService;
    this.supabase = supabase;
  }

  /**
   * Execute natural language query
   */
  async query(request: AIQueryRequest): Promise<AIQueryResponse> {
    try {
      // Get endpoint configuration
      const { data: endpoint, error: endpointError } = await this.supabase
        .from('mojos')
        .select('*')
        .eq('endpoint', request.endpoint)
        .eq('status', 'active')
        .single();

      if (endpointError || !endpoint) {
        return {
          success: false,
          error: 'Endpoint not found or inactive'
        };
      }

      // Check if AI is enabled for this endpoint
      if (!endpoint.ai_enabled && !endpoint.ai_config?.enabled) {
        return {
          success: false,
          error: 'AI queries not enabled for this endpoint'
        };
      }

      // Get table schema
      const tableSchema = await this.getTableSchema(endpoint.table);

      // Generate filters from natural language query
      const filters = await this.aiService.queryToFilters(
        request.query,
        tableSchema,
        request.model || endpoint.ai_config?.model
      );

      // Build Supabase query
      let queryBuilder = this.supabase
        .from(endpoint.table)
        .select(endpoint.select || endpoint.selects || '*');

      // Apply AI-generated filters
      if (filters.filters) {
        queryBuilder = this.applyFilters(queryBuilder, filters.filters);
      }

      // Apply context filters if provided
      if (request.context) {
        queryBuilder = this.applyContextFilters(queryBuilder, request.context);
      }

      // Execute query
      const { data, error } = await queryBuilder;

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data,
        sql: this.buildSQLFromFilters(endpoint.table, filters.filters)
      };
    } catch (error) {
      console.error('Smart query error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate SQL query from natural language
   */
  async generateSQL(
    query: string,
    tableName?: string,
    model?: string
  ): Promise<AIQueryResponse> {
    try {
      let tableSchema;
      if (tableName) {
        tableSchema = await this.getTableSchema(tableName);
      } else {
        tableSchema = await this.getAllTablesSchema();
      }

      const sql = await this.aiService.generateSQL(query, tableSchema, model);

      return {
        success: true,
        sql
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Execute custom SQL with AI assistance
   */
  async executeSQLQuery(
    naturalQuery: string,
    tableName?: string,
    model?: string,
    dryRun: boolean = false
  ): Promise<AIQueryResponse> {
    try {
      // Generate SQL
      const sqlResult = await this.generateSQL(naturalQuery, tableName, model);

      if (!sqlResult.success || !sqlResult.sql) {
        return sqlResult;
      }

      // If dry run, just return the SQL
      if (dryRun) {
        return {
          success: true,
          sql: sqlResult.sql,
          data: null
        };
      }

      // Execute the SQL (only for SELECT queries for safety)
      if (!sqlResult.sql.trim().toLowerCase().startsWith('select')) {
        return {
          success: false,
          error: 'Only SELECT queries are allowed for security reasons',
          sql: sqlResult.sql
        };
      }

      const { data, error } = await this.supabase.rpc('execute_sql', {
        sql_query: sqlResult.sql
      });

      if (error) {
        return {
          success: false,
          error: error.message,
          sql: sqlResult.sql
        };
      }

      return {
        success: true,
        data,
        sql: sqlResult.sql
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Smart search across multiple fields
   */
  async smartSearch(
    tableName: string,
    searchQuery: string,
    searchFields?: string[],
    model?: string
  ): Promise<AIQueryResponse> {
    try {
      const tableSchema = await this.getTableSchema(tableName);

      // If no search fields specified, use AI to determine relevant fields
      let fieldsToSearch = searchFields;
      if (!fieldsToSearch) {
        const fieldPrompt = `Given this table schema: ${JSON.stringify(tableSchema)}
And this search query: "${searchQuery}"
Which fields should be searched? Return JSON array of field names only.`;

        const fields = await this.aiService.generateJSON(fieldPrompt, ['string'], model);
        fieldsToSearch = Array.isArray(fields) ? fields : [fields];
      }

      // Build search query
      let queryBuilder = this.supabase.from(tableName).select('*');

      // Create OR conditions for each field
      const orConditions = fieldsToSearch
        .map(field => `${field}.ilike.%${searchQuery}%`)
        .join(',');

      if (orConditions) {
        queryBuilder = queryBuilder.or(orConditions);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get aggregated insights using AI
   */
  async getInsights(
    tableName: string,
    question: string,
    model?: string
  ): Promise<AIQueryResponse> {
    try {
      // Fetch sample data
      const { data: sampleData } = await this.supabase
        .from(tableName)
        .select('*')
        .limit(100);

      if (!sampleData || sampleData.length === 0) {
        return {
          success: false,
          error: 'No data available for analysis'
        };
      }

      // Use AI to analyze and answer the question
      const prompt = `Analyze this data and answer the question.

Data sample (${sampleData.length} rows):
${JSON.stringify(sampleData.slice(0, 10), null, 2)}

Question: ${question}

Provide insights and answer in JSON format:
{
  "answer": "your answer here",
  "insights": ["insight 1", "insight 2"],
  "summary": "brief summary"
}`;

      const result = await this.aiService.generateJSON(prompt, {
        answer: 'string',
        insights: 'array',
        summary: 'string'
      }, model);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Apply filters to query builder
   */
  private applyFilters(queryBuilder: any, filters: any): any {
    const supportedFilters = [
      'eq', 'gt', 'lt', 'gte', 'lte',
      'like', 'ilike', 'is', 'in', 'neq',
      'cs', 'cd', 'or'
    ];

    for (const filter in filters) {
      if (supportedFilters.includes(filter)) {
        for (const [key, value] of filters[filter]) {
          switch (filter) {
            case 'eq':
              queryBuilder = queryBuilder.eq(key, value);
              break;
            case 'gt':
              queryBuilder = queryBuilder.gt(key, value);
              break;
            case 'lt':
              queryBuilder = queryBuilder.lt(key, value);
              break;
            case 'gte':
              queryBuilder = queryBuilder.gte(key, value);
              break;
            case 'lte':
              queryBuilder = queryBuilder.lte(key, value);
              break;
            case 'like':
              queryBuilder = queryBuilder.like(key, value);
              break;
            case 'ilike':
              queryBuilder = queryBuilder.ilike(key, value);
              break;
            case 'is':
              queryBuilder = queryBuilder.is(key, value);
              break;
            case 'in':
              queryBuilder = queryBuilder.in(key, value);
              break;
            case 'neq':
              queryBuilder = queryBuilder.neq(key, value);
              break;
            case 'cs':
              queryBuilder = queryBuilder.cs(key, value);
              break;
            case 'cd':
              queryBuilder = queryBuilder.cd(key, value);
              break;
            case 'or':
              queryBuilder = queryBuilder.or(value);
              break;
          }
        }
      }
    }

    return queryBuilder;
  }

  /**
   * Apply context filters
   */
  private applyContextFilters(queryBuilder: any, context: any): any {
    for (const [key, value] of Object.entries(context)) {
      queryBuilder = queryBuilder.eq(key, value);
    }
    return queryBuilder;
  }

  /**
   * Build SQL representation from filters (for logging/debugging)
   */
  private buildSQLFromFilters(tableName: string, filters: any): string {
    const conditions: string[] = [];

    for (const filter in filters) {
      for (const [key, value] of filters[filter]) {
        switch (filter) {
          case 'eq':
            conditions.push(`${key} = '${value}'`);
            break;
          case 'gt':
            conditions.push(`${key} > ${value}`);
            break;
          case 'lt':
            conditions.push(`${key} < ${value}`);
            break;
          case 'like':
            conditions.push(`${key} LIKE '${value}'`);
            break;
          case 'ilike':
            conditions.push(`${key} ILIKE '${value}'`);
            break;
        }
      }
    }

    const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
    return `SELECT * FROM ${tableName}${whereClause}`;
  }

  /**
   * Get table schema
   */
  private async getTableSchema(tableName: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_table_schema', { table_name: tableName });

      if (error) {
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
        return { tables: [] };
      }

      return { tables: data };
    } catch (error) {
      return { tables: [] };
    }
  }
}

export default SmartQueryService;
