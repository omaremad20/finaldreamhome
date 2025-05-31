import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private baseUrl = 'https://grad-project-seven.vercel.app/api/review';
  constructor(private _HttpClient: HttpClient) { }
  getAllReviewsForUser(userId: string): Observable<any> {
    return this._HttpClient.get(`${this.baseUrl}/${userId}`)
      .pipe(catchError(this.handleError));
  }
  sendRequestReview(employeeId: string, customerId: string): Observable<any> {
    return this._HttpClient.post(`${this.baseUrl}/request`, { employeeId, customerId })
      .pipe(catchError(this.handleError));
  }
  updateAndSumbitReview(reviewForm:object): Observable<any> {
    return this._HttpClient.put(`${this.baseUrl}/update-review`, reviewForm)
      .pipe(catchError(this.handleError));
  }
  cancelReview(reviewId: string): Observable<any> {
    return this._HttpClient.post(`${this.baseUrl}/cancel-review`, { reviewId })
      .pipe(catchError(this.handleError));
  }
  private handleError(error: any) {
    console.error('Error:', error);
    return throwError(() => new Error('Something went wrong!'));
  }
}
