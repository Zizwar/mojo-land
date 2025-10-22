// Types for Mojo Land Framework

export interface MojoConfig {
  tableName?: string;
  tokenName?: string;
  paramName?: string;
  supabase?: any;
  cookies?: any;
  aiProvider?: AIProvider;
}

export interface AIProvider {
  apiKey: string;
  baseURL?: string;
  defaultModel?: string;
}

export interface MojoRequest {
  method: string;
  query: (key?: string) => any;
  body: any;
  params: any;
  headers: any;
}

export interface MojoResponse {
  json: (data: any, status?: number) => any;
  text: (text: string, status?: number) => any;
  status: (code: number) => any;
}

export interface MojoContext {
  request: MojoRequest;
  response: MojoResponse;
  user?: User;
  params: any;
}

export interface User {
  id: number;
  uuid: string;
  username: string;
  email?: string;
  is_active: boolean;
  roles?: UserRole[];
}

export interface UserRole {
  role: {
    id: number;
    name: string;
  };
}

export interface EndpointConfig {
  id?: number;
  endpoint: string;
  method: string;
  methods?: Record<string, MethodConfig>;
  table?: string;
  columns?: string;
  select?: string;
  selects?: string;
  permissions?: Record<string, string>;
  filters?: any;
  role?: string;
  status: string;
  log?: boolean;
  single?: boolean;
  function?: string;
  checker?: boolean;
  data?: any;
  text?: string;
  sql?: string;
  rpc?: string;
  csv?: boolean;
  ai_enabled?: boolean;
  ai_config?: AIEndpointConfig;
}

export interface MethodConfig {
  permissions?: string;
  filters?: any;
}

export interface AIEndpointConfig {
  enabled: boolean;
  model?: string;
  prompt_template?: string;
  max_tokens?: number;
  temperature?: number;
  context_fields?: string[];
}

export interface LogEntry {
  status: string;
  module: string;
  action: string;
  error?: any;
  log?: string;
}

export interface FilterConfig {
  [key: string]: string[];
}

export interface AIGenerateEndpointRequest {
  prompt: string;
  table?: string;
  permissions?: string[];
  model?: string;
}

export interface AIGenerateEndpointResponse {
  success: boolean;
  endpoint?: EndpointConfig;
  error?: string;
}

export interface AIQueryRequest {
  endpoint: string;
  query: string;
  context?: any;
  model?: string;
}

export interface AIQueryResponse {
  success: boolean;
  data?: any;
  sql?: string;
  error?: string;
}

// Adapter interfaces for different frameworks
export interface FrameworkAdapter {
  extractRequest(ctx: any): MojoRequest;
  createResponse(data: any, status: number): any;
  getParams(ctx: any): any;
}

export type SupportedFramework = 'hono' | 'express' | 'nextjs' | 'koa' | 'fastify';

// OpenRouter specific types
export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
