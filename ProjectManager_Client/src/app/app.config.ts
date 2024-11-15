import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateMomentParserFormatter } from './shared/date.formatter';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), { provide: NgbDateParserFormatter, useFactory: () => { return new NgbDateMomentParserFormatter("DD/MM/YYYY") } }]
};
