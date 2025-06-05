import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { IEmployee } from '../../core/interfaces/iemployee';
import { EmployessService } from '../../core/services/employees/employess.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/Auth/auth.service';
import { NotFoundComponent } from "../not-found/not-found.component";

@Component({
  selector: 'app-service-details',
  imports: [RouterLink, TranslatePipe, NotFoundComponent],
  templateUrl: './service-details.component.html',
  styleUrl: './service-details.component.css'
})
export class ServiceDetailsComponent implements OnInit, OnDestroy {
  private translate = inject(TranslateService);
  private _PLATFORM_ID = inject(PLATFORM_ID);
  private _EmployessService = inject(EmployessService);
  private readonly _NgxSpinnerService = inject(NgxSpinnerService);
  private _ActivatedRoute = inject(ActivatedRoute)
  private isErrorToastShown = false;
  private _ToastrService = inject(ToastrService);
  private _AuthService = inject(AuthService);

  noRecommend!: boolean;
  isLoading!: boolean;
  noEmployees!: boolean;
  employeesData!: IEmployee[];
  ratesArray: any[] = [];
  currentLang: string = 'en';
  jobId!: string;
  jobTitle!: string;
  userRole!: string;
  callingApi!: Subscription;
  cancelSetTimeOut: any;
  ngOnInit(): void {
    this.userRole = this._AuthService.getRole()!;
    this.isLoading = true;
    this._NgxSpinnerService.show();
    this._ActivatedRoute.paramMap.subscribe({
      next: (res) => {
        this.jobId = res.get('jobTitle')!;
      },
      error: (err) => {
        this._NgxSpinnerService.hide();
      }
    })
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.currentLang = sessionStorage.getItem('language') || 'en';
      this.translate.setDefaultLang(this.currentLang);
      this.translate.use(this.currentLang);
    }
    this.callingApi = this._EmployessService.getEmployess(this.jobId).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.noEmployees = false;
        this.jobTitle = res.employees.job;
        this.employeesData = res.employees;
        for (let i = 0; i < this.employeesData.length; i++) {
          this.ratesArray.push(this.employeesData[i].rate);
        }
        for (let i = 0; i < this.ratesArray.length; i++) {
          if (this.ratesArray[i] > 3.5) {
            this.noRecommend = false;
          }
        }
        this._NgxSpinnerService.hide();
      },
      error: (err) => {
        this.isLoading = false;
        if (err?.error?.message === 'No employees found for this service') {
          this.noEmployees = true;
        } else if (err?.error?.message === "Failed to fetch") {
          if (!this.isErrorToastShown) {
            this._ToastrService.success('No Internet Connection !', '', {
              toastClass: 'toastarError',
              timeOut: 10000
            });
            this.isErrorToastShown = true;
            this.cancelSetTimeOut = setTimeout(() => {
              this.isErrorToastShown = false;
            }, 10000);
          }
        }
        this._NgxSpinnerService.hide();
      }
    });
  }
  ngAfterViewInit() {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      window.scrollTo(-100, 0);
    }
  }
  ngOnDestroy(): void {
    this.callingApi?.unsubscribe();
    clearTimeout(this.cancelSetTimeOut);
  }
}
