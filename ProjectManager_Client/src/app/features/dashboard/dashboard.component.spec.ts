import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title', () => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('h1');
    expect(title?.textContent).toContain('Dashboard');
  });

  it('should display three dashboard cards', () => {
    const compiled = fixture.nativeElement;
    const cards = compiled.querySelectorAll('.dashboard-card');
    expect(cards.length).toBe(3);
  });

  it('should display Active Projects card', () => {
    const compiled = fixture.nativeElement;
    const cardTitles = compiled.querySelectorAll('mat-card-title');
    const titles = Array.from(cardTitles).map((el: any) => el.textContent);
    expect(titles).toContain('Active Projects');
  });

  it('should display Pending Tasks card', () => {
    const compiled = fixture.nativeElement;
    const cardTitles = compiled.querySelectorAll('mat-card-title');
    const titles = Array.from(cardTitles).map((el: any) => el.textContent);
    expect(titles).toContain('Pending Tasks');
  });

  it('should display Team Members card', () => {
    const compiled = fixture.nativeElement;
    const cardTitles = compiled.querySelectorAll('mat-card-title');
    const titles = Array.from(cardTitles).map((el: any) => el.textContent);
    expect(titles).toContain('Team Members');
  });
});
