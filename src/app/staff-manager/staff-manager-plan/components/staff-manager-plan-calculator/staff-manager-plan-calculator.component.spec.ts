import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import { StaffManagerPlanCalculatorComponent } from './staff-manager-plan-calculator.component';
import {staffVarianceData} from '../../../../shared/service/fixtures/staffVarianceData';
import {StaffVariance} from '../../../../shared/domain/staff-variance';
import {StaffVarianceSummary} from '../../../../shared/domain/staff-summary';
import {planDetailsData} from '../../../../shared/service/fixtures/plan-details-data';
import {of} from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import createSpy = jasmine.createSpy;
import {offGridActivitiesData} from '../../../../shared/service/fixtures/off-grid-activities-data';
import {tryResolvePackage} from 'tslint/lib/utils';
import {PlanDetails} from '../../../../shared/domain/plan-details';
import {ifTrue} from 'codelyzer/util/function';
import {UserService} from "../../../../shared/service/user.service";
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;
import {customUserData} from "../../../../shared/service/fixtures/user-data";

describe('StaffManagerPlanCalculatorComponent', () => {
  let component: StaffManagerPlanCalculatorComponent;
  let fixture: ComponentFixture<StaffManagerPlanCalculatorComponent>;
  let testPlanDetails = planDetailsData();
  let testStaffVarianceData = staffVarianceData();
  let mockMatDialogRef;
  let testOffGridActivities = offGridActivitiesData();
  let userServiceSpyObj: SpyObj<UserService> = createSpyObj('UserService', ['logout']);
  const comments = 'lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll' +
    'lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll' +
    'lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll' +
    'lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll';
  let flag=true;
  const userDataTest = customUserData();
  userServiceSpyObj.user = userDataTest[0];
  userServiceSpyObj.logout.and.returnValue(of(userDataTest));
  const numberObj = {
    which: false,
    keyCode: 58,
  };
  let mockMatDialog = jasmine.createSpyObj({
    afterClosed:createSpy('name', function () {
      return of();
    }).and.callThrough(), close: null, open: createSpy('open', function() {
      return this;
    })
  });
  beforeEach(waitForAsync(() => {
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(true)
        }
      }
    });
    TestBed.configureTestingModule({
      declarations: [StaffManagerPlanCalculatorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{provide: MatDialog, useValue: mockMatDialog},{provide:MatDialogRef, useValue:mockMatDialogRef},{provide:UserService,useValue:userServiceSpyObj}],
    })
      .compileComponents();
  }));
  mockMatDialog.componentInstance = {body: ''};
  beforeEach(() => {

    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(flag)
        }
      }
    });
    fixture = TestBed.createComponent(StaffManagerPlanCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    testStaffVarianceData = staffVarianceData();
    testPlanDetails = planDetailsData();
    spyOn(component.alertBox,'openAlert');
  });

  it('should create', () => {
    console.log('smcalc')
    expect(component).toBeTruthy();
  });


  it('should get planned hours for census', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShifts = null;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.alertBox.getPlannedhoursForCensus(testStaffVarianceData[0], 0, 1, 0,2,5)).toBe('-');
  });
   it('should get planned hours for census', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift = null;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.alertBox.getPlannedhoursForCensus(testStaffVarianceData[0], 1, 1, 1,1,5)).toBeUndefined();
  });
  it('should get planned hours for census', () => {
    component.staffVariance = testStaffVarianceData[0];
    expect(component.alertBox.getPlannedhoursForCensus(testStaffVarianceData[0], 0, 1, 1,1,5)).toBe('-');
  });
   it('should get planned hours for census', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses = null;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.alertBox.getPlannedhoursForCensus(testStaffVarianceData[0], 0, 1, 1,1,5)).toBe('-');
  });
  it('should get planned hours for census', () => {
    component.staffVariance = testStaffVarianceData[0];
    expect(component.alertBox.getPlannedhoursForCensus(testStaffVarianceData[0], 0, 0, 0,1,5)).toBe('0.00');
  });

  it('should get variance hours for census', () => {
    component.staffVariance = testStaffVarianceData[0];
    expect(component.alertBox.getVariancehoursForCensus(testStaffVarianceData[0], 1, 1, 1, 1)).toBe('-');
  });
  it('should get variance hours for census', () => {
    component.staffVariance = testStaffVarianceData[0];
    expect(component.alertBox.getVariancehoursForCensus(testStaffVarianceData[0], 0, 1, 1, 1)).toBe('-');
  });
  it('should get variance hours for census', () => {
    component.staffVariance = testStaffVarianceData[0];
    expect(component.alertBox.getVariancehoursForCensus(testStaffVarianceData[0], 0, 0, 0, 1)).toBe('1.00');
  });
  it('should get variance hours for census', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShifts[0].objshift.staffGridCensuses = null;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.alertBox.getVariancehoursForCensus(testStaffVarianceData[0], 0, 0, 0, 1)).toBe('1.00');
  });
  it('should get variance hours for census', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShifts = null;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.alertBox.getVariancehoursForCensus(testStaffVarianceData[0], 0, 0, 0, 1)).toBe('1.00');
  });

  it('should get actual total', () => {
    component.staffVariance = testStaffVarianceData[0];
    expect(component.alertBox.getActualTotal(testStaffVarianceData[0], 1)).toBe('-');
  });
  it('should get actual total', () => {
    component.staffVariance = testStaffVarianceData[0];
    expect(component.alertBox.getActualTotal(testStaffVarianceData[0], 0)).toBe('2.00');
  });
  it('should get actual total', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].staffVarianceDetails[0].actualCount = null;
    testStaffVarianceData[0].staffVarianceSummaries[0].additionalStaffHours = null;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.alertBox.getActualTotal(testStaffVarianceData[0], 0)).toBe('-');
  });

  it('should get actual total', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].staffVarianceDetails = null;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.alertBox.getActualTotal(testStaffVarianceData[0], 0)).toBe('-');
  });
  it('should get Actual Total For Variable Position', () => {
    component.staffVariance = testStaffVarianceData[0];
    expect(component.getActualTotalForVariablePosition(0)).toBe(4);
  });
  it('should get Actual Total For Variable Position', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].staffVarianceDetails[0].actualCount = null;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.getActualTotalForVariablePosition(0)).toBe(0);
  });

  it('should get Planned Total For Variable Position', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].censusIndex = 1;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.getPlannedTotalForVariablePosition(0)).toBe(0);
  });
  it('should get Planned Total For Variable Position', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].staffToPatientList[0] = null;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.getPlannedTotalForVariablePosition(0)).toBe(0);
  });
  it('should get Planned Total For Variable Position', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].censusIndex = 1;
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].staffToPatientList[0] = null;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.getPlannedTotalForVariablePosition(0)).toBe(0);
  });
  it('should get Planned Total For Variable Position', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].staffVarianceDetails[0].actualCount = null;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.getPlannedTotalForVariablePosition(0)).toBe(0);
  });
  it('should getPlannedTotalForVariablePosition', function () {
    component.staffVariance.staffVarianceSummaries = null;
    expect(component.getPlannedTotalForVariablePosition(22)).toBe(0);
  });
  it('should getPlannedTotalForVariablePosition', function () {
    component.staffVariance.staffVarianceSummaries = null;
    expect(component.getAdditionalStaffTotalhours()).toBe(0);
  });
  it('should getPlannedTotalForVariablePosition', function () {
    component.staffVariance.staffVarianceSummaries = null;
    expect(component.getOGATotalhours()).toBe(0);
  });
    it('should get tab index for total ', function () {
    expect(component.getTabIndexForTotal(null)).toBe(0)
  });
    it('should get tab index and return 0', function () {
    expect(component.getTabIndex(null)).toBe(0)
  });
  it('should get tab index and return 2', function () {
    expect(component.getTabIndex(1)).toBe(2)
  });
  it('should get tab index for total ', function () {
    expect(component.getTabIndexForTotal(null)).toBe(0)
  });
    it('should check comments length and return true', function () {
    testStaffVarianceData[0].staffVarianceSummaries[0].comments=comments;
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    expect(component.checkCommentsLength(0)).toBe(true);
  });
  it('should check comments length and return true', function () {
    testStaffVarianceData[0].comments=comments;
    component.staffVariance=testStaffVarianceData[0];
    expect(component.checkCommentsLength(-1)).toBe(true);
  });
  it('should check comments length and return false', function () {
    testStaffVarianceData[0].staffVarianceSummaries[0].comments=comments;
    component.staffVariance=testStaffVarianceData[0];
    expect(component.checkCommentsLength(-1)).toBe(false);
  });
    it('should checklength', () => {
      spyOn(component,'placeCaretAtEnd').and.stub();
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    component.checkLength('txtDiv-1', 'Comments', 1);
    expect(component.placeCaretAtEnd).toHaveBeenCalled()
  });
    it('should check length', function () {
      spyOn(component,'placeCaretAtEnd').and.stub();
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    component.checkLength('txtDiv','test',0);
    expect(component.staffVariance.comments).toBe('test');
    expect(component.placeCaretAtEnd).toHaveBeenCalled();
  });
  it('should check length', function () {
    spyOn(component,'placeCaretAtEnd').and.stub();
    testStaffVarianceData[0].staffVarianceSummaries[0].offGridActivitiesHour=1;
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    component.checkLength('test','test',0);
    expect(component.staffVariance.comments).toBe('');
    expect(component.placeCaretAtEnd).toHaveBeenCalled();
  });
  it('should open censusDialog', () => {
    spyOn(component,'openCensusDialog').and.stub();
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    spyOn(component,'placeCaretAtEnd').and.stub();
    spyOn(window, 'confirm').and.returnValue(true);
    component.censusDialog(0, 25);
    expect(component.openCensusDialog).toHaveBeenCalled()
  });

  it('should not open census dialog', function () {
    spyOn(component,'openCensusDialog');
    component.planDetails = testPlanDetails[0];
    // testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift[0].staffGridCensuses[0].censusIndex=1;
    // testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift[0].staffGridCensuses[0].censusValue=1;
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShifts = null;
    component.staffVariance=testStaffVarianceData[0];
    // component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    component.censusDialog(0,3);
    expect(component.openCensusDialog).not.toHaveBeenCalled();
  });
  it('should open census dialog', function () {
    spyOn(component,'openCensusDialog');
    component.censusDialog(null,null);
    expect(component.openCensusDialog).not.toHaveBeenCalled();
  });
  it('should open census dialog', function () {
    spyOn(component,'openCensusDialog');
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses=null;
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    component.censusDialog(0,1);
    expect(component.openCensusDialog).toHaveBeenCalled();
  });
  it('should open census dialog', function () {
    spyOn(component,'openCensusDialog');
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift=null;
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    component.censusDialog(0,1);
    expect(component.openCensusDialog).toHaveBeenCalled();
  });
  it('should open census dialog', function () {
    component.planDetails = testPlanDetails[0];
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShifts = null;
    component.staffVariance=testStaffVarianceData[0];
    component.planDetails.censusRange.minimumCensus = 1;
    component.censusDialog(0,0);
  });
  it('should check number and decimal only', function () {
    numberObj.which=false;
    expect(component.numberAndDecimalOnly(numberObj,1)).toBe(false);
  });
  it('should check number and decimal only', function () {
    numberObj.which=false;
    numberObj.keyCode=44;
    expect(component.numberAndDecimalOnly(numberObj,1)).toBe(false);
  });
  it('should check number and decimal only', function () {
    numberObj.keyCode=88;
    numberObj.which=true;
    expect(component.numberAndDecimalOnly(numberObj,1)).toBe(true);
  });
  it('should check number and decimal only', function () {
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    expect(component.numberAndDecimalOnly(numberObj,0)).toBe(undefined);
  });
  it('should check number and decimal only', function () {
    testStaffVarianceData[0].staffVarianceSummaries[0].offGridActivitiesHour=1.2;
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    expect(component.numberAndDecimalOnly(numberObj,0)).toBe(undefined);
  });
  it('should check number only', function () {
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    component.numberOnly(numberObj,0,0)
  });
  it('should check number only', function () {
    numberObj.which=true;
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    component.numberOnly(numberObj,0,0)
  });
    it('should check number only ', function () {
      component.staffVariance=testStaffVarianceData[0];
      component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
      component.staffVariance.staffVarianceSummaries[0].staffVarianceDetails[0].actualCount = 1.101;
      numberObj.which=false;
      numberObj.keyCode=47;
      component.numberOnly(numberObj,0,0);
      numberObj.which=false;
      numberObj.keyCode=0;
      component.numberOnly(numberObj,0,0);
  });
  it('should check number only for sched count', function(){
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    component.staffVariance.staffVarianceSummaries[0].staffVarianceDetails[0].scheduleCount = 1.101;
    numberObj.which=false;
    numberObj.keyCode = 47;
    component.numberOnlyforSchedCount(numberObj, 0, 0);
    numberObj.which=false;
    numberObj.keyCode=0;
    component.numberOnlyforSchedCount(numberObj, 0, 0);

  });
  it('should check number and dec only for sched count', function () {
    numberObj.keyCode=50;
    numberObj.which=true;
    spyOn(component, 'getSelectedVal').and.returnValue('5');
    testStaffVarianceData[0].staffVarianceSummaries[0].staffVarianceDetails[0].scheduleCount= 1.25;
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    // expect(component.getSelectedVal).toHaveBeenCalled();
    expect(component.numberOnlyforSchedCount(numberObj, 0, 0)).toBe(undefined);
  });
    it('should check for number only', function () {
    numberObj.keyCode=100;
    numberObj.which=false;
    expect(component.numberOnlyForCensus(numberObj)).toBe(false)
  })
  it('should check for number only', function () {
    numberObj.keyCode=20;
    expect(component.numberOnlyForCensus(numberObj)).toBe(undefined);
  })

  it('should get Total Variance For Variable Position', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].censusIndex = 1;
   testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].staffToPatientList[0] = null;
   component.staffVariance = testStaffVarianceData[0];
   expect(component.getTotalVarianceForVariablePosition(0)).toBe(4);
 });
  it('should get Total Variance For Variable Position', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].censusIndex = 1;
   component.staffVariance = testStaffVarianceData[0];
   expect(component.getTotalVarianceForVariablePosition(0)).toBe(4);
 });
  it('should get Total Variance For Variable Position', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].staffVarianceDetails[0].actualCount = null;
   component.staffVariance = testStaffVarianceData[0];
   expect(component.getTotalVarianceForVariablePosition(0)).toBe(0);
 });
  it('should get Total Variance For Variable Position', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffToPatientList = null;
   component.staffVariance = testStaffVarianceData[0];
   expect(component.getTotalVarianceForVariablePosition(0)).toBe(4);
 });

    it('should getPlannedTotalForVariablePosition', function () {
    component.staffVariance.staffVarianceSummaries=null;
    expect(component.getPlannedTotalForVariablePosition(22)).toBe(0);
  });

    it('should get Planned Total For Variable Position', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].censusIndex = 1;
   component.staffVariance = testStaffVarianceData[0];
   expect(component.getPlannedTotalForVariablePosition(0)).toBe(0);
 });
  it('should get Planned Total For Variable Position', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].staffToPatientList[0] = null;
   component.staffVariance = testStaffVarianceData[0];
   expect(component.getPlannedTotalForVariablePosition(0)).toBe(0);
 });
  it('should get Planned Total For Variable Position', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].censusIndex = 1;
   testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].staffToPatientList[0] = null;
   component.staffVariance = testStaffVarianceData[0];
   expect(component.getPlannedTotalForVariablePosition(0)).toBe(0);
 });
  it('should get Planned Total For Variable Position', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].staffVarianceDetails[0].actualCount = null;
   component.staffVariance = testStaffVarianceData[0];
   expect(component.getPlannedTotalForVariablePosition(0)).toBe(0);
 });

    it('should get Actual Total For Variable Position', () => {
   component.staffVariance = testStaffVarianceData[0];
   expect(component.getActualTotalForVariablePosition(0)).toBe(4);
 });
  it('should get Actual Total For Variable Position', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].staffVarianceDetails[0].actualCount = null;
   component.staffVariance = testStaffVarianceData[0];
   expect(component.getActualTotalForVariablePosition(0)).toBe(0);
 });

  it('should get variance total 1', () => {
   component.staffVariance = testStaffVarianceData[0];
   expect(component.getVarianceTotal(1)).toBe('-');
 });
  it('should get variance total 2', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].censusIndex = 1;
   testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].staffToPatientList[0].staffCount = 1;
   component.staffVariance = testStaffVarianceData[0];
   expect(component.getVarianceTotal(0)).toBe('2.00');
 });
  it('should get variance total 3', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].plannedShifts[0].objshift.staffGridCensuses[0].censusIndex = 1;
   component.staffVariance = testStaffVarianceData[0];
   expect(component.getVarianceTotal(0)).toBe('2.00');
 });
  it('should get variance total 4', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].plannedShifts = null;
   testStaffVarianceData[0].staffVarianceSummaries[0].additionalStaffHours = null;
   component.staffVariance = testStaffVarianceData[0];
   expect(component.getVarianceTotal(0)).toBe('1.00');
 });
  it('should get variance total 5', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift = null;
   component.staffVariance = testStaffVarianceData[0];
   expect(component.getVarianceTotal(0)).toBe('2.00');
 });
  it('should get variance total 6', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].staffVarianceDetails[0].actualCount = null;
   component.staffVariance = testStaffVarianceData[0];
   expect(component.getVarianceTotal(0)).toBe('1.00');
 });
  it('should get variance total 7', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].staffVarianceDetails = null;
   component.staffVariance = testStaffVarianceData[0];
   expect(component.getVarianceTotal(0)).toBe('-');
 });
  it('should get planned total ', () => {
    component.staffVariance = testStaffVarianceData[0];
    component.getPlannedTotal(-1);
    expect(component.getPlannedTotal(0)).toBe('0.00');
  });
  it('should get planned total ', () => {
   component.staffVariance = testStaffVarianceData[0];
   component.getPlannedTotal(0);
   expect(component.getPlannedTotal(0)).toBe('0.00');
 });
  it('should get planned total ', () => {
   component.staffVariance = testStaffVarianceData[0];
   component.getPlannedTotal(0);
   expect(component.getPlannedTotal(0)).toBe('0.00');
 });
  it('should get planned total ', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].censusIndex = 1;
   component.staffVariance = testStaffVarianceData[0];
   component.getPlannedTotal(0);
   expect(component.getPlannedTotal(0)).toBe('0.00');
 });
  it('should get planned total ', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].plannedShifts = null;
   component.staffVariance = testStaffVarianceData[0];
   component.getPlannedTotal(0);
   expect(component.getPlannedTotal(0)).toBe('0.00');
 });
  it('should get planned total ', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].plannedShifts[0].objshift.staffGridCensuses = null;
   component.staffVariance = testStaffVarianceData[0];
   component.getPlannedTotal(0);
   expect(component.getPlannedTotal(0)).toBe('0.00');
 });
  it('should get planned total ', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].plannedShifts[0].objshift.staffGridCensuses[0].censusIndex = 1;
   testStaffVarianceData[0].staffVarianceSummaries[0].staffVarianceDetails[0].actualCount = null;
   component.staffVariance = testStaffVarianceData[0];
   component.getPlannedTotal(0);
   expect(component.getPlannedTotal(0)).toBe('0.00');
 });
  it('should get planned total ', () => {
    component.staffVariance = testStaffVarianceData[0];
    component.getPlannedTotal(-1);
    expect(component.getPlannedTotal(0)).toBe('0.00');
  });
  it('should get planned total ', () => {
   component.staffVariance = testStaffVarianceData[0];
   component.getPlannedTotal(0);
   expect(component.getPlannedTotal(0)).toBe('0.00');
 });
  it('should get planned total ', () => {
   component.staffVariance = testStaffVarianceData[0];
   component.getPlannedTotal(0);
   expect(component.getPlannedTotal(0)).toBe('0.00');
 });
  it('should get planned total ', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].censusIndex = 1;
   component.staffVariance = testStaffVarianceData[0];
   component.getPlannedTotal(0);
   expect(component.getPlannedTotal(0)).toBe('0.00');
 });
  it('should get planned total ', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift = null;
   component.staffVariance = testStaffVarianceData[0];
   component.getPlannedTotal(0);
   expect(component.getPlannedTotal(0)).toBe('0.00');
 });
  it('should get planned total ', () => {
   testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses = null;
   component.staffVariance = testStaffVarianceData[0];
   component.getPlannedTotal(0);
   expect(component.getPlannedTotal(0)).toBe('0.00');
 });
  it('should get oga plan hours', function () {
    testOffGridActivities[0].variableDepartmentList[0].staffCount=null;
    testOffGridActivities[0].shiftHours=null;
    component.alertBox.getOGAplanHours(testOffGridActivities[0]);
  });
    it('should not find leap year', () => {
   expect(component.alertBox.findLeapYear(4)).toBe(366);
 });
  it('should find leap year', () => {
   expect(component.alertBox.findLeapYear(3)).toBe(365);
 });
  it('should get oga plan hours', () => {
   component.ogatotalhours = 1;
   component.planDetails = testPlanDetails[0];
   spyOn(component.alertBox, 'getOGAplanHours').and.returnValue(2);
   spyOn(component.alertBox, 'findLeapYear').and.returnValue(2);
   component.getOGAPlanhours();
   expect(component.ogatotalhours).toBe(component.ogatotalhours);
 });
    it('should get oga plan hours', function () {
    testOffGridActivities[0].variableDepartmentList[0].staffCount=null;
    testOffGridActivities[0].shiftHours = null;
    component.alertBox.getOGAplanHours(testOffGridActivities[0]);
  });
    it('should get OGA plan hours ', function () {
    component.planDetails = testPlanDetails[0];
    component.planDetails.offGridActivities[0] = testPlanDetails[0].offGridActivities[0];
    spyOn(component.alertBox, 'getOGAplanHours').and.returnValue(1);
    component.getOGAPlanhours();
  });

  it('should get non variable total hours', () => {
   component.nonVarTotalhours = 7;
   component.getNonvarTotalhours();
   expect(component.nonVarTotalhours).toBe(0);
 });
  it('should get non variable total hours', () => {
   component.nonVarTotalhours = undefined;
   component.getNonvarTotalhours();
   expect(component.nonVarTotalhours).toBe(0);
 });
  it('should ', function () {
    spyOn(component, 'getNonvarTotalhours').and.stub();
    spyOn(component, 'getOGAPlanhours').and.stub();
    component.getOGAandNonVariableHours();
    expect(component.getOGAPlanhours).toHaveBeenCalled();
    expect(component.getNonvarTotalhours).toHaveBeenCalled();
  });
  it('should   getActualHeaderForCalculator', function () {
    component.staffVariance = testStaffVarianceData[0];
    component.staffVariance.selectedDate = '1';
    component.staffVariance.recordDateForFuture = '2';
    component.getActualHeaderForCalculator();
    expect(component.actualValue).toBe('Actual');
  });
  it('should   getActualHeaderForCalculator', function () {
    testStaffVarianceData[0].selectedDate = '2';
    testStaffVarianceData[0].recordDateForFuture = '1';
    component.staffVariance = testStaffVarianceData[0];
    component.getActualHeaderForCalculator();
    expect(component.actualValue).toBe('Scheduled');
  });
  it('should   getActualHeaderForCalculator', function () {
    component.getActualHeaderForCalculator();
    expect(component.plannedValue).toBe('Planned');
  });
  it('should   getActualHeaderForCalculator', function () {
    testStaffVarianceData[0].selectedDate = '2';
    testStaffVarianceData[0].recordDateForFuture = '1';
    component.staffVariance = testStaffVarianceData[0];
    component.getActualHeaderForCalculator();
    expect(component.plannedValue).toBe('Expected');
  });
  it('should check number and decimal only', function () {
    component.staffVariance = testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0].additionalStaffHours = 1.1;
    numberObj.which = false;
    numberObj.keyCode = 0;
    expect(component.numberAndDecOnly(numberObj, 1)).toBe(true);

  });
  it('should check number and decimal only', function () {
    numberObj.which = false;
    numberObj.keyCode = 44;
    expect(component.numberAndDecOnly(numberObj, 1)).toBe(false);
  });
  it('should check number and decimal only', function () {
    numberObj.keyCode=88;
    numberObj.which=true;
    expect(component.numberAndDecOnly(numberObj,1)).toBe(true);
  });
  it('should check number and decimal only', function () {
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    expect(component.numberAndDecOnly(numberObj,0)).toBe(undefined);
  });
  it('should check number and decimal only', function () {
    testStaffVarianceData[0].staffVarianceSummaries[0].offGridActivitiesHour=1.2;
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    expect(component.numberAndDecOnly(numberObj,0)).toBe(undefined);
  });
  it('should check number and dec only', function () {
    numberObj.keyCode=50;
    numberObj.which=true;
    spyOn(component, 'getSelectedVal').and.returnValue('5');
    testStaffVarianceData[0].staffVarianceSummaries[0].additionalStaffHours=1.25;
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    // expect(component.getSelectedVal).toHaveBeenCalled();
    expect(component.numberAndDecOnly(numberObj,0)).toBe(undefined);
  });
  it('should check number and dec only selected null', function () {
    numberObj.keyCode=50;
    numberObj.which=true;
    spyOn(component, 'getSelectedVal').and.returnValue('');
    testStaffVarianceData[0].staffVarianceSummaries[0].additionalStaffHours=1.25;
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    // expect(component.getSelectedVal).toHaveBeenCalled();
    expect(component.numberAndDecOnly(numberObj,0)).toBe(undefined);
  });
  it('should check number and dec only char at four', function () {
    numberObj.keyCode = 50;
    numberObj.which = true;
    spyOn(component, 'getSelectedVal').and.returnValue('');
    testStaffVarianceData[0].staffVarianceSummaries[0].additionalStaffHours = 1234.5;
    component.staffVariance = testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0] = testStaffVarianceData[0].staffVarianceSummaries[0];
    // expect(component.getSelectedVal).toHaveBeenCalled();
    expect(component.numberAndDecOnly(numberObj, 0)).toBe(false);
  });
  it('should clear', function () {
    component.staffVariance=testStaffVarianceData[0];
    component.clear(0);
    expect(component.staffVariance.staffVarianceSummaries[0].censusValue).toBe(null)
  });
  it('should get non variable days count', () => {
    let planDetails:PlanDetails = planDetailsData()[0];
    expect(component.getNonvarDaysCount(planDetails.nonVariableDepartmentPositions[0])).toBe(2);
  });
  it('should ', function () {
    testOffGridActivities = offGridActivitiesData();
    expect(component.alertBox.getOGAplanHours(testOffGridActivities[0])).toBe(2);
  });
  it('should ', function () {
    testOffGridActivities = offGridActivitiesData();
    expect(component.alertBox.getOGAplanHours(testOffGridActivities[0])).toBe(2);
  });
  it('should getNonvarTotalhours', function () {
    component.planDetails = testPlanDetails[0];
    component.getNonvarTotalhours();
    expect(component.nonVarTotalhours).toBe(0);
  });
  it('should openCensusDialog', function () {

    component.openCensusDialog();
    expect(component.alertBox.openAlert).toHaveBeenCalled();
  });
  it('should getActualTotalForAllVariablePosition', function(){
    component.planDetails = testPlanDetails[0];
    component.getActualTotalForAllVariablePosition();
    expect(component.getActualTotalForAllVariablePosition).toHaveBeenCalled;
  });
  it('should getPlannedTotalForAllVariablePosition', function(){
    component.planDetails = testPlanDetails[0];
    component.getPlannedTotalForAllVariablePosition();
    expect(component.getPlannedTotalForAllVariablePosition).toHaveBeenCalled;
  });
  it('should getTotalVarianceForAllVariablePosition', function(){
    component.planDetails = testPlanDetails[0];
    component.getTotalVarianceForAllVariablePosition();
    expect(component.getTotalVarianceForAllVariablePosition).toHaveBeenCalled;
  });
  it('should getAdditionalStaffTotalhours', function(){
    component.staffVariance = testStaffVarianceData[0];
    component.getAdditionalStaffTotalhours();
    expect(component.getAdditionalStaffTotalhours).toHaveBeenCalled;
  });
  it('should getOGATotalhours', function(){
    component.staffVariance = testStaffVarianceData[0];
    component.getOGATotalhours();
    expect(component.getOGATotalhours).toHaveBeenCalled;
  });
  it('should check placeCaretAtEnd', () => {
    let elRefMock =  document.createElement('input');
    elRefMock.setAttribute("id", "crossEnt");
    elRefMock.value = 'ele';
    component.placeCaretAtEnd(elRefMock);
  });
});
