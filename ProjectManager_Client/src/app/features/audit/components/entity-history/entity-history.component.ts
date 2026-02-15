import { Component, inject, signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuditStore } from '../../store/audit.store';
import { AuditTimelineComponent } from '../audit-timeline/audit-timeline.component';
import { EntityType } from '../../models/audit';

@Component({
  selector: 'app-entity-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatTooltipModule,
    AuditTimelineComponent,
  ],
  templateUrl: './entity-history.component.html',
  styleUrls: ['./entity-history.component.scss'],
})
export class EntityHistoryComponent {
  private route = inject(ActivatedRoute);
  private queryParams = toSignal(this.route.queryParams, { initialValue: {} as Params });
  private router = inject(Router);
  store = inject(AuditStore);

  EntityType = EntityType;
  entityTypes = Object.values(EntityType);

  // Form fields
  selectedEntityType = signal<EntityType>(EntityType.PROJECT);
  entityId = signal<string>('');
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);

  // Track if we've loaded based on route params
  private hasLoadedFromRoute = false;

  constructor() {
    // Effect to reload when pagination changes
    effect(() => {
      const page = this.store.pagination().currentPage;
      const pageSize = this.store.pagination().pageSize;
      const entityType = this.store.entityType();
      const entityId = this.store.entityId();

      if (entityType && entityId && this.hasLoadedFromRoute) {
        this.loadHistory();
      }
    });

    // Effect to reload when date filter changes
    effect(() => {
      const dateRange = this.store.dateRange();
      if (this.hasLoadedFromRoute && this.store.entityType() && this.store.entityId()) {
        this.loadHistory();
      }
    });

    // Effect to handle route query params
    effect(() => {
      const params = this.queryParams() || {};
      const entityType = params['entityType'];
      const entityId = params['entityId'];
      
      if (entityType && entityId) {
        const typedEntityType = entityType as EntityType;

        if (Object.values(EntityType).includes(typedEntityType)) {
          this.selectedEntityType.set(typedEntityType);
          this.entityId.set(entityId as string);
          this.hasLoadedFromRoute = true;
          this.loadHistory();
        }
      }
    });
  }

  loadHistory(): void {
    const entityType = this.selectedEntityType();
    const entityId = this.entityId().trim();

    if (!entityId) {
      return;
    }

    this.store.loadEntityHistory({ entityType, entityId });
  }

  applyDateFilter(): void {
    this.store.setDateRange(this.startDate(), this.endDate());
  }

  clearDateFilter(): void {
    this.startDate.set(null);
    this.endDate.set(null);
    this.store.clearDateRange();
  }

  nextPage(): void {
    this.store.nextPage();
  }

  previousPage(): void {
    this.store.previousPage();
  }

  refresh(): void {
    this.loadHistory();
  }

  clearResults(): void {
    this.store.clearEntityLogs();
    this.entityId.set('');
    this.hasLoadedFromRoute = false;
    
    // Clear query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: 'merge',
    });
  }
}
