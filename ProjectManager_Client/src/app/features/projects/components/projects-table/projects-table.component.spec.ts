import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectsTableComponent } from './projects-table.component';
import { ProjectsStore, ProjectStatus } from '../../store/projects.store';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';

describe('ProjectsTableComponent', () => {
  let component: ProjectsTableComponent;
  let fixture: ComponentFixture<ProjectsTableComponent>;
  let mockProjectsStore: jasmine.SpyObj<any>;

  beforeEach(async () => {
    mockProjectsStore = {
      projects: signal([]),
      loading: signal(false),
      error: signal(null),
      pagination: signal({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
      }),
      filters: signal({}),
      hasActiveFilters: signal(false),
      setFilters: jasmine.createSpy('setFilters'),
      clearFilters: jasmine.createSpy('clearFilters'),
      goToPage: jasmine.createSpy('goToPage'),
      setItemsPerPage: jasmine.createSpy('setItemsPerPage'),
      loadProjects: jasmine.createSpy('loadProjects'),
      refreshProjects: jasmine.createSpy('refreshProjects'),
      archiveProject: jasmine.createSpy('archiveProject'),
      deleteProject: jasmine.createSpy('deleteProject'),
      setSelectedProject: jasmine.createSpy('setSelectedProject'),
    };

    await TestBed.configureTestingModule({
      imports: [ProjectsTableComponent, NoopAnimationsModule],
      providers: [
        { provide: ProjectsStore, useValue: mockProjectsStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct columns', () => {
    expect(component.displayedColumns).toEqual([
      'name',
      'manager',
      'status',
      'tasks',
      'priority',
      'actions'
    ]);
  });

  it('should initialize with empty filter values', () => {
    expect(component.searchValue).toBe('');
    expect(component.selectedStatus).toBeNull();
    expect(component.selectedPriority).toBeNull();
  });

  describe('Search', () => {
    it('should debounce search input', (done) => {
      component.onSearchChange('test');
      expect(component.searchValue).toBe('test');
      
      // Debounce delay
      setTimeout(() => {
        expect(mockProjectsStore.setFilters).toHaveBeenCalled();
        done();
      }, 350);
    });
  });

  describe('Filters', () => {
    it('should apply filters when status changes', () => {
      component.selectedStatus = ProjectStatus.ACTIVE;
      component.onFilterChange();

      expect(mockProjectsStore.setFilters).toHaveBeenCalledWith({
        search: undefined,
        status: ProjectStatus.ACTIVE,
        priority: undefined,
      });
      expect(mockProjectsStore.goToPage).toHaveBeenCalledWith(1);
    });

    it('should apply filters when priority changes', () => {
      component.selectedPriority = 10;
      component.onFilterChange();

      expect(mockProjectsStore.setFilters).toHaveBeenCalledWith({
        search: undefined,
        status: undefined,
        priority: 10,
      });
    });

    it('should clear all filters', () => {
      component.searchValue = 'test';
      component.selectedStatus = ProjectStatus.ACTIVE;
      component.selectedPriority = 10;

      component.clearFilters();

      expect(component.searchValue).toBe('');
      expect(component.selectedStatus).toBeNull();
      expect(component.selectedPriority).toBeNull();
      expect(mockProjectsStore.clearFilters).toHaveBeenCalled();
    });
  });

  describe('Sorting', () => {
    it('should handle sort change', () => {
      mockProjectsStore.pagination.and.returnValue({
        currentPage: 2,
        totalPages: 5,
        totalItems: 50,
        itemsPerPage: 10,
      });

      const sortEvent: MatSort = {
        active: 'name',
        direction: 'asc',
      } as any;

      component.onSortChange(sortEvent);

      expect(component.currentSort).toBe('name');
      expect(component.currentSortDirection).toBe('asc');
      expect(mockProjectsStore.loadProjects).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        sort: 'name:asc',
        filters: {},
      });
    });

    it('should clear sort when direction is empty', () => {
      const sortEvent: MatSort = {
        active: 'name',
        direction: '',
      } as any;

      component.onSortChange(sortEvent);

      expect(component.currentSort).toBe('');
      expect(component.currentSortDirection).toBe('asc');
    });
  });

  describe('Pagination', () => {
    it('should change page', () => {
      mockProjectsStore.pagination.and.returnValue({
        currentPage: 1,
        totalPages: 5,
        totalItems: 50,
        itemsPerPage: 10,
      });

      const event: PageEvent = {
        pageIndex: 2,
        pageSize: 10,
        length: 50,
      };

      component.onPageChange(event);

      expect(mockProjectsStore.goToPage).toHaveBeenCalledWith(3); // pageIndex + 1
    });

    it('should change page size', () => {
      mockProjectsStore.pagination.and.returnValue({
        currentPage: 1,
        totalPages: 5,
        totalItems: 50,
        itemsPerPage: 10,
      });

      const event: PageEvent = {
        pageIndex: 0,
        pageSize: 25,
        length: 50,
      };

      component.onPageChange(event);

      expect(mockProjectsStore.setItemsPerPage).toHaveBeenCalledWith(25);
    });
  });

  describe('CSS Classes', () => {
    it('should return correct status class', () => {
      expect(component.getStatusClass('ACTIVE')).toBe('status-active');
      expect(component.getStatusClass('PLANNING')).toBe('status-planning');
      expect(component.getStatusClass(undefined)).toBe('');
    });

    it('should return correct priority class', () => {
      expect(component.getPriorityClass(2)).toBe('priority-low');
      expect(component.getPriorityClass(5)).toBe('priority-medium');
      expect(component.getPriorityClass(9)).toBe('priority-high');
    });
  });

  describe('CRUD Actions', () => {
    const mockProject = {
      _id: '123',
      Project: 'Test Project',
      Priority: 5,
      status: ProjectStatus.ACTIVE,
    } as any;

    it('should view project', () => {
      component.viewProject(mockProject);

      expect(mockProjectsStore.setSelectedProject).toHaveBeenCalledWith(mockProject);
    });

    it('should archive project after confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.archiveProject(mockProject);

      expect(mockProjectsStore.archiveProject).toHaveBeenCalledWith('123');
    });

    it('should not archive project if cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.archiveProject(mockProject);

      expect(mockProjectsStore.archiveProject).not.toHaveBeenCalled();
    });

    it('should delete project after confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.deleteProject(mockProject);

      expect(mockProjectsStore.deleteProject).toHaveBeenCalledWith('123');
    });

    it('should refresh projects', () => {
      component.refresh();

      expect(mockProjectsStore.refreshProjects).toHaveBeenCalled();
    });
  });
});
