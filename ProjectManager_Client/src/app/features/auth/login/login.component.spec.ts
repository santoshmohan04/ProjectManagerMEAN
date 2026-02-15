import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthStore } from '../../../core/auth.store';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthStore: jasmine.SpyObj<any>;

  beforeEach(async () => {
    mockAuthStore = {
      loading: signal(false),
      error: signal(null),
      login: jasmine.createSpy('login'),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthStore, useValue: mockAuthStore },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with an invalid form', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should have email and password fields', () => {
    expect(component.loginForm.get('email')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();
  });

  it('should validate email field as required', () => {
    const email = component.loginForm.get('email');
    email?.setValue('');
    expect(email?.hasError('required')).toBeTruthy();
  });

  it('should validate email field format', () => {
    const email = component.loginForm.get('email');
    email?.setValue('invalid-email');
    expect(email?.hasError('email')).toBeTruthy();
    
    email?.setValue('valid@email.com');
    expect(email?.hasError('email')).toBeFalsy();
  });

  it('should validate password field as required', () => {
    const password = component.loginForm.get('password');
    password?.setValue('');
    expect(password?.hasError('required')).toBeTruthy();
  });

  it('should have valid form with correct inputs', () => {
    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(component.loginForm.valid).toBeTruthy();
  });

  it('should call authStore.login on form submit', () => {
    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });
    
    component.onSubmit();
    
    expect(mockAuthStore.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should not call authStore.login if form is invalid', () => {
    component.loginForm.setValue({
      email: '',
      password: '',
    });
    
    component.onSubmit();
    
    expect(mockAuthStore.login).not.toHaveBeenCalled();
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword).toBe(true);
    
    component.hidePassword = false;
    expect(component.hidePassword).toBe(false);
    
    component.hidePassword = true;
    expect(component.hidePassword).toBe(true);
  });
});
