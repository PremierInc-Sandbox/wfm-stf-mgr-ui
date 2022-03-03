import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {StaffManagerPlanComponent} from './staff-manager-plan.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {PlanService} from '../../../shared/service/plan-service';
import {of} from 'rxjs';
import {planDetailsData} from '../../../shared/service/fixtures/plan-details-data';
import { MatDialog } from '@angular/material/dialog';
import {StaffVarianceService} from '../../../shared/service/staff-variance.service';
import {staffVarianceData} from '../../../shared/service/fixtures/staffVarianceData';
import {ScheduleService} from '../../../shared/service/schedule-service';
import {StaffGridService} from '../../../shared/service/Staffgrid-service';
import {staffScheduleData} from '../../../shared/service/fixtures/staff-schedule-data';
import {offGridActivitiesData} from '../../../shared/service/fixtures/off-grid-activities-data';
import {staffGridCensusData} from '../../../shared/service/fixtures/staff-grid-census-data';
import {OAService} from '../../../shared/service/oa-service';
import {oaSuggestedDataSample} from '../../../shared/service/fixtures/oa-suggested-data-sample';
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;
import createSpy = jasmine.createSpy;
import {oaSuggestedDataSample2} from '../../../shared/service/fixtures/oa-suggested-data-sample2';
import {PredictedDataService} from '../../../shared/service/predicted-data.service';
import {StaffManagerPlanCalculatorComponent} from '../components/staff-manager-plan-calculator/staff-manager-plan-calculator.component';
import {StaffManagerPlanScoreCardComponent} from '../components/staff-manager-plan-score-card/staff-manager-plan-score-card.component';
import {PageRedirectionService} from "../../../shared/service/page-redirection.service";
import {RouterHistoryTrackerService} from "../../../shared/service/router-history-tracker.service";
import {UserService} from "../../../shared/service/user.service";
import {customUserData} from "../../../shared/service/fixtures/user-data";
import {PlanDetails} from '../../../shared/domain/plan-details';
import {productHelpData} from "../../../shared/service/fixtures/product-help-data";
import {MatSnackBar} from '@angular/material/snack-bar';
import {predictedResponse} from "../../../shared/domain/PredictedResponse";

xdescribe('StaffManagerPlanComponent', () => {
  let component: StaffManagerPlanComponent;
  let fixture: ComponentFixture<StaffManagerPlanComponent>;
  let testPlanDetails = planDetailsData();
  const testOASuggestionData = oaSuggestedDataSample();
  const testOASuggestionData2 = oaSuggestedDataSample2();
  let map;
  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    getCurrentNavigation: () => {
      return {
        extras: {},
      };
    }
  };
  const historicalDataForPastRecords = {
    data : [
      {
        'departmentList' : {
          'departmentKey' : 0,
          'historicalDataPast' : []
        }
      }
    ]

  }
  let spyObjDialog: MatDialog;
  let testStaffVarianceData = [{
    departmentEntryKey: 1,
    departmentKey: 1,
    planKey: 1,
    recordStatusKey: 1,
    actualHours: 0,
    targetHours: 0,
    dailyVarianceHours: 0,
    priorCumulativeHours: 0,
    fullTimeEquivalent: 0,
    createdBy: 'sfarmer',
    createdTime: new Date('12/12/2019'),
    updatedBy: 'sfarmer',
    updatedTime: new Date('12/12/2019'),
    recordDate: new Date('12/12/2019'),
    departmentName: 'first department',
    comments: '',
    commentsUpdatedBy: '',
    shiftComments: ['1', '', '', '', '', '', ''],
    lowerThreshold: 0,
    upperThreshold: 0,
    disableFlag: false,
    staffVarianceSummaries: [{
      predictedCount: 3,
      shiftDetailKey: 1,
      censusValue: 1,
      comments: '',
      commentsUpdatedBy: '',
      additionalStaffHours: 1,
      offGridActivitiesHour: 1,
      defaultShiftKey: 1,
      shiftTime: 3,
      shiftFormat: 'AM',
      shiftTimeRange: '03:00 - 07:00',
      plannedShift: {
        key: '',
        name: '',
        hours: 0,
        timeFormatFlag: true,
        startTime: '05:00',
        staffToPatientList: null,
        staffGridCensuses: [{
          key: 'key',
          shiftKey: 'shiftKey',
          censusIndex: 0,
          censusValue: 0,
          productivityIndex: 0,
          totalPlanWHpU: 0,
          staffToPatientList: [{
            variablePositionKey: 1,
            variablePositionCategoryAbbreviation: 'varposabrv',
            variablePositionCategoryDescription: 'varpos Description',
            staffCount: 0,
            activeFlag: false
          }],
        },
          {
            key: 'key',
            shiftKey: 'shiftKey',
            censusIndex: 2,
            censusValue: 1,
            productivityIndex: 0,
            totalPlanWHpU: 0,
            staffToPatientList: null,
          }],
        staffGrid: [
          {
            key: 0,
            staffCount: 0,
            variablePositionKey: 6,
            variablePositionCategoryDescription: 'varpos Description',
            censusLookupKey: 5,
            shiftLookupKey: 3
          }
        ],
        shiftStartTime: '',
        last: false,
        HasError: false,
        activeFlag: false,
        errormsg: ['error'],
      },
      plannedShifts: [{
        objshift: {
          staffGridCensuses: [{
            key: 'key',
            shiftKey: 'shiftKey',
            censusIndex: 0,
            censusValue: 0,
            productivityIndex: 0,
            totalPlanWHpU: 0,
            staffToPatientList: [{
              variablePositionKey: 1,
              variablePositionCategoryAbbreviation: 'varposabrv2',
              variablePositionCategoryDescription: 'varpos Description',
              staffCount: 0,
              activeFlag: false
            }],
          }],
          shiftStartTime: '',
          HasError: false,
          last: false,
          activeFlag: false,
          errormsg: ['error'],
          key: '',
          name: 'shift1',
          hours: 0,
          timeFormatFlag: true,
          startTime: '06:00',
          staffToPatientList: null,
          staffGrid: [
            {
              key: 0,
              staffCount: 0,
              variablePositionKey: 6,
              variablePositionCategoryDescription: 'varpos Description',
              censusLookupKey: 5,
              shiftLookupKey: 3
            }
          ],
        },
        timestart: false,
        timeEnds: false,

      }],
      isCensusvalid: true,
      staffVarianceDetails: [{
        variableCategoryKey: 1,
        actualCount: 1,
        variableAbbrevation: '',
        scheduleCount: 0,
        plannedCount: 0,
      }],
    }],

    selectedDate: '',
    recordDateForFuture: '',
    planAlreadyInUse: false,
  }];
  let spyObjstaffManagerService: SpyObj<StaffVarianceService>;
  let staffManagerPlanScoreCardComponentSpyObj:SpyObj<StaffManagerPlanScoreCardComponent>;
  let userServiceSpyObj: SpyObj<UserService> = createSpyObj('UserService', ['logout']);
  const pageRedirectService: SpyObj<PageRedirectionService> = createSpyObj('PageRedirectService', ['redirectToLogout', 'redirectToExternalPage', 'redirectToWhoopsPage', 'generateErrorCode', 'getProductHelpUrl']);
  let mockActivatedRoute = jasmine.createSpyObj(['queryParamMap', 'set', 'setItem']);
  const routerTracker: SpyObj<RouterHistoryTrackerService> = createSpyObj('RouterHistoryTrackerService', ['nextUrl']);
  let mockHttpClient;
  let spyObjScheduleService: SpyObj<ScheduleService>;
  let spyObjStaffGridService: SpyObj<StaffGridService>;
  let spyObjPlanService: SpyObj<PlanService>;
  let oaServiceSpyObj: SpyObj<OAService>;
  const testStaffScheduleData = staffScheduleData();
  let testOffGridActivities = offGridActivitiesData();
  const testStaffGridCensus = staffGridCensusData();
  let mockMatDialog;
  let mockMatSnackBar: SpyObj<MatSnackBar> = jasmine.createSpyObj(['dismiss']);
  const userDataTest = customUserData();
  userServiceSpyObj.user = userDataTest[0];
  userServiceSpyObj.logout.and.returnValue(of(userDataTest));
  let spyObjPredictedDataService: SpyObj<PredictedDataService>;
  let flag=true;
  const comments = 'lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll' +
    'lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll' +
    'lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll' +
    'lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll';
  const numberObj = {
    which: false,
    keyCode: 58,
  };
  mockMatDialog = jasmine.createSpyObj({
    afterClosed:createSpy('name', function () {
      return of();
    }).and.callThrough(), close: null, open: createSpy('open', function() {
      return this;
    })
  });
  let event={
    target:{
      nodeName:'INPUT',
    }
  }
  mockMatDialog.componentInstance = {body: ''};
  beforeEach(waitForAsync(() => {

    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(flag)
        }
      }
    });
    spyObjDialog = jasmine.createSpyObj(['open']);
    map = (new Map<string, string>());
    map.set('plankey', '1');
    mockActivatedRoute = {
      queryParamMap: of(map)
    };
    staffManagerPlanScoreCardComponentSpyObj=createSpyObj('StaffManagerPlanScoreCardComponent',['oASuggestedData','loadOAPlanDataEntity','getSuggestedData','getActualWHpU', 'getActualHour', 'getAverageCensus','getPlannedMinusDailyHours','getOGATotalhours', 'toggleScoreTextBasedOnDate']);
    spyObjPredictedDataService=createSpyObj('PredictedDataService',['getPredictedDataForPresentDate','getHistoricDataforPastRecords','savePredictedModel','getPredictedDataFromVolumeForecasting']);
    spyObjPredictedDataService.getPredictedDataForPresentDate.and.returnValue(of());
   // spyObjPredictedDataService.savePredictedModel.and.returnValue(of());
    spyObjPredictedDataService.getPredictedDataFromVolumeForecasting.and.returnValue(of(predictedResponse()[0]));
    spyObjPredictedDataService.getHistoricDataforPastRecords.and.returnValue(of(historicalDataForPastRecords[0]));
    spyObjScheduleService = createSpyObj('ScheduleService', ['getScheduleDetails', 'getAverageCensus', 'getOGATotalhours', 'setStaffVarianceData', 'setPlanDetails']);
    spyObjScheduleService.getScheduleDetails.and.returnValue(of(testStaffScheduleData));
    spyObjStaffGridService = createSpyObj('StaffGridService', ['getStaffGridDetails']);
    spyObjStaffGridService.getStaffGridDetails.and.returnValue(of(testStaffGridCensus));
    spyObjPlanService = createSpyObj('PlanService', ['getPlandetails','getSystemOptionValuesFromDTM', 'getRedirectUrl']);
    spyObjPlanService.getPlandetails.and.returnValue(of());
    spyObjPlanService.getSystemOptionValuesFromDTM.and.returnValue(of());
    let testProductData=productHelpData();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let blob = new Blob([JSON.stringify(testStaffVarianceData[0], null, 2)], {type : 'application/json'});
    let init = { "status" : 200 , "statusText" : "getStaffVarianceByDepartmentAndPlan!" };
    let expectedResponse = new Response(blob, init);
    spyObjPlanService.getRedirectUrl.and.returnValue(of(testProductData[0]));
    oaServiceSpyObj = createSpyObj('OAService', ['getPlanManagerOASuggestedData']);
    oaServiceSpyObj.getPlanManagerOASuggestedData.and.returnValue(of(testOASuggestionData[0]));
    spyObjstaffManagerService = createSpyObj(['getStaffVarianceByDepartmentAndPlan', 'saveStaffVarianceDetails', 'removePlanKeyFromSessionAttribute', 'updateSessionForStaffVariance']);
    spyObjstaffManagerService.getStaffVarianceByDepartmentAndPlan.and.returnValue(of(expectedResponse));
    spyObjstaffManagerService.saveStaffVarianceDetails.and.returnValue(of(testStaffVarianceData));
    spyObjstaffManagerService.removePlanKeyFromSessionAttribute.and.returnValue(of());
    spyObjstaffManagerService.updateSessionForStaffVariance.and.returnValue(of());

    staffManagerPlanScoreCardComponentSpyObj.getActualWHpU.and.returnValue(1);
    staffManagerPlanScoreCardComponentSpyObj.getActualHour.and.returnValue(1);
    spyObjScheduleService.getAverageCensus.and.returnValue(1);
    staffManagerPlanScoreCardComponentSpyObj.getPlannedMinusDailyHours.and.returnValue(1);
    spyObjScheduleService.getOGATotalhours.and.returnValue(1);
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [StaffManagerPlanComponent, StaffManagerPlanCalculatorComponent, StaffManagerPlanScoreCardComponent],
      providers: [{provide: ActivatedRoute, useValue: mockActivatedRoute}, {provide: HttpClient, useValue: mockHttpClient}
        , {provide: PlanService, useValue: spyObjPlanService}, {provide: OAService, useValue: oaServiceSpyObj},
        {provide: MatDialog, useValue: mockMatDialog}, {provide: Router,useValue: mockRouter},
        {provide: StaffVarianceService, useValue: spyObjstaffManagerService}, {provide: ScheduleService, useValue: spyObjScheduleService},
        {provide: StaffGridService, useValue: spyObjStaffGridService},{provide: PredictedDataService, useValue: spyObjPredictedDataService},
        { provide: PageRedirectionService,
          useValue: pageRedirectService},{provide: RouterHistoryTrackerService,useValue: routerTracker},
        {provide:UserService,useValue:userServiceSpyObj},{provide:MatSnackBar,useValue:mockMatSnackBar}]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffManagerPlanComponent);
    component = fixture.componentInstance;
    //spyOn(component, 'getSuggestedData').and.stub();
    component.staffmanagerCalculator=TestBed.createComponent(StaffManagerPlanCalculatorComponent).componentInstance;
    fixture.detectChanges();
    testStaffVarianceData = staffVarianceData();
    testOffGridActivities = offGridActivitiesData();
    testPlanDetails = planDetailsData();
    spyOn(component.alertBox,'openAlert');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    component.staffVariance = testStaffVarianceData[0];
    spyObjstaffManagerService.planAlreadyInUse = true;
    component['staffManagerService'] = spyObjstaffManagerService;
  });


  it('should create 6 new summaries', () => {
    component.planDetails.staffScheduleList[0] = testPlanDetails[0].staffScheduleList[0];
    spyObjPlanService.getPlandetails.and.returnValue(of(testPlanDetails[0]));
    component.staffVariance = null;
    // spyOn(component,'loadPredictedValue').and.stub()
    component.StaffSummaryDetails();
    expect(component.staffVariance.staffVarianceSummaries.length).toBe(6);
  });
  it('should reset values', () => {
    component.planDetails=testPlanDetails[0];
    component.planDetails.variableDepartmentPositions[0]=testPlanDetails[0].variableDepartmentPositions[0];
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    spyObjPlanService.getPlandetails.and.returnValue(of(testPlanDetails[0]));
    component.StaffSummaryDetails();
    //expect(component.strStaffVariance).toEqual(JSON.stringify(component.staffVariance));
    expect(component.strStaffVariance).not.toBeNull();

  });
  it('should reset values', () => {
    component.planDetails=testPlanDetails[0];
    component.planDetails.variableDepartmentPositions[0]=testPlanDetails[0].variableDepartmentPositions[0];
    component.staffVariance=testStaffVarianceData[0];
    testStaffVarianceData[0].staffVarianceSummaries[0].censusValue=null;
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    spyObjPlanService.getPlandetails.and.returnValue(of(testPlanDetails[0]));
    component.planDetails.departmentKey = 1;
    component.planDetails.key = '1';
    spyOn(component, 'getHistoricDataforPastRecords').and.stub();
    component.StaffSummaryDetails();
    //!expect(component.strStaffVariance).toBe(JSON.stringify(component.staffVariance));
    expect(component.strStaffVariance).not.toBeNull();
  });
  it('should reset values ', function () {
    component.planDetails.staffScheduleList[0] = testPlanDetails[0].staffScheduleList[0];
    component.staffVariance=null;
    component.planDetails=testPlanDetails[0];
    component.planDetails.variableDepartmentPositions[0]=testPlanDetails[0].variableDepartmentPositions[0];
    // spyOn(component,'loadPredictedValue').and.stub()
    component.StaffSummaryDetails();
    //expect(component.strStaffVariance).toBe(JSON.stringify(component.staffVariance));
    expect(component.strStaffVariance).not.toBeNull();
  });
  it('should  reset values and return 0', function () {
    component.staffVariance.staffVarianceSummaries=null;
    expect(component.StaffSummaryDetails()).toBe(0)

  });
  it('should reset form', function () {
    component.strStaffVariance = JSON.stringify(component.staffVariance);
    component.resetForm();
    expect(component.staffVariance[0]).not.toBe(null);
  });
  it('should openDialog', () => {
    component.staffVariance = testStaffVarianceData[0];
    component.openDialog();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/staff-manager']);
  });

  it('should load staff variance details', () => {
   spyOn(component, 'StaffSummaryDetails').and.stub();
   component.planDetails.departmentKey = 1;
   component.planDetails.key = '1';
   spyObjstaffManagerService.getStaffVarianceByDepartmentAndPlan(1,1,1).subscribe(data => {
    component.staffVariance.planAlreadyInUse = true;
   });
   component.loadStaffVarianceDetails();
   expect(spyObjstaffManagerService.getStaffVarianceByDepartmentAndPlan).toHaveBeenCalled();
 });
  it('should save and exit staffing details ', () => {
   testStaffVarianceData[0].actualHours = 0;
   testStaffVarianceData[0].staffVarianceSummaries[0].staffVarianceDetails[0].actualCount = null;
   component.planDetails=testPlanDetails[0];
   component.staffmanagerScoreCard = staffManagerPlanScoreCardComponentSpyObj;
   component.staffmanagerScoreCard.oASuggestedData=testOASuggestionData2.data[0];
   component.staffVariance = testStaffVarianceData[0];
   component.saveAndExitStaffingDetails(true);
   expect(component.alertBox.openAlert).toHaveBeenCalled();
 });
  it('should save and exit staffing details ', () => {
    flag = false;
    component.staffVariance = testStaffVarianceData[0];
    component.planDetails = testPlanDetails[0];
    component.staffmanagerScoreCard = staffManagerPlanScoreCardComponentSpyObj;
    component.saveAndExitStaffingDetails(true);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/staff-manager']);
 });
  it('should save and exit staffing details ', () => {
    flag=true;
    component.staffVariance = testStaffVarianceData[0];
    component.planDetails=testPlanDetails[0];
    component.staffmanagerScoreCard = staffManagerPlanScoreCardComponentSpyObj;
    component.saveAndExitStaffingDetails(true);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/staff-manager']);
  });
  it('should save and exit staffing details ', () => {
    flag=true;
    component.staffVariance = testStaffVarianceData[0];
    component.planDetails=testPlanDetails[0];
    component.staffmanagerScoreCard = staffManagerPlanScoreCardComponentSpyObj;
    component.saveAndExitStaffingDetails(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/staff-manager']);
  });
  it('should get staff summary details', () => {
    component.planDetails.staffScheduleList[0] = testPlanDetails[0].staffScheduleList[0];
   component.staffVariance = testStaffVarianceData[0];
   component.StaffSummaryDetails();
   //expect(component.strStaffVariance).toBe(JSON.stringify(component.staffVariance));
    expect(component.strStaffVariance).not.toBeNull();
 });
  it('should get staff summary details', () => {
    component.planDetails.staffScheduleList[0] = testPlanDetails[0].staffScheduleList[0];
    testStaffVarianceData[0].staffVarianceSummaries[0].censusValue = null;
    component.staffVariance = testStaffVarianceData[0];
    component.StaffSummaryDetails();
    //expect(component.strStaffVariance).toBe(JSON.stringify(component.staffVariance));
    expect(component.strStaffVariance).not.toBeNull();
  });

  it('should get active shift for a plan ', () => {
    component.planDetails.staffScheduleList[0] = testPlanDetails[0].staffScheduleList[0];
   testPlanDetails[0].staffScheduleList[0].planShiftList[0].hours = 12;
   component.planDetails = testPlanDetails[0];
   expect(component.getActiveshiftFromPlan(13, 'AM')).not.toBeNull();
 });
  it('should get active shift for a plan', () => {
    component.planDetails.staffScheduleList[0] = testPlanDetails[0].staffScheduleList[0];
   testPlanDetails[0].staffScheduleList[0].planShiftList[0].hours = 20;
   component.planDetails = testPlanDetails[0];
   expect(component.getActiveshiftFromPlan(1, 'AM')).not.toBeNull();
 });
  it('should get active shift for a plan', () => {
    component.planDetails.staffScheduleList[0] = testPlanDetails[0].staffScheduleList[0];
   testPlanDetails[0].staffScheduleList[0].planShiftList[0].hours = 20;
   component.planDetails = testPlanDetails[0];
   expect(component.getActiveshiftFromPlan(14, 'AM')).not.toBeNull();
 });
  it('should get active shift for a plan ', () => {
    component.planDetails.staffScheduleList[0] = testPlanDetails[0].staffScheduleList[0];
   testPlanDetails[0].staffScheduleList[0].planShiftList[0].timeFormatFlag = false;
   testPlanDetails[0].staffScheduleList[0].planShiftList[0].hours = 20;
   component.planDetails = testPlanDetails[0];
   expect(component.getActiveshiftFromPlan(1, 'AM')).not.toBeNull();
 });
  it('should get active shift for a plan ', () => {
    component.planDetails.staffScheduleList[0] = testPlanDetails[0].staffScheduleList[0];
   testPlanDetails[0].staffScheduleList[0].planShiftList[0].timeFormatFlag = false;
   testPlanDetails[0].staffScheduleList[0].planShiftList[0].hours = 20;
   component.planDetails = testPlanDetails[0];
   expect(component.getActiveshiftFromPlan(34, 'AM')).not.toBeNull();
 });
  it('should get active shift for a plan ', () => {
    component.planDetails.staffScheduleList[0] = testPlanDetails[0].staffScheduleList[0];
   component.planDetails = testPlanDetails[0];
   expect(component.getActiveshiftFromPlan(13, 'AM')).not.toBeNull();
 });
  it('should get active shift for a plan ', () => {
    component.planDetails.staffScheduleList[0]=testPlanDetails[0].staffScheduleList[0];
   component.planDetails = testPlanDetails[0];
   expect(component.getActiveshiftFromPlan(5, 'PM')).not.toBeNull();
 });
  it('should load schedules', () => {
   spyOn(component, 'loadStaffGridDetails').and.stub();
   component.loadSchedules();
   expect(component.planDetails.staffScheduleList[0]).toBe(testStaffScheduleData[0]);
   expect(spyObjScheduleService.getScheduleDetails).toHaveBeenCalled();
   expect(component.loadStaffGridDetails).toHaveBeenCalled();
 });

  it('should load staff grid details', () => {
    spyOn(component,'orderStaffGridCensusByVarpos');
    spyObjStaffGridService.getStaffGridDetails.and.returnValue(of(testStaffGridCensus));
    testStaffScheduleData[0].planShiftList[0].key='1';
    component.planKey = '1';
    component.loadStaffGridDetails(testStaffScheduleData);
    expect(component.orderStaffGridCensusByVarpos).toHaveBeenCalled();
  });
  it('should load staff grid details', () => {
    spyOn(component,'orderStaffGridCensusByVarpos')
    spyObjStaffGridService.getStaffGridDetails.and.returnValue(of(testStaffGridCensus));
    testStaffScheduleData[0].planShiftList[0].key='1';
    testStaffScheduleData[0].planShiftList[0].staffGridCensuses=null;
    component.planKey = '1';
    component.loadStaffGridDetails(testStaffScheduleData);
    expect(component.orderStaffGridCensusByVarpos).toHaveBeenCalled();
  });


  it('should match varpos value', () => {
    spyObjPlanService.getPlandetails.and.returnValue(of(testPlanDetails[0]));
    component.loadplandetails();
    expect(spyObjPlanService.getPlandetails).toHaveBeenCalledWith('1');
    component.planKey = '1';
    expect(component.planDetails.variableDepartmentPositions[0].categoryAbbreviation)
      .toBe(testPlanDetails[0].variableDepartmentPositions[0].categoryAbbreviation);
    expect(component.planDetails.variableDepartmentPositions[0].categoryDescription)
      .toBe(testPlanDetails[0].variableDepartmentPositions[0].categoryDescription);
  });

  it('should ', function () {
    spyOn(component,'StaffSummaryDetails');
    component.previousDate=undefined;
    component.loadStaffVarianceDetails();
    expect(component.StaffSummaryDetails).toHaveBeenCalled()
  });
  it('should save and exit staffing details ', function () {
    testStaffVarianceData[0].staffVarianceSummaries[0].comments=comments;
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.comments=comments;
    component.planDetails=testPlanDetails[0];
    component.staffmanagerScoreCard = staffManagerPlanScoreCardComponentSpyObj;
    component.saveAndExitStaffingDetails(false);
    expect(component.commentsError).toBe(true);
  });
  it('should save and exit staffing details', function () {
    testStaffVarianceData[0].staffVarianceSummaries[0].shiftDetailKey=null;
    component.staffVariance=testStaffVarianceData[0];
    component.staffVariance.staffVarianceSummaries[0]=testStaffVarianceData[0].staffVarianceSummaries[0];
    component.planDetails=testPlanDetails[0];
    component.staffmanagerScoreCard = staffManagerPlanScoreCardComponentSpyObj;
    component.saveAndExitStaffingDetails(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/staff-manager']);
  });
  it('should auto save', function () {
    spyOn(component,'loadplandetails');
    component.staffVariance=testStaffVarianceData[0];
    component.planDetails=testPlanDetails[0];
    component.staffmanagerScoreCard = staffManagerPlanScoreCardComponentSpyObj;
    component.autoSave();
    expect(component.loadplandetails).not.toHaveBeenCalled();
  });
  it('should auto save', function () {
    spyOn(component,'loadplandetails');
    testStaffVarianceData[0].staffVarianceSummaries[0].shiftDetailKey=null;
    component.staffVariance=testStaffVarianceData[0];
    component.planDetails=testPlanDetails[0];
    component.staffmanagerScoreCard = staffManagerPlanScoreCardComponentSpyObj;
    component.autoSave();
    expect(component.loadplandetails).toHaveBeenCalled();
  });
  it('should auto save', function () {
    spyOn(component,'loadplandetails');
    component.planDetails=testPlanDetails[0];
    component.staffmanagerScoreCard = staffManagerPlanScoreCardComponentSpyObj;
    testStaffVarianceData[0].staffVarianceSummaries[0].shiftDetailKey=null;
    testStaffVarianceData[0].staffVarianceSummaries[0].staffVarianceDetails[0].actualCount=null;
    testStaffVarianceData[0].staffVarianceSummaries[0].comments=comments;
    testStaffVarianceData[0].comments=comments;
    component.staffVariance=testStaffVarianceData[0];
    component.autoSave();
    expect(component.loadplandetails).not.toHaveBeenCalled()
    expect(component.commentsError).toBe(true);
  });
  it('should save and exit check for error ', function () {
    testStaffVarianceData[0].staffVarianceSummaries[0].comments=comments;
    testStaffVarianceData[0].comments=comments;
    component.staffVariance=testStaffVarianceData[0];
    expect(component.saveAndExitCheckForError()).toBe(true);
  });
  it('should save and exit check for error ', function () {
    testStaffVarianceData[0].actualHours=null
    testStaffVarianceData[0].staffVarianceSummaries[0].staffVarianceDetails[0].actualCount=null;
    component.staffVariance=testStaffVarianceData[0];
    expect(component.saveAndExitCheckForError()).toBe(true);
  });
  it('should save and exit toplanner', function () {
    spyOn(component,'saveAndExitStaffingDetails');
    component.saveAndExitToplanner();
    expect(component.saveAndExitStaffingDetails).toHaveBeenCalledWith(true);
  });
  it('should get planned hours for census', () => {
    component.staffVariance = testStaffVarianceData[0];
    expect(component.alertBox.getPlannedhoursForCensus(testStaffVarianceData[0], 0, 1, 0,2,5)).toBe('-');
  });
  it('should get planned hours for census', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift = null;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.alertBox.getPlannedhoursForCensus(testStaffVarianceData[0], 1, 1, 1,1,5)).toBeUndefined();
  });
   it('should get planned hours for census', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses = null;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.alertBox.getPlannedhoursForCensus(testStaffVarianceData[0], 0, 1, 1,1,5)).toBe('-');
  });
  it('should get planned hours for census', () => {
    component.staffVariance = testStaffVarianceData[0];
    expect(component.alertBox.getPlannedhoursForCensus(testStaffVarianceData[0], 0, 0,
      0,1,5)).toBe('0.00');
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
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses = null;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.alertBox.getVariancehoursForCensus(testStaffVarianceData[0], 0, 0, 0, 1)).toBe('1.00');
  });
  it('should get variance hours for census', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift = null;
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
  it('should get planned total ', () => {
    component.staffVariance = testStaffVarianceData[0];
    component.getPlannedTotal(-1);
    expect(component.getPlannedTotal(0)).toBe('-');
  });
  it('should get planned total ', () => {
    component.staffVariance = testStaffVarianceData[0];
    component.getPlannedTotal(0);
    expect(component.getPlannedTotal(0)).toBe('-');
  });
   it('should get planned total ', () => {
    component.staffVariance = testStaffVarianceData[0];
    component.getPlannedTotal(0);
    expect(component.getPlannedTotal(0)).toBe('-');
  });
   it('should get planned total ', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].censusIndex = 1;
    component.staffVariance = testStaffVarianceData[0];
    component.getPlannedTotal(0);
    expect(component.getPlannedTotal(0)).toBe(0);
  });
   it('should get planned total ', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift = null;
    component.staffVariance = testStaffVarianceData[0];
    component.getPlannedTotal(0);
    expect(component.getPlannedTotal(0)).toBeUndefined();
  });
   it('should get planned total ', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses = null;
    component.staffVariance = testStaffVarianceData[0];
    component.getPlannedTotal(0);
    expect(component.getPlannedTotal(0)).toBe('-');
  });
   it('should get planned total ', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].censusIndex = 1;
    testStaffVarianceData[0].staffVarianceSummaries[0].staffVarianceDetails[0].actualCount = null;
    component.staffVariance = testStaffVarianceData[0];
    component.getPlannedTotal(0);
    expect(component.getPlannedTotal(0)).toBe(0);
  });
   it('should get planned total ', () => {
     component.staffVariance = testStaffVarianceData[0];
     component.getPlannedTotal(-1);
     expect(component.getPlannedTotal(0)).toBe('-');
   });
   it('should get planned total ', () => {
    component.staffVariance = testStaffVarianceData[0];
    component.getPlannedTotal(0);
    expect(component.getPlannedTotal(0)).toBe('-');
  });
   it('should get planned total ', () => {
    component.staffVariance = testStaffVarianceData[0];
    component.getPlannedTotal(0);
    expect(component.getPlannedTotal(0)).toBe('-');
  });
   it('should get planned total ', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].censusIndex = 1;
    component.staffVariance = testStaffVarianceData[0];
    component.getPlannedTotal(0);
    expect(component.getPlannedTotal(0)).toBe(0);
  });
   it('should get planned total ', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift = null;
    component.staffVariance = testStaffVarianceData[0];
    component.getPlannedTotal(0);
    expect(component.getPlannedTotal(0)).toBeUndefined();
  });
   it('should get planned total ', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses = null;
    component.staffVariance = testStaffVarianceData[0];
    component.getPlannedTotal(0);
    expect(component.getPlannedTotal(0)).toBe('-');
  });
  it('should get variance total 1', () => {
    component.staffVariance = testStaffVarianceData[0];
    expect(component.getVarianceTotal(1)).toBe('-');
  });
  it('should get variance total 2', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].censusIndex = 1;
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].staffToPatientList[0].staffCount = 1;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.getVarianceTotal(0)).toBe('1.00');
  });
   it('should get variance total 3', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].censusIndex = 1;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.getVarianceTotal(0)).toBe('2.00');
  });
   it('should get variance total 4', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift = null;
    testStaffVarianceData[0].staffVarianceSummaries[0].additionalStaffHours = null;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.getVarianceTotal(0)).toBe('NaN');
  });
   it('should get variance total 5', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift = null;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.getVarianceTotal(0)).toBe('NaN');
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
  it('should get Actual Total For Variable Position', () => {
    component.staffVariance = testStaffVarianceData[0];
    expect(component.getActualTotalForVariablePosition(0)).toBe(4);
  });
  it('should get Actual Total For Variable Position', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].staffVarianceDetails[0].actualCount = null;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.getActualTotalForVariablePosition(0)).toBe(0);
  });
  it('should get Actual Total For All Variable Position', () => {
    component.planDetails.variableDepartmentPositions=testPlanDetails[0].variableDepartmentPositions;
    component.getActualTotalForAllVariablePosition();
    expect(component.getActualTotalForAllVariablePosition()).toHaveBeenCalled;
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
  it('should get Planned Total For All Variable Position', () => {
    component.planDetails.variableDepartmentPositions=testPlanDetails[0].variableDepartmentPositions;
    component.getPlannedTotalForAllVariablePosition();
    expect(component.getPlannedTotalForAllVariablePosition()).toHaveBeenCalled;
  });
  it('should get Total Variance For Variable Position', () => {
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].censusIndex = 1;
    testStaffVarianceData[0].staffVarianceSummaries[0].plannedShift.staffGridCensuses[0].staffToPatientList[0] = null;
    component.staffVariance = testStaffVarianceData[0];
    expect(component.getTotalVarianceForVariablePosition(0)).toBe(4);
  });
  it('should get Total Variance For All Variable Position', () => {
    component.planDetails.variableDepartmentPositions=testPlanDetails[0].variableDepartmentPositions;
    component.getTotalVarianceForAllVariablePosition();
    expect(component.getTotalVarianceForAllVariablePosition()).toHaveBeenCalled;
  });
  it('should getPlannedTotalForVariablePosition', function () {
    component.staffVariance.staffVarianceSummaries = testStaffVarianceData[0].staffVarianceSummaries;
    expect(component.getAdditionalStaffTotalhours()).toBe(4);
  });
  it('should getPlannedTotalForVariablePosition', function () {
    component.staffVariance.staffVarianceSummaries = testStaffVarianceData[0].staffVarianceSummaries;
    expect(component.getOGATotalhours()).toBe(1);
  });
  it('should get non variable days count', () => {
    let planDetails:PlanDetails=planDetailsData()[0];
    expect(component.getNonvarDaysCount(planDetails.nonVariableDepartmentPositions[0])).toBe(2);
  });
  it('should get oga plan hours', function () {
    testOffGridActivities[0].variableDepartmentList[0].staffCount=null;
    testOffGridActivities[0].shiftHours=null;
    component.alertBox.getOGAplanHours(testOffGridActivities[0]);
  });
  it('should find leap year', () => {
    expect(component.alertBox.findLeapYear(3)).toBe(365);
  });

  it('should open dialog for dates', function () {
    component.staffmanagerScoreCard = staffManagerPlanScoreCardComponentSpyObj;
    testStaffVarianceData[0].staffVarianceSummaries[0].shiftDetailKey=null;
    testStaffVarianceData[0].staffVarianceSummaries[0].staffVarianceDetails[0].actualCount=null;
    testStaffVarianceData[0].staffVarianceSummaries[0].comments=comments;
    testStaffVarianceData[0].comments=comments;
    component.staffVariance=testStaffVarianceData[0];
    component.autoSave();
    //component.staffmanagerScoreCard.toggleScoreTextBasedOnDate();
    //expect(component.openDialogForDates()).toHaveBeenCalled;
    expect(component.saveAndExitStaffingDetailsForDates()).toHaveBeenCalled;


  });
  it('should make summary data', function () {
    component.planDetails.staffScheduleList[0] = testPlanDetails[0].staffScheduleList[0];
    component.staffmanagerScoreCard = staffManagerPlanScoreCardComponentSpyObj;
    expect(component.makeSummaryData()).toHaveBeenCalled;
    // @ts-ignore
    expect(component.triggerUpdateSession()).toHaveBeenCalled;

    // @ts-ignore
    expect(component.performSaveAndLogout()).toHaveBeenCalled;
  });
  it('should clear', function(){
    component.staffVariance=testStaffVarianceData[0];
    component.clear(0);
    expect(component.staffVariance.staffVarianceSummaries[0].censusValue).toEqual(null);
  });
  it('should checkDates', function(){
    component.planDetails = testPlanDetails[0];
    component.checkDates(1);
    expect(component.checkDates(1)).toEqual(true);

  });
  it('should getHistoricDataforPastRecords', function(){
    let historicDataModel = {
      departmentList : [{
        departmentKey : 1,
        historicalDataPast : [{
          staffVarianceSummaries : [{
            shiftDetailKey : 1,
            censusValue : 1,
            shiftTime : 1,
            shiftFormat : ''
          }],
          date : '10/12/2020'
        }]
      }]
    };
    component.staffVariance=testStaffVarianceData[0];
    component.featureToggleFlag = true;
    spyObjPredictedDataService.getPredictedDataFromVolumeForecasting.and.returnValue(of(predictedResponse()[0]));
    component.getHistoricDataforPastRecords();
    expect(component.getHistoricDataforPastRecords).toHaveBeenCalled;
  });

  xit('should saveAndExitStaffingDetailsForDates', function(){
    component.staffVariance=testStaffVarianceData[0];
    component.staffmanagerScoreCard = staffManagerPlanScoreCardComponentSpyObj;
    component.futureFlag = false;
    component.commentsError = true;
    component.saveAndExitStaffingDetailsForDates();
    component.isUserExiting = true;
    component.staffVariance.staffVarianceSummaries[0].shiftDetailKey = 0;
    component.saveAndExitStaffingDetailsForDates();
  });
  xit('should openDialogForDates', function(){
    component.staffmanagerScoreCard = staffManagerPlanScoreCardComponentSpyObj;
    component.openDialogForDates();
    expect(component.openDialogForDates).toHaveBeenCalled;
    component.staffVariance=testStaffVarianceData[0];
    component.clear(0);
    component.checkIfPlanEdited();
    component.staffVariance.targetHours = null;
    component.staffVariance.priorCumulativeHours = null;
    component.checkIfPlanEdited();

    component.strVarianceDetailsdata = JSON.stringify(testStaffVarianceData);
    component.openDialogForDates();
  });
  it('Should updateSession', function(){
    (component as any).updateSession();
    expect((component as any).updateSession).toHaveBeenCalled;
  });
  it('should checkForSessionAttributes', function(){
    sessionStorage.setItem('lock', 'true');
    component.staffVariance.planAlreadyInUse = true;
    (component as any).checkForSessionAttributes();
    expect((component as any).checkForSessionAttributes).toHaveBeenCalled;
  });
  it('should performSaveAndLogout', function(){
    component.staffmanagerScoreCard = staffManagerPlanScoreCardComponentSpyObj;
    component.staffmanagerScoreCard.oASuggestedData=testOASuggestionData2.data[0];
    component.staffVariance=testStaffVarianceData[0];
    (component as any).performSaveAndLogout();
    expect((component as any).performSaveAndLogout).toHaveBeenCalled;
  });
  it('should redirect', function(){
    (component as any).redirect();
    expect((component as any).redirect).toHaveBeenCalled;
  });
  it('should saveStaffingDetails', function(){
    component.staffmanagerScoreCard = staffManagerPlanScoreCardComponentSpyObj;
    component.saveStaffingDetails();
    expect(component.saveStaffingDetails).toHaveBeenCalled;
  });
  it('should getExcludeEducationOrientationFlag', function(){
    component.planDetails.effectiveStartDate = new Date();
    (component as any).getExcludeEducationOrientationFlag();
    expect((component as any).getExcludeEducationOrientationFlag).toHaveBeenCalled;
  });
  it('should check hostlistener', function(){
    document.dispatchEvent(new MouseEvent('click'));
    (component as any).routerTracker.nextUrl = '';
    component.canDeactivate();
  });
  it('should checkTime', function(){
    (component as any).checkTime();
    expect((component as any).checkTime).toHaveBeenCalled;
  });
  it('should set shift time range for AM', function() {
    component.staffVariance = testStaffVarianceData[0];
    component.setShiftTimeRange();
  });
  it('should set shift time range for PM', function() {
    testStaffVarianceData[0].staffVarianceSummaries[0].shiftFormat = 'PM';
    component.staffVariance = testStaffVarianceData[0];
    component.setShiftTimeRange();
  });

});
