const toWsBase = (baseUrl) => {
    if (!baseUrl) return '';
    if (baseUrl.startsWith('https://')) return `wss://${baseUrl.slice(8)}`;
    if (baseUrl.startsWith('http://')) return `ws://${baseUrl.slice(7)}`;
    if (baseUrl.startsWith('wss://') || baseUrl.startsWith('ws://')) return baseUrl;
    return baseUrl;
};

const parseSocketMessage = (raw) => {
    if (typeof raw !== 'string') return null;

    if (raw.startsWith('42')) {
        try {
            const parsed = JSON.parse(raw.slice(2));
            if (Array.isArray(parsed) && parsed.length > 0) {
                return { event: parsed[0], data: parsed[1] };
            }
        } catch {
            return null;
        }
    }

    if (raw.startsWith('0') || raw.startsWith('40') || raw === '2' || raw === '3') {
        return null;
    }

    try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && typeof parsed.event === 'string') {
            return { event: parsed.event, data: parsed.data };
        }
    } catch {
        return null;
    }

    return null;
};

export function createRoomRealtimeClient({ baseUrl, path = '/api/ws', token, userId }) {
    const wsBase = toWsBase(baseUrl);
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${wsBase}${normalizedPath}`);

    if (token) url.searchParams.set('token', token);
    if (userId !== undefined && userId !== null) url.searchParams.set('userId', String(userId));

    const socket = new WebSocket(url.toString());
    const listeners = new Map();
    const queue = [];
    let closed = false;

    const callListeners = (event, data) => {
        const handlers = listeners.get(event);
        if (!handlers) return;
        handlers.forEach((handler) => {
            try {
                handler(data);
            } catch (error) {
                console.error(`roomRealtimeClient listener error for ${event}:`, error);
            }
        });
    };

    const flushQueue = () => {
        while (queue.length > 0 && socket.readyState === WebSocket.OPEN) {
            const payload = queue.shift();
            socket.send(payload);
        }
    };

    socket.addEventListener('open', () => {
        flushQueue();
        callListeners('connect');
    });

    socket.addEventListener('message', (event) => {
        const parsed = parseSocketMessage(event.data);
        if (!parsed) return;
        callListeners(parsed.event, parsed.data);
    });

    socket.addEventListener('error', (event) => {
        callListeners('error', event);
    });

    socket.addEventListener('close', (event) => {
        closed = true;
        callListeners('disconnect', event);
    });

    return {
        on(event, handler) {
            if (!listeners.has(event)) listeners.set(event, new Set());
            listeners.get(event).add(handler);
        },
        off(event, handler) {
            if (!listeners.has(event)) return;
            if (!handler) {
                listeners.delete(event);
                return;
            }
            listeners.get(event).delete(handler);
            if (listeners.get(event).size === 0) listeners.delete(event);
        },
        emit(event, data) {
            const payload = JSON.stringify({ event, data });
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(payload);
                return;
            }
            if (!closed) queue.push(payload);
        },
        disconnect() {
            closed = true;
            socket.close();
        },
        get connected() {
            return socket.readyState === WebSocket.OPEN;
        }
    };
}
