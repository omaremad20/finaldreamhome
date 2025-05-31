import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../../shared/enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class RegisteritionService {

  constructor(private _HttpClient:HttpClient) { }
  signUp(registeritionData:object):Observable<any> {
    return this._HttpClient.post(`${enviroment.baseUrl}/api/user/signup` , registeritionData , {headers : {'Content-Type': 'application/json'}}) ;
  }
}
