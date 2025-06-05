import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { IServices } from '../../core/interfaces/iservices';
import { SearchService } from '../../core/services/Search/search.service';
import { FilterServicesPipe } from '../../shared/pipes/FilterServices/filter-services.pipe';
import { AuthService } from '../../core/services/Auth/auth.service';
import { NotFoundComponent } from "../not-found/not-found.component";

@Component({
  selector: 'app-services',
  imports: [RouterLink, TranslatePipe, FilterServicesPipe, NotFoundComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements OnInit , OnDestroy {
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchService.updateSearchText(input.value);
  }

  get filteredServices(): IServices[] {
    const filterPipe = new FilterServicesPipe(this.translate);
    return filterPipe.transform(this.services, this.searchText);
  }

  get isNotFound(): boolean {
    return this.filteredServices.length === 0 && this.searchText.trim() !== '';
  }

  private router = inject(Router);
  isServicesPage(): boolean {
    return this.router.url.endsWith('/services');
  }
  searchText = '';
  callingSearch!: Subscription;
  userRole!:string ;
  currentLang: string = 'en';

  private _AuthService = inject(AuthService) ;
  servicesTS: string[] = [
    'PLUMBING', 'PAINTING', 'ELECTRICITY', 'SATELLITE', 'GYPSUM_BOARD', 'CARPENTRY', 'INTERNET_NETWORKS'
    , 'ALUMETAL', 'CURTAINS', 'AIR_CONDITION', 'HOME_APPLIANCES', 'WOODEN_FLOORS'
  ];
  services: IServices[] = [
    { image: './images/plumbingDiv.webp', job: 'PLUMBING', jobId: 'plumbing' },
    { image: './images/painting.webp', job: 'PAINTING', jobId: 'painting' },
    { image: './images/Electricity.webp', job: 'ELECTRICITY', jobId: 'electricity' },
    { image: './images/sat.webp', job: 'SATELLITE', jobId: 'satellite' },
    { image: './images/gypsumbord.webp', job: 'GYPSUM_BOARD', jobId: 'gypsum-board' },
    { image: './images/Carpentry.webp', job: 'CARPENTRY', jobId: 'carpentry' },
    { image: './images/internet.webp', job: 'INTERNET_NETWORKS', jobId: 'internet-networks' },
    { image: './images/Alumetal.webp', job: 'ALUMETAL', jobId: 'alumetal' },
    { image: './images/curtains.webp', job: 'CURTAINS', jobId: 'curtains' },
    { image: './images/Air-Condition-Unit.webp', job: 'AIR_CONDITION', jobId: 'air-condition' },
    { image: './images/appliens.webp', job: 'HOME_APPLIANCES', jobId: 'home-appliances' },
    { image: './images/woodenFlooring.webp', job: 'WOODEN_FLOORS', jobId: 'wooden-floors' }
  ];
  private translate = inject(TranslateService);
  private _PLATFORM_ID = inject(PLATFORM_ID);

  constructor(private searchService: SearchService) { }

  ngOnInit(): void {
    this.userRole = this._AuthService.getRole() !;
    this.callingSearch = this.searchService.searchText$.subscribe(text => {
      this.searchText = text;
    });
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.currentLang = sessionStorage.getItem('language') || 'en';
      this.translate.setDefaultLang(this.currentLang);
      this.translate.use(this.currentLang);
    }
  }
  // Helper method to normalize Arabic text for search
  private normalizeArabicText(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u064B-\u065F\u0670]/g, '') // Remove Arabic diacritics
      .replace(/[إأآا]/g, 'ا') // Normalize Alef variations
      .replace(/ى/g, 'ي') // Normalize Ya
      .replace(/ة/g, 'ه') // Normalize Ta Marbuta
      .trim();
  }
  ngOnDestroy(): void {
    this.callingSearch?.unsubscribe();
  }
}
