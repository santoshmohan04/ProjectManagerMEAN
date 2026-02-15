import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuditComponent } from './audit.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AuditComponent', () => {
  let component: AuditComponent;
  let fixture: ComponentFixture<AuditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title', () => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('h1');
    expect(title?.textContent).toContain('Audit Log');
  });

  it('should display placeholder text', () => {
    const compiled = fixture.nativeElement;
    const text = compiled.querySelector('p');
    expect(text?.textContent).toContain('Audit log will be displayed here...');
  });
});
