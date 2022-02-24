import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {ChangeDetectorRef, NO_ERRORS_SCHEMA, Renderer2, ViewContainerRef} from '@angular/core';
import { MAT_DATEPICKER_SCROLL_STRATEGY, MatDatepicker } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import createSpy = jasmine.createSpy;
import {StaffingGridComponent} from './staff-planner/staffing-grid/pages/staffing-grid.component';
import {StaffManagerPlanComponent} from './staff-manager/staff-manager-plan/pages/staff-manager-plan.component';
import SpyObj = jasmine.SpyObj;
import {PlanSetupComponent} from './staff-planner/plan-setup/pages/plan-setup.component';
import createSpyObj = jasmine.createSpyObj;
import { SavePlanParams } from './shared/domain/save-plan-params';
import { ConfirmWindowOptions, PlanDetails } from './shared/domain/plan-details';
import { OffGridActivitiesComponent } from './staff-planner/off-grid-activities/pages/off-grid-activities.component';
import { StaffScheduleComponent } from './staff-planner/staff-schedule/pages/staff-schedule.component';
import {PlanService} from './shared/service/plan-service';
import {StaffVarianceService} from './shared/service/staff-variance.service';
import {RoutingStateService} from "./shared/domain/routing-state.service";
import {UserService} from "./shared/service/user.service";
import {PageRedirectionService} from "./shared/service/page-redirection.service";
import {customUserData} from "./shared/service/fixtures/user-data";
import {productHelpData} from "./shared/service/fixtures/product-help-data";
import { PlanListComponent } from './staff-planner/home/pages/home.component';
import { CorpService } from './shared/service/corp-service';
import { EntityService } from './shared/service/entity-service';
import { DepartmentService } from './shared/service/department-service';
import { ErrorHandlerService } from './shared/service/error-handler-service';
import { PlatformLocation } from '@angular/common';
import { LoaderService } from './shared/service/loader.service';
import { planSetupData } from './shared/service/fixtures/plansetup-data';
import { OAService } from './shared/service/oa-service';
import { ScheduleService } from './shared/service/schedule-service';
import { RouterHistoryTrackerService } from './shared/service/router-history-tracker.service';
import { planDetailsData } from './shared/service/fixtures/plan-details-data';
import { StaffGridService } from './shared/service/Staffgrid-service';
import { StaffManagerComponent } from './staff-manager/home/pages/home.component';
import { PredictedDataService } from './shared/service/predicted-data.service';
import {UserAccess} from './shared/domain/userAccess';
import {customUserAccessData} from './shared/service/fixtures/user-access-data';
import {MatSnackBar} from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import {ProductHelp} from "./shared/domain/product-help";

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let currentComponentObj = {
    isPlanEdited: true,
    checkIfPlanEdited():boolean
    {
      return this.isPlanEdited;
    }
  };
    const mockRouter: SpyObj<Router> = jasmine.createSpyObj(['navigate']);
  let userServiceSpyObj: SpyObj<UserService> = createSpyObj('UserService', ['logout','fetchUserRole']);
  const pageRedirectService: SpyObj<PageRedirectionService> = createSpyObj('PageRedirectService', ['redirectToLogout', 'redirectToExternalPage', 'redirectToWhoopsPage', 'generateErrorCode', 'getProductHelpUrl']);
  const routingState: SpyObj<RoutingStateService> = jasmine.createSpyObj(['loadRouting', 'getPreviousUrl'])
  const planServiceSpyObj: SpyObj<PlanService> = jasmine.createSpyObj(['removePlanKeyFromSessionAttribute', 'removePlanKeyFromSessionAttributeSubscribe','getRedirectUrl'])
  const staffVarianceSpyObj: SpyObj<StaffVarianceService> = jasmine.createSpyObj(['removePlanKeyFromSessionAttributeSubscribe']);
  planServiceSpyObj.removePlanKeyFromSessionAttribute.and.returnValue(of());
  planServiceSpyObj.removePlanKeyFromSessionAttributeSubscribe.and.returnValue(of());
  staffVarianceSpyObj.removePlanKeyFromSessionAttributeSubscribe.and.returnValue(of());
  const userDataTest = customUserData();
  userServiceSpyObj.fetchUserRole.and.returnValue(new Observable<UserAccess>((observer) =>{
    observer.next(customUserAccessData()[1]);
  }));
  userServiceSpyObj.user = userDataTest[0];
  userServiceSpyObj.userAccess=new Observable();
  userServiceSpyObj.fetchUserRole.and.returnValue( new Observable<UserAccess>((observer) =>{
    observer.next(customUserAccessData()[1]);
  }));
  userServiceSpyObj.user = userDataTest[1];
  userServiceSpyObj.userAccess = new Observable<UserAccess>((observer) =>{
     observer.next(customUserAccessData()[1]);
  });
  sessionStorage.setItem('userAccess',JSON.stringify(userServiceSpyObj.userAccess));
  userServiceSpyObj.logout.and.returnValue(of(userDataTest));
    let flag=true;
  let mockHttpClient;
  let event = {
    view: {
      location: {
        hash: '#/plan-list'
      }
    }
  };
  let currentComponent:StaffManagerPlanComponent;
  let planSetupPlanCompSpyObj:SpyObj<PlanSetupComponent>;
  let oGACompSpyObj:SpyObj<OffGridActivitiesComponent>;
  let staffScheduleSpyObj:SpyObj<StaffScheduleComponent>;
  let smCompSpyObj:SpyObj<StaffManagerPlanComponent>;
  let staffgridSpyObj:SpyObj<StaffingGridComponent>;
  let  routerSpyObj = {
    ...jasmine.createSpyObj('mockRouter', ['navigate']),
    events: new Observable(observer => {
      observer.next('');
      observer.complete();
    }),
    url: '#/plan-list'
  };
  let mockMatDialog = jasmine.createSpyObj({
    afterClosed: createSpy('name', function () {
      return of();}).and.callThrough(), close: null, open: createSpy('open', function () {
        return this;

      }
    )
  });
  let matsnackBar: SpyObj<MatSnackBar> = jasmine.createSpyObj(['dismiss']);

  mockMatDialog.componentInstance = {body: ''};
  beforeEach(waitForAsync(() => {
    planSetupPlanCompSpyObj=createSpyObj('PlanSetupComponent',['mandatoryCheckSNFailed','checkIfPlanEdited','saveAndNextPlanDetails']);
    smCompSpyObj=createSpyObj('StaffManagerPlanComponent',['checkIfPlanEdited','saveAndExitStaffingDetails','saveAndExitCheckForError']);
    staffgridSpyObj=createSpyObj('StaffingGridComponent',['checkIfPlanEdited','saveAndExitStaffGridDetails','saveAndExitStaffingDetails'])
    oGACompSpyObj=createSpyObj('OffGridActivitiesComponent',['validateActivities','saveAndNextPlanDetails','savePlanDetails']);
    staffScheduleSpyObj=createSpyObj('StaffScheduleComponent',['validateExistingSchedules','saveAndNextScheduleDetails','checkIfPlanEdited']);
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(flag);
        }
      }
    });
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule
      ],
      declarations: [
        AppComponent,
        StaffingGridComponent
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{provide: Router, useValue: routerSpyObj },{provide: HttpClient, useValue: mockHttpClient}, {provide: Router, useValue: mockRouter},
        {provide: MatDialog, useValue: mockMatDialog},{provide: PlanSetupComponent, useValue: planSetupPlanCompSpyObj},{provide: StaffManagerPlanComponent, useValue: smCompSpyObj},
        {provide: PlanService, useValue: planServiceSpyObj},{provide: StaffVarianceService, useValue: staffVarianceSpyObj},
        {provide: RoutingStateService,useValue: routingState},{ provide: PageRedirectionService,
          useValue: pageRedirectService},{provide:UserService,useValue:userServiceSpyObj},{provide:MatSnackBar,useValue:matsnackBar}]
    }).compileComponents();
    planServiceSpyObj.removePlanKeyFromSessionAttribute.and.returnValue(of());
    planServiceSpyObj.removePlanKeyFromSessionAttributeSubscribe.and.returnValue(of());
    let testProductData=productHelpData();
    planServiceSpyObj.getRedirectUrl.and.returnValue( new Observable<ProductHelp>((observer) =>{
      observer.next(productHelpData()[0]);
    }));
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    planSetupPlanCompSpyObj.mandatoryCheckSNFailed.and.returnValue(true);
    smCompSpyObj.checkIfPlanEdited.and.returnValue(true);
    fixture.detectChanges();
    flag=true;
  });

  it('should ', function () {
    sessionStorage.setItem('selected',null);
    userServiceSpyObj.userAccess = new Observable<UserAccess>((observer) =>{
      observer.next(customUserAccessData()[0]);
    });
    component.ngOnInit();
  });
  it('should ', function () {
    sessionStorage.setItem('selected',null);
    userServiceSpyObj.userAccess = new Observable<UserAccess>((observer) =>{
      observer.next(customUserAccessData()[2]);
    });
    component.ngOnInit();
  });
  it('should process based on role ', function () {
    sessionStorage.setItem('selected',null);
    userServiceSpyObj.userAccess = new Observable<UserAccess>((observer) =>{
      observer.next(customUserAccessData()[3]);
    });
    component.ngOnInit();
  });
  it('should process based on role ', function () {
    sessionStorage.setItem('selected',null);
    userServiceSpyObj.userAccess = new Observable<UserAccess>((observer) =>{
      observer.next(customUserAccessData()[4]);
    });
    component.ngOnInit();
  });
  it('should process based on role ', function () {
    sessionStorage.setItem('selected',null);
    userServiceSpyObj.userAccess = new Observable<UserAccess>((observer) =>{
      observer.next(customUserAccessData()[5]);
    });
    component.ngOnInit();
  });
  it('should process based on role ', function () {
    sessionStorage.setItem('selected',null);
    userServiceSpyObj.userAccess = new Observable<UserAccess>((observer) =>{
      observer.next(customUserAccessData()[6]);
    });
    component.ngOnInit();
  });
  it('should process based on role ', function () {
    sessionStorage.setItem('selected',null);
    userServiceSpyObj.userAccess = new Observable<UserAccess>((observer) =>{
      observer.next(customUserAccessData()[7]);
    });
    component.ngOnInit();
  });
  it('should process based on role ', function () {
    sessionStorage.setItem('selected',null);
    userServiceSpyObj.userAccess = new Observable<UserAccess>((observer) =>{
      observer.next(customUserAccessData()[8]);
    });
    component.ngOnInit();
  });
  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
  it('should open dialog for planner', function () {
    let event={
      view:{
        location: {
          hash: '?test?#/plan-manager'
        }
      }
    };
    component.openDialogForplanner(event);
  });
  it(`should have as title 'Labor Management'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('Labor Management');
  });
  it('should set current component', function () {
    component.onActivate(currentComponent);
    expect(component.currentComponent).toBeUndefined();
  });
  it('should call onDeactivate function ', function () {
    spyOn(component,'onDeactivate');
    component.onDeactivate(currentComponent);
    expect(component.onDeactivate).toHaveBeenCalled();
  });
  it('should open tile navigation dialog1', function () {
    spyOn(component.alertBox,'openAlertWithReturn').and.returnValue(mockMatDialog)
    spyOn(component,'setSelectedValue');
    spyOn(window,'alert');
    component.openTileNavigationDialog();
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
    expect(component.setSelectedValue).toHaveBeenCalled()
  });
  it('should open tile navigation dialog2', function () {
    spyOn(component,'setSelectedValue');
    spyOn(window,'alert');
    component.openTileNavigationDialog();
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
    expect(component.setSelectedValue).toHaveBeenCalled()
  });
  it('should open tile navigation dialog3', function () {
    spyOn(component,'removeSessionAttributes').and.stub();
    spyOn(component,'setSelectedValue').and.stub();
    flag=false;
    spyOn(window,'alert');
    component.openTileNavigationDialog();
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
    expect(component.setSelectedValue).toHaveBeenCalled()
  });

  it('should ', function (){
    spyOn(component,'setSelectedValue').and.stub();
    event.view.location.hash='#/plan-manager?';
    component.currentComponent=smCompSpyObj;
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
    expect(component.setSelectedValue).toHaveBeenCalled();
  });
  it('should 2', function (){
    flag=false;
    spyOn(component,'setSelectedValue');
    event.view.location.hash='#/plan-manager?';
    component.currentComponent=smCompSpyObj;
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
    expect(component.setSelectedValue).toHaveBeenCalled();
  });
  it('should navigate to staff manager without prompting dialog box11', function () {
    event.view.location.hash='#/home';
    spyOn(component,'setSelectedValue');
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
    expect(component.setSelectedValue).toHaveBeenCalled()
  });
  it('should navigate to staff manager without prompting dialog box13', function () {
    flag=false;
    event.view.location.hash='null';
    spyOn(component,'setSelectedValue');
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
    expect(component.setSelectedValue).toHaveBeenCalled()
  });


  it('should navigate to staff manager without prompting dialog box from plan list', function () {
    spyOn(component,'setSelectedValue');
    let httpClient:HttpClient;
    let pageRedirectionService: PageRedirectionService;
    let planService: PlanService;
    let corpService: CorpService;
    let entityService: EntityService;
    let departmentService: DepartmentService;
    let userService: UserService=new UserService(httpClient,pageRedirectionService);
    let dialog: MatDialog;
    let router: Router;
    let errorHandler: ErrorHandlerService;
    let platformLocation: PlatformLocation;
    let routingState: RoutingStateService;
    let loaderService: LoaderService;
    let staffgridService:StaffGridService;
    let planListComponent: PlanListComponent=new PlanListComponent( planService,  corpService,
      entityService,
      departmentService,
      userService,
      dialog, router ,
      errorHandler,
      pageRedirectionService,
      platformLocation,
      routingState,
      loaderService);
    component.currentComponent=planListComponent;
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
    expect(component.setSelectedValue).toHaveBeenCalled()
  });

  it('should navigate to staff manager without prompting dialog box from plan setup without save', function () {
    spyOn(component,'setSelectedValue');
    let planService: PlanService;
    let entityService: EntityService;
    let departmentService: DepartmentService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let platformLocation: PlatformLocation;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let staffgridService: StaffGridService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let matSnackBar: MatSnackBar;
    let planSetupComponent: PlanSetupComponent=new PlanSetupComponent(router,
      planService,
      dialog,
      entityService,
      oaService,
      departmentService,
      activatedRoute,
      scheduleService,
      platformLocation,
      staffgridService,
      routerHistoryTrackerService,
      matSnackBar);
    component.currentComponent=planSetupComponent;
    spyOn(component.currentComponent,'checkIfPlanEdited').and.returnValue(true);
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
    expect(component.setSelectedValue).toHaveBeenCalled()
  });

  it('should navigate to staff manager without prompting dialog box from plan setup without save', function () {
    spyOn(component,'setSelectedValue');
    let planService: PlanService;
    let entityService: EntityService;
    let departmentService: DepartmentService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let platformLocation: PlatformLocation;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let staffgridService: StaffGridService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let matSnackBar: MatSnackBar;
    let planSetupComponent: PlanSetupComponent=new PlanSetupComponent(router,
      planService,
      dialog,
      entityService,
      oaService,
      departmentService,
      activatedRoute,
      scheduleService,
      platformLocation,
      staffgridService,
      routerHistoryTrackerService,
      matSnackBar);
    component.currentComponent=planSetupComponent;
    spyOn(component.currentComponent,'checkIfPlanEdited').and.returnValue(true);
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
    expect(component.setSelectedValue).toHaveBeenCalled()
  });

  it('When user clicks on StaffPlanner tile from plan setup page and select no for save promt -should goto home page', function () {
    spyOn(component,'setSelectedValue');
    let planService: PlanService;
    let entityService: EntityService;
    let departmentService: DepartmentService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let platformLocation: PlatformLocation;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let staffgridService: StaffGridService;
    let matSnackBar: MatSnackBar;
    let planSetupComponent: PlanSetupComponent=new PlanSetupComponent(router,
      planService,
      dialog,
      entityService,
      oaService,
      departmentService,
      activatedRoute,
      scheduleService,
      platformLocation,
      staffgridService,
      routerHistoryTrackerService,
      matSnackBar);
    component.currentComponent=planSetupComponent;
    spyOn(component.currentComponent,'checkIfPlanEdited').and.returnValue(true);
    component.openDialogForplanner(event);
    expect(component.setSelectedValue).toHaveBeenCalledWith('StaffPlan');
  });

  it('When user clicks on StaffPlanner tile from plan setup page and select yes for save promt -mandatory check failed -should stay on plansetup page', function () {
    spyOn(component,'setSelectedValue');
    let planService: PlanService;
    let entityService: EntityService;
    let departmentService: DepartmentService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let platformLocation: PlatformLocation;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let staffgridService: StaffGridService;
    let matSnackBar: MatSnackBar;
    let planSetupComponent: PlanSetupComponent=new PlanSetupComponent(router,
      planService,
      dialog,
      entityService,
      oaService,
      departmentService,
      activatedRoute,
      scheduleService,
      platformLocation,
      staffgridService,
      routerHistoryTrackerService,
      matSnackBar);
    component.currentComponent=planSetupComponent;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });
    spyOn(component.currentComponent,'checkIfPlanEdited').and.returnValue(true);
    spyOn(component.currentComponent,'mandatoryCheckSNFailed').and.returnValue(true);
    component.openDialogForplanner(event);
    expect(component.setSelectedValue).toHaveBeenCalledWith('StaffPlan');
  });

  it('When user clicks on StaffPlanner tile from plan setup page and select no for save promt - should go to home page', function () {
    spyOn(component,'setSelectedValue');
    let planService: PlanService;
    let entityService: EntityService;
    let departmentService: DepartmentService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let platformLocation: PlatformLocation;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let staffgridService: StaffGridService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let matSnackBar: MatSnackBar;
    let planSetupComponent: PlanSetupComponent=new PlanSetupComponent(router,
      planService,
      dialog,
      entityService,
      oaService,
      departmentService,
      activatedRoute,
      scheduleService,
      platformLocation,
      staffgridService,
      routerHistoryTrackerService,
      matSnackBar);
    component.currentComponent=planSetupComponent;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });
    spyOn(component.currentComponent,'checkIfPlanEdited').and.returnValue(false);
    spyOn(component.currentComponent,'mandatoryCheckSNFailed').and.returnValue(true);
    component.openDialogForplanner(event);
    expect(component.setSelectedValue).toHaveBeenCalledWith('StaffPlan');
  });


  it('When user clicks on StaffPlanner tile from plan setup page and select yes for save promt -mandatory check success -should go to landing page', function () {
    spyOn(component,'setSelectedValue');
    let planService: PlanService;
    let entityService: EntityService;
    let departmentService: DepartmentService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let platformLocation: PlatformLocation;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let staffgridService:StaffGridService;
    let matSnackBar: MatSnackBar;
    let planSetupComponent: PlanSetupComponent=new PlanSetupComponent(router,
      planService,
      dialog,
      entityService,
      oaService,
      departmentService,
      activatedRoute,
      scheduleService,
      platformLocation,
      staffgridService,
      routerHistoryTrackerService,
      matSnackBar);
    component.currentComponent=planSetupComponent;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });
    spyOn(component.currentComponent,'checkIfPlanEdited').and.returnValue(true);
    spyOn(component.currentComponent,'mandatoryCheckSNFailed').and.returnValue(false);
    spyOn(component.currentComponent,'saveAndNextPlanDetails');
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
    expect(component.setSelectedValue).toHaveBeenCalledWith('StaffPlan');
  });

  it('plan setup should not navigate to staff manager if mandatory check failed', function () {
    spyOn(component,'setSelectedValue');
    let planService: PlanService;
    let entityService: EntityService;
    let departmentService: DepartmentService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let platformLocation: PlatformLocation;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let staffgridService:StaffGridService;
    let matSnackBar: MatSnackBar;
    let planSetupComponent: PlanSetupComponent=new PlanSetupComponent(router,
      planService,
      dialog,
      entityService,
      oaService,
      departmentService,
      activatedRoute,
      scheduleService,
      platformLocation,
      staffgridService,
      routerHistoryTrackerService,
      matSnackBar);
    component.currentComponent=planSetupComponent;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });
    spyOn(component.currentComponent,'checkIfPlanEdited').and.returnValue(true);
    spyOn(component.currentComponent,'mandatoryCheckSNFailed').and.returnValue(true);
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
    expect(component.setSelectedValue).toHaveBeenCalledWith('StaffPlan');
  });

 it('plan setup should navigate to staff manager if mandatory check success', function () {
    spyOn(component,'setSelectedValue');
    let planService: PlanService;
    let entityService: EntityService;
    let departmentService: DepartmentService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let platformLocation: PlatformLocation;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let staffgridService:StaffGridService;
    let matSnackBar: MatSnackBar;
    let planSetupComponent: PlanSetupComponent=new PlanSetupComponent(router,
      planService,
      dialog,
      entityService,
      oaService,
      departmentService,
      activatedRoute,
      scheduleService,
      platformLocation,
      staffgridService,
      routerHistoryTrackerService,
      matSnackBar);
    planSetupComponent.plan=new PlanDetails();
    component.currentComponent=planSetupComponent;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });
    spyOn(component.currentComponent,'checkIfPlanEdited').and.returnValue(true);
    spyOn(component.currentComponent,'mandatoryCheckSNFailed').and.returnValue(false);
    spyOn(component.currentComponent,'saveAndNextPlanDetails');
    component.openDialog(event);
    expect(component.setSelectedValue).toHaveBeenCalledWith('StaffMgmt');
  });

  it('OGA should not navigate to staff manager if validateActivities check failed', function () {
    spyOn(component,'setSelectedValue');
    let httpClient:HttpClient;
    let pageRedirectionService: PageRedirectionService;
    let planService: PlanService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let renderer: Renderer2;
    const platformLocationSpyObj: SpyObj<PlatformLocation> = jasmine.createSpyObj(['onPopState']);
    let offGridActivitiesComponent: OffGridActivitiesComponent=new OffGridActivitiesComponent(
      planService,
      router,
      dialog,
      oaService,
      scheduleService,
      renderer,
      platformLocationSpyObj,
      activatedRoute,
      routerHistoryTrackerService
      );
      offGridActivitiesComponent.isPlanEdited=true;
    component.currentComponent=offGridActivitiesComponent;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });
    spyOn(component.currentComponent,'validateActivities').and.returnValue(true);
    spyOn(component.currentComponent,'saveAndNextPlanDetails');
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
    expect(component.setSelectedValue).toHaveBeenCalledWith('StaffPlan');
  });

 it('OGA page should navigate to staff manager if validateActivities check success', function () {
    spyOn(component,'setSelectedValue');
    let httpClient:HttpClient;
    let pageRedirectionService: PageRedirectionService;
    let planService: PlanService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let renderer: Renderer2;

    const platformLocationSpyObj: SpyObj<PlatformLocation> = jasmine.createSpyObj(['onPopState']);
    let offGridActivitiesComponent: OffGridActivitiesComponent=new OffGridActivitiesComponent(
      planService,
      router,
      dialog,
      oaService,
      scheduleService,
      renderer,
      platformLocationSpyObj,
      activatedRoute,
      routerHistoryTrackerService
      );
      offGridActivitiesComponent.isPlanEdited=true;
    component.currentComponent=offGridActivitiesComponent;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });
    spyOn(component.currentComponent,'validateActivities').and.returnValue(false);
    spyOn(component.currentComponent,'savePlanDetails');
    component.openDialog(event);
    expect(component.setSelectedValue).toHaveBeenCalledWith('StaffMgmt');
  });

  it('On staff planner tile click from OGA and user confirm for save , if validateActivities check failed should got to home page', function () {
    spyOn(component,'setSelectedValue');
    let httpClient:HttpClient;
    let pageRedirectionService: PageRedirectionService;
    let planService: PlanService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let renderer: Renderer2;
    const platformLocationSpyObj: SpyObj<PlatformLocation> = jasmine.createSpyObj(['onPopState']);
    let offGridActivitiesComponent: OffGridActivitiesComponent=new OffGridActivitiesComponent(
      planService,
      router,
      dialog,
      oaService,
      scheduleService,
      renderer,
      platformLocationSpyObj,
      activatedRoute,
      routerHistoryTrackerService
      );
      offGridActivitiesComponent.isPlanEdited=true;
    component.currentComponent=offGridActivitiesComponent;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });
    spyOn(component.currentComponent,'validateActivities').and.returnValue(true);
    spyOn(component.currentComponent,'saveAndNextPlanDetails');
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
    expect(component.setSelectedValue).toHaveBeenCalledWith('StaffPlan');
  });

 it('On staff planner tile click from OGA and user confirm for save , if validateActivities check success should got to home page', function () {
    spyOn(component,'setSelectedValue');
    let httpClient:HttpClient;
    let pageRedirectionService: PageRedirectionService;
    let planService: PlanService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let renderer: Renderer2;

    const platformLocationSpyObj: SpyObj<PlatformLocation> = jasmine.createSpyObj(['onPopState']);
    let offGridActivitiesComponent: OffGridActivitiesComponent=new OffGridActivitiesComponent(
      planService,
      router,
      dialog,
      oaService,
      scheduleService,
      renderer,
      platformLocationSpyObj,
      activatedRoute,
      routerHistoryTrackerService
      );
      offGridActivitiesComponent.isPlanEdited=true;
    component.currentComponent=offGridActivitiesComponent;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });
    spyOn(component.currentComponent,'validateActivities').and.returnValue(false);
    spyOn(component.currentComponent,'savePlanDetails');
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
    expect(component.setSelectedValue).toHaveBeenCalledWith('StaffPlan');
  });

  it('On staff planner tile click from OGA and user confirm not to save ,should redirect to home page', function () {
    spyOn(component,'setSelectedValue');
    let planService: PlanService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let renderer: Renderer2;
    const platformLocationSpyObj: SpyObj<PlatformLocation> = jasmine.createSpyObj(['onPopState']);
    let offGridActivitiesComponent: OffGridActivitiesComponent=new OffGridActivitiesComponent(
      planService,
      router,
      dialog,
      oaService,
      scheduleService,
      renderer,
      platformLocationSpyObj,
      activatedRoute,
      routerHistoryTrackerService
      );
      offGridActivitiesComponent.isPlanEdited=true;
    component.currentComponent=offGridActivitiesComponent;

    spyOn(component.currentComponent,'validateActivities').and.returnValue(true);
    spyOn(component.currentComponent,'saveAndNextPlanDetails');
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
  });

  it('On staff planner tile click from OGA and if plan not edited,should redirect to home page', function () {
    spyOn(component,'setSelectedValue');
    let planService: PlanService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let renderer: Renderer2;
    const platformLocationSpyObj: SpyObj<PlatformLocation> = jasmine.createSpyObj(['onPopState']);
    let offGridActivitiesComponent: OffGridActivitiesComponent=new OffGridActivitiesComponent(
      planService,
      router,
      dialog,
      oaService,
      scheduleService,
      renderer,
      platformLocationSpyObj,
      activatedRoute,
      routerHistoryTrackerService
      );
      offGridActivitiesComponent.isPlanEdited=false;
    component.currentComponent=offGridActivitiesComponent;

    spyOn(component.currentComponent,'validateActivities').and.returnValue(true);
    spyOn(component.currentComponent,'saveAndNextPlanDetails');
    component.openDialogForplanner(event);
    expect(component.setSelectedValue).toHaveBeenCalledWith('StaffPlan');
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
  });


  it('Schedule page should navigate to staff manager if validateExistingSchedules check success', function () {
    spyOn(component,'setSelectedValue');
    let httpClient:HttpClient;
    let pageRedirectionService: PageRedirectionService;
    let planService: PlanService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let changeDetectorRef: ChangeDetectorRef;
    const platformLocationSpyObj: SpyObj<PlatformLocation> = jasmine.createSpyObj(['onPopState']);
    let staffScheduleComponent: StaffScheduleComponent=new StaffScheduleComponent(
      planService,
      scheduleService,
      router,
      changeDetectorRef,
      dialog,
      oaService,
      platformLocationSpyObj,
      activatedRoute,
      routerHistoryTrackerService
      );
    component.currentComponent=staffScheduleComponent;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });

    spyOn(component.currentComponent,'checkIfPlanEdited').and.returnValue(true);
    spyOn(component.currentComponent,'validateExistingSchedules').and.returnValue(false);
    spyOn(component.currentComponent,'saveAndNextScheduleDetails');
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
  });

  it('Schedule page should navigate to staff manager if validateExistingSchedules check failed', function () {
    spyOn(component,'setSelectedValue');
    let httpClient:HttpClient;
    let pageRedirectionService: PageRedirectionService;
    let planService: PlanService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let changeDetectorRef: ChangeDetectorRef;
    const platformLocationSpyObj: SpyObj<PlatformLocation> = jasmine.createSpyObj(['onPopState']);
    let staffScheduleComponent: StaffScheduleComponent=new StaffScheduleComponent(
      planService,
      scheduleService,
      router,
      changeDetectorRef,
      dialog,
      oaService,
      platformLocationSpyObj,
      activatedRoute,
      routerHistoryTrackerService
      );
    component.currentComponent=staffScheduleComponent;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });

    spyOn(component.currentComponent,'checkIfPlanEdited').and.returnValue(true);
    spyOn(component.currentComponent,'validateExistingSchedules').and.returnValue(true);
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
    expect(component.setSelectedValue).toHaveBeenCalledWith('StaffPlan');
  });
  it('Schedule page should navigate to staff planner if validateExistingSchedules check success', function () {
    spyOn(component,'setSelectedValue');
    let httpClient:HttpClient;
    let pageRedirectionService: PageRedirectionService;
    let planService: PlanService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let changeDetectorRef: ChangeDetectorRef;
    const platformLocationSpyObj: SpyObj<PlatformLocation> = jasmine.createSpyObj(['onPopState']);
    let staffScheduleComponent: StaffScheduleComponent=new StaffScheduleComponent(
      planService,
      scheduleService,
      router,
      changeDetectorRef,
      dialog,
      oaService,
      platformLocationSpyObj,
      activatedRoute,
      routerHistoryTrackerService
      );
    component.currentComponent=staffScheduleComponent;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });

    spyOn(component.currentComponent,'checkIfPlanEdited').and.returnValue(true);
    spyOn(component.currentComponent,'validateExistingSchedules').and.returnValue(false);
    spyOn(component.currentComponent,'saveAndNextScheduleDetails');
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
  });

  it('Schedule page should navigate to staff planner if validateExistingSchedules check failed', function () {
    spyOn(component,'setSelectedValue');
    let httpClient:HttpClient;
    let pageRedirectionService: PageRedirectionService;
    let planService: PlanService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let changeDetectorRef: ChangeDetectorRef;
    const platformLocationSpyObj: SpyObj<PlatformLocation> = jasmine.createSpyObj(['onPopState']);
    let staffScheduleComponent: StaffScheduleComponent=new StaffScheduleComponent(
      planService,
      scheduleService,
      router,
      changeDetectorRef,
      dialog,
      oaService,
      platformLocationSpyObj,
      activatedRoute,
      routerHistoryTrackerService
      );
    component.currentComponent=staffScheduleComponent;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });

    spyOn(component.currentComponent,'checkIfPlanEdited').and.returnValue(true);
    spyOn(component.currentComponent,'validateExistingSchedules').and.returnValue(true);
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
    expect(component.setSelectedValue).toHaveBeenCalledWith('StaffPlan');
  });

  it('Schedule page should navigate to staff planner if user select no', function () {
    spyOn(component,'setSelectedValue');
    let httpClient:HttpClient;
    let pageRedirectionService: PageRedirectionService;
    let planService: PlanService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let changeDetectorRef: ChangeDetectorRef;
    const platformLocationSpyObj: SpyObj<PlatformLocation> = jasmine.createSpyObj(['onPopState']);
    let staffScheduleComponent: StaffScheduleComponent=new StaffScheduleComponent(
      planService,
      scheduleService,
      router,
      changeDetectorRef,
      dialog,
      oaService,
      platformLocationSpyObj,
      activatedRoute,
      routerHistoryTrackerService
      );
    component.currentComponent=staffScheduleComponent;

    spyOn(component.currentComponent,'checkIfPlanEdited').and.returnValue(true);
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
  });

  it('Schedule page should navigate to staff planner -if plan not edited', function () {
    spyOn(component,'setSelectedValue');
    let httpClient:HttpClient;
    let pageRedirectionService: PageRedirectionService;
    let planService: PlanService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let changeDetectorRef: ChangeDetectorRef;
    const platformLocationSpyObj: SpyObj<PlatformLocation> = jasmine.createSpyObj(['onPopState']);
    let staffScheduleComponent: StaffScheduleComponent=new StaffScheduleComponent(
      planService,
      scheduleService,
      router,
      changeDetectorRef,
      dialog,
      oaService,
      platformLocationSpyObj,
      activatedRoute,
      routerHistoryTrackerService
      );
    component.currentComponent=staffScheduleComponent;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });

    spyOn(component.currentComponent,'checkIfPlanEdited').and.returnValue(false);
    spyOn(component.currentComponent,'validateExistingSchedules').and.returnValue(true);
    component.openDialogForplanner(event);
    expect(component.setSelectedValue).toHaveBeenCalledWith('StaffPlan');
  });

  it('StaffGrid page should navigate to staff manager if user click on manager tile and answers promt as yes', function () {
    spyOn(component,'setSelectedValue');
    let planService: PlanService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let changeDetectorRef: ChangeDetectorRef;
    let staffGridService:StaffGridService;
    const platformLocationSpyObj: SpyObj<PlatformLocation> = jasmine.createSpyObj(['onPopState']);

    let staffingGridComponent: StaffingGridComponent=new StaffingGridComponent(
      dialog,
      activatedRoute,
      scheduleService,
      staffGridService,
      router,
      planService,
      changeDetectorRef,
      oaService,
      platformLocationSpyObj,
      routerHistoryTrackerService
      );
    component.currentComponent=staffingGridComponent;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });

    spyOn(component.currentComponent,'checkIfPlanEdited').and.returnValue(true);
    spyOn(component.currentComponent,'saveAndExitStaffGridDetails');
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
  });

  it('StaffGrid page should navigate to staff planner if user click on manager tile and answers promt as yes', function () {
    spyOn(component,'setSelectedValue');
    let planService: PlanService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let changeDetectorRef: ChangeDetectorRef;
    let staffGridService:StaffGridService;
    const platformLocationSpyObj: SpyObj<PlatformLocation> = jasmine.createSpyObj(['onPopState']);

    let staffingGridComponent: StaffingGridComponent=new StaffingGridComponent(
      dialog,
      activatedRoute,
      scheduleService,
      staffGridService,
      router,
      planService,
      changeDetectorRef,
      oaService,
      platformLocationSpyObj,
      routerHistoryTrackerService
      );
    component.currentComponent=staffingGridComponent;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });

    spyOn(component.currentComponent,'checkIfPlanEdited').and.returnValue(true);
    spyOn(component.currentComponent,'saveAndExitStaffGridDetails');
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
  });

  it('StaffGrid page should navigate to staff planner if user click on planner tile and no changes to plan', function () {
    spyOn(component,'setSelectedValue');
    let planService: PlanService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let changeDetectorRef: ChangeDetectorRef;
    let staffGridService:StaffGridService;
    const platformLocationSpyObj: SpyObj<PlatformLocation> = jasmine.createSpyObj(['onPopState']);

    let staffingGridComponent: StaffingGridComponent=new StaffingGridComponent(
      dialog,
      activatedRoute,
      scheduleService,
      staffGridService,
      router,
      planService,
      changeDetectorRef,
      oaService,
      platformLocationSpyObj,
      routerHistoryTrackerService
      );
    component.currentComponent=staffingGridComponent;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(null);// save option
        }
      }
    });

    spyOn(component.currentComponent,'checkIfPlanEdited').and.returnValue(false);
    spyOn(component.currentComponent,'saveAndExitStaffGridDetails');
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
  });

  xit('Calculator page should navigate to staff manager if user click on manager tile and answers promt as yes', function () {
    spyOn(component,'setSelectedValue');
    let snackBar:MatSnackBar;
    let httpClient:HttpClient;
    let pageRedirectionService: PageRedirectionService;
    let planService: PlanService;
    let userService: UserService=new UserService(httpClient,pageRedirectionService);
    let dialog: MatDialog;
    let activatedRoute:ActivatedRoute;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let staffGridService:StaffGridService;
    const platformLocationSpyObj: SpyObj<PlatformLocation> = jasmine.createSpyObj(['onPopState']);
    let staffVarianceService:StaffVarianceService;
    let predictedDataService:PredictedDataService;
    let router = fixture.debugElement.injector.get(Router);
    console.log(router);
    let staffManagerPlanComponent: StaffManagerPlanComponent=new StaffManagerPlanComponent(
      activatedRoute,
      planService,
      staffVarianceService,
      oaService,
      scheduleService,
      staffGridService,
      dialog,
      router,
      platformLocationSpyObj,
      pageRedirectionService,
      predictedDataService,
      routerHistoryTrackerService,
      userService,
      snackBar
      );
    component.currentComponent=staffManagerPlanComponent;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });

    spyOn(component.currentComponent,'checkIfPlanEdited').and.returnValue(true);
    spyOn(component.currentComponent,'saveAndExitCheckForError');
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to staff manager without prompting dialog box', function () {
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(flag);
        }
      }
    });
    spyOn(component,'setSelectedValue');
    component.currentComponent=currentComponentObj;
    event.view.location.hash = '#/plan-setup';
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
    expect(component.setSelectedValue).toHaveBeenCalled();
  });
  it('should navigate to staff manager without prompting dialog box15', function () {
    flag=false;
    spyOn(component,'setSelectedValue');
    component.currentComponent=currentComponentObj;
    event.view.location.hash = '#/plan-setup';
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
    expect(component.setSelectedValue).toHaveBeenCalled();
  });
  it('should navigate to staff manager without prompting dialog box16', function () {
    spyOn(component,'setSelectedValue');
    currentComponentObj.isPlanEdited=false;
    component.currentComponent=currentComponentObj;
    event.view.location.hash = '#/plan-setup';
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
    expect(component.setSelectedValue).toHaveBeenCalled();
  });
  it('should navigate to staff manager without prompting dialog box2', function () {
    currentComponentObj.isPlanEdited=true;
    component.currentComponent=currentComponentObj;
    event.view.location.hash='#/off-grid-activities';
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
  });
  it('should navigate to staff manager without prompting dialog box3', function () {
    flag=false;
    currentComponentObj.isPlanEdited=true;
    component.currentComponent=currentComponentObj;
    event.view.location.hash='#/off-grid-activities';
    spyOn(component,'setSelectedValue');
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
    expect(component.setSelectedValue).toHaveBeenCalled()
  });
  it('should navigate to staff manager without prompting dialog box4', function () {
    currentComponentObj.isPlanEdited=false;
    component.currentComponent=currentComponentObj;
    event.view.location.hash='#/off-grid-activities';
    //spyOn(component,'openTileNavigationDialog');
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalledWith(['/staff-manager']);
    expect(component.openTileNavigationDialog).not.toHaveBeenCalled;
  });
  it('should navigate to staff manager without prompting dialog box5', function () {
    currentComponentObj.isPlanEdited=true;
    component.currentComponent=currentComponentObj;
    event.view.location.hash='#/staff-schedule';
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
  });
  it('should navigate to staff manager without prompting dialog box6', function () {
    flag=false;
    currentComponentObj.isPlanEdited=true;
    component.currentComponent=currentComponentObj;
    event.view.location.hash='#/staff-schedule';
    spyOn(component,'setSelectedValue');
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
    expect(component.setSelectedValue).toHaveBeenCalled()
  });
  it('should navigate to staff manager without prompting dialog box7', function () {
    currentComponentObj.isPlanEdited=false;
    component.currentComponent=currentComponentObj;
    event.view.location.hash='#/staff-schedule';
    //spyOn(component,'openTileNavigationDialog');
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalledWith(['/staff-manager']);
    expect(component.openTileNavigationDialog).not.toHaveBeenCalled;
  });
  it('should navigate to staff manager without prompting dialog box8', function () {
    currentComponentObj.isPlanEdited=true;
    component.currentComponent=currentComponentObj;
    event.view.location.hash='#/staffing-grid';
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled()
  });
  it('should navigate to staff manager without prompting dialog box9', function () {
    flag = false;
    currentComponentObj.isPlanEdited = true;
    component.currentComponent=currentComponentObj;
    event.view.location.hash='#/staffing-grid';
    spyOn(component,'setSelectedValue');
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled()
    expect(component.setSelectedValue).toHaveBeenCalled()
  });
  it('should navigate to staff manager without prompting dialog box10', function () {
    currentComponentObj.isPlanEdited=false;
    component.currentComponent=currentComponentObj;
    event.view.location.hash='#/staffing-grid';
    //spyOn(component,'openTileNavigationDialog');
    component.openDialog(event);
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
    expect(component.openTileNavigationDialog).not.toHaveBeenCalled;
  });
  it('should navigate to ', function () {
    event.view.location.hash='#/plan-manager';
    component.currentComponent=currentComponentObj;
    component.openDialog(event);
  });
  it('should navigate to 2', function () {
    component.planService.selectedPlanAction='In Process';
    event.view.location.hash='#/In Process';
    component.currentComponent=currentComponentObj;
    component.openDialog(event);
  });
  it('should open tile navigation ', function () {
    component.planService.selectedPlanAction='Active';
    //spyOn(component,'openTileNavigationDialog');
    component.openTileNavigationDialog();
    expect(routerSpyObj.navigate).not.toHaveBeenCalled();
    expect(component.openTileNavigationDialog).toHaveBeenCalled;
  });

  it('should openDialog for plan setup --  save the plan if edited and validation succeed', function (){
    flag=true;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });
    spyOn(component,'setSelectedValue');
    event.view.location.hash='#/plan-setup?';

    planSetupPlanCompSpyObj.mandatoryCheckSNFailed.and.returnValue(false);
    planSetupPlanCompSpyObj.checkIfPlanEdited.and.returnValue(true);
    planSetupPlanCompSpyObj.objSavePlanParams=new SavePlanParams();
    planSetupPlanCompSpyObj.plan=new PlanDetails();

    component.currentComponent=planSetupPlanCompSpyObj;
    component.openDialog(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
    expect(component.setSelectedValue).toHaveBeenCalled();
  });

  it('should openDialog for plan setup -- dont save the plan if edited and validation fails', function (){
    flag=true;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });
    spyOn(component,'setSelectedValue');
    event.view.location.hash='#/plan-setup';

    planSetupPlanCompSpyObj.mandatoryCheckSNFailed.and.returnValue(true);
    planSetupPlanCompSpyObj.checkIfPlanEdited.and.returnValue(true);
    planSetupPlanCompSpyObj.objSavePlanParams=new SavePlanParams();
    planSetupPlanCompSpyObj.plan=new PlanDetails();

    component.currentComponent=planSetupPlanCompSpyObj;
    component.openDialog(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
    expect(component.setSelectedValue).toHaveBeenCalled();
  });


  it('should openDialogForplanner for plan setup -- dont save the plan if edited and validation fails', function (){
    flag=true;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });
    spyOn(component,'setSelectedValue');
    event.view.location.hash='#/plan-setup?';

    planSetupPlanCompSpyObj.mandatoryCheckSNFailed.and.returnValue(true);
    planSetupPlanCompSpyObj.checkIfPlanEdited.and.returnValue(true);
    planSetupPlanCompSpyObj.objSavePlanParams=new SavePlanParams();
    planSetupPlanCompSpyObj.plan=new PlanDetails();

    component.currentComponent=planSetupPlanCompSpyObj;
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
    expect(component.setSelectedValue).toHaveBeenCalled();
  });
  it('should openDialogForplanner for plan setup --  save the plan if edited and validation succeed', function (){
    flag=true;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);// save option
        }
      }
    });
    spyOn(component,'setSelectedValue');
    event.view.location.hash='#/plan-setup?';

    planSetupPlanCompSpyObj.mandatoryCheckSNFailed.and.returnValue(false);
    planSetupPlanCompSpyObj.checkIfPlanEdited.and.returnValue(true);
    planSetupPlanCompSpyObj.objSavePlanParams=new SavePlanParams();
    planSetupPlanCompSpyObj.plan=new PlanDetails();

    component.currentComponent=planSetupPlanCompSpyObj;
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
    expect(component.setSelectedValue).toHaveBeenCalled();
  });
  it('should openDialogForplanner for plan setup --  user says No for save', function (){
    flag=true;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(flag);// cancels option
        }
      }
    });
    spyOn(component,'setSelectedValue');
    event.view.location.hash='#/plan-setup?';

    planSetupPlanCompSpyObj.checkIfPlanEdited.and.returnValue(true);

    component.currentComponent=planSetupPlanCompSpyObj;
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
    expect(component.setSelectedValue).toHaveBeenCalled();
  });

  it('should openDialogForplanner for plan setup -- should not save the plan if not edited', function (){
    flag=true;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(flag);
        }
      }
    });
    spyOn(component,'setSelectedValue');
    event.view.location.hash='#/plan-setup?';

    planSetupPlanCompSpyObj.mandatoryCheckSNFailed.and.returnValue(true);
    planSetupPlanCompSpyObj.checkIfPlanEdited.and.returnValue(false);

    component.currentComponent=planSetupPlanCompSpyObj;
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
    expect(component.setSelectedValue).toHaveBeenCalled();
  });

  it('should not open dialog for offgridactivities --if plan not edited', function (){
    flag=true;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(flag);
        }
      }
    });
    spyOn(component,'setSelectedValue');
    event.view.location.hash='#/off-grid-activities';
    oGACompSpyObj.isPlanEdited=false;

    component.currentComponent=oGACompSpyObj;
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
    expect(component.setSelectedValue).toHaveBeenCalled();
  });

  it('should openDialogForplanner for off-grid-activities if plan is edited -- and user slect to not save', function (){
    flag=true;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(flag);
        }
      }
    });
    spyOn(component,'setSelectedValue');
    event.view.location.hash='#/off-grid-activities';
    oGACompSpyObj.isPlanEdited=true;

    component.currentComponent=oGACompSpyObj;
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
  });

  it('should openDialogForplanner for off-grid-activities if plan is edited -- and user slect to save data-- validation success', function (){
    flag=true;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2); //select for savae value
        }
      }
    });
    spyOn(component,'setSelectedValue');
    event.view.location.hash='#/off-grid-activities';

    oGACompSpyObj.validateActivities.and.returnValue(true);
    oGACompSpyObj.isPlanEdited=true;

    component.currentComponent=oGACompSpyObj;
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
    expect(component.setSelectedValue).toHaveBeenCalled();
  });

  it('should openDialogForplanner for off-grid-activities if plan is edited -- and user slect to save data-- validation fails', function (){
    flag=true;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2); //select for savae value
        }
      }
    });
    spyOn(component,'setSelectedValue');
    event.view.location.hash='#/off-grid-activities';

    oGACompSpyObj.validateActivities.and.returnValue(false);
    oGACompSpyObj.isPlanEdited=true;

    component.currentComponent=oGACompSpyObj;
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
    expect(component.setSelectedValue).toHaveBeenCalled();
  });
  it('should not open dialog for staff-schedule --if plan not edited', function (){
    flag=true;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(flag);
        }
      }
    });
    spyOn(component,'setSelectedValue');
    event.view.location.hash='#/staff-schedule';
    staffScheduleSpyObj.checkIfPlanEdited.and.returnValue(false);


    component.currentComponent=staffScheduleSpyObj;
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
    expect(component.setSelectedValue).toHaveBeenCalled();
  });

  it('should openDialogForplanner for staff-schedule if plan is edited -- and user slect to not save', function (){
    flag=false;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(flag);
        }
      }
    });
    spyOn(component,'setSelectedValue');
    event.view.location.hash='#/staff-schedule';

     staffScheduleSpyObj.validateExistingSchedules.and.returnValue(true);
     staffScheduleSpyObj.checkIfPlanEdited.and.returnValue(true);

    component.currentComponent=staffScheduleSpyObj;
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
  });

  it('should openDialogForplanner for staff-schedule if plan is edited -- and user slect to save data-- validation success', function (){
    flag=true;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2); //select for savae value
        }
      }
    });
    spyOn(component,'setSelectedValue');
    event.view.location.hash='#/staff-schedule';

     staffScheduleSpyObj.validateExistingSchedules.and.returnValue(true);
     staffScheduleSpyObj.checkIfPlanEdited.and.returnValue(true);

    component.currentComponent=staffScheduleSpyObj;
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
    expect(component.setSelectedValue).toHaveBeenCalled();
  });

  it('should openDialogForplanner for staff-schedule if plan is edited -- and user slect to save data-- validation fails', function (){
    flag=true;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2); //select for savae value
        }
      }
    });
    spyOn(component,'setSelectedValue');
    event.view.location.hash='#/staff-schedule';

    staffScheduleSpyObj.validateExistingSchedules.and.returnValue(false);
    staffScheduleSpyObj.checkIfPlanEdited.and.returnValue(true);

    component.currentComponent=staffScheduleSpyObj;
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;

  });
  it('should not open dialog for staff-schedule --if plan not edited', function (){
    flag=true;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(flag);
        }
      }
    });
    spyOn(component,'setSelectedValue');
    event.view.location.hash='#/staffing-grid';
    staffgridSpyObj.checkIfPlanEdited.and.returnValue(false);
    component.currentComponent=staffgridSpyObj;
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
    expect(component.setSelectedValue).toHaveBeenCalled();
  });

  it('should openDialogForplanner for staff-schedule if plan is edited -- and user slect to not save', function (){
    flag=false;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(flag);
        }
      }
    });
    spyOn(component,'setSelectedValue');
    event.view.location.hash='#/staffing-grid';
    staffgridSpyObj.checkIfPlanEdited.and.returnValue(true);
    component.currentComponent=staffgridSpyObj;
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
  });

  it('should openDialogForplanner for staff-schedule if plan is edited -- and user slect to save data', function (){
    flag=true;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2); //select for save value
        }
      }
    });
    spyOn(component,'setSelectedValue');
    event.view.location.hash='#/staffing-grid';
    staffgridSpyObj.checkIfPlanEdited.and.returnValue(true);
    component.currentComponent=staffgridSpyObj;
    component.openDialogForplanner(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
  });

  it('should openDialog for staff-schedule if plan is edited -- and user slect to save data', function (){
    flag=true;
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2); //select for save value
        }
      }
    });
    spyOn(component,'setSelectedValue');
    event.view.location.hash='#/staffing-grid';
    staffgridSpyObj.checkIfPlanEdited.and.returnValue(true);
    component.currentComponent=staffgridSpyObj;
    component.openDialog(event);
    expect(routerSpyObj.navigate).toHaveBeenCalled;
  });

  it('Should redirect', function(){
    let planService: PlanService;
    let entityService: EntityService;
    let departmentService: DepartmentService;
    let dialog: MatDialog;
    let router: Router;
    let activatedRoute:ActivatedRoute;
    let platformLocation: PlatformLocation;
    let oaService:OAService;
    let scheduleService:ScheduleService;
    let routerHistoryTrackerService:RouterHistoryTrackerService;
    let staffgridService:StaffGridService;
    let matSnackBar : MatSnackBar;
    let planSetupComponent: PlanSetupComponent=new PlanSetupComponent(router,
      planService,
      dialog,
      entityService,
      oaService,
      departmentService,
      activatedRoute,
      scheduleService,
      platformLocation,
      staffgridService,
      routerHistoryTrackerService,
      matSnackBar);
    component.currentComponent=planSetupComponent;
    spyOn(component.currentComponent,'checkIfPlanEdited').and.returnValue(true);
   (component as any).redirect();
   (component as any).checkForLoginAttribute();
   (component as any).alertSessionExpires();
  });
  it('should onDeactivate', function(){
    component.onDeactivate(component);
    expect(component.onDeactivate).toHaveBeenCalled;
  });

  it('should check hostlistener', function(){
    document.dispatchEvent(new MouseEvent('click'));
    const event = new Event('keydown', { bubbles: true });
    spyOn(event, 'preventDefault');
    document.dispatchEvent(event);
  });
});
