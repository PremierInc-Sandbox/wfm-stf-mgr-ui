import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NonVariablePosComponent} from './non-variable-pos.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {nonVariablePositionData} from '../../../../shared/service/fixtures/non-variable-position-data';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {of} from 'rxjs';
import createSpy = jasmine.createSpy;

describe('NonVariablePosComponent', () => {
  let component: NonVariablePosComponent;
  let fixture: ComponentFixture<NonVariablePosComponent>;
  const numberObj = {
    which: false,
    keyCode: 33 ,
  };
  let nonVariablepositionDataTest = nonVariablePositionData();
  const mockMatDialogRef = jasmine.createSpyObj('dialogRef', ['close']);
  let mockMatDialog;
  mockMatDialog = jasmine.createSpyObj({
    afterClosed: of({}), close: null, open: createSpy('open', function() {
      return this;
    })
  });
  mockMatDialog.componentInstance = {body: ''};
  beforeEach(waitForAsync(() => {
    mockMatDialog.open.and.callFake(function() {
      return this;

    });

    TestBed.configureTestingModule({
      declarations: [NonVariablePosComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{provide: MatDialog, useValue: mockMatDialog},
        {provide: MatDialogRef, useValue: mockMatDialogRef}]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NonVariablePosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should nvd position', () => {
    component.newNonVarpos(nonVariablepositionDataTest[0]);
    const testNextNewIndex = component.newIndex;
    const newLen = component.staffArray.length;
    expect(component.staffArray.lastIndexOf(newLen - 1)).toBe(testNextNewIndex);
    expect(component.title).toContain('');
    expect(component.shiftHours).toContain('');
  });
  it('should add new non variable position', () => {
    component.plan.nonVariableDepartmentPositions.length = 10;
    component.newNonVarpos(nonVariablepositionDataTest[0]);
    expect(component.error.isError && component.isMaxIndex === true).toBeTruthy();
    expect(component.error.errorMessage).toEqual('User is unable to add new position unless they delete an existing one.');
  });

  it('should call new nonVariablePosition and set isShowError to true when staff.shiftHours is 1 and staff.title is null ', () => {
    nonVariablepositionDataTest[1].shiftHours = 1;
    nonVariablepositionDataTest[1].title = '';
    component.newNonVarpos(nonVariablepositionDataTest[1]);
    expect(component.isShowError).toBeTruthy();
  });
  it('should call new nonVariablePosition and set isShowError to true when staff.shiftHours is 1 and staff.title is null ', () => {
    nonVariablepositionDataTest[1].shiftHours = undefined;
    nonVariablepositionDataTest[1].title = undefined;
    component.newNonVarpos(nonVariablepositionDataTest[1]);
    expect(component.isShowError).toBeTruthy();
  });
  it('should call new nonVariablePosition and set isShowError to false when staff.shiftHours is 1 and staff.title is not null ', () => {
    nonVariablepositionDataTest[1].shiftHours = 1;
    nonVariablepositionDataTest[1].title = 'test';
    component.newNonVarpos(nonVariablepositionDataTest[1]);
    expect(component.isShowError).toBeFalsy();
    expect(component.plan.nonVariableDepartmentPositions.length).toBe(1);
  });
  it('should select all variable position component when weekDay.selected = true', () => {
    component.selectAll(nonVariablepositionDataTest[1]);
    let x = 0;
    for (x; x < nonVariablepositionDataTest[0].weekDays.length; x++) {
      expect(nonVariablepositionDataTest[0].weekDays[x].selected).toBe(false);
    }
  });
  it('should not select all variable position component when weekDay.selected = false', () => {
    component.selectAll(nonVariablepositionDataTest[0]);
    let x = 0;
    for (x; x < nonVariablepositionDataTest[0].weekDays.length; x++) {
      expect(nonVariablepositionDataTest[0].weekDays[x].selected).toBe(false);
    }
  });
  it('should not select non-variableDeptPosition', () => {
    nonVariablepositionDataTest[0].allDaySelected = false;
    component.selectAll(nonVariablepositionDataTest[0]);

  });
  it('should check if all days are selected', () => {
    component.checkIfAllSelected(nonVariablepositionDataTest[0]);
  });
  it('should validate all days are not selected', () => {
    component.checkIfAllSelected(nonVariablepositionDataTest[1]);
  });
  it('should delete a row', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.plan.nonVariableDepartmentPositions[0] = nonVariablepositionDataTest[0];
    component.deleteRow(nonVariablepositionDataTest[0]);
    expect(component.plan.nonVariableDepartmentPositions.indexOf(nonVariablepositionDataTest[0])).toBe(-1);
  });
  it('should delete a row', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.plan.nonVariableDepartmentPositions[0] = nonVariablepositionDataTest[0];
    component.deleteRow(nonVariablepositionDataTest[0]);
    expect(component.plan.nonVariableDepartmentPositions.indexOf(nonVariablepositionDataTest[0])).toBe(-1);
  });
  it('should not delete a row because it was not found', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.plan.nonVariableDepartmentPositions[0] = null;
    component.deleteRow(nonVariablepositionDataTest[0]);
    expect(component.plan.nonVariableDepartmentPositions.indexOf(nonVariablepositionDataTest[0])).toBe(-1);
  });
  it('should clear non department fields', () => {
    component.clearNonDeptFields(nonVariablepositionDataTest[0]);
  });
  it('should not delete a row because confirm box was denied', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteRow(nonVariablepositionDataTest[0]);
  });
  it('should not delete a row', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.plan.totalAnnualHours = 1;
    component.deleteRow(nonVariablepositionDataTest[0]);
  });
  it('should not delete a row', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.plan.totalAnnualHours = 1;
    component.deleteRow(nonVariablepositionDataTest[0]);
  });
  it('should check input is number', () => {
    component.numberOnly(numberObj, 0 );
  });
  it('should check input is not a number', () => {
    numberObj.keyCode = 30;
    component.plan.nonVariableDepartmentPositions[0] = nonVariablepositionDataTest[0];
    component.numberOnly(numberObj, 0 );
  });
  it('should check input is not a number', () => {
    numberObj.keyCode = 58;
    component.plan.nonVariableDepartmentPositions[0] = nonVariablepositionDataTest[0];
    component.numberOnly(numberObj, 0);
  });
  it('should check input is not a number', () => {
    numberObj.which = true;
    component.plan.nonVariableDepartmentPositions[0] = nonVariablepositionDataTest[0];
    component.numberOnly(numberObj, 0 );
  });
  it('should validate title length <120', () => {
    component.validateLength('test');
  });
  it('should validate title length <120', () => {
    const titleMoreThan120Character = 'lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll' +
      'lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll';
    component.validateLength(titleMoreThan120Character);
  });
  it('should check title that it is empty', () => {
    component.checkTitle('');
    expect(component.emptyErrorFlag).toBeTruthy();
  });
  it('should check title that it is empty', () => {
    component.checkTitle('char');
    expect(component.emptyErrorFlag).toBeFalsy();
  });
  it('should check nonVariablePosition title is empty', () => {
    component.checkEmpty(nonVariablepositionDataTest);
    expect(component.emptyErrorFlag).toBeTruthy();
    expect(component.emptySelectFlag).toBe(false);
  });
  it('should check nonVariablePosition title is not empty', () => {
    nonVariablepositionDataTest = nonVariablePositionData();
    nonVariablepositionDataTest[0].weekDays[0].selected = true;
    nonVariablepositionDataTest[0].title = 'char';
    component.checkEmpty(nonVariablepositionDataTest);
    expect(component.emptyErrorFlag).toBeFalsy();
    expect(component.emptySelectFlag).toBeFalsy();
  });
  it('should check nonVariablePosition title is not empty', () => {
    nonVariablepositionDataTest = nonVariablePositionData();
    nonVariablepositionDataTest[0].title = 'char';
    component.checkEmpty(nonVariablepositionDataTest);
    expect(component.emptySelectFlag).toBeTruthy();
    expect(component.emptyErrorFlag).toBeFalsy();
  });
  it('should check hours', () => {
    component.checkHours('');
    expect(component.emptyHourFlag).toBeTruthy();
  });
  it('should check hours', () => {
    component.checkHours(1);
    expect(component.emptyHourFlag).toBeFalsy();
  });
  it('should number only check', function () {
  expect(component.numberOnlyCheck(numberObj)).toBe(true)
  });
  it('should number only check', function () {
    numberObj.keyCode=60;
    numberObj.which=false
    expect(component.numberOnlyCheck(numberObj)).toBe(false)
  });
  it('should number only check', function () {
    expect(component.numberOnlyCheck(null)).toBe(false)
  });
});

