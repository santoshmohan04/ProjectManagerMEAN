import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectDetailsComponent } from './project-details.component';
import { ProjectsStore, ProjectStatus } from '../../store/projects.store';
import { AuthStore } from '../../../../core/auth.store';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('ProjectDetailsComponent', () => {
  let component: ProjectDetailsComponent;
  let fixture: ComponentFixture<ProjectDetailsComponent>;
  let mockProjectsStore: jasmine.SpyObj<any>;
  let mockAuthStore: jasmine.SpyObj<any>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockProject = {
    _id: 'project-123',
    Project_ID: 123,
    Project: 'Test Project',
    name: 'Test Project',
    description: 'Test description',
    Manager_ID: 'manager-1',
    manager: 'John Doe',
    status: ProjectStatus.ACTIVE,
    Priority: 5,
    priority: 5,
    NoOfTasks: 10,
    CompletedTasks: 7,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    createdBy: 'admin',
  } as any;

  beforeEach(async () => {
    mockProjectsStore = {
      projects: signal([mockProject]),
      selectedProject: signal(mockProject),
      loading: signal(false),
      error: signal(null),
      setSelectedProject: jasmine.createSpy('setSelectedProject'),
      loadProjects: jasmine.createSpy('loadProjects'),
      archiveProject: jasmine.createSpy('archiveProject'),
      deleteProject: jasmine.createSpy('deleteProject'),
    };

    mockAuthStore = {
      user: signal({ 
        _id: 'user-123', 
        email: 'admin@test.com',
        role: 'ADMIN' 
      }),
    };

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      paramMap: of(new Map([['id', 'project-123']])),
    };

    await TestBed.configureTestingModule({
      imports: [ProjectDetailsComponent, NoopAnimationsModule],
      providers: [
        { provide: ProjectsStore, useValue: mockProjectsStore },
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should extract uuid from route params', () => {
    expect(component.uuid()).toBe('project-123');
  });

  it('should get project from store', () => {
    const proj = component.project();
    expect(proj).toBeTruthy();
    expect(proj?._id).toBe('project-123');
  });

  describe('Progress Calculation', () => {
    it('should calculate progress percentage correctly', () => {
      expect(component.progress()).toBe(70); // 7/10 * 100 = 70
    });

    it('should return 0 when NoOfTasks is 0', () => {
      mockProjectsStore.selectedProject.and.returnValue({
        ...mockProject,
        NoOfTasks: 0,
        CompletedTasks: 0,
      });
      fixture.detectChanges();

      expect(component.progress()).toBe(0);
    });

    it('should return 0 when NoOfTasks is undefined', () => {
      mockProjectsStore.selectedProject.and.returnValue({
        ...mockProject,
        NoOfTasks: undefined,
      });
      fixture.detectChanges();

      expect(component.progress()).toBe(0);
    });

    it('should handle missing CompletedTasks', () => {
      mockProjectsStore.selectedProject.and.returnValue({
        ...mockProject,
        NoOfTasks: 10,
        CompletedTasks: undefined,
      });
      fixture.detectChanges();

      expect(component.progress()).toBe(0);
    });
  });

  describe('Permissions', () => {
    it('should allow edit for ADMIN', () => {
      mockAuthStore.user.and.returnValue({ role: 'ADMIN' });
      fixture.detectChanges();

      expect(component.canEdit()).toBe(true);
    });

    it('should allow edit for MANAGER', () => {
      mockAuthStore.user.and.returnValue({ role: 'MANAGER' });
      fixture.detectChanges();

      expect(component.canEdit()).toBe(true);
    });

    it('should not allow edit for USER', () => {
      mockAuthStore.user.and.returnValue({ role: 'USER' });
      fixture.detectChanges();

      expect(component.canEdit()).toBe(false);
    });

    it('should allow archive only for ADMIN', () => {
      mockAuthStore.user.and.returnValue({ role: 'ADMIN' });
      fixture.detectChanges();

      expect(component.canArchive()).toBe(true);
    });

    it('should not allow archive for MANAGER', () => {
      mockAuthStore.user.and.returnValue({ role: 'MANAGER' });
      fixture.detectChanges();

      expect(component.canArchive()).toBe(false);
    });

    it('should handle null user', () => {
      mockAuthStore.user.and.returnValue(null);
      fixture.detectChanges();

      expect(component.canEdit()).toBe(false);
      expect(component.canArchive()).toBe(false);
    });
  });

  describe('Actions', () => {
    it('should navigate to edit page', () => {
      component.onEdit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects', 'edit', 'project-123']);
    });

    it('should archive project after confirmation', (done) => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.onArchive();

      expect(mockProjectsStore.archiveProject).toHaveBeenCalledWith('project-123');
      
      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects']);
        done();
      }, 600);
    });

    it('should not archive if cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.onArchive();

      expect(mockProjectsStore.archiveProject).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should delete project after confirmation', (done) => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.onDelete();

      expect(mockProjectsStore.deleteProject).toHaveBeenCalledWith('project-123');
      
      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects']);
        done();
      }, 600);
    });

    it('should navigate back', () => {
      component.goBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects']);
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

    it('should return correct progress color', () => {
      expect(component.getProgressColor()).toBe('primary'); // 70%
    });
  });

  describe('Date Formatting', () => {
    it('should format valid date', () => {
      const result = component.formatDate('2026-01-15');
      expect(result).toContain('2026');
      expect(result).toContain('Jan');
    });

    it('should handle undefined date', () => {
      expect(component.formatDate(undefined)).toBe('N/A');
    });

    it('should handle invalid date', () => {
      expect(component.formatDate('invalid')).toBe('Invalid date');
    });
  });

  describe('Loading Project', () => {
    it('should set selected project if found in list', () => {
      mockProjectsStore.projects.and.returnValue([mockProject]);
      component['loadProject']('project-123');

      expect(mockProjectsStore.setSelectedProject).toHaveBeenCalledWith(mockProject);
    });

    it('should load all projects if not found in list', () => {
      mockProjectsStore.projects.and.returnValue([]);
      component['loadProject']('project-999');

      expect(mockProjectsStore.loadProjects).toHaveBeenCalledWith({});
    });
  });
});
