import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { ProjectManagementEffects } from './store/effects';
import { projectReducer } from './store/reducers';
import { AlertService } from './shared/services/alert.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    AlertService,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideToastr(),
    provideStore({projects: projectReducer}),
    provideEffects([ProjectManagementEffects])
],
};
