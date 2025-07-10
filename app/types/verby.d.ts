export {};

declare global {
  interface Window {
    verby: {
      gmail: {
        listInbox(userId: string): Promise<any[]>;
        getUnread(userId: string): Promise<number>;
      };
      getUnreadCount(): Promise<number>;
    };
  }
}