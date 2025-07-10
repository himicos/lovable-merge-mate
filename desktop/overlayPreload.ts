import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('overlay', {
  onBoxesUpdate: (callback: (boxes: any[]) => void) => {
    ipcRenderer.on('overlay-boxes', (_event, boxes: any[]) => callback(boxes));
  },
});

declare global {
  interface Window {
    overlay: {
      onBoxesUpdate(cb: (boxes: any[]) => void): void;
    };
  }
}