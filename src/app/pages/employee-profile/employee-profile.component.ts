import { Subscription } from 'rxjs';
import { ReviewsService } from './../../core/services/reviews/reviews.service';
import { UserProfileService } from './../../core/services/UserProfile/user-profile.service';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css'] ,
  imports : [RouterLink , TranslatePipe]
})
export class EmployeeProfileComponent implements OnInit , OnDestroy {
  currentLang: string = 'en';
  private translate = inject(TranslateService) ;
  private _PLATFORM_ID = inject (PLATFORM_ID) ;
  private _ActivatedRoute = inject(ActivatedRoute) ;
  profile!: any;
  reviews: any[] = [];
  role!: string;
  rate!: string;
  job!: string;
  images!: string | null;
  firstName!: string;
  email!: string;
  id!:string ;
  completedReviews: any[] = [];
  contactnumber!: string;
  isDone:boolean = false ;
  customerMakeTheReview:string [] = [] ;
  custName!:string ;
  userId!:string ;
  callinggetAllReviewsForUser:Subscription | null = null
  private route = inject(ActivatedRoute);
  private userService = inject(UserProfileService);
  private ReviewsService = inject(ReviewsService);
  ngOnInit() {
    this._ActivatedRoute.paramMap.subscribe({
      next : (res) => {
        // console.log(res.get('employeeId'));

        this.userId = res.get('employeeId') ! ;
      }
    })
    if(isPlatformBrowser(this._PLATFORM_ID)) {
      this.currentLang = sessionStorage.getItem('language') || 'en' ;
      this.translate.setDefaultLang(this.currentLang) ;
      this.translate.use(this.currentLang) ;
    }
    // const userId = this.route.snapshot.paramMap.get('id');
    if(isPlatformBrowser(this._PLATFORM_ID)) {
        this.userService.getUserProfile(this.userId).subscribe({
          next : (res) => {
            console.log(res);

            this.role = res.user.role ;
            this.id = res.user.id ;
            this.rate = `${res.user.rate}` ;
            this.images = res.user.images
            this.firstName = res.user.firstName
            this.email = res.user.email ;
            this.contactnumber = res.user.contactNumber ;
            this.job = res.user.job !;
            if(this.rate !== 'null') {
              this.callinggetAllReviewsForUser = this.ReviewsService.getAllReviewsForUser(this.userId).subscribe({
                next : (res) => {
                  this.completedReviews = res.filter((review: any) => review.status === 'Completed');
                  for(let i =0 ; i < this.completedReviews.length ; i++) {
                    this.customerMakeTheReview.push(this.completedReviews[i].customerId) ;
                    for(let i = 0 ; i < this.customerMakeTheReview.length ; i++) {
                      this.customerMakeTheReview[i] ;
                      this.userService.getUserProfile(this.customerMakeTheReview[i]).subscribe({
                        next : (res) => {
                          this.custName = res.user.firstName ;
                        }
                      })
                    }
                  }
                  this.isDone = true ;
                }
              }) ?? null ;
            }else {
              this.rate = '0' ;
            }
          }
        })
      }

  }
  activeSection: string = 'details';
  showSection(section: string) {
    this.activeSection = section;
  }
  ngOnDestroy(): void {
    if(this.callinggetAllReviewsForUser) {
      this.callinggetAllReviewsForUser.unsubscribe() ;
      this.callinggetAllReviewsForUser = null ;
    }
  }
}
