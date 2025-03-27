/**
 * Server-Sent Events (SSE) utility
 * Provides functionality for creating and managing SSE connections
 */

import { Request, Response } from 'express';
import { EventEmitter } from 'events';

/**
 * SSE connection options
 */
interface SSEOptions {
  /** The retry timeout in milliseconds */
  retry?: number;
  /** Initial data to send */
  initialData?: any;
  /** Headers to include in the response */
  headers?: Record<string, string>;
}

/**
 * Create an SSE connection
 * @param {Request} req The Express request
 * @param {Response} res The Express response
 * @param {SSEOptions} options The SSE options
 * @returns {Response} The Express response
 */
export function createSSEConnection(req: Request, res: Response, options: SSEOptions = {}): Response {
  const { retry = 10000, initialData, headers = {} } = options;
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    ...headers
  });
  
  // Write the retry interval
  res.write(`retry: ${retry}\n\n`);
  
  // Send initial data if provided
  if (initialData) {
    sendSSEEvent(res, 'data', initialData);
  }
  
  // Handle client disconnect
  req.on('close', () => {
    res.end();
  });
  
  return res;
}

/**
 * Send an SSE event
 * @param {Response} res The Express response
 * @param {string} event The event name
 * @param {any} data The event data
 */
export function sendSSEEvent(res: Response, event: string, data: any): void {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/**
 * Create an SSE stream
 * @param {EventEmitter} emitter The event emitter
 * @param {Request} req The Express request
 * @param {Response} res The Express response
 * @param {SSEOptions} options The SSE options
 */
export function createSSEStream(emitter: EventEmitter, req: Request, res: Response, options: SSEOptions = {}): void {
  // Create the SSE connection
  createSSEConnection(req, res, options);
  
  // Handle events
  const eventHandler = (data: any) => {
    sendSSEEvent(res, 'data', data);
  };
  
  const errorHandler = (error: any) => {
    sendSSEEvent(res, 'error', { message: error.message });
  };
  
  const closeHandler = () => {
    res.end();
  };
  
  // Register event handlers
  emitter.on('data', eventHandler);
  emitter.on('error', errorHandler);
  emitter.on('close', closeHandler);
  
  // Clean up when the client disconnects
  req.on('close', () => {
    emitter.off('data', eventHandler);
    emitter.off('error', errorHandler);
    emitter.off('close', closeHandler);
    res.end();
  });
}