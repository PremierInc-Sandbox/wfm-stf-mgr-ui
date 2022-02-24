import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {GridScoreCardComponent} from './grid-score-card.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import {NO_ERRORS_SCHEMA} from '@angular/core';

describe('GridScoreCardComponent', () => {
  let component: GridScoreCardComponent;
  let fixture: ComponentFixture<GridScoreCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GridScoreCardComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        MatDividerModule,
        MatIconModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridScoreCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create grid score card', () => {
    expect(component).toBeTruthy();
  });
});
