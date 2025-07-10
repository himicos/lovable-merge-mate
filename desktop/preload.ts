import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('verby', {
  getUnreadCount: () => ipcRenderer.invoke('get-unread-count'),
});

declare global {
  interface Window {
    verby: {
      getUnreadCount(): Promise<number>;
    };
  }
}