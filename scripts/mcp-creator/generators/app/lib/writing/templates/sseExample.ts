/**
 * SSE Example
 * Demonstrates how to use Server-Sent Events (SSE) with MCP
 */

import { z } from 'zod';
import { EventEmitter } from 'events';
import { createSSEStream, sendSSEEvent } from '../utils/sse.js';

// Store SSE streams
const streams = new Map<string, EventEmitter>();

/**
 * SSE example schema
 */
const sseExampleSchema = z.object({
  action: z.enum(['create', 'send', 'close']),
  streamId: z.string().optional(),
  data: z.any().optional(),
  interval: z.number().optional()
});

/**
 * SSE example handler
 */
export const sseExampleHandler = {
  name: 'sse_example',
  description: 'Example handler for Server-Sent Events (SSE)',
  inputSchema: sseExampleSchema,
  handler: async (request) => {
    const { action, streamId, data, interval = 1000 } = request.data;
    
    switch (action) {
      case 'create':
        // Generate a new stream ID
        const newStreamId = Math.random().toString(36).substring(2, 15);
        
        // Create a new event emitter
        const emitter = new EventEmitter();
        
        // Store the emitter
        streams.set(newStreamId, emitter);
        
        // Start sending data at the specified interval
        let count = 0;
        const intervalId = setInterval(() => {
          emitter.emit('data', {
            count: count++,
            timestamp: new Date().toISOString()
          });
        }, interval);
        
        // Store the interval ID
        (emitter as any).intervalId = intervalId;
        
        return {
          action,
          streamId: newStreamId,
          status: 'created',
          url: `/sse/${newStreamId}`
        };
      
      case 'send':
        // Check if the stream ID is provided
        if (!streamId) {
          throw new Error('Stream ID is required');
        }
        
        // Check if the data is provided
        if (data === undefined) {
          throw new Error('Data is required');
        }
        
        // Check if the stream exists
        if (!streams.has(streamId)) {
          throw new Error(`Stream "${streamId}" not found`);
        }
        
        // Emit the data event
        streams.get(streamId)!.emit('data', data);
        
        return {
          action,
          streamId,
          status: 'sent'
        };
      
      case 'close':
        // Check if the stream ID is provided
        if (!streamId) {
          throw new Error('Stream ID is required');
        }
        
        // Check if the stream exists
        if (!streams.has(streamId)) {
          throw new Error(`Stream "${streamId}" not found`);
        }
        
        // Clear the interval
        clearInterval((streams.get(streamId) as any).intervalId);
        
        // Emit the close event
        streams.get(streamId)!.emit('close');
        
        // Remove the stream
        streams.delete(streamId);
        
        return {
          action,
          streamId,
          status: 'closed'
        };
    }
  }
};

/**
 * Get the SSE stream for a given stream ID
 * @param {string} streamId The stream ID
 * @returns {EventEmitter | null} The event emitter for the stream
 */
export function getSSEStream(streamId: string): EventEmitter | null {
  return streams.get(streamId) || null;
}