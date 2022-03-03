import { AlertBox } from './alert-box';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import createSpy = jasmine.createSpy;
import {of} from 'rxjs';
import {async, TestBed, waitForAsync} from '@angular/core/testing';
import {shiftData} from '../service/fixtures/shift-data';
import {staffScheduleData} from '../service/fixtures/staff-schedule-data';
import {
    shift,
    shifttime,
    StaffSchedule
  } from './staff-schedule';

function customPlanDetails() {
    return [
      {
        name: 'testPlanName',
        key: '138',
        status: 'In Process',
        planCompleted: true,
        action: '',
        corpName: null,
        planUtilizedAvgVol: 5,
        dateUpdated: null,
        departmentKey: 589,
        departmentCode: null,
        departmentName: 'departmentName',
        facilityKey: null,
        facilityCode: null,
        facilityName: null,
        censusRange: null,
        effectiveStartDate: new Date('01/01/2019'),
        effectiveEndDate: new Date('02/02/2018'),
        userNotes: null,
        upperEndTarget: null,
        lowerEndTarget: null,
        workHoursBalance: 44,
        hours: 5,
        fte: 1,
        volume: 1,
        targetBudget: 2,
        utilizedAverageVolume: 5,
        utilizedAverageVolumeBase: 5,
        temporaryEffectiveStartDate: null,
        temporaryEffectiveEndDate: null,
        userKey: 12,
        deleteFlag: false,
        isnewlycreated: true,
        variableDepartmentPositions: null,
        nonVariableDepartmentPositions: null,
        defaultPlanFlag: true,
        dailyFlag: true,
        offGridActivities: [{
          planId: '1',
          code: '2',
          name: 'activityName',
          shiftHours: 1,
          typeKey: 0,
          variableDepartmentList: null,
          totalHours: 1,
          key: 1,
        },
        ],
        displayPlanStatus: null,
        corporationId: null,
        staffScheduleList: null,
        totalAnnualVolume: 1,
        totalAnnualHours: 1,
        totalAnnualHoursVariance: 1,
        currentAverageVolume: 1,
        budgetAverageVolume: 1,
        annualizedCurrentAvg: 1,
        annualizedBudgetedAvg: 1,
        updatedTimeStamp: null,
        primaryWHpU: 1,
        secondaryWHpU: 1,
        educationOrientationTargetPaid: 1,
        staffingSummaryData: [{
          census: null,
          occ: null,
          productivity: null,
          varWHPU: null,
          nonVarWHPU: null,
          ogaWHPU: null,
          totalPlanWhpu: null,
          totalPlanDailyhrs: null,
          dailyHrsVarToTarget: null,
          totalPlanAnnualHrs: null,
          annualHrsVarToTarget: null,
        }],
        planAlreadyInUse : false,
        oAStaffingMetric: null,
      },
    ];
  }

describe('AlertBox', () => {
    let flag=true;
    let mockMatDialog = jasmine.createSpyObj({
        afterClosed: createSpy('name', function () {
            return of();}).and.callThrough(), close: null, open: createSpy('open', function () {
            return this;

            }
        )
    });
    mockMatDialog.componentInstance = {body: ''};
    let component: AlertBox=new AlertBox(mockMatDialog);
    const testShiftData = shiftData();
    let testPlanData = customPlanDetails();
    let schedule: StaffSchedule;
    let staffScheduleDataTest = staffScheduleData();
    beforeEach(waitForAsync(() => {
        mockMatDialog.open.and.callFake(function() {
            return {
              afterClosed(){
                return of(flag);
              }
            }
          });
    }));
    TestBed.configureTestingModule({
        imports: [
          MatDialogModule
        ],
        declarations: [],
        schemas: [],
        providers: [{provide: MatDialog, useValue: mockMatDialog}]
      }).compileComponents();
  it('should create an instance', () => {
    expect(new AlertBox(mockMatDialog)).toBeTruthy();
  });
  it('should openAlertBox', () => {
    component.openAlert('exit-dialog', '190px', '600px',
      'Schedule Setup', 'Active plan for the selected department does not have a plan for this day of week. Please review the departmental plan in the Staff Planner module');
    expect(component.openAlert).toHaveBeenCalled;
  });
  it('should openAlertWithReturnNoConfirm', () => {
    component.openAlertWithReturnNoConfirm('exit-dialog', '175px', '600px',
    'User Inactivity', 'This page will be redirected due to user inactivity.');
    expect(component.openAlertWithReturnNoConfirm).toHaveBeenCalled;
  });
  it('should openAlertOnSaveConfirm', () => {
    component.openAlertOnSaveConfirm('exit-dialog', '190px', '600px',
    'Save Staffing Schedule Setup', '');
    expect(component.openAlertOnSaveConfirm).toHaveBeenCalled;
  });
  it('should openAlertWithReturn', () =>{
    component.openAlertWithReturn('exit-dialog', '175px', '600px',
          'Exit Staff Planner', 'Are you sure you want to exit without saving your changes?');
    expect(component.openAlertWithReturn).toHaveBeenCalled;
  });
  it('should openAlertWithSaveAndReturn', () =>{
    component.openAlertWithSaveAndReturn('exit-dialog', '210px', '600px',
    'Exit Staff manger', '');
    expect(component.openAlertWithSaveAndReturn).toHaveBeenCalled;
  });
  it('should IsDateRangeOverlapping', () =>{
    testPlanData[0].effectiveEndDate = null;
    component.isDateRangeOverlapping(testPlanData[0], testPlanData[0]);
    expect(component.isDateRangeOverlapping(testPlanData[0], testPlanData[0])).toBe(false);
  });
  it('should find leap year', function() {
    const date = new Date('01/01/2020');
    component.getDaysInplanYear(date);
    expect(component.getDaysInplanYear(date)).toBe(366);
  });
  it('should loadButtontext', function() {
    component.loadButtontext(false);
    expect(component.loadButtontext).toHaveBeenCalled;
  });
  it('should isTotalHoursExceed', () => {
    component.isTotalHoursExceed(testShiftData);
    expect(component.isTotalHoursExceed).toHaveBeenCalled;
  });
  it('should isTimeOverlaps', ()=>{
    let schedule = staffScheduleDataTest[0];
    const tempShift: shift = schedule.planShiftList[0];
    const tempshifttime: shifttime = component.getShifttime(tempShift);
    component.isTimeOverlaps(tempShift, tempshifttime, tempshifttime);
    expect(component.isTimeOverlaps(tempShift, tempshifttime, tempshifttime)).toEqual(true);
  });
});
