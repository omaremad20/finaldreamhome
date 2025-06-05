import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { map, Observable, Subscription, switchMap, timer } from 'rxjs';
import { AuthService } from '../../core/services/Auth/auth.service';
import { PostsService } from '../../core/services/posts/posts.service';
import { UserProfileService } from '../../core/services/UserProfile/user-profile.service';
import { NotFoundComponent } from "../not-found/not-found.component";
@Component({
  selector: 'app-browseprojects',
  imports: [TranslatePipe, RouterLink, NotFoundComponent],
  templateUrl: './browseprojects.component.html',
  styleUrl: './browseprojects.component.css'
})
export class BrowseprojectsComponent implements OnInit, OnDestroy {
  private _PostsService = inject(PostsService);
  private _NgxSpinnerService = inject(NgxSpinnerService);
  private _ToastrService = inject(ToastrService);
  private translate = inject(TranslateService);
  private _UserProfileService = inject(UserProfileService);
  private _PLATFORM_ID = inject(PLATFORM_ID);
  private isErrorToastShown = false;
  private _AuthService = inject(AuthService)
  isloading!: boolean;
  userRoleOnplat!: string
  currentLang: string = 'en';
  jobTitle!: string;
  userCache: { [userId: string]: string } = {};
  userRoleCache: { [key: string]: string } = {};
  isMainLOading!: boolean;
  cancelGetPosts!: Subscription;
  arrayOfsubsOne: Subscription[] = [];
  arrayOfsubsTwo: Subscription[] = [];
  posts: any[] = [];
  arrayOfTimeOutOne: any[] = [];
  arrayOfTimeOutTwo: any[] = [];

  ngOnInit(): void {
    this.userRoleOnplat = this._AuthService.getRole()!;
    const pollingInterval = 10000;
    this.isloading = true;
    this._NgxSpinnerService.show();
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.currentLang = sessionStorage.getItem('language') || 'en';
      this.translate.setDefaultLang(this.currentLang);
      this.translate.use(this.currentLang);
    }
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      if (sessionStorage.getItem('userId')) {
        this.jobTitle = sessionStorage.getItem('jobTitle')!;
        this.cancelGetPosts = timer(0, pollingInterval).pipe(switchMap(() => this._PostsService.Getpostsbyjobtype(this.jobTitle))).subscribe({
          next: (res) => {
            this._NgxSpinnerService.hide();
            this.posts = res.data.docs;
            this.posts.forEach((post) => {
              if (this.userRoleCache[post.userId]) {
                post.userRole = this.userRoleCache[post.userId];
              } else {
                const subOne = this._UserProfileService.getUserProfile(post.userId).subscribe({
                  next: (res) => {
                    post.userRole = res.user.role;
                    this.userRoleCache[post.userId] = res.user.role;
                  },
                  error: (err) => {
                    post.userRole = 'Unknown';
                    this.userRoleCache[post.userId] = 'Unknown';
                    if (err.error.message === "Failed to fetch") {
                      if (!this.isErrorToastShown) {
                        this._ToastrService.success('No Internet Connection !', '', {
                          toastClass: 'toastarError',
                          timeOut: 10000
                        });
                        this.isErrorToastShown = true;
                        let cancelTimeOut = setTimeout(() => {
                          this.isErrorToastShown = false;
                        }, 10000);
                        this.arrayOfTimeOutOne.push(cancelTimeOut)
                      }
                    }
                  }
                });
                this.arrayOfsubsOne.push(subOne)
              }
            })
            for (let i = 0; i < this.posts.length; i++) {
              const userId = this.posts[i].userId;
              if (this.userCache[userId]) {
                this.posts[i].userName = this.userCache[userId];
              } else {
                const subTwo = this.getuser(userId).subscribe({
                  next: (userName) => {
                    this.userCache[userId] = userName;
                    this.posts[i].userName = userName;
                  },
                  error: (err) => {
                    this.userCache[userId] = 'Unknown';
                    this.posts[i].userName = 'Unknown';
                    if (err.error.message === "Failed to fetch") {
                      if (!this.isErrorToastShown) {
                        this._ToastrService.success('No Internet Connection !', '', {
                          toastClass: 'toastarError',
                          timeOut: 10000
                        });
                        this.isErrorToastShown = true;
                        let cancelsetTimeout = setTimeout(() => {
                          this.isErrorToastShown = false;
                        }, 10000);
                        this.arrayOfTimeOutTwo.push(cancelsetTimeout)
                      }
                    }
                  }
                });
                this.arrayOfsubsTwo.push(subTwo)
              }
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
                setTimeout(() => {
                  this.isErrorToastShown = false;
                }, 10000);
              }
            }
          }
        });
      }
    }
  }
  getuser(userId: string): Observable<string> {
    this.isloading = false;
    return this._UserProfileService.getUserProfile(userId).pipe(
      map(res => res.user.firstName + ' ' + res.user.lastName)
    );
  }
  ngOnDestroy(): void {
    this.cancelGetPosts?.unsubscribe();
    this.arrayOfsubsOne.forEach((sub) => sub?.unsubscribe());
    this.arrayOfsubsTwo.forEach((sub) => sub?.unsubscribe());
    this.arrayOfTimeOutOne.forEach((time) => clearTimeout(time));
    this.arrayOfTimeOutTwo.forEach((time) => clearTimeout(time));
  }
}
