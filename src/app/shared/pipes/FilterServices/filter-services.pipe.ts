import { IServices } from './../../../core/interfaces/iservices';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'filterServices'
})
export class FilterServicesPipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(services: IServices[], searchText: string): IServices[] {
    if (!searchText) {
      return services;
    }

    // Normalize search text
    const normalizedSearchText = this.normalizeText(searchText);

    return services.filter(service => {
      // Get translations for both languages
      const currentLang = this.translate.currentLang;

      // Get Arabic translation
      this.translate.use('ar');
      const arabicTranslation = this.translate.instant(`servicex.${service.job}`);

      // Get English translation
      this.translate.use('en');
      const englishTranslation = this.translate.instant(`servicex.${service.job}`);

      // Restore original language
      this.translate.use(currentLang);

      // Normalize both translations
      const normalizedArabic = this.normalizeText(arabicTranslation);
      const normalizedEnglish = this.normalizeText(englishTranslation);

      // Check if search text matches either translation
      return normalizedArabic.includes(normalizedSearchText) ||
             normalizedEnglish.includes(normalizedSearchText) ||
             this.normalizeText(service.job).includes(normalizedSearchText);
    });
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u064B-\u065F\u0670]/g, '') // Remove Arabic diacritics
      .replace(/[إأآا]/g, 'ا') // Normalize Alef variations
      .replace(/ى/g, 'ي') // Normalize Ya
      .replace(/ة/g, 'ه') // Normalize Ta Marbuta
      .trim();
  }
}
