import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../shared/enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private _HttpClient:HttpClient) { }

  login(loginData:object):Observable<any> {
    return this._HttpClient.post(`${enviroment.baseUrl}/api/user/login` , loginData)
  }
}
