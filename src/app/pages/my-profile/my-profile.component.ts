import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { UserProfileService } from '../../core/services/UserProfile/user-profile.service';
import { UserProfile } from '../../core/interfaces/userprofile';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { PostsService } from '../../core/services/posts/posts.service';
import { NotficationsService } from '../../core/services/notfications/notfications.service';
@Component({
  selector: 'app-my-profile',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css'
})
export class MyProfileComponent implements OnInit, OnDestroy {
  userProfile!: UserProfile;
  userName!: string;
  userRole!: string;
  currentLang: string = 'en';
  isLoading!: boolean
  callingApi: Subscription | null = null;
  notficationCount: number = 0;
  userId!: string;
  private translate = inject(TranslateService);
  private _PLATFORM_ID = inject(PLATFORM_ID);
  private _NgxSpinnerService = inject(NgxSpinnerService);
  private _PostsService = inject(PostsService)
  private _NotficationsService = inject(NotficationsService)
  constructor(private userProfileService: UserProfileService) { }
  ngOnInit(): void {
    this._NgxSpinnerService.show();
    this.isLoading = true;
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.currentLang = sessionStorage.getItem('language') || 'en';
      this.translate.setDefaultLang(this.currentLang);
      this.translate.use(this.currentLang);
      this.userId = sessionStorage.getItem('userId')!;
    }
    if (this.userId !== undefined) {
      this._NotficationsService.getUserNotifications(this.userId).subscribe({
        next: (res) => {
          this.notficationCount = res.notifications.length ;
        }, error : (err) => {
          this.notficationCount = 0 ;
        }
      })
      this.callingApi = this.userProfileService.getUserProfile(this.userId).subscribe({
        next: (response) => {
          console.log(response);
          this.isLoading = false;
          this._NgxSpinnerService.hide();
          this.userProfile = response.user;
          this.userRole = response.user.role;
          this.userName = response.user.firstName;
        },
        error: (error) => {
          this.isLoading = false;
          this._NgxSpinnerService.hide();
        }
      }) ?? null;
    }
  }
  ngOnDestroy(): void {
    if (this.callingApi) {
      this.callingApi.unsubscribe();
      this.callingApi = null
    }
  }
}
