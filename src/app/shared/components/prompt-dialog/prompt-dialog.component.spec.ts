import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {PromptDialogComponent, PromptDialogData} from './prompt-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('PromptDialogComponent', () => {
  let component: PromptDialogComponent;
  let fixture: ComponentFixture<PromptDialogComponent>;
  const mockMatDialogRef = jasmine.createSpyObj('dialogRef', ['close']);
  let mockDialogData: PromptDialogData;


  beforeEach(waitForAsync(() => {
    mockDialogData = {
      alertMessgae: 'alertMessage',
      confirmWinodw: null,
      headerText: 'This is header'
    };
    TestBed.configureTestingModule({
      declarations: [PromptDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: MatDialogRef, useValue: mockMatDialogRef},
        {provide: MAT_DIALOG_DATA, useValue: mockDialogData}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    mockDialogData.alertMessgae = 'alertMessgae';
    fixture = TestBed.createComponent(PromptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should toggle hide modal', () => {
    component.toggleModalHide();
    expect(component.dialogRef.close).toHaveBeenCalled();
  });
});
