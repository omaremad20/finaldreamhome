import { isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/Auth/auth.service';
import { NotficationsService } from '../../core/services/notfications/notfications.service';
import { ReviewsService } from '../../core/services/reviews/reviews.service';
declare var bootstrap: any;
@Component({
  selector: 'app-notfications',
  templateUrl: './notfications.component.html',
  styleUrl: './notfications.component.css',
  imports: [FormsModule, TranslatePipe, ReactiveFormsModule],
})
export class NotficationsComponent implements OnInit, OnDestroy {
  // services
  private _ToastrService = inject(ToastrService);
  private translate = inject(TranslateService);
  private _PLATFORM_ID = inject(PLATFORM_ID);
  private _NgxSpinnerService = inject(NgxSpinnerService);
  private _NotficationsService = inject(NotficationsService)
  private _AuthService = inject(AuthService);
  private _ReviewsService = inject(ReviewsService);
  private _Router = inject(Router);
  // variables
  NotficationsRes: any[] = [];
  // commentsOnPost ---> customer && employee(if one replay to his comment)
  commentsNotficationsRes: any[] = [];
  // acceptedReviews&& sendedReviews ---> employee
  reviewsNotficationsResEmployee: any[] = [];
  // needed reviews ---> customer
  reviewsNotficationResCustomer: any[] = []

  userId!: string;
  currentLang: string = 'en';
  reviewId: string = '';
  employeeRatedId!: string;
  review: string = '';
  userRole!: string;
  selectedNotificationId: string = '';
  rating!: number;
  isNotfaied!: boolean;
  isloading!: boolean;
  dataToSend: any;
  cancelgetUserNotifications!: Subscription;
  callingAllNotfications!: Subscription;
  cancelupdateAndSumbitReview!: Subscription;
  canceladdNotification!: Subscription;
  canceldeleteNotification!: Subscription;
  // reviewForm
  reviewForm: FormGroup = new FormGroup({
    comment: new FormControl(null, [Validators.required, Validators.maxLength(256), Validators.minLength(2)]),
    rating: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(5)])
  })
  // componentstart
  ngOnInit(): void {
    this._NgxSpinnerService.show();
    this.isloading = true;
    this.userId = this._AuthService.getUserId()!;
    this.userRole = this._AuthService.getRole()!;
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.currentLang = sessionStorage.getItem('language') || 'en';
      this.translate.setDefaultLang(this.currentLang);
      this.translate.use(this.currentLang);
    }

    this.cancelgetUserNotifications = this._NotficationsService.getUserNotifications(this.userId).subscribe({
      next: (res) => {
        console.log(res);
        this.isNotfaied = true;
        // customer side
        this._NgxSpinnerService.hide();
        // this.NotficationsRes = res.notifications;
        this.NotficationsRes = res.notifications.sort((a: any, b: any) => {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        for (let i = 0; i < this.NotficationsRes.length; i++) {
          this.NotficationsRes[i].message = JSON.parse(this.NotficationsRes[i].message)
          console.log(this.NotficationsRes[i].message);
          if (this.NotficationsRes[i].message.commentId) {
            this.commentsNotficationsRes.push(this.NotficationsRes[i])
          }
          // in furure message.commentId
          else if (this.NotficationsRes[i].message.customerName || this.NotficationsRes[i].message.reviewRate) {
            // sended review , accepted review
            this.reviewsNotficationsResEmployee.push(this.NotficationsRes[i]);

          } else if (this.NotficationsRes[i].message.employeeName) {
            // needed reviews --->customer
            this.reviewsNotficationResCustomer.push(this.NotficationsRes[i])
          }
        }
        // customerside
        this.isloading = false;
      },
      error: (err) => {
        this._NgxSpinnerService.hide();
        this.isNotfaied = false;
        this.isloading = false;
      }
    });
  }
  // sendreview
  submitReview(reviewId: any, notficationId: any, arr: any, index: any) {
    this._NgxSpinnerService.show();
    if (this.reviewForm.valid) {
      this.dataToSend = {
        reviewId: reviewId,
        review: this.reviewForm.get('comment')?.value,
        rating: this.reviewForm.get('rating')?.value
      }
      this.cancelupdateAndSumbitReview = this._ReviewsService.updateAndSumbitReview(this.dataToSend).subscribe({
        next: (res) => {
          this.deleteNotification(notficationId, arr, index);
          this._NgxSpinnerService.hide();
          this._ToastrService.success('Review Sumbitted Successfully !', '', {
            toastClass: 'toastarSuccess'
          })
          this.closeModal(notficationId);
          this.employeeRatedId = res.review.employee._id;
          const messageToemp = `{"reviewRate" : "${res.review.rating}" , "reviewContent" : "${res.review.review}" , "review" : "${res.review.customer.name}"}`;
          this.canceladdNotification = this._NotficationsService.addNotification(this.employeeRatedId, messageToemp).subscribe({
            next: (res) => {
              this._NgxSpinnerService.hide();
            },
            error: (err) => {
              this._NgxSpinnerService.hide();
            }
          })
        },
        error: (err) => {
          this._NgxSpinnerService.hide();
          this._ToastrService.success('Failed', '', {
            toastClass: 'toastarError'
          })
        }
      })
    } else {
      this._NgxSpinnerService.hide();
      this.reviewForm.markAllAsTouched();
    }
  }
  // deletenotfi
  deleteNotification(notificationId: string, arr: any, index: any): void {
    this._NgxSpinnerService.show();
    this.canceldeleteNotification = this._NotficationsService.deleteNotification(notificationId).subscribe({
      next: () => {
        arr.splice(index, 1)
        arr = arr;
        if (this.NotficationsRes.length === 0) {
          this.isNotfaied = false;
        }
        // customerSide
        if (this.reviewsNotficationResCustomer.length === 0 && this.commentsNotficationsRes.length === 0 && this.userRole === "customer") {
          this.isNotfaied = false
        } else if (this.reviewsNotficationsResEmployee.length === 0 && this.userRole === "employee") {
          this.isNotfaied = false;
        }
        this._NgxSpinnerService.hide();
      },
      error: (err) => {
        this._NgxSpinnerService.hide();
      }
    });
  }
  goToSinglePost(postId: string, commentTarget: string): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      if (sessionStorage.getItem('userId')) {
        sessionStorage.setItem('postId', postId);
        sessionStorage.setItem('commentTarget', commentTarget)
        this._Router.navigateByUrl('/comments')
      }
    }
  }
  goToEmployeeProfile(empId: string) {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      if (sessionStorage.getItem('userId')) {
        sessionStorage.setItem('_id', empId);
        this._Router.navigateByUrl('/employee-profile')
      }
    }
  }
  // openreviewmdoal

  // closemodal
  closeModal(modalId: string) {
    const modal = document.getElementById(modalId);
    if (modal) {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }
  // componentdestrioed
  ngOnDestroy(): void {
    this.cancelgetUserNotifications?.unsubscribe()
    this.callingAllNotfications?.unsubscribe();
    this.cancelupdateAndSumbitReview?.unsubscribe();
    this.canceladdNotification?.unsubscribe();
    this.canceldeleteNotification?.unsubscribe();
  }
}
