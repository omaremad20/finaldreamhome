import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../../shared/enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  constructor(private http: HttpClient) { }

  getUserProfile(userId: string): Observable<any> {
    return this.http.get(`${enviroment.baseUrl}/api/user/profile/${userId}`);
  }
  updateUserProfile(userId: string, userData: any): Observable<any> {
    return this.http.post(`${enviroment.baseUrl}/api/user/update/${userId}`, userData)
  }
}
