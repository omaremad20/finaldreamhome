import { Component, ElementRef, inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from "./layouts/footer/footer.component";
import { NavbarComponent } from "./layouts/navbar/navbar.component";
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './core/services/Auth/auth.service';
import { NgxSpinnerComponent } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent , NgxSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  isopenChat:boolean = false;
  hideFooter = false;
  hasAccess:boolean = false;

  title = 'dreamhome';
  currentLang!:string ;
  public authService = inject(AuthService)
  private _PLATFORM_ID = inject(PLATFORM_ID)
  @ViewChild('textarea') textarea!:ElementRef ;
  constructor(private _TranslateService: TranslateService , private router: Router) {
    if(isPlatformBrowser(this._PLATFORM_ID)) {
      const savedLang = sessionStorage.getItem('lang') || 'en';
      this._TranslateService.use(savedLang);
    }
        this.router.events.subscribe(() => {
      const currentUrl = this.router.url;
      this.hideFooter = currentUrl.startsWith('/chat') || currentUrl.startsWith('/main-chat')  || currentUrl.startsWith('/comments');
    });
  }
  openChat():void {
    this.isopenChat = !this.isopenChat ;
  }
  ngOnInit(): void {
    this.getAccessAi();
  }
  getAccessAi():void {
    if(isPlatformBrowser(this._PLATFORM_ID)) {
      if(sessionStorage.getItem('userId') && sessionStorage.getItem('userRole') === "customer" && this.hideFooter) {
        this.hasAccess = true
      }else {
        this.hasAccess = false
      }
    }
  }
}


