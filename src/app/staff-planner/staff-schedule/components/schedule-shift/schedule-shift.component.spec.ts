import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {ScheduleShiftComponent} from './schedule-shift.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {staffScheduleData} from '../../../../shared/service/fixtures/staff-schedule-data';
import {staffToPatientData} from '../../../../shared/service/fixtures/staffToPatientList-data';
import {shiftData} from '../../../../shared/service/fixtures/shift-data';
import {of} from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Spy = jasmine.Spy;
import createSpy = jasmine.createSpy;

describe('ScheduleShiftComponent', () => {
  let component: ScheduleShiftComponent;
  let fixture: ComponentFixture<ScheduleShiftComponent>;
  const teststaffToPateintData = staffToPatientData();
  const testShiftData = shiftData();
  const testStaffScheduleData = staffScheduleData();
  let confirmSpy: Spy;
  const mockMatDialogRef = jasmine.createSpyObj('dialogRef', ['close']);
  let mockMatDialog;
  let flag=true;
  mockMatDialog = jasmine.createSpyObj({
    afterClosed: createSpy('name', function () {
      return of();

    }).and.callThrough(), close: null, open: createSpy('open', function() {
      return this;
    })
  });
  mockMatDialog.componentInstance = {body: ''};
  const numberObj = {
    which: false,
    keyCode: 33,
    key: ':',
    preventDefault: function () {

    }
  };
  const tempShiftTime = {
    startTime: {hours: -1, mins: 1},
    endTime: {hours: 1, mins: 1},
  };
  const objShiftTime = {
    startTime: {hours: 0, mins: 0},
    endTime: {hours: 1, mins: 0},
  };
  beforeEach(waitForAsync(() => {
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(flag);
        }
      }
    });
    TestBed.configureTestingModule({
      declarations: [ScheduleShiftComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{provide: MatDialog, useValue: mockMatDialog},
        {provide: MatDialogRef, useValue: mockMatDialogRef}]

    })
      .compileComponents();
  }));

  beforeEach(() => {
    confirmSpy = spyOn(window, 'confirm');
    fixture = TestBed.createComponent(ScheduleShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call ngOnChange ', () => {
    component.ngOnChanges();
  });
  it('should not add shift ', () => {
    component.addShift(false);
  });
  it('should not add shift  because error message is undefined', () => {
    spyOn(component, 'validateshift');
    component.objShift.errormsg = undefined;
    component.addShift(false);
  });
  it('should not add shift because error message length is 0', () => {
    spyOn(component, 'validateshift');
    component.objShift.errormsg.length = 0;
    component.addShift(false);
  });
  it('should not add shift because planshift is undefined', () => {
    spyOn(component, 'validateshift');
    component.objSchedule.planShiftList = undefined;
    component.addShift(false);
    expect(component.objSchedule.planShiftList).toContain(component.objShift);
  });
  it('should not add shift because planShift length is not 0', () => {
    spyOn(component, 'validateshift');
    component.objSchedule.planShiftList[0] = testShiftData[0];
    component.objSchedule.planShiftList.length = 1;
    component.addShift(false);
  });
  it('should add shift', () => {
    spyOn(component, 'validateshift');
    component.objShift.staffToPatientList[0] = teststaffToPateintData[0];
    component.addShift(false);
    expect(component.objSchedule.planShiftList).toContain(component.objShift);
  });
  it('should validate shift name is empty and add it to shift errors ', () => {
    spyOn(component, 'addToShiftErrors');
    component.validateShiftName(testShiftData[0]);
    expect(component.objShift.HasError).toBe(false);
    expect(component.addToShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_empty_shiftname);
    spyOn(component, 'validateShiftName');
  });

  it('should validate shift name is not empty, not duplicated and remove it from shift errors ', () => {
    spyOn(component, 'removeFromShiftErrors');
    component.validateShiftName(testShiftData[1]);
    expect(component.removeFromShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_empty_shiftname);
  });
  it('should validate shift name is duplicated and add it to shift errors', () => {
    spyOn(component, 'addToShiftErrors');
    component.objSchedule.planShiftList[0] = testShiftData[0];
    component.objSchedule.planShiftList[1] = testShiftData[0];
    component.validateShiftName(testShiftData[0]);
    expect(component.addToShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_duplicate_shiftname);
  });
  it('should validate shift name is not duplicated', () => {
    spyOn(component, 'removeFromShiftErrors');
    component.validateShiftName(testShiftData[0]);
    expect(component.removeFromShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_duplicate_shiftname);
  });
  it('should validate shift name is not duplicated and remove it from given shift errors', () => {
    spyOn(component, 'removeFromgivenShiftErrors');
    component.objSchedule.planShiftList[0] = testShiftData[0];
    component.validateShiftName(testShiftData[0]);
    expect(component.removeFromgivenShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_duplicate_shiftname,
      testShiftData[0]);
  });
  it('should validate shift name is not duplicated and remove it from given shift errors', () => {
    component.objSchedule.planShiftList[0] = testShiftData[0];
    testShiftData[0].errormsg = null;
    component.validateShiftName(testShiftData[0]);
  });

  it('should validate character code is between 31-48 and return false', () => {
    spyOn(component,'numberOnly').and.stub();
    numberObj.keyCode = 59;
    expect(component.validateShiftLength(numberObj)).toBe(true);
  });
  it('should validate shift length and return true', () => {
    numberObj.which = true;
    expect(component.validateShiftLength(numberObj)).toBe(true);
  });
  it('should validate shift length < 1', () => {
    expect(component.validateShiftLength('event')).toBe(true);
  });
  it('should validate shift length > 1', () => {
    component.objShift.hours = 11;
    expect(component.validateShiftLength('event')).toBe(true);
  });
  it('should not validate shift length because shift hours is undefined ', () => {
    component.objShift.hours = undefined;
    component.validateShiftLength('event');
  });
  it('should validate there is an error in shift hour because it is 0 and add it to shift errors', () => {
    spyOn(component, 'addToShiftErrors');
    component.validatehour(testShiftData[0]);
    component.objShift.HasError = true;
    expect(component.addToShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_empty_shifthour);
  });
  it('should validate there is an error in shift hour because it is 0 and add it to shift errors', () => {
    spyOn(component, 'addToShiftErrors');
    testShiftData[0].hours = undefined;
    component.validatehour(testShiftData[0]);
    component.objShift.HasError = true;
    expect(component.addToShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_empty_shifthour);
  });
  it('should validate there is no error in shift hour and remove it form shift errors and sum shift hours', () => {
    component.objSchedule.planShiftList[0] = testShiftData[0];
    spyOn(component, 'removeFromShiftErrors');
    testShiftData[0].hours = 1;
    component.validatehour(testShiftData[0]);
    component.objShift.HasError = true;
    expect(component.removeFromShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_empty_shifthour);
    expect(component.removeFromShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_exceeds_shifthour);
  });
  it('should validate shift hours >24 and add it to shift errors ', () => {
    spyOn(component, 'addToShiftErrors');
    testShiftData[0].hours = 25;
    component.objSchedule.planShiftList[0] = testShiftData[0];
    component.validatehour(testShiftData[0]);
    expect(component.objShift.HasError).toBe(false);
    expect(component.addToShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_exceeds_shifthour);
  });
  it('should validate shift hours = 24 and remove it from shift errors', () => {
    spyOn(component, 'removeFromShiftErrors');
    testShiftData[0].hours = 24;
    component.objSchedule.planShiftList[0] = testShiftData[0];
    component.validatehour(testShiftData[0]);
    expect(component.removeFromShiftErrors).toHaveBeenCalled();
  });
  it('should validate shift name is equals "" ', () => {
    spyOn(component, 'addToShiftErrors');
    component.validateshift(testShiftData[0]);
    expect(component.objShift.HasError).toBe(false);
    expect(component.addToShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_empty_shiftname);
  });
  it('should validate shift name is not empty ', () => {
    spyOn(component, 'removeFromShiftErrors');
    testShiftData[0].name = 'test';
    component.validateshift(testShiftData[0]);
    expect(component.removeFromShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_empty_shiftname);
  });
  it('should validate shift hours = 0', () => {
    spyOn(component, 'addToShiftErrors');
    testShiftData[0].name = 'test';
    testShiftData[0].hours = 0;
    component.validateshift(testShiftData[0]);
    expect(component.addToShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_empty_shifthour);
  });
  it('should validate shift name is duplicated and shift hours = 24 ', () => {
    testShiftData[0].hours = 24;
    testShiftData[0].startTime = '12:00';
    component.objSchedule.planShiftList[0] = testShiftData[0];
    component.objSchedule.planShiftList[1] = testShiftData[0];
    component.objSchedule.planShiftList.length = 10;
    spyOn(component, 'addToShiftErrors');
    spyOn(component, 'ValidateShifttime');
    testShiftData[0].name = 'test';
    component.objSchedule.planShiftList[0].staffToPatientList = teststaffToPateintData;
    component.validateshift(testShiftData[0]);
  });
  it('should remove shift ', () => {
    confirmSpy.and.returnValue(true);
    spyOn(component, 'removeFromgivenShiftErrors');
    component.objSchedule.planShiftList[0] = testShiftData[0];
    component.objSchedule.planShiftList[1] = testShiftData[0];
    component.removeShift(testShiftData[0]);
    expect(component.removeFromgivenShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_duplicate_shiftname,
      testShiftData[0]);
  });
  // it('should remove shift because planshift was not found', function () {
  //   component.objSchedule.planShiftList[0] = testShiftData[0];
  //   component.objSchedule.planShiftList[1] = testShiftData[0];
  //   component.objSchedule.planShiftList[2] = testShiftData[0];
  //   testShiftData[0].name = 'shiftName';
  //   confirmSpy.and.returnValue(true)
  //   component.removeShift(testShiftData[1]);
  // });
  it('should not remove shift because shiftName is undefined', () => {
    testShiftData[1].name = undefined;
    component.objSchedule.planShiftList[0] = testShiftData[0];
    component.objSchedule.planShiftList[1] = testShiftData[0];
    component.objSchedule.planShiftList[2] = testShiftData[0];
    testShiftData[0].name = 'shiftName';
    confirmSpy.and.returnValue(true);
    component.removeShift(testShiftData[1]);
  });
  it('should check input is number only', () => {
    expect(component.numberOnly('event')).toBe(true);
  });
  it('should add error to shift errors', () => {
    component.objShift.errormsg[0] = 'differentError';
    component.addToShiftErrors('error');
    expect(component.objShift.errormsg).toContain('differentError');
  });
  it('should not add error to shift errors', () => {
    component.objShift.errormsg[0] = 'error';
    component.addToShiftErrors('error');
  });
  it('should not add error to shift errors', () => {
    component.objShift.errormsg = undefined;
    component.addToShiftErrors('error');
    expect(component.objShift.errormsg[0]).toBe('error');
  });
  it('should add error to shift errors', () => {
    component.objShift.errormsg[0] = 'error';
    component.removeFromShiftErrors('error');
    expect(component.objShift.errormsg.indexOf('error')).toBe(-1);
  });
  it('should not add error to shift errors because it is undefined', () => {
    component.objShift.errormsg = undefined;
    expect(component.removeFromShiftErrors('error')).toBe(false);
  });
  it('should remove error from giving shift error ', () => {
    expect(component.removeFromgivenShiftErrors('error', testShiftData[0])).toBe(true);
  });
  it('should not remove error from giving shift error because its length is 0', () => {
    testShiftData[0].errormsg = [];
    expect(component.removeFromgivenShiftErrors('error', testShiftData[0])).toBe(false);
  });
  it('should not remove error from giving shift error because it is undefined', () => {
    testShiftData[0].errormsg = undefined;
    expect(component.removeFromgivenShiftErrors('error', testShiftData[0])).toBe(false);
  });
  it('should not remove error from schedule errors because it was not found', () => {
    expect(component.removeFromScheduleErrors('testErrorDifferent', testStaffScheduleData[0])).toBe(true);
  });
  it('should not remove error from schedule errors because it was not found', () => {
    expect(component.removeFromScheduleErrors('testError', testStaffScheduleData[0])).toBe(false);
  });
  it('should not remove error from schedule errors because it is undefined', () => {
    expect(component.removeFromScheduleErrors(null, testStaffScheduleData[1])).toBe(false);
  });

  it('should validate shift hours start time is between', () => {
    component.objSchedule.planShiftList[0] = testShiftData[1];
    spyOn(component, 'getShifttime').and.returnValues(objShiftTime, tempShiftTime);
    component.ValidateShifttime(testShiftData[0]);
  });
  it('should validate shift hours start time equals end time', () => {
    objShiftTime.startTime.hours = 1;
    component.objSchedule.planShiftList[0] = testShiftData[1];
    spyOn(component, 'getShifttime').and.returnValues(objShiftTime, tempShiftTime);
    component.ValidateShifttime(testShiftData[0]);
  });
  it('should validate shift minute start time equals end time', () => {
    objShiftTime.startTime.hours = 1;
    component.objSchedule.planShiftList[0] = testShiftData[1];
    spyOn(component, 'getShifttime').and.returnValues(objShiftTime, tempShiftTime);
    component.ValidateShifttime(testShiftData[0]);
  });
  it('should validate previous shift time is current', () => {
    objShiftTime.startTime.hours = 0;
    tempShiftTime.startTime.hours = 1;
    tempShiftTime.endTime.hours = -1;
    component.objSchedule.planShiftList[0] = testShiftData[1];
    spyOn(component, 'getShifttime').and.returnValues(objShiftTime, tempShiftTime);
    component.ValidateShifttime(testShiftData[0]);
  });
  it('should validate end time to fall in previous shift time', () => {
    objShiftTime.endTime.hours = -1;
    tempShiftTime.endTime.hours = 2;
    tempShiftTime.startTime.hours = -2;
    objShiftTime.endTime.hours = 0;
    component.objSchedule.planShiftList[0] = testShiftData[1];

    spyOn(component, 'getShifttime').and.returnValues(objShiftTime, tempShiftTime);
    component.ValidateShifttime(testShiftData[0]);
  });
  it('should validate current shift ends at another shift start hour', () => {
    objShiftTime.endTime.hours = 1;
    tempShiftTime.endTime.hours = 2;
    tempShiftTime.startTime.hours = 1;
    objShiftTime.endTime.mins = 1;
    tempShiftTime.startTime.mins = 0;
    component.objSchedule.planShiftList[0] = testShiftData[1];
    spyOn(component, 'getShifttime').and.returnValues(objShiftTime, tempShiftTime);
    component.ValidateShifttime(testShiftData[0]);
  });
  it('should validate current shift does not ends at another shift start hour', () => {
    objShiftTime.endTime.hours = 1;
    tempShiftTime.endTime.hours = 2;
    tempShiftTime.startTime.hours = 1;
    objShiftTime.endTime.mins = 0;
    tempShiftTime.startTime.mins = 1;
    component.objSchedule.planShiftList[0] = testShiftData[1];
    spyOn(component, 'getShifttime').and.returnValues(objShiftTime, tempShiftTime);
    component.ValidateShifttime(testShiftData[0]);
  });
  it('should not validate shift time when shift is not found in the object', () => {
    spyOn(component, 'getShifttime').and.returnValue(null);
    component.objSchedule.planShiftList[0] = testShiftData[1];
    component.objSchedule.planShiftList[1] = testShiftData[0];
    component.ValidateShifttime(testShiftData[0]);
  });
  it('should get shift time', () => {
    testShiftData[0].timeFormatFlag = false;
    component.getShifttime(testShiftData[0]);
  });
  // it('should checkTimeFormat', function () {
  //   component.checkTimeFormat('event');

  // });
  it('should check number for date only ', function () {
    numberObj.which=false;
    numberObj.keyCode=60;
    numberObj.key='33';
    expect(component.numberOnlyForTime(numberObj)).toBe(true);
  });
  it('should check number for date only ', function () {
    numberObj.which=false;
    numberObj.keyCode=42;
    numberObj.key='33';
    expect(component.numberOnlyForTime(numberObj)).toBe(true);
  });
  it('should check number for date only ', function () {
    numberObj.which=false;
    numberObj.keyCode=42;
    numberObj.key=':';
    expect(component.numberOnlyForTime(numberObj)).toBe(true);
  });
  it('should check number for date only ', function () {
    numberObj.which=false;
    numberObj.keyCode=30;
    numberObj.key=':';
    expect(component.numberOnlyForTime(numberObj)).toBe(true);
  });
  it('should check number for date only ', function () {
    numberObj.which=false;
    numberObj.keyCode=46;
    numberObj.key=':';
    expect(component.numberOnlyForTime(numberObj)).toBe(false);
  });
  it('should toggle staffToPatientCount', function(){
    component.objShift.staffToPatientList[0] = teststaffToPateintData[0];
    component.togglePatient(0);
    expect(component.togglePatient).toHaveBeenCalled;
  });
});
