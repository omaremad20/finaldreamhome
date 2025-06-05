import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contact-us',
  imports: [TranslatePipe, ReactiveFormsModule, FormsModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export class ContactUsComponent implements OnInit, OnDestroy {
  currentLang: string = 'en';
  clearTimeOut: any;
  private translate = inject(TranslateService);
  private _PLATFORM_ID = inject(PLATFORM_ID);
  private _NgxSpinnerService = inject(NgxSpinnerService);
  private _ToastrService = inject(ToastrService);

  contactUsForm: FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required, Validators.maxLength(10)]),
    email: new FormControl(null, [Validators.required, Validators.email, Validators.maxLength(128)]),
    subject: new FormControl(null, [Validators.required, Validators.maxLength(32)]),
    message: new FormControl(null, [Validators.required, Validators.maxLength(1000)])
  })
  sumbitForm(): void {
    this._NgxSpinnerService.show();
    if (this.contactUsForm.valid) {
      this.contactUsForm.reset();
      this.clearTimeOut = setTimeout(() => {
        this._NgxSpinnerService.hide()
      }, 1500);
      this._ToastrService.success('Message Sent Successfully !', '', {
        toastClass: 'toastarSuccess'
      })
    } else {
      this._NgxSpinnerService.hide();
      this.contactUsForm.markAllAsTouched();
    }
  }
  ngOnInit(): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.currentLang = sessionStorage.getItem('language') || 'en';
      this.translate.setDefaultLang(this.currentLang);
      this.translate.use(this.currentLang);
    }
  }
  ngOnDestroy(): void {
    clearTimeout(this.clearTimeOut)
  }
}
