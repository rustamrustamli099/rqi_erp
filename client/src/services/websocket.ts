import { eventBus } from "@/shared/kernel/eventBus";

type WSStatus = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED';

class WebSocketService {
    private socket: WebSocket | null = null;
    private url: string | null = null;
    private reconnectInterval = 5000;
    private maxReconnectAttempts = 10;
    private attempts = 0;
    private messageQueue: string[] = [];
    status: WSStatus = 'CLOSED';

    connect(url: string) {
        this.url = url;
        this.status = 'CONNECTING';

        try {
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                // console.log('[WebSocket] Connected');
                this.status = 'OPEN';
                this.attempts = 0;
                this.flushQueue();
                eventBus.publish('ws:connected', null);
            };

            this.socket.onclose = () => {
                // console.warn('[WebSocket] Disconnected');
                this.status = 'CLOSED';
                eventBus.publish('ws:disconnected', null);
                this.scheduleReconnect();
            };

            this.socket.onerror = (_err) => {
                // console.error('[WebSocket] Error', err);
                this.status = 'CLOSED';
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // Expecting format: { type: string, payload: any }
                    if (data.type && data.payload) {
                        // Pass through Hardened Adapter
                        import("@/shared/kernel/realtimeAdapter").then(({ realtimeAdapter }) => {
                            realtimeAdapter.processMessage(data);
                        });
                    }
                } catch (_e) {
                    // console.error('[WebSocket] Failed to parse message', event.data);
                }
            };

        } catch (_e) {
            // console.error('[WebSocket] Connection failed', e);
            this.scheduleReconnect();
        }
    }

    send(type: string, payload: any) {
        const message = JSON.stringify({ type, payload });
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            this.messageQueue.push(message);
        }
    }

    private flushQueue() {
        while (this.messageQueue.length > 0 && this.socket?.readyState === WebSocket.OPEN) {
            const msg = this.messageQueue.shift();
            if (msg) this.socket.send(msg);
        }
    }

    private scheduleReconnect() {
        if (this.attempts < this.maxReconnectAttempts) {
            setTimeout(() => {
                // console.log(`[WebSocket] Reconnecting change... (${this.attempts + 1}/${this.maxReconnectAttempts})`);
                this.attempts++;
                if (this.url) this.connect(this.url);
            }, this.reconnectInterval);
        } else {
            // console.error('[WebSocket] Max reconnect attempts reached');
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

export const socketService = new WebSocketService();
