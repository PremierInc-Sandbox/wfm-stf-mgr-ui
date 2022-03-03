import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {OffGridActivitiesComponent} from './off-grid-activities.component';
import {HttpClient} from '@angular/common/http';
import {PlanService} from '../../../shared/service/plan-service';
import {of} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {planSetupData} from '../../../shared/service/fixtures/plansetup-data';
import {OGASummaryData} from '../../../shared/service/fixtures/OGA-summary-data';
import {offGridActivitiesData} from '../../../shared/service/fixtures/off-grid-activities-data';
import {planDetailsData} from '../../../shared/service/fixtures/plan-details-data';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;
import createSpy = jasmine.createSpy;
import {ScheduleService} from '../../../shared/service/schedule-service';
import {staffScheduleData} from '../../../shared/service/fixtures/staff-schedule-data';
import {ActivityGridComponent} from '../components/activity-grid/activity-grid.component';
import {ConfirmWindowOptions} from '../../../shared/domain/plan-details';
import {OAService} from '../../../shared/service/oa-service';
import {oaPlanDataSample} from '../../../shared/service/fixtures/oa-Plan-Data-Sample';
import {oaSuggestedDataSample2} from '../../../shared/service/fixtures/oa-suggested-data-sample2';
import {RouterHistoryTrackerService} from "../../../shared/service/router-history-tracker.service";
import {jobCategoryData} from "../../../shared/service/fixtures/job-category-data";

describe('OffGridActivitiesComponent', () => {
  let component: OffGridActivitiesComponent;
  let fixture: ComponentFixture<OffGridActivitiesComponent>;
  let mockOffGrid;
  let mockHttpClient;
  let flag = true;
  const oaPlanData = oaPlanDataSample();
  const oaSuggestedData = oaSuggestedDataSample2();
  const staffScheduleDataTest = staffScheduleData();
  const mockRouter: SpyObj<Router> = jasmine.createSpyObj(['navigate']);
  const planServiceSpyObject: SpyObj<PlanService> = createSpyObj(['getPlandetails', 'createPlan', 'removePlanKeyFromSessionAttribute', 'getJobCategoryData']);
  const scheduleServiceSpy: SpyObj<ScheduleService> = createSpyObj('ScheduleService', ['createSchedule', 'getScheduleDetails']);
  const oaServiceSpyObj: SpyObj<OAService> = createSpyObj(['getOASuggestedData']);
  const routerTracker: SpyObj<RouterHistoryTrackerService> = createSpyObj('RouterHistoryTrackerService', ['nextUrl']);
  let mockActivatedRoute = jasmine.createSpyObj(['queryParamMap']);
  const planSetupDataTest = planSetupData();
  const offGridActivityDataTest = offGridActivitiesData();
  let OGASummaryDataTest = OGASummaryData();
  let planDetailsDataTest = planDetailsData();
  const jobCategoryDataTest = jobCategoryData();
  let map;
  const mockMatDialog = jasmine.createSpyObj({
    afterClosed: createSpy('name', () => {
      return of();

    }).and.callThrough(), close: null, open: createSpy('open', function() {
      return this;

    })
  });
  mockMatDialog.componentInstance = {body: ''};
  planServiceSpyObject.getPlandetails.and.returnValue(of(planDetailsDataTest[0]));
  planServiceSpyObject.createPlan.and.returnValue(of(planDetailsDataTest[0]));
  planServiceSpyObject.removePlanKeyFromSessionAttribute.and.returnValue(of());
  planServiceSpyObject.getJobCategoryData.and.returnValue(of(jobCategoryDataTest));
  scheduleServiceSpy.createSchedule.and.returnValue(of(staffScheduleDataTest));
  scheduleServiceSpy.getScheduleDetails.and.returnValue(of(staffScheduleDataTest));
  oaServiceSpyObj.getOASuggestedData.and.returnValue(of(oaSuggestedData.data[0]));
  beforeEach(waitForAsync(() => {
    mockMatDialog.open.and.callFake(() => {
      return {
        afterClosed() {
          return of(flag, ConfirmWindowOptions.save);
        }
      };
    });
    map = (new Map<string, string>());
    map.set('plankey', '1');
    mockActivatedRoute = {
          queryParamMap: of(map)
      };

    TestBed.configureTestingModule({
      declarations: [OffGridActivitiesComponent, ActivityGridComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{provide: OffGridActivitiesComponent, useValue: mockOffGrid}, {
        provide: HttpClient,
        useValue: mockHttpClient
      },
        {provide: PlanService, useValue: planServiceSpyObject}, {provide: Router, useValue: mockRouter}, {provide: ActivatedRoute, useValue: mockActivatedRoute},
        {provide: MatDialog, useValue: mockMatDialog}, {provide: ScheduleService, useValue: scheduleServiceSpy},
        {provide: OAService, useValue: oaServiceSpyObj},
        {provide: RouterHistoryTrackerService,useValue: routerTracker}],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OffGridActivitiesComponent);
    component = fixture.componentInstance;
    component.activityGridComponent = TestBed.createComponent(ActivityGridComponent).componentInstance;
    spyOn(component.alertBox, 'openAlert');
    spyOn(component.alertBox, 'openAlertForOGA');
    fixture.detectChanges();
    planDetailsDataTest = planDetailsData();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should load summary', () => {
    spyOn(component, 'getSummary');
    component.loadsummary();
    expect(component.getSummary).toHaveBeenCalled();
  });
  it('should load plan details ', () => {
    spyOn(component, 'loaOffgridDefault');
    const planKey = '1';
    localStorage.setItem('plankey', planKey);
    component.loadplandetails();
    expect(planServiceSpyObject.getPlandetails).toHaveBeenCalledWith(planKey);
    expect(component.entitydisplayval).toBe(undefined);
    expect(component.departmentdisplayval).toBe(undefined);
    expect(component.primaryWHpUdisplayval).toBe(undefined);
    expect(component.annualBudgetdisplayval).toBe(undefined);
  });
  beforeEach(() => {
    OGASummaryDataTest = OGASummaryData();
    // component.plansetupmodal[0] = planSetupDataTest[0];
    // component.plansetupmodal.offgridactivities[0] = planDetailsDataTest[0].offGridActivities[0];
  });

  it('should get summary when list oga summary is not null and exist summary is not null for all oga type keys', () => {
    component.listOGAsummary = OGASummaryDataTest;
    for (let x = 0; x < 5; x++) {
      component.planDetails.offGridActivities[x] = planDetailsDataTest[0].offGridActivities[x];
    }
    component.listOGAsummary[0].variable_department_abrv = null;
    component.getSummary();
    expect(component.objOGASummary.TotalnHrs).toBe(10);
    expect(component.listOGAsummary.indexOf(component.objOGASummary)).not.toBe(-1);
  });

  it('should get summary when list oga summary is not null but exist summary is null for all oga type keys', () => {
    component.listOGAsummary = OGASummaryDataTest;
    for (let x = 0; x < 5; x++) {
      component.planDetails.offGridActivities[x] = planDetailsDataTest[0].offGridActivities[x + 4];
    }
    component.listOGAsummary[0].variable_department_abrv = null;
    component.getSummary();
    expect(component.objOGASummary.OrientationHrs).toBe(0);
    expect(component.objOGASummary.TotalnHrs).toBe(2);
    expect(component.listOGAsummary.indexOf(component.objOGASummary)).not.toBe(-1);
    expect(component.objOGASummary.InHouseEduHrs).toBe(0);
    expect(component.objOGASummary.TotalnHrs).toBe(2);
  });
  it('should get summary when list oga is null if oga type key is certification', () => {
    component.prevSelectedIndex = 0;
    spyOn(component, 'validateActivities').and.returnValue(true);
    component.getSummary();
    expect(component.tabGroup.selectedIndex).toBe(component.prevSelectedIndex);
    expect(component.alertBox.openAlertForOGA).toHaveBeenCalledWith('exit-dialog', '175px',  '350px', 'Off Grid Activities', 'Enter an Activity Name.');
  });
  it('should get summary when list oga is null if oga type key is orientations', () => {
    component.planDetails.offGridActivities[0] = planDetailsDataTest[0].offGridActivities[2];
    component.getSummary();
    expect(component.objOGASummary.OrientationHrs).toBe(2);
  });
  it('should get summary when list oga is null', () => {
    component.planDetails.offGridActivities[0] = planDetailsDataTest[0].offGridActivities[3];
    component.getSummary();
    expect(component.objOGASummary.OtherHrs).toBe(2);
  });
  it('should not save and navigate to staff-schedule because plan is not completed', () => {
    component.previousIndex = 1;
    component.pageGroup.selectedIndex = 2;
    component.saveAndNextPlanDetails();
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
  it('should save plan details by calling create plan and navigate to staff-schedule', () => {
    planDetailsDataTest[0].planCompleted = false;
    component.planDetails = planDetailsDataTest[0];
    component.previousIndex = 1;
    component.pageGroup.selectedIndex = 2;
    component.saveAndNextPlanDetails();
    expect(mockRouter.navigate).toHaveBeenCalled();
    expect(planServiceSpyObject.createPlan).toHaveBeenCalledWith(component.planDetails);
  });
  it('should save plan details by calling create plan and navigate to staff-schedule2', () => {
    planDetailsDataTest[0].planCompleted = false;
    component.planDetails = planDetailsDataTest[0];
    spyOn(component, 'validateActivities').and.returnValue(true);
    component.previousIndex = 1;
    component.pageGroup.selectedIndex = 2;
    component.saveAndNextPlanDetails();
    expect(mockRouter.navigate).toHaveBeenCalled();
    expect(planServiceSpyObject.createPlan).toHaveBeenCalledWith(component.planDetails);
    expect(component.alertBox.openAlertForOGA).toHaveBeenCalledWith('exit-dialog', '175px', '350px', 'Off Grid Activities', 'Enter an Activity Name.');
  });
  it('should not load off grid default', () => {
    component.planDetails.offGridActivities = null;
    component.loaOffgridDefault();
  });
  it('should load off grid default', () => {
    component.loaOffgridDefault();
  });
  it('should save and navigate to selected index', () => {
    planDetailsDataTest[0].planCompleted = true;
    component.planDetails = planDetailsDataTest[0];
    component.saveAndExitPlanDetails();
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
  it('should save and exit plan details', () => {
    planDetailsDataTest[0].planCompleted = false;
    spyOn(component, 'validateActivities').and.stub();
    planDetailsDataTest[0].totalAnnualHours = null;
    component.planDetails = planDetailsDataTest[0];
    component.saveAndExitPlanDetails();
    !expect(mockRouter.navigate).toHaveBeenCalled();
  });
  it('should save and exit plan details2', () => {
    spyOn(component, 'validateActivities').and.returnValue(true);
    component.planDetails.planCompleted = false;
    component.saveAndExitPlanDetails();
    expect(component.alertBox.openAlertForOGA).toHaveBeenCalledWith('exit-dialog', '175px', '350px', 'Off Grid Activities', 'Enter an Activity Name.');
  });
  it('should save and exit plan details3', () => {
    spyOn(component, 'returnToHomePage');
    spyOn(component, 'validateActivities').and.returnValue(false);
    component.planDetails.planCompleted = false;
    component.saveAndExitPlanDetails();
    expect(component.returnToHomePage).toHaveBeenCalled();
  });
  it('should save and exit plan details4', () => {
    spyOn(component, 'returnToHomePage');
    flag = false;
    spyOn(component, 'validateActivities').and.returnValue(false);
    component.planDetails.planCompleted = false;
    component.saveAndExitPlanDetails();
    expect(component.returnToHomePage).toHaveBeenCalled();
  });

  it('should save and exit plan details5', () => {
    spyOn(component, 'validateActivities').and.returnValue(false);
    component.planDetails.totalAnnualHours = -1;
    component.planDetails.planCompleted = false;
    component.saveAndExitPlanDetails();
  });
  it('should navigate to plan-setup page after click back button if plan is completed ', () => {
    planDetailsDataTest[0].planCompleted = true;
    component.planDetails = planDetailsDataTest[0];
    component.clickonbackbutton();
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
  it('should validate activities and return true', () => {
    component.prevSelectedIndex = 0;
    component.planDetails = planDetailsDataTest[0];
    offGridActivityDataTest[0].typeKey = 1;
    offGridActivityDataTest[0].name = null;
    component.planDetails.offGridActivities[0] = offGridActivityDataTest[0];
    expect(component.validateActivities()).toBeTruthy();
  });
  it('should validate activities and return true', () => {
    component.prevSelectedIndex = 0;
    planDetailsDataTest[0].offGridActivities[0].variableDepartmentList[0].staffCount = 2;
    planDetailsDataTest[0].offGridActivities[0].shiftHours = 0;
    component.planDetails = planDetailsDataTest[0];
    offGridActivityDataTest[0].typeKey = 1;
    offGridActivityDataTest[0].name = null;
    component.planDetails.offGridActivities[0] = offGridActivityDataTest[0];
    expect(component.validateActivities()).toBeTruthy();
  });
  it('should validate activities and return flase', () => {
    component.prevSelectedIndex = 0;
    planDetailsDataTest[0].offGridActivities[0].variableDepartmentList[0].staffCount = 2;
    planDetailsDataTest[0].offGridActivities[0].shiftHours = 0;
    planDetailsDataTest[0].offGridActivities[0].variableDepartmentList[0].staffCount = 0;
    component.planDetails = planDetailsDataTest[0];
    offGridActivityDataTest[0].typeKey = 1;
    offGridActivityDataTest[0].name = null;
    component.planDetails.offGridActivities[0] = offGridActivityDataTest[0];
    expect(component.validateActivities()).toBeTruthy();
  });
  it('should click back button', function() {
    flag = true;
    planDetailsDataTest[0].planCompleted = false;
    component.planDetails = planDetailsDataTest[0];
    component.clickonbackbutton();
    !expect(mockRouter.navigate).toHaveBeenCalled();
  });
  it('should click back button2', function() {
    flag = false;
    planDetailsDataTest[0].planCompleted = false;
    component.planDetails = planDetailsDataTest[0];
    component.clickonbackbutton();
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
  it('should find leap year', function() {
    const date = new Date('01/01/2020');
    component.planDetails.effectiveEndDate = date;
    expect(component.getDaysInplanYear()).toBe(366);
  });
  it('should click back button and check if plan edited ', function() {
    spyOn(component, 'clickOnTabOrCancelButton');
    planDetailsDataTest[0].planCompleted = false;
    component.planDetails = planDetailsDataTest[0];
    component.isPlanEdited = true;
    component.clickonbackbutton();
    expect(component.clickOnTabOrCancelButton).not.toHaveBeenCalled();
  });
  it('should click back button and check if plan edited2 ', function() {
    spyOn(component, 'validateActivities').and.returnValue(true);
    spyOn(component, 'clickOnTabOrCancelButton');
    planDetailsDataTest[0].planCompleted = false;
    component.planDetails = planDetailsDataTest[0];
    component.isPlanEdited = true;
    component.clickonbackbutton();
    expect(component.pageGroup.selectedIndex).toBe(component.previousIndex);
  });
  it('should click back button and check if plan edited3 ', function() {
    spyOn(component, 'clickOnTabOrCancelButton');
    planDetailsDataTest[0].planCompleted = false;
    component.planDetails = planDetailsDataTest[0];
    component.isPlanEdited = true;
    flag = false;
    component.clickonbackbutton();
    expect(component.clickOnTabOrCancelButton).not.toHaveBeenCalled();
  });

  it('should update data from oa', function() {
    planDetailsDataTest[0].effectiveStartDate = new Date('1');
    spyOn(component.alertBox, 'loadOAPlanDataEntity').and.stub();
    spyOn(component, 'getSuggestedData').and.stub();
    component.planDetails = planDetailsDataTest[0];
    component.updateDataFromOA();
    expect(component.getSuggestedData).toHaveBeenCalled();
  });
  it('should get suggested data', function() {
    planDetailsDataTest[0].oAStaffingMetric=oaSuggestedData.data[0];
    component.planDetails=planDetailsDataTest[0];
    oaServiceSpyObj.getOASuggestedData.and.returnValue(of(oaSuggestedData[0]));
    component.getSuggestedData();
    expect(component.entitydisplayval).not.toBe(null);
    expect(component.departmentdisplayval ).not.toBe(null);
    expect(component.primaryWHpUdisplayval ).not.toBe(null);
  });
  it('should load other pages and navigate to plan setup page', function() {
    component.planDetails = planDetailsDataTest[0];
    component.planDetails.key = null;
    component.loadOtherPages();
    expect(component.pageGroup.selectedIndex).toBe( component.previousIndex);
  });
  it('should load other pages and navigate to plan setup page', function() {
    component.planDetails = planDetailsDataTest[0];
    component.pageGroup.selectedIndex = 0;
    component.loadOtherPages();
    expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/plan-setup']);
  });
  it('should load other pages and navigate to plan list page', function() {
    component.pageGroup.selectedIndex = 1;
    component.loadOtherPages();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/plan-list']);
  });
  it('should load other pages and navigate to staff schedule page', function() {
    component.pageGroup.selectedIndex = 2;
    component.loadOtherPages();
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
  it('should load other pages and navigate to staffing grid page', function() {
    component.pageGroup.selectedIndex = 3;
    component.planDetails = planDetailsDataTest[0];
    component.planDetails.staffScheduleList = [];
    component.loadOtherPages();
    expect(mockRouter.navigate).toHaveBeenCalled();
    expect(component.pageGroup.selectedIndex).toBe( component.previousIndex);
  });
  it('should load other pages and navigate to staffing grid page1', function() {
    component.pageGroup.selectedIndex = 3;
    component.planDetails = planDetailsDataTest[0];
    component.loadOtherPages();
    expect(mockRouter.navigate).toHaveBeenCalled();
    expect(component.pageGroup.selectedIndex).not.toBe( component.previousIndex);
  });
  it('should load other pages and navigate to staffing grid page2', function() {
    component.pageGroup.selectedIndex = 3;
    component.planDetails.staffScheduleList = null;
    component.loadOtherPages();
    expect(mockRouter.navigate).toHaveBeenCalled();
    expect(component.pageGroup.selectedIndex).toBe( component.previousIndex);
  });
  it('should check tab change', function() {
    spyOn(component,'saveAndNextPlanDetails');
    spyOn(component,'clickonbackbutton');
    component.checkTabChange();
    expect(component.pageGroup.selectedIndex).toBeUndefined();
  });
  it('should check tab change2', function() {
    component.previousIndex = 1;
    component.pageGroup.selectedIndex = 1;
    component.checkTabChange();
    expect(component.pageGroup.selectedIndex).toBe(1);
  });
  it('should click on tab or cancel button', function() {
    component.previousIndex = 1;
    component.pageGroup.selectedIndex = 1;
    component.clickOnTabOrCancelButton();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });
  it('should save plan details', function() {
    component.savePlanDetails();
    expect(planServiceSpyObject.createPlan).toHaveBeenCalled();
  });

});


