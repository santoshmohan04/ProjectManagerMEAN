import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskListComponent } from './task-list.component';
import { TasksStore } from '../../store/tasks.store';
import { TaskStatus } from '../../models/task';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let mockTasksStore: jasmine.SpyObj<any>;

  const mockTasks = [
    {
      _id: 'task-1',
      Title: 'Task 1',
      Description: 'Description 1',
      Start_Date: '2026-02-01',
      End_Date: '2026-02-28',
      Priority: 8,
      Status: TaskStatus.Open,
      Parent: null,
      Project: { _id: 'p1', Project: 'Project 1' },
      User: { _id: 'u1', First_Name: 'John' },
    },
    {
      _id: 'task-2',
      Title: 'Task 2',
      Description: 'Description 2',
      Start_Date: '2026-02-01',
      End_Date: '2026-01-15', // Overdue
      Priority: 5,
      Status: TaskStatus.InProgress,
      Parent: null,
      Project: null,
      User: null,
    },
  ] as any[];

  beforeEach(async () => {
    mockTasksStore = {
      tasks: signal(mockTasks),
      loading: signal(false),
      error: signal(null),
      pagination: signal({
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        itemsPerPage: 10,
      }),
      filters: signal({}),
      hasActiveFilters: signal(false),
      setFilters: jasmine.createSpy('setFilters'),
      clearFilters: jasmine.createSpy('clearFilters'),
      updateTask: jasmine.createSpy('updateTask'),
      deleteTask: jasmine.createSpy('deleteTask'),
      bulkUpdateTasks: jasmine.createSpy('bulkUpdateTasks'),
      bulkDeleteTasks: jasmine.createSpy('bulkDeleteTasks'),
      setSelectedTask: jasmine.createSpy('setSelectedTask'),
      refreshTasks: jasmine.createSpy('refreshTasks'),
      goToPage: jasmine.createSpy('goToPage'),
      setItemsPerPage: jasmine.createSpy('setItemsPerPage'),
    };

    await TestBed.configureTestingModule({
      imports: [TaskListComponent, NoopAnimationsModule],
      providers: [{ provide: TasksStore, useValue: mockTasksStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with table view', () => {
    expect(component.viewMode()).toBe('table');
  });

  it('should initialize with correct columns', () => {
    expect(component.displayedColumns).toEqual([
      'select',
      'title',
      'project',
      'assignee',
      'status',
      'priority',
      'dueDate',
      'actions',
    ]);
  });

  describe('View Switching', () => {
    it('should switch to kanban view', () => {
      component.switchView('kanban');
      expect(component.viewMode()).toBe('kanban');
    });

    it('should clear selection when switching views', () => {
      component.selectedTaskIds.set(new Set(['task-1']));
      component.switchView('kanban');
      expect(component.selectedTaskIds().size).toBe(0);
    });
  });

  describe('Selection', () => {
    it('should toggle task selection', () => {
      component.toggleTaskSelection('task-1');
      expect(component.isSelected('task-1')).toBe(true);

      component.toggleTaskSelection('task-1');
      expect(component.isSelected('task-1')).toBe(false);
    });

    it('should select all tasks', () => {
      component.toggleSelectAll();
      expect(component.selectedTaskIds().size).toBe(2);
      expect(component.allSelected()).toBe(true);
    });

    it('should deselect all tasks', () => {
      component.selectedTaskIds.set(new Set(['task-1', 'task-2']));
      component.toggleSelectAll();
      expect(component.selectedTaskIds().size).toBe(0);
    });

    it('should show indeterminate when some selected', () => {
      component.selectedTaskIds.set(new Set(['task-1']));
      expect(component.someSelected()).toBe(true);
      expect(component.allSelected()).toBe(false);
    });

    it('should clear selection', () => {
      component.selectedTaskIds.set(new Set(['task-1', 'task-2']));
      component.clearSelection();
      expect(component.selectedTaskIds().size).toBe(0);
    });

    it('should count selected tasks', () => {
      component.selectedTaskIds.set(new Set(['task-1', 'task-2']));
      expect(component.selectedCount()).toBe(2);
    });
  });

  describe('Filters', () => {
    it('should apply filters', () => {
      component.selectedStatus = TaskStatus.Open;
      component.selectedPriority = 8;
      component.onFilterChange();

      expect(mockTasksStore.setFilters).toHaveBeenCalledWith({
        search: undefined,
        status: TaskStatus.Open,
        priority: 8,
        project: undefined,
      });
    });

    it('should clear filters', () => {
      component.searchValue = 'test';
      component.selectedStatus = TaskStatus.Open;
      component.clearFilters();

      expect(component.searchValue).toBe('');
      expect(component.selectedStatus).toBeNull();
      expect(mockTasksStore.clearFilters).toHaveBeenCalled();
    });

    it('should debounce search', (done) => {
      component.onSearchChange('test');
      expect(component.searchValue).toBe('test');

      setTimeout(() => {
        expect(mockTasksStore.setFilters).toHaveBeenCalled();
        done();
      }, 350);
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(() => {
      component.selectedTaskIds.set(new Set(['task-1', 'task-2']));
      spyOn(window, 'confirm').and.returnValue(true);
    });

    it('should bulk update status', () => {
      component.bulkUpdateStatus(TaskStatus.Completed);

      expect(mockTasksStore.bulkUpdateTasks).toHaveBeenCalledWith({
        taskIds: ['task-1', 'task-2'],
        updates: { Status: TaskStatus.Completed },
      });
      expect(component.selectedTaskIds().size).toBe(0);
    });

    it('should bulk update priority', () => {
      component.bulkUpdatePriority(10);

      expect(mockTasksStore.bulkUpdateTasks).toHaveBeenCalledWith({
        taskIds: ['task-1', 'task-2'],
        updates: { Priority: 10 },
      });
    });

    it('should bulk delete', () => {
      component.bulkDelete();

      expect(mockTasksStore.bulkDeleteTasks).toHaveBeenCalledWith([
        'task-1',
        'task-2',
      ]);
    });

    it('should not bulk update if cancelled', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);
      component.bulkUpdateStatus(TaskStatus.Completed);

      expect(mockTasksStore.bulkUpdateTasks).not.toHaveBeenCalled();
    });
  });

  describe('Single Task Operations', () => {
    it('should change task status', () => {
      component.onStatusChange('task-1', TaskStatus.Completed);

      expect(mockTasksStore.updateTask).toHaveBeenCalledWith({
        uuid: 'task-1',
        payload: { Status: TaskStatus.Completed },
      });
    });

    it('should delete task', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.deleteTask('task-1', 'Task 1');

      expect(mockTasksStore.deleteTask).toHaveBeenCalledWith('task-1');
    });

    it('should view task', () => {
      const task = mockTasks[0];
      component.viewTask(task);

      expect(mockTasksStore.setSelectedTask).toHaveBeenCalledWith(task);
    });

    it('should edit task', () => {
      const task = mockTasks[0];
      component.editTask(task);

      expect(mockTasksStore.setSelectedTask).toHaveBeenCalledWith(task);
    });
  });

  describe('Utility Functions', () => {
    it('should detect overdue tasks', () => {
      expect(component.isOverdue(mockTasks[0])).toBe(false);
      expect(component.isOverdue(mockTasks[1])).toBe(true);
    });

    it('should calculate days until due', () => {
      const days = component.getDaysUntilDue(mockTasks[0]);
      expect(typeof days).toBe('number');
    });

    it('should return correct status class', () => {
      expect(component.getStatusClass(TaskStatus.Open)).toBe('status-open');
      expect(component.getStatusClass(TaskStatus.InProgress)).toBe(
        'status-in-progress'
      );
    });

    it('should return correct priority class', () => {
      expect(component.getPriorityClass(2)).toBe('priority-low');
      expect(component.getPriorityClass(5)).toBe('priority-medium');
      expect(component.getPriorityClass(9)).toBe('priority-high');
    });

    it('should return correct priority label', () => {
      expect(component.getPriorityLabel(2)).toBe('Low');
      expect(component.getPriorityLabel(5)).toBe('Medium');
      expect(component.getPriorityLabel(9)).toBe('High');
    });

    it('should format date', () => {
      const result = component.formatDate('2026-02-15');
      expect(result).toContain('2026');
      expect(result).toContain('Feb');
    });
  });

  describe('Kanban Columns', () => {
    it('should organize tasks into columns', () => {
      const columns = component.kanbanColumns();
      
      expect(columns.length).toBe(4);
      expect(columns[0].status).toBe(TaskStatus.Open);
      expect(columns[0].tasks.length).toBe(1);
      expect(columns[1].tasks.length).toBe(1);
    });
  });

  describe('Pagination', () => {
    it('should change page', () => {
      const event = { pageIndex: 2, pageSize: 10, length: 100 } as any;
      component.onPageChange(event);

      expect(mockTasksStore.goToPage).toHaveBeenCalledWith(3);
    });

    it('should change page size', () => {
      const event = { pageIndex: 0, pageSize: 25, length: 100 } as any;
      mockTasksStore.pagination.and.returnValue({
        currentPage: 1,
        totalPages: 4,
        totalItems: 100,
        itemsPerPage: 10,
      });

      component.onPageChange(event);

      expect(mockTasksStore.setItemsPerPage).toHaveBeenCalledWith(25);
    });
  });

  describe('Refresh', () => {
    it('should refresh tasks', () => {
      component.refresh();
      expect(mockTasksStore.refreshTasks).toHaveBeenCalled();
    });
  });
});
