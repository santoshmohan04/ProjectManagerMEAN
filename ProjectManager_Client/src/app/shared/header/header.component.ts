import { Component, HostListener, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ThemeService } from '@core/theme.service';
import { AuthStore } from '@core/auth.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatTooltipModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  private themeService = inject(ThemeService);
  private authStore = inject(AuthStore);
  
  isDarkMode = this.themeService.isDarkMode;
  isAuthenticated = this.authStore.isAuthenticated;
  
  isMobile = false;
  menuOpen = false;

  @HostListener('window:resize', [])
  onWindowResize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.menuOpen = false;
    }
  }

  ngOnInit() {
    this.onWindowResize();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
