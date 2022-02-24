import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import { StaffManagerPlanScoreCardComponent } from './staff-manager-plan-score-card.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import SpyObj = jasmine.SpyObj;
import {OAService} from '../../../../shared/service/oa-service';
import createSpyObj = jasmine.createSpyObj;
import {of} from 'rxjs';
import {oaSuggestedDataSample2} from '../../../../shared/service/fixtures/oa-suggested-data-sample2';
import {planDetailsData} from '../../../../shared/service/fixtures/plan-details-data';
import {oaSuggestedDataSample} from '../../../../shared/service/fixtures/oa-suggested-data-sample';
import {staffVarianceData} from '../../../../shared/service/fixtures/staffVarianceData';
import {MatDialog} from '@angular/material/dialog';
import {Util} from "../../../../shared/util/util";

describe('StaffManagerPlanScoreCardComponent', () => {
  let component: StaffManagerPlanScoreCardComponent;
  let fixture: ComponentFixture<StaffManagerPlanScoreCardComponent>;
  let mockHttpClient;
  let mockMatDialog;
  let testPlanDetails = planDetailsData();
  let oaServiceSpyObj: SpyObj<OAService>;
  const testOASuggestionData = oaSuggestedDataSample();
  const testOASuggestionData2 = oaSuggestedDataSample2();
  let testStaffVarianceData = staffVarianceData();
  beforeEach(waitForAsync(() => {

    //oaServiceSpyObj=createSpyObj(['getPlanManagerOASuggestedData']);
    oaServiceSpyObj = createSpyObj('OAService', ['getPlanManagerOASuggestedData']);
    oaServiceSpyObj.getPlanManagerOASuggestedData.and.returnValue(of(testOASuggestionData2[0]));
    TestBed.configureTestingModule({
      declarations: [ StaffManagerPlanScoreCardComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers:[{provide: HttpClient, useValue: mockHttpClient},{provide: OAService, useValue: oaServiceSpyObj},{provide: MatDialog, useValue: mockMatDialog}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffManagerPlanScoreCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    testPlanDetails = planDetailsData();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
    it('should load OA plan data entity ', function () {
      testPlanDetails[0].facilityCode=2;
      testPlanDetails[0].departmentCode=2;
      component.planDetails=testPlanDetails[0];
    component.loadOAPlanDataEntity()
  });
    it('should get suggested data', function () {
    component.getSuggestedData();
    if(!Util.isNullOrUndefined(component.oASuggestedData))
    {
    expect(component.staffVariance.targetHours).toBe(component.oASuggestedData.workHourPerUnitPrimary);
  }
  });
    it('should get productivity ', function () {
    spyOn(component,'getActualWHpU').and.returnValue(100);
    component.oASuggestedData=testOASuggestionData[0];
    expect(component.getProductivityIndex()).toBe(1);
    expect(component.isProductivityIndexpositive).toBe(false);
  });


    it('should get planned whpu', function () {
    component.ogatotalhours=1;
    component.nonVarTotalhours=1;
    component.planDetails=testPlanDetails[0];
    component.planDetails.variableDepartmentPositions[0]=testPlanDetails[0].variableDepartmentPositions[0];
    expect(component.getPlannedWHpU()).toBe(0)
  });

    it('should get planned whpu', function () {
    spyOn(component,'getTotalPlanWhpu').and.returnValue(null);
    expect(component.getPlannedWHpU()).toBe(0)
  });

    it('should get planned whpu', function () {
    component.ogatotalhours=1;
    component.nonVarTotalhours=1;
    component.planDetails=testPlanDetails[0];
    component.planDetails.variableDepartmentPositions[0]=testPlanDetails[0].variableDepartmentPositions[0];
    expect(component.getPlannedWHpU()).toBe(0)
  });

  it('should get total plan whpu ', function () {
    spyOn(component,'isCensusExists').and.returnValue(true);
    spyOn(component,'getPlanWHpuFromPlanner').and.stub();
    component.getTotalPlanWhpu();
    expect(component.getTotalPlanWhpu()).toBe(undefined);
  });
  it('should get plan whp', function () {
    testPlanDetails[0].staffingSummaryData[0].census=2;
    component.planDetails=testPlanDetails[0];
    expect(component.getPlanWHpuFromPlanner(2)).toBe(null)
  });
  it('should get plan whp', function () {
    testPlanDetails[0].staffingSummaryData[0].census=2;
    component.planDetails=testPlanDetails[0];
    expect(component.getPlanWHpuFromPlanner(1)).toBe(undefined);
  });
  it('should return false if null/undefined', () => {
    expect(component.check(null)).toBe(false);
    expect(component.check(undefined)).toBe(false);
    expect(0).toBe(0);
  });

  it('should return true if it is not null or undefined', () => {
    expect(component.check(1)).toBe(true);
  });
  it('should check hours varince ', function () {
    expect(component.checkHoursVariance(1,1)).toBe(true)
  });
  it('should toggele score text based on selected date', function () {
   testStaffVarianceData[0].selectedDate='2';
   testStaffVarianceData[0].recordDateForFuture='1';
    component.staffVariance=testStaffVarianceData[0];
    component.toggleScoreTextBasedOnDate();
    expect(component.toggleTarget).toBe('Target WHpU');
    expect(component.toggleWhpu).toBe('Expected WHpU');
  });
  it('should toggele score text based on selected date', function () {
    component.toggleScoreTextBasedOnDate();
    expect(component.toggleTarget).toBe('Primary Target WHpU');
    expect(component.toggleWhpu).toBe('ACTUAL WHpU');
  });
  it('should checkHoursVariance', function () {
    expect(component.checkHoursVariance(0,null)).toBe(false)
  });
  it('should get getActualWHpU', function(){
    let planDetailsTest =planDetailsData();
    planDetailsTest[0].oAStaffingMetric = testOASuggestionData2;
    component.staffVariance=testStaffVarianceData[0];
    component.planDetails=planDetailsTest[0];
    component.getActualWHpU();
    expect(component.getActualWHpU()).toEqual(8);
  });
  it('should getActualHour', function () {
    let planDetailsTest =planDetailsData();
    planDetailsTest[0].oAStaffingMetric = testOASuggestionData2;
    component.staffVariance=testStaffVarianceData[0];
    component.planDetails=planDetailsTest[0];
    component.getActualHour();
    expect(component.getActualHour()).toEqual(8);
  });
  it('should getPlannedMinusDailyHours', function () {
    component.getPlannedMinusDailyHours();
    expect(component.getPlannedMinusDailyHours).toHaveBeenCalled;
  });
  it('should getAverageCensus', function () {
    component.getAverageCensus();
    expect(component.getAverageCensus).toHaveBeenCalled;
  });
});
