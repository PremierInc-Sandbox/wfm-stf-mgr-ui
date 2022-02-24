import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import { PromptDialogData} from '../prompt-dialog/prompt-dialog.component';
import { PromptDialogSaveComponent } from './prompt-dialog-save.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('PromptDialogComponent', () => {
  let component: PromptDialogSaveComponent;
  let fixture: ComponentFixture<PromptDialogSaveComponent>;
  const mockMatDialogRef = jasmine.createSpyObj('dialogRef', ['close']);
  let mockDialogData: PromptDialogData;


  beforeEach(waitForAsync(() => {
    mockDialogData = {
      alertMessgae: 'alertMessage',
      confirmWinodw: null,
      headerText: 'This is header'
    };
    TestBed.configureTestingModule({
      declarations: [PromptDialogSaveComponent],
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
    fixture = TestBed.createComponent(PromptDialogSaveComponent);
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
  it('should check message alert exit ', function () {
    component.isAlertMessageExist();
    expect(component.isAlertMessageExist()).toBe(true);
  });
  it('should check message alert exit ', function () {
    component.alertMessgae=null;
    component.isAlertMessageExist();
    expect(component.isAlertMessageExist()).toBe(false);
  });
  it('should check message alert exit ', function () {
    component.alertMessgae='';
    component.isAlertMessageExist();
    expect(component.isAlertMessageExist()).toBe(false);
  });
});
