import { SearchService } from './../../core/services/Search/search.service';
import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, inject, Input, OnInit, PLATFORM_ID, ViewChild, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/Auth/auth.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [RouterLink, RouterLinkActive, TranslatePipe, NgClass]
})
export class NavbarComponent implements OnInit {


  @ViewChild('ul') ul!:ElementRef ;
  private _PLATFORM_ID = inject(PLATFORM_ID);

  theme: string = 'light';
  currentLang: string = 'en';

  constructor(private translate: TranslateService , public authService: AuthService , private router:Router , private searchService:SearchService) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  ngOnInit() {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.theme = sessionStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-bs-theme', this.theme);
      this.currentLang = sessionStorage.getItem('language') || 'en';
      this.translate.setDefaultLang(this.currentLang);
      this.translate.use(this.currentLang);
    }
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
        if (this.ul?.nativeElement) {
          this.ul.nativeElement.classList.replace('me-auto', 'ms-auto');
        }
      } else {
        this.currentLang = 'en';
        if (this.ul?.nativeElement) {
          this.ul.nativeElement.classList.replace('ms-auto', 'me-auto');
        }
      }
      sessionStorage.setItem('language', this.currentLang);
      this.applyLanguageSettings(this.currentLang);
    }
  }

  private applyLanguageSettings(lang: string) {

    this.translate.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  }

  setTheme(selectedTheme: string) {
    this.theme = selectedTheme;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 0) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }

}
