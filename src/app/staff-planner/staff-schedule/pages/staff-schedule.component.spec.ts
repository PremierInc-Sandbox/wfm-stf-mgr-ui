import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {StaffScheduleComponent} from './staff-schedule.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {PlanService} from '../../../shared/service/plan-service';
import {of} from 'rxjs';
import {ScheduleService} from '../../../shared/service/schedule-service';
import {staffScheduleData} from '../../../shared/service/fixtures/staff-schedule-data';
import {planDetailsData} from '../../../shared/service/fixtures/plan-details-data';
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;
import {shiftData} from '../../../shared/service/fixtures/shift-data';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import createSpy = jasmine.createSpy;
import {ConfirmWindowOptions} from '../../../shared/domain/plan-details';
import {OAService} from '../../../shared/service/oa-service';
import {oaSuggestedDataSample2} from '../../../shared/service/fixtures/oa-suggested-data-sample2';
import {RouterHistoryTrackerService} from "../../../shared/service/router-history-tracker.service";
import {staffToPatientData} from '../../../shared/service/fixtures/staffToPatientList-data';
import {AlertBox} from '../../../shared/domain/alert-box';
import {OASuggestedData} from "../../../shared/domain/OASuggestedData";

describe('StaffScheduleComponent', () => {
  let component: StaffScheduleComponent;
  let fixture: ComponentFixture<StaffScheduleComponent>;
  let mockHttp;
  let pageGroup={
    selectedIndex:1
  }
  let oaSuggestedData=oaSuggestedDataSample2();
  const teststaffToPateintData = staffToPatientData();
  const mockRouter = jasmine.createSpyObj(['navigate']);
  const planServiceSpy: SpyObj<PlanService> = createSpyObj('PlanService', ['getPlandetails', 'createPlan','removePlanKeyFromSessionAttribute']);
  const scheduleServiceSpy: SpyObj<ScheduleService> = createSpyObj('ScheduleService', ['createSchedule', 'getScheduleDetails']);
  const alertboxSpy: SpyObj<AlertBox> = createSpyObj('AlertBox', ['removeFromShiftErrors', 'addToShiftErrors','validateshift']);
  const routerTracker: SpyObj<RouterHistoryTrackerService> = createSpyObj('RouterHistoryTrackerService', ['nextUrl']);
  let mockActivatedRoute = jasmine.createSpyObj(['queryParamMap']);
  let staffScheduleDataTest = staffScheduleData();
  let planDetailsDataTest = planDetailsData();
  let testShiftData = shiftData();
  let flag=true;
  const oaServiceSpyObj:SpyObj<OAService>=createSpyObj(['getOASuggestedData']);
  const mockMatDialogRef = jasmine.createSpyObj('dialogRef', ['close']);
  let mockMatDialog;
  mockMatDialog = jasmine.createSpyObj({
    afterClosed: createSpy('name', function () {
      return of();
    }).and.callThrough() , close: null, open: createSpy('open', function () {
      return this;
    })
  });
  mockMatDialog.componentInstance = {body: ''};
  scheduleServiceSpy.createSchedule.and.returnValue(of(staffScheduleDataTest));
  scheduleServiceSpy.getScheduleDetails.and.returnValue(of(staffScheduleDataTest));
  planServiceSpy.createPlan.and.returnValue(of());
  planServiceSpy.removePlanKeyFromSessionAttribute.and.returnValue(of());
  planServiceSpy.getPlandetails.and.returnValue(of());
  alertboxSpy.removeFromShiftErrors.and.returnValue(true);
  let map;
  const tempShiftTime = {
    startTime: {hours: -1, mins: 1},
    endTime: {hours: 1, mins: 1},
  };
  const objShiftTime = {
    startTime: {hours: 0, mins: 0},
    endTime: {hours: 1, mins: 0},
  };
  oaServiceSpyObj.getOASuggestedData.and.returnValue(of(oaSuggestedData.data[0]));
  beforeEach(waitForAsync(() => {
    mockMatDialog.open.and.callFake(() => {
     return {
       afterClosed() {
       return of(flag);
       }
     };
    });
    map = (new Map<string, string>());
    map.set('plankey', '1');
    mockActivatedRoute = {
          queryParamMap: of(map)
      };

      TestBed.configureTestingModule({
      declarations: [StaffScheduleComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{provide: HttpClient, useValue: mockHttp}, {provide: Router, useValue: mockRouter},
          // tslint:disable-next-line:max-line-length
         {provide: PlanService, useValue: planServiceSpy}, {provide: ScheduleService, useValue: scheduleServiceSpy}, {provide: ActivatedRoute, useValue: mockActivatedRoute},
        {provide: MatDialog, useValue: mockMatDialog},
        {provide: MatDialogRef, useValue: mockMatDialogRef}, {provide: OAService, useValue: oaServiceSpyObj},
        {provide: RouterHistoryTrackerService,useValue: routerTracker}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    staffScheduleDataTest = staffScheduleData();
    planDetailsDataTest = planDetailsData();
    testShiftData = shiftData();
    spyOn(component.alertBox,'openAlert');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should assign staffSchedule object by calling onSchedule method ', () => {
    component.onSchedule(staffScheduleDataTest[0]);
    expect(component.objSchedule).toEqual(staffScheduleDataTest[0]);
  });
  it('should validate all schedules and return false because day is not selected', () => {
    component.planDetails.staffScheduleList[0] = staffScheduleDataTest[0];
    for (let x = 0; x < 9; x++) {
      component.planDetails.staffScheduleList[0].scheduleDays[x] = true;
    }
    component.validateAllSchedules();
    expect(component.validateAllSchedules()).toBe(false);
  });
  it('should validate all schedules and return true because day is selected', () => {
    component.planDetails.staffScheduleList[0] = staffScheduleDataTest[1];
    component.validateAllSchedules();
    expect(component.validateAllSchedules()).toBe(true);
    expect(component.planDetails.staffScheduleList[0].errormsg[0]).toEqual('Please select a day. ');
    expect(component.planDetails.staffScheduleList[0].HasError).toBe(true);
  });
  it('should save schedule detaails and navigate to staffing-grid', function () {
    component.planDetails.planCompleted = true;
    component.planDetails.key = "dummy";
    component.previousIndex = 2;
    component.pageGroup.selectedIndex = 3;
    component.saveAndNextScheduleDetails();
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
  it('should not save schedule details if there is error in existed schedule', () => {
    component.planDetails.staffScheduleList[0] = staffScheduleDataTest[0];
    component.planDetails.staffScheduleList[1] = staffScheduleDataTest[1];
    spyOn(component, 'validateExistingSchedules').and.returnValue(true);
    component.saveAndNextScheduleDetails();
    expect(component.alertBox.openAlert).not.toHaveBeenCalled();
  });
  it('should catch error when saveAndnextScheduleDetails method called if there is no schedule present', () => {
    component.planDetails.staffScheduleList = undefined;
    spyOn(component, 'validateExistingSchedules').and.returnValue(false);
    component.saveAndNextScheduleDetails();
    expect(component.alertBox.openAlert).toHaveBeenCalledWith('exit-dialog', '175px','350px',
      'Exit Staffing Schedule Setup', component.objScheudleErrors.errmsg_Noschedule_added)
  });
  it('should  not catch an error when saveAndnextScheduleDetails method called if there is a schedule present', () => {
    component.planDetails.staffScheduleList[0] = staffScheduleDataTest[0];
    spyOn(component, 'validateExistingSchedules').and.returnValue(false);
    component.saveAndNextScheduleDetails();
    expect(component.alertBox.openAlert).not.toHaveBeenCalled();
  });

  it('should catch error when saveAndnextScheduleDetails method called if there is no schedule present', () => {
    component.objSchedule = staffScheduleDataTest[0];
    component.planDetails.staffScheduleList[0] = staffScheduleDataTest[0];
    spyOn(component, 'validateExistingSchedules').and.returnValue(false);
    component.saveAndNextScheduleDetails();
    expect(component.alertBox.openAlert).not.toHaveBeenCalled();
  });

  it('should not save schedule details if there is no schedule present', () => {
    component.saveAndNextScheduleDetails();
    expect(component.alertBox.openAlert).toHaveBeenCalledWith('exit-dialog', '175px','350px',
      'Exit Staffing Schedule Setup', component.objScheudleErrors.errmsg_Noschedule_added)
  });
  it('should not save and exit schedule details', () => {
    spyOn(component, 'validateExistingSchedules').and.returnValue(true);
    component.saveAndExitScheduleDetails();
    expect(component.alertBox.openAlert).not.toHaveBeenCalled();
  });

  it('should catch error if there is not schedule present to save schedule details', () => {
    component.planDetails.planCompleted = true;
    component.previousIndex = 1;
    component.pageGroup.selectedIndex = 4;
    component.saveAndExitScheduleDetails();
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
  it('should catch error if there is not schedule present to save schedule details', () => {
    component.planDetails.planCompleted = false;
    component.planDetails.totalAnnualHours = 2;
    component.saveAndExitScheduleDetails();
    expect(component.alertBox.openAlert).toHaveBeenCalledWith('exit-dialog', '175px','350px',
      'Exit Staffing Schedule Setup', component.objScheudleErrors.errmsg_Noschedule_added)
  });
  it('should catch error if there is not schedule present to save schedule details', () => {
    spyOn(component,'saveData');
    flag=false;
    component.planDetails.planCompleted = false;
    component.planDetails.totalAnnualHours = 2;
    component.saveAndExitScheduleDetails();
    expect(component.saveData).not.toHaveBeenCalled();
  });
  it('should catch error if there is not schedule present to save schedule details', () => {
    spyOn(component,'saveData');
    flag=true;
    component.planDetails.planCompleted = false;
    component.planDetails.totalAnnualHours = 2;
    component.saveAndExitScheduleDetails();
    expect(component.saveData).toHaveBeenCalled();
  });

  it('should catch error if there is not schedule present to save schedule details', () => {
    spyOn(component, 'validateExistingSchedules').and.returnValue(false);
    component.planDetails = planDetailsDataTest[0];
    component.planDetails.staffScheduleList = undefined;
    component.planDetails.totalAnnualHours = 2;
    component.planDetails.planCompleted = false;
    component.saveAndExitScheduleDetails();
    expect(component.alertBox.openAlert).toHaveBeenCalledWith('exit-dialog', '175px','350px',
      'Exit Staffing Schedule Setup', component.objScheudleErrors.errmsg_Noschedule_added)
  });
  it('should catch error if there is not schedule present to save schedule details', () => {
    spyOn(component, 'validateExistingSchedules').and.returnValue(true);
    component.planDetails.planCompleted = false;
    component.planDetails.totalAnnualHours = 2;
    component.saveAndExitScheduleDetails();
    expect(mockRouter.navigate).toHaveBeenCalled()
  });
  it('should catch error if there is not schedule present to save schedule details', () => {
    component.planDetails.planCompleted = false;
    component.planDetails.totalAnnualHours = -1;
    component.saveAndExitScheduleDetails();
    expect(mockRouter.navigate).toHaveBeenCalled()
  });

  it('should confirm that at least one schedule present to save schedule details and', () => {
    spyOn(component, 'validateExistingSchedules').and.returnValue(false);
    component.planDetails.staffScheduleList.length = 1;
    component.planDetails.staffScheduleList[0] = staffScheduleDataTest[0];
    component.objSchedule[0] = staffScheduleDataTest[0];
    component.objSchedule.scheduleDays[0] = true;
    component.saveAndExitScheduleDetails();
    expect(scheduleServiceSpy.createSchedule).toHaveBeenCalled();
  });
  it('should confirm that at least one schedule present to save schedule details and', () => {
    spyOn(component, 'validateExistingSchedules').and.returnValue(false);
    component.objSchedule[0] = staffScheduleDataTest[0];
    component.objSchedule.scheduleDays[0] = true;
    component.saveAndExitScheduleDetails();
    expect(scheduleServiceSpy.createSchedule).toHaveBeenCalled();
    expect(component.alertBox.openAlert).toHaveBeenCalledWith('exit-dialog', '175px','350px',
      'Exit Staffing Schedule Setup', component.objScheudleErrors.errmsg_Noschedule_added)
  });

  it('should catch error in save and exit plan details if no schedule was present', () => {
    spyOn(component, 'validateExistingSchedules').and.returnValue(false);
    component.planDetails.staffScheduleList = undefined;
    component.saveAndExitScheduleDetails();
    expect(mockRouter.navigate).toHaveBeenCalled();
  });

  it('should load schedule', () => {
    spyOn(component, 'populateSchedules');
    sessionStorage.setItem('plankey', '1');
    component.loadSchedules();

    expect(scheduleServiceSpy.getScheduleDetails).toHaveBeenCalledWith('1');
    expect(component.planDetails.staffScheduleList).toEqual(staffScheduleDataTest);
    expect(component.populateSchedules).toHaveBeenCalled();
  });
  it('should populate schedule if plan schedule list is empty', () => {
    component.planDetails.variableDepartmentPositions[0] = planDetailsDataTest[0].variableDepartmentPositions[0];
    component.populateSchedules();
    expect(component.planDetails.staffScheduleList.length).toEqual(1);
    expect(component.planDetails.staffScheduleList[0].IsMaximized).toBe(true);
  });
  it('should not add schedule if there is an error in schedule days', () => {
    spyOn(component, 'checkScheduledays').and.returnValue(true);
    component.addSchedule();
  });
  it('should not add schedule if there is an error in exsited schedule', () => {
    spyOn(component, 'validateExistingSchedules').and.returnValue(false);
    component.planDetails.variableDepartmentPositions[0] = planDetailsDataTest[0].variableDepartmentPositions[0];
    component.addSchedule();
    expect(component.planDetails.staffScheduleList.length).toBe(0);
  });
  it('should not add schedule if there is an error in exsited schedule', () => {
    spyOn(component, 'validateExistingSchedules').and.returnValue(false);
    spyOn(component, 'checkScheduledays').and.stub();
    component.planDetails.variableDepartmentPositions[0] = planDetailsDataTest[0].variableDepartmentPositions[0];
    component.planDetails.staffScheduleList = [];
    component.addSchedule();
    expect(component.planDetails.staffScheduleList.length).toBe(0);
  });

  it('should add schedule', () => {
    spyOn(component, 'validateExistingSchedules').and.returnValue(false);
    component.planDetails.staffScheduleList[0] = staffScheduleDataTest[0];
    component.planDetails.variableDepartmentPositions[0] = planDetailsDataTest[0].variableDepartmentPositions[0];
    component.addSchedule();
    expect(component.planDetails.staffScheduleList[0].IsMaximized).toBe(false);
    expect(component.planDetails.staffScheduleList[0].HasError).toBe(false);
    expect(component.planDetails.staffScheduleList[0]).toBe(staffScheduleDataTest[0]);
  });
  it('should not add schedule since schedule list is empty', () => {
    spyOn(component, 'validateExistingSchedules').and.returnValue(true);
    component.planDetails.variableDepartmentPositions[0] = planDetailsDataTest[0].variableDepartmentPositions[0];
    component.addSchedule();
  });
  it('should remove schedule if user click ok', () => {
    mockMatDialog.open.and.callFake(function () {
      return {
        afterClosed(){
          return of(true);
        }

      }

    });
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component, 'validateExistingSchedules');
    component.planDetails.staffScheduleList[0] = staffScheduleDataTest[0];
    component.removeschedule(staffScheduleDataTest[0]);
    expect(component.validateExistingSchedules).toHaveBeenCalled();
  });
  it('should not remove schedule because it was not found', () => {
    spyOn(component, 'validateExistingSchedules');
    spyOn(window, 'confirm').and.returnValue(true);
    component.removeschedule(staffScheduleDataTest[0]);
    expect(component.validateExistingSchedules).toHaveBeenCalled();
  });
  it('should not remove schedule because it was not found', () => {
    component.planDetails.staffScheduleList[0] = staffScheduleDataTest[0];
    component.planDetails.staffScheduleList[1] = staffScheduleDataTest[0];
    spyOn(component, 'validateExistingSchedules');
    spyOn(window, 'confirm').and.returnValue(true);
    component.removeschedule(staffScheduleDataTest[0]);
    expect(component.validateExistingSchedules).toHaveBeenCalled();
  });

  it('should not remove schedule if user click no', () => {
    spyOn(component, 'validateExistingSchedules');
    spyOn(window, 'confirm').and.returnValue(false);
    component.removeschedule(staffScheduleDataTest[0]);
    expect(component.validateExistingSchedules).toHaveBeenCalled();
  });
  it('should not remove schedule because it was not found', () => {
    flag=false;
    spyOn(component, 'validateExistingSchedules');
    spyOn(window, 'confirm').and.returnValue(true);
    component.removeschedule(staffScheduleDataTest[0]);
    expect(component.validateExistingSchedules).not.toHaveBeenCalled();
  });
  it('should check schedule days if schedule list is not found', () => {
    component.planDetails.staffScheduleList[0] = staffScheduleDataTest[0];
    component.objSchedule = staffScheduleDataTest[0];
    expect(component.checkScheduledays(staffScheduleDataTest[2])).toBe(true);

  });
  it('should check schedule days status if schedule list is found', () => {
    component.planDetails.staffScheduleList[0] = staffScheduleDataTest[0];
    component.objSchedule = staffScheduleDataTest[0];
    expect(component.checkScheduledays(staffScheduleDataTest[0])).toBe(undefined)
  });
  it('should check schedule days status if schedule list is found', () => {
    for (let x = 0; x < 9; x++)
      staffScheduleDataTest[0].scheduleDays[x] = true;
    component.planDetails.staffScheduleList[0] = staffScheduleDataTest[0];
    component.objSchedule = staffScheduleDataTest[0];
    component.planDetails[0]=planDetailsDataTest[0];
    component.planDetails.staffScheduleList[0]=planDetailsDataTest[0].staffScheduleList[0];
    expect(component.checkScheduledays(staffScheduleDataTest[0])).toBe(true)
  });

  it('should load plan details', () => {
    planServiceSpy.getPlandetails.and.returnValue(of(planDetailsDataTest[0]));
    localStorage.setItem('plankey', '1');
    spyOn(component, 'loadSchedules');
    component.loadplandetails();
    expect(planServiceSpy.getPlandetails).toHaveBeenCalledWith('1');
    expect(component.loadSchedules).toHaveBeenCalled();
    expect(component.planDetails).not.toBe(null);
    expect(component.entitydisplayval).toEqual(undefined);
    expect(component.departmentdisplayval).toEqual(undefined);
  });

  it('should validate existing schedule and return error if no schedule name was entered', () => {
    for (let x = 0; x < staffScheduleDataTest.length; x++) {
      component.planDetails.staffScheduleList[x] = staffScheduleDataTest[x];
    }
    spyOn(component, 'addToScheduleErrors');
    spyOn(component, 'removeFromScheduleErrors');
    component.planDetails.staffScheduleList[0].name = '';
    expect(component.validateExistingSchedules()).toBe(true);
    expect(component.addToScheduleErrors).toHaveBeenCalled;
    expect(component.removeFromScheduleErrors).toHaveBeenCalled;
    // expect(component.addToScheduleErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_dayselected_empty,
    //   staffScheduleDataTest[1]);
    // expect(component.addToScheduleErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_total_shifthour,
    //   staffScheduleDataTest[0]);
  });

  it('should validate existing schedule errors', () => {
    staffScheduleDataTest[0].planShiftList[0].hours = 24;
    component.planDetails.staffScheduleList[0] = staffScheduleDataTest[0];
    component.planDetails.staffScheduleList[1] = staffScheduleDataTest[0];
    component.planDetails.staffScheduleList[2] = staffScheduleDataTest[0];
    spyOn(component, 'addToScheduleErrors');
    spyOn(component, 'removeFromScheduleErrors');
    expect(component.validateExistingSchedules()).toBe(true);
    expect(component.addToScheduleErrors).toHaveBeenCalled;
    expect(component.removeFromScheduleErrors).toHaveBeenCalled;

  });
  it('should validate new schedule shift has an error', () => {
    component.planDetails.staffScheduleList[0] = staffScheduleDataTest[0];
    component.planDetails.staffScheduleList[1] = staffScheduleDataTest[2];
    component.planDetails.staffScheduleList[0].HasError = true;
    expect(component.validateExistingSchedules()).toBe(true);
  });
  it('should validate new schedule shift name is null', () => {
    component.planDetails.staffScheduleList[0] = staffScheduleDataTest[0];
    component.planDetails.staffScheduleList[1] = staffScheduleDataTest[2];
    component.planDetails.staffScheduleList[0].planShiftList[0].HasError = false;
    component.planDetails.staffScheduleList[0].planShiftList[0].name = '';
    expect(component.validateExistingSchedules()).toBe(true);
  });
  it('should validate new schedule shift hours not 24', () => {
    component.planDetails.staffScheduleList[0] = staffScheduleDataTest[0];
    component.planDetails.staffScheduleList[1] = staffScheduleDataTest[2];
    component.planDetails.staffScheduleList[0].planShiftList[0].HasError = false;
    expect(component.validateExistingSchedules()).toBe(true);
  });
  it('should validate new schedule shift hours to be 24', () => {
    component.planDetails.staffScheduleList[0] = staffScheduleDataTest[0];
    component.planDetails.staffScheduleList[1] = staffScheduleDataTest[2];
    component.planDetails.staffScheduleList[0].planShiftList[0].HasError = false;
    component.planDetails.staffScheduleList[0].planShiftList[0].hours = 24;
    expect(component.validateExistingSchedules()).toBe(true);
  });
  it('should validate schedule errors and return true no errors found', () => {
    expect(component.validateExistingSchedules()).toBe(true);
  });
  it('should validate shift', () => {
    spyOn(component.alertBox, 'addToShiftErrors');
    spyOn(component.alertBox, 'removeFromShiftErrors');
    component.alertBox.validateshift(testShiftData[0]);
    expect(component.alertBox.addToShiftErrors).toBeTruthy();
    expect(component.alertBox.addToShiftErrors).toBeTruthy();
    expect(component.alertBox.removeFromShiftErrors).toBeTruthy();
  });
  it('should validate shift and add it to shift errors', () => {
    spyOn(component.alertBox, 'addToShiftErrors');
    component.objSchedule.planShiftList[0] = testShiftData[1];
    component.objSchedule.planShiftList[1] = testShiftData[1];
    component.objSchedule.planShiftList[0].staffToPatientList = teststaffToPateintData;
    component.validateshift(testShiftData[1],component.objSchedule);
    expect(component.alertBox.addToShiftErrors).toBeTruthy();
  });

  it('should not add to shift errors', () => {
    component.objSchedule.planShiftList[0] = testShiftData[1];
    component.objSchedule.planShiftList[1] = testShiftData[1];
    component.objSchedule.planShiftList[1].name = '';
    component.objSchedule.planShiftList[0].staffToPatientList = teststaffToPateintData;
    component.validateshift(testShiftData[1], component.objSchedule);
    expect(component.alertBox.addToShiftErrors).toBeTruthy();
  });
  it('should add to shift errors', () => {
    testShiftData[0].errormsg = null;
    alertboxSpy.addToShiftErrors('error', testShiftData[0]);
    expect(testShiftData[0].errormsg).toBe(null);
  });
  it('should remove from schedule errors', () => {
    component.removeFromScheduleErrors('error', staffScheduleDataTest[2]);
    expect(component.removeFromScheduleErrors('error', staffScheduleDataTest[2])).toBe(false);
  });
  it('should not remove from schedule errors because error is not found', () => {
    expect(component.removeFromScheduleErrors('different', staffScheduleDataTest[2])).toBe(true);
  });
  it('should remove staff schedule from shift errors', () => {
    expect(component.alertBox.removeFromShiftErrors).toHaveBeenCalled;
  });
  it('should not remove staff schedule from shift errors', () => {
    expect(component.alertBox.removeFromShiftErrors).not.toHaveBeenCalled;
  });
  it('should validate hours shift time are equal', () => {
    tempShiftTime.startTime.hours = 0;
    objShiftTime.startTime.hours = 0;
    //spyOn(component, 'addToShiftErrors');
    //spyOn(component, 'getShifttime').and.returnValues(objShiftTime, tempShiftTime);
    component.objSchedule.planShiftList[0] = testShiftData[0];
    component.objSchedule.planShiftList[1] = testShiftData[1];
    component.objSchedule.planShiftList[0].startTime = '02:00';
    component.objSchedule.planShiftList[1].startTime = '22:00';
    component.ValidateShifttime(testShiftData[0], staffScheduleDataTest[0]);
    expect(component.alertBox.removeFromShiftErrors).toHaveBeenCalled;
    //expect(component.addToShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_time_diff_exceeds, testShiftData[0]);
  });
  it('should validate temp. shift end time > object shift start time', () => {
    tempShiftTime.startTime.hours = 0;
    tempShiftTime.endTime.hours = 2;
    objShiftTime.startTime.hours = 1;
    objShiftTime.endTime.hours = 3;
    //spyOn(component, 'addToShiftErrors');
    //spyOn(component, 'getShifttime').and.returnValues(objShiftTime, tempShiftTime);
    component.ValidateShifttime(testShiftData[0], staffScheduleDataTest[0]);
    expect(component.alertBox.removeFromShiftErrors).toHaveBeenCalled;
    //expect(component.addToShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_shift_time_overlaps, testShiftData[0]);
  });
  it('should validate temp. shift end time = object shift start time and object start hours time > tem. start hours time ', () => {
    tempShiftTime.startTime.hours = 0;
    tempShiftTime.endTime.hours =4;
    objShiftTime.startTime.hours = 2;
    objShiftTime.endTime.hours =3;
    //spyOn(component, 'addToShiftErrors');
    //spyOn(component, 'getShifttime').and.returnValues(objShiftTime, tempShiftTime);
    component.ValidateShifttime(testShiftData[0], staffScheduleDataTest[0]);
    expect(component.alertBox.removeFromShiftErrors).toHaveBeenCalled;
    //expect(component.addToShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_shift_time_overlaps, testShiftData[0]);
  });
  it('should validate temp. shift end time = object shift start time and object start hours time > tem. start hours time ', () => {
    tempShiftTime.startTime.hours = 12;
    tempShiftTime.endTime.hours = 16;
    objShiftTime.endTime.hours = 14;
    objShiftTime.startTime.hours = 2;
    //spyOn(component, 'addToShiftErrors');
    //spyOn(component, 'getShifttime').and.returnValues(objShiftTime, tempShiftTime);
    component.ValidateShifttime(testShiftData[0], staffScheduleDataTest[0]);
    expect(component.alertBox.removeFromShiftErrors).toHaveBeenCalled;
    //expect(component.addToShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_shift_time_overlaps, testShiftData[0]);
  });
  it('should validate temp. shift end time = object shift start time and object start hours time > tem. start hours time ', () => {
    tempShiftTime.startTime.hours = 1;
    tempShiftTime.endTime.hours = 5;
    objShiftTime.startTime.hours = 0;
    objShiftTime.endTime.hours = 4;
    //spyOn(component, 'addToShiftErrors');
    //spyOn(component, 'getShifttime').and.returnValues(objShiftTime, tempShiftTime);
    component.ValidateShifttime(testShiftData[0], staffScheduleDataTest[0]);
    expect(component.alertBox.removeFromShiftErrors).toHaveBeenCalled;
    //expect(component.addToShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_shift_time_overlaps, testShiftData[0]);
  });

  it('should validate obj. shift end time hours = temp. shift start time hours and obj. ' +
    'shift end time hours < temp. end time. hours ', () => {
    tempShiftTime.startTime.hours = 1;
    tempShiftTime.endTime.hours = 2;
    objShiftTime.startTime.hours = 0;
    objShiftTime.endTime.hours = 1;
    //spyOn(component, 'removeFromShiftErrors');
    //spyOn(component, 'getShifttime').and.returnValues(objShiftTime, tempShiftTime);
    component.ValidateShifttime(testShiftData[0], staffScheduleDataTest[0]);
    expect(component.addToScheduleErrors).toHaveBeenCalled;
    //expect(component.removeFromShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_shift_time_overlaps, testShiftData[0]);
  });
  it('should validate obj. shift end time hours = temp. shift start time hours and obj. ' +
    'shift end time hours < temp. end time. hours ', () => {
    tempShiftTime.startTime.hours = 1;
    tempShiftTime.endTime.hours = 2;
    tempShiftTime.endTime.mins = -1;
    objShiftTime.startTime.hours = 0;
    objShiftTime.endTime.hours = 1;
    objShiftTime.endTime.mins = 1;
    tempShiftTime.startTime.mins = 0;
    //spyOn(component, 'addToShiftErrors');
    //spyOn(component, 'getShifttime').and.returnValues(objShiftTime, tempShiftTime);
    component.ValidateShifttime(testShiftData[0], staffScheduleDataTest[0]);
    expect(component.alertBox.removeFromShiftErrors).toHaveBeenCalledWith;
    //expect(component.addToShiftErrors).toHaveBeenCalledWith(component.objScheudleErrors.errmsg_shift_time_overlaps, testShiftData[0]);
  });
  it('should not validate shift time because it is not set ', () => {
    spyOn(component.alertBox, 'addToShiftErrors');
    spyOn(component, 'getShifttime').and.returnValues(null, null);
    component.ValidateShifttime(testShiftData[0], staffScheduleDataTest[0]);
  });
  it('should load button text', () => {
    planDetailsDataTest[0].planCompleted = false;
    component.planDetails = planDetailsDataTest[0];
    component.loadButtontext();
    component.btnExittxt = 'Save & Exit';
    component.btnNexttxt = 'Save & Next';
  });
  it('should not remove schedule from schedule errors because error message is null', () => {
    staffScheduleDataTest[0].errormsg = null;
    expect(component.removeFromScheduleErrors('test', staffScheduleDataTest[0])).toBe(false);
  });
  it('should not get shift time when time format flag is false', () => {
    spyOn(component.alertBox,'getShifttime');
    testShiftData[0].timeFormatFlag = false;
    component.getShifttime(testShiftData[0]);
    expect(component.alertBox.getShifttime).toHaveBeenCalled()
  });
  it('should click on back button', () => {
    component.planDetails=planDetailsDataTest[0];
    flag=true;
    planDetailsDataTest[0].planCompleted = false;
    component.planDetails = planDetailsDataTest[0];
    component.previousIndex = 2;
    component.pageGroup.selectedIndex = 1;
    component.clickonbackbutton();
    expect(mockMatDialog.open).toHaveBeenCalled();
    // expect(mockRouter.navigate).toHaveBeenCalledWith(['/staffing-grid'] );
  });
  it('should click on back button2', () => {
    component.planDetails=planDetailsDataTest[0];
    flag=false;
    planDetailsDataTest[0].planCompleted = false;
    component.planDetails = planDetailsDataTest[0];
    component.previousIndex = 2;
    component.pageGroup.selectedIndex = 1;
    component.clickonbackbutton();
    expect(mockMatDialog.open).toHaveBeenCalled();
    // expect(mockRouter.navigate).toHaveBeenCalledWith(['/staffing-grid']);
  });
  it('should click on back button3', () => {
    component.planDetails=planDetailsDataTest[0];
    planDetailsDataTest[0].planCompleted = true;
    component.planDetails = planDetailsDataTest[0];
    component.previousIndex = 2;
    component.pageGroup.selectedIndex = 1;
    component.clickonbackbutton();
    expect(mockMatDialog.open).toHaveBeenCalled();
    // expect(mockRouter.navigate).toHaveBeenCalledWith(['/staffing-grid']);
  });
  it('should click on back button4', () => {
    planDetailsDataTest[0].planCompleted = false;
    component.planDetails = planDetailsDataTest[0];
    component.previousIndex = 2;
    component.pageGroup.selectedIndex = 1;
    component.clickonbackbutton();
    component.alertBox.openAlertWithReturn('exit-dialog','190px','600px',
      'Exit Staffing Schedule Setup',
      'Going back will lead to loss of data entered in the Schedule Setup . Click on yes to continue?');
    // expect(mockRouter.navigate).toHaveBeenCalledWith(['/staffing-grid']);
  });
  it('should click on back button ', function () {
    flag=true;
    mockMatDialog.open.and.callFake(function () {
      return {
        afterClosed(){
          return of(flag,ConfirmWindowOptions.exit);
        }
      }
    });
    spyOn(component,'clickOnTabOrCancelButton').and.stub();
    component.planDetails=planDetailsDataTest[0];
    component.planDetails.planCompleted=false;
    spyOn(component,'checkIfPlanEdited').and.returnValue(true);
    spyOn(component,'validateExistingSchedules').and.returnValue(true);
    component.clickonbackbutton();
    expect(component.clickOnTabOrCancelButton).toHaveBeenCalled();
    expect(component.pageGroup.selectedIndex).toBe(component.previousIndex)
  });
  it('should checkIfPlanEdited', function () {
    component.planDetails=planDetailsDataTest[0];
    component.strplanDetails='wow';
    expect(component.checkIfPlanEdited()).toBe(true);

  });
  it('should click on back button ', function () {
    flag=true;
    mockMatDialog.open.and.callFake(function () {
      return {
        afterClosed(){
          return of(flag,ConfirmWindowOptions.exit);
        }
      }
    });
    spyOn(component,'clickOnTabOrCancelButton').and.stub();
    component.planDetails=planDetailsDataTest[0];
    component.planDetails.planCompleted=false;
    spyOn(component,'checkIfPlanEdited').and.returnValue(false);
    spyOn(component,'validateExistingSchedules').and.returnValue(true);
    component.clickonbackbutton();
    expect(component.clickOnTabOrCancelButton).toHaveBeenCalled();
    expect(component.pageGroup.selectedIndex).toBe(undefined)
  });
  it('should click on back button ', function () {
    flag=true;
    mockMatDialog.open.and.callFake(function () {
      return {
        afterClosed(){
          return of(flag,ConfirmWindowOptions.exit);
        }
      }
    });
    spyOn(component,'clickOnTabOrCancelButton').and.stub();
    component.planDetails=planDetailsDataTest[0];
    component.planDetails.planCompleted=false;
    spyOn(component,'checkIfPlanEdited').and.returnValue(true);
    spyOn(component,'validateExistingSchedules').and.returnValue(false);
    spyOn(component,'saveAndNextScheduleDetails');
    component.clickonbackbutton();
    expect(component.clickOnTabOrCancelButton).toHaveBeenCalled();
    expect(component.saveAndNextScheduleDetails).toHaveBeenCalled();
    expect(component.pageGroup.selectedIndex).toBe(undefined)
  });
  it('should click on back button ', function () {
    flag=false;
    mockMatDialog.open.and.callFake(function () {
      return {
        afterClosed(){
          return of(flag,ConfirmWindowOptions.exit);
        }
      }
    });
    spyOn(component,'clickOnTabOrCancelButton').and.stub();
    component.planDetails=planDetailsDataTest[0];
    component.planDetails.planCompleted=false;
    spyOn(component,'checkIfPlanEdited').and.returnValue(true);
    spyOn(component,'validateExistingSchedules').and.returnValue(false);
    spyOn(component,'saveAndNextScheduleDetails');
    component.clickonbackbutton();
    expect(component.clickOnTabOrCancelButton).toHaveBeenCalled();
    expect(component.saveAndNextScheduleDetails).not.toHaveBeenCalled();
    expect(component.pageGroup.selectedIndex).toBe(component.previousIndex)
  });
  it('should update data from oa', function () {
    planDetailsDataTest[0].effectiveStartDate=new Date('1');
    spyOn(component.alertBox,'loadOAPlanDataEntity').and.stub();
    spyOn(component,'getSuggestedData').and.stub();
    component.planDetails=planDetailsDataTest[0];
    component.updateDataFromOA();
    expect(component.getSuggestedData).toHaveBeenCalled();
  });
  it('should get suggested data', function () {
    //component.oAPlanDataEntity=oaPlanData[0];
    oaServiceSpyObj.getOASuggestedData.and.returnValue(of(oaSuggestedData.data[0]));
    component.getSuggestedData();
    expect(component.entitydisplayval).not.toBe(null);
    expect(component.departmentdisplayval ).not.toBe(null);
    expect(component.primaryWHpUdisplayval ).not.toBe(null);
  });
  it('should get suggested data', function () {
    //component.oAPlanDataEntity=oaPlanData[0];
    spyOn(component,'getDaysInplanYear').and.returnValue(2);
    component.planDetails=planDetailsDataTest[0];
    component.planDetails.budgetAverageVolume=0;
    oaServiceSpyObj.getOASuggestedData.and.returnValue(of(oaSuggestedData.data[0]));
    component.getSuggestedData();
    expect(component.entitydisplayval).not.toBe(null);
    expect(component.departmentdisplayval ).not.toBe(null);
    expect(component.primaryWHpUdisplayval ).not.toBe(null);
    expect(component.annualBudgetdisplayval).toBe('-');
  });
  it('should find leap year', function () {
    let date = new Date('01/01/2020');
    component.planDetails.effectiveEndDate = date;
    expect(component.getDaysInplanYear()).toBe(366);
  });

  it('should validate existing schedule and return false', function () {
    for (let x = 0; x < 9; x++)
      planDetailsDataTest[0].staffScheduleList[0].scheduleDays[x] = true;
    component.planDetails = planDetailsDataTest[0];
    component.planDetails.staffScheduleList[0] = planDetailsDataTest[0].staffScheduleList[0];
    expect(component.validateExistingSchedules()).toBe(true);
  });
  it('should check tab change', function () {
    spyOn(component,'clickonbackbutton');
    component.checkTabChange();
    expect(component.clickonbackbutton).toHaveBeenCalled()
  });
  it('should check tab change', function () {
    component.previousIndex=1;
    component.pageGroup=pageGroup;
    spyOn(component,'clickonbackbutton');
    component.checkTabChange();
    expect(component.clickonbackbutton).not.toHaveBeenCalled()
  });
  it('should check tab change', function () {

    component.previousIndex=1;
    component.pageGroup=pageGroup;
    spyOn(component,'clickonbackbutton');
    component.clickOnTabOrCancelButton();
    expect(component.clickonbackbutton).not.toHaveBeenCalled()
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
  it('should loadOtherPages', function () {
    component.pageGroup=pageGroup;
    component.pageGroup.selectedIndex=0;
    component.loadOtherPages()
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
  it('should loadOtherPages', function () {
    component.pageGroup=pageGroup;
    component.pageGroup.selectedIndex=2;
    component.loadOtherPages()
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
  it('should loadOtherPages', function () {
    component.pageGroup=pageGroup;
    component.pageGroup.selectedIndex=4;
    component.loadOtherPages()
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
});
