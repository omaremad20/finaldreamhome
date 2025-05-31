import { isPlatformBrowser } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, inject, OnChanges, OnDestroy, OnInit, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, switchMap, timer } from 'rxjs';
import { Chat } from '../../core/interfaces/chats';
import { ChatService } from '../../core/services/chat/chat.service';
import { ChatSearchPipe } from '../../shared/pipes/chatSearch/chat-search.pipe';
import { AuthService } from './../../core/services/Auth/auth.service';
import { UserProfileService } from './../../core/services/UserProfile/user-profile.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  imports: [FormsModule, ChatSearchPipe, TranslatePipe, ReactiveFormsModule, FormsModule, RouterLink]
})

export class ChatComponent implements OnInit, OnDestroy {
  // services
  private translate = inject(TranslateService);
  private _PLATFORM_ID = inject(PLATFORM_ID);
  private _ChatService = inject(ChatService);
  private _UserProfileService = inject(UserProfileService)
  private _AuthService = inject(AuthService);
  private _NgxSpinnerService = inject(NgxSpinnerService);
  private _Router = inject(Router);
  private _ActivatedRoute = inject(ActivatedRoute);
  // variables
  lastMessageToGoID!: string;
  timeInterval: number = 10000;
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

  // formmessage
  formMessage: FormGroup = new FormGroup({
    message: new FormControl(null, [Validators.required, Validators.pattern(/\S/)])
  })
  // component start

ngOnInit() {
  this._NgxSpinnerService.show();
  this.senderId = this._AuthService.getUserId()!;
  this.userRole = this._AuthService.getRole()!;

  this._ActivatedRoute.paramMap.subscribe({
    next: (res) => {
      this.lastMessageToGoID = res.get('messageToGo')!;
      this.receiverId = res.get('userToGo')!;

      // حمّل البيانات بعد ما الـ Params توصل
      this.loadChatData();
    }
  });

  if (isPlatformBrowser(this._PLATFORM_ID)) {
    this.currentLang = sessionStorage.getItem('language') || 'en';
    this.translate.setDefaultLang(this.currentLang);
    this.translate.use(this.currentLang);
    if (sessionStorage.getItem('userId')) {
      this.userId = sessionStorage.getItem('userId')!;
      this.cancelgetAllChats = timer(0, this.timeInterval).pipe(
        switchMap(() => this._ChatService.getAllChats(this.userId))
      ).subscribe({
        next: (res) => {
          this.AllChats = res.chats.sort((a: any, b: any) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );

          this.chatIDS = this.AllChats.map(c => c.user2._id);
          this.currentChat = this.chatIDS.includes(this.receiverId) ? this.receiverId : null !;

          this.messagesSearch = [];
          for (let chat of res.chats) {
            for (let msg of chat.messages) {
              if (isPlatformBrowser(this._PLATFORM_ID)) {
                const userEmail = sessionStorage.getItem('userLogEmail');
                const isSender = userEmail !== msg.receiver.email;
                const messageData = {
                  message: msg.message,
                  email: isSender ? msg.receiver.email : msg.sender.email,
                  userId: isSender ? msg.receiver._id : msg.sender._id,
                  isSender: isSender,
                  timestamp: msg.timestamp,
                  messageId: msg._id
                };
                this.messagesSearch.push(messageData);
              }
            }
          }
        },
        error: () => this._NgxSpinnerService.hide()
      });
    }
  }
}

// 👇 تابع تحميل البيانات من هنا بعد ما الباراميترز توصل
loadChatData() {
  this._NgxSpinnerService.show();

  this.cancelgetChat = timer(0, this.timeInterval).pipe(
    switchMap(() => this._ChatService.getChat(this.senderId, this.receiverId))
  ).subscribe({
    next: (res) => {
      this.messages = res.messages;
      this.msgTime = res.messages.timestamp;
      this._NgxSpinnerService.hide();

      setTimeout(() => {
        if (isPlatformBrowser(this._PLATFORM_ID) && this.messages.length) {
          document.querySelector('.targetMessage')?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 1000);
    },
    error: () => this._NgxSpinnerService.hide()
  });

  this.cancelgetUserProfile = this._UserProfileService.getUserProfile(this.receiverId).subscribe({
    next: (res) => {
      this.userEmail = res.user.email;
      this.workerName = res.user.firstName;
      this._NgxSpinnerService.hide();
    },
    error: () => this._NgxSpinnerService.hide()
  });
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

  // editing textArea
  adjustTextarea(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  // navgite to new chat
  divCilcked(userIdTargetChat: any, messageId: any): void {
    this._NgxSpinnerService.show();
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      if (sessionStorage.getItem('userId')) {
        sessionStorage.setItem('messageToScroll', messageId);
        sessionStorage.setItem('userIdTargetChat', userIdTargetChat);
        this._NgxSpinnerService.hide();
      }
    }
  }

  // reload to navgite to target chat
  reload(): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      let target = sessionStorage.getItem('userIdTargetChat')!;
      if (target !== this.currentChat) {
        window.location.reload();
      }
    }
  }

  // navgite to empProfile
  viewProfileCilck(employeeId: string): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      if (sessionStorage.getItem('userIdTargetChat')) {
        employeeId = sessionStorage.getItem('userIdTargetChat')!;
        sessionStorage.setItem('_id', employeeId);
        this._Router.navigate(['/employee-profile']);
      }
    }
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
