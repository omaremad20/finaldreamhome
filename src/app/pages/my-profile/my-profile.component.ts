import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { UserProfile } from '../../core/interfaces/userprofile';
import { NotficationsService } from '../../core/services/notfications/notfications.service';
import { UserProfileService } from '../../core/services/UserProfile/user-profile.service';
@Component({
  selector: 'app-my-profile',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css'
})
export class MyProfileComponent implements OnInit, OnDestroy {
  private translate = inject(TranslateService);
  private _PLATFORM_ID = inject(PLATFORM_ID);
  private _NgxSpinnerService = inject(NgxSpinnerService);
  private _NotficationsService = inject(NotficationsService)
  private _ToastrService = inject(ToastrService);
  private isErrorToastShown = false;
  userProfile!: UserProfile;
  userName!: string;
  userRole!: string;
  currentLang: string = 'en';
  isLoading!: boolean
  callingApi!: Subscription
  notficationCount: number = 0;
  userId!: string;
  cancelSetTimeOutOne: any;
  cancelSetTimeOutTwo: any;
  cancelgetUserNotifications!: Subscription
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
      this.cancelgetUserNotifications = this._NotficationsService.getUserNotifications(this.userId).subscribe({
        next: (res) => {
          this.notficationCount = res.notifications.length;
        }, error: (err) => {
          this.notficationCount = 0;
          if (err?.error?.message === "Failed to fetch") {
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
        }
      })
      this.callingApi = this.userProfileService.getUserProfile(this.userId).subscribe({
        next: (response) => {
          this.isLoading = false;
          this._NgxSpinnerService.hide();
          this.userProfile = response.user;
          this.userRole = response.user.role;
          this.userName = response.user.firstName;
        },
        error: (error) => {
          this.isLoading = false;
          this._NgxSpinnerService.hide();
          if (error?.error?.message === "Failed to fetch") {
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
        }
      })
    }
  }
  ngAfterViewInit() {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      window.scrollTo(-100, 0);
    }
  }
  ngOnDestroy(): void {
    this.callingApi?.unsubscribe();
    this.cancelgetUserNotifications?.unsubscribe()
    clearTimeout(this.cancelSetTimeOutOne);
    clearTimeout(this.cancelSetTimeOutTwo);
  }
}
