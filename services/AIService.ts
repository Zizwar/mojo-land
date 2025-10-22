import type {
  AIProvider,
  OpenRouterMessage,
  OpenRouterRequest,
  OpenRouterResponse
} from '../types/index.ts';

/**
 * AIService - Service for AI operations using OpenRouter
 * Supports multiple AI models through OpenRouter API
 */
export class AIService {
  private apiKey: string;
  private baseURL: string;
  private defaultModel: string;

  constructor(config: AIProvider) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://openrouter.ai/api/v1';
    this.defaultModel = config.defaultModel || 'openai/gpt-3.5-turbo';
  }

  /**
   * Send chat completion request to OpenRouter
   */
  async chat(
    messages: OpenRouterMessage[],
    options?: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
    }
  ): Promise<string> {
    const model = options?.model || this.defaultModel;

    const request: OpenRouterRequest = {
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 2000,
      top_p: options?.top_p ?? 1,
    };

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/mojo-land',
          'X-Title': 'Mojo Land Framework',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error: ${error}`);
      }

      const data: OpenRouterResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI Service error:', error);
      throw error;
    }
  }

  /**
   * Generate structured data from prompt
   */
  async generateJSON(
    prompt: string,
    schema?: any,
    model?: string
  ): Promise<any> {
    const systemPrompt = schema
      ? `You are a JSON generator. Always respond with valid JSON that matches this schema: ${JSON.stringify(schema)}`
      : 'You are a JSON generator. Always respond with valid JSON only, no explanations.';

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ];

    const response = await this.chat(messages, {
      model,
      temperature: 0.3  // Lower temperature for more consistent JSON
    });

    try {
      return JSON.parse(response);
    } catch (error) {
      // Try to extract JSON from response if it contains other text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Failed to parse JSON from AI response');
    }
  }

  /**
   * Generate SQL query from natural language
   */
  async generateSQL(
    prompt: string,
    tableSchema?: any,
    model?: string
  ): Promise<string> {
    const systemPrompt = `You are a SQL expert. Generate PostgreSQL queries based on user requests.
${tableSchema ? `\nDatabase schema:\n${JSON.stringify(tableSchema, null, 2)}` : ''}
Always respond with only the SQL query, no explanations.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ];

    const response = await this.chat(messages, {
      model,
      temperature: 0.2  // Lower temperature for precise SQL
    });

    // Clean up the response to extract only SQL
    return response
      .replace(/```sql/g, '')
      .replace(/```/g, '')
      .trim();
  }

  /**
   * Analyze and extract intent from user query
   */
  async extractIntent(
    query: string,
    possibleIntents: string[],
    model?: string
  ): Promise<{
    intent: string;
    confidence: number;
    parameters?: Record<string, any>;
  }> {
    const prompt = `Analyze this user query and determine the intent from these options: ${possibleIntents.join(', ')}
Query: "${query}"

Respond with JSON only:
{
  "intent": "the_matched_intent",
  "confidence": 0.95,
  "parameters": {}
}`;

    const result = await this.generateJSON(prompt, {
      intent: 'string',
      confidence: 'number',
      parameters: 'object'
    }, model);

    return result;
  }

  /**
   * Generate endpoint configuration from natural language description
   */
  async generateEndpointConfig(
    description: string,
    existingSchema?: any,
    model?: string
  ): Promise<any> {
    const systemPrompt = `You are an API endpoint configuration expert. Generate Mojo Land endpoint configurations based on descriptions.

${existingSchema ? `Existing database schema:\n${JSON.stringify(existingSchema, null, 2)}\n` : ''}

Generate a complete endpoint configuration with these fields:
- endpoint: URL path
- method: HTTP method or comma-separated methods
- table: Database table name
- columns: Comma-separated column names or "all"
- select: Columns to return
- permissions: Object with method permissions (e.g., {"get": "public", "create": "admin,user"})
- filters: Optional filter configuration
- log: boolean for logging
- status: "active" or "inactive"

Respond with JSON only.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: description },
    ];

    return await this.generateJSON(
      messages[1].content,
      {
        endpoint: 'string',
        method: 'string',
        table: 'string',
        columns: 'string',
        select: 'string',
        permissions: 'object',
        status: 'string'
      },
      model
    );
  }

  /**
   * Transform user query into database filters
   */
  async queryToFilters(
    query: string,
    tableSchema: any,
    model?: string
  ): Promise<any> {
    const prompt = `Convert this natural language query into Supabase filters:
Query: "${query}"
Table schema: ${JSON.stringify(tableSchema)}

Generate filters in this format:
{
  "filters": {
    "eq": [["column", "value"]],
    "gt": [["column", value]],
    "like": [["column", "pattern"]]
  }
}

Supported filter types: eq, gt, lt, gte, lte, like, ilike, is, in, neq
Respond with JSON only.`;

    return await this.generateJSON(prompt, {
      filters: 'object'
    }, model);
  }

  /**
   * Check available models (useful for debugging)
   */
  async listModels(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Failed to list models:', error);
      return [];
    }
  }
}

export default AIService;
