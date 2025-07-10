import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('verby', {
  getUnreadCount: () => ipcRenderer.invoke('get-unread-count'),
  gmail: {
    listInbox: (userId: string) => ipcRenderer.invoke('gmail:listInbox', userId),
    getUnread: (userId: string) => ipcRenderer.invoke('gmail:getUnread', userId),
  },
});

declare global {
  interface Window {
    verby: {
      getUnreadCount(): Promise<number>;
      gmail: {
        listInbox(userId: string): Promise<any[]>;
        getUnread(userId: string): Promise<number>;
      };
    };
  }
}