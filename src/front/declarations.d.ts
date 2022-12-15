export {};

declare global {
  interface Window {
    ipcRenderer: {
      receive: (channel: string, callback: (...args: any[]) => void) => void;
      sendSync: <T>(channel: string, ...args: any[]) => T;
      send: (channel: string, ...args: any[]) => void;
    }
  }
}