import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {PlanSetupComponent} from './plan-setup.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {PlanService} from '../../../shared/service/plan-service';
import {EntityService} from '../../../shared/service/entity-service';
import {DepartmentService} from '../../../shared/service/department-service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {entityDetailsData} from '../../../shared/service/fixtures/entityDetailsData';
import {censusData, planDetailsData} from '../../../shared/service/fixtures/plan-details-data';
import {deptDetails} from '../../../shared/service/fixtures/dept-details-data';
import {planDetailsDataService} from '../../../shared/service/service-data/plan-data-db';
import {OAService} from '../../../shared/service/oa-service';
import {oaSuggestedDataSample} from '../../../shared/service/fixtures/oa-suggested-data-sample';
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;
import {CensusComponent} from '../components/census/census.component';
import {NonVariableDepartmentPosition} from '../../../shared/domain/non-var-postn';
import {VariableDepartmet} from '../../../shared/domain/off-grid-activities';
import {NonVariablePosComponent} from '../components/non-variable-pos/non-variable-pos.component';
import {VariablePosComponent} from '../components/variable-pos/variable-pos.component';
import createSpy = jasmine.createSpy;
import {ConfirmWindowOptions} from '../../../shared/domain/plan-details';
import {ScheduleService} from '../../../shared/service/schedule-service';
import {staffScheduleData} from '../../../shared/service/fixtures/staff-schedule-data';
import {StaffSchedule} from '../../../shared/domain/staff-schedule';
import {RouterHistoryTrackerService} from "../../../shared/service/router-history-tracker.service";
import {MatAutocomplete, MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatTooltip, MatTooltipModule} from "@angular/material/tooltip";
import { UserAccess } from 'src/app/shared/domain/userAccess';
import { corpDetailsData } from 'src/app/shared/service/fixtures/corp-details-data';
import {StaffGridService} from '../../../shared/service/Staffgrid-service';
import {staffGridCensusData} from '../../../shared/service/fixtures/staff-grid-census-data';
import {MatSnackBar} from '@angular/material/snack-bar';
import {customUserAccessData} from '../../../shared/service/fixtures/user-access-data';

describe('PlanSetupComponent', () => {
  let fixture: ComponentFixture<PlanSetupComponent>;
  let component: PlanSetupComponent;
  let mockRouter;
  let mockHttp;
  let systemOptionValuesFromDTM = {
    data : 1
  }
  let systemOptionValuesFromDTM2 = {
    data : 2
  }
  const testStaffGridCensus = staffGridCensusData();
  let staffGridServiceSpyObj: SpyObj<StaffGridService>=createSpyObj(['autoSaveInterval', 'getStaffGridDetails']);
  staffGridServiceSpyObj.getStaffGridDetails.and.returnValue(of(testStaffGridCensus));
  const planService: SpyObj<PlanService> = createSpyObj('PlanService', ['getJobCategoryData', 'getPlandetails', 'createPlan', 'getPlans', 'getAllPlans', 'removePlanKeyFromSessionAttribute', 'getSystemOptionValuesFromDTM', 'getAllPlansName', 'updateSessionForPlan']);
  planService.getSystemOptionValuesFromDTM.and.returnValue(of(systemOptionValuesFromDTM.data));
  const entityService: SpyObj<EntityService> = createSpyObj('PlanService', ['getFacility']);
  const departmentService: SpyObj<DepartmentService> = createSpyObj('PlanService', ['getDepts']);
  let mockActivatedRoute = jasmine.createSpyObj(['queryParamMap', 'set', 'setItem']);
  const routerTracker: SpyObj<RouterHistoryTrackerService> = createSpyObj('RouterHistoryTrackerService', ['nextUrl']);
  let matDialogSpy: MatDialog;
  const testEvent = 1;
  let confirmSpy;
  let testEntityDetailsData = entityDetailsData();
  let testCheckBox: MatCheckboxChange;
  let testSDate: Date;
  let testEDate: Date;
  const deptDetailsData = deptDetails();
  let testPlanDetailsData = planDetailsData();
  const testPlanDetailsDataService = planDetailsDataService();
  const testStaffScheduleData = staffScheduleData();
  const oaServiceSpyObj: SpyObj<OAService> = createSpyObj('OAService', ['getOASuggestedData', 'getBudgetVolume', 'getHistoricVolume', 'getCumulativeVolume']);
  const scheduleServiceSpyObj: SpyObj<ScheduleService> = createSpyObj(['getScheduleDetails']);
  scheduleServiceSpyObj.getScheduleDetails.and.returnValue(of(testStaffScheduleData));
  let matsnackBar: SpyObj<MatSnackBar> = jasmine.createSpyObj(['dismiss', 'open']);
  let pageGroup = {
    selectedIndex: 1
  };
  let map;
  let flag = true;
  const mockMatDialog = jasmine.createSpyObj({
    afterClosed: createSpy('name', function () {
      return of();

    }).and.callThrough(), close: null, open: createSpy('open', function () {
      return this;
    })
  });
  mockMatDialog.componentInstance = {body: ''};
  const testOASuggestionData = oaSuggestedDataSample();
  planService.getJobCategoryData.and.returnValue(of());
  planService.updateSessionForPlan.and.returnValue(of());
  planService.getPlandetails.and.returnValue(of(testPlanDetailsData[0]));
  planService.getAllPlans.and.returnValue(of(testPlanDetailsDataService));
  planService.createPlan.and.returnValue(of(testPlanDetailsDataService[0]));
  planService.getPlans.and.returnValue(of(testPlanDetailsDataService));
  planService.getAllPlansName.and.returnValue(of(['test', 'test1', 'test2']));
  planService.removePlanKeyFromSessionAttribute.and.returnValue(of());
  entityService.getFacility.and.returnValue(of(testEntityDetailsData));
  departmentService.getDepts.and.returnValue(of(deptDetailsData));
  oaServiceSpyObj.getOASuggestedData.and.returnValue(of(testOASuggestionData[0]));
  oaServiceSpyObj.getBudgetVolume.and.returnValue(of());
  oaServiceSpyObj.getCumulativeVolume.and.returnValue(of());
  oaServiceSpyObj.getHistoricVolume.and.returnValue(of());
  const numberObj = {
    which: false,
    keyCode: 33,
    preventDefault: function () {

    }
  };
  beforeEach(waitForAsync(() => {
    confirmSpy = spyOn(window, 'confirm');
    testCheckBox = new MatCheckboxChange();
    matDialogSpy = jasmine.createSpyObj(['open']);
    map = (new Map<string, string>());
    map.set('plankey', '1');

    mockRouter = jasmine.createSpyObj(['navigate']);
    mockActivatedRoute = {
      queryParamMap: of(map)
    };
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(true);
        }
      }
    });
    TestBed.configureTestingModule({
      declarations: [PlanSetupComponent,
      CensusComponent,
        NonVariablePosComponent,
        VariablePosComponent
      ],
      providers: [{provide: Router, useValue: mockRouter}, {provide: HttpClient, useValue: mockHttp},
        {provide: ActivatedRoute, useValue: mockActivatedRoute},{provide: MatDialog, useValue: mockMatDialog},
        {provide: PlanService, useValue: planService},{provide: StaffGridService, useValue: staffGridServiceSpyObj}, {provide: EntityService, useValue: entityService}
        , {provide: DepartmentService, useValue: departmentService}, {provide: OAService, useValue: oaServiceSpyObj},
        {provide: MatDialog, useValue: mockMatDialog}, {provide: ScheduleService, useValue: scheduleServiceSpyObj},
        {provide: RouterHistoryTrackerService,useValue: routerTracker}, {provide:MatSnackBar,useValue:matsnackBar}],
      imports: [MatButtonModule, FormsModule, RouterModule, MatDatepickerModule, MatAutocompleteModule, ReactiveFormsModule,
        MatNativeDateModule, MatSelectModule, MatInputModule, BrowserAnimationsModule,MatTooltipModule],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]

    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanSetupComponent);
    component = fixture.componentInstance;
    component.censusData = TestBed.createComponent(CensusComponent).componentInstance;
    component.variablePos = TestBed.createComponent(VariablePosComponent).componentInstance;
    component.nonVariablePos = TestBed.createComponent(NonVariablePosComponent).componentInstance;
    let userAccess =new UserAccess;
    userAccess.department=deptDetails();
    userAccess.facility=entityDetailsData();
    userAccess.facility[0].id="1";
    userAccess.facility[0].corporationId="1";
    userAccess.department[0].facilityId="1";
    userAccess.department[0].key="1";
    localStorage.setItem('Corpid',"1");

    userAccess.corporation=corpDetailsData();
    sessionStorage.setItem("userAccess", JSON.stringify(userAccess));
    fixture.detectChanges();
    localStorage.setItem('plankey', '1');
    testPlanDetailsData = planDetailsData();
    let store = {};
    const mockSessionStorage = {
      getItem: (key: string): string => {
        return key in store ? store[key] : null;
      },
      setItem: (key: string, value: string) => {
        store[key] = `${value}`;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      }
    };
    // spyOn(sessionStorage,'setItem').and.callFake(mockSessionStorage.setItem);
  });

  it('should create', async () => {
    component.plan = testPlanDetailsData[0];
    component.plan.action = 'Active';
    component.planKey = null;
    spyOn(component, 'loadAllPlans');
    spyOn(component, 'getvariablePos');
    spyOn(component, 'loadDeptDetails');
    spyOn(component, 'loadFacilityDetails');
    spyOn(component, 'loadSchedulesForThePlan');
    await expect(component.ngOnInit()).toBeTruthy();
    expect(component.activeStatusValue).toBe('No');
    expect(component.loadFacilityDetails).toHaveBeenCalled();
    expect(component.loadDeptDetails).toHaveBeenCalled();
    expect(component.getvariablePos).toHaveBeenCalled();
    expect(component.plan.utilizedAverageVolumeBase).toEqual(1);
  });

  it('should testLowerBound', () => {
    component.plan = testPlanDetailsData[0];
    component.testLowerBound(testEvent);
    expect(component.plan.lowerEndTarget).toBe(testEvent);
  });

  it('should test lower bound', () => {
    component.testLowerBound(testEvent);
    localStorage.setItem('Corpid', 'testCorpId');
    localStorage.setItem('Departmentid', 'testDepartmentid');
    localStorage.setItem('Enitityid', 'testEnitityid');
    expect(component.plan.lowerEndTarget).toEqual(testEvent);
  });

  it('should test upper bound', () => {
    component.testUpperBound(testEvent);
    expect(component.plan.upperEndTarget).toEqual(testEvent);
  });

  it('should get Census min', () => {
    component.getCensusMin(testEvent);
    expect(component.plan.censusRange.minimumCensus).toEqual(testEvent);
  });
  it('should get census max', () => {
    component.getCensusMax(testEvent);
    expect(component.plan.censusRange.maximumCensus).toEqual(testEvent);
  });
  it('should get occurance', () => {
    const testEvent = ['1', '2'];
    component.getOccurance(testEvent);
    expect(component.plan.censusRange.occurrenceNumber).toEqual(testEvent);
  });
  it('should open model if plan name is null', () => {
    component.plan.name = null;
    component.openModal();
  });

  it('should compare two objects correctly ', () => {
    testEntityDetailsData = entityDetailsData();
    expect(component.compareObjects(testEntityDetailsData, testEntityDetailsData)).toBe(true);
  });
  it('should open dialog ', () => {
    spyOn(component,'checkIfPlanEdited').and.stub();
    component.openDialog();
    expect(localStorage.getItem('Corpid')).toBe('');
    expect(localStorage.getItem('Departmentid')).toBe('');
    expect(localStorage.getItem('Enitityid')).toBe('');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });
  it('should open dialog ', () => {
    spyOn(component,'checkIfPlanEdited').and.stub();
    spyOn(component, 'mandatoryCheckSNFailed').and.returnValue(false);
    component.openDialog();
    expect(localStorage.getItem('Corpid')).toBe('');
    expect(localStorage.getItem('Departmentid')).toBe('');
    expect(localStorage.getItem('Enitityid')).toBe('');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    expect(component.plan.censusRange.minimumCensus).toBe(component.cmin);

  });
  it('should open dialog ', () => {
    spyOn(component,'checkIfPlanEdited').and.stub();
    spyOn(component, 'mandatoryCheckSNFailed').and.returnValue(true);
    component.openDialog();
    expect(localStorage.getItem('Corpid')).toBe('');
    expect(localStorage.getItem('Departmentid')).toBe('');
    expect(localStorage.getItem('Enitityid')).toBe('');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should call open model function if plan name is null or undefined', () => {
    spyOn(component, 'openModal');
    component.plan.name = null;
    component.plan.utilizedAverageVolume = 1;
    component.plan.utilizedAverageVolumeBase = 1.1010;
    component.saveAndExitPlanDetails();
    component.saveAvgVolAndName();
    component.saveTotalAnnualHrsVariance();
    expect(planService.createPlan).toHaveBeenCalledWith(component.plan);
    expect(component.showMsg).toBe(true);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });
  it('should call open model function if plan name is null or undefined2', () => {
    spyOn(component, 'openModal');
    component.plan.name = null;
    component.saveAndExitPlanDetails();
    component.saveAvgVolAndName();
    component.saveTotalAnnualHrsVariance();
    expect(planService.createPlan).toHaveBeenCalledWith(component.plan);
    expect(component.showMsg).toBe(true);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should show an error message if end date was before start date after calling save and exit plan details', () => {
    component.plan.name = 'testName';
    testSDate = new Date(1);
    testEDate = new Date(2);
    component.plan.effectiveStartDate = testSDate;
    component.plan.effectiveEndDate = testEDate;
    component.saveAndExitPlanDetails();
    component.saveAvgVolAndName();
    component.saveTotalAnnualHrsVariance();
    expect(planService.createPlan).toHaveBeenCalledWith(component.plan);
  });

  it('should call open model function if plan name is null or undefined3', () => {
    component.plan.key = testPlanDetailsDataService[0].key;
    component.pageGroup.selectedIndex = 1;
    component.previousIndex = 0;
    component.plan.utilizedAverageVolume = 1;
    component.plan.utilizedAverageVolumeBase = 1.1010;
    component.saveAndNextPlanDetails();
    expect(planService.createPlan).toHaveBeenCalledWith(component.plan);
    expect(component.showMsg).toBe(true);
    expect(localStorage.getItem('plankey')).toBe(testPlanDetailsDataService[0].key);
  });

  it('should load all plans', () => {
    component.loadAllPlans();
    expect(planService.getAllPlansName).toHaveBeenCalled();
  });
  it('should load all plans and set plan key because it is null ', () => {
    map.set('plankey', null);
    component.loadAllPlans();
    expect(planService.getAllPlansName).toHaveBeenCalled();
    expect(component.planKey).toBe('1');
  });

  it('should get plan details when local storage plan key is not null', () => {
    map.set('plankey', null);
    localStorage.setItem('plankey', '1');
    component.getPlandetails();
    expect(planService.getPlandetails).toHaveBeenCalled();
  });
  it('should get plan details if plan key in local storage = \'\' ', () => {
    map.set('plankey', null);
    localStorage.setItem('plankey', '');
    spyOn(component, 'getformvalues');
    spyOn(component, 'loadFacilityDetails');
    spyOn(component, 'loadDeptDetails');
    component.getPlandetails();
    expect(component.getformvalues).toHaveBeenCalled();
    expect(component.loadFacilityDetails).toHaveBeenCalled();
    expect(component.loadDeptDetails).toHaveBeenCalled();
  });
  it('should load facility details', () => {
    map.set('plankey', null);
    localStorage.setItem('plankey', '');
    spyOn(component, 'getformvalues');
    spyOn(component, 'loadFacilityDetails');
    spyOn(component, 'loadDeptDetails');
    component.userAccess = customUserAccessData()[0];
    component.userAccess.featureToggle =true;
    component.getPlandetails();
    component.loadFacilityDetails();
    expect(component.getformvalues).toHaveBeenCalled();
    expect(component.loadFacilityDetails).toHaveBeenCalled();
    expect(component.loadDeptDetails).toHaveBeenCalled();
  });

  it('should get plan details if plan key in local storage does not equal null ', () => {
    localStorage.setItem('plankey', 'testKey');
    component.getPlandetails();
    expect(planService.getPlandetails).toHaveBeenCalled();
  });
  it('should update data form OA', () => {
    spyOn(component, 'loadOAPlanDataEntity').and.stub();
    spyOn(component, 'getSuggestedData').and.stub();
    component.plan.effectiveStartDate = testSDate;
    component.updateDataFromOA(false);
    expect(component.loadOAPlanDataEntity).not.toHaveBeenCalled();
    expect(component.getSuggestedData).not.toHaveBeenCalled();
  });

  it('should not update data form OA', () => {
    spyOn(component, 'loadOAPlanDataEntity').and.stub();
    spyOn(component, 'getSuggestedData').and.stub();
    component.updateDataFromOA(true);
    expect(component.loadOAPlanDataEntity).not.toHaveBeenCalled()
    expect(component.getSuggestedData).not.toHaveBeenCalled();
  });
  it('should check number only and return false', () => {
    expect(component.numberOnly(numberObj)).toBe(false);
  });
  it('should check number only and return false', () => {
    numberObj.keyCode = 58;
    expect(component.numberOnly(numberObj)).toBe(false);
  });

  it('should check number only and return false', () => {
    numberObj.which = true;
    numberObj.keyCode = 30;
    expect(component.numberOnly(numberObj)).toBe(true);
  });
  it('should compare entity objects and return true', () => {
    expect(component.compareEntityObjects(1, 1)).toBe(true);
  });
  it('should compare department objects and return true', () => {
    expect(component.compareDepartmentObjects(1, 1)).toBe(true);
  });
  it('should load form values', () => {
    localStorage.setItem('Corpid', 'testCorpId');
    localStorage.setItem('Departmentid', 'testDepartmentid');
    localStorage.setItem('Enitityid', 'testEnitityid');
    component.getformvalues();
    expect(component.plan.corporationId).toBe('testCorpId');
    expect(component.plan.departmentKey).toBe('testDepartmentid');
    expect(component.plan.facilityKey).toBe('testEnitityid');
  });
  // it('should load facility details', () => {
  //   entityService.getFacility.and.returnValue(of(testEntityDetailsData));
  //   component.loadFacilityDetails();
  //   expect(entityService.getFacility).toHaveBeenCalled();
  //   expect(component.entities).toBe(testEntityDetailsData);
  // });
  // it('should load department details', () => {
  //   component.loadDeptDetails();
  //   expect(departmentService.getDepts).toHaveBeenCalled();
  //   expect(component.departments).toBe(deptDetailsData);
  // });
  it('should load departments by entity', () => {
    component.userAccess=new UserAccess();
    component.userAccess.department=deptDetailsData;
    component.deptDetailsCodeList=["corpid","",""] ;
    component.entityModel="";
    let event = {
      option: {
        id: "1"
      }
    };
    component.LoadDepartmentsByEntity(event);
    expect(planService.getSystemOptionValuesFromDTM).toHaveBeenCalled();
  });
  it('should load departments by entity', () => {
    component.userAccess=new UserAccess();
    component.userAccess.department=deptDetailsData;
    component.deptDetailsCodeList=["corpid","",""] ;
    component.entityModel="";
    let event = {
      option: {
        id: "1"
      }
    };
    planService.getSystemOptionValuesFromDTM.and.returnValue(of(systemOptionValuesFromDTM2.data));
    component.LoadDepartmentsByEntity(event);
    expect(planService.getSystemOptionValuesFromDTM).toHaveBeenCalled();
  });
  it('should get entity value', () => {
    component.plan.facilityKey = testEntityDetailsData[0].id;
    component.entities = testEntityDetailsData;
    expect(component.getEntityval()).toBe(testEntityDetailsData[0].code + '-' + testEntityDetailsData[0].name);
  });
  it('should get department value', () => {
    const testDepartmentsData = {key: 'testDept_key', name: 'testDept_nm', code: 'testDept_cd', active_plan: null};
    component.departments = [testDepartmentsData];
    component.plan.departmentKey = 'testDept_key';
    expect(component.getDepartmentVal()).toBe('testDept_cd-testDept_nm');
  });
  it('should call onSubmit and navigate to home', () => {
    component.plan = testPlanDetailsData[0];
    component.onSubmit('Save-Exit');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });
  it('should call onSubmit and stop execution when plan total annual hours < 1 ', () => {
    spyOn(component, 'formatEffectiveDates');
    spyOn(component, 'saveAndExitPlanDetails');
    confirmSpy.and.returnValue(false);
    testPlanDetailsData[0].planCompleted = false;
    testPlanDetailsData[0].totalAnnualHours = -1;
    component.plan = testPlanDetailsData[0];
    component.onSubmit('Save-Exit');
    expect(component.formatEffectiveDates).toHaveBeenCalled();
    expect(component.isSaveExitBtnSubmit).toBe(false);
    expect(component.isSaveNextBtnSubmit).toBe(false);
    expect(component.saveAndExitPlanDetails).not.toHaveBeenCalled();
  });
  it('should call onSubmit and  should not navigate to home', () => {
    spyOn(component, 'openModal');
    spyOn(component, 'mandatoryCheckSEFailed').and.returnValue(false);
    spyOn(component, 'saveAndExitPlanDetails');
    spyOn(component, 'saveAvgVolAndName');
    spyOn(component, 'saveTotalAnnualHrsVariance');
    confirmSpy.and.returnValue(true);
    testPlanDetailsData[0].planCompleted = false;
    testPlanDetailsData[0].totalAnnualHours = 1;
    component.plan = testPlanDetailsData[0];
    component.onSubmit('Save-Exit');
    component.plan.targetBudget = '1';
    component.plan.utilizedAverageVolume = 2;
    component.plan.censusRange.minimumCensus = 1;
    component.plan.censusRange.maximumCensus = 5;
    expect(component.isSaveExitBtnSubmit).toBe(true);
    expect(component.openModal).toHaveBeenCalled();
    expect(component.saveAvgVolAndName).not.toHaveBeenCalled();
    expect(component.saveTotalAnnualHrsVariance).not.toHaveBeenCalled();
    expect(component.saveAndExitPlanDetails).not.toHaveBeenCalled();
  });
  it('should call onSubmit and navigate to off-grid-activities', () => {
    spyOn(component, 'mandatoryCheckSNFailed').and.returnValue(true);
    spyOn(component, 'openModal');
    testPlanDetailsData[0].planCompleted = true;
    component.pageGroup.selectedIndex = 1;
    component.previousIndex = 0;
    component.plan = testPlanDetailsData[0];
    component.onSubmit('Save-Next');
    expect(localStorage.getItem('plankey')).toBe(component.plan.key);
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
  it('should not save and exit because mandatoryCheckSEFailed', () => {
    spyOn(component, 'mandatoryCheckSEFailed').and.returnValue(true);
    spyOn(component, 'openModal');
    component.onSubmit('Save-Exit');
    expect(component.isSaveExitBtnSubmit).toBe(true);
  });
  it('should save and exit', () => {
    spyOn(component, 'mandatoryCheckSEFailed').and.returnValue(false);
    spyOn(component, 'saveAndExitPlanDetails');
    spyOn(component, 'saveAvgVolAndName').and.callThrough();
    spyOn(component, 'saveTotalAnnualHrsVariance').and.callThrough();
    component.onSubmit('Save-Exit');
    expect(component.isSaveExitBtnSubmit).toBe(true);
  });
  it('should not Save-Next because mandatoryCheckSNFailed', () => {
    spyOn(component, 'mandatoryCheckSNFailed').and.returnValue(true);
    spyOn(component, 'openModal');
    component.onSubmit('Save-Next');
    expect(component.isSaveNextBtnSubmit).toBe(true);
    expect(component.openModal).toHaveBeenCalled();
  });
  it('should Save-Next', () => {
    spyOn(component, 'mandatoryCheckSNFailed').and.returnValue(false);
    spyOn(component, 'saveAndNextPlanDetails');
    component.onSubmit('Save-Next');
    expect(component.isSaveNextBtnSubmit).toBe(true);
    expect(component.saveAndNextPlanDetails).toHaveBeenCalled();
  });
  it('should Save', () => {
    spyOn(component, 'mandatoryCheckSNFailed').and.returnValue(false);
    spyOn(component, 'savePlanDetails');
    component.onSubmit('Save');
    expect(component.savePlanDetails).toHaveBeenCalled();
  });
  it('should not Save-Next nor Save and exit', () => {
    component.onSubmit(null);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(localStorage.getItem('plankey')).toBe('1');
  });

  it('should check and fail plan name plan, plan name check and pass plan parameters planUtilizedAvgVol, lowerEndTarget, upperEndTaret, census ranges, and call mandatoryCheckSEFailed to check planNameregular expression, and parameter start and end date', () => {
    component.plan.name = '3';
    component.plan.effectiveStartDate = testSDate;
    component.plan.utilizedAverageVolume = 2;
    component.plan.targetBudget = 2;
    expect(component.mandatoryCheckSEFailed()).toBe(true);
  });
  it('should check and fail plan name plan, plan name check and pass plan parameters planUtilizedAvgVol, lowerEndTarget, upperEndTaret, census ranges, and call mandatoryCheckSEFailed to check planNameregular expression, and parameter start and end date', () => {
    component.plan.name = '3';
    component.plan.effectiveStartDate = testSDate;
    component.plan.utilizedAverageVolume = 2;
    component.plan.planUtilizedAvgVol = 2;
    component.plan.effectiveStartDate = new Date('02/02/2020');
    component.plan.effectiveEndDate = new Date('01/01/2020');
    component.plan.targetBudget = 'test.test';
    expect(component.mandatoryCheckSEFailed()).toBe(true);
    expect(component.patternTargetbudget).toBe(true);
  });
  it('should check and pass plan name plan, plan name regular expression, and parameter start and end date', () => {
    component.plan.name = 'Good';
    component.plan.effectiveStartDate = testSDate;
    component.plan.effectiveEndDate = testEDate;
    component.plan.utilizedAverageVolume = 2;
    component.plan.targetBudget = 2;
    expect(component.mandatoryCheckSEFailed()).toBe(false);
  });
  it('should check and fail plan parameters planUtilizedAvgVol, lowerEndTarget, upperEndTaret, census ranges, and call mandatoryCheckSEFailed to check planName', () => {
    spyOn(component, 'mandatoryCheckSEFailed').and.returnValue(false);
    spyOn(component, 'isVariablePostnEmpty').and.returnValue(true);
    component.plan.utilizedAverageVolume = 2;
    component.plan.targetBudget = 2;
    component.plan.lowerEndTarget = 2;
    component.plan.upperEndTarget = 2;
    component.plan.censusRange.minimumCensus = 2;
    component.plan.censusRange.maximumCensus = 2;
    expect(component.mandatoryCheckSNFailed(true)).toBe(true);
  });
  it('should check and pass plan parameters planUtilizedAvgVol, lowerEndTarget, upperEndTaret, census ranges, and call mandatoryCheckSEFailed to check planName', () => {
    spyOn(component, 'mandatoryCheckSEFailed').and.returnValue(false);
    component.plan.utilizedAverageVolume = 1;
    component.plan.targetBudget = 2;
    component.plan.lowerEndTarget = 2;
    component.plan.upperEndTarget = 2;
    component.plan.censusRange.minimumCensus = 2;
    component.plan.censusRange.maximumCensus = 3;
    expect(component.mandatoryCheckSNFailed(true)).toBe(true);
  });
  it('should check variable is empty', () => {
    component.plan = testPlanDetailsData[0];
    component.plan.variableDepartmentPositions[0].categoryAbbreviation = undefined;
    component.isVariablePostnEmpty();
    expect(component.showVariable).toBe(true);
  });
  it('should check variable is not empty', () => {
    component.plan = testPlanDetailsData[0];
    component.plan.variableDepartmentPositions[0].categoryAbbreviation = 'test';
    component.isVariablePostnEmpty();
    expect(component.showVariable).toBe(false);
  });
  it('should validate plan name it is set', () => {
    component.plan.name = 'test';
    component.plansName = ['test'];
    component.validatePlanName();
    expect(component.showError).toBe(true);
  });
  it('should validate plan name it is not set', () => {
    component.plan.name = ' ';
    component.validatePlanName();
    expect(component.showError).toBe(false);
  });
  it('should not validate plan name', () => {
    component.plansData = undefined;
    component.validatePlanName();
    expect(component.showError).toBe(false);
  });
  it('should populate patients and target data', () => {
    const testOASuggestionData = oaSuggestedDataSample();
    component.oASuggestedData = testOASuggestionData[0];
    component.populatePatientsAndTargetData();
    expect(component.plan.secondaryWHpU).toEqual(testOASuggestionData[0].workHourPerUnitSecondary);
    expect(component.plan.fte).toBe(testOASuggestionData[0].fullTimeEquivalent);
    expect(component.plan.primaryWHpU).toBe(testOASuggestionData[0].workHourPerUnitPrimary);
    expect(component.plan.educationOrientationTargetPaid).toBe(testOASuggestionData[0].educationOrientationTargetPaid);

  });
  it('should load button text', () => {
    component.plan.planCompleted = true;
    component.loadButtontext();
    expect(component.btnExittxt).toEqual('Exit');
    expect(component.btnNexttxt).toEqual('Next');
    component.plan.planCompleted = false;
    component.loadButtontext();
    expect(component.btnExittxt).toEqual('Save & Exit');
    expect(component.btnNexttxt).toEqual('Save & Next');
  });
  it('should load plan data entity', () => {
    component.loadOAPlanDataEntity();
  });
  it('should get suggested data', () => {
    spyOn(component, 'populatePatientsAndTargetData').and.stub();
    component.getSuggestedData(true);
    expect(component.populatePatientsAndTargetData).toHaveBeenCalled();
    component.getSuggestedData(false);
  });
  it('should ', () => {
    spyOn(component, 'mandatoryCheckSEFailed').and.returnValue(false);
    component.plan = testPlanDetailsData[0];
    expect(component.mandatoryCheckSNFailed(true)).toBe(true);
  });
  it('should perform mandatory check and return true ', () => {
    spyOn(component, 'mandatoryCheckSEFailed').and.returnValue(false);
    spyOn(component, 'isVariablePostnEmpty').and.returnValue(true);
    testPlanDetailsData[0].censusRange.maximumCensus = 2;
    testPlanDetailsData[0].censusRange.minimumCensus = 1;
    testPlanDetailsData[0].utilizedAverageVolume = 1.5;
    component.plan = testPlanDetailsData[0];
    component.plan.effectiveStartDate = new Date("2019-08-02");
    component.plan.effectiveEndDate = new Date("2019-08-01");
    component.utilizedAverageVolumeAnnual = 732.11;
    expect(component.mandatoryCheckSNFailed(true)).toBe(true);
  });
  it('should perform mandatory check and return true ', () => {
    spyOn(component, 'mandatoryCheckSEFailed').and.returnValue(false);
    spyOn(component, 'isVariablePostnEmpty').and.returnValue(false);
    testPlanDetailsData[0].censusRange.maximumCensus = 2;
    testPlanDetailsData[0].censusRange.minimumCensus = 1;
    testPlanDetailsData[0].utilizedAverageVolume = 1.5;
    component.plan = testPlanDetailsData[0];
    expect(component.mandatoryCheckSNFailed(true)).toBe(true);
  });
  it('should check if occurance value is empty and return false', () => {
    component.plan = testPlanDetailsData[0];
    expect(component.isOccuranceValueEmpty()).toBeFalsy();
  });
  it('should check if occurance value is empty and return true', () => {
    testPlanDetailsData[0].censusRange.minimumCensus = 1;
    testPlanDetailsData[0].censusRange.maximumCensus = 1;
    testPlanDetailsData[0].censusRange.occurrenceNumber = [];
    component.plan = testPlanDetailsData[0];
    expect(component.isOccuranceValueEmpty()).toBeTruthy();
    expect(component.showOccurance).toBeTruthy();
  });
  it('should check if occurance value is empty and return false', () => {
    testPlanDetailsData[0].censusRange.minimumCensus = 1;
    testPlanDetailsData[0].censusRange.maximumCensus = 1;
    component.plan = testPlanDetailsData[0];
    expect(component.isOccuranceValueEmpty()).toBeFalsy();
  });
  it('should load OA-Plan data entity and assign null values', () => {
    component.loadOAPlanDataEntity();
    expect(component.oAPlanDataEntity.facilityCode).toBeUndefined();
    expect(component.oAPlanDataEntity.departmentCode).toBeUndefined();
  });
  it('should load OA-Plan data entity and assign values', () => {
    component.plan = testPlanDetailsData[0];
    component.plan.facilityCode = '1';
    component.plan.departmentCode = '1';
    component.loadOAPlanDataEntity();
    expect(component.oAPlanDataEntity.facilityCode).toBe(testPlanDetailsData[0].facilityCode);
    expect(component.oAPlanDataEntity.departmentCode).toBe(testPlanDetailsData[0].departmentCode);
    expect(component.oAPlanDataEntity.planStartDate).toBe('Invalid date');
  });
  // it('should load facility details', () => {
  //   component.loadFacilityDetails();
  //   expect(entityService.getFacility).toHaveBeenCalledWith(component.plan.corporationId);
  // });
  it('should apply min value', function() {
    component.applyMinValue(1);
    expect(component.cmin).toBe(1);
  });
  it('should apply min value', function() {
    component.applyMaxValue(1);
    expect(component.cmax).toBe(1);
  });
  it('should check number and decimal only ', function() {
    expect(component.numberAndDecimalOnly(null)).toBe(false);
  });
  it('should check number and decimal only ', function() {
    numberObj.keyCode = 58;
    expect(component.numberAndDecimalOnly(numberObj)).toBe(undefined);
  });
  it('should check number and decimal only ', function() {
    component.plan = testPlanDetailsData[0];
    numberObj.keyCode = 46;
    expect(component.numberAndDecimalOnly(numberObj)).toBe(undefined);
  });
  it('should check number and decimal only ', function() {
    testPlanDetailsData[0].targetBudget = 1.1046372;
    component.plan = testPlanDetailsData[0];
    numberObj.keyCode = 46;
    expect(component.numberAndDecimalOnly(numberObj)).toBe(false);
  });
  it('should check number and decimal only ', function() {
    testPlanDetailsData[0].targetBudget = 1.13;
    component.plan = testPlanDetailsData[0];
    numberObj.keyCode = 46;
    expect(component.numberAndDecimalOnly(numberObj)).toBe(undefined);
  });
  it('should check number and decimal only ', function() {
    testPlanDetailsData[0].targetBudget = 1111.1;
    component.plan = testPlanDetailsData[0];
    numberObj.keyCode = 46;
    expect(component.numberAndDecimalOnly(numberObj)).toBe(false);
  });
  it('should check number and decimal only ', function() {
    testPlanDetailsData[0].targetBudget = null;
    component.plan = testPlanDetailsData[0];
    numberObj.keyCode = 46;
    expect(component.numberAndDecimalOnly(numberObj)).toBe(undefined);
  });
  it('should update data from oa', function() {
    testPlanDetailsData[0].effectiveStartDate = new Date(2);
    component.plan = testPlanDetailsData[0];
    component.plan.effectiveEndDate = new Date('1');
    component.plan.effectiveStartDate = new Date('1');
    spyOn(component, 'numberOnlyForDate').and.returnValue(true);
    spyOn(component, 'isValidDateRange').and.returnValue(true);
    spyOn(component, 'getSuggestedData').and.stub();
    spyOn(component, 'loadOAPlanDataEntity').and.stub();
    component.updateDataFromOA(true);
    expect(component.getSuggestedData).toHaveBeenCalled();
    expect(component.loadOAPlanDataEntity).toHaveBeenCalled();
  });
  it('should update data from oa on change', function() {
    testPlanDetailsData[0].effectiveStartDate = new Date(1);
    component.plan = testPlanDetailsData[0];
    component.plan.effectiveEndDate = new Date('1');
    component.plan.effectiveStartDate = new Date('1');
    spyOn(component, 'numberOnlyForDate').and.returnValue(true);
    spyOn(component, 'isValidDateRange').and.returnValue(true);
    spyOn(component, 'getSuggestedData').and.stub();
    spyOn(component, 'loadOAPlanDataEntity').and.stub();
    let event = {
      option: {
        id: "2"
      }
    };
    component.updateDataFromOAOnChange(true,event);
    expect(component.getSuggestedData).toHaveBeenCalled();
    expect(component.loadOAPlanDataEntity).toHaveBeenCalled();
  });
  it('should isValidDateRange', function(){
    component.plan.effectiveStartDate = new Date();
    component.isValidDateRange(new Date());
    expect(component.isValidDateRange).toHaveBeenCalled;
  });
  it('checkIfPlanEdited should return false', function() {
    component.plan = testPlanDetailsData[0];
    component.censusData=censusData()[0];
    component.strplanDetails=null;
    expect(component.checkIfPlanEdited()).toBe(false);
  });
  it('checkIfPlanEdited should return true', function() {
    component.plan = testPlanDetailsData[0];
    component.censusData=censusData()[0];
    component.strplanDetails=JSON.stringify(component.plan);
    component.plan .name="Testplanname1";
    expect(component.checkIfPlanEdited()).toBe(true);
  });

  it('should call openDialog and Select yes for save and mandatory check failed', function() {
  spyOn(component,'checkIfPlanEdited').and.returnValue(true);
  spyOn(component,'mandatoryCheckSNFailed').and.returnValue(true);
  component.plan = testPlanDetailsData[0];
  mockMatDialog.open.and.callFake(function() {
    return {
      afterClosed(){
        return of(2);
      }
    }
  });
  component.openDialog();
  expect(component.objSavePlanParams.isCensusApplied).toBe(true);
  expect(component.objSavePlanParams.isSaveNextBtnSubmitForCensus).toBe(true);
  expect(component.isSaveNextBtnSubmit).toBe(true);

  });

  it('should call openDialog and Select yes for save and mandatory check success', function() {
    spyOn(component,'checkIfPlanEdited').and.returnValue(true);
    spyOn(component,'mandatoryCheckSNFailed').and.returnValue(false);
    component.plan = testPlanDetailsData[0];
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(2);
        }
      }
    });
    spyOn(component,'saveAndNextPlanDetails');
    component.openDialog();
    expect(component.saveAndNextPlanDetails).toHaveBeenCalled();
    });

    it('should call openDialog and Select yes for save and mandatory check success', function() {
      spyOn(component,'checkIfPlanEdited').and.returnValue(true);
      spyOn(component,'mandatoryCheckSNFailed').and.returnValue(true);
      component.plan = testPlanDetailsData[0];
      mockMatDialog.open.and.callFake(function() {
        return {
          afterClosed(){
            return of(1);
          }
        }
      });
      component.openDialog();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });
    it('should planUtilizeConvertion', function(){
      component.plan.utilizedAverageVolume = 1;
      component.plan.utilizedAverageVolumeBase = 1;
      component.planUtilizeConvertion('annual', false);
      expect(component.utilizedAverageVolumeAnnual).toEqual(365);
      component.planUtilizeConvertion('annual', true);
    });
    it('should updatePlanUtilizedAvgVolumeBase', function(){
      component.plan.utilizedAverageVolume = 1;
      component.plan.utilizedAverageVolumeBase = 1;
      component.updatePlanUtilizedAvgVolumeBase(component.plan.utilizedAverageVolume);
      expect(component.utilizedAverageVolumeAnnual).toEqual(365);
      component.plan.utilizedAverageVolume = 2;
      component.plan.utilizedAverageVolumeBase = 2;
      component.updatePlanUtilizedAvgVolumeBase(component.plan.utilizedAverageVolume);
      expect(component.utilizedAverageVolumeAnnual).toEqual(730);
    });
    it('should updatePlanUtilizedAvgVolumeAnnual', function(){
      component.utilizedAverageVolumeAnnual = 732;
      component.updatePlanUtilizedAvgVolumeAnnual(component.utilizedAverageVolumeAnnual);
      expect(component.plan.utilizedAverageVolume).toEqual(2.0054);
    });
    it('should chekForCensusError', function(){
      component.chekForCensusError();
      component.objSavePlanParams.saveNextErrorMessages = ['error'];
      component.chekForCensusError();
      expect(component.chekForCensusError).toHaveBeenCalled;
    });
    it('should isVariablePostDescriptionUnique', function(){
      component.plan.variableDepartmentPositions = [
        {
        key: 1,
        categoryKey: 0,
        categoryAbbreviation: 'categoryAbbrev',
        categoryDescription: 'categoryDesc',
        includedInNursingHoursFlag: true
        }
      ];
      component.isVariablePostDescriptionUnique();
      component.plan.variableDepartmentPositions = [
        {
        key: 1,
        categoryKey: 1,
        categoryAbbreviation: 'categoryAbbrev',
        categoryDescription: 'categoryDesc',
        includedInNursingHoursFlag: true
        },
        {
          key: 2,
          categoryKey: 1,
          categoryAbbreviation: 'categoryAbbrev',
          categoryDescription: 'categoryDesc',
          includedInNursingHoursFlag: true
        }
      ];
      component.isVariablePostDescriptionUnique();
      expect(component.isVariablePostDescriptionUnique()).toEqual(false);
      expect(component.isVariablePostDescriptionUnique).toHaveBeenCalled;

    });
    it('should populatePatientsAndTargetData', function(){
      component.plan.currentAverageVolume = 1;
      component.populatePatientsAndTargetData();
      expect(component.populatePatientsAndTargetData).toHaveBeenCalled;
    });
    it('should checkCensusRange', function(){
      component.plan.censusRange.minimumCensus = 2;
      component.plan.censusRange.maximumCensus = 5;
      component.plan.utilizedAverageVolume = 6;
      component.checkCensusRange();
      expect(component.checkCensusRange).toHaveBeenCalled;
      component.plan.censusRange.minimumCensus = 1;
      component.plan.censusRange.maximumCensus = 5;
      component.plan.utilizedAverageVolume = 2;
      component.checkCensusRange();
    });
    it('should navigateToNextTab', function() {
      component.plan.key = testPlanDetailsDataService[0].key;
      component.plan.staffScheduleList[0] = testStaffScheduleData[0];
      sessionStorage.setItem('newPlanKey', component.plan.key);
      sessionStorage.setItem('staffScheduleList', JSON.stringify(component.plan.staffScheduleList[0]));
      component.navigateToNextTab('/staff-schedule');
      expect(component.navigateToNextTab).toHaveBeenCalled;
    });
    it('should show submit schedule message', function() {
      component.plan.key = testPlanDetailsDataService[0].key;
      component.plan.staffScheduleList[0] = null;
      sessionStorage.setItem('newPlanKey', component.plan.key);
      sessionStorage.setItem('staffScheduleList', null);
      component.navigateToNextTab('/staffing-grid');
      expect(component.navigateToNextTab).toHaveBeenCalled;
    });
    it('should checkTabChange', function(){
      component.checkTabChange();
      expect(component.checkTabChange).toHaveBeenCalled;
    });
    it('should triggerUpdateSession', function(){
      component.triggerUpdateSession();
      component.clearEnt();
      component.clearDept();
      component.filterEnt('v');
      component.filterDept('v');
      component.checkDates(true, true);
      component.nullCheck('');
      expect(component.triggerUpdateSession).toHaveBeenCalled;
    });
    it('should numberOnlyForEndDate', function(){
      let event = {
        keyCode : 37,
        preventDefault(){
          return false;
        }
      }
      component.plan.effectiveEndDate = new Date();
      component.numberOnlyForEndDate(event);
      expect(component.numberOnlyForEndDate).toHaveBeenCalled;
    });
  it('should saveAvgVolAndName', function() {
    component.plan.utilizedAverageVolume = 2;
    component.plan.utilizedAverageVolumeBase = 3;
    component.isDaily = false;
    component.plan.name ='test';
    component.saveAvgVolAndName();
    expect(component.saveAvgVolAndName).toHaveBeenCalled;
  });
  it('should check hostlistener', function(){
    let event = new MouseEvent('click', {bubbles: true});
    const elRefMock = {
      nativeElement: document.createElement('input')
    };
    elRefMock.nativeElement.setAttribute("id", "crossEnt");
    elRefMock.nativeElement.dispatchEvent(event);
    //const event = new Event('click', { bubbles: true});
    spyOn(event, 'preventDefault');
    document.dispatchEvent(event);
  });
  it('should check loadOtherPages', function(){
    component.loadOtherPages();
    component.pageGroup.selectedIndex = 2;
    expect(component.loadOtherPages).toHaveBeenCalled;
  });
  it('should check updateSession', function(){
    (component as any).updateSession();
    (component as any).removeSessionAttributes();
    component.plan.planAlreadyInUse = true;
    (component as any).checkForSessionAttributes();
  });
  it('should load schedules', () => {
    spyOn(component, 'loadStaffGridDetails').and.stub();
    component.loadSchedulesForThePlan();
    expect(component.plan.staffScheduleList[0]).toBe(testStaffScheduleData[0]);
    expect(scheduleServiceSpyObj.getScheduleDetails).toHaveBeenCalled();
    expect(component.loadStaffGridDetails).toHaveBeenCalled();
  });
  it('should load staff grid details', () => {
    spyOn(component,'orderStaffGridCensusByVarpos').and.stub();
    staffGridServiceSpyObj.getStaffGridDetails.and.returnValue(of(testStaffGridCensus));
    testStaffScheduleData[0].planShiftList[0].key='1';
    component.planKey = '1';
    component.loadStaffGridDetails(testStaffScheduleData);
    component.orderStaffGridCensusByVarpos(testStaffGridCensus[0]);
    expect(component.orderStaffGridCensusByVarpos).toHaveBeenCalled();
  });
  it('should load staff grid details', () => {
    spyOn(component,'orderStaffGridCensusByVarpos')
    staffGridServiceSpyObj.getStaffGridDetails.and.returnValue(of(testStaffGridCensus));
    testStaffScheduleData[0].planShiftList[0].key='1';
    testStaffScheduleData[0].planShiftList[0].staffGridCensuses=null;
    component.planKey = '1';
    component.loadStaffGridDetails(testStaffScheduleData);
    expect(component.orderStaffGridCensusByVarpos).toHaveBeenCalled();
  });
  it('should load staff order varpos', () => {
    component.plan.variableDepartmentPositions = [{
      key: 2,
      categoryKey: 1,
      categoryAbbreviation: '',
      categoryDescription: '',
      includedInNursingHoursFlag: true
    }];
    component.orderStaffGridCensusByVarpos(testStaffGridCensus[0]);
    // expect(component.orderStaffGridCensusByVarpos).toHaveBeenCalled();
  });
  it('should load staff grid details new', () => {
    testStaffScheduleData[0].planShiftList[0].key='1';
    staffGridServiceSpyObj.getStaffGridDetails.and.returnValue(of(testStaffGridCensus));
    component.loadStaffGridDetails(testStaffScheduleData);
  });

  it('should save hrs variance', function() {
    component.plan.staffScheduleList = testStaffScheduleData;
    component.plan.censusRange.maximumCensus = 5;
    component.plan.censusRange.minimumCensus = 2;
    component.plan.staffScheduleList[0].planShiftList[0].staffGridCensuses = [{
      key: 'key',
      shiftKey: 'shiftKey',
      censusIndex: 3,
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
    }];
    component.plan.staffScheduleList[1].planShiftList[0].staffGridCensuses = [{
      key: 'key',
      shiftKey: 'shiftKey',
      censusIndex: 4,
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
    }];
    component.plan.staffScheduleList[2].planShiftList[0].staffGridCensuses = [{
      key: 'key',
      shiftKey: 'shiftKey',
      censusIndex: 4,
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
    }];
    component.plan.staffingSummaryData = null;
    component.plan.staffScheduleList[0].planShiftList[0].staffToPatientList = [{
        variablePositionKey: 1,
        variablePositionCategoryAbbreviation: 'varposabrv',
        variablePositionCategoryDescription: 'categoryDesc',
        staffCount: 1,
        activeFlag: false
      }];
    component.saveTotalAnnualHrsVariance();
    expect(component.saveTotalAnnualHrsVariance).toHaveBeenCalled;
  });
  it('should save hrs variance else', function() {
    component.plan.staffScheduleList = testStaffScheduleData;
    component.plan.censusRange.maximumCensus = 5;
    component.plan.censusRange.minimumCensus = 2;
    component.plan.staffScheduleList[0].planShiftList[0].staffGridCensuses = [{
      key: 'key',
      shiftKey: 'shiftKey',
      censusIndex: 3,
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
    }];
    component.plan.staffScheduleList[1].planShiftList[0].staffGridCensuses = [{
      key: 'key',
      shiftKey: 'shiftKey',
      censusIndex: 4,
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
    }];
    component.plan.staffScheduleList[2].planShiftList[0].staffGridCensuses = [{
      key: 'key',
      shiftKey: 'shiftKey',
      censusIndex: 4,
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
    }];
    component.plan.staffingSummaryData = null;
    component.plan.staffScheduleList[0].planShiftList[0].staffToPatientList = [{
        variablePositionKey: 1,
        variablePositionCategoryAbbreviation: 'varposabrv',
        variablePositionCategoryDescription: 'categoryDesc',
        staffCount: 0,
        activeFlag: false
      }];
    component.saveTotalAnnualHrsVariance();
    expect(component.saveTotalAnnualHrsVariance).toHaveBeenCalled;
  });
  it('should populateData', function() {
    component.plan.staffScheduleList = testStaffScheduleData;
    component.populateData();
    expect(component.populateData).toHaveBeenCalled;
  });
  it('should check loadPlanUtilizedBaseValue', function(){
    component.plan.dailyFlag = false;
    component.plan.utilizedAverageVolume = 366;
    component.plan.utilizedAverageVolumeBase = undefined;
    component.loadPlanUtilizedBaseValue();
    expect(component.loadPlanUtilizedBaseValue).toHaveBeenCalled;
  });
  it('Should check removeErrorMessagesForSave', function(){
    component.removeErrorMessagesForSave();
    expect(component.removeErrorMessagesForSave).toHaveBeenCalled;
  });
  it('Should check censusMinMaxValidation', function(){
    component.censusMinMaxValidation();
    expect(component.censusMinMaxValidation).toHaveBeenCalled;
  });
  it('Should check savePlanDetails', function(){
    component.savePlanDetails();
    expect(component.savePlanDetails).toHaveBeenCalled;
  });
  it('should censusValidation', function(){
    component.censusValidation();
    component.objSavePlanParams.saveNextErrorMessages.push('Enter minimum and maximum values for the Census Range. All values must be greater than zero.');
    component.censusValidation();
    component.plan.censusRange.maximumCensus = 4;
    component.plan.censusRange.minimumCensus = 1;
    component.cmin = 2;
    component.cmax = 4;
    component.censusValidation();
    expect(component.censusValidation).toHaveBeenCalled;
  });
});
