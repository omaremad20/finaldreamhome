import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/Auth/auth.service';
import { ChatService } from './../../core/services/chat/chat.service';
import { Chat } from '../../core/interfaces/chats';
import { ChatSearchPipe } from '../../shared/pipes/chatSearch/chat-search.pipe';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { timer, switchMap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-main-chat',
  imports: [FormsModule, TranslatePipe, ChatSearchPipe, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.css'
})
export class MainChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  // services

  private _AuthService = inject(AuthService);
  private _ChatService = inject(ChatService);
  private _NgxSpinnerService = inject(NgxSpinnerService);
  private translate = inject(TranslateService);
  private _PLATFORM_ID = inject(PLATFORM_ID);
  private _ActivatedRoute = inject(ActivatedRoute);
  private isErrorToastShown = false;
  private _ToastrService = inject(ToastrService);

  private applyLanguageSettings(lang: string) {
    this.translate.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  // variables
  timeInterval: number = 10000;
  showGoToBottom: boolean = false;
  isSideNavVisible: boolean = false;
  lastMessageToGoID!: string;
  theme: string = 'light';
  searchText: string = '';
  userEmail!: string;
  currentChat!: string;
  senderId!: string;
  receiverId!: string;
  messageText: string = '';
  userId!: string;
  msgTime!: string;
  customerName!: string;
  userRole: string = '';
  currentLang: string = 'en';
  cancelTimeout: any;
  messages: any[] = [];
  chatIDS: string[] = [];
  AllChats: Chat[] = [];
  messagesSearch: any = [];
  callingApi!: Subscription

  // messageform
  formMessage: FormGroup = new FormGroup({
    message: new FormControl(null, [Validators.required, Validators.pattern(/\S/)])
  })

  // componentStart
  ngOnInit(): void {
    this.isSideNavVisible = true;
    this._NgxSpinnerService.show();
    this._ActivatedRoute.paramMap.subscribe({
      next: (res) => {
        this._NgxSpinnerService.show();
        this.lastMessageToGoID = res.get('messageToGo')!;
        this.receiverId = res.get('userToGo')!;
        this.currentChat = this.receiverId;
        this.callingApi = timer(0, this.timeInterval).pipe(switchMap(() => this._ChatService.getChat(this.senderId, this.receiverId))).subscribe({
          next: (res) => {
            this.customerName = res.messages[0].sender.firstName + " " + res.messages[0].sender.lastName;
            this.userEmail = res.messages[0].sender.email;
            this.messages = res.messages;
            this.msgTime = res.messages.timestamp;
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
      }
    })
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.currentLang = sessionStorage.getItem('language') || 'en';
      this.userRole = this._AuthService.getRole()!;
      this.translate.setDefaultLang(this.currentLang);
      if (!sessionStorage.getItem('theme')) {
        sessionStorage.setItem('theme', this.theme)
      } else {
        this.theme = sessionStorage.getItem('theme')!;
      }
      this.translate.use(this.currentLang);
    }
    this.senderId = this._AuthService.getUserId()!;
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.userId = sessionStorage.getItem('userId')!;
      this._ChatService.getAllChats(this.userId).subscribe({
        next: (res) => {
          //sort by last date
          this.AllChats = res.chats.sort((a: any, b: any) => {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          });
          for (let i = 0; i < this.AllChats.length; i++) {
            this.chatIDS.push(this.AllChats[i].user1._id)
          }
          for (let i = 0; i < this.chatIDS.length; i++) {
            if (this.chatIDS[i] === this.receiverId) {
              this.currentChat = this.receiverId;
            }
          }
          // neeeeeeew
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
        }
      })
    }
    this.cancelTimeout = setTimeout(() => {
      if (isPlatformBrowser(this._PLATFORM_ID) && this.messages.length) {
        document.querySelector('.targetMessage')?.scrollIntoView({
          behavior: 'smooth'
        })
      }
    }, 1000);
  }

  sendMessage(): void {
    this._NgxSpinnerService.show();
    if (this.formMessage.valid) {
      const formToSend = {
        senderId: this.senderId,
        receiverId: this.receiverId,
        message: this.formMessage.get('message')?.value
      }
      this._ChatService.sendMessage(formToSend).subscribe({
        next: (res) => {
          res.chat.messages[res.chat.messages.length - 1].sender = `{"_id" : "${res.chat.messages[res.chat.messages.length - 1].sender}"}`
          res.chat.messages[res.chat.messages.length - 1].sender = JSON.parse(res.chat.messages[res.chat.messages.length - 1].sender)
          this.messages.push(res.chat.messages[res.chat.messages.length - 1])
          this.formMessage.reset();
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

  adjustTextarea(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;

  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      const element = event.target;
      const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100;
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
      }
    }
  }

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

  toggleSideNav() {
    this.isSideNavVisible = !this.isSideNavVisible;
  }
  toggleTheme() {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-bs-theme', this.theme);
      sessionStorage.setItem('theme', this.theme);
    }
  }
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
  setTheme(selectedTheme: string) {
    this.theme = selectedTheme;
  }

  // componentEnd
  ngOnDestroy(): void {
    this.callingApi?.unsubscribe();
    clearTimeout(this.cancelTimeout)
  }
}
