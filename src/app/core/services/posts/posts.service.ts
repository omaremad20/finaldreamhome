import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { enviroment } from '../../../shared/enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private _HttpClient = inject(HttpClient);
  posts: BehaviorSubject<any> = new BehaviorSubject([])
  sendImageToCloudinary(cloudUrl: string, file: object): Observable<any> {
    return this._HttpClient.post(cloudUrl, file)
  }
  // posts
  Createanewpost(postForm: object): Observable<any> {
    return this._HttpClient.post(`${enviroment.baseUrl}/api/posts/`, postForm);
  }
  GetsinglepostbyID(postId: string): Observable<any> {
    return this._HttpClient.get(`${enviroment.baseUrl}/api/posts/${postId}`);
  }
  Updatepost(postId: string, updatedForm: object): Observable<any> {
    return this._HttpClient.put(`${enviroment.baseUrl}/api/posts/${postId}`, updatedForm);
  }
  Deletepostanditscomments(postId: string): Observable<any> {
    return this._HttpClient.delete(`${enviroment.baseUrl}/api/posts/${postId}`);
  }
  Getpostsbyjobtype(jobTitle: any): Observable<any> {
    return this._HttpClient.get(`${enviroment.baseUrl}/api/posts/job/${jobTitle}`);
  }
  GetpostsbyjobtypeLimted(jobTitle: any , limit:any): Observable<any> {
    return this._HttpClient.get(`${enviroment.baseUrl}/api/posts/job/${jobTitle}?limit=${limit}`);
  }
  Getallpostswithfiltering(): Observable<any> {
    return this._HttpClient.get(`${enviroment.baseUrl}/api/posts`);
  }
  GetallpostswithfilteringLimited(limit:any): Observable<any> {
    return this._HttpClient.get(`${enviroment.baseUrl}/api/posts?limit=${limit}`);
  }

  // withOutLimit
  Getcommentsforajobcategory(jobTitle: string): Observable<any> {
    return this._HttpClient.get(`${enviroment.baseUrl}/api/comments/job/${jobTitle}`)
  }
  // withLimit
  Getcommentsforajobcategorylimted(jobTitle: string , limit:any): Observable<any> {
    return this._HttpClient.get(`${enviroment.baseUrl}/api/comments/job/${jobTitle}?limit=${limit}`)
  }
  // comments
  Createanewcomment(commentForm: object): Observable<any> {
    return this._HttpClient.post(`${enviroment.baseUrl}/api/comments/`, commentForm);
  }
  Getcommentsforapost(postId: string): Observable<any> {
    return this._HttpClient.get(`${enviroment.baseUrl}/api/comments/post/${postId}`);
  }
  Updatecomment(commentId: string, commentForm: object): Observable<any> {
    return this._HttpClient.put(`${enviroment.baseUrl}/api/comments/${commentId}`, commentForm);
  }
  Deletecomment(commentId: string): Observable<any> {
    return this._HttpClient.delete(`${enviroment.baseUrl}/api/comments/${commentId}`);
  }
}
