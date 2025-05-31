import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class NotficationsService {
  private baseUrl = 'https://grad-project-seven.vercel.app/api/notification';
  constructor(private http: HttpClient) {}
  addNotification(userId: string, message: string): Observable<any> {
    const body = { userId, message };
    return this.http.post(`${this.baseUrl}/add`, body);
  }
  getNotification(notificationId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${notificationId}`);
  }
  getUserNotifications(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${userId}`);
  }
  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${notificationId}`);
  }
}
