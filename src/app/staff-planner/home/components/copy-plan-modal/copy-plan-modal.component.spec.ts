import {async, ComponentFixture, inject, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {CopyPlanModalComponent} from './copy-plan-modal.component';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {HttpClient} from '@angular/common/http';
import {PlanService} from '../../../../shared/service/plan-service';
import {of} from 'rxjs';
import {PlanDetails} from '../../../../shared/domain/plan-details';
import {ScheduleService} from '../../../../shared/service/schedule-service';
import {staffScheduleData} from '../../../../shared/service/fixtures/staff-schedule-data';
import {StaffGridService} from '../../../../shared/service/Staffgrid-service';
import {staffGridCensusData} from '../../../../shared/service/fixtures/staff-grid-census-data';
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;
import {OASuggestedData} from '../../../../shared/domain/OASuggestedData';

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
      departmentName: null,
      facilityKey: null,
      facilityCode: null,
      facilityName: null,
      deleteFlag: false,
      censusRange: null,
      effectiveStartDate: null,
      effectiveEndDate: null,
      userNotes: null,
      upperEndTarget: null,
      lowerEndTarget: null,
      targetBudget: 2,
      volume: 1,
      hours: 5,
      workHoursBalance: 44,
      fte: 1,
      utilizedAverageVolume: 23,
      utilizedAverageVolumeBase: 23,
      temporaryEffectiveStartDate: null,
      temporaryEffectiveEndDate: null,
      userKey: 12,
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
      primaryWHpU: 1,
      secondaryWHpU: 1,
      educationOrientationTargetPaid: 1,
      displayPlanStatus: null,
      corporationId: null,
      staffScheduleList: null,
      totalAnnualVolume: 1,
      totalAnnualHours: 1,
      updatedTimeStamp: null,
      totalAnnualHoursVariance: 1,
      staffingSummaryData: null,
      currentAverageVolume: 1,
      budgetAverageVolume: 1,
      annualizedCurrentAvg: 1,
      annualizedBudgetedAvg: 1,
      planAlreadyInUse: false,
      oAStaffingMetric: null,
    },
  ];

}

describe('CopyPlanModalComponent', () => {
  let component: CopyPlanModalComponent;
  let fixture: ComponentFixture<CopyPlanModalComponent>;
  const mockRouter = jasmine.createSpyObj(['navigate']);
  const mockMatDialog = jasmine.createSpyObj(['closeAll']);
  let mockHttpClient;
  let testStaffScheduleData = staffScheduleData();
  let testCustomPlanDetails = customPlanDetails();
  const planServiceSpyObj: SpyObj<PlanService> = createSpyObj(['getPlans', 'copyPlan', 'getAllPlans','getPlandetails', 'createPlan','removePlanKeyFromSessionAttributeSubscribe']);
  const scheduleServiceSpyObj: SpyObj<ScheduleService> = createSpyObj(['createSchedule', 'getScheduleDetails']);
  const staffGridServiceSpyObj: SpyObj<StaffGridService> = createSpyObj(['saveStaffGridDetails', 'getStaffGridDetails']);
  scheduleServiceSpyObj.createSchedule.and.returnValue(of(testStaffScheduleData));
  scheduleServiceSpyObj.getScheduleDetails.and.returnValue(of(testStaffScheduleData));
  let mockPlanDetails: PlanDetails[];
  const testPlanDetailsData = customPlanDetails();
  const testStaffGridCensusData = staffGridCensusData();
  planServiceSpyObj.getPlans.and.returnValue(of(customPlanDetails()));
  planServiceSpyObj.createPlan.and.returnValue(of(customPlanDetails()[0]));
  planServiceSpyObj.getPlandetails.and.returnValue(of(testCustomPlanDetails[0]));
  planServiceSpyObj.getAllPlans.and.returnValue(of(customPlanDetails()));
  planServiceSpyObj.createPlan.and.returnValue(of(testPlanDetailsData[0]));
  staffGridServiceSpyObj.saveStaffGridDetails.and.returnValue(of(testStaffScheduleData));
  staffGridServiceSpyObj.getStaffGridDetails.and.returnValue(of(testStaffGridCensusData));
  planServiceSpyObj.removePlanKeyFromSessionAttributeSubscribe.and.returnValue(of());
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CopyPlanModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [{provide: Router, useValue: mockRouter}, {provide: MatDialog, useValue: mockMatDialog},
        {provide: HttpClient, useValue: mockHttpClient}, {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('dialogRef', ['close'])
        },
        {provide: PlanService, useValue: planServiceSpyObj},
        {provide: PlanDetails, useValue: mockPlanDetails}, {provide: ScheduleService, useValue: scheduleServiceSpyObj},
        {provide: StaffGridService, useValue: staffGridServiceSpyObj}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyPlanModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    //testStaffScheduleData = staffScheduleData();
    //testCustomPlanDetails = customPlanDetails();
  });

  it('should be created', inject([PlanService], (service: PlanService) => {
    expect(service).toBeTruthy();
  }));
  it('should close copy model dialog when cancel button is clicked', () => {
    component.toggleModalHide();
    expect(component.dialogRef.close).toHaveBeenCalled();
  });
  it('should mark plan as duplicated', () => {
    component.plansData = testPlanDetailsData;
    localStorage.setItem('planId', '138');
    component.saveCopyingPlan(testPlanDetailsData[0].name);
  });
  it('should save copying plan', () => {
    // spyOn(component, 'loadStaffGridDetails').and.returnValue(true);
    component.plansData = testPlanDetailsData;
    localStorage.setItem('planId', '138');
    component.saveCopyingPlan('testDifferentName');
    expect(planServiceSpyObj.getPlandetails).toHaveBeenCalled();
    expect(planServiceSpyObj.removePlanKeyFromSessionAttributeSubscribe).toHaveBeenCalled();
    expect(component.newPlan.name).toEqual('testDifferentName');
    expect(component.newPlan.isnewlycreated).toBe(true);
    expect(component.newPlan.key).toBe(null);
    expect(component.showMsg).toBe(false);
    expect(component.isHide).toBe(false);
  });
  it('should load plans', () => {
    localStorage.setItem('listDeptKeys', '1');
    component.loadPlans();
    expect(component.deptArray).toEqual(component.deptStr.split(','));
    expect(String(component.deptListKeys[0])).toBe(component.deptArray[0]);
    expect(component.plansData[0]).toEqual(testPlanDetailsData[0]);
  });
  it('should check duplicate', function () {
    component.checkDuplicate('name');
    expect(component.isHide).toBe(true);
  });
  it('should check duplicate', function () {
    testPlanDetailsData[0].name='name';
    component.plansData=testPlanDetailsData;
    component.checkDuplicate('name');
    expect(component.isHide).toBe(false);
  });
});
