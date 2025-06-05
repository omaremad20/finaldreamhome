import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { PostsService } from '../../core/services/posts/posts.service';
import { NotFoundComponent } from "../not-found/not-found.component";

@Component({
  selector: 'app-uploadpost',
  imports: [TranslatePipe, FormsModule, ReactiveFormsModule, NotFoundComponent],
  templateUrl: './uploadpost.component.html',
  styleUrl: './uploadpost.component.css'
})
export class UploadpostComponent implements OnInit, OnDestroy {

  private translate = inject(TranslateService);
  private _PLATFORM_ID = inject(PLATFORM_ID);
  private _PostsService = inject(PostsService);
  private _ToastrService = inject(ToastrService);
  private _NgxSpinnerService = inject(NgxSpinnerService);
  private isErrorToastShown = false;
  private _Router = inject(Router);

  currentLang: string = 'en';
  userId!: string;
  userRole!: string;
  isVaild!: boolean;
  selectedFile: File | null = null;
  cancelSetTimeOutTwo: any;
  cancelSetTimeOutOne: any;
  cancelsendImageToCloudinary!: Subscription
  cancelIsIMage!: Subscription
  cancelUploadPost!: Subscription;
  postForm: FormGroup = new FormGroup({
    job: new FormControl(null, [Validators.required]),
    content: new FormControl(null, [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]),
    image: new FormControl(null),
  })
  ngOnInit(): void {
    this.cancelIsIMage = this.postForm.get('image')?.valueChanges.subscribe(() => {
      this.isImage();
    })!;
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.userRole = sessionStorage.getItem('userRole')!;
      this.userId = sessionStorage.getItem('userId')!;
      this.currentLang = sessionStorage.getItem('language') || 'en';
      this.translate.setDefaultLang(this.currentLang);
      this.translate.use(this.currentLang);
    }
  }
  uploadPost(): void {
    this._NgxSpinnerService.show();
    const formCloud = new FormData();
    if (this.selectedFile) {
      formCloud.append('file', this.selectedFile);
      formCloud.append('upload_preset', 'test_cloud');
    }
    this.cancelsendImageToCloudinary = this._PostsService.sendImageToCloudinary(`https://api.cloudinary.com/v1_1/dvuxvcida/image/upload`, formCloud).subscribe({
      next: (res) => {
        if (this.postForm.valid) {
          this.isVaild = true;
          const formToSumbit = {
            job: this.postForm.get('job')?.value,
            content: this.postForm.get('content')?.value,
            image: res.url,
            userId: this.userId
          }
          this.cancelUploadPost = this._PostsService.Createanewpost(formToSumbit).subscribe({
            next: (res) => {
              this._NgxSpinnerService.hide();
              this._ToastrService.success('Post Uploaded Successfully !', '', {
                "toastClass": "toastarSuccess"
              })
              this.postForm.reset();
              this._Router.navigateByUrl('/my-profile')
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
                  this.cancelSetTimeOutOne = setTimeout(() => {
                    this.isErrorToastShown = false;
                  }, 10000);
                }
              } else {
                this._ToastrService.success('Failed To Upload Post', '', {
                  "toastClass": "toastarError"
                })
              }
            }
          })
        } else {
          this.postForm.markAllAsTouched();
          this._NgxSpinnerService.hide();
        }
      }, error: (err) => {
        if (!this.isErrorToastShown) {
          this._ToastrService.success('Failed To Upload Image', '', {
            toastClass: 'toastarError',
            timeOut: 10000
          });
          this.isErrorToastShown = true;
          this.cancelSetTimeOutTwo = setTimeout(() => {
            this.isErrorToastShown = false;
          }, 10000);
        }
      }
    })
  }
  isImage(): void {
    const imageValue = this.postForm.get('image')?.value;
    if (imageValue === '' || imageValue.includes('png') || imageValue.includes('svg') || imageValue.includes('webp') || imageValue.includes('gif') || imageValue.includes('jpeg') || imageValue.includes('jpg')) {
      this.postForm.get('image')?.setErrors(null);
    } else {
      this.postForm.get('image')?.setErrors({ notMatch: true });
    }
  }
  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }
  ngOnDestroy(): void {
    clearTimeout(this.cancelSetTimeOutOne)
    clearTimeout(this.cancelSetTimeOutTwo)
    this.cancelIsIMage?.unsubscribe();
    this.cancelUploadPost?.unsubscribe();
    this.cancelsendImageToCloudinary?.unsubscribe();
  }
}
