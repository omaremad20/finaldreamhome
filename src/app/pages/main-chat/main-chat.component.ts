import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/Auth/auth.service';
import { UserProfileService } from '../../core/services/UserProfile/user-profile.service';
import { ChatService } from './../../core/services/chat/chat.service';
import { Chat } from '../../core/interfaces/chats';
import { ChatSearchPipe } from '../../shared/pipes/chatSearch/chat-search.pipe';
import { Router } from '@angular/router';
import { timer, switchMap } from 'rxjs';
@Component({
  selector: 'app-main-chat',
  imports: [FormsModule, TranslatePipe, ChatSearchPipe, ReactiveFormsModule, FormsModule],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.css'
})
export class MainChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  // services
  private _AuthService = inject(AuthService);
  private _ChatService = inject(ChatService);
  private _UserProfileService = inject(UserProfileService);
  private _NgxSpinnerService = inject(NgxSpinnerService);
  private translate = inject(TranslateService);
  private _PLATFORM_ID = inject(PLATFORM_ID);
  private _Router = inject(Router)
  // variables
  lastMessageToGoID!: string;
  timeInterval: number = 10000;
  searchText: string = '';
  userEmail!: string;
  currentChat!: string;
  senderId!: string;
  receiverId!: string;
  messageText: string = '';
  userId!: string;
  msgTime!: string;
  customerName!: string;
  currentLang: string = 'en';
  isLoading: boolean = true;
  cancelTimeout: any
  messages: any[] = [];
  chatIDS: string[] = [];
  AllChats: Chat[] = [];
  messagesSearch: any = [];
  callingApi!: Subscription
  cancelgetAllChats!: Subscription;
  showGoToBottom: boolean = false;
  // messageform
  formMessage: FormGroup = new FormGroup({
    message: new FormControl(null, [Validators.required, Validators.pattern(/\S/)])
  })

  // componentStart
  ngOnInit(): void {
    this._NgxSpinnerService.show();
    this.isLoading = true;
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.currentLang = sessionStorage.getItem('language') || 'en';
      this.translate.setDefaultLang(this.currentLang);
      this.translate.use(this.currentLang);
    }
    this.senderId = this._AuthService.getUserId()!;
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      if (sessionStorage.getItem('custIdTarget')) {
        this.lastMessageToGoID = sessionStorage.getItem('messageToScroll')!;
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
          }
        })
        this.receiverId = sessionStorage.getItem('custIdTarget')!;
        this.callingApi = timer(0, this.timeInterval).pipe(switchMap(() => this._ChatService.getChat(this.senderId, this.receiverId))).subscribe({
          next: (res) => {
            this.customerName = res.messages[0].sender.firstName + " " + res.messages[0].sender.lastName;
            this.userEmail = res.messages[0].sender.email;
            this.messages = res.messages;
            this.msgTime = res.messages.timestamp;

            this._NgxSpinnerService.hide();
          }, error: (err) => {
            this._NgxSpinnerService.hide();
          }
        })
      }
    }
      this.cancelTimeout = setTimeout(() => {
        if (isPlatformBrowser(this._PLATFORM_ID) && this.messages.length) {
          console.log(document.querySelector('.targetMessage'));

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
        }
      })
    } else {
      this.formMessage.markAllAsTouched();
      this._NgxSpinnerService.hide();
    }
  }

  divCilcked(userIdTargetChat: any, messageId: any): void {
    this._NgxSpinnerService.show();
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      if (sessionStorage.getItem('userId')) {
        sessionStorage.setItem('custIdTarget', userIdTargetChat);
        sessionStorage.setItem('messageToScroll', messageId);
        this._NgxSpinnerService.hide();
      }
    }
  }

  adjustTextarea(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  reload(): void {
    if(isPlatformBrowser(this._PLATFORM_ID)) {
      let target = sessionStorage.getItem('userIdTargetChat') ! ;
      if(target !== this.currentChat) {
        window.location.reload();
      }
    }
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
    const msgDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) {
      // Today - show time
      const hour = +timestamp.split('T')[1].slice(0, 2);
      const minute = timestamp.split('T')[1].slice(3, 5);
      const adjustedHour = hour + 3;

      if (adjustedHour >= 24) {
        return `${((adjustedHour % 24 === 0 ? 12 : adjustedHour % 24))}:${minute}${this.translate.instant('notifications.AM')}`;
      } else if (adjustedHour === 12) {
        return `12:${minute}${this.translate.instant('notifications.PM')}`;
      } else if (adjustedHour < 12) {
        return `${adjustedHour}:${minute}${this.translate.instant('notifications.AM')}`;
      } else {
        return `${adjustedHour - 12}:${minute}${this.translate.instant('notifications.PM')}`;
      }
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      // Yesterday
      return this.translate.instant('chatMessages.yesterday');
    } else {
      // Other date - show full date
      const [year, month, day] = timestamp.split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    }
  }

  // componentEnd
  ngOnDestroy(): void {
    this.callingApi?.unsubscribe();
    clearTimeout(this.cancelTimeout)
  }
}
