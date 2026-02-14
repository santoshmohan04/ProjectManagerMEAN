import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatBadgeModule } from '@angular/material/badge';
import { TasksStore } from '../../store/tasks.store';
import { Task, TaskStatus } from '../../models/task';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

type ViewMode = 'table' | 'kanban';

interface KanbanColumn {
  status: TaskStatus;
  title: string;
  tasks: Task[];
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatCardModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatBadgeModule,
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent {
  tasksStore = inject(TasksStore);

  // View mode
  viewMode = signal<ViewMode>('table');

  // Table configuration
  displayedColumns: string[] = [
    'select',
    'title',
    'project',
    'assignee',
    'status',
    'priority',
    'dueDate',
    'actions'
  ];

  dataSource = new MatTableDataSource<Task>();

  // Selection state
  selectedTaskIds = signal<Set<string>>(new Set());
  
  // Check if all tasks are selected
  allSelected = computed(() => {
    const tasks = this.tasksStore.tasks();
    const selected = this.selectedTaskIds();
    return tasks.length > 0 && tasks.every(t => selected.has(t._id));
  });

  // Check if some (but not all) tasks are selected
  someSelected = computed(() => {
    const tasks = this.tasksStore.tasks();
    const selected = this.selectedTaskIds();
    const hasSelection = tasks.some(t => selected.has(t._id));
    return hasSelection && !this.allSelected();
  });

  // Count of selected tasks
  selectedCount = computed(() => this.selectedTaskIds().size);

  // Filter values
  searchValue = '';
  selectedStatus: TaskStatus | null = null;
  selectedPriority: number | null = null;
  selectedProject: string | null = null;

  // Search debounce
  private searchSubject = new Subject<string>();

  // Expose enum to template
  TaskStatus = TaskStatus;

  // Kanban columns
  kanbanColumns = computed<KanbanColumn[]>(() => {
    const tasks = this.tasksStore.tasks();
    
    return [
      {
        status: TaskStatus.Open,
        title: 'Open',
        tasks: tasks.filter(t => t.Status === TaskStatus.Open)
      },
      {
        status: TaskStatus.InProgress,
        title: 'In Progress',
        tasks: tasks.filter(t => t.Status === TaskStatus.InProgress)
      },
      {
        status: TaskStatus.Completed,
        title: 'Completed',
        tasks: tasks.filter(t => t.Status === TaskStatus.Completed)
      },
      {
        status: TaskStatus.Blocked,
        title: 'Blocked',
        tasks: tasks.filter(t => t.Status === TaskStatus.Blocked)
      }
    ];
  });

  constructor() {
    // Update dataSource when tasks change
    effect(() => {
      const tasks = this.tasksStore.tasks();
      this.dataSource.data = tasks;
    });

    // Setup search debounce
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.applyFilters();
      });
  }

  // =========================================================================
  // FILTER & SEARCH
  // =========================================================================

  onSearchChange(value: string): void {
    this.searchValue = value;
    this.searchSubject.next(value);
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.tasksStore.setFilters({
      search: this.searchValue || undefined,
      status: this.selectedStatus || undefined,
      priority: this.selectedPriority || undefined,
      project: this.selectedProject || undefined,
    });
  }

  clearFilters(): void {
    this.searchValue = '';
    this.selectedStatus = null;
    this.selectedPriority = null;
    this.selectedProject = null;
    this.tasksStore.clearFilters();
  }

  // =========================================================================
  // SELECTION
  // =========================================================================

  toggleSelectAll(): void {
    const tasks = this.tasksStore.tasks();
    const selected = this.selectedTaskIds();
    
    if (this.allSelected()) {
      // Deselect all
      this.selectedTaskIds.set(new Set());
    } else {
      // Select all
      this.selectedTaskIds.set(new Set(tasks.map(t => t._id)));
    }
  }

  toggleTaskSelection(taskId: string): void {
    const selected = new Set(this.selectedTaskIds());
    
    if (selected.has(taskId)) {
      selected.delete(taskId);
    } else {
      selected.add(taskId);
    }
    
    this.selectedTaskIds.set(selected);
  }

  isSelected(taskId: string): boolean {
    return this.selectedTaskIds().has(taskId);
  }

  clearSelection(): void {
    this.selectedTaskIds.set(new Set());
  }

  // =========================================================================
  // BULK OPERATIONS
  // =========================================================================

  bulkUpdateStatus(status: TaskStatus): void {
    const taskIds = Array.from(this.selectedTaskIds());
    
    if (taskIds.length === 0) return;
    
    if (confirm(`Update ${taskIds.length} task(s) to ${status}?`)) {
      this.tasksStore.bulkUpdateTasks({
        taskIds,
        updates: { Status: status }
      });
      this.clearSelection();
    }
  }

  bulkUpdatePriority(priority: number): void {
    const taskIds = Array.from(this.selectedTaskIds());
    
    if (taskIds.length === 0) return;
    
    if (confirm(`Update ${taskIds.length} task(s) to priority ${priority}?`)) {
      this.tasksStore.bulkUpdateTasks({
        taskIds,
        updates: { Priority: priority }
      });
      this.clearSelection();
    }
  }

  bulkDelete(): void {
    const taskIds = Array.from(this.selectedTaskIds());
    
    if (taskIds.length === 0) return;
    
    if (confirm(`Delete ${taskIds.length} task(s)? This cannot be undone.`)) {
      this.tasksStore.bulkDeleteTasks(taskIds);
      this.clearSelection();
    }
  }

  // =========================================================================
  // SINGLE TASK OPERATIONS
  // =========================================================================

  onStatusChange(taskId: string, status: TaskStatus): void {
    this.tasksStore.updateTask({
      uuid: taskId,
      payload: { Status: status }
    });
  }

  deleteTask(taskId: string, taskTitle: string): void {
    if (confirm(`Delete task "${taskTitle}"?`)) {
      this.tasksStore.deleteTask(taskId);
    }
  }

  editTask(task: Task): void {
    this.tasksStore.setSelectedTask(task);
    // Navigate to edit page or open dialog
    console.log('Edit task:', task);
  }

  viewTask(task: Task): void {
    this.tasksStore.setSelectedTask(task);
    console.log('View task:', task);
  }

  // =========================================================================
  // UTILITY
  // =========================================================================

  isOverdue(task: Task): boolean {
    if (task.Status === TaskStatus.Completed) return false;
    const endDate = new Date(task.End_Date);
    const now = new Date();
    return endDate < now;
  }

  getDaysUntilDue(task: Task): number {
    const endDate = new Date(task.End_Date);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getStatusClass(status: TaskStatus): string {
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  }

  getPriorityClass(priority: number): string {
    if (priority >= 8) return 'priority-high';
    if (priority >= 4) return 'priority-medium';
    return 'priority-low';
  }

  getPriorityLabel(priority: number): string {
    if (priority >= 8) return 'High';
    if (priority >= 4) return 'Medium';
    return 'Low';
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // =========================================================================
  // VIEW MANAGEMENT
  // =========================================================================

  switchView(mode: ViewMode): void {
    this.viewMode.set(mode);
    this.clearSelection();
  }

  // =========================================================================
  // PAGINATION
  // =========================================================================

  onPageChange(event: PageEvent): void {
    if (event.pageSize !== this.tasksStore.pagination().itemsPerPage) {
      this.tasksStore.setItemsPerPage(event.pageSize);
    } else {
      this.tasksStore.goToPage(event.pageIndex + 1);
    }
  }

  refresh(): void {
    this.tasksStore.refreshTasks();
  }
}
