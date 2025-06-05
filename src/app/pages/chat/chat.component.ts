import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, switchMap, timer } from 'rxjs';
import { Chat } from '../../core/interfaces/chats';
import { ChatService } from '../../core/services/chat/chat.service';
import { ChatSearchPipe } from '../../shared/pipes/chatSearch/chat-search.pipe';
import { AuthService } from './../../core/services/Auth/auth.service';
import { UserProfileService } from './../../core/services/UserProfile/user-profile.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  imports: [FormsModule, ChatSearchPipe, TranslatePipe, ReactiveFormsModule, FormsModule, RouterLink]
})

export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  // services
  private translate = inject(TranslateService);
  private _PLATFORM_ID = inject(PLATFORM_ID);
  private _ChatService = inject(ChatService);
  private _UserProfileService = inject(UserProfileService)
  private _AuthService = inject(AuthService);
  private _NgxSpinnerService = inject(NgxSpinnerService);
  private _ActivatedRoute = inject(ActivatedRoute);
  private isInitialLoad: boolean = true;
  private _ToastrService = inject(ToastrService)
  private isErrorToastShown = false;
  private applyLanguageSettings(lang: string) {
    this.translate.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  // variables
  showGoToBottom: boolean = false;
  isSideNavVisible: boolean = false;
  timeInterval: number = 10000;
  lastMessageToGoID!: string;
  theme: string = 'light';
  userIdTargetChat!: string;
  searchText: string = ''
  senderId!: string;
  receiverId!: string;
  messageText: string = '';
  msgTime!: string;
  userRole!: string;
  workerName!: string;
  userEmail!: string;
  currentLang: string = 'en'
  userId!: string;
  currentChat!: string;
  cancelTimeout!: any;
  messages: any[] = [];
  chatIDS: string[] = [];
  AllChats: Chat[] = [];
  messagesSearch: any = [];
  cancelgetChat!: Subscription;
  cancelgetAllChats!: Subscription;
  cancelsendMessage!: Subscription;
  cancelgetUserProfile!: Subscription

  NoChatsYet!:boolean
  // formmessage
  formMessage: FormGroup = new FormGroup({
    message: new FormControl(null, [Validators.required, Validators.pattern(/\S/)])
  })

  // component start
  ngOnInit() {
    this._NgxSpinnerService.show();
    this.isSideNavVisible = true;
    this.senderId = this._AuthService.getUserId()!;
    this.userRole = this._AuthService.getRole()!;
    this._ActivatedRoute.paramMap.subscribe({
      next: (res) => {
        this._NgxSpinnerService.show();
        this.lastMessageToGoID = res.get('messageToGo')!;
        this.receiverId = res.get('userToGo')!;
        this.currentChat = this.receiverId;
        this.isInitialLoad = true; // Reset initial load flag when changing chats
        this.cancelgetChat = timer(0, this.timeInterval).pipe(
          switchMap(() => this._ChatService.getChat(this.senderId, this.receiverId))
        ).subscribe({
          next: (res) => {
            this.messages = res.messages;
            this.msgTime = res.messages.timestamp;

            // Scroll to last message on initial load
            if (this.isInitialLoad) {
              setTimeout(() => {
                this.scrollToBottom();
                this.isInitialLoad = false;
              }, 100);
            }

            this._NgxSpinnerService.hide();
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
                setTimeout(() => {
                  this.isErrorToastShown = false;
                }, 10000);
              }
            }
          }
        });
      }
    });

    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.currentLang = sessionStorage.getItem('language') || 'en';
      this.translate.setDefaultLang(this.currentLang);
      this.translate.use(this.currentLang);
      if (!sessionStorage.getItem('theme')) {
        sessionStorage.setItem('theme', this.theme)
      } else {
        this.theme = sessionStorage.getItem('theme')!;
      }
      if (sessionStorage.getItem('userId')) {
        this.userId = sessionStorage.getItem('userId')!;
        this.cancelgetAllChats = timer(0, this.timeInterval).pipe(switchMap(() => this._ChatService.getAllChats(this.userId))).subscribe({
          next: (res) => {
            this.NoChatsYet = false
            //sort by last date
            this.AllChats = res.chats.sort((a: any, b: any) => {
              return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            });
            // for search feature
            for (let i = 0; i < this.AllChats.length; i++) {
              this.chatIDS.push(this.AllChats[i].user2._id)
            }
            for (let i = 0; i < this.chatIDS.length; i++) {
              if (this.chatIDS[i] === this.receiverId) {
                this.currentChat = this.receiverId;
              }
            }
            for (let i = 0; i < res.chats.length; i++) {
              for (let x = 0; x < res.chats[i].messages.length; x++) {
                if (isPlatformBrowser(this._PLATFORM_ID)) {
                  const currentMessage = res.chats[i].messages[x];
                  const userEmail = sessionStorage.getItem('userLogEmail');
                  const isSender = userEmail !== currentMessage.receiver.email;
                  const messageData = {
                    message: currentMessage.message,
                    email: isSender ? currentMessage.receiver.email : currentMessage.sender.email,
                    userId: isSender ? currentMessage.receiver._id : currentMessage.sender._id,
                    isSender: isSender,
                    timestamp: currentMessage.timestamp,
                    messageId: currentMessage._id
                  };
                  this.messagesSearch.push(messageData);
                }
              }
            }
            this._NgxSpinnerService.hide();
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
                setTimeout(() => {
                  this.isErrorToastShown = false;
                }, 10000);
              }
            }
            this.NoChatsYet = true ;
          }
        })
      }
    }
    this.cancelgetUserProfile = this._UserProfileService.getUserProfile(this.receiverId).subscribe({
      next: (res) => {
        this.userEmail = res.user.email;
        this.workerName = res.user.firstName;
        this._NgxSpinnerService.hide();
      }, error: (err) => {
        this._NgxSpinnerService.hide();
        if (err.error.message === "Failed to fetch") {
          if (!this.isErrorToastShown) {
            this._ToastrService.success('No Internet Connection !', '', {
              toastClass: 'toastarError',
              timeOut: 10000
            });
            this.isErrorToastShown = true;
            setTimeout(() => {
              this.isErrorToastShown = false;
            }, 10000);
          }
        }
      }
    })
    // scroll to last message
    this.cancelTimeout = setTimeout(() => {
      if (isPlatformBrowser(this._PLATFORM_ID) && this.messages.length) {
        document.querySelector('.targetMessage')?.scrollIntoView({
          behavior: 'smooth'
        })
      }
    }, 1000);
  }

  // set true time
  formatMessageTime(timestamp: string): string {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset hours to compare dates only
    const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (messageDateOnly.getTime() === todayOnly.getTime()) {
      // Today - show time
      let hours = messageDate.getHours() + 3; // Adding 3 hours for timezone
      const minutes = messageDate.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? this.translate.instant('notifications.PM') : this.translate.instant('notifications.AM');

      if (hours > 12) {
        hours = hours - 12;
      } else if (hours === 0) {
        hours = 12;
      }

      return `${hours}:${minutes} ${ampm}`;
    } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
      // Yesterday
      return this.translate.instant('notifications.Yesterday');
    } else {
      // Show date
      const day = messageDate.getDate().toString().padStart(2, '0');
      const month = (messageDate.getMonth() + 1).toString().padStart(2, '0');
      const year = messageDate.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  // push a new message
  sendMessage(): void {
    this._NgxSpinnerService.show();
    if (this.formMessage.valid) {
      const formToSend = {
        senderId: this.senderId,
        receiverId: this.receiverId,
        message: this.formMessage.get('message')?.value
      }
      this.cancelsendMessage = this._ChatService.sendMessage(formToSend).subscribe({
        next: (res) => {
          res.chat.messages[res.chat.messages.length - 1].sender = `{"_id" : "${res.chat.messages[res.chat.messages.length - 1].sender}"}`
          res.chat.messages[res.chat.messages.length - 1].sender = JSON.parse(res.chat.messages[res.chat.messages.length - 1].sender)
          this.messages.push(res.chat.messages[res.chat.messages.length - 1])
          this.formMessage.reset();
          // Scroll to bottom after sending message
          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
          this._NgxSpinnerService.hide();
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
              setTimeout(() => {
                this.isErrorToastShown = false;
              }, 10000);
            }
          }
        }
      })
    } else {
      this.formMessage.markAllAsTouched();
      this._NgxSpinnerService.hide();
    }
  }

  // editing textArea
  adjustTextarea(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
  // check on scroll
  @HostListener('scroll', ['$event'])
  onScroll(event: any): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      const element = event.target;
      const atBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 100;
      this.showGoToBottom = !atBottom;
    }
  }

  scrollToBottom(): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      const element = this.messagesContainer?.nativeElement;
      if (element) {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth'
        });
        this.showGoToBottom = false;
      }
    }
  }
  // to open and collapse nav
  toggleSideNav() {
    this.isSideNavVisible = !this.isSideNavVisible;
  }

  //change theme
  toggleTheme() {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-bs-theme', this.theme);
      sessionStorage.setItem('theme', this.theme);
    }
  }

  // change language
  changeLanguage() {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      if (this.currentLang === 'en') {
        this.currentLang = 'ar';
      } else {
        this.currentLang = 'en';
      }
      sessionStorage.setItem('language', this.currentLang);
      this.applyLanguageSettings(this.currentLang);
    }
  }

  // edit theme
  setTheme(selectedTheme: string) {
    this.theme = selectedTheme;
  }
  // component end
  ngOnDestroy(): void {
    this.cancelgetAllChats?.unsubscribe();
    this.cancelgetUserProfile?.unsubscribe();
    this.cancelgetChat?.unsubscribe();
    this.cancelsendMessage?.unsubscribe();
    clearTimeout(this.cancelTimeout)
  }
}
