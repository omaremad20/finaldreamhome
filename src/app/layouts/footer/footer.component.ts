import { isPlatformBrowser } from '@angular/common';
import { Component, inject, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import emailjs from '@emailjs/browser';
import { link } from 'fs';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-footer',
  imports: [TranslatePipe , ReactiveFormsModule , FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  userNameLogin!: string;
  callingLanguage!: Subscription;
  charAt:string = '@'
  private _NgxSpinnerService = inject(NgxSpinnerService);
  private _ToastrService = inject(ToastrService);
  private _TranslateService = inject(TranslateService);
  private _PLATFORM_ID = inject(PLATFORM_ID);
  formEmail: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email, Validators.pattern(/^.+@gmail\.com$/)])
  })
  sendLink(): void {
    this._NgxSpinnerService.show();
    if (this.formEmail.valid) {
      const emailParams = {
        to_name: this.userNameLogin,
        to_email: this.formEmail.get('email')?.value,
        link: `app-release.apk`,
        from_name: 'Dream Home'
      };
      // new service with email js with new content for message
      emailjs.send('service_jvhehwc', 'template_4awkb0x', emailParams, 'qQPM3s3-KlvBI6JzW').then(
        () => {
          this._NgxSpinnerService.hide();
          this._ToastrService.success('Link Sent Successfully !', '', {
            toastClass: 'toastarSuccess'
          })
        }
      ).catch( () => {
        this._NgxSpinnerService.hide();
        this._ToastrService.success('Failed To send Link !' , '' , {
          toastClass : 'toastarError'
        })
      })
      this.formEmail.reset();
    } else {
      this._NgxSpinnerService.hide();
      this.formEmail.markAllAsTouched();
    }
  }


  ngOnInit(): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.updateDirection();
      this.userNameLogin = sessionStorage.getItem('userNameLogin')!;
      this._TranslateService.onLangChange.subscribe(() => {
        this.updateDirection();
      });
    }
  }

  updateDirection(): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      const currentLang = this._TranslateService.currentLang || 'en';
      document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    }
  }

}

