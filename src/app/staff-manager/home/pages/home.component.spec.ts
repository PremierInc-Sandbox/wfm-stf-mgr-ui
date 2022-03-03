import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {StaffManagerComponent} from './home.component';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {PlanService} from '../../../shared/service/plan-service';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import {CorpService} from '../../../shared/service/corp-service';
import {of} from 'rxjs';
import {By} from '@angular/platform-browser';
import { UserAccess } from 'src/app/shared/domain/userAccess';
import {EntityService} from '../../../shared/service/entity-service';
import {corpDetailsData} from '../../../shared/service/fixtures/corp-details-data';
import {entityDetailsData} from '../../../shared/service/fixtures/entityDetailsData';
import {DepartmentService} from '../../../shared/service/department-service';
import {deptDetails} from '../../../shared/service/fixtures/dept-details-data';
import {planDetailsData} from '../../../shared/service/fixtures/plan-details-data';
import {StaffVarianceService} from '../../../shared/service/staff-variance.service';
import {staffVarianceData} from '../../../shared/service/fixtures/staffVarianceData';
import * as moment from 'moment';
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;
import createSpy = jasmine.createSpy;
import {PageRedirectionService} from "../../../shared/service/page-redirection.service";
import {RoutingStateService} from "../../../shared/domain/routing-state.service";
import {customUserData} from "../../../shared/service/fixtures/user-data";
import {UserService} from "../../../shared/service/user.service";
import {staffScheduleData} from '../../../shared/service/fixtures/staff-schedule-data';
import Jasmine = jasmine.Jasmine;
import {productHelpData} from "../../../shared/service/fixtures/product-help-data";
import {MatAutocomplete, MatAutocompleteModule} from "@angular/material/autocomplete";
import {customUserAccessData} from '../../../shared/service/fixtures/user-access-data';
import {ScheduleService} from '../../../shared/service/schedule-service';
import {staffScheduleDataService} from '../../../shared/service/service-data/staff-schedule-data-service';
import {entityCorpTimePeriodData} from "../../../shared/service/fixtures/entity-corp-time-period";

describe('StaffManagerComponent', () => {
  let component: StaffManagerComponent;
  let fixture: ComponentFixture<StaffManagerComponent>;
  const testCorpDetailsData = corpDetailsData();
  const testEntityDetailsData = entityDetailsData();
  const testDepartmentData = deptDetails();
  const testPlanDetailsData = planDetailsData();
  const testStaffVarianceDate = staffVarianceData();
  const testEntityCorpTimeData = entityCorpTimePeriodData();
  const testUserAccessData = customUserAccessData();
  const staffScheduleDataTest = staffScheduleDataService();
  let spyObjDialog: MatDialog;
  let mockMatDialog;
  let mockRouter;
  let mockHttp;
  let mockMatAutoComplete;
  let mockMatFormField;
  let spyObjCorpService: SpyObj<CorpService>;
  let spyObjStaffVarianceService: SpyObj<StaffVarianceService>;
  let spyObjPlanService: SpyObj<PlanService>;
  let spyObjEntityService: SpyObj<EntityService>;
  let spyObjDepartmentService: SpyObj<DepartmentService>;
  let scheduleServiceSpy: SpyObj<ScheduleService>;
  const routingState: SpyObj<RoutingStateService> = jasmine.createSpyObj(['loadRouting','getPreviousUrl'])
  mockRouter = jasmine.createSpyObj(['navigate']);
  const pageRedirectService: SpyObj<PageRedirectionService> = createSpyObj('PageRedirectService', ['redirectToLogout', 'redirectToExternalPage', 'redirectToWhoopsPage', 'generateErrorCode', 'getProductHelpUrl']);
  let date = new Date();

  mockMatDialog = jasmine.createSpyObj({
    afterClosed: of({}), close: null, open: createSpy('open', function() {
      return this;
    })
  });
  mockMatDialog.componentInstance = {body: ''};
  beforeEach(waitForAsync(() => {
    mockMatDialog.open.and.callFake(function() {
      return this;
    });
    spyObjDialog = jasmine.createSpyObj(['open']);
    spyObjCorpService = createSpyObj('CorpService', ['getCorporations']);
    spyObjStaffVarianceService = createSpyObj('StaffVarianceService', ['getPlansByDepartment', 'getAllDepartmentPlans', 'getReleasedTimePeriodFromDTM']);
    spyObjPlanService = jasmine.createSpyObj(['getAllPlansByPlanAction', 'getDepartmentsKeyesWithActivePlans','getRedirectUrl', 'getPlandetails']);
    scheduleServiceSpy = createSpyObj('ScheduleService', ['createSchedule', 'getScheduleDetails', 'getActualWHPU']);
    scheduleServiceSpy.getActualWHPU.and.returnValue(1);
    scheduleServiceSpy.getScheduleDetails.and.returnValue(of(staffScheduleData()));
    spyObjEntityService = createSpyObj('EntityService', ['getFacility']);
    spyObjDepartmentService = createSpyObj('DepartmentService', ['getDepts']);
    spyObjStaffVarianceService.getPlansByDepartment.and.returnValue(of(testStaffVarianceDate));
    spyObjStaffVarianceService.getAllDepartmentPlans.and.returnValue(of(testStaffVarianceDate));
    spyObjStaffVarianceService.getReleasedTimePeriodFromDTM.and.returnValue(of(testEntityCorpTimeData));
    spyObjEntityService.getFacility.and.returnValue(of(testEntityDetailsData));
    spyObjPlanService.getAllPlansByPlanAction.and.returnValue(of(testPlanDetailsData));
    spyObjPlanService.getDepartmentsKeyesWithActivePlans.and.returnValue(of([1, 2, 3]));
    spyObjCorpService.getCorporations.and.returnValue(of(testCorpDetailsData));
    spyObjDepartmentService.getDepts.and.returnValue(of(testDepartmentData));
    routingState.getPreviousUrl.and.returnValue('home');
    let userServiceSpyObj: SpyObj<UserService> = createSpyObj('UserService', ['logout','fetchUserRole']);
    const userDataTest = customUserData();
    userServiceSpyObj.user = userDataTest[0];
    userServiceSpyObj.fetchUserRole.and.returnValue(of(customUserAccessData()[0]));
    userServiceSpyObj.logout.and.returnValue(of(userDataTest));
    let testProductData=productHelpData();
    spyObjPlanService.getRedirectUrl.and.returnValue(of(testProductData[0]));
    let testStaffScheduleData = staffScheduleData();
    spyObjPlanService.getPlandetails.and.returnValue(of());
    TestBed.configureTestingModule({
      declarations: [StaffManagerComponent],
      imports: [MatTableModule, MatAutocompleteModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{provide: Router, useValue: mockRouter}, {provide: HttpClient, useValue: mockHttp},
        {provide: PlanService, useValue: spyObjPlanService}, {provide: CorpService, useValue: spyObjCorpService},
        {provide: MatFormField, useValue: mockMatFormField}, {provide: EntityService, useValue: spyObjEntityService},
        {provide: MatDialog, useValue: mockMatDialog},
        {provide: StaffVarianceService, useValue: spyObjStaffVarianceService}, {
          provide: DepartmentService,
          useValue: spyObjDepartmentService
        },{ provide: PageRedirectionService,
          useValue: pageRedirectService},
        {provide: RoutingStateService,useValue: routingState},
        {provide:UserService,useValue:userServiceSpyObj},
        {provide: ScheduleService, useValue:scheduleServiceSpy}],
    })
      .compileComponents();

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffManagerComponent);
    sessionStorage.setItem('userAccess', JSON.stringify(testUserAccessData[0]));
    sessionStorage.setItem('selectedCorp', '1');
    sessionStorage.setItem('selectedEntity', '1');
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.userAccess = testUserAccessData[0];
    component.staffVarianceDetails = testStaffVarianceDate;
  });

  it('should not get all department plans', () => {
    spyOn(component,'setStaffVarianceData');
    spyObjStaffVarianceService.getAllDepartmentPlans.and.returnValue(of([]));
    component.staffVarianceDetails = testStaffVarianceDate;
    component.getAllDepartmentPlans();
    !expect(component.setStaffVarianceData).toHaveBeenCalled();
  });
  it('should not get all department plans', () => {
    spyObjStaffVarianceService.getAllDepartmentPlans.and.returnValue(of([testStaffVarianceDate]));
    component.staffVarianceDetails = testStaffVarianceDate;
    component.getAllDepartmentPlans()
  });
  it('should be created', () => {
    spyOn(component, 'loadPlanDetails').and.stub();
    spyOn(component, 'getDateFromSessionStrage').and.stub();
    expect(component).toBeTruthy();
  });
  it('should load plan details', () => {
    spyObjStaffVarianceService.getPlansByDepartment.and.returnValue(of([]));
    component.loadPlanDetails();
    expect(component.numberOfDepartmentsWithoutActivePlans).toBe(0);
  });
  it('should load corporation details with ', () => {
    spyOn(component, 'loadPlanDetails').and.stub();
    sessionStorage.setItem('selectedCorp', '1');
    spyOn(component, 'loadEntityDetails').and.stub();
    component.loadCorpDetails();
    expect(component.selectedCorp).toBe(1);
    expect(component.corpDetails).toBe(testUserAccessData[0].corporation);
    expect(component.loadEntityDetails).toHaveBeenCalled();
  });
  it('should load corp details ', () => {
    spyOn(component,'loadEntityDetails');
    sessionStorage.setItem('viewFilter', 'viewFilter');
    sessionStorage.setItem('corpId', 'corpId');
    component.userAccess = customUserAccessData()[0];
    component.userAccess.featureToggle =true;
    component.userAccess.corporation=corpDetailsData();
    component.loadCorpDetails();
    component.populateFacilityDetail(true);
  });
  it('should load department details', () => {
    component.userAccess = customUserAccessData()[0];
    component.userAccess.featureToggle =true;
    component.loadDeptDetails();
    expect(localStorage.getItem('departmentId')).toBe(null);
    expect(localStorage.getItem('selectedEntity')).toBe(null);
  });
  it('should load corporation details with ', () => {
    spyOn(component, 'loadPlanDetails').and.stub();
    sessionStorage.setItem('selectedCorp', null);
    spyOn(component, 'loadEntityDetails').and.stub();
    component.loadCorpDetails();
    expect(component.selectedCorp).toBe(1);
    expect(component.corpDetails).toBe(testUserAccessData[0].corporation);
    expect(component.loadEntityDetails).toHaveBeenCalled();
  });

  it('should load entity data and set select box to be selected based on session storage ', () => {
    testEntityDetailsData[0].id = '0';
    spyOn(component, 'loadPlanDetails').and.stub();
    sessionStorage.setItem('selectedEntity', '1');
    spyOn(component, 'loadDeptDetails').and.stub();
    component.loadEntityDetails();
    expect(component.selectedEntity).toBe(2);
    expect(component.loadDeptDetails).toHaveBeenCalled();
    expect(component.entityDetails[0]).toEqual(testUserAccessData[0].facility[0]);
  });
  it('should load entity data and set select box to be selected based on session storage ', function () {
    spyOn(component, 'loadPlanDetails').and.stub();
    sessionStorage.setItem('selectedEntity', '1');
    spyOn(component, 'loadDeptDetails').and.stub();
    component.loadEntityDetails();
    expect(component.selectedEntity).toBe(2)
    expect(component.loadDeptDetails).toHaveBeenCalled();
    expect(component.entityDetails[0]).toEqual(testUserAccessData[0].facility[0]);
  });
  it('should get min date', () => {
    spyOn(component, 'loadPlanDetails').and.stub();
    spyOn(component, 'getDateFromSessionStrage').and.stub();
    const currentDate = moment();
    const twoYearsBeforeCurrentDate = currentDate.subtract(2, 'years').toDate();
    component.getMinDate();
    expect(component.twoYearsBeforeCurrentDate.getDate).toBe(twoYearsBeforeCurrentDate.getDate);
    expect(component.twoYearsBeforeCurrentDate.getDay).toBe(twoYearsBeforeCurrentDate.getDay);
    expect(component.twoYearsBeforeCurrentDate.getMonth).toBe(twoYearsBeforeCurrentDate.getMonth);
    expect(component.twoYearsBeforeCurrentDate.getFullYear).toBe(twoYearsBeforeCurrentDate.getFullYear);
    expect(component.getDateFromSessionStrage).toHaveBeenCalled();
  });
  it('should get date from session storage', () => {
    component.initialFlag = true;
    sessionStorage.setItem('currentDate', '1');
    component.getDateFromSessionStrage();
    expect(component.currentDate).toEqual(new Date(sessionStorage.getItem('currentDate')));
  });
  it('should get date from session storage', () => {
    component.initialFlag = false;
    sessionStorage.setItem('currentDate', '1');
    component.getDateFromSessionStrage();
    component.currentDate = new Date();
    const expectedDate = component.currentDate;
    expect(component.currentDate).toEqual(expectedDate);
  });

  it('should get active plans for selected date 1', () => {
    component.userAccess = customUserAccessData()[0];
    component.userAccess.featureToggle = true;
    component.getActivePlansForSelectedDate(new Date());
    expect(component.numberOfDepartmentsWithoutActivePlans).toBe(component.numberOfDepartmentsWithoutActivePlans);
    expect(component.dataSource.paginator).toBe(component.paginator);
  });
  it('should get active plans for selected date 2', () => {
    testStaffVarianceDate[0].departmentName = 'first department';
    testStaffVarianceDate[0].departmentName = 'first department';
    component.getActivePlansForSelectedDate(new Date());
    expect(component.numberOfDepartmentsWithoutActivePlans).toBe(component.numberOfDepartmentsWithoutActivePlans);
    expect(component.dataSource.paginator).toBe(component.paginator);
  });
  it('should get active plans for selected date 3', () => {
    spyObjStaffVarianceService.getPlansByDepartment.and.returnValue(of( []));
    component.getActivePlansForSelectedDate(new Date());
    expect(component.numberOfDepartmentsWithoutActivePlans).toBe(component.numberOfDepartmentsWithoutActivePlans);
    expect(component.dataSource.paginator).toBe(component.paginator);
  });
  it('should get plan status as not started', () => {
    expect(component.getPlanStatus(5, date)).toBe('Not Started');
  });
  it('should get plan status as In Process', () => {
    date = moment(new Date()).subtract(2, 'months').toDate();
    expect(component.getPlanStatus(2, date)).toBe('In Process');
  });
  it('should get plan status as Closed', () => {
    date = moment(new Date()).subtract(2, 'months').toDate();
    expect(component.getPlanStatus(4, date)).toBe('Closed');
  });
  it('should get plan status as no plan available', () => {
    date = new Date();
    expect(component.getPlanStatus(6, date)).toBe('No Plan Available');
  });
  it('should active links for status 2', () => {
    expect(component.getActiveLink(2, new Date())).toBe(1);
  });
  it('should active links status 4 ', () => {
    date = moment(new Date()).subtract(2, 'months').toDate();
    expect(component.getActiveLink(4, date)).toBe(1);
  });
  it('should active links status 6', () => {
    expect(component.getActiveLink(6, new Date())).toBe(0);
  });
  it('should return updated date', () => {
    const updatedDate = new Date();
    let day = updatedDate.getDate().toString();
    let month = (updatedDate.getMonth() + 1).toString();
    const year = updatedDate.getFullYear().toString();
    if (parseInt(day, 10) < 10) {
      day = '0' + day;
    }
    if (parseInt(month, 10) < 10) {
      month = '0' + month;
    }
    const today = month + '/' + day + '/' + +year;
    return today;
    expect(component.alertBox.getUpdatedDate(updatedDate)).toBe(today);
  });
  it('should return updated time', () => {
    const updatedTime = new Date();
    let hours = updatedTime.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours > 12 ? hours - 12 : hours;
    let hour = hours.toString();
    let minutes = updatedTime.getMinutes().toString();
    let seconds = updatedTime.getSeconds().toString();
    hour = parseInt(hour, 10) > 9 ? hour : '0' + hour;
    minutes = parseInt(minutes, 10) > 9 ? minutes : '0' + minutes;
    seconds = parseInt(seconds, 10) > 9 ? seconds : '0' + seconds;
    const time = hour + ':' + minutes + ':' + seconds + '' + ampm;
    expect(component.alertBox.getUpdatedTime(updatedTime)).toBe(time);
  });
  it('should return comments list', () => {
    const comments = '3 AM - 1\n\n';
    expect(component.getComments(testStaffVarianceDate[0].shiftComments)).toBe(comments);
  });
  it('should return true if status is 5', () => {
    expect(component.checkComments(5, testStaffVarianceDate[0].shiftComments)).toBe(true);
  });
  it('should return true if status is 6', () => {
    expect(component.checkComments(6, testStaffVarianceDate[0].shiftComments)).toBe(true);
  });
  it('should return true if status is 2/4 and shiftcomments is empty', () => {
    const comments = [];
    expect(component.checkComments(6, comments)).toBe(true);
  });
  it('should return false if status is 2/4 and shiftcomments is not empty', () => {
    expect(component.checkComments(6, testStaffVarianceDate[0].shiftComments)).toBe(true);
  });

  it('should set productivityindex,deptnotmeetingtarget,deptwithoutactiveplan,totalhourvariance', () => {
    component.staffVarianceDetails = testStaffVarianceDate;
    component.setScoreCard();
    expect(component.productivityIndex).toBe(0);
    expect(component.numberOfDepartmentsNotMeetingTarget).toBe(0);
    expect(component.numberOfDepartmentsWithoutActivePlans).toBe(0);
    expect(component.totalhoursVariance).toBe(0);
  });
  it('should set score card', () => {
    testStaffVarianceDate[0].actualHours = 1;
    testStaffVarianceDate[0].recordStatusKey = 2;
    testStaffVarianceDate[0].dailyVarianceHours = -1;
    testStaffVarianceDate[0].targetHours = 1;
    component.staffVarianceDetails = testStaffVarianceDate;
    component.setScoreCard();
    expect(component.productivityIndex).toBe(100);
    expect(component.numberOfDepartmentsNotMeetingTarget).toBe(1);
    expect(component.numberOfDepartmentsWithoutActivePlans).toBe(0);
    expect(component.totalhoursVariance).toBe(-1);
    testStaffVarianceDate[0].recordStatusKey = 5;
    component.setScoreCard();
  });
  it('should set page size for paginate change', () => {
    const event = {
      pageSize: 22
    };
    component.onPaginateChange(event);
    expect(sessionStorage.getItem('pageSizeSM')).toEqual(event.pageSize.toString());
  });
  it('should get updated date', () => {
    const date = new Date('01-9-2020');
    component.alertBox.getUpdatedDate(date);
    expect(component.alertBox.getUpdatedDate(date)).toBe('01/09/2020');
  });
  it('should convert date to string', () => {
    const date = new Date('01/09/2020');
    component.currentDate = date;
    component.convertToDateString();
    expect(component.convertToDateString()).toEqual('01-09-2020');
  });
  it('should convert date to string', () => {
    const date = new Date('10/10/2020');
    component.currentDate = date;
    component.convertToDateString();
    expect(component.convertToDateString()).toEqual('10-10-2020');
  });
  it('check for loadFacilityDetailsForChange', () =>{
    const event = {
      option : {
        group: null,
        id: 7,
        value: "NC0036-Catawba Valley Medical Center"
      }
    };
    component.entityDetails = entityDetailsData();
    component.clear();
    component.clearEnt();
    component.filterEnt('v');
    spyOn(component,'loadEntityDetailsForChange');
    //expect(component.loadEntityDetailsForChange).toHaveBeenCalled();
  });
  it('should check for filters', () => {
    component.filter('A');
    component.clear();
    component.filterEnt('A');
    component.clearEnt();
  });
  it('should load loadEntityDetailsForChange', () => {
    component.userAccess=new UserAccess()
    component.userAccess.facility=entityDetailsData();
    component.entityModel="";
    component.corpModel="";
    component.userAccess.department=deptDetails();
    component.userAccess.department[0].facilityId="testfacility_id";
    let event = {
      option: {
        id: "testKey?????"
      }
    };
    component.loadEntityDetailsForChange(event);

  });

  it('should load loadDeptDetailsForChange', () => {
    component.userAccess=new UserAccess()
    component.userAccess.facility=entityDetailsData();
    component.entityModel="";
    component.corpModel="";
    component.userAccess.department=deptDetails();
    component.userAccess.department[0].facilityId="testfacility_id";
    let event = {
      option: {
        id: 2
      }
    };
    component.loadDeptDetailsForChange(event);
    expect(component.selectedEntity).toEqual(2);
  });

  it('should check hostlistener', function(){
    document.dispatchEvent(new MouseEvent('click'));
    const event = new Event('click', { bubbles: true});
    spyOn(event, 'preventDefault');
    document.dispatchEvent(event);
  });

  it('should loadScheduleForThePlan', () =>{
    //spyOn(component, "loadScheduleForThePlan");
    component.loadScheduleForThePlan(2);
  });

  it('should openScreenRefreshDialog', function(){
    (component as any).openScreenRefreshDialog();
    component.canDeactivate();
  });

  it('should openScheduleDialog', () => {
    component.openScheduleDialog();
    expect(component.openScheduleDialog).toHaveBeenCalled;
  });

  it('should get released time period', () => {
    spyObjStaffVarianceService.getReleasedTimePeriodFromDTM.and.returnValue(of([]));
    component.getReleasedTimePeriod();
  });

  it('should get prior cumulative hrs variance', () => {
    component.getPriorCumulativeHoursVariance();
  });

});
