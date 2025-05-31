import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviroment } from '../../../shared/enviroment/enviroment';

@Injectable({
  providedIn: 'root'
})
export class EmployessService {

  constructor(private _HttpClient:HttpClient) { }
  getEmployess(job:string):Observable<any> {
    return this._HttpClient.get(`${enviroment.baseUrl}/api/user/getEmployees?service=${job}`)
  }
}
