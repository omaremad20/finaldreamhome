import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, OnDestroy, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CarouselModule, OwlOptions, CarouselComponent } from 'ngx-owl-carousel-o';
import { Subscription } from 'rxjs';

declare global {
  interface Window {
    owlCarousel: any;
  }
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CarouselModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnDestroy {
  @ViewChild('owlCarousel') owlCarousel!: CarouselComponent;
  currentLang: string = 'en';
  private translate = inject(TranslateService);
  private _PLATFORM_ID = inject(PLATFORM_ID);
  private langChangeSubscription: Subscription;

  constructor() {
    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      this.currentLang = this.translate.currentLang;
      this.updateCarouselDirection();
      // Reinitialize the carousel
      setTimeout(() => {
        if (this.owlCarousel) {
          const carousel = (this.owlCarousel as any).carousel;
          if (carousel) {
            carousel.refresh();
            carousel.reinit();
          }
        }
      }, 0);
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.currentLang = sessionStorage.getItem('language') || 'en';
      this.translate.setDefaultLang(this.currentLang);
      this.translate.use(this.currentLang);
      this.updateCarouselDirection();
    }
  }

  updateCarouselDirection() {
    this.customOptions.rtl = this.currentLang === 'ar';
  }

  customOptions: OwlOptions = {
    autoplay: true,
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 100,
    navText: ['', ''],
    rtl: false,
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 1
      },
      740: {
        items: 1
      },
      940: {
        items: 1
      }
    },
    nav: false
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }
}

