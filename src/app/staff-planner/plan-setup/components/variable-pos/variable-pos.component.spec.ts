import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {VariablePosComponent} from './variable-pos.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {PlanService} from '../../../../shared/service/plan-service';
import {of} from 'rxjs';
import {jobCategoryData} from '../../../../shared/service/fixtures/job-category-data';
import {variableDepartmentpositionData} from '../../../../shared/service/fixtures/variable-dept-position-data';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import {FormsModule} from '@angular/forms';
import {VariableDepartmentPosition} from '../../../../shared/domain/var-pos';
import {planDetailsData} from '../../../../shared/service/fixtures/plan-details-data';
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;
import Spy = jasmine.Spy;
import createSpy = jasmine.createSpy;


describe('VariablePosComponent', () => {
  let component: VariablePosComponent;
  let fixture: ComponentFixture<VariablePosComponent>;
  let variableDept: VariableDepartmentPosition;
  let httpClient;
  let mockRouter;
  let flag=true;
  const jobCategoryDataTest = jobCategoryData();
  const planService: SpyObj<PlanService> = createSpyObj('PlanService', ['getJobCategoryData']);
  planService.getJobCategoryData.and.returnValue(of(jobCategoryDataTest));
  let confirmation: Spy;
  let mockMatDialog;
  mockMatDialog = jasmine.createSpyObj({
    afterClosed: createSpy('name', function () {
      return of();

    }).and.callThrough(), close: null, open: createSpy('open', function() {
      return this;
    })
  });
  mockMatDialog.componentInstance = {body: ''};
  let mockMatDialogRef;
  let planDetainsDataTest = planDetailsData();
  const selection = {
    target: {
      value: 1
    }
  };

  let variableDeptpositionDataTest;
  beforeEach(waitForAsync(() => {
    confirmation = spyOn(window, 'confirm');
    confirmation.and.returnValue(true);
    mockMatDialog.open.and.callFake(function() {
      return{
        afterClosed() {
          return of(flag);
        }
      }
    });
    TestBed.configureTestingModule({
      declarations: [VariablePosComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        {provide: HttpClient, useValue: httpClient}, {provide: Router, useValue: mockRouter}, {
          provide: MatDialog,
          useValue: mockMatDialog
        },
        {provide: MatSelectModule, useValue: mockMatDialogRef},
        {provide: PlanService, useValue: planService}
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VariablePosComponent);
    component = fixture.componentInstance;
    component.plan = planDetainsDataTest[0];
    fixture.detectChanges();
    planDetainsDataTest = planDetailsData();
    variableDeptpositionDataTest = variableDepartmentpositionData();
  });

  it('should create', () => {
    component.plan = planDetainsDataTest[0];
    expect(component).toBeTruthy();
  });
  it('should load job category', () => {
    component.loadJobCategory();
    expect(planService.getJobCategoryData).toHaveBeenCalled();
    expect(component.jobCatgData).toEqual(jobCategoryDataTest);
  });
  it('should not add new staff because variable position length more than 8', () => {
    component.plan.variableDepartmentPositions.length = 8;
    component.newStaff(variableDept);
    expect(component.isShowDelete).toBe(true);
    expect(component.error.isError).toBe(true);
    expect(component.error.errorMessage).toBe('User is unable to add new position unless they delete an existing one.');
  });
  it('should add new staff', () => {
    component.newStaff(variableDeptpositionDataTest[0]);
    expect(component.plan.variableDepartmentPositions[0].includedInNursingHoursFlag).toBe(true);
    expect(component.plan.variableDepartmentPositions.length).toBe(2);
    expect(component.showError).toBeFalsy();
  });
  it('should not add new staff when category key is null', () => {
    variableDeptpositionDataTest[0].categoryKey = null;
    component.newStaff(variableDeptpositionDataTest[0]);
    expect(component.showError).toBeTruthy();
  });
  it('should delete a row that exists ', () => {
    component.plan.variableDepartmentPositions[0] = variableDeptpositionDataTest[0];
    component.deleteRow(variableDeptpositionDataTest[0]);
    expect(component.plan.variableDepartmentPositions.indexOf(component.plan.variableDepartmentPositions[0])).toBe(-1);
    expect(component.isMaxIndex).toBe(false);
  });
  it('should not delete a row because it was not found ', () => {
    component.deleteRow(variableDeptpositionDataTest[0]);
    expect(component.plan.variableDepartmentPositions.indexOf(component.plan.variableDepartmentPositions[0])).toBe(0);
    expect(component.isMaxIndex).toBe(true);
  });
  it('should not delete a row because confirm box was denied ', () => {
    confirmation.and.returnValue(false);
    component.deleteRow(variableDeptpositionDataTest[0]);
    expect(component.isMaxIndex).toBe(true);
  });
  it('should delete a row', () => {
    component.plan = planDetainsDataTest[0];
    component.plan.totalAnnualHours = 1;
    component.deleteRow(variableDeptpositionDataTest[0]);
    expect(component.isMaxIndex).toBe(true);
  });

  it('should not delete a row when second confirm box is confirmed', () => {
    component.plan.variableDepartmentPositions[0] = variableDeptpositionDataTest[0];
    component.plan.totalAnnualHours = 1;
    confirmation.and.returnValues(true, false);
    component.deleteRow(variableDeptpositionDataTest[0]);
    expect(component.isMaxIndex).toBe(false);
  });
  it('should not delete a row when second confirm box is confirmed', () => {
    component.plan.variableDepartmentPositions[0] = variableDeptpositionDataTest[0];
    component.plan = planDetainsDataTest[0];
    component.plan.totalAnnualHours = -1;
    component.deleteRow(variableDeptpositionDataTest[0]);
    expect(component.isMaxIndex).toBe(true);
  });
  it('should not delete a row when second confirm box is confirmed', () => {
    flag=false;
    component.plan.variableDepartmentPositions[0] = variableDeptpositionDataTest[0];
    component.plan = planDetainsDataTest[0];
    component.plan.totalAnnualHours = -1;
    component.deleteRow(variableDeptpositionDataTest[0]);
    expect(component.isMaxIndex).toBe(true);
  });

  it('should clear fields', () => {
    component.clearFields(variableDeptpositionDataTest[0]);
    expect(variableDeptpositionDataTest[0].categoryKey).toBe(-1);
  });
  it('should not change category', () => {
    component.jobCatgData = jobCategoryDataTest;
    component.jobCatgData[0] = jobCategoryDataTest[0];
    component.plan.variableDepartmentPositions[0] = variableDeptpositionDataTest[0];
    component.changeCategory(selection, 1, variableDeptpositionDataTest[0]);
    expect(component.showError).toBe(false);
    expect(component.isSaveNextBtnSubmit).toBe(false);
  });
  it('should open alert', () => {
    component.alertBox.openAlert('exit-dialog', '175px','350px',  'Plan SetUp - Variable Position','testMessage');
    expect(mockMatDialog.afterClosed).not.toHaveBeenCalled();
    expect(mockMatDialog.open).toHaveBeenCalled();

  });
  it('should validate variable and return false', () => {
    component.plan = planDetainsDataTest[0];
    expect(component.validateVariable()).toBeFalsy();
    expect(component.isSaveNextBtnSubmit).toBeFalsy();
  });
  it('should validate variable and return true', () => {
    planDetainsDataTest[0].variableDepartmentPositions[0].categoryAbbreviation = null;
    component.plan = planDetainsDataTest[0];
    component.validateVariable();
    expect(component.isSaveNextBtnSubmit).toBeTruthy();
    expect(component.isSaveNextBtnSubmit).toBe(true)
  });
  it('should validate variable and return false', () => {
    component.plan = planDetainsDataTest[0];
    component.validateVariable();
    expect(component.isSaveNextBtnSubmit).toBe(false)
  });
  it('should checkDup', function(){
    component.checkDup();
    expect(component.checkDup).toHaveBeenCalled;
  });
  it('Shouls checkDuplicate', function(){
    component.checkDuplicate(selection, variableDeptpositionDataTest[0]);
    expect(component.checkDuplicate).toHaveBeenCalled;
  });
});


