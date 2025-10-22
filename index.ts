/**
 * Mojo Land - AI-Powered Dynamic API Framework
 *
 * A flexible, framework-agnostic API builder with AI capabilities
 * Works with Hono, Express, Next.js, Koa, and more
 *
 * @version 2.0.0
 * @author Brahim BIDI
 */

// Core exports
export { MojoCore } from './core/MojoCore.ts';

// Services exports
export { AIService } from './services/AIService.ts';
export { EndpointGenerator } from './services/EndpointGenerator.ts';
export { SmartQueryService } from './services/SmartQueryService.ts';

// Adapters exports
export {
  HonoAdapter,
  ExpressAdapter,
  NextJSAdapter,
  KoaAdapter
} from './adapters/index.ts';

// Types exports
export type {
  MojoConfig,
  MojoContext,
  MojoRequest,
  MojoResponse,
  User,
  UserRole,
  EndpointConfig,
  MethodConfig,
  AIProvider,
  AIEndpointConfig,
  AIGenerateEndpointRequest,
  AIGenerateEndpointResponse,
  AIQueryRequest,
  AIQueryResponse,
  LogEntry,
  FilterConfig,
  FrameworkAdapter,
  SupportedFramework,
  OpenRouterMessage,
  OpenRouterRequest,
  OpenRouterResponse
} from './types/index.ts';

// Default export for backward compatibility
import { MojoCore } from './core/MojoCore.ts';
export default MojoCore;
