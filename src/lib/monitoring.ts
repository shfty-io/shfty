/**
 * Simple monitoring utility for tracking performance and errors
 * In a production environment, this would be replaced with a proper monitoring service
 * like Sentry, New Relic, or Datadog
 */

// Performance metrics
interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

// Error tracking
interface ErrorEvent {
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp: number;
}

// In-memory storage for metrics and errors (for development only)
// In production, these would be sent to a monitoring service
const metrics: PerformanceMetric[] = [];
const errors: ErrorEvent[] = [];

/**
 * Start tracking a performance metric
 * @param name The name of the metric
 * @param metadata Additional metadata
 * @returns A function to stop tracking the metric
 */
export function trackPerformance(name: string, metadata?: Record<string, unknown>) {
  const startTime = performance.now();
  const metric: PerformanceMetric = {
    name,
    startTime,
    metadata,
  };
  
  metrics.push(metric);
  
  return {
    stop: () => {
      const endTime = performance.now();
      metric.endTime = endTime;
      metric.duration = endTime - startTime;
      
      // In production, this would send the metric to a monitoring service
      console.log(`[Performance] ${name}: ${metric.duration.toFixed(2)}ms`, metadata);
      
      return metric.duration;
    }
  };
}

/**
 * Track an error
 * @param error The error to track
 * @param context Additional context
 */
export function trackError(error: Error | string, context?: Record<string, unknown>) {
  const errorEvent: ErrorEvent = {
    message: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'string' ? undefined : error.stack,
    context,
    timestamp: Date.now(),
  };
  
  errors.push(errorEvent);
  
  // In production, this would send the error to a monitoring service
  console.error('[Error]', errorEvent.message, context);
}

/**
 * Wrap a function with performance tracking
 * @param fn The function to wrap
 * @param name The name of the metric
 * @returns The wrapped function
 */
export function withPerformanceTracking<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  name: string
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs) => {
    const tracker = trackPerformance(name, { args: args.map(arg => typeof arg) });
    
    try {
      const result = await fn(...args);
      tracker.stop();
      return result;
    } catch (error) {
      const duration = tracker.stop();
      trackError(error as Error, { name, duration, args: args.map(arg => typeof arg) });
      throw error;
    }
  };
}

/**
 * Get all tracked metrics (for development only)
 * @returns All tracked metrics
 */
export function getMetrics() {
  return [...metrics];
}

/**
 * Get all tracked errors (for development only)
 * @returns All tracked errors
 */
export function getErrors() {
  return [...errors];
}

/**
 * Clear all tracked metrics and errors (for development only)
 */
export function clearTracking() {
  metrics.length = 0;
  errors.length = 0;
} 