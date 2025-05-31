import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchSubject = new BehaviorSubject<string>('');
  searchText$ = this.searchSubject.asObservable();

  updateSearchText(text: string) {
    // Normalize Arabic text by removing diacritics and special characters
    const normalizedText = this.normalizeArabicText(text);
    this.searchSubject.next(normalizedText);
  }

  private normalizeArabicText(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u064B-\u065F\u0670]/g, '') // Remove Arabic diacritics
      .replace(/[إأآا]/g, 'ا') // Normalize Alef variations
      .replace(/ى/g, 'ي') // Normalize Ya
      .replace(/ة/g, 'ه') // Normalize Ta Marbuta
      .trim();
  }
}
