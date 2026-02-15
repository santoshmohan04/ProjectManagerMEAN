import { Component, inject, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthStore, UserRole } from '../../../core/auth.store';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  authStore = inject(AuthStore);
  isAuthenticated = computed(() => !!this.authStore.user());

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER] },
    { label: 'Projects', icon: 'work', route: '/projects', roles: [UserRole.MANAGER, UserRole.ADMIN] },
    { label: 'Tasks', icon: 'task', route: '/tasks', roles: [UserRole.MANAGER, UserRole.ADMIN] },
    { label: 'My Tasks', icon: 'assignment', route: '/my-tasks', roles: [UserRole.USER] },
    { label: 'Users', icon: 'people', route: '/users', roles: [UserRole.ADMIN] },
    { label: 'Audit', icon: 'history', route: '/audit', roles: [UserRole.ADMIN] },
  ];

  shouldShowNavItem(item: NavItem): boolean {
    const userRole = this.authStore.user()?.role;
    return userRole ? item.roles.includes(userRole) : false;
  }

  getUserInitials(): string {
    const user = this.authStore.user();
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  toggleSidebar(): void {
    this.authStore.toggleSidebar();
  }

  logout(): void {
    this.authStore.logout();
  }
}
