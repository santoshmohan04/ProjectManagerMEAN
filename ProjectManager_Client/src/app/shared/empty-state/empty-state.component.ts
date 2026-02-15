import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="empty-state">
      <div class="empty-state-icon">
        <mat-icon [style.font-size.px]="iconSize" [style.width.px]="iconSize" [style.height.px]="iconSize">
          {{ icon }}
        </mat-icon>
      </div>
      <h3 class="empty-state-title">{{ title }}</h3>
      <p class="empty-state-message">{{ message }}</p>
      @if (actionLabel) {
        <button mat-raised-button color="primary" (click)="actionClick.emit()" class="empty-state-action">
          <mat-icon>{{ actionIcon }}</mat-icon>
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      min-height: 300px;
    }

    .empty-state-icon {
      margin-bottom: 24px;
      color: #9e9e9e;
      opacity: 0.5;
    }

    .dark-mode .empty-state-icon {
      color: #757575;
    }

    .empty-state-title {
      margin: 0 0 12px 0;
      font-size: 24px;
      font-weight: 500;
      color: #424242;
    }

    .dark-mode .empty-state-title {
      color: #e0e0e0;
    }

    .empty-state-message {
      margin: 0 0 24px 0;
      font-size: 16px;
      color: #757575;
      max-width: 400px;
    }

    .dark-mode .empty-state-message {
      color: #9e9e9e;
    }

    .empty-state-action {
      margin-top: 8px;
    }

    .empty-state-action mat-icon {
      margin-right: 8px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = 'inbox';
  @Input() iconSize: number = 72;
  @Input() title: string = 'No data available';
  @Input() message: string = 'There are no items to display at this time.';
  @Input() actionLabel?: string;
  @Input() actionIcon: string = 'add';
  @Output() actionClick = new EventEmitter<void>();
}
