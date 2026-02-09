import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  date: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  addNotification(type: Notification['type'], message: string) {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      date: new Date(),
      read: false
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...currentNotifications]);

    // Auto-supprimer après 5 secondes
    setTimeout(() => this.removeNotification(notification.id), 5000);
  }

  removeNotification(id: string) {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== id);
    this.notificationsSubject.next(notifications);
  }

  markAsRead(id: string) {
    const notifications = this.notificationsSubject.value.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(notifications);
  }

  getUnreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read).length;
  }
}