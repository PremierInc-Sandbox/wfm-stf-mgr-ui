import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {InternalServerComponent} from './internal-server.component';

describe('InternalServerComponent', () => {
  let component: InternalServerComponent;
  let fixture: ComponentFixture<InternalServerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [InternalServerComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InternalServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
