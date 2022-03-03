import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ScheduleControlComponent} from './schedule-control.component';
import {HttpClient} from '@angular/common/http';
import {ScheduleService} from '../../../../shared/service/schedule-service';
import {of} from 'rxjs';
import {staffScheduleData} from '../../../../shared/service/fixtures/staff-schedule-data';
import {ScheudleErrors} from '../../../../shared/domain/staff-schedule';
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;
import { MatDialog } from '@angular/material/dialog';
import {shiftData} from '../../../../shared/service/fixtures/shift-data';
import {staffToPatientData} from '../../../../shared/service/fixtures/staffToPatientList-data';

describe('ScheduleControlComponent', () => {
  let component: ScheduleControlComponent;
  let fixture: ComponentFixture<ScheduleControlComponent>;
  let mockHttpClient;
  const testError = 'testError';
  let testStaffScheduleData = staffScheduleData();
  const objScheudleErrors = new ScheudleErrors();
  let scheduleServiceSpyObject: SpyObj<ScheduleService>;
  let mockMatDialog;
  let testShiftData = shiftData();
  const teststaffToPateintData = staffToPatientData();

  beforeEach(waitForAsync(() => {
    scheduleServiceSpyObject = createSpyObj('ScheduleService', ['getScheduleDetails', 'addShift']);
    scheduleServiceSpyObject.getScheduleDetails.and.returnValue(of(testStaffScheduleData));
    TestBed.configureTestingModule({
      declarations: [ScheduleControlComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{provide: HttpClient, useValue: mockHttpClient},{provide: MatDialog, useValue: mockMatDialog},
        {provide: ScheduleService, useValue: scheduleServiceSpyObject}]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should getScheduleData.emit be called', () => {
    const emit = spyOn(component.getScheduleData, 'emit');
    component.onChange();
    expect(emit).toHaveBeenCalled();
  });
  it('should validate schedule name equals \'\' and add schedule to errors', () => {
    //component.objScheudleErrors.errmsg_duplicate_schedulename='errorMessage';
    //testStaffScheduleData[0].errormsg[0]='errorMessage';
    component.planDetails1.staffScheduleList[0] = testStaffScheduleData[0];
    spyOn(component, 'addToErrors');
    component.validateSchduleName(component.planDetails1.staffScheduleList[0]);
    expect(component.objSchedule.IsMaximized).toBe(true);
    expect(component.objSchedule.HasError).toBe(true);
    expect(component.addToErrors).toHaveBeenCalledWith(objScheudleErrors.errmsg_empty_schedulename);
  });
  it('should validate schedule name equals \'\' and add schedule to errors', () => {
    testStaffScheduleData[0].errormsg=null;
    testStaffScheduleData[1].errormsg=null;
    component.planDetails1.staffScheduleList[0] = testStaffScheduleData[0];
    spyOn(component, 'addToErrors');
    component.validateSchduleName(component.planDetails1.staffScheduleList[0]);
    expect(component.objSchedule.IsMaximized).toBe(true);
    expect(component.objSchedule.HasError).toBe(true);
    expect(component.addToErrors).toHaveBeenCalledWith(objScheudleErrors.errmsg_empty_schedulename);
  });
  it('should validate schedule name does not equal \'\' and remove schedule from errors', () => {
    component.planDetails1.staffScheduleList[0] = testStaffScheduleData[0];
    component.objSchedule = testStaffScheduleData[0];
    spyOn(component, 'removeFromErrors');
    component.validateSchduleName(testStaffScheduleData[0]);
    expect(component.removeFromErrors).toHaveBeenCalledWith(objScheudleErrors.errmsg_empty_schedulename);
  });
  it('should validate schedule name is duplicated and add it to erros', () => {
    component.planDetails1.staffScheduleList[0] = testStaffScheduleData[0];
    component.planDetails1.staffScheduleList[1] = testStaffScheduleData[0];
    component.objSchedule = testStaffScheduleData[0];
    spyOn(component, 'addToErrors');
    component.validateSchduleName(testStaffScheduleData[0]);
    expect(component.objSchedule.IsMaximized).toBe(true);
    expect(component.objSchedule.HasError).toBe(true);
    expect(component.addToErrors).toHaveBeenCalledWith(objScheudleErrors.errmsg_duplicate_schedulename);
  });
  it('should check schedule days and remove it from errors because days are not selected', () => {
    spyOn(component, 'removeFromErrors');
    component.checkScheduledays(testStaffScheduleData[0], 0);
    expect(component.removeFromErrors).toHaveBeenCalledWith(objScheudleErrors.errmsg_dayselected_empty);
  });
  it('should not check schedule days', () => {
    component.objSchedule = testStaffScheduleData[0];
    spyOn(component, 'removeFromErrors');
    component.checkScheduledays(testStaffScheduleData[0], 1);
  });
  it('should check schedule days are all selected', () => {
    spyOn(component, 'removeFromErrors');
    testStaffScheduleData[0].scheduleDays = [true, true, true, true, true, true, true, true,];
    component.checkScheduledays(testStaffScheduleData[0], 0);
    component.objSchedule = testStaffScheduleData[0];
  });
  it('should check all schedule days', () => {
    component.checkAllScheduledays(testStaffScheduleData[0]);
    for (let x = 0; x < component.objSchedule.scheduleDays.length; x++) {
      expect(component.objSchedule.scheduleDays[x]).toBe(true);
    }
  });
  it('should uncheck all schedule days', () => {
    const emit = spyOn(component.onchange, 'emit');
    testStaffScheduleData[0].scheduleDays[7] = false;
    component.checkAllScheduledays(testStaffScheduleData[0]);
    for (let x = 0; x < component.objSchedule.scheduleDays.length; x++) {
      expect(component.objSchedule.scheduleDays[x]).toBe(false);
    }
    expect(emit).toHaveBeenCalled();
  });
  it('should not expand schedule', () => {
    component.objSchedule = testStaffScheduleData[0];
    component.expandSchedule();
    expect(component.objSchedule.IsMaximized).toBe(false);
  });
  it('should add shifts', () => {
    component.objSchedule = testStaffScheduleData[0];
    component.objSchedule.planShiftList[0] = testShiftData[0];
    component.addShift(false);
    component.addTimePeriodFlag = false;
    expect(component.objSchedule.HasError).toBe(undefined);
  });
  it('should add shifts', () => {
    component.objSchedule = testStaffScheduleData[3];
    // component.objSchedule.planShiftList[0] = testShiftData[1];
    // component.objSchedule.planShiftList[1] = testShiftData[1];
    component.addTimePeriodFlag = false;
    component.addShift(false);
    expect(component.objSchedule.HasError).toBe(false);
  });
  it('should add shifts', () => {
    // component.objSchedule = testStaffScheduleData[0];
    component.objSchedule.planShiftList[0] = testShiftData[1];
    component.objSchedule.planShiftList[1] = testShiftData[1];
    component.addTimePeriodFlag = false;
    component.addShift(false);
    expect(component.objSchedule.HasError).toBe(false);
  });
  it('should expand schedule', () => {
    testStaffScheduleData[0].IsMaximized = false;
    component.objSchedule = testStaffScheduleData[0];
    component.expandSchedule();
    expect(component.objSchedule.IsMaximized).toBe(true);
  });
  it('should remove schedule', () => {
    const emit = spyOn(component.onclick, 'emit');
    component.removeSchedule(testStaffScheduleData[0]);
    expect(emit).toHaveBeenCalled();
  });
  it('should add message to errors', () => {
    component.objSchedule = testStaffScheduleData[0];
    component.addToErrors('testDifferent');
    expect(component.objSchedule.errormsg.indexOf('testDifferent')).not.toBe(-1);
  });
  it('should not add message to errors', () => {
    spyOn(component,'addToErrors');
    component.objSchedule.errormsg=null;
    component.addToErrors(testError);
    expect(component.objSchedule.errormsg).toBe(null);
    expect(component.addToErrors).toHaveBeenCalled();
  });
  it('should ', () => {
    component.objSchedule.errormsg[0] = 'errormessage';
    component.addToErrors('errormessage');
    expect(component.objSchedule.errormsg[0]).toBe('errormessage');
  });
  it('should remove message from errors', () => {
    component.objSchedule = testStaffScheduleData[0];
    component.removeFromErrors(testError);
    expect(component.objSchedule.errormsg.indexOf(testError)).toBe(-1);
  });
  it('should remove message from errors', function () {
    component.objSchedule = testStaffScheduleData[0];
    component.objSchedule.errormsg[0]='errormessage';
    component.removeFromErrors('errormessage')
    expect(component.objSchedule.errormsg.indexOf('errormessage')).toBe(-1);
  });
  it('should not remove message from error since it is undefiend', () => {
    component.objSchedule.errormsg = undefined;
    expect(component.removeFromErrors(testError)).toBe(false);
  });
  it('should remove errors from given schedule ', function () {
    testStaffScheduleData[0].errormsg[0] = 'testError';
    expect(component.removeErrorsfromGivenSchedule('testError', testStaffScheduleData[0])).toBe(false);
  });
  it('should remove errors from given schedule ', function () {
    testStaffScheduleData[0].errormsg = null;
    expect(component.removeErrorsfromGivenSchedule('testError', testStaffScheduleData[0])).toBe(false);
    testStaffScheduleData = staffScheduleData();
  });
  it('should remove errors from given schedule ', function () {
    testStaffScheduleData[0].errormsg = [];
    expect(component.removeErrorsfromGivenSchedule('testError', testStaffScheduleData[0])).toBe(false);
    testStaffScheduleData = staffScheduleData();
  });
  it('should remove errors from given schedule ', function () {
    expect(component.removeErrorsfromGivenSchedule('testError', testStaffScheduleData[0])).toBe(false);
    testStaffScheduleData = staffScheduleData();
  });
  it('should remove errors from given schedule ', function () {
    expect(component.removeErrorsfromGivenSchedule('', testStaffScheduleData[0])).toBe(true);
  });
  it('should remove errors from given schedule ', function () {
    expect(component.removeErrorsfromGivenSchedule('testError', testStaffScheduleData[0])).toBe(false);
  });
});
