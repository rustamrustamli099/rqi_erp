import { eventBus } from "@/shared/kernel/eventBus";

/**
 * Realtime Adapter (Hardened)
 * 
 * Responsibilities:
 * 1. Process raw WebSocket messages.
 * 2. Deduplicate.
 * 3. Publish to Domain Bus.
 */

const PROCESSED_MESSAGE_IDS = new Set<string>();
const MAX_HISTORY = 1000;

interface RealtimeMessage {
  id?: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
  sequence?: number;
}

export const realtimeAdapter = {
  /**
   * Entry point for WebSocketService
   */
  processMessage: (message: RealtimeMessage) => {
    // 1. Deduplication
    if (message.id && PROCESSED_MESSAGE_IDS.has(message.id)) {
      console.warn(`[RealtimeAdapter] Duplicate message detected: ${message.id}. Ignoring.`);
      return;
    }

    // 2. Track ID
    if (message.id) {
      PROCESSED_MESSAGE_IDS.add(message.id);
      if (PROCESSED_MESSAGE_IDS.size > MAX_HISTORY) {
        const it = PROCESSED_MESSAGE_IDS.values();
        const oldestId = it.next().value;
        if (oldestId) {
          PROCESSED_MESSAGE_IDS.delete(oldestId);
        }
      }
    }

    // 3. Forward to Bus
    // We assume message.type matches the EventBus contract (e.g. 'finance:invoice:paid')
    // If not, we map it here.
    if (message.type) {
      // console.debug(`[RealtimeAdapter] Forwarding: ${message.type}`);
      eventBus.publish(message.type, message.payload);
    }
  },

  reset: () => {
    PROCESSED_MESSAGE_IDS.clear();
  }
};
