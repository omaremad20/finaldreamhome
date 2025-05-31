import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Login } from '../../../core/interfaces/login';
import { AuthService } from '../../../core/services/Auth/auth.service';
import { LoginService } from '../../../core/services/login.service';
@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, TranslatePipe, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  constructor() { }
  private _AuthService = inject(AuthService);
  private _LoginService = inject(LoginService);
  private _TranslateService = inject(TranslateService);
  private _NgxSpinnerService = inject(NgxSpinnerService);
  private platformId = inject(PLATFORM_ID);
  private _ToastrService = inject(ToastrService);
  private _Router = inject(Router)
  loginError!: boolean;
  isLoading: boolean = false;
  currentLang!: string
  callingForm: Subscription | null = null;
  loginData!: Login;
  sumbited!: boolean;
  passwordVisible: boolean = false;
  cancelTrans: Subscription | null = null;
  loginFormData: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email,
      // Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)
    ]),
    password: new FormControl(null, [Validators.required, Validators.pattern(/^(?=.*\p{L})(?=.*\d).{8,}$/u)])
  });
  ngOnInit(): void {
    this.loginFormData.get('password')?.valueChanges.subscribe(value => {
      if(typeof value === 'string') {
        if (value.includes('')) {
          this.loginFormData.get('password')?.setValue(value.replace(/\s/g, ''), { emitEvent: false })
        }
      }
    })
    if (isPlatformBrowser(this.platformId)) {
      this.updateDirection();
      this.cancelTrans = this._TranslateService.onLangChange.subscribe(() => {
        this.updateDirection();
      });
    }
  }

  updateDirection(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.currentLang = this._TranslateService.currentLang || 'en';
      document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
    }
  }

  showLoginData(): void {
    this._NgxSpinnerService.show();
    this.sumbited = true;
    this.isLoading = true;
    if (this.loginFormData.valid) {
      this.callingForm = this._LoginService.login(this.loginFormData.value).subscribe({
        next: (response) => {

          if (isPlatformBrowser(this.platformId)) {
            sessionStorage.setItem('userLogEmail', response.user.email);
            sessionStorage.setItem('jobTitle' , response.user.job);
            sessionStorage.setItem('userNameLogin' , response.user.firstName + ' ' + response.user.lastName)
          }

          this._ToastrService.success('Successfull !', '', {
            toastClass: 'toastarSuccess'
          })
          this._NgxSpinnerService.hide();
          this._AuthService.login(response.user._id, response.user.role);
          this.loginFormData.reset();
          this.isLoading = false;
          this.loginError = false;
          this._Router.navigateByUrl('/dreamhome')
        },
        error: (err) => {
          this._ToastrService.success('Failed', '', {
            toastClass: 'toastarError'
          })
          this._NgxSpinnerService.hide();
          if (err?.error?.message === 'Check your email and password') {
            this.loginError = true;
            this.isLoading = false;
          }
        }
      }) ?? null;
    } else {
      this._NgxSpinnerService.hide();
      this.loginFormData.markAllAsTouched();
      this.isLoading = false;
    }
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  ngOnDestroy(): void {
    if (this.callingForm) {
      this.callingForm?.unsubscribe();
      this.callingForm = null;
    }
    if (this.cancelTrans) {
      this.cancelTrans?.unsubscribe();
      this.cancelTrans = null;
    }
  }
}
