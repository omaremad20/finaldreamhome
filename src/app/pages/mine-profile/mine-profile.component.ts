import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Modal } from 'bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { UserProfile } from '../../core/interfaces/userprofile';
import { AuthService } from '../../core/services/Auth/auth.service';
import { PostsService } from '../../core/services/posts/posts.service';
import { ReviewsService } from '../../core/services/reviews/reviews.service';
import { UserProfileService } from '../../core/services/UserProfile/user-profile.service';
@Component({
  selector: 'app-mine-profile',
  imports: [RouterLink, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './mine-profile.component.html',
  styleUrl: './mine-profile.component.css'
})
export class MineProfileComponent implements OnInit, OnDestroy, AfterViewInit {
  // services
  private _PLATFORM_ID = inject(PLATFORM_ID)
  private _NgxSpinnerService = inject(NgxSpinnerService)
  private _ToastrService = inject(ToastrService)
  private _ReviewsService = inject(ReviewsService)
  private _PostsService = inject(PostsService)
  private _AuthService = inject(AuthService)
  private _UserProfileService = inject(UserProfileService)
  private _ActivatedRoute = inject(ActivatedRoute)
  private isErrorToastShown = false;
  private translate = inject(TranslateService);
  private _Router = inject(Router);
  // variables
  selectedImage: string | null = null;
  selectedFile: File | null = null;
  tempImagePreview: string | null = null;
  isRated!: boolean;
  isPostsForcustomer!: boolean;
  isPosts!: boolean;
  isComments!: boolean;
  aboutActive: boolean = true;
  reviewsActive: boolean = false;
  activityActive: boolean = false;
  projectsActive: boolean = false;
  uploadProject: boolean = false;
  postsActive: boolean = false;
  isLoading: boolean = true;
  isMainLoading!:boolean;
  userIdOnPlatForm!: string;
  userJobTitle!: string;
  userRole!: string;
  activeSectionName: string = 'aboutme'
  currentLang: string = 'en';
  userProfileData!: UserProfile;
  reviews!: any[];
  comments: any[] = [];
  postsEmployee: any[] = []
  usersIdsMakeComments: string[] = [];
  cancelSubsOne: any[] = [];
  cancelSubsTwo: any[] = [];
  cancelSubsThree: any[] = [];
  postsUserCustomer: any[] = []
  cancelGetcommentsforajobcategory!: Subscription;
  cancelGetcommentsforajobcategorylimted!: Subscription;
  cancelgetAllReviewsForUser!: Subscription;
  cancelgetUserProfile!: Subscription;
  cancelIsIMage!: Subscription;
  cancelsendImageToCloudinary!: Subscription;
  cancelupdateUserProfile!: Subscription;
  cancelGetpostsbyjobtype!: Subscription;
  cancelGetpostsbyjobtypeLimted!: Subscription;
  cancelsendImageToCloudinaryTwo!: Subscription;
  cancelGetallpostswithfiltering!: Subscription
  cancelGetallpostswithfilteringLimited!: Subscription;
  cancelSetTimeOutOne!: any;
  cancelSetTimeOutTwo!: any;
  cancelSetTimeOutThree!: any;
  cancelSetTimeOutFour!: any;
  cancelSetTimeOutFive!: any;
  cancelSetTimeOutSix!: any;
  cancelSetTimeOutSeven!: any;
  cancelSetTimeOutEight!: any;
  cancelSetTimeOutNine!: any;
  cancelSetTimeOutTen!: any
  cancelSetTimeOutEleven!: any;
  cancelSetTimeOutTwelve!: any;
  cancelSetTimeOutThriteen!: any;
  arrayOfTimeOut: any[] = [
    this.cancelSetTimeOutOne,
    this.cancelSetTimeOutTwo,
    this.cancelSetTimeOutThree,
    this.cancelSetTimeOutFour,
    this.cancelSetTimeOutFive,
    this.cancelSetTimeOutSix,
    this.cancelSetTimeOutSeven,
    this.cancelSetTimeOutEight,
    this.cancelSetTimeOutNine,
    this.cancelSetTimeOutTen,
    this.cancelSetTimeOutEleven,
    this.cancelSetTimeOutTwelve,
    this.cancelSetTimeOutThriteen,
  ]
  arrayOfSubscription: Subscription[] = [
    this.cancelGetcommentsforajobcategory,
    this.cancelGetcommentsforajobcategorylimted,
    this.cancelgetAllReviewsForUser,
    this.cancelgetUserProfile,
    this.cancelIsIMage,
    this.cancelsendImageToCloudinary,
    this.cancelupdateUserProfile,
    this.cancelGetpostsbyjobtype,
    this.cancelGetpostsbyjobtypeLimted,
    this.cancelsendImageToCloudinaryTwo,
    this.cancelGetallpostswithfiltering,
    this.cancelGetallpostswithfilteringLimited,
  ];
  uploadProjectForm: FormGroup = new FormGroup({
    content: new FormControl(null, [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]),
    image: new FormControl(null),
  })
  /* EMPLOYEE SIDE */
  // reviews ---> (employee)
  reviewsComponent(): void {
    this._NgxSpinnerService.show();
    this.cancelgetAllReviewsForUser = this._ReviewsService.getAllReviewsForUser(this.userIdOnPlatForm).subscribe({
      next: (res) => {
        this.isRated = true;
        this.reviews = res;
        this.reviews.forEach((review) => {
          const subTwo = this._UserProfileService.getUserProfile(review.customerId).subscribe({
            next: (res) => {
              review.customerId = res.user;
              this._NgxSpinnerService.hide();
            },
            error: (err) => {
              if (err.error.message === "Failed to fetch")
                if (!this.isErrorToastShown) {
                  this._ToastrService.success('No Internet Connection !', '', {
                    toastClass: 'toastarError',
                    timeOut: 10000
                  });
                  this.isErrorToastShown = true;
                  this.cancelSetTimeOutFour = setTimeout(() => {
                    this.isErrorToastShown = false;
                  }, 10000);
                }
              this._NgxSpinnerService.hide();
            }
          })
          this.cancelSubsTwo.push(subTwo)
        })
      }, error: (err) => {
        if (err.error.message === "Failed to fetch") {
          if (!this.isErrorToastShown) {
            this._ToastrService.success('No Internet Connection !', '', {
              toastClass: 'toastarError',
              timeOut: 10000
            });
            this.isErrorToastShown = true;
            this.cancelSetTimeOutFive = setTimeout(() => {
              this.isErrorToastShown = false;
            }, 10000);
          }
        } else if (err.error.message === "No reviews found for the given ID") {
          this.isRated = false
        }
        this._NgxSpinnerService.hide();
      }
    })
  }
  // activity component that get comments for (employee)
  activityComponent(): void {
    this._NgxSpinnerService.show();
    this.cancelGetcommentsforajobcategory = this._PostsService.Getcommentsforajobcategory(this.userJobTitle).subscribe({
      next: (res) => {
        if (res.data.totalDocs !== 0) {
          this.isComments = true;
          this.cancelGetcommentsforajobcategorylimted = this._PostsService.Getcommentsforajobcategorylimted(this.userJobTitle, res.data.totalDocs).subscribe({
            next: (res) => {
              this.comments = res.data.docs;
              this.comments = this.comments.filter((comment) => comment.userId === this.userIdOnPlatForm);
              this.comments.forEach((comment) => {
                const sub = this._PostsService.GetsinglepostbyID(comment.postId).subscribe({
                  next: (res) => {
                    const subThree = this._UserProfileService.getUserProfile(res.data.userId).subscribe({
                      next: (res) => {
                        comment.customerData = res.user;
                        if (this.comments.indexOf(comment) === this.comments.length - 1) {
                          this._NgxSpinnerService.hide();
                        }
                      },
                      error: (err) => {
                        this._NgxSpinnerService.hide();
                        if (err.error.message === "Failed to fetch") {
                          if (!this.isErrorToastShown) {
                            this._ToastrService.success('No Internet Connection !', '', {
                              toastClass: 'toastarError',
                              timeOut: 10000
                            });
                            this.isErrorToastShown = true;
                            this.cancelSetTimeOutSix = setTimeout(() => {
                              this.isErrorToastShown = false;
                            }, 10000);
                          }
                        }
                      }
                    })
                    this.cancelSubsThree.push(subThree);
                  },
                  error: (err) => {
                    this._NgxSpinnerService.hide();
                    if (err.error.message === "Failed to fetch") {
                      if (!this.isErrorToastShown) {
                        this._ToastrService.success('No Internet Connection !', '', {
                          toastClass: 'toastarError',
                          timeOut: 10000
                        });
                        this.isErrorToastShown = true;
                        this.cancelSetTimeOutSeven = setTimeout(() => {
                          this.isErrorToastShown = false;
                        }, 10000);
                      }
                    }
                  }
                })
                this.cancelSubsOne.push(sub);
              })
            },
            error: (err) => {
              this._NgxSpinnerService.hide();
              if (err.error.message === "Failed to fetch") {
                if (!this.isErrorToastShown) {
                  this._ToastrService.success('No Internet Connection !', '', {
                    toastClass: 'toastarError',
                    timeOut: 10000
                  });
                  this.isErrorToastShown = true;
                  this.cancelSetTimeOutEight = setTimeout(() => {
                    this.isErrorToastShown = false;
                  }, 10000);
                }
              }
            }
          })
        } else {
          this.isComments = false;
        }
      },
      error: (err) => {
        this._NgxSpinnerService.hide();
        if (err.error.message === "Failed to fetch") {
          if (!this.isErrorToastShown) {
            this._ToastrService.success('No Internet Connection !', '', {
              toastClass: 'toastarError',
              timeOut: 10000
            });
            this.isErrorToastShown = true;
            this.cancelSetTimeOutNine = setTimeout(() => {
              this.isErrorToastShown = false;
            }, 10000);
          }
        }
      }
    })
  }
  // projectsComponent ---> (employee)
  projectsComponent(): void {
    this._NgxSpinnerService.show();
    this.cancelGetpostsbyjobtype = this._PostsService.Getpostsbyjobtype(this.userProfileData.job).subscribe({
      next: (res) => {
        if (res.data.totalDocs !== 0) {
          this.isPosts = true;
          this.cancelGetpostsbyjobtypeLimted = this._PostsService.GetpostsbyjobtypeLimted(this.userProfileData.job, res.data.totalDocs).subscribe({
            next: (res) => {
              this.postsEmployee = res.data.docs;
              this.postsEmployee = this.postsEmployee.filter((post) => post.userId === this.userIdOnPlatForm);
              if (this.postsEmployee.length !== 0) {
                this.isPosts = true
              } else {
                this.isPosts = false;
              }
              this._NgxSpinnerService.hide();
            },
            error: (err) => {
              this._NgxSpinnerService.hide();
              if (err.error.message === "Failed to fetch") {
                if (!this.isErrorToastShown) {
                  this._ToastrService.success('No Internet Connection !', '', {
                    toastClass: 'toastarError',
                    timeOut: 10000
                  });
                  this.isErrorToastShown = true;
                  this.cancelSetTimeOutTen = setTimeout(() => {
                    this.isErrorToastShown = false;
                  }, 10000);
                }
              }
            }
          })
        } else {
          this.isPosts = false
        }
      },
      error: (err) => {
        this._NgxSpinnerService.hide();
        if (err.error.message === "Failed to fetch") {
          if (!this.isErrorToastShown) {
            this._ToastrService.success('No Internet Connection !', '', {
              toastClass: 'toastarError',
              timeOut: 10000
            });
            this.isErrorToastShown = true;
            this.cancelSetTimeOutEleven = setTimeout(() => {
              this.isErrorToastShown = false;
            }, 10000);
          }
        }
      }
    })
  }
  /*upload project (employee) */
  uploadPost(): void {
    this._NgxSpinnerService.show();
    if (this.uploadProjectForm.valid) {
      let formCloud = new FormData()
      if (this.selectedFile) {
        formCloud.append(`file`, this.selectedFile)
        formCloud.append(`upload_preset`, `test_cloud`)
      }
      this.cancelsendImageToCloudinaryTwo = this._PostsService.sendImageToCloudinary(`https://api.cloudinary.com/v1_1/dvuxvcida/image/upload`, formCloud).subscribe({
        next: (res) => {
          this._PostsService.Createanewpost({
            job: this.userProfileData.job,
            content: this.uploadProjectForm.get('content')?.value,
            image: res.url,
            userId: this.userProfileData.id
          }).subscribe({
            next: (res) => {
              this.uploadProjectForm.reset();
              this._NgxSpinnerService.hide();
            },
            error: (err) => {
            }
          })
        }
      })
    } else {
      this._NgxSpinnerService.hide();
      this.uploadProjectForm.markAllAsTouched();
    }
  }
  /*CUSTOMER SIDE*/
  // postComponent(customer)
  postsComponent(): void {
    this._NgxSpinnerService.show();
    this.cancelGetallpostswithfiltering = this._PostsService.Getallpostswithfiltering().subscribe({
      next: (res) => {
        this._NgxSpinnerService.hide();
        if (res.data.totalDocs !== 0) {
          this.isPostsForcustomer = true;
          this.cancelGetallpostswithfilteringLimited = this._PostsService.GetallpostswithfilteringLimited(res.data.totalDocs).subscribe({
            next: (res) => {
              this.postsUserCustomer = res.data.docs
              this.postsUserCustomer = this.postsUserCustomer.filter((post) => this.userIdOnPlatForm === post.userId);
              if (this.postsUserCustomer.length !== 0) {
                this.isPostsForcustomer = true;
              } else {
                this.isPostsForcustomer = false;
              }
            },
            error: (err) => {
              this._NgxSpinnerService.hide();
              if (err.error.message === "Failed to fetch") {
                if (!this.isErrorToastShown) {
                  this._ToastrService.success('No Internet Connection !', '', {
                    toastClass: 'toastarError',
                    timeOut: 10000
                  });
                  this.isErrorToastShown = true;
                  this.cancelSetTimeOutTwelve = setTimeout(() => {
                    this.isErrorToastShown = false;
                  }, 10000);
                }
              }
            }
          })
        } else {
          this.isPostsForcustomer = false;
        }
      },
      error: (err) => {
        this._NgxSpinnerService.hide();
        if (err.error.message === "Failed to fetch") {
          if (!this.isErrorToastShown) {
            this._ToastrService.success('No Internet Connection !', '', {
              toastClass: 'toastarError',
              timeOut: 10000
            });
            this.isErrorToastShown = true;
            this.cancelSetTimeOutThriteen = setTimeout(() => {
              this.isErrorToastShown = false;
            }, 10000);
          }
        }
      }
    })
  }
  // global (customer && employee)
  ngOnInit(): void {
    this.isMainLoading = true ;
    this._NgxSpinnerService.show();
    this.cancelIsIMage = this.uploadProjectForm.get('image')?.valueChanges.subscribe(() => {
      this.isImage();
    })!;
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.currentLang = sessionStorage.getItem('language') || 'en';
      this.translate.setDefaultLang(this.currentLang);
      this.translate.use(this.currentLang);
    }
    this.userRole = this._AuthService.getRole()!;
    this._ActivatedRoute.paramMap.subscribe({
      next: (res) => {
        this.userIdOnPlatForm = res.get('userId')!
      },
      error: (err) => {
        this._NgxSpinnerService.hide();
      }
    })
    this.cancelgetUserProfile = this._UserProfileService.getUserProfile(this.userIdOnPlatForm).subscribe({
      next: (res) => {
        this.isMainLoading = false
        this.isLoading = false;
        this.userProfileData = res.user;
        this.userJobTitle = this.userProfileData.job!;
        this._NgxSpinnerService.hide();
      },
      error: (err) => {
        this.isMainLoading = false;
        if (err.error.message === "Failed to fetch") {
          if (!this.isErrorToastShown) {
            this._ToastrService.success('No Internet Connection !', '', {
              toastClass: 'toastarError',
              timeOut: 10000
            });
            this.isErrorToastShown = true;
            this.cancelSetTimeOutOne = setTimeout(() => {
              this.isErrorToastShown = false;
            }, 10000);
          }
        }
        this._NgxSpinnerService.hide();
      }
    })
  }
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      window.scrollTo(-100, 0);
    }
  }
  updateImage() {
    this._NgxSpinnerService.show();
    if (this.tempImagePreview) {
      const formCloud = new FormData();
      if (this.tempImagePreview) {
        formCloud.append('file', this.tempImagePreview);
        formCloud.append('upload_preset', 'test_cloud');
      }
      this.cancelsendImageToCloudinary = this._PostsService.sendImageToCloudinary(`https://api.cloudinary.com/v1_1/dvuxvcida/image/upload`, formCloud).subscribe({
        next: (res) => {
          this.cancelupdateUserProfile = this._UserProfileService.updateUserProfile(this.userIdOnPlatForm, {
            "firstName": this.userProfileData.firstName,
            "lastName": this.userProfileData.lastName,
            "contactNumber": this.userProfileData.contactNumber,
            "email": this.userProfileData.email,
            "job": this.userProfileData.job,
            "images": res.url,
            "rate": this.userProfileData.rate
          }).subscribe({
            next: (res) => {
              this.userProfileData = res
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
                  this.cancelSetTimeOutTwo = setTimeout(() => {
                    this.isErrorToastShown = false;
                  }, 10000);
                }
              }
              this._NgxSpinnerService.hide();
            }
          })
        },
        error: (err) => {
          if (!this.isErrorToastShown) {
            this._ToastrService.success('Failed To Upload Image', '', {
              toastClass: 'toastarError',
              timeOut: 10000
            });
            this.isErrorToastShown = true;
            this.cancelSetTimeOutThree = setTimeout(() => {
              this.isErrorToastShown = false;
            }, 10000);
          }
          this._NgxSpinnerService.hide();
        }
      })
      this.userProfileData.images = this.tempImagePreview;
      this.tempImagePreview = null;
      const modalElement = document.getElementById('confirmModal');
      if (modalElement) {
        const modalInstance = Modal.getInstance(modalElement) || new Modal(modalElement);
        modalInstance.hide();
      }
    }
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        this.tempImagePreview = file;
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.userProfileData.images = e.target.result;
        };
        reader.readAsDataURL(file);
        const modalElement = document.getElementById('confirmModal');
        if (modalElement) {
          const modalInstance = Modal.getOrCreateInstance(modalElement);
          modalInstance.show();
        }
      } else {
        this._ToastrService.success('Only Images Accepted', '', {
          toastClass: 'toastarError'
        })
        event.target.value = "";
      }
    }
  }
  activeSection(): void {
    if (this.activeSectionName === 'aboutme') {
      this.aboutActive = true;
      this.reviewsActive = false;
      this.activityActive = false;
      this.projectsActive = false;
      this.uploadProject = false;
      this.postsActive = false;
    }
    if (this.activeSectionName === 'reviews') {
      this.aboutActive = false;
      this.reviewsActive = true;
      this.activityActive = false;
      this.projectsActive = false;
      this.uploadProject = false;
      this.postsActive = false;
    }
    if (this.activeSectionName === 'activity') {
      this.aboutActive = false;
      this.reviewsActive = false;
      this.activityActive = true;
      this.projectsActive = false;
      this.uploadProject = false;
      this.postsActive = false;
    }
    if (this.activeSectionName === 'projects') {
      this.aboutActive = false;
      this.reviewsActive = false;
      this.activityActive = false;
      this.projectsActive = true;
      this.uploadProject = false;
      this.postsActive = false;
    }
    if (this.activeSectionName === 'uploadProject') {
      this.aboutActive = false;
      this.reviewsActive = false;
      this.activityActive = false;
      this.projectsActive = false;
      this.uploadProject = true;
      this.postsActive = false;
    }
    if (this.activeSectionName === 'posts') {
      this.postsActive = true;
      this.aboutActive = false;
      this.reviewsActive = false;
      this.activityActive = false;
      this.projectsActive = false;
      this.uploadProject = false;
    }
  }
  changeActiveName(nameOfSection: string): void {
    this.activeSectionName = nameOfSection;
    if (this.activeSectionName === 'reviews') {
      this.reviewsComponent();
    }
    if (this.activeSectionName === 'activity') {
      this.activityComponent();
    }
    if (this.activeSectionName === 'projects') {
      this.projectsComponent();
    }
    if (this.activeSectionName === 'posts') {
      this.postsComponent();
    }
  }
  isImage(): void {
    const imageValue = this.uploadProjectForm.get('image')?.value;
    if (imageValue === '' || imageValue.includes('png') || imageValue.includes('svg') || imageValue.includes('webp') || imageValue.includes('gif') || imageValue.includes('jpeg') || imageValue.includes('jpg')) {
      this.uploadProjectForm.get('image')?.setErrors(null);
    } else {
      this.uploadProjectForm.get('image')?.setErrors({ notMatch: true });
    }
  }
  onFileSelectedTwo(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }
  openImage(imageUrl: string) {
    this.selectedImage = imageUrl;
  }
  closeImage() {
    this.selectedImage = null;
  }
  logOut(): void {
    this._AuthService.logout();
    this._Router.navigateByUrl('/login')
  }
  // componentDie
  ngOnDestroy(): void {
    this.arrayOfSubscription.forEach(sub => sub?.unsubscribe());
    this.cancelSubsOne.forEach(sub => sub?.unsubscribe())
    this.cancelSubsTwo.forEach(sub => sub?.unsubscribe())
    this.cancelSubsThree.forEach(sub => sub?.unsubscribe())
    this.arrayOfTimeOut.forEach(timeOut => clearTimeout(timeOut))
  }
}
