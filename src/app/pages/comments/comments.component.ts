// imports
import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { DocComment } from '../../core/interfaces/comments';
import { Doc } from '../../core/interfaces/post';
import { NotficationsService } from '../../core/services/notfications/notfications.service';
import { PostsService } from '../../core/services/posts/posts.service';
import { UserProfileService } from '../../core/services/UserProfile/user-profile.service';
import { TranslatePipe } from '../../shared/pipes/translateservice/translate-service.pipe';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-comments',
  imports: [ReactiveFormsModule, FormsModule, TranslatePipe],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css'
})

export class CommentsComponent implements OnInit, OnDestroy {
  // domelements
  @ViewChild('textAreaShadow') textAreaShadow!: ElementRef;
  @ViewChild('parent') section!: ElementRef
  @ViewChild('textAreaShadowTwo') textAreaShadowTwo!: ElementRef;
  @ViewChild('modalDelete') modalDelete!: ElementRef
  @ViewChild('editModal') editModal!: ElementRef
  @ViewChild('editModalTwo') editModalTwo!: ElementRef;
  @ViewChild('mostRelevant') mostRelevant!: ElementRef;

  //services
  private _ToastrService = inject(ToastrService);
  private _PLATFORM_ID = inject(PLATFORM_ID);
  private _NgxSpinnerService = inject(NgxSpinnerService);
  private _PostsService = inject(PostsService);
  private _UserProfileService = inject(UserProfileService);
  private translate = inject(TranslateService);
  private _NotficationsService = inject(NotficationsService);
  private _Router = inject(Router);
  private _ActivatedRoute = inject(ActivatedRoute)
  // variables
  postId!: string;
  currentLang: string = 'en';
  userId!: string;
  userNameTwo!: string
  userIdMakePost!: string;
  userNameMakeComment!: string;
  userNameMakePost!: string;
  userIdTwo!: string;
  showButton: boolean = false;
  disableButton: boolean = true;
  jobTitle!: string;
  comments!: DocComment[];
  post!: Doc;
  cancelCreateanewcomment!: Subscription;
  cancelGetsinglepostbyID!: Subscription;
  cancelGetcommentsforapost!: Subscription;
  cancelUpdatecomment!: Subscription;
  cancelDeletecomment!: Subscription;
  cancelgetUserProfile!: Subscription;
  cancelSetTimeOut!: any
  commentTarget: string = '';
  randomArr: any[] = []
  // forms
  formComment: FormGroup = new FormGroup({
    comment: new FormControl(null, [Validators.maxLength(1000), Validators.required, Validators.pattern(/\S/)])
  })
  formUpdated: FormGroup = new FormGroup({
    comment: new FormControl(isPlatformBrowser(this._PLATFORM_ID) ? sessionStorage.getItem('commentValue') || null : null, [Validators.maxLength(1000), Validators.required, Validators.pattern(/\S/)])
  })
  showAllCommentsText(): void {
    this.mostRelevant.nativeElement.classList.remove('position-relative', 'z-3');
    this.mostRelevant.nativeElement.nextElementSibling.classList.remove('top-0', 'z-0', 'opacity-0', 'position-absolute');

    console.log(this.mostRelevant.nativeElement.nextElementSibling);
  }
  removeMostRelevantText(): void {
    this.mostRelevant.nativeElement.classList.add('opacity-0')
    this.mostRelevant.nativeElement.nextElementSibling.classList.add('top-0', 'position-absolute', 'mb-3');
    this.mostRelevant.nativeElement.nextElementSibling.classList.remove('bg-white');

  }
    // componentstart
    ngOnInit(): void {
      this._ActivatedRoute.paramMap.subscribe({
        next : (res) => {
          this.postId = res.get('postId') ! ;
        }
      })
      if(isPlatformBrowser(this._PLATFORM_ID)) {
      this.currentLang = sessionStorage.getItem('language') || 'en';
      this.translate.setDefaultLang(this.currentLang);
      this.translate.use(this.currentLang);
      if (sessionStorage.getItem('userId')) {
        this.jobTitle = sessionStorage.getItem('jobTitle')!;
        this.userId = sessionStorage.getItem('userId')!;
        this.commentTarget = sessionStorage.getItem('commentTarget')!;
        this.userNameMakeComment = sessionStorage.getItem('userNameLogin')!;
      }
    }
    this.cancelSetTimeOut = setTimeout(() => {
      if (isPlatformBrowser(this._PLATFORM_ID)) {
        document.querySelector('.targetComment')?.scrollIntoView({
          behavior: "smooth"
        })
      }
    }, 1000);
    setTimeout(() => {
      if (isPlatformBrowser(this._PLATFORM_ID)) {
        sessionStorage.removeItem('commentTarget');
        this.commentTarget = ''
      }
    }, 3000)
    this._NgxSpinnerService.show();
    if (this.userId !== undefined && this.postId !== undefined) {
      this.cancelGetsinglepostbyID = this._PostsService.GetsinglepostbyID(this.postId).subscribe({
        next: (res) => {
          this.post = res.data
          this.userIdMakePost = this.post.userId;
          this._NotficationsService.getUserNotifications(this.userIdMakePost).subscribe({
            next: (res) => {
              console.log(res.notifications);

              this.randomArr = res.notifications
              for (let i = 0; i < this.randomArr.length; i++) {
                this.randomArr[i].message = JSON.parse(this.randomArr[i].message)
              }
              console.log(this.randomArr);
            }
          })
          this.cancelgetUserProfile = this._UserProfileService.getUserProfile(this.post.userId).subscribe({
            next: (res) => {
              console.log(res);

              this.userNameMakePost = res.user.firstName + " " + res.user.lastName
              this._NgxSpinnerService.hide();
            }, error: (err) => {
              this._NgxSpinnerService.hide();
            }
          })
          this._NgxSpinnerService.hide();
        },
        error: (err) => {
          this._NgxSpinnerService.hide();
        }
      })
      this.cancelGetcommentsforapost = this._PostsService.Getcommentsforapost(this.postId).subscribe({
        next: (res) => {
          this._NgxSpinnerService.hide();
          this.comments = res.data.docs;
          console.log(this.comments);

        },
        error: (err) => {
          this._NgxSpinnerService.hide();
        }
      })
    }
  }
  // deletepost
  deletePost(postId: string): void {
    this._NgxSpinnerService.show();
    /*
    1 - get comments for a single post and make limit unlimitied (to get all comments)
    *htgbly kol el ids bta3t el comments bta3t el post da w to7taha f array*
    2 - get all user notfications with userId Post
    3 - filter notfications with condition (lw l2et key esmo notifications.message.comment)
    4 - return this array in a new clean array
    5 - hnmsk el array el clean de
        1 - get key notifications.message.postId
        2 - htmsk kol notfication feha el postId ely hytms7 w t3ml call l func delete notfication
    */

    /*
    odamk 7alen
    -----------
    1 - get single post by id from session storage if en useridmakepost != userid wlw reg3 b error nrg3o 3la browseprojects (mo5tara)
    el mo5atara hena enk btt3md ala error f shoghlkk

    */

    //first delete notfications before delete post
    this._NotficationsService.getUserNotifications(this.userId).subscribe({
      next: (res) => {
        for (let i = 0; i < res.notifications.length; i++) {
          res.notifications[i].message = JSON.parse(res.notifications[i].message);
          if (res.notifications[i].message.postId === postId) {
            this._NotficationsService.deleteNotification(res.notifications[i]._id).subscribe({
              next: (res) => {
                console.log(res);
              }, error: (err) => {
                console.log(err);
              }
            })
          }
        }
      }, error: (err) => {
        this._NgxSpinnerService.hide();
      }
    })
    // case 1
    // en el user momken ykon gowa lpost
    // case 2 momken ykon fl component bta3 browse projects
    this._PostsService.Deletepostanditscomments(postId).subscribe({
      next: (res) => {
        console.log(res);
        this._ToastrService.success('Post Deleted Successfully !', '', {
          toastClass: 'toastarSuccess'
        })
        this.closeModalManually('exampleModalToggle' + postId)
        this._NgxSpinnerService.hide();
        this._Router.navigateByUrl('/my-profile');
        // if(userro)
      },
      error: (err) => {
        console.log(err);
        this._NgxSpinnerService.hide();
      }
    })
    // this._PostsService.posts.next()
  }
  // pushcomment
  postComment(): void {
    this._NgxSpinnerService.show();
    if (this.formComment.valid) {
      this.showButton = true;
      const formTosumbit = {
        comment: this.formComment.get('comment')?.value,
        postId: this.postId,
        userId: this.userId
      }
      this.cancelCreateanewcomment = this._PostsService.Createanewcomment(formTosumbit).subscribe({
        next: (res) => {
          console.log(res);
          this._NgxSpinnerService.hide();
          this.comments.unshift(res.data);
          this.userIdTwo = res.data.userId
          console.log(this.userIdTwo);

          res.data.userId = `{"_id" : "${res.data.userId}"}`
          res.data.userId = JSON.parse(res.data.userId);
          this.formComment.reset();
          if (this.userIdMakePost !== this.userId) {
            this._NotficationsService.addNotification(this.userIdMakePost, `{"comment" : "${res.data.comment}" ,"commentId" : "${res.data._id}" ,"postId" : "${this.postId}" ,"userMakeComment" : "${this.userNameMakeComment}" ,"jobTitle" : "${this.jobTitle}","userIdMakeComment" : "${this.userIdTwo}"}
              `).subscribe({
              next: (res) => {
              },
              error: (err) => {
              }
            })
          }

        },

        error: (err) => {
          this._NgxSpinnerService.hide();
        }
      })
    } else {
      this.showButton = false;
      this._NgxSpinnerService.hide();
      this.formComment.markAllAsTouched()
    }
  }
  // geterrors in textarea
  value(): void {
    const comment = this.formComment.get('comment')?.value.split('')
    if (comment.length > 1000) {
      this.showButton = false;
      this.textAreaShadow.nativeElement.classList.replace('form-control', 'border-red')
      this.formComment.get('comment')?.setValue(comment.slice(0, 1001).join(''));
    } else {
      this.showButton = true;
      this.textAreaShadow.nativeElement.classList.replace('border-red', 'form-control')
    }
  }
  // editing textareaWhenwrite
  adjustTextarea(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    textarea.nextElementSibling?.classList.add('align-self-end');
    textarea.nextElementSibling?.classList.add('mb-2');
  }
  // push comment to textarea(edit comment)
  commentValue(comment: string): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      if (sessionStorage.getItem('postId')) {
        sessionStorage.setItem('commentValue', comment)!;
        this.formUpdated.patchValue({
          comment: comment
        })
      }
    }
  }
  // disable button save changes
  disableChangeCommentButton(): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      if (sessionStorage.getItem('postId')) {
        if (sessionStorage.getItem('commentValue') === this.formUpdated.get('comment')?.value || this.formUpdated.get('comment')?.value.trim() === sessionStorage.getItem('commentValue') || this.formUpdated.get('comment')?.value.split('').length > 1000 || !/\S/.test(this.formUpdated.get('comment')?.value)) {
          this.disableButton = true;
        } else {
          this.disableButton = false;
        }
        if (this.formUpdated.get('comment')?.value.split('').length > 1000) {
          this.textAreaShadowTwo.nativeElement.classList.replace('form-control', 'border-red')
          this.formUpdated.get('comment')?.setValue(this.formUpdated.get('comment')?.value.split('').slice(0, 1000).join(''))
        } else {
          this.textAreaShadowTwo.nativeElement.classList.replace('border-red', 'form-control')
        }
      }
    }
  }
  // updatecomment
  updateComment(commentId: string): void {
    this._NgxSpinnerService.show();
    if (this.formUpdated.valid) {
      this.cancelUpdatecomment = this._PostsService.Updatecomment(commentId, this.formUpdated.value).subscribe({
        next: (res) => {
          this._NgxSpinnerService.hide();
          for (let i = 0; i < this.comments.length; i++) {
            if (this.comments[i]._id === res.data._id) {
              this.comments[i].comment = res.data.comment;
            }
          }
          this.closeModalManually('formEdit' + commentId);
        }, error: (err) => {
        }
      })
    } else {
      this._NgxSpinnerService.hide();
      this.formUpdated.markAllAsTouched();
    }
  }
  // deletecomment
  deleteComment(commentId: string, index: any): void {
    this._NgxSpinnerService.show();
    // this._NotficationsService.getUserNotifications(this.userIdMakePost).subscribe({
    //   next: (res) => {
    //     console.log(res);
    //   }
    // })
    this.cancelDeletecomment = this._PostsService.Deletecomment(commentId).subscribe({
      next: (res) => {
        this.comments.splice(index, 1);
        this._NgxSpinnerService.hide();
        this.closeModalManually('exampleModalToggle' + commentId);
        for (let i = 0; i < this.randomArr.length; i++) {
          if (commentId === this.randomArr[i].message.commentId) {
            this._NotficationsService.deleteNotification(this.randomArr[i]._id).subscribe({
              next: (res) => {
                console.log(res);
              }, error: (err) => {
                console.log(err);
              }
            })
          }
        }
      },
      error: (err) => {
        this._NgxSpinnerService.hide();
      }
    })
  }

  // closemodal
  closeModalManually(modalId: string): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.replace('show', 'hide');
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');
        modal.style.display = 'none';
      }

      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
    }
  }
  // component destoried
  ngOnDestroy(): void {
    this.cancelgetUserProfile?.unsubscribe()
    this.cancelUpdatecomment?.unsubscribe()
    this.cancelDeletecomment?.unsubscribe()
    this.cancelCreateanewcomment?.unsubscribe()
    this.cancelGetcommentsforapost?.unsubscribe()
    this.cancelgetUserProfile?.unsubscribe()
    this.cancelGetsinglepostbyID?.unsubscribe()
    clearTimeout(this.cancelSetTimeOut)
  }
}
