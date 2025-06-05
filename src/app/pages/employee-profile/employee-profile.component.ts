import { Subscription } from 'rxjs';
import { ReviewsService } from './../../core/services/reviews/reviews.service';
import { UserProfileService } from './../../core/services/UserProfile/user-profile.service';
import { AfterViewInit, Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../core/services/Auth/auth.service';
import { ChatService } from '../../core/services/chat/chat.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { PostsService } from '../../core/services/posts/posts.service';
@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css'],
  imports: [RouterLink, TranslatePipe]
})
export class EmployeeProfileComponent implements OnInit, OnDestroy , AfterViewInit{
  currentLang: string = 'en';
  private translate = inject(TranslateService);
  private _PLATFORM_ID = inject(PLATFORM_ID);
  private _ActivatedRoute = inject(ActivatedRoute);
  private _AuthService = inject(AuthService);
  private _ChatService = inject(ChatService);
  private _NgxSpinnerService = inject(NgxSpinnerService);
  private userService = inject(UserProfileService);
  private isErrorToastShown = false;
  private _ToastrService = inject(ToastrService);
  private ReviewsService = inject(ReviewsService);
  private _PostsService = inject(PostsService) ;
  profile!: any;
  reviews: any[] = [];
  rate!: number;
  completedReviews: any[] = [];
  isDone: boolean = false;
  customerMakeTheReview: string[] = [];
  custName!: string;
  employeeId!: string; //employee id
  customerId!: string;
  userRole!: string;
  isNoChats!: boolean;
  messageToGo!: string;
  cancelgetAllReviewsForUser!: Subscription;
  cancelgetChat!: Subscription;
  cancelgetUserProfile!: Subscription;
  cancelgetUserProfileTwo!: Subscription;
  cancelsetTimeOutOne!: any;
  cancelsetTimeOutTwo!: any;
  cancelsetTimeOutThree!: any;
  postsEmployee: any[] = [];
  employeeData: any;
  isLoading:boolean = true ;
  isReviewd!:boolean;
  isLoadData!:boolean;
  ngOnInit() {
    this.isLoadData = true;
    this._NgxSpinnerService.show();
    this.userRole = this._AuthService.getRole()!;
    this.customerId = this._AuthService.getUserId()!;
    this._ActivatedRoute.paramMap.subscribe({
      next: (res) => {
        this.employeeId = res.get('employeeId')!;
        this.sendMessageBehave();
      }, error: (err) => {
        this._NgxSpinnerService.hide();
      }
    })
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.currentLang = sessionStorage.getItem('language') || 'en';
      this.translate.setDefaultLang(this.currentLang);
      this.translate.use(this.currentLang);
    }
    this.cancelgetUserProfile = this.userService.getUserProfile(this.employeeId).subscribe({
      next: (res) => {
        this.employeeData = res.user
        this.isLoading = false ;
        this.isLoadData = false
        this._NgxSpinnerService.hide();
      },
      error: (err) => {
        if (err.error.message === "Failed to fetch") {
          if (!this.isErrorToastShown) {
            this._ToastrService.success('No Internet Connection !', '', {
              toastClass: 'toastarError',
              timeOut: 10000
            });
            this.isErrorToastShown = true;
            this.cancelsetTimeOutTwo = setTimeout(() => {
              this.isErrorToastShown = false;
            }, 10000);
          }
        }
        this._NgxSpinnerService.hide();
      }
    })
  }

  sendMessageBehave(): void {
    this._NgxSpinnerService.show();
    this.cancelgetChat = this._ChatService.getChat(this.employeeId, this.customerId).subscribe({
      next: (res) => {
        this.isNoChats = false;
        this.messageToGo = res.messages[res.messages.length - 1]._id;
        this._NgxSpinnerService.hide();
      },
      error: (err) => {
        if (err.error.message !== "Failed to fetch") {
          this.isNoChats = true
        } else if (err.error.message === "Failed to fetch ") {
          if (!this.isErrorToastShown) {
            this._ToastrService.success('No Internet Connection !', '', {
              toastClass: 'toastarError',
              timeOut: 10000
            });
            this.isErrorToastShown = true;
            this.cancelsetTimeOutThree = setTimeout(() => {
              this.isErrorToastShown = false;
            }, 10000);
          }
        }
        this._NgxSpinnerService.hide();
      }
    })
  }
  selectedFile: File | null = null;

  onFileSelectedTwo(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  aboutActive: boolean = true;
  reviewsActive: boolean = false;
  projectsActive: boolean = false;
  activeSectionName: string = 'about'
  activeSection(): void {
    if (this.activeSectionName === 'about') {
      this.aboutActive = true;
      this.reviewsActive = false;
      this.projectsActive = false;
    }
    if (this.activeSectionName === 'reviews') {
      this.aboutActive = false;
      this.reviewsActive = true;
      this.projectsActive = false;
    }
    if (this.activeSectionName === 'projects') {
      this.aboutActive = false;
      this.reviewsActive = false;
      this.projectsActive = true;
    }
  }
  showSection(sectionName: string): void {
    this.activeSectionName = sectionName;
    if (this.activeSectionName === 'reviews') {
      this.reviewsComponent();
    }
    if (this.activeSectionName === 'projects') {
      this.projectsComponent();
    }
  }
  cancelGetpostsbyjobtype!:Subscription
  cancelGetpostsbyjobtypeLimted!:Subscription
  projectsComponent(): void {
    this._NgxSpinnerService.show();
    this.cancelGetpostsbyjobtype = this._PostsService.Getpostsbyjobtype(this.employeeData.job).subscribe({
      next: (res) => {
        console.log(res);
        this.cancelGetpostsbyjobtypeLimted = this._PostsService.GetpostsbyjobtypeLimted(this.employeeData.job, res.data.totalDocs).subscribe({
          next: (res) => {
            this.postsEmployee = res.data.docs;
            console.log(this.postsEmployee);
            this.postsEmployee = this.postsEmployee.filter((post) => post.userId === this.employeeId);
            console.log(this.postsEmployee);
            this._NgxSpinnerService.hide();
          },
          error: (err) => {
            console.log(err);
            this._NgxSpinnerService.hide();
          }
        })
      },
      error: (err) => {
        console.log(err);
        this._NgxSpinnerService.hide();
      }
    })
  }
  reviewsComponent(): void {
    this._NgxSpinnerService.show();
    if (this.employeeData.rate !== 'null') {
      this.cancelgetAllReviewsForUser = this.ReviewsService.getAllReviewsForUser(this.employeeId).subscribe({
        next: (res) => {
          this.completedReviews = res.filter((review: any) => review.status === 'Completed');
          console.log(this.completedReviews);
          if(this.completedReviews.length > 0) {
            this.isReviewd = true ;
          }
          this.completedReviews.forEach((review) => {
            this.userService.getUserProfile(review.customerId).subscribe({
              next : (res) => {
                review.customerName = res.user.firstName ;
                this._NgxSpinnerService.hide();
              } ,
              error : (err) => {
                  if (err.error.message === "") {
                    if (!this.isErrorToastShown) {
                      this._ToastrService.success('No Internet Connection !', '', {
                        toastClass: 'toastarError',
                        timeOut: 10000
                      });
                      this.isErrorToastShown = true;
                      this.cancelsetTimeOutOne = setTimeout(() => {
                        this.isErrorToastShown = false;
                      }, 10000);
                    }
                  }
                  this._NgxSpinnerService.hide();
              }
            })
          })
          this.isDone = true;
        } , error : (err)  => {
          this._NgxSpinnerService.hide();
          if(err.error.message === "No reviews found for the given ID") {
            this.isReviewd = false ;
          }
        }
      }) ;
    } else {
      this.employeeData.rate = '0';
    }
  }
  // post.component.ts
  selectedImage: string | null = null;

  openImage(imageUrl: string) {
    this.selectedImage = imageUrl;
  }

  closeImage() {
    this.selectedImage = null;
  }
  ngAfterViewInit(): void {
    if(isPlatformBrowser(this._PLATFORM_ID)) {
      window.scrollTo(-100 , 0) ;
    }
  }
  ngOnDestroy(): void {
    this.cancelgetAllReviewsForUser?.unsubscribe();
    this.cancelgetChat?.unsubscribe();
    this.cancelgetUserProfile?.unsubscribe();
    this.cancelgetUserProfileTwo?.unsubscribe();
    clearTimeout(this.cancelsetTimeOutOne)
    clearTimeout(this.cancelsetTimeOutTwo)
    clearTimeout(this.cancelsetTimeOutThree)
  }
}
