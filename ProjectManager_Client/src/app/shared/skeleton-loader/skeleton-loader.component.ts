import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonType = 'text' | 'circle' | 'rect' | 'card' | 'table-row' | 'list-item';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-loader" [ngClass]="'skeleton-' + type" [style.width.px]="width" [style.height.px]="height">
      @if (type === 'card') {
        <div class="skeleton-card">
          <div class="skeleton-circle" style="width: 48px; height: 48px;"></div>
          <div class="skeleton-content">
            <div class="skeleton-text" style="width: 60%; height: 16px;"></div>
            <div class="skeleton-text" style="width: 40%; height: 12px; margin-top: 8px;"></div>
          </div>
        </div>
      } @else if (type === 'table-row') {
        <div class="skeleton-table-row">
          @for (col of Array(columns); track $index) {
            <div class="skeleton-text" [style.width.%]="100 / columns"></div>
          }
        </div>
      } @else if (type === 'list-item') {
        <div class="skeleton-list-item">
          <div class="skeleton-circle" style="width: 40px; height: 40px;"></div>
          <div class="skeleton-content">
            <div class="skeleton-text" style="width: 70%; height: 14px;"></div>
            <div class="skeleton-text" style="width: 50%; height: 12px; margin-top: 8px;"></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-loader {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s ease-in-out infinite;
      border-radius: 4px;
    }

    .dark-mode .skeleton-loader {
      background: linear-gradient(90deg, #2a2a2a 25%, #333333 50%, #2a2a2a 75%);
      background-size: 200% 100%;
    }

    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    .skeleton-text {
      height: 16px;
      border-radius: 4px;
      background: inherit;
    }

    .skeleton-circle {
      border-radius: 50%;
      background: inherit;
    }

    .skeleton-rect {
      border-radius: 4px;
      background: inherit;
    }

    .skeleton-card {
      display: flex;
      gap: 16px;
      padding: 16px;
      align-items: center;
    }

    .skeleton-content {
      flex: 1;
    }

    .skeleton-table-row {
      display: flex;
      gap: 16px;
      padding: 16px;
      align-items: center;
    }

    .skeleton-list-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      align-items: center;
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() type: SkeletonType = 'text';
  @Input() width?: number;
  @Input() height?: number;
  @Input() columns: number = 5;

  Array = Array;
}
