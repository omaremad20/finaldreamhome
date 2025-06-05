import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Chat } from '../../core/interfaces/chats';
import { ChatService } from '../../core/services/chat/chat.service';
import { NotficationsService } from '../../core/services/notfications/notfications.service';
import { ReviewsService } from '../../core/services/reviews/reviews.service';
import { AuthService } from './../../core/services/Auth/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ChatSearchPipe } from '../../shared/pipes/chatSearch/chat-search.pipe';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
  imports: [RouterLink, TranslatePipe, ChatSearchPipe, FormsModule]
})
export class MessagesComponent implements OnInit, OnDestroy , AfterViewInit{
  private _ChatService = inject(ChatService);
  private _AuthService = inject(AuthService);
  private _ReviewsService = inject(ReviewsService);
  private __NotficationsService = inject(NotficationsService);
  private translate = inject(TranslateService);
  private _PLATFORM_ID = inject(PLATFORM_ID);
  private _NgxSpinnerService = inject(NgxSpinnerService);
  private _ToastrService = inject(ToastrService);

  hasPreviousSent: boolean = true;
  showNoChatsDiv = false;
  isLoading = true;
  hasPreviousRequest = false;
  searchText: string = ''
  currentChat!: string;
  empName!: string;
  receiverId!: string;
  reviewId!: string;
  custName!: string;
  userId!: string;
  userRole!: string;
  userDead!: string;
  userTarget!: string;
  currentLang: string = 'en';
  customers: string[] = []
  customersNO: string[] = []
  AllChats: Chat[] = [];
  callingApi: Subscription | null = null;
  chatIDS: string[] = [];
  messagesSearch: any = [];

  ngOnInit(): void {
    this._NgxSpinnerService.show();
    this.isLoading = true;
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.currentLang = sessionStorage.getItem('language') || 'en';
      this.translate.setDefaultLang(this.currentLang);
      this.translate.use(this.currentLang);
    }
    this.userId = this._AuthService.getUserId()!;
    this.userRole = this._AuthService.getRole()!;
    this.callingApi = this._ChatService.getAllChats(this.userId).subscribe({
      next: (res) => {
        this.isLoading = false;
        for (let i = 0; i < res.chats.length; i++) {
          this.userDead = res.chats[i].user1._id;
        }
        //sort by last date
        this.AllChats = res.chats.sort((a: any, b: any) => {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
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
        if (this.AllChats.length === 0) {
          this.showNoChatsDiv = true;
        } else {
        }
        this._NgxSpinnerService.hide();
      },
      error: (err) => {
        this.isLoading = false;
        this._NgxSpinnerService.hide();
        if (err?.error?.message === 'No chats found for this user') {
          this.showNoChatsDiv = true;
        }
      }
    });
    this._ReviewsService.getAllReviewsForUser(this.userId).subscribe({
      next: (res) => {
        for (let i = 0; i < res.length; i++) {
          this.userTarget = res[i].customerId;
          this.customersNO.push(this.userTarget);
        }
        this._NgxSpinnerService.hide();
      },
      error: (err) => {
        this._NgxSpinnerService.hide();
      }
    })
  }
  sendReviewRequest(customerId: string) {
    this._NgxSpinnerService.show();
    const senderId = this.userId;
    this._ReviewsService.sendRequestReview(senderId, customerId).subscribe({
      next: (response) => {
        this.reviewId = response?.review?._id;
        this.custName = response.review.customer.name;
        this.empName = response.review.employee.name;
        this.customersNO.push(customerId);
        const messageForEmp = `{"reviewId" : "${this.reviewId}" , "customerName" : "${this.custName}"}`
        this.__NotficationsService.addNotification(this.userId, messageForEmp).subscribe({
          next: (res) => {
          }, error: (err) => {
          }
        })
        const message = `{"reviewId" : "${this.reviewId}" , "employeeName" : "${this.empName}"}`;
        this.__NotficationsService.addNotification(customerId, message).subscribe({
          next: (res) => {
          },
          error: (err) => {
          }
        });
        this._ToastrService.success('Request Review Sent Successfully !', '', {
          toastClass: 'toastarSuccess'
        })
        this._NgxSpinnerService.hide();
      },
      error: (err) => {
        this._NgxSpinnerService.hide();
      }
    });
  }
  ngAfterViewInit(): void {
    if(isPlatformBrowser(this._PLATFORM_ID)) {
      window.scrollTo(-10 , 0)
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
      const hour = +timestamp.split('').slice(11, 13).join('');
      const minute = timestamp.split('').slice(14, 16).join('');
      const adjustedHour = hour + 3;
      let displayHour: number;
      let ampm: string;

      if (adjustedHour >= 24) {
        displayHour = adjustedHour % 24 === 0 ? 12 : adjustedHour % 24;
        ampm = this.translate.instant('notifications.AM');
      } else if (adjustedHour === 12) {
        displayHour = 12;
        ampm = this.translate.instant('notifications.PM');
      } else if (adjustedHour < 12) {
        displayHour = adjustedHour;
        ampm = this.translate.instant('notifications.AM');
      } else {
        displayHour = adjustedHour - 12;
        ampm = this.translate.instant('notifications.PM');
      }

      return `${displayHour}:${minute} ${ampm}`;
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

  hasSearchResults(): boolean {
    return this.messagesSearch.some((data: { message: string }) => data.message.includes(this.searchText));
  }

  ngOnDestroy(): void {
    if (this.callingApi) {
      this.callingApi.unsubscribe();
      this.callingApi = null;
    }
  }
}
