import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private PLATFORM_ID = inject(PLATFORM_ID);
  private role: string | null = null;
  private userId: string | null = null;
  constructor() {
    if (isPlatformBrowser(this.PLATFORM_ID)) {
      this.role = sessionStorage.getItem('userRole');
      this.userId = sessionStorage.getItem('userId');
    }
  }
  login(userId: string, userRole: string): void {
    if (isPlatformBrowser(this.PLATFORM_ID)) {
      sessionStorage.setItem('userId', userId);
      sessionStorage.setItem('userRole', userRole);
      this.role = userRole;
    }
  }
  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.PLATFORM_ID)) {
      return !!sessionStorage.getItem('userId');
    }
    return false;
  }
  logout(): void {
    if (isPlatformBrowser(this.PLATFORM_ID)) {
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('jobId');
      sessionStorage.removeItem('_id');
      sessionStorage.removeItem('userIdTargetChat');
      sessionStorage.removeItem('custIdTarget');
      sessionStorage.removeItem('userLogEmail');
      sessionStorage.removeItem('jobTitle');
      sessionStorage.removeItem('postId');
      sessionStorage.removeItem('userNameLogin');
      sessionStorage.removeItem('commentValue');
      sessionStorage.removeItem('commentTarget');
      sessionStorage.removeItem('messageToScroll');
      // sessionStorage.clear()
      this.role = null;
      this.userId = null;
    }
  }
  getRole(): string | null {
    if (isPlatformBrowser(this.PLATFORM_ID)) {
      return this.role || sessionStorage.getItem('userRole');
    }
    return null;
  }
  getUserId(): string | null {
    if (isPlatformBrowser(this.PLATFORM_ID)) {
      return this.userId || sessionStorage.getItem('userId');
    }
    return null;
  }
}
