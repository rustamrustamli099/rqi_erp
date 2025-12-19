// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventHandler<T = any> = (payload: T) => void;

interface Subscription {
    unsubscribe: () => void;
}

class EventBus {
    private listeners: Map<string, EventHandler[]> = new Map();

    /**
     * Subscribe to a domain event.
     * @param event The event name (e.g., 'finance:invoice_paid')
     * @param handler The callback function
     */
    subscribe<T>(event: string, handler: EventHandler<T>): Subscription {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(handler);

        return {
            unsubscribe: () => this.off(event, handler),
        };
    }

    /**
     * Publish a domain event.
     * @param event The event name
     * @param payload The event payload
     */
    publish<T>(event: string, payload: T) {
        if (!this.listeners.has(event)) return;
        this.listeners.get(event)?.forEach(callback => {
            try {
                callback(payload);
            } catch (_e) {
                console.error(`Error in event listener for ${event}:`, _e);
            }
        });
    }

    private off<T>(event: string, handler: EventHandler<T>) {
        if (!this.listeners.has(event)) return;
        const handlers = this.listeners.get(event)!;
        this.listeners.set(event, handlers.filter(h => h !== handler));
    }

    /**
     * For debugging: listed active listeners
     */
    debug() {
        // Debug removed for production

    }
}

export const eventBus = new EventBus();
