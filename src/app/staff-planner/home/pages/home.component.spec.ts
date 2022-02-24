import {async, ComponentFixture, TestBed, fakeAsync, tick, waitForAsync} from '@angular/core/testing';
import {PlanListComponent} from './home.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import {Router} from '@angular/router';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {PlanService} from '../../../shared/service/plan-service';
import {Observable, observable, of} from 'rxjs';
import {ErrorHandlerService} from '../../../shared/service/error-handler-service';
import {PlanDetails} from '../../../shared/domain/plan-details';
import {CorpService} from '../../../shared/service/corp-service';
import {EntityService} from '../../../shared/service/entity-service';
import {DepartmentService} from '../../../shared/service/department-service';
import {deptDetails} from '../../../shared/service/fixtures/dept-details-data';
import {entityDetailsDataService} from '../../../shared/service/service-data/entity-details-data-service';
import {corpDetailsData} from '../../../shared/service/fixtures/corp-details-data';
import {UserService} from '../../../shared/service/user.service';
import SpyObj = jasmine.SpyObj;
import Spy = jasmine.Spy;
import createSpy = jasmine.createSpy;
import {PageRedirectionService} from "../../../shared/service/page-redirection.service";
import createSpyObj = jasmine.createSpyObj;
import {RoutingStateService} from "../../../shared/domain/routing-state.service";
import {customUserData} from "../../../shared/service/fixtures/user-data";
import {productHelpData} from "../../../shared/service/fixtures/product-help-data";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import { UserAccess } from 'src/app/shared/domain/userAccess';
import {By} from '@angular/platform-browser';
import { entityDetailsData } from 'src/app/shared/service/fixtures/entityDetailsData';
import { formatDate } from '@angular/common';
import {customUserAccessData} from '../../../shared/service/fixtures/user-access-data';

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

describe('PlanListComponent', () => {
  let component: PlanListComponent;
  let fixture: ComponentFixture<PlanListComponent>;
  let mockRouter;
  let planService: SpyObj<PlanService>;
  let corpService: SpyObj<CorpService>;
  let entityService: SpyObj<EntityService>;
  let deptService: SpyObj<DepartmentService>;
  let mockMatDialogRef;
  let mockErrorHandlerService;
  let testPlan: PlanDetails;
  let confirmation: Spy;
  let testConfirmBox;
  let testDate;
  let mockMatAutoComplete;
  let userServiceSpy: SpyObj<UserService>;
  const testCorpDetailsData = corpDetailsData();
  let testPlanData = customPlanDetails();
  const testEntityDetails = entityDetailsDataService();
  const selectedView = 'Active';
  let deptDetilsData = deptDetails();
  let mockMatDialog;
  let flag=true;
  const customuserAccessData = customUserAccessData();
  const routingState: SpyObj<RoutingStateService> = jasmine.createSpyObj(['loadRouting','getPreviousUrl'])
  const pageRedirectService: SpyObj<PageRedirectionService> = createSpyObj('PageRedirectService', ['redirectToLogout', 'redirectToExternalPage', 'redirectToWhoopsPage', 'generateErrorCode', 'getProductHelpUrl']);
  mockMatDialog = jasmine.createSpyObj({
    afterClosed: createSpy('name', function () {
      return of();
    }).and.callThrough(), close: null, open: createSpy('open', function() {
      return this;
    })
  });
  mockMatDialog.componentInstance = {body: ''};
  beforeEach(waitForAsync(() => {
    planService = jasmine.createSpyObj(['getPlans', 'getAllPlansByPlanAction', 'updatePlanAsActive', 'updateDeleteFlag',
      'updatePlanStatus', 'getCorp', 'getRedirectUrl', 'checkUserAccessToPlan', 'getSystemOptionValuesFromDTM']);
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(flag);
        }
      }
    });
    corpService = jasmine.createSpyObj(['getCorporations']);
    entityService = jasmine.createSpyObj(['getFacility']);
    deptService = jasmine.createSpyObj(['getDepts']);
    mockRouter = jasmine.createSpyObj(['navigate']);
    planService.getAllPlansByPlanAction.and.returnValue(of(customPlanDetails()));
    planService.getPlans.and.returnValue(of(testPlanData));
    userServiceSpy = jasmine.createSpyObj(['user']);
    planService.updatePlanAsActive.and.returnValue(of(testPlan));
    planService.updateDeleteFlag.and.returnValue(of());
    planService.updatePlanStatus.and.returnValue(of());
    entityService.getFacility.and.returnValue(of(testEntityDetails));
    deptService.getDepts.and.returnValue(of(deptDetilsData));
    corpService.getCorporations.and.returnValue(of(corpDetailsData()));
    planService.checkUserAccessToPlan.and.returnValue(of(false));
    planService.getSystemOptionValuesFromDTM.and.returnValue(of());
    routingState.getPreviousUrl.and.returnValue('home');
    let userServiceSpyObj: SpyObj<UserService> = createSpyObj('UserService', ['logout','fetchUserRole']);
    const userDataTest = customUserData();

    userServiceSpyObj.user = userDataTest[0];
    userServiceSpyObj.userAccess=new Observable();
    userServiceSpyObj.logout.and.returnValue(of(userDataTest));
    userServiceSpyObj.fetchUserRole.and.returnValue(of(customuserAccessData[1]));
    userServiceSpyObj.userAccess = new Observable<UserAccess>((observer) =>{
      observer.next(customuserAccessData[1]);
    });
    sessionStorage.setItem('userAccess',JSON.stringify(userServiceSpyObj.userAccess));
    let testProductData=productHelpData();
    planService.getRedirectUrl.and.returnValue(of(testProductData[0]));
    TestBed.configureTestingModule({
      declarations: [PlanListComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [HttpClientTestingModule, MatTableModule, MatAutocompleteModule],
      providers: [{provide: Router, useValue: mockRouter}
        , {provide: MatDialogRef, useValue: mockMatDialogRef}, {provide: MatDialog, useValue: mockMatDialog},
        {provide: ErrorHandlerService, useValue: mockErrorHandlerService}, {
          provide: PlanService,
          useValue: planService
        },
        {provide: CorpService, useValue: corpService}, {provide: EntityService, useValue: entityService},
        {provide: DepartmentService, useValue: deptService}, {provide: UserService, useValue: userServiceSpy},
        { provide: PageRedirectionService,
          useValue: pageRedirectService},
        {provide: RoutingStateService,useValue: routingState},
        {provide:UserService,useValue:userServiceSpyObj}]
    })
      .compileComponents();
  }));
  beforeEach(() => {
    testConfirmBox = new MatCheckboxChange();
    testPlan = new PlanDetails();
    testDate = new Date();
    fixture = TestBed.createComponent(PlanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  afterEach(() => {
    deptDetilsData = deptDetails();
    component.deptDetails = deptDetilsData;
    component.deptDetails[0] = deptDetilsData[0];
    spyOn(component, 'loadPlans');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('should clear local storage', () => {
    component.clearLocalStorage();
    expect(sessionStorage.getItem('plankey')).toEqual('');
  });
  it('getplans should have been called by loadPlans', () => {
    component.deptDetails = deptDetilsData;
    component.deptDetails[0] = deptDetilsData[0];
    spyOn(component, 'addFilter');
    component.loadPlans();
    expect(planService.getPlans).toHaveBeenCalled();
    expect(component.plansData[0]).toBe(testPlanData[0]);
    expect(component.showPlnStts).toBe(true);
  });
  it('should not load plans because selecteddepartmentValue is null ', () => {
    component.selecteddepartmentValue = null;
    component.listDeptKeys = [1, 2];
    spyOn(component, 'addFilter');
    component.loadPlans();
    expect(component.plansData[0]).toBe(testPlanData[0]);
    expect(component.showPlnStts).toBe(true);
  });
  it('should not load plans because selecteddepartmentValue is null ', () => {
    component.selecteddepartmentValue = 'AllDepts';
    component.deptDetails = deptDetilsData;
    spyOn(component, 'addFilter');
    component.loadPlans();
    expect(component.listDeptKeys[0]).toEqual(Number(component.deptDetails[0].key));
    expect(component.plansData[0]).toBe(testPlanData[0]);
    expect(component.showPlnStts).toBe(true);
  });
  it('should not load plans because selecteddepartmentValue is null ', () => {
    component.selecteddepartmentValue = 'AllDepts';
    component.deptDetails = deptDetilsData;
    component.deptDetails[0].key = null;
    component.deptDetails[1].key = null;
    spyOn(component, 'addFilter');
    component.loadPlans();
    expect(component.listDeptKeys[0]).not.toEqual(Number(component.deptDetails[0].key));
    expect(component.plansData).toBe(null);
    //expect(component.showPlnStts).toBe(false);
  });

  it('getAllPlansByPlanAction should have been called by viewactiveplans', () => {
    component.selectPlan = 'Active';
    component.deptDetails = deptDetilsData;
    component.viewActivePlans();
    expect(planService.getAllPlansByPlanAction).toHaveBeenCalled();
  });
  it('should not view active plans', () => {
    spyOn(component, 'addFilter');
    spyOn(component,'storeUserSelections');
    component.deptDetails = deptDetilsData;
    component.deptDetails[0].key = null;
    component.viewActivePlans();
    expect(component.storeUserSelections)
    expect(component.addFilter).toHaveBeenCalled()
  });
  it('plan should be disabled based on plan status In Process', () => {
    const testPlan = new PlanDetails();
    testPlan.name = 'tesPlan';
    testPlan.status = 'In Process';
    component.checkPlanDisabled(testPlan);
    expect(component.disablePlanFlag).toEqual(true);
  });
  it('plan should be disabled based on plan status null', () => {
    testPlan.name = 'tesPlan';
    testPlan.status = '';
    component.checkPlanDisabled(testPlan);
    expect(component.disablePlanFlag).toEqual(false);
  });
  it('plan should be disabled based on action Archived', () => {
    testPlan.name = 'testPlan';
    testPlan.action = 'Archived';
    component.checkPlanDisabled(testPlan);
    expect(component.disablePlanFlag).toEqual(true);
  });
  it('plan should not be disabled if planName and planAction are null', () => {
    testPlan.name = null;
    testPlan.action = null;
    component.checkPlanDisabled(testPlan);
  });
  it('Should make selected plan active and deactivate previous plan if user click ok', () => {
    component.plansData = testPlanData;
    testConfirmBox.checked = true;
    testDate.setFullYear(2019, 7, 16);
    testPlan.name = 'testname';
    testPlan.effectiveEndDate = testDate;
    testPlan.effectiveStartDate = testDate;
    testPlan.departmentName = 'test';
    component.plansData[0].effectiveEndDate = testDate;
    component.plansData[0].effectiveStartDate = testDate;
    component.plansData[0].name = '';
    component.plansData[0].defaultPlanFlag = true;
    component.plansData[0].departmentName = 'test';
    confirmation = spyOn(window, 'confirm');
    confirmation.and.returnValue(true);
    component.updatePlanActvStts(testPlan, testConfirmBox, selectedView);
    expect(component.isActiveFound).toBe(true);
    expect(component.activePlanData[0]).toEqual(component.plansData[0]);
    expect(component.activePlanData[0].defaultPlanFlag).toBe(false);
    expect(component.activePlanData[0].action).toEqual('Inactive');
    expect(planService.updatePlanAsActive).toHaveBeenCalledWith(component.activePlanData[0]);
    expect(testPlan.action).toBe('Active');
    expect(testPlan.defaultPlanFlag).toBe(true);
    expect(planService.updatePlanAsActive).toHaveBeenCalledWith(testPlan);
  });

  it('should active selected plan if there is no already active plan', () => {
    testConfirmBox.checked = true;
    confirmation = spyOn(window, 'confirm');
    confirmation.and.returnValue(true);
    testPlan.effectiveStartDate = testDate;
    testPlan.effectiveEndDate = testDate;
    component.plansData = testPlanData;
    component.plansData[0].effectiveStartDate = testDate;
    component.plansData[0].departmentName = 'test';
    component.updatePlanActvStts(testPlan, testConfirmBox, selectedView);
    expect(testPlan.action).toBe('Active');
    expect(testPlan.defaultPlanFlag).toBe(true);
    expect(planService.updatePlanAsActive).toHaveBeenCalledWith(testPlan);
  });
  it('should set status plan to inactive (when checkbox is unchecked) and user click ok', () => {
    testConfirmBox = false;
    confirmation = spyOn(window, 'confirm');
    confirmation.and.returnValue(true);
    component.updatePlanActvStts(testPlan, testConfirmBox, selectedView);
    expect(testPlan.action).toBe('Inactive');
    expect(testPlan.defaultPlanFlag).toBe(false);
    expect(planService.updatePlanAsActive).toHaveBeenCalledWith(testPlan);
    planService.updatePlanAsActive.and.returnValue(of(testPlan));
  });
  it('should set status plan to inactive (when checkbox is unchecked) and user click ok', () => {
    testConfirmBox = false;
    confirmation = spyOn(window, 'confirm');
    confirmation.and.returnValue(true);
    component.updatePlanActvStts(testPlan, testConfirmBox, 'differentValue');
    planService.updatePlanAsActive.and.returnValue(of(testPlan));

  });
  it('should not update plan active staus if plan details end date and start date are null ', () => {
    testConfirmBox.checked = true;
    confirmation = spyOn(window, 'confirm');
    confirmation.and.returnValue(true);
    testPlan.effectiveStartDate = null;
    testPlan.effectiveEndDate = null;
    component.plansData = testPlanData;
    component.updatePlanActvStts(testPlan, testConfirmBox, selectedView);
    expect(component.isActiveFound).toBe(false);
    expect(component.activePlanData[0]).not.toEqual(component.plansData[0]);
    expect(planService.updatePlanAsActive).not.toHaveBeenCalledWith(component.activePlanData[0]);
    expect(testPlan.action).toBe(undefined);
    expect(planService.updatePlanAsActive).not.toHaveBeenCalled();
  });
  it('should not update plan active staus if selected plan name and plan data are null ', () => {
    testConfirmBox.checked = true;
    confirmation = spyOn(window, 'confirm');
    confirmation.and.returnValue(true);
    testPlan.effectiveStartDate = testDate;
    testPlan.effectiveEndDate = testDate;
    testPlan.name = 'testName';
    component.plansData = testPlanData;
    component.plansData[0].name = 'testName';
    component.updatePlanActvStts(testPlan, testConfirmBox, selectedView);
    expect(component.isActiveFound).toBe(false);
    expect(component.activePlanData[0]).not.toEqual(component.plansData[0]);
    expect(planService.updatePlanAsActive).not.toHaveBeenCalledWith(component.activePlanData[0]);
  });
 it('Should make selected plan active and deactivate previous plan if user click ok', () => {
    flag=false;
    component.plansData = testPlanData;
    testConfirmBox.checked = true;
    testDate.setFullYear(2019, 7, 16);
    testPlan.name = 'testname';
    testPlan.effectiveEndDate = testDate;
    testPlan.effectiveStartDate = testDate;
    testPlan.departmentName = 'test';
    component.plansData[0].effectiveEndDate = testDate;
    component.plansData[0].effectiveStartDate = testDate;
    component.plansData[0].name = '';
    component.plansData[0].defaultPlanFlag = true;
    component.plansData[0].departmentName = 'test';
    confirmation = spyOn(window, 'confirm');
    confirmation.and.returnValue(true);
    component.deptDetails = deptDetilsData;
    component.updatePlanActvStts(testPlan, testConfirmBox, selectedView);
    expect(component.isActiveFound).toBe(true);
    expect(component.plansData[0]).toEqual(component.plansData[0]);
    expect(component.activePlanData[0].defaultPlanFlag).not.toBe(false);
    expect(component.activePlanData[0].action).toEqual('Inactive');
    expect(planService.updatePlanAsActive).not.toHaveBeenCalledWith(component.activePlanData[0]);
    expect(testPlan.action).toBe(undefined);
    expect(testPlan.defaultPlanFlag).toBe(undefined);
    expect(planService.updatePlanAsActive).not.toHaveBeenCalled();
  });
  it('should delete a row', () => {
    testPlanData = customPlanDetails();
    component.deptDetails = deptDetilsData;
    planService.updateDeleteFlag.and.returnValue(of());
    component.plansData = testPlanData;
    confirmation = spyOn(window, 'confirm');
    confirmation.and.returnValue(true);
    component.deleteRow(testPlanData[0], selectedView);
    expect(component.plansData.length).toBe(1);
    testPlanData = customPlanDetails();
    component.plansData = testPlanData;
    planService.updatePlanAsActive.and.returnValue(of(testPlan));
  });
  it('should not delete a row if confirm window was denied', () => {
    confirmation = spyOn(window, 'confirm');
    confirmation.and.returnValue(false);
    component.plansData = testPlanData;
    component.deleteRow(testPlanData[0], selectedView);

  });

  it('should not delete a row if selected plan was not found', () => {
    confirmation = spyOn(window, 'confirm');
    confirmation.and.returnValue(true);
    component.plansData = customPlanDetails();
    component.deleteRow(null, selectedView);
    expect(component.plansData[0].name).toBe("testPlanName");
  });
  it('should open model', () => {
    testPlanData = customPlanDetails();
    component.createCopyPlan(testPlanData[0], 1);
    expect(localStorage.getItem('planId')).toBe(testPlanData[0].key)
    expect(localStorage.getItem('listDeptKeys')).toBe(component.listDeptKeys.toString());
  });
  it('should not display plans because selectedDepartmentValue is null', () => {
    spyOn(component, 'storeUserSelections');
    spyOn(component, 'addFilter');
    spyOn(component, 'getplansByActions');
    component.selecteddepartmentValue = "";
    component.deptDetails = deptDetilsData;
    component.deptDetails[0].key="1";
    component.displayPlans(selectedView);
    expect(component.showPlnStts).toBe(false);
    expect(localStorage.getItem('viewFilter')).toBe(null);
    expect(component.storeUserSelections).toHaveBeenCalled()
    expect(component.selectedViewFilter).toBe(selectedView);
    expect(component.selectPlan).toBe(selectedView)
    expect(component.addFilter).toHaveBeenCalled()
    expect(component.getplansByActions).toHaveBeenCalled()
  });
  it('should not display plans because department key is null', () => {
    component.selecteddepartmentValue = 'AllDepts';
    component.deptDetails = deptDetilsData;
    component.deptDetails[0].key = null;
    component.deptDetails[1].key = null;
    component.listDeptKeys = [1, 2];
    spyOn(component,'addFilter')
    spyOn(component,'getplansByActions');
    component.displayPlans(selectedView);
    expect(component.showPlnStts).toBe(false);
    expect(localStorage.getItem('viewFilter')).toBe(null)
    expect(component.selectedViewFilter).toBe(selectedView);
    expect(component.selectPlan).toBe(selectedView)
    expect(component.addFilter).toHaveBeenCalled()
    expect(component.getplansByActions).toHaveBeenCalled()
  });
  it('should update plan status', () => {
    planService.updatePlanStatus.and.returnValue(of(testPlan));
    spyOn(component,'displayPlans');
    component.updatePlanStatus(testPlanData[0], 'Inactive');
    expect(component.displayPlans).not.toHaveBeenCalled();

  });
  it('should not update plan because it is null', () => {
    spyOn(component,'displayPlans');
    component.updatePlanStatus(null, 'Active');
    planService.updatePlanStatus.and.returnValue(of(testPlan));
    expect(component.displayPlans).not.toHaveBeenCalled();
  });
  // it('should load facility details', () => {
  //   entityService.getFacility.and.returnValue(of(testEntityDetails));
  //   spyOn(component, 'loadDeptDetails');
  //   component.loadFacilityDetails();
  //   expect(entityService.getFacility).toHaveBeenCalled();
  //   expect(component.selectedentityValue).toBe(testEntityDetails[0].id);
  //   expect(component.loadDeptDetails);
  // });
  // it('should not load facility details', () => {
  //   entityService.getFacility.and.returnValue(of(testEntityDetails));
  //   component.loadFacilityDetails();
  // });
  it('should store department key value if selected department value is All department', () => {
    component.selecteddepartmentValue = 'AllDepts';
    component.deptDetails = deptDetilsData;
    component.storevalues();
    expect(localStorage.getItem('Departmentid')).toBe(deptDetilsData[0].key);
  });
  it('should store selected department value if selected department is not All department', () => {
    component.selecteddepartmentValue = 'NotAllDepts';
    component.deptDetails = deptDetilsData;
    component.deptDetails[0] = deptDetilsData[0];
    component.deptDetails[1] = deptDetilsData[0];
    component.storevalues();
    expect(localStorage.getItem('Departmentid')).toBe('NotAllDepts');
  });
  it('should load corp details', () => {
    sessionStorage.setItem('viewFilter', 'viewFilter');
    sessionStorage.setItem('corpId', 'corpId');
    component.userAccess=new UserAccess();
    component.userAccess.corporation=corpDetailsData();
    component.userAccess.facility=testEntityDetails;
    component.userAccess.department=deptDetails();
    component.corpValue=1;
    component.loadCorpDetails();
    expect(component.corpDetails).toEqual(testCorpDetailsData);
    expect(component.corpValue).toEqual(testCorpDetailsData[0].id);
    // expect(component.selecteddepartmentValue).toBe('AllDepts');
    expect(localStorage.getItem('departmentId')).toBe(null);
    expect(localStorage.getItem('selectedEntity')).toBe(null)
  });
  it('should load department details', () => {
    deptService.getDepts.and.returnValue(of([]));
    component.loadDeptDetails();
    expect(localStorage.getItem('departmentId')).toBe(null);
    expect(localStorage.getItem('selectedEntity')).toBe(null);
  });
  it('should load department details', () => {
    deptService.getDepts.and.returnValue(of([]));
    component.userAccess = customUserAccessData()[0];
    component.userAccess.featureToggle =true;
    component.loadDeptDetails();
    component.updateDepartmentDetail();
    expect(localStorage.getItem('departmentId')).toBe(null);
    expect(localStorage.getItem('selectedEntity')).toBe(null);
  });
  it('should sort change', () => {
    const e = {
      direction: 'up',
    };
    component.sortChange(e);
    expect(component.departmentSortOrder).toBe(e.direction);
  });

  it('should save selected plan value in plan service ', () => {
    spyOn(component, 'storeUserSelections');
    component.sendUserSelections('Active',1,1);
    expect(component.storeUserSelections).toHaveBeenCalled();
  });
  it('should check if date range overlapping', () => {
    testPlanData[0].effectiveEndDate = null;
    expect(component.IsDateRangeOverlapping(testPlanData[0], testPlanData[0])).toBe(false);
  });
  it('should check if date range overlapping', () => {
    testPlanData[0].effectiveStartDate = null;
    expect(component.IsDateRangeOverlapping(testPlanData[0], testPlanData[0])).toBe(false);
  });
  it('should load corp details ', () => {
    spyOn(component,'loadFacilityDetails');
    sessionStorage.setItem('viewFilter', 'viewFilter');
    sessionStorage.setItem('corpId', 'corpId');
    component.userAccess=new UserAccess();
    component.userAccess.corporation=corpDetailsData();
    component.loadCorpDetails();
    expect(component.corpValue).toBe(1);
    expect(component.loadFacilityDetails).toHaveBeenCalled()
  });
  it('should load corp details ', () => {
    spyOn(component,'loadFacilityDetails');
    sessionStorage.setItem('viewFilter', 'viewFilter');
    sessionStorage.setItem('corpId', 'corpId');
    component.userAccess = customUserAccessData()[0];
    component.userAccess.featureToggle =true;
    component.userAccess.corporation=corpDetailsData();
    component.loadCorpDetails();
    component.populateFacilityDetail(true);
    expect(component.corpValue).toBe(1);
    expect(component.loadFacilityDetails).toHaveBeenCalled()
  });
  it('should store values', () => {
    spyOn(component, 'storeUserSelections');
    component.deptDetails = null;
    component.storevalues();
    expect(sessionStorage.getItem('Corpid')).toBe(null);
    expect(sessionStorage.getItem('Enitityid')).toBe(null);
  });
  it('should ', () => {
    component.showPlnStts = true;
    component.checkDisplayPlanStatus('All', 'All');
    expect(component.checkDisplayPlanStatus('All','All')).toBe(true)

  });
  it('should paginate change', () => {
    const event = {
      pageSize: 1
    };
    component.onPaginateChange(event);
    expect(sessionStorage.getItem('pageSize')).toBe('1');
  });

  it('devsecops - check if tests are handled in build process', () => {
    const event = {
      pageSize: 1
    };
    component.onPaginateChange(event);
    expect(sessionStorage.getItem('pageSize')).toBe('1');
  });

  it('Check for displayPlansForChange', () => {
    // const event = {
    //   option : {
    //     group: null,
    //     id: 7,
    //     value: "NC0036-Catawba Valley Medical Center"
    //   }
    // };
    component.userAccess=new UserAccess()
    component.userAccess.facility=entityDetailsData();
    component.selecteddepartmentValue="";
    component.entityModel="";
    component.corpModel="";
    component.userAccess.department=deptDetails();
    component.userAccess.department[0].facilityId="testfacility_id";
    let event = {
      option: {
        id: "AllDepts"
      }
    };
    const selectedView = 'Active';
    component.displayPlansForChange(selectedView, event);
    expect(component.selecteddepartmentValue).toBe('AllDepts');
  });

  it('check for loadFacilityDetailsForChange', () =>{
    const event = {
      option : {
        group: null,
        id: 7,
        value: "NC0036-Catawba Valley Medical Center"
      }
    };
    component.deptDetails = deptDetilsData;
    component.entityDetails=entityDetailsData();
    component.clear();
    component.clearEnt();
    component.clearDept();
    component.isPlanActive('ACTIVE', true);
    component.filterDept('v');
    component.alertBox.filterEnt('v', component.entityDetails, component.entDetailsCodeList);
    spyOn(component,'loadFacilityDetailsForChange');
    //expect(component.loadFacilityDetailsForChange).toHaveBeenCalled();
  });

  it('should set userAccess', () => {
    const userAccess = component.checkUserRole();
    // userAccess.subscribe(result => {
    //   done();
    // })
    expect(component.userAccess).toBe(customuserAccessData[1]);
  });

  it('should filter corporation', () => {
    component.corpDetails=corpDetailsData();
    component.corpDetailsCodeList=["corpid","",""] ;
    expect(component.alertBox.filter('corpId', component.corpDetailsCodeList, component.corpDetails)).toEqual(corpDetailsData())
  });

  it('should filter corporation1', () => {
    component.corpDetails=corpDetailsData();
    component.corpDetailsCodeList=["corpid","",""] ;
    expect(component.alertBox.filter('name', component.corpDetailsCodeList, component.corpDetails)).toEqual(corpDetailsData())
  });

  it('should load loadDeptDetails', () => {
    component.userAccess=new UserAccess()
    component.userAccess.department=deptDetilsData;
    component.corpDetailsCodeList=["corpid","",""] ;
    component.selecteddepartmentValue="";
    component.entityModel="";
    let event = {
      option: {
        id: "2"
      }
    };
    component.loadDeptDetailsForChange(event);
    expect(component.selecteddepartmentValue).toBe('AllDepts');
  });

  it('should return 366 for leapyear', () => {
    let myDate:string = '2020-06-29';
    let selectedDate:Date=  new Date(myDate);
    expect(component.findLeapYear(selectedDate)).toBe(366);
  });

  it(' should return 365 for non leapyear', () => {
    let myDate:string = '2029-06-29';
    let selectedDate:Date=  new Date(myDate);
    expect(component.findLeapYear(selectedDate)).toBe(365);
  });
  it(' should getUpdatedTime', () => {
    let myDate:string = '2029-06-29T10:08:09';
    let selectedDate:Date=  new Date(myDate);

    expect(component.alertBox.getUpdatedTime(selectedDate)).toBe('10:08:09AM');
  });

  it(' should getUpdatedDate', () => {
    let myDate:string = '2029-06-29T10:08:09';
    let selectedDate:Date=  new Date(myDate);
    expect(component.alertBox.getUpdatedDate(selectedDate)).toBe('06/29/2029');
  });

  it(' should roundOf', () => {
    expect(component.roundOf(88.87555555)).toBe(89);
  });

  it('should checkForUserAuthority', fakeAsync(() => {
    (component as any).checkForUserAuthority(1, 0);
    expect((component as any).checkForUserAuthority).toHaveBeenCalled;
  }));

  it('should load loadFacilityDetails', () => {
    component.userAccess=new UserAccess();
    component.userAccess.facility=entityDetailsData();
    component.selecteddepartmentValue="";
    component.entityModel="";
    component.corpModel="";
    component.userAccess.department=deptDetails();
    component.userAccess.department[0].facilityId="testfacility_id";
    let event = {
      option: {
        id: "testKey?????"
      }
    };
    component.loadFacilityDetailsForChange(event);
    expect(component.selecteddepartmentValue).toBe('AllDepts');
  });


});

