import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('verby', {
  getUnreadCount: () => ipcRenderer.invoke('get-unread-count'),
  gmail: {
    listInbox: (userId: string) => ipcRenderer.invoke('gmail:listInbox', userId),
    getUnread: (userId: string) => ipcRenderer.invoke('gmail:getUnread', userId),
  },
  vision: {
    capture: () => ipcRenderer.invoke('vision:capture'),
    start: (fps?: number) => ipcRenderer.send('vision:start', fps ?? 1),
    stop: () => ipcRenderer.send('vision:stop'),
  },
  on: (channel: string, cb: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_e, ...args) => cb(...args));
  }
});

declare global {
  interface Window {
    verby: {
      getUnreadCount(): Promise<number>;
      gmail: {
        listInbox(userId: string): Promise<any[]>;
        getUnread(userId: string): Promise<number>;
      };
      vision: {
        capture(): Promise<any[]>;
        start(fps?: number): void;
        stop(): void;
      };
      on(channel: string, cb: (...args: any[]) => void): void;
    };
  }
}