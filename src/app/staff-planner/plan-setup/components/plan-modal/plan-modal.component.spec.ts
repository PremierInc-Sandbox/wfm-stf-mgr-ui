import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {PlanModalComponent} from './plan-modal.component';
import {FormsModule} from '@angular/forms';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

describe('PlanModalComponent', () => {
  let component: PlanModalComponent;
  let fixture: ComponentFixture<PlanModalComponent>;
  const matDialog = jasmine.createSpyObj('dialogRef', ['close']);
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [PlanModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: MatDialogRef, useValue: matDialog}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should dialogRef.close to be called ', () => {
    component.toggleModalHide();
    expect(component.dialogRef.close).toHaveBeenCalled();

  });
});
