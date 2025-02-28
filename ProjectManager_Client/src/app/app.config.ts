import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateMomentParserFormatter } from './shared/date.formatter';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: NgbDateParserFormatter,
      useFactory: () => {
        return new NgbDateMomentParserFormatter('DD/MM/YYYY');
      },
    },
    provideHttpClient(),
    provideAnimations(), // required animations providers
    provideToastr(), // Toastr providers
  ],
};
