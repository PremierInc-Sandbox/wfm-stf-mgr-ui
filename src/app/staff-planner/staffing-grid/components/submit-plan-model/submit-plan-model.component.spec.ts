import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {SubmitPlanModelComponent} from './submit-plan-model.component';
import {Router} from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {PlanService} from '../../../../shared/service/plan-service';
import {StaffGridService} from '../../../../shared/service/Staffgrid-service';
import {DepartmentService} from '../../../../shared/service/department-service';
import {HttpClient} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {planDetailsData} from '../../../../shared/service/fixtures/plan-details-data';
import SpyObj = jasmine.SpyObj;
import {of} from 'rxjs';
import {deptDetails} from '../../../../shared/service/fixtures/dept-details-data';
import {staffScheduleData} from '../../../../shared/service/fixtures/staff-schedule-data';
import {
  variableDepartmentpositionData,
  variableDepartmentpositionDataKey
} from "../../../../shared/service/fixtures/variable-dept-position-data";
import {staffToPatientData} from "../../../../shared/service/fixtures/staffToPatientList-data";

describe('SubmitPlanModelComponent', () => {
  let component: SubmitPlanModelComponent;
  let fixture: ComponentFixture<SubmitPlanModelComponent>;
  const mockRouter: SpyObj<Router> = jasmine.createSpyObj(['navigate']);
  let mockMatDialog;
  let mockHttpClient;
  let copyOfTestPlanDetailsData;
  const mockMatDialogRef: SpyObj<MatDialog> = jasmine.createSpyObj('dialogRef', ['close']);
  let mockFormsModule;
  let testPlanDetailsData = planDetailsData();
  let testStaffSchedule = staffScheduleData();
  let testDeptDetailsData = deptDetails();
  const variableDepartmentDataTest = variableDepartmentpositionDataKey();
  const teststaffToPatientData = staffToPatientData();
  const departmentServiceSpyObj: SpyObj<DepartmentService> = jasmine.createSpyObj(['getDepts']);
  const planServiceSpyObj: SpyObj<PlanService> = jasmine.createSpyObj(['updatePlanAsActive', 'getPlans']);
  const staffGridServiceSpyObj: SpyObj<StaffGridService> = jasmine.createSpyObj(['saveStaffGridDetails']);
  planServiceSpyObj.updatePlanAsActive.and.returnValue(of(testPlanDetailsData[0]));
  planServiceSpyObj.getPlans.and.returnValue(of(testPlanDetailsData));
  staffGridServiceSpyObj.saveStaffGridDetails.and.returnValue(of(testStaffSchedule));
  departmentServiceSpyObj.getDepts.and.returnValue(of(testDeptDetailsData));
  beforeEach(waitForAsync(() => {

    sessionStorage.setItem('plandetails', JSON.stringify(testPlanDetailsData[0]));
    TestBed.configureTestingModule({
      declarations: [SubmitPlanModelComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{provide: Router, useValue: mockRouter}, {provide: MatDialog, useValue: mockMatDialog},
        {provide: HttpClient, useValue: mockHttpClient}, {provide: MatDialogRef, useValue: mockMatDialogRef}
        , {provide: FormsModule, useValue: mockFormsModule}, {
          provide: DepartmentService,
          useValue: departmentServiceSpyObj
        },
        {provide: PlanService, useValue: planServiceSpyObj}, {
          provide: StaffGridService,
          useValue: staffGridServiceSpyObj
        }]
    })
      .compileComponents();

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitPlanModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    testPlanDetailsData = planDetailsData();
    component.planDetails = testPlanDetailsData[0];
    testDeptDetailsData = deptDetails();
    testStaffSchedule = staffScheduleData();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should toggle model hide', () => {
    component.toggleModalHide();
    expect(component.dialogRef.close).toHaveBeenCalled();
  });
  it('should get plan details', () => {
    spyOn(component, 'validateTotalvalue').and.returnValue(true);
    component.getplandetails();
  });

  it('should submit plan', () => {
    spyOn(component, 'validateTotalvalue').and.returnValue(true);
    component.isActiveFound = true;
    component.isPlanActive = true;
    component.activeData = testPlanDetailsData;
    component.submitPlan();
    expect(component.errormsg.length).toBe(0);
    expect(staffGridServiceSpyObj.saveStaffGridDetails).toHaveBeenCalledWith(component.planDetails.staffScheduleList,
      'Completed', 'Active', component.planDetails.totalAnnualHours, component.planDetails.totalAnnualHoursVariance);
    expect(planServiceSpyObj.updatePlanAsActive).toHaveBeenCalledWith(component.activeData[0]);
  });
  it('should not submit plan', () => {
    spyOn(component, 'validateTotalvalue').and.returnValue(false);
    component.submitPlan();
  });
  it('should not submit plan', () => {
    spyOn(component, 'validateTotalvalue').and.returnValue(true);
    component.isPlanActive = false;
    component.submitPlan();
  });
  it('should not submit plan', () => {
    spyOn(component, 'validateTotalvalue').and.returnValue(true);
    component.activePlanData = testPlanDetailsData[0];
    component.submitPlan();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    expect(component.dialogRef.close).toHaveBeenCalled();

  });
  it('should validate total value and return true', () => {
    expect(component.isError).toBe(true);
  });
  it('should validate total value and return false', () => {
    spyOn(component, 'getTotal').and.returnValue('1');
    expect(component.validateTotalvalue()).toBe(false);
    expect(component.isError).toBe(true);
    // testPlanDetailsData[0].staffScheduleList[0].planShiftList[0].staffGridCensuses[0].censusIndex;
  });
  it('should check other plan status for active', () => {
    spyOn(component, 'IsDateRangeOverlapping').and.returnValue(true);
    component.isPlanActive = true;
    component.deptDetails = testDeptDetailsData;
    component.deptDetails[0] = testDeptDetailsData[0];
    component.planDetails = testPlanDetailsData[0];
    component.planDetails.name = 'different';
    component.planDetails.defaultPlanFlag = true;
    component.checkotherPlanStatusForActive();
    expect(component.isActivePlanExistInsamePeriod).toBe(true);
    expect(component.activePlanWarningMsg).toBe('When this box is checked and you submit this plan, it will become the new Active plan effective from tomorrow.');
    expect(departmentServiceSpyObj.getDepts).toHaveBeenCalledWith(component.planDetails.facilityKey);
    expect(component.listDeptKeys).toContain(Number(component.deptDetails[0].key));
    expect(component.isActivePlanExistInsamePeriod).toBe(true);
  });
  it('should check other plan status for active', () => {
    spyOn(component, 'IsDateRangeOverlapping').and.returnValue(false);
    component.isPlanActive = true;
    component.deptDetails = testDeptDetailsData;
    component.deptDetails[0] = testDeptDetailsData[0];
    component.planDetails = testPlanDetailsData[0];
    component.planDetails.name = 'different';
    component.planDetails.defaultPlanFlag = true;
    component.checkotherPlanStatusForActive();
    expect(component.isActivePlanExistInsamePeriod).toBe(false);
    expect(component.activePlanWarningMsg).toBe('');
    expect(departmentServiceSpyObj.getDepts).toHaveBeenCalledWith(component.planDetails.facilityKey);
    expect(component.listDeptKeys).toContain(Number(component.deptDetails[0].key));
    expect(component.isActivePlanExistInsamePeriod).toBe(false);
  });
  it('should check other plan status for active when department key is null ', () => {
    component.isPlanActive = true;
    component.deptDetails = testDeptDetailsData;
    component.deptDetails[0] = testDeptDetailsData[0];
    component.planDetails = testPlanDetailsData[0];
    testDeptDetailsData[0].key = null;
    departmentServiceSpyObj.getDepts.and.returnValue(of(testDeptDetailsData));
    component.checkotherPlanStatusForActive();
    expect(component.isActivePlanExistInsamePeriod).toBe(false);
    expect(component.activePlanWarningMsg).toBe('');
    expect(departmentServiceSpyObj.getDepts).toHaveBeenCalledWith(component.planDetails.facilityKey);
    //expect(component.listDeptKeys).toContain(Number(component.deptDetails[0].key));
    expect(component.isActivePlanExistInsamePeriod).toBe(false);
  });
  it('should not check other plan status for active', () => {
    component.isPlanActive = false;
    component.checkotherPlanStatusForActive();
    expect(component.isActivePlanExistInsamePeriod).toBe(false);
    expect(component.activePlanWarningMsg).toBe('');
  });


  it('should get total and return 2.0 when minimum of one variable position is included', () => {
    component.isIncluded = true;
    testPlanDetailsData[0].staffScheduleList[0].planShiftList[0].staffGridCensuses[0].staffToPatientList[0]=teststaffToPatientData[1]
    testPlanDetailsData[0].variableDepartmentPositions[0] = variableDepartmentDataTest[1];
    testPlanDetailsData[0].staffScheduleList[0].planShiftList[0].staffGridCensuses[0].staffToPatientList[0].staffCount = 2;
    expect(component.getTotal(testPlanDetailsData[0].staffScheduleList[0].planShiftList[0].staffGridCensuses[0])).toEqual('2.0');
  });
  it('should get total and return 2.0 planShiftList variable position is included', () => {
    component.isIncluded = true;
    testPlanDetailsData[0].staffScheduleList[0].planShiftList[0].staffGridCensuses[0].staffToPatientList[0].staffCount = 2;
    expect(component.getTotal(testPlanDetailsData[0].staffScheduleList[0].planShiftList[0].staffGridCensuses[0])).toEqual('2.0');
  });
  it('should get total and return 0.0 when no variable position is included', () => {
    testPlanDetailsData[0].variableDepartmentPositions[0] = variableDepartmentDataTest[0];
    testPlanDetailsData[0].staffScheduleList[0].planShiftList[0].staffGridCensuses[0].staffToPatientList[0].staffCount = 2;
    expect(component.getTotal(testPlanDetailsData[0].staffScheduleList[0].planShiftList[0].staffGridCensuses[0])).toEqual('0.0');
  });
  it('should check if date range is overlapping', () => {
    testPlanDetailsData[0].effectiveStartDate = 1;
    testPlanDetailsData[0].effectiveEndDate = 2;
    copyOfTestPlanDetailsData = testPlanDetailsData[0];
    copyOfTestPlanDetailsData.effectiveStartDate = 3;
    copyOfTestPlanDetailsData.effectiveEndDate = 4;
    expect(component.IsDateRangeOverlapping(testPlanDetailsData[0], copyOfTestPlanDetailsData)).toBe(true);
  });
  it('should check if date range is overlapping and return false', () => {
    testPlanDetailsData[0].effectiveStartDate = 1;
    testPlanDetailsData[0].effectiveEndDate = 3;
    copyOfTestPlanDetailsData = testPlanDetailsData[0];
    copyOfTestPlanDetailsData.effectiveStartDate = 3;
    copyOfTestPlanDetailsData.effectiveEndDate = 1;
    expect(component.IsDateRangeOverlapping(testPlanDetailsData[0], copyOfTestPlanDetailsData)).toBe(false);
  });
  it('should variable position is included', () => {
    component.planDetails = testPlanDetailsData[0];
    expect(component.checkIsIncluded(1)).toBe(true);
  });
  it('should getSumofRowandCol and return false', () => {
    spyOn(component, 'getSumofRowandCol').and.returnValue(true);
    expect(component.validateTotalvalue()).toBe(false);
    expect(component.isError).toBe(true);
  });
  it('should getSumofRowandCol and return true', () => {
    spyOn(component, 'getSumofRowandCol').and.returnValue(false);
    expect(component.validateTotalvalue()).toBe(true);
    expect(component.isError).toBe(true);
  });
});
