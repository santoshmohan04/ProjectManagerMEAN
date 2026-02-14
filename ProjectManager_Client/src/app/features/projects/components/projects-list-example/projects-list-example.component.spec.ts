import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectsListExampleComponent } from './projects-list-example.component';
import { ProjectsStore, ProjectStatus } from '../../store/projects.store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';

describe('ProjectsListExampleComponent', () => {
  let component: ProjectsListExampleComponent;
  let fixture: ComponentFixture<ProjectsListExampleComponent>;
  let mockProjectsStore: jasmine.SpyObj<any>;

  beforeEach(async () => {
    // Create mock ProjectsStore
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
      hasProjects: signal(false),
      hasActiveFilters: signal(false),
      planningProjects: signal([]),
      activeProjects: signal([]),
      completedProjects: signal([]),
      hasMorePages: signal(false),
      hasPreviousPage: signal(false),
      loadProjects: jasmine.createSpy('loadProjects'),
      setFilters: jasmine.createSpy('setFilters'),
      clearFilters: jasmine.createSpy('clearFilters'),
      refreshProjects: jasmine.createSpy('refreshProjects'),
      goToPage: jasmine.createSpy('goToPage'),
      setItemsPerPage: jasmine.createSpy('setItemsPerPage'),
      archiveProject: jasmine.createSpy('archiveProject'),
      deleteProject: jasmine.createSpy('deleteProject'),
      setSelectedProject: jasmine.createSpy('setSelectedProject'),
    };

    await TestBed.configureTestingModule({
      imports: [
        ProjectsListExampleComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: ProjectsStore, useValue: mockProjectsStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsListExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with empty filter values', () => {
      expect(component.searchTerm).toBe('');
      expect(component.selectedStatus).toBeNull();
      expect(component.selectedPriority).toBeNull();
    });

    it('should have correct table columns', () => {
      expect(component.displayedColumns).toEqual([
        'id', 'name', 'priority', 'status', 'tasks', 'actions'
      ]);
    });

    it('should expose ProjectStatus enum', () => {
      expect(component.ProjectStatus).toBe(ProjectStatus);
    });
  });

  describe('Search and Filters', () => {
    it('should call setFilters when search term changes', () => {
      component.searchTerm = 'test';
      component.onSearchChange();

      expect(mockProjectsStore.setFilters).toHaveBeenCalledWith({
        search: 'test',
        status: undefined,
        priority: undefined,
      });
    });

    it('should call setFilters with undefined when search is empty', () => {
      component.searchTerm = '';
      component.onSearchChange();

      expect(mockProjectsStore.setFilters).toHaveBeenCalledWith({
        search: undefined,
        status: undefined,
        priority: undefined,
      });
    });

    it('should call setFilters when status changes', () => {
      component.selectedStatus = ProjectStatus.ACTIVE;
      component.onFilterChange();

      expect(mockProjectsStore.setFilters).toHaveBeenCalledWith({
        search: undefined,
        status: ProjectStatus.ACTIVE,
        priority: undefined,
      });
    });

    it('should call setFilters when priority changes', () => {
      component.selectedPriority = 10;
      component.onFilterChange();

      expect(mockProjectsStore.setFilters).toHaveBeenCalledWith({
        search: undefined,
        status: undefined,
        priority: 10,
      });
    });

    it('should clear search term and call setFilters', () => {
      component.searchTerm = 'test';
      component.clearSearch();

      expect(component.searchTerm).toBe('');
      expect(mockProjectsStore.setFilters).toHaveBeenCalled();
    });

    it('should clear all filters and call store clearFilters', () => {
      component.searchTerm = 'test';
      component.selectedStatus = ProjectStatus.ACTIVE;
      component.selectedPriority = 10;

      component.clearAllFilters();

      expect(component.searchTerm).toBe('');
      expect(component.selectedStatus).toBeNull();
      expect(component.selectedPriority).toBeNull();
      expect(mockProjectsStore.clearFilters).toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    it('should call goToPage when page changes', () => {
      const event = { pageIndex: 2, pageSize: 10 } as any;
      component.onPageChange(event);

      expect(mockProjectsStore.goToPage).toHaveBeenCalledWith(3); // pageIndex + 1
    });

    it('should call setItemsPerPage when page size changes', () => {
      mockProjectsStore.pagination.and.returnValue({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
      });

      const event = { pageIndex: 0, pageSize: 25 } as any;
      component.onPageChange(event);

      expect(mockProjectsStore.setItemsPerPage).toHaveBeenCalledWith(25);
    });
  });

  describe('CRUD Operations', () => {
    const mockProject = {
      _id: '123',
      Project: 'Test Project',
      Project_ID: 1,
      Priority: 5,
      status: ProjectStatus.ACTIVE,
      NoOfTasks: 10,
      CompletedTasks: 5,
    } as any;

    it('should set selected project on view', () => {
      component.viewProject(mockProject);

      expect(mockProjectsStore.setSelectedProject).toHaveBeenCalledWith(mockProject);
    });

    it('should log project on edit', () => {
      spyOn(console, 'log');
      component.editProject(mockProject);

      expect(console.log).toHaveBeenCalledWith('Edit project:', mockProject);
    });

    it('should call archiveProject after confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.archiveProject(mockProject);

      expect(mockProjectsStore.archiveProject).toHaveBeenCalledWith('123');
    });

    it('should not call archiveProject if cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.archiveProject(mockProject);

      expect(mockProjectsStore.archiveProject).not.toHaveBeenCalled();
    });

    it('should call deleteProject after confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.deleteProject(mockProject);

      expect(mockProjectsStore.deleteProject).toHaveBeenCalledWith('123');
    });

    it('should not call deleteProject if cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.deleteProject(mockProject);

      expect(mockProjectsStore.deleteProject).not.toHaveBeenCalled();
    });
  });

  describe('Refresh', () => {
    it('should call refreshProjects on store', () => {
      component.refreshProjects();

      expect(mockProjectsStore.refreshProjects).toHaveBeenCalled();
    });
  });
});
