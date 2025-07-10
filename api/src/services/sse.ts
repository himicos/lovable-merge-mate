import { Response } from 'express';

/**
 * Simple in-memory SSE manager keyed by userId.
 * In production you’d likely back this with Redis or Supabase Realtime.
 */
export class SseManager {
  private static clients: Map<string, Set<Response>> = new Map();

  static addClient(userId: string, res: Response) {
    const set = this.clients.get(userId) ?? new Set();
    set.add(res);
    this.clients.set(userId, set);
    // Remove on close
    reqOnClose(res, () => this.removeClient(userId, res));
  }

  static removeClient(userId: string, res: Response) {
    const set = this.clients.get(userId);
    if (!set) return;
    set.delete(res);
    if (set.size === 0) this.clients.delete(userId);
  }

  static push(userId: string, event: string, data: any) {
    const set = this.clients.get(userId);
    if (!set) return;
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of set) {
      res.write(payload);
    }
  }
}

function reqOnClose(res: Response, cb: () => void) {
  const close = () => {
    cb();
    res.removeListener('close', close);
    res.removeListener('finish', close);
  };
  res.on('close', close);
  res.on('finish', close);
}