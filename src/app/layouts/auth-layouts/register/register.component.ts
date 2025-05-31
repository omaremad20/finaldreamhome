import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import emailjs from '@emailjs/browser';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { IRegister } from './../../../core/interfaces/iregister';
import { RegisteritionService } from './../../../core/services/register/registerition.service';
import { ToastrService } from 'ngx-toastr';
import { platformBrowser } from '@angular/platform-browser';
@Component({
  selector: 'app-register',
  imports: [FormsModule, ReactiveFormsModule, TranslatePipe, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit, OnDestroy {
  private _TranslateService = inject(TranslateService);
  private _RegisteritionService = inject(RegisteritionService);
  private readonly _PLATFORM_ID = inject(PLATFORM_ID);
  private _NgxSpinnerService = inject(NgxSpinnerService);
  private _Router = inject(Router)
  registerData!: IRegister;
  email: string = '';
  currentLang!: string;
  errorMessage: string = 'Email Is Already Exsits !';
  atChar: string = '@';
  enteredOtp: string = '';
  otp!: number;
  done!: boolean;
  emailExists: boolean = false;
  isLoading: boolean = false;
  passwordVisible: boolean = false;
  repasswordVisible: boolean = false;
  endOfOtp!: boolean;
  callingForm: Subscription | null = null;
  cancelTrans: Subscription | null = null;
  cancelChangRe: Subscription | null = null;
  cancelChangePa: Subscription | null = null;
  cancelRegister: Subscription | null = null;
  private _ToastrService = inject(ToastrService);
  constructor() {
    this.cancelRegister = this.registerFormData.get('role')?.valueChanges.subscribe(role => {
      if (role === 'customer') {
        this.registerFormData.get('job')?.clearValidators();
      } else {
        this.registerFormData.get('job')?.setValidators([Validators.required]);
      }
      this.registerFormData.get('job')?.updateValueAndValidity();
    })!;
  }
  registerFormData: FormGroup = new FormGroup({
    firstName: new FormControl(null, [Validators.required, Validators.pattern(/^[\p{L}\s]+$/u), Validators.minLength(3), Validators.maxLength(10)]),
    lastName: new FormControl(null, [Validators.required, Validators.pattern(/^[\p{L}\s]+$/u), Validators.minLength(3), Validators.maxLength(10)]),
    email: new FormControl(null, [Validators.required, Validators.email,
      // Validators.pattern(/^.+@gmail\.com$/)
    ]),
    password: new FormControl(null, [Validators.required, Validators.pattern(/^(?=.*\p{L})(?=.*\d).{8,}$/u), Validators.maxLength(32)]),
    repassword: new FormControl(null, [Validators.required]),
    contactNumber: new FormControl(null, [Validators.required, Validators.pattern(/^01[0-2,5]\d{8}$/)]),
    role: new FormControl(null, [Validators.required]),
    job: new FormControl(null, [Validators.required])
  });

  ngOnInit(): void {
    this.registerFormData.get('password')?.valueChanges.subscribe(value => {
      if (value?.includes('')) {
        this.registerFormData.get('password')?.setValue(value.replace(/\s/g, ''), { emitEvent: false });
      }
    })
    this.registerFormData.get('repassword')?.valueChanges.subscribe(value => {
      if (value?.includes('')) {
        this.registerFormData.get('repassword')?.setValue(value.replace(/\s/g, ''), { emitEvent: false });
      }
    })
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.updateDirection();
      this.cancelTrans = this._TranslateService.onLangChange.subscribe(() => {
        this.updateDirection();
      });
    }
  }

  updateDirection(): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.currentLang = this._TranslateService.currentLang || 'en';
      document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = this.currentLang;
    }
    this.cancelChangRe = this.registerFormData.get('repassword')?.valueChanges.subscribe(() => {
      this.compare();
    })!;
    this.cancelChangePa = this.registerFormData.get('password')?.valueChanges.subscribe(() => {
      this.compare();
    })!;
  }

  compare(): void {
    const password = this.registerFormData.get('password')?.value;
    const repassword = this.registerFormData.get('repassword')?.value;
    if (password !== repassword) {
      this.registerFormData.get('repassword')?.setErrors({ notMatch: true });
    } else {
      this.registerFormData.get('repassword')?.setErrors(null);
    }
  }

  submitForm(): void {
    this._NgxSpinnerService.show();
    this.isLoading = true;
    if (this.registerFormData.valid) {
      const registerData = {
        firstName: this.registerFormData.value.firstName,
        lastName: this.registerFormData.value.lastName,
        email: this.registerFormData.value.email,
        password: this.registerFormData.value.password,
        contactNumber: this.registerFormData.value.contactNumber,
        role: this.registerFormData.value.role,
        job: this.registerFormData.value.job
      };
      this.otp = Math.floor(100000 + Math.random() * 900000);
      const emailParams = {
        to_name: `${registerData.firstName} ${registerData.lastName}`,
        to_email: registerData.email,
        otp: this.otp,
        from_name: 'Dream Home'
      };
      emailjs.send('service_jvhehwc', 'template_4awkb0x', emailParams, 'qQPM3s3-KlvBI6JzW')
        .then(() => {
          this._NgxSpinnerService.hide();
          this._ToastrService.success('OTP Sent Successfully!', '', {
            toastClass: 'toastarSuccess'
          })
          this.done = true;
        })
        .catch((error) => {
          this._NgxSpinnerService.hide();
          this._ToastrService.error('Failed', '', {
            toastClass: 'toastarError'
          })
        });
      this.isLoading = false;
    } else {
      this._NgxSpinnerService.hide();
      this.registerFormData.markAllAsTouched();
      this.isLoading = false;
    }
  }

  verifyAndSubmit(): void {
    this._NgxSpinnerService.show();
    if (parseInt(this.enteredOtp) === this.otp) {
      const registerData = {
        firstName: this.registerFormData.value.firstName,
        lastName: this.registerFormData.value.lastName,
        email: this.registerFormData.value.email,
        password: this.registerFormData.value.password,
        contactNumber: this.registerFormData.value.contactNumber,
        role: this.registerFormData.value.role,
        job: this.registerFormData.value.job
      };
      this.isLoading = true;
      this.callingForm = this._RegisteritionService.signUp(registerData).subscribe({
        next: () => {
          this._NgxSpinnerService.hide();
          this._ToastrService.success('Registration Successful!', '', {
            toastClass: 'toastarSuccess'
          })
          this.registerFormData.reset();
          this.emailExists = false;
          this.isLoading = false;
          this._Router.navigate(['/login']);
        },
        error: (error) => {
          this._NgxSpinnerService.hide();
          if (error.status === 400 && error.error?.message === 'User already exists') {
            this.emailExists = true;
            this.done = false;
          } else {
            this._ToastrService.error('Failed', '', {
              toastClass: 'toastarError'
            })
          }
          this.isLoading = false;
        }
      });
    } else {
      this._NgxSpinnerService.hide();
      this._ToastrService.success('Incorrect OTP. Please Try Again !', '', {
        toastClass: 'toastarError'
      })
    }
  }

  getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.registerFormData.controls).forEach((key) => {
      const controlErrors = this.registerFormData.get(key)?.errors;
      if (controlErrors) {
        errors[key] = controlErrors;
      }
    });
    return errors;
  }

  closeModal(): void {
    this.done = false;
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  togglerePasswordVisibility() {
    this.repasswordVisible = !this.repasswordVisible;
  }

  ngOnDestroy(): void {
    if (this.callingForm) {
      this.callingForm?.unsubscribe();
      this.callingForm = null;
    }
    if (this.cancelChangRe) {
      this.cancelChangRe?.unsubscribe();
      this.cancelChangRe = null;
    }
    if (this.cancelChangePa) {
      this.cancelChangePa?.unsubscribe();
      this.cancelChangePa = null
    }
    if (this.cancelTrans) {
      this.cancelTrans?.unsubscribe();
      this.cancelTrans = null;
    }
    if (this.cancelRegister) {
      this.cancelRegister?.unsubscribe();
      this.cancelRegister = null;
    }
  }
}
