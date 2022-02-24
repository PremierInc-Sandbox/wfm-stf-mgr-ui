import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ActivityGridComponent} from './activity-grid.component';
import {PlanService} from '../../../../shared/service/plan-service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {of} from 'rxjs';
import {offGridActivitiesData} from '../../../../shared/service/fixtures/off-grid-activities-data';
import {variableDepartmentpositionData} from '../../../../shared/service/fixtures/variable-dept-position-data';
import {activityData} from '../../../../shared/service/fixtures/activity-data';
import {planDetailsData} from '../../../../shared/service/fixtures/plan-details-data';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;
import createSpy = jasmine.createSpy;
import {AlertBox} from '../../../../shared/domain/alert-box';

describe('ActivityGridComponent', () => {
  let component: ActivityGridComponent;
  let fixture: ComponentFixture<ActivityGridComponent>;
  const planService: SpyObj<PlanService> = createSpyObj('PlanService', ['getActivytlist']);
  const offGridActivityDataTest = offGridActivitiesData();
  const variableDepartmentDataTest = variableDepartmentpositionData();
  const activityDataTest = activityData();
  const planDetailsDataTest = planDetailsData();
  let mockMatDialog;
  mockMatDialog = jasmine.createSpyObj({
    afterClosed: of({}), close: null, open: createSpy('open', function() {
      return this;

    })
  });
  mockMatDialog.componentInstance = {body: ''};

  const numberObj = {
    which: false,
    keyCode: 33,
  };
  beforeEach(waitForAsync(() => {
    mockMatDialog.open.and.callFake(function() {
      return this;

    });
    TestBed.configureTestingModule({
      declarations: [ActivityGridComponent],
      imports: [HttpClientTestingModule, MatAutocompleteModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{provide: PlanService, useValue: planService}, {provide: MatDialog, useValue: mockMatDialog}]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityGridComponent);
    component = fixture.componentInstance;
    spyOn(component.alertBox, 'openAlert');
    spyOn(component.alertBox, 'openAlertForOGA');
    fixture.detectChanges();
    component.newoffgridactivity = offGridActivityDataTest[0];
    component.planDetails.offGridActivities[0] = offGridActivityDataTest[0];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should GetDistinctVariabledepartments and GetActivitylist have been called', () => {
    spyOn(component, 'getDistinctVariableDepartments');
    spyOn(component, 'getActivitylist');
    component.ngOnInit();
    expect(component.getDistinctVariableDepartments).toHaveBeenCalled();
    expect(component.getActivitylist).toHaveBeenCalled();
  });
  it('should get activity list', () => {
    component.planDetails.offGridActivities[0] = planDetailsDataTest[0].offGridActivities[0];
    component.ogaTypeKeyval = 1;
    component.getActivitylist();
    expect(component.Listoffgridactivity[0]).toBe(planDetailsDataTest[0].offGridActivities[0]);
  });
  it('should get activity list when oga type key is null', () => {
    component.planDetails.offGridActivities[0] = planDetailsDataTest[0].offGridActivities[0];
    component.planDetails.offGridActivities[0].typeKey = null;
    component.ogaTypeKeyval = 1;
    component.getActivitylist();
    expect(component.Listoffgridactivity[0]).toBe(planDetailsDataTest[0].offGridActivities[0]);
  });
  it('should check number only and return false ', () => {
    expect(component.numberOnly(numberObj)).toBe(false);
  });
  it('should check number only and return false ', () => {
    numberObj.keyCode = 58;
    expect(component.numberOnly(numberObj)).toBe(false);
  });
  it('should return true if event char code is less than 31', () => {
    numberObj.which = true;
    numberObj.keyCode = 30;
    expect(component.numberOnly(numberObj)).toBe(true);
  });
  it('should not remove off grid activity', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.removeOffGridActivity(offGridActivityDataTest[0]);
    expect(component.planDetails.offGridActivities.indexOf(planDetailsDataTest[0].offGridActivities[0])).toBe(-1);
  });
  it('should not remove off grid activity', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.planDetails.totalAnnualHours = -1;
    component.planDetails.offGridActivities[0] = planDetailsDataTest[0].offGridActivities[0];
    component.removeOffGridActivity(offGridActivityDataTest[0]);
    expect(component.planDetails.offGridActivities.indexOf(planDetailsDataTest[0].offGridActivities[0])).toBe(-1);
  });
  it('should not remove off grid activity', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.planDetails.totalAnnualHours = 0;
    component.planDetails.offGridActivities[0] = planDetailsDataTest[0].offGridActivities[0];
    component.removeOffGridActivity(offGridActivityDataTest[0]);
    expect(component.planDetails.offGridActivities.indexOf(planDetailsDataTest[0].offGridActivities[0])).toBe(-1);
  });
  it('should not remove off grid activity', () => {
    spyOn(window, 'confirm').and.returnValues(true, false);
    component.planDetails.totalAnnualHours = 1;
    component.planDetails.offGridActivities[0] = planDetailsDataTest[0].offGridActivities[0];
    component.removeOffGridActivity(offGridActivityDataTest[0]);
    expect(component.planDetails.offGridActivities.indexOf(planDetailsDataTest[0].offGridActivities[0])).toBe(-1);
  });
  it('should not remove off grid activity', () => {
    spyOn(component, 'getActivitylist');
    spyOn(window, 'confirm').and.returnValues(true, true);
    component.planDetails.totalAnnualHours = 1;
    component.planDetails.offGridActivities[0] = planDetailsDataTest[0].offGridActivities[0];
    component.removeOffGridActivity(offGridActivityDataTest[0]);
    expect(component.planDetails.offGridActivities.indexOf(planDetailsDataTest[0].offGridActivities[0])).toBe(-1);
    expect(component.getActivitylist).toHaveBeenCalled();
  });
  it('should pop and alerts box for adding off grid activity if no activity was selected', () => {
    component.addOffGridActivity(0);
    expect(component.newoffgridactivity.variableDepartmentList[component.newoffgridactivity.variableDepartmentList.length - 1]).toEqual(planDetailsDataTest[0].offGridActivities[0].variableDepartmentList[0]);
    expect(component.Listoffgridactivity).not.toBe(null);
    expect(component.alertBox.openAlertForOGA).toHaveBeenCalledWith('exit-dialog',
       '175px', '350px','Off Grid Activities', 'Enter an Activity Name.');
  });

  it('should add new off grid activity', () => {
     spyOn(component, 'addNewOffgridActivity');
     component.addOffGridActivity(-1);
     component.Listoffgridactivity[0].code = '0';
     component.Listoffgridactivity[0].name = '0';
     component.addOffGridActivity(0);
     expect(component.addNewOffgridActivity).toHaveBeenCalled();
  });

  it('should add off grid activity if staff value is null', () => {
    component.variableDepartment[0] = variableDepartmentDataTest[0].categoryAbbreviation;
    component.staffvalues.push(0);
    component.lstVariableDepartmet[0] = offGridActivityDataTest[0].variableDepartmentList[0];
    component.addOffGridActivity(-1);
    expect(component.vardepart.staffCount).toBe(0);

  });
  it('should add off grid activity if staff value is null', () => {
    component.planDetails.offGridActivities[0] = offGridActivityDataTest[0];
    component.variableDepartment[0] = variableDepartmentDataTest[0].categoryAbbreviation;
    component.staffvalues.push(0);
    component.staffvalues[0] = null;
    component.lstVariableDepartmet[0] = offGridActivityDataTest[0].variableDepartmentList[0];
    component.addOffGridActivity(-1);
    expect(component.vardepart.staffCount).toBe(0);

  });
  it('should add off grid activity if staff value is null', () => {
    component.planDetails.offGridActivities[0] = offGridActivityDataTest[0];
    component.variableDepartment[0] = variableDepartmentDataTest[0].categoryAbbreviation;
    component.lstVariableDepartmet[0] = offGridActivityDataTest[0].variableDepartmentList[0];
    component.addOffGridActivity(-1);
    expect(component.vardepart.staffCount).toBe(0);

  });
  it('should add off grid activity', () => {
    component.planDetails.offGridActivities = null;
    component.addOffGridActivity(-1);
    expect(component.planDetails.offGridActivities.length).toBe(1);
  });

  it('should get staff count', () => {
    expect(component.getStaffCOunt(offGridActivityDataTest[0])).toBe(2);
  });
  it('should get total hours', () => {
    expect(component.getTotalHours(offGridActivityDataTest[0])).toBe(2);
  });
  it('should get distinct variable departments and compare two variable_department_position', () => {
    component.lstVariableDepartmet[0] = planDetailsDataTest[0].offGridActivities[0].variableDepartmentList[0];
    component.lstVariableDepartmet[1] = planDetailsDataTest[0].offGridActivities[0].variableDepartmentList[0];
    component.lstVariableDepartmet[0].key = 2;
    component.planDetails.variableDepartmentPositions[0] = planDetailsDataTest[0].variableDepartmentPositions[0];
    component.planDetails.variableDepartmentPositions[0].categoryKey = 1;
    const preLength = component.lstVariableDepartmet.length;
    component.getDistinctVariableDepartments();
    expect(component.lstVariableDepartmet.length).toBeGreaterThan(preLength);
  });

  it('should get distinct variable departments and compare two variable_department_position', () => {
    component.lstVariableDepartmet[0] = planDetailsDataTest[0].offGridActivities[0].variableDepartmentList[0];
    component.lstVariableDepartmet[1] = planDetailsDataTest[0].offGridActivities[0].variableDepartmentList[0];
    component.lstVariableDepartmet[1].key = 0;
    component.planDetails.variableDepartmentPositions[0] = planDetailsDataTest[0].variableDepartmentPositions[0];
    component.planDetails.variableDepartmentPositions[0].categoryKey = 1;
    const preLength = component.lstVariableDepartmet.length;
    component.getDistinctVariableDepartments();
    expect(component.lstVariableDepartmet.length).toBeGreaterThan(preLength);
  });

  it('should update activity', () => {
    component.Listoffgridactivity[0] = offGridActivityDataTest[0];
    expect(component.Listoffgridactivity[0].key).toBe(1);
    expect(component.Listoffgridactivity[0].name).toBe('activityName');
  });
  it('should update activity when it is already selected', () => {
    component.planDetails.offGridActivities[0] = offGridActivityDataTest[0];
    component.planDetails.offGridActivities[1] = offGridActivityDataTest[0];
    component.planDetails.offGridActivities[0] = offGridActivityDataTest[0];
    component.planDetails.offGridActivities[1] = offGridActivityDataTest[0];
    component.planDetails.offGridActivities[0].code = '';
    component.planDetails.offGridActivities[1].code = '';
    component.Listoffgridactivity[0] = offGridActivityDataTest[0];
    component.Listoffgridactivity[1] = offGridActivityDataTest[0];
    expect(component.Listoffgridactivity[0].variableDepartmentList).toBe(offGridActivityDataTest[0].variableDepartmentList);
    expect(component.Listoffgridactivity[0].shiftHours).toBe(offGridActivityDataTest[0].shiftHours);
  });
  it('should not update activity because off grid activity list is null', () => {
    component.Listoffgridactivity.length = 0;
  });
  it('should filter activity and find that it is not already selected', () => {
    component.Listoffgridactivity[0] = offGridActivityDataTest[0];
    component.activityTyped(0);
    expect(component.Listoffgridactivity[0].code).toBe(component.Listoffgridactivity[0].name);
    expect(component.Listoffgridactivity[0].key).toBeNull();
  });
  it('should filter activity', () => {
    component.Listoffgridactivity[0] = offGridActivityDataTest[0];
    component.activityTyped(0);
    expect(component.Listoffgridactivity[0].code).toBe(component.Listoffgridactivity[0].name);
    expect(component.Listoffgridactivity[0].key).toBeNull();
  });
  it('should clear list of activity', () => {
    component.clear(0);
    expect(component.Listoffgridactivity[0].name).toBe('');
    expect(component.Listoffgridactivity[0].code).toBe('');
  });
});

