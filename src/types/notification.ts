export interface CollectorMatchProfile {
  uid: string;
  name: string;
  city: string;
  serviceCity?: string;
  serviceAreas: string[];
  isAvailable: boolean;
  updatedAt?: unknown;
}

export interface CollectorNotification {
  notificationId: string;
  recipientId: string;
  requestId: string;
  userId: string;
  title: string;
  message: string;
  city: string;
  area: string;
  read: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}
