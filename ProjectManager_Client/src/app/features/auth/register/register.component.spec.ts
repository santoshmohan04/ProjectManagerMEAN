import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthStore, UserRole } from '../../../core/auth.store';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthStore: jasmine.SpyObj<any>;

  beforeEach(async () => {
    mockAuthStore = {
      loading: signal(false),
      error: signal(null),
      register: jasmine.createSpy('register'),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthStore, useValue: mockAuthStore },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with an invalid form', () => {
    expect(component.registerForm.valid).toBeFalsy();
  });

  it('should have all required fields', () => {
    expect(component.registerForm.get('firstName')).toBeTruthy();
    expect(component.registerForm.get('lastName')).toBeTruthy();
    expect(component.registerForm.get('email')).toBeTruthy();
    expect(component.registerForm.get('employeeId')).toBeTruthy();
    expect(component.registerForm.get('role')).toBeTruthy();
    expect(component.registerForm.get('password')).toBeTruthy();
    expect(component.registerForm.get('confirmPassword')).toBeTruthy();
  });

  it('should validate firstName as required', () => {
    const firstName = component.registerForm.get('firstName');
    firstName?.setValue('');
    expect(firstName?.hasError('required')).toBeTruthy();
  });

  it('should validate lastName as required', () => {
    const lastName = component.registerForm.get('lastName');
    lastName?.setValue('');
    expect(lastName?.hasError('required')).toBeTruthy();
  });

  it('should validate email format', () => {
    const email = component.registerForm.get('email');
    email?.setValue('invalid-email');
    expect(email?.hasError('email')).toBeTruthy();
    
    email?.setValue('valid@email.com');
    expect(email?.hasError('email')).toBeFalsy();
  });

  it('should validate password minimum length', () => {
    const password = component.registerForm.get('password');
    password?.setValue('123');
    expect(password?.hasError('minlength')).toBeTruthy();
    
    password?.setValue('123456');
    expect(password?.hasError('minlength')).toBeFalsy();
  });

  it('should validate password match', () => {
    component.registerForm.patchValue({
      password: 'password123',
      confirmPassword: 'different',
    });
    expect(component.registerForm.hasError('passwordMismatch')).toBeTruthy();
    
    component.registerForm.patchValue({
      confirmPassword: 'password123',
    });
    expect(component.registerForm.hasError('passwordMismatch')).toBeFalsy();
  });

  it('should have valid form with correct inputs', () => {
    component.registerForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      employeeId: '12345',
      role: UserRole.USER,
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(component.registerForm.valid).toBeTruthy();
  });

  it('should call authStore.register on form submit', () => {
    component.registerForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      employeeId: '12345',
      role: UserRole.USER,
      password: 'password123',
      confirmPassword: 'password123',
    });
    
    component.onSubmit();
    
    expect(mockAuthStore.register).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      employeeId: '12345',
      role: UserRole.USER,
      password: 'password123',
    });
  });

  it('should not include confirmPassword in register payload', () => {
    component.registerForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      employeeId: '12345',
      role: UserRole.USER,
      password: 'password123',
      confirmPassword: 'password123',
    });
    
    component.onSubmit();
    
    const calledWith = mockAuthStore.register.calls.mostRecent().args[0];
    expect(calledWith.confirmPassword).toBeUndefined();
  });

  it('should not call authStore.register if form is invalid', () => {
    component.registerForm.setValue({
      firstName: '',
      lastName: '',
      email: 'invalid',
      employeeId: '',
      role: UserRole.USER,
      password: '123',
      confirmPassword: '456',
    });
    
    component.onSubmit();
    
    expect(mockAuthStore.register).not.toHaveBeenCalled();
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword).toBe(true);
    component.hidePassword = false;
    expect(component.hidePassword).toBe(false);
  });

  it('should toggle confirm password visibility', () => {
    expect(component.hideConfirmPassword).toBe(true);
    component.hideConfirmPassword = false;
    expect(component.hideConfirmPassword).toBe(false);
  });

  it('should expose UserRole enum', () => {
    expect(component.UserRole).toBe(UserRole);
  });
});
