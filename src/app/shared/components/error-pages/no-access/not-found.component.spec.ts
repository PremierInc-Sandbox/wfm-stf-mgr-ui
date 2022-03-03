import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NoAccessComponent} from "./not-found.component";


describe('NoAccessComponent', () => {
  let component: NoAccessComponent;
  let fixture: ComponentFixture<NoAccessComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NoAccessComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
