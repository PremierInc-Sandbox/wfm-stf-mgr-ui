import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {StaffingGridComponent} from './staffing-grid.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import {StaffingMatrixComponent} from '../components/staffing-matrix/staffing-matrix.component';
import {StaffingMatrixSummaryComponent} from '../components/staffing-matrix-summary/staffing-matrix-summary.component';
import {GridScoreCardComponent} from '../components/grid-score-card/grid-score-card.component';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import createSpyObj = jasmine.createSpyObj;
import {PlanService} from '../../../shared/service/plan-service';
import SpyObj = jasmine.SpyObj;
import {of} from 'rxjs';
import {StaffGridService} from '../../../shared/service/Staffgrid-service';
import {planDetailsData} from '../../../shared/service/fixtures/plan-details-data';
import {ScheduleService} from '../../../shared/service/schedule-service';
import {staffScheduleData} from '../../../shared/service/fixtures/staff-schedule-data';
import {staffGridCensusData} from '../../../shared/service/fixtures/staff-grid-census-data';
import createSpy = jasmine.createSpy;
import {shift} from '../../../shared/domain/staff-schedule';
import {compilePipeFromMetadata} from '@angular/compiler';
import {ConfirmWindowOptions} from '../../../shared/domain/plan-details';
import {OAService} from '../../../shared/service/oa-service';
import {oaPlanDataSample} from '../../../shared/service/fixtures/oa-Plan-Data-Sample';
import {oaSuggestedDataSample2} from '../../../shared/service/fixtures/oa-suggested-data-sample2';
import {oaSuggestedDataSample} from '../../../shared/service/fixtures/oa-suggested-data-sample';
import {RouterHistoryTrackerService} from "../../../shared/service/router-history-tracker.service";

describe('StaffingGridComponent', () => {
  let component: StaffingGridComponent;
  let fixture: ComponentFixture<StaffingGridComponent>;
  let mockHttpClient, mockRouter;
  const planServiceSpyObj: SpyObj<PlanService> = createSpyObj('PlanService', ['getPlandetails','removePlanKeyFromSessionAttribute']);
  let mockActivatedRoute = jasmine.createSpyObj(['queryParamMap']);
  const oaServiceSpyObj:SpyObj<OAService>=createSpyObj(['getOASuggestedData']);
  let flag=true;
  let oaSuggestedData=oaSuggestedDataSample();
  let testOAData=oaSuggestedDataSample2();
  const mockMatDialog = jasmine.createSpyObj({
    afterClosed: of({}), close: null, open: createSpy('open', function () {
      return this;
    })
  });
  mockMatDialog.componentInstance = {body: ''};
  let testStaffGridCensusData = staffGridCensusData();
  const staffGridServiceSpyObj: SpyObj<StaffGridService> = createSpyObj(['saveStaffGridDetails', 'getStaffGridDetails']);
  const scheduleServiceSpyObj: SpyObj<ScheduleService> = createSpyObj(['getScheduleDetails']);
  const routerTracker: SpyObj<RouterHistoryTrackerService> = createSpyObj('RouterHistoryTrackerService', ['nextUrl']);
  let testPlanDetails = planDetailsData();
  let testStaffScheduleData = staffScheduleData();
  mockRouter = jasmine.createSpyObj(['navigate']);
  let map;
  planServiceSpyObj.getPlandetails.and.returnValue(of());
  planServiceSpyObj.removePlanKeyFromSessionAttribute.and.returnValue(of());
  staffGridServiceSpyObj.saveStaffGridDetails.and.returnValue(of(testStaffScheduleData));
  staffGridServiceSpyObj.getStaffGridDetails.and.returnValue(of(testStaffGridCensusData));
  scheduleServiceSpyObj.getScheduleDetails.and.returnValue(of(testStaffScheduleData));
  oaServiceSpyObj.getOASuggestedData.and.returnValue(of(testOAData[0]));

  beforeEach(waitForAsync(() => {
    mockMatDialog.open.and.callFake(function () {
      return this;
    });
    map = (new Map<string, string>());
    map.set('plankey', '1');

    mockActivatedRoute = {
      queryParamMap: of(map)
    };

    TestBed.configureTestingModule({
      declarations: [StaffingGridComponent, StaffingMatrixComponent, StaffingMatrixSummaryComponent, GridScoreCardComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatTabsModule,
      ],
      providers: [{provide: HttpClient, useValue: mockHttpClient}, {provide: Router, useValue: mockRouter},
        {provide: PlanService, useValue: planServiceSpyObj}, {provide: ActivatedRoute, useValue: mockActivatedRoute},
        {provide: StaffGridService, useValue: staffGridServiceSpyObj}
        , {provide: MatDialog, useValue: mockMatDialog}, {provide: ScheduleService, useValue: scheduleServiceSpyObj},
        {provide: OAService, useValue: oaServiceSpyObj},{provide: RouterHistoryTrackerService,useValue: routerTracker}]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffingGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    testStaffGridCensusData = staffGridCensusData();
    testPlanDetails = planDetailsData();

  });
  describe('test all methods except populate data', () => {
    beforeEach(() => {
      component.planDetails = testPlanDetails[0];
      component.planDetails.planUtilizedAvgVol = 1;
      testStaffScheduleData = staffScheduleData();
    });
    afterEach(() => {
      planServiceSpyObj.getPlandetails.and.returnValue(of());
      testStaffScheduleData = staffScheduleData();
    });


    it('should create', () => {
      expect(component).toBeTruthy();
    });
    it('should save and exit staffing grid details', () =>  {
      component.planDetails.planCompleted = false;
      component.saveAndExitStaffGridDetails();
      expect(staffGridServiceSpyObj.saveStaffGridDetails).toHaveBeenCalledWith(component.planDetails.staffScheduleList,
        component.planDetails.status, component.planDetails.action, component.planDetails.totalAnnualHours, component.planDetails.totalAnnualHoursVariance);
    });
    it('should not save and exit staffing grid details', () => {
      component.planDetails.planCompleted = true;
      component.saveAndExitStaffGridDetails();
    });
    it('should add those staffing', () => {
      expect(component.addThousandSepToStr('test')).toBe('test');
    });
    it('should navigate to staff-schedule page when plan is completed', () => {
      component.planDetails = testPlanDetails[0];
      component.clickonbackbutton();
      expect(mockRouter.navigate).toHaveBeenCalled();
    });
    it('should load plan details', () => {
      spyOn(component, 'loadStaffGridDetails').and.stub();
      spyOn(component, 'loadButtontext');
      planServiceSpyObj.getPlandetails.and.returnValue(of(testPlanDetails[0]));
      map.set('plankey', '1');
      localStorage.setItem('plankey', '');
      component.loadplandetails();
      expect(component.planKey).toBe('1');
      expect(planServiceSpyObj.getPlandetails).toHaveBeenCalledWith(component.planKey);
      expect(component.planDetails).toEqual(testPlanDetails[0]);
      expect(component.loadButtontext).toHaveBeenCalled();
      expect(component.entitydisplayval).toEqual(undefined);
      expect(component.departmentdisplayval).toEqual(undefined);
      expect(component.primaryWHpUdisplayval).toEqual(undefined);
    });
    it('should load button text as exit', () => {
      component.planDetails.planCompleted = true;
      component.loadButtontext();
      expect(component.btnExittxt).toBe('Exit');
    });
    it('should load button text as save and exit', () => {
      component.planDetails.planCompleted = false;
      component.loadButtontext();
      expect(component.btnExittxt).toBe('Save & Exit');
    });

    it('should check for newly added variable position is found ', () => {
      testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].staffCount=null;
      testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].variablePositionKey=3;
      component.checkForNewlyAddedVarpos(testStaffScheduleData[0].planShiftList[0].staffGridCensuses[0],
        testStaffScheduleData[0].planShiftList[0]);
    });
    it('should check for newly added variable position is not found ', () => {
      testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].variablePositionKey = 9;
      component.checkForNewlyAddedVarpos(testStaffScheduleData[0].planShiftList[0].staffGridCensuses[0],
        testStaffScheduleData[0].planShiftList[0]);
    });
    it('should check for newly added variable position is not found ', () => {
      testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].variablePositionKey = 9;
      testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].staffCount = 1;
      component.checkForNewlyAddedVarpos(testStaffScheduleData[0].planShiftList[0].staffGridCensuses[0],
        testStaffScheduleData[0].planShiftList[0]);
    });

    it('should check for newly added variable position is found ', () => {
      component.checkForNewlyAddedVarpos(testStaffScheduleData[0].planShiftList[0].staffGridCensuses[0],
        testStaffScheduleData[0].planShiftList[0]);
    });
    it('should check for newly added variable position is not found ', () => {
      testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].variablePositionKey = 9;
      component.checkForNewlyAddedVarpos(testStaffScheduleData[0].planShiftList[0].staffGridCensuses[0],
        testStaffScheduleData[0].planShiftList[0]);
    });
    it('should check for newly added variable position is not found ', () => {
      testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].variablePositionKey = 9;
      testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].staffCount = 1;
      component.checkForNewlyAddedVarpos(testStaffScheduleData[0].planShiftList[0].staffGridCensuses[0],
        testStaffScheduleData[0].planShiftList[0]);
    });
  });

  it('should populate data', () => {
    testPlanDetails[0].staffScheduleList[0].planShiftList[0].staffToPatientList[0].staffCount = 2;
    testPlanDetails[0].staffScheduleList[0].planShiftList[0].staffGridCensuses = [];
    component.planDetails = testPlanDetails[0];
    spyOn(component, 'checkIfCensusangeIncreased').and.stub();
    component.populateData();
    expect(component.cenRange[0]).toBe(-1);
    expect(component.maxCensusSaved).toBe(0);
  });
  it('should populate data', () => {
    testPlanDetails[0].staffScheduleList[0].planShiftList[0].staffToPatientList[0].staffCount = 0;
    testPlanDetails[0].staffScheduleList[0].planShiftList[0].staffGridCensuses = [];
    component.planDetails = testPlanDetails[0];
    spyOn(component, 'checkIfCensusangeIncreased').and.stub();
    component.populateData();
    expect(component.cenRange[0]).toBe(-1);
    expect(component.maxCensusSaved).toBe(0);
    expect(component.minCensusSaved).toBe(0);
  });
  it('should populate data', () => {
    testPlanDetails[0].staffScheduleList[0].planShiftList[0].staffToPatientList[0].staffCount = 2;
    spyOn(component, 'checkIfCensusangeIncreased').and.returnValue(true);
    component.planDetails = testPlanDetails[0];
    component.populateData();
    expect(component.cenRange[0]).toBe(-1);
    expect(component.checkIfCensusangeIncreased).toHaveBeenCalled();
    expect(component.maxCensusSaved).toBe(6);
    expect(component.minCensusSaved).toBe(-2);
  });
  it('should populate data', () => {
    testPlanDetails[0].staffScheduleList[0].planShiftList[0].staffToPatientList[0].staffCount = 0;
    spyOn(component, 'checkIfCensusangeIncreased').and.returnValue(true);
    component.planDetails = testPlanDetails[0];
    component.minCensusSaved = 10;
    component.planDetails.censusRange.minimumCensus = 0;
    component.populateData();
    expect(component.cenRange[0]).toBe(0);
    expect(component.checkIfCensusangeIncreased).toHaveBeenCalled();
    expect(component.maxCensusSaved).toBe(6);
    expect(component.minCensusSaved).toBe(-1);
  });
  it('should populate data', () => {
    testPlanDetails[0].staffScheduleList[0].planShiftList[0].staffToPatientList[0].staffCount = 3;
    spyOn(component, 'checkIfCensusangeIncreased').and.returnValue(true);
    component.planDetails = testPlanDetails[0];
    component.minCensusSaved = 10;
    component.planDetails.censusRange.minimumCensus = 0;
    component.populateData();
    expect(component.cenRange[0]).toBe(0);
    expect(component.checkIfCensusangeIncreased).toHaveBeenCalled();
    expect(component.maxCensusSaved).toBe(6);
    expect(component.minCensusSaved).toBe(-1);
  });
  it('should populate data', () => {
    testPlanDetails[0].staffScheduleList[0].planShiftList[0].staffToPatientList[0].staffCount = 3;
    spyOn(component, 'checkIfCensusangeIncreased').and.returnValue(true);
    component.planDetails = testPlanDetails[0];
    component.minCensusSaved = 10;
    component.planDetails.censusRange.minimumCensus = 10;
    component.populateData();
    expect(component.cenRange[0]).toBe(undefined);
    expect(component.checkIfCensusangeIncreased).toHaveBeenCalled();
    expect(component.maxCensusSaved).toBe(6);
    expect(component.minCensusSaved).toBe(9);
  });
  it('should populate data', () => {
    component.planDetails = testPlanDetails[0];
    component.planDetails.censusRange = testPlanDetails[0].censusRange;
    component.planDetails.censusRange.maximumCensus = 3;
    testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].staffCount = 2;
    spyOn(component, 'checkIfCensusangeIncreased').and.returnValue(false);
    component.maxCensusSaved = 1;
    component.populateData();
    expect(component.maxCensusSaved).toBe(1);
    expect(component.minCensusSaved).toBe(0);
  });
  it('should populate data', () => {
    component.planDetails.censusRange = null;
    component.populateData();
    expect(component.maxCensusSaved).toBe(0);
    expect(component.minCensusSaved).toBe(0);
  });
  it('should submit plan', () => {
    component.submitPlan();
    expect(sessionStorage.getItem('plandetails')).not.toBe(null);
  });
  it('should check if census increased and return true', () => {
    expect(component.checkIfCensusangeIncreased(testStaffScheduleData[0].planShiftList[0])).toBe(true);
    expect(component.minCensusSaved).toBe(1);
    expect(component.maxCensusSaved).toBe(2);
  });
  it('should check if census increased and return true', () => {
    testStaffScheduleData[0].planShiftList[0].staffGridCensuses[1].censusIndex = 0;
    expect(component.checkIfCensusangeIncreased(testStaffScheduleData[0].planShiftList[0])).toBe(true);
    expect(component.minCensusSaved).toBe(0);
    expect(component.maxCensusSaved).toBe(1);
  });
  it('should check if census increased and return true', () => {
    component.planDetails.censusRange.minimumCensus = 0;
    component.planDetails.censusRange.maximumCensus = 1;
    expect(component.checkIfCensusangeIncreased(testStaffScheduleData[0].planShiftList[0])).toBe(false);
    expect(component.minCensusSaved).toBe(0);
    expect(component.maxCensusSaved).toBe(1);
  });
  it('should check if summary table is active', () => {
    component.planDetails = testPlanDetails[0];
    spyOn(component, 'ngOnInit');
    component.checkIfSummaryTabIsActive();
    expect(component.ngOnInit).not.toHaveBeenCalled();
  });
  it('should check summary tab is not active', () => {
    component.tabGroup.selectedIndex = 2;
    component.planDetails.staffScheduleList.length = 1;
    spyOn(component, 'ngOnInit');
    component.checkIfSummaryTabIsActive();
    expect(component.ngOnInit).not.toHaveBeenCalled();
  });
  it('should ', () => {
    component.clickonbackbutton();
  });
  it('should load staff grid details', function () {
    component.planKey = '1';
    spyOn(component, 'populateData').and.stub();
    spyOn(component, 'orderStafftoPatientByVarpos').and.stub();
    spyOn(component, 'checkForNewlyAddedVarpos').and.stub();
    spyOn(component, 'orderStaffGridCensusByVarpos').and.stub();
    testStaffScheduleData[0].planShiftList[0].key = '1';
    testStaffScheduleData[0].planShiftList[0].staffGridCensuses = null;
    component.planDetails.planCompleted = true;
    component.loadStaffGridDetails(testStaffScheduleData);
    expect(component.populateData).toHaveBeenCalled();
    expect(component.orderStafftoPatientByVarpos).toHaveBeenCalled();
    expect(component.checkForNewlyAddedVarpos).toHaveBeenCalled();
    expect(component.orderStaffGridCensusByVarpos).toHaveBeenCalled();
    expect(component.tabIndex).toBe(component.planDetails.staffScheduleList.length);
  });
  it('should load staff grid details', function () {
    component.planKey = '1';
    spyOn(component, 'populateData').and.stub();
    spyOn(component, 'orderStafftoPatientByVarpos').and.stub();
    spyOn(component, 'checkForNewlyAddedVarpos').and.stub();
    spyOn(component, 'orderStaffGridCensusByVarpos').and.stub();
    testStaffScheduleData[0].planShiftList[0].key = '1';
    component.planDetails.planCompleted = false;
    component.loadStaffGridDetails(testStaffScheduleData);
    expect(component.populateData).toHaveBeenCalled();
    expect(component.orderStafftoPatientByVarpos).toHaveBeenCalled();
    expect(component.checkForNewlyAddedVarpos).toHaveBeenCalled();
    expect(component.orderStaffGridCensusByVarpos).toHaveBeenCalled();
  });
  it('should order staff grid census by variable position', function () {
    component.planDetails = testPlanDetails[0];
    component.orderStaffGridCensusByVarpos(testStaffGridCensusData[0]);
    expect(component.planDetails.variableDepartmentPositions[0].categoryKey).toBe(testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].variablePositionKey);
  });
  it('should order staff grid census by variable position', function () {
    component.planDetails = testPlanDetails[0];
    testStaffGridCensusData[0].staffToPatientList[0].variablePositionKey=1;
    component.orderStaffGridCensusByVarpos(testStaffGridCensusData[0]);
    expect(component.planDetails.variableDepartmentPositions[0].categoryKey).toBe(testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].variablePositionKey);
  });
  it('should order staff to patient by variable po', function () {
    component.planDetails = testPlanDetails[0];
    component.orderStafftoPatientByVarpos(testStaffScheduleData[0].planShiftList[0]);
    expect(component.planDetails.variableDepartmentPositions[0].categoryKey).toBe(testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].variablePositionKey);
    expect(testStaffScheduleData[0].planShiftList[0].staffToPatientList.filter(el=>el.variablePositionKey===component.planDetails.variableDepartmentPositions[0].categoryKey)[0]).toBeTruthy()
  });
  it('should order staff to patient by variable po', function () {
    testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].variablePositionKey=2;
    component.planDetails = testPlanDetails[0];
    component.orderStafftoPatientByVarpos(testStaffScheduleData[0].planShiftList[0]);
    expect(testStaffScheduleData[0].planShiftList[0].staffToPatientList.filter(el=>el.variablePositionKey===component.planDetails.variableDepartmentPositions[0].categoryKey)[0]).toBeFalsy();
  });

  it('should find a leap year', function () {
    component.planDetails.effectiveEndDate=new Date('01/04/2020');
    expect(component.getDaysInplanYear()).toBe(366);
  });
  it('should auto save', function () {
    component.saveAndExit=false;
    testPlanDetails[0].planCompleted=false;
    testPlanDetails[0].staffScheduleList[0].planShiftList[0].staffGridCensuses[0].key=null;
    component.planDetails=testPlanDetails[0];
    component.autoSave();
    expect(component.dataSaved).toBe(true);
  });
  it('should auto save', function () {

    testPlanDetails[0].staffScheduleList[0].planShiftList[0].staffGridCensuses[0].key='1';
    component.planDetails=testPlanDetails[0];
    component.autoSave();
    expect(component.dataSaved).toBe(false);
  });
  it('should auto save', function () {
    component.saveAndExit=false;
    testPlanDetails[0].staffScheduleList[0].planShiftList[0].staffGridCensuses[0].key='1';
    component.planDetails=testPlanDetails[0];
    component.planDetails.planCompleted=false;
    component.autoSave();
    expect(component.dataSaved).toBe(true);
  });
  it('should save staff grid details and go back', function () {
    testPlanDetails[0].planCompleted=false;
    component.planDetails=testPlanDetails[0];
    component.saveStaffGridDetailsandGoBack();
    expect(component.saveAndExit).toBe(false);

  });
  it('should save staff grid details and go back', function () {
    testPlanDetails[0].planCompleted=true;
    component.planDetails=testPlanDetails[0];
    component.saveStaffGridDetailsandGoBack();
    expect(component.saveAndExit).toBe(false);
  });
  it('should click on back button ', function () {
    spyOn(component,'saveStaffGridDetailsandGoBack').and.stub();
    spyOn(component,'clickOnTabOrCancelButton').and.stub();

    mockMatDialog.open.and.callFake(function () {
      return {
        afterClosed(){
          return of(flag,ConfirmWindowOptions.save)
        }
      }
    });
    testPlanDetails[0].planCompleted=false;
    component.strplanDetails="testing";
    component.planDetails=testPlanDetails[0];
    component.dataSaved=false;
    component.clickonbackbutton();
    expect(component.clickOnTabOrCancelButton).toHaveBeenCalled();
    expect(component.saveStaffGridDetailsandGoBack).toHaveBeenCalled();
  });
  it('should click on back button 1', function () {
    flag=false;
    spyOn(component,'saveStaffGridDetailsandGoBack').and.stub();
    mockMatDialog.open.and.callFake(function () {
      return {
        afterClosed(){
          return of(flag,ConfirmWindowOptions.save)
        }
      }
    });
    testPlanDetails[0].planCompleted=false;
    component.strplanDetails="testing";
    component.planDetails=testPlanDetails[0];
    component.dataSaved=false;
    component.clickonbackbutton();
    expect(component.saveStaffGridDetailsandGoBack).toHaveBeenCalled();
    expect(component.pageGroup.selectedIndex).toBe(component.previousIndex);
  });
  it('should update data from oa', function () {
    spyOn(component,'getSuggestedData');
    testPlanDetails[0].effectiveStartDate=new Date('1');
    component.planDetails=testPlanDetails[0];
    component.updateDataFromOA();
    expect(component.getSuggestedData).toHaveBeenCalled()
  });
  it('should update data from oa', function () {
    spyOn(component,'getSuggestedData');
    testPlanDetails[0].effectiveStartDate=null;
    component.planDetails=testPlanDetails[0];
    component.updateDataFromOA();
    expect(component.getSuggestedData).not.toHaveBeenCalled()
  });
  it('should get suggested data', function () {
    testPlanDetails[0].oAStaffingMetric=testOAData.data[0];
    component.planDetails=testPlanDetails[0]
    component.getSuggestedData();
    expect(component.entitydisplayval).toBe(component.planDetails.facilityCode+'-'+component.planDetails.facilityName);
    expect(component.departmentdisplayval).toBe(component.planDetails.departmentCode+'-'+component.planDetails.departmentName);
  });
  it('should get suggested data', function () {
    testPlanDetails[0].budgetAverageVolume=0;
    component.planDetails=testPlanDetails[0];
    component.getSuggestedData();
    expect(component.entitydisplayval).toBe(component.planDetails.facilityCode+'-'+component.planDetails.facilityName);
    expect(component.departmentdisplayval).toBe(component.planDetails.departmentCode+'-'+component.planDetails.departmentName);
    expect(component.annualBudgetdisplayval).toBe('-')
  });
  it('should load other pages', function () {
    component.loadOtherPages();
    expect(component.pageGroup.selectedIndex).toBe(component.previousIndex);
  });
  it('should load other pages', function () {
    component.pageGroup.selectedIndex=0;
    component.previousIndex=1;
    testPlanDetails[0].key='1';
    component.planDetails=testPlanDetails[0];
    component.loadOtherPages();
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
  it('should load other pages', function () {
    component.pageGroup.selectedIndex=1;
    component.previousIndex=2;
    testPlanDetails[0].key='1';
    component.planDetails=testPlanDetails[0];
    component.loadOtherPages();
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
  it('should load other pages', function () {
    testPlanDetails[0].key='2';
    component.planDetails=testPlanDetails[0];
    component.pageGroup.selectedIndex=9;
    component.previousIndex=2;
    component.loadOtherPages();
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
  it('should load other pages', function () {
    component.planDetails=testPlanDetails[0];
    component.pageGroup.selectedIndex=3;
    component.previousIndex=1;
    testPlanDetails[0].key='1';
    component.loadOtherPages();
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
  it('should check tab changes', function () {
    spyOn(component,'clickonbackbutton');
    component.checkTabChange();
    expect(component.clickonbackbutton).not.toHaveBeenCalled();
  });
  it('should check tab changes', function () {
    component.pageGroup.selectedIndex=1;
    component.previousIndex=1;
    spyOn(component,'clickonbackbutton');
    component.checkTabChange();
    expect(component.clickonbackbutton).toHaveBeenCalled();
  });
  it('should click on tab or Cncel button ', function () {
    component.pageGroup.selectedIndex=1;
    component.previousIndex=1;
    component.clickOnTabOrCancelButton();
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
  it('should click on tab or Cncel button ', function () {
    spyOn(component,'loadOtherPages');
    component.pageGroup.selectedIndex=2;
    component.previousIndex=1;
    component.clickOnTabOrCancelButton();
    expect(component.loadOtherPages).toHaveBeenCalled();
  });

})


