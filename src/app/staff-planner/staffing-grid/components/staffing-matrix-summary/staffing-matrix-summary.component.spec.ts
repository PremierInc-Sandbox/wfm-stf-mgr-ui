import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {StaffingMatrixSummaryComponent} from './staffing-matrix-summary.component';
import {Router} from '@angular/router';
import {planDetailsData} from '../../../../shared/service/fixtures/plan-details-data';
import {HttpClient} from '@angular/common/http';
import {PdfDataService} from '../../../../shared/service/pdf-data.service';
import {of} from 'rxjs';
import SpyObj = jasmine.SpyObj;
import createSpy = jasmine.createSpy;
import {ConfirmWindowOptions} from '../../../../shared/domain/plan-details';
import {StaffGridService} from '../../../../shared/service/Staffgrid-service';
import createSpyObj = jasmine.createSpyObj;
import {MatDialog} from "@angular/material/dialog";
import {MatTableModule} from "@angular/material/table";

describe('StaffingMatrixSummaryComponent', () => {
  let component: StaffingMatrixSummaryComponent;
  let fixture: ComponentFixture<StaffingMatrixSummaryComponent>;
  let staffGridServiceSpyObj: SpyObj<StaffGridService>=createSpyObj(['autoSaveInterval', 'saveStaffGridDetails']);
  staffGridServiceSpyObj.saveStaffGridDetails.and.returnValue(of());
  const mockRouter = jasmine.createSpyObj(['navigate']);
  const mockMatDialog = jasmine.createSpyObj({
    afterClosed: createSpy('name',function () {
      return of();

    }).and.callThrough(), close: null, open: createSpy('open', function() {
      return this;
    })
  });
  mockMatDialog.componentInstance = {body: ''};
  let testPlanDetails;
  let mockHttpClient;
  let flag=true;
  const pdfServiceSpyObj: SpyObj<PdfDataService> = jasmine.createSpyObj(['createPdf']);
  beforeEach(waitForAsync(() => {
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(flag);
        }
      }

    });
    TestBed.configureTestingModule({
      declarations: [StaffingMatrixSummaryComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{provide: Router, useValue: mockRouter}, {provide: MatDialog, useValue: mockMatDialog}
        , {provide: HttpClient, useValue: mockHttpClient}, {provide: StaffGridService, useValue: staffGridServiceSpyObj}, {provide: PdfDataService, useValue: pdfServiceSpyObj}],
      imports: [
        MatTableModule,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffingMatrixSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    testPlanDetails = planDetailsData();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should getColumnDefention be called by ngOnInit', () => {
    spyOn(component, 'getColumnDefenition');
    component.planDetails = testPlanDetails[0];
    component.ngOnInit();
    expect(component.getColumnDefenition).toHaveBeenCalled();
    expect(component.staffingSummaryData).toEqual(testPlanDetails[0].staffingSummaryData);
    expect(component.dataSource).not.toBe(null);
    expect(component.dataSource).toBeDefined();
  });
  it('should define column by calling getColumnDefenition', () => {
    component.getColumnDefenition();
    for (let x = 0; x < component.displayCols.length; x++) {
      expect(component.displayCols[x]).toBe(component.colDefs[x].id);
    }
  });
  it('should check productivity index and return false', () => {
    expect(component.checkProductivityIndex(1)).toBeTruthy();
  });
  it('should check productivity index and return true', () => {
    component.planDetails.lowerEndTarget = 99;
    component.planDetails.upperEndTarget = 101;
    expect(component.checkProductivityIndex(1)).toBeTruthy();
  });
  it('should get best option', () => {
    component.staffingSummaryData = testPlanDetails[0].staffingSummaryData;
    component.staffingSummaryData[0] = testPlanDetails[0].staffingSummaryData[0];
    component.getBestOption(0);
    expect(component.getBestOption(0)).toBe(1);
  });
  xit('should click on add schedule and add it', ()  => {
    component.clickonAddSchedule();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/staff-schedule']);
  });
  it('should click on add schedule ', function () {
    spyOn(component,'saveStaffGridDetailsandGoBack').and.stub();
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(flag, ConfirmWindowOptions.save);
        }
      }

    });
    component.planEdited=true;
    component.clickonAddSchedule();
    expect(mockRouter.navigate).not.toHaveBeenCalledWith('/staff-schedule');
    expect(component.saveStaffGridDetailsandGoBack).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
  it('should click on add schedule ', function () {
    flag=false;
    component.planEdited=true;
    component.clickonAddSchedule();
    expect(mockRouter.navigate).not.toHaveBeenCalledWith('/staff-schedule');
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
  it('should generate pdf', function () {
    component.generatePdf();
    expect(pdfServiceSpyObj.createPdf).toHaveBeenCalled()
  });
  it('should get best option', function () {
    component.staffingSummaryData = testPlanDetails[0].staffingSummaryData;
    component.staffingSummaryData[0] = testPlanDetails[0].staffingSummaryData[0];
    component.getBestOption(0);
    expect(component.getBestOption(0)).toBe(component.staffingSummaryData[0].census)
  });
  it('should find a leap year', function () {
    component.planDetails.effectiveEndDate=new Date('01/04/2020');
    expect(component.findLeapYear()).toBe(366);
  });
  it('should not find a leap year', function () {
    component.planDetails.effectiveEndDate=new Date('01/03/2019');
    expect(component.findLeapYear()).toBe(365);
  });
  it('should round average number', function () {
    expect(component.roundAverage(1.6)).toBe(1)
  });
  it('should check number', function () {
    expect(component.check(1)).toBe(true)
  });
  it('should save staff grid details ', function () {
    testPlanDetails[0].planCompleted=true;
    component.planDetails=testPlanDetails[0];
    component.planDetails.planCompleted = false;
    component.saveStaffGridDetailsandGoBack();
  });
});
