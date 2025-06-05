import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { map, Observable, Subscription, switchMap, timer } from 'rxjs';
import { Doc } from '../../core/interfaces/post';
import { PostsService } from '../../core/services/posts/posts.service';
import { UserProfileService } from '../../core/services/UserProfile/user-profile.service';
@Component({
  selector: 'app-browseprojects',
  imports: [TranslatePipe, RouterLink],
  templateUrl: './browseprojects.component.html',
  styleUrl: './browseprojects.component.css'
})
export class BrowseprojectsComponent implements OnInit, OnDestroy {
  posts: any[] = []
  isloading!: boolean;
  private _PostsService = inject(PostsService);
  private _NgxSpinnerService = inject(NgxSpinnerService);
  private _ToastrService = inject(ToastrService);
  private translate = inject(TranslateService);
  private _UserProfileService = inject(UserProfileService);
  private _PLATFORM_ID = inject(PLATFORM_ID);
  private _Router = inject(Router);
  cancelGetPosts!: Subscription;
  currentLang: string = 'en';
  jobTitle!: string;
  userCache: { [userId: string]: string } = {};
  userRoleCache: { [key: string]: string } = {};

  ngOnInit(): void {
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
                this._UserProfileService.getUserProfile(post.userId).subscribe({
                  next: (res) => {
                    post.userRole = res.user.role;
                    this.userRoleCache[post.userId] = res.user.role;
                  },
                  error: () => {
                    post.userRole = 'Unknown';
                    this.userRoleCache[post.userId] = 'Unknown';
                  }
                });
              }

            })
            for (let i = 0; i < this.posts.length; i++) {
              const userId = this.posts[i].userId;
              if (this.userCache[userId]) {
                this.posts[i].userName = this.userCache[userId];
              } else {
                this.getuser(userId).subscribe({
                  next: (userName) => {
                    this.userCache[userId] = userName;
                    this.posts[i].userName = userName;
                  },
                  error: () => {
                    this.userCache[userId] = 'Unknown';
                    this.posts[i].userName = 'Unknown';
                  }
                });
              }
            }
          },
          error: (err) => {
            this._NgxSpinnerService.hide();
            console.error('Error getting posts:', err);
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
  }
}
