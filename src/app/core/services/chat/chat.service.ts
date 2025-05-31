import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../../../shared/enviroment/enviroment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private http:HttpClient) { }
  sendMessage(formMessage:object): Observable<any> {
    return this.http.post(`${enviroment.baseUrl}/api/chat/create`, formMessage);
  }
  getChat(senderId: string, receiverId: string): Observable<any> {
    return this.http.post(`${enviroment.baseUrl}/api/chat/get-chat`, { senderId, receiverId });
  }
  getAllChats(userId:string): Observable<any> {
    return this.http.get(`${enviroment.baseUrl}/api/chat/all-chats/${userId}`) ;
  }
}

