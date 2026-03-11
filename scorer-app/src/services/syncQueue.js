import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const QUEUE_KEY = '@criccast_sync_queue';

export const SyncQueue = {
  /**
   * Add a request to the offline queue.
   * @param {string} endpoint e.g., '/api/scoring/ball'
   * @param {object} payload JSON body
   */
  async enqueue(endpoint, payload) {
    try {
      const existing = await AsyncStorage.getItem(QUEUE_KEY);
      const queue = existing ? JSON.parse(existing) : [];
      queue.push({ endpoint, payload, timestamp: Date.now() });
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      console.log(`[SyncQueue] Added item to queue. Total: ${queue.length}`);
    } catch (e) {
      console.error('[SyncQueue] Error enqueueing:', e);
    }
  },

  /**
   * Attempt to flush the entire queue to the backend.
   * Relies on the backend's idempotency key to prevent double-charging duplicate entries from sudden drops.
   */
  async flush() {
    try {
      const existing = await AsyncStorage.getItem(QUEUE_KEY);
      if (!existing) return;

      const queue = JSON.parse(existing);
      if (queue.length === 0) return;

      console.log(`[SyncQueue] Flushing ${queue.length} items...`);
      
      const remainingQueue = [];
      let successCount = 0;

      // Process in chronological order
      for (const item of queue) {
        try {
          await api.post(item.endpoint, item.payload);
          successCount++;
        } catch (e) {
          // If network error, keep it in the queue for the next flush
          if (e.code === 'ECONNABORTED' || e.message === 'Network Error') {
            remainingQueue.push(item);
          } else if (e.response && e.response.status >= 500) {
             // Server error, try again later
             remainingQueue.push(item);
          } else {
             // 400s bad request - discard it so it doesn't block the queue permanently
             console.error('[SyncQueue] Discarding invalid request:', e.message);
          }
        }
      }

      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));
      console.log(`[SyncQueue] Flushed ${successCount}. ${remainingQueue.length} remaining.`);
      
      return successCount > 0;
    } catch (e) {
      console.error('[SyncQueue] Error flushing:', e);
      return false;
    }
  },

  /**
   * Clear all pending items.
   */
  async clear() {
    await AsyncStorage.removeItem(QUEUE_KEY);
  }
};
