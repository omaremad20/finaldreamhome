import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private translate = inject(TranslateService);

  transform(value: string): string {
    let translatedValue = '';
    this.translate.get(value).subscribe((res) => {
      translatedValue = res;
    });
    return translatedValue;
  }
}
