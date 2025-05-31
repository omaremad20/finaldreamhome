import { ServicesCallServiceService } from './../../core/services/servicesCallService/services-call-service.service';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { EmployessService } from '../../core/services/employees/employess.service';
import { IEmployee } from '../../core/interfaces/iemployee';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-service-details',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './service-details.component.html',
  styleUrl: './service-details.component.css'
})
export class ServiceDetailsComponent implements OnInit, OnDestroy {
  private translate = inject(TranslateService);
  private _PLATFORM_ID = inject(PLATFORM_ID);
  private _EmployessService = inject(EmployessService);
  private readonly _NgxSpinnerService = inject(NgxSpinnerService);
  currentLang: string = 'en';
  employeesData!: IEmployee[];
  callingApi: Subscription | null = null;
  jobId!: string;
  jobTitle!: string;
  noEmployees!: boolean;
  ratesArray: any[] = [];
  noRecommend!: boolean;
  isLoading!: boolean;

  ngOnInit(): void {
    this.isLoading = true;
    this._NgxSpinnerService.show();
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.currentLang = sessionStorage.getItem('language') || 'en';
      this.translate.setDefaultLang(this.currentLang);
      this.translate.use(this.currentLang);
    }
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      if (sessionStorage.getItem('jobId')) {
        this.jobId = sessionStorage.getItem('jobId')!;
        this.callingApi = this._EmployessService.getEmployess(this.jobId).subscribe({
          next: (res) => {
            this.isLoading = false;
            this.noEmployees = false;
            this._NgxSpinnerService.hide();
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
            console.log(this.noRecommend);

            console.log(this.ratesArray);

          },
          error: (err) => {
            this.isLoading = false;
            console.log(err);
            this._NgxSpinnerService.hide();
            if (err?.error?.message === 'No employees found for this service') {
              this.noEmployees = true;
            }
          }
        }) ?? null;
      }
    }
  }

  divCilcked(_id: any): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      if (sessionStorage.getItem('userId')) {
        sessionStorage.setItem('_id', _id);
      }
    }
  }
  divCilckedMessage(_id: any): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      if (sessionStorage.getItem('userId')) {
        sessionStorage.setItem('userIdTargetChat', _id);
      }
    }
  }
  ngAfterViewInit() {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      window.scrollTo(0, 0);
    }
  }
  ngOnDestroy(): void {
    if (this.callingApi) {
      this.callingApi.unsubscribe();
      this.callingApi = null;
    }
  }
}
