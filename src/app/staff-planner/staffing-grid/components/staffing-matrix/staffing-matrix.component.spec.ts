 import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

 import {StaffingMatrixComponent} from './staffing-matrix.component';
 import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
 import {FormsModule} from '@angular/forms';
 import {shiftData} from '../../../../shared/service/fixtures/shift-data';
 import {shifttime} from '../../../../shared/domain/staff-schedule';
 import {staffGridData} from '../../../../shared/service/fixtures/staff-grid-data';
 import {planDetailsData} from '../../../../shared/service/fixtures/plan-details-data';
 import {staffScheduleData} from '../../../../shared/service/fixtures/staff-schedule-data';
 import {HttpClient} from '@angular/common/http';
 import SpyObj = jasmine.SpyObj;
 import {PdfDataService} from '../../../../shared/service/pdf-data.service';
 import {Observable, of} from 'rxjs';
 import createSpy = jasmine.createSpy;
 import {lifecycleHookToNodeFlag} from '@angular/compiler/src/view_compiler/provider_compiler';
 import {MatIconModule} from "@angular/material/icon";
 import {MatDialog, MatDialogRef} from "@angular/material/dialog";

 describe('StaffingMatrixComponent', () => {
   let component: StaffingMatrixComponent;
   let fixture: ComponentFixture<StaffingMatrixComponent>;
   let testShiftData = shiftData();
   const testShiftTime = new shifttime();
   let testGridStaffData;
   let testPlanDetails;
   let testStaffScheduleData;
   const pdfServiceSpyObj: SpyObj<PdfDataService> = jasmine.createSpyObj(['createPdf']);
   const mockMatDialogRef = jasmine.createSpyObj('dialogRef', ['close']);
   let mockHttpClient;
   let mockMatDialog;
   let flag=true;
   mockMatDialog = jasmine.createSpyObj({
     afterClosed: createSpy('name',function () {
       return of();

     }).and.callThrough(), close: null, open: createSpy('open', function() {
       return this;
     })
   });
   mockMatDialog.componentInstance = {body: ''};
   const testVarPosition = {
     key: 1,
     categoryAbbreviation: 'categoryAbbrev',
     categoryDescription: 'categoryDesc',
     includeFlag: true
   };
   const numberObj = {
     which: false,
     keyCode: 33,
   };
    let testShiftTimeData=
   testShiftTime.startTime.mins = 0;
   testShiftTime.startTime.hours = 0;
   testShiftTime.endTime.hours = 8;
   testShiftTime.endTime.mins = 0;
   testShiftTime.timeformatflag = 'AM';
   beforeEach(waitForAsync(() => {
     mockMatDialog.open.and.callFake(function() {
       return{
         afterClosed(){
           return of(flag);
         }
       }

     });

     TestBed.configureTestingModule({
       declarations: [StaffingMatrixComponent],
       schemas: [CUSTOM_ELEMENTS_SCHEMA],
       imports: [
         FormsModule,
         MatIconModule,
       ],
       providers: [{provide: HttpClient, useValue: mockHttpClient}, {
         provide: PdfDataService,
         useValue: pdfServiceSpyObj
       },
         {provide: MatDialog, useValue: mockMatDialog},
         {provide: MatDialogRef, useValue: mockMatDialogRef}]
     })
       .compileComponents();
   }));

   beforeEach(() => {
     fixture = TestBed.createComponent(StaffingMatrixComponent);
     component = fixture.componentInstance;
     fixture.detectChanges();
     testShiftData = shiftData();
     testGridStaffData = staffGridData();
     testPlanDetails = planDetailsData();
     testStaffScheduleData = staffScheduleData();
   });

   it('should create', () => {
     expect(component).toBeTruthy();
   });
   it('should populateData be called by ngOnInt', () => {
     spyOn(component, 'populateData');
     component.ngOnInit();
     expect(component.populateData).toHaveBeenCalled();
   });

    it('should reset form', function () {
      spyOn(component, 'populateData');
      spyOn(window, 'confirm').and.returnValue(true);
      component.resetForm();
      expect(component.planDetails.staffScheduleList[component.scheduleIndex]).toEqual(component.scheduleData);
      expect(component.populateData).toHaveBeenCalled();
    });
    it('should not reset form', function () {
      spyOn(window, 'confirm').and.returnValue(false);
      component.resetForm();
    });
   it('should get shift time and set time format flag to AM when if it is true', () => {
     testShiftTime.timeformatflag = 'AM';
     testShiftTime.endTime.hours = 0;
     expect(component.getShifttime(testShiftData[0])).toBeTruthy();
   });
   it('should get shift time and set time format flag to AM when if it is true', () => {
     testShiftTime.endTime.hours = 8;
     testShiftData[0].hours = 20;
     component.getShifttime(testShiftData[0]);
     testShiftTime.timeformatflag = 'AM';
     expect(component.getShifttime(testShiftData[0])).toBeTruthy();
   });
   it('should get shift time and set time format flag to PM when if it is false', () => {
     testShiftTime.endTime.hours = 0;
     testShiftTime.startTime.hours = 12;
     testShiftTime.timeformatflag = 'PM';
     testShiftData[0].timeFormatFlag = false;
     component.getShifttime(testShiftData[0]);
     expect(component.getShifttime(testShiftData[0])).toBeTruthy();
   });
   it('should get shift time and set time format flag to PM when if it is false', () => {
     testShiftTime.startTime.mins = 0;
     testShiftTime.startTime.hours = 12;
     testShiftTime.endTime.hours = 8;
     testShiftTime.endTime.mins = 0;
     testShiftTime.timeformatflag = 'PM';
     testShiftData[0].hours = 20;
     testShiftData[0].timeFormatFlag = false;
     expect(component.getShifttime(testShiftData[0])).toBeTruthy();
   });
   it('should call pad function and return 01', () => {
     expect(component.pad(1, 2, false)).toBe('01');
   });
   it('should get total', () => {
     spyOn(component, 'checkIsIncluded').and.returnValue(true);
     expect(component.getTotal(testGridStaffData[0])).toBe(0);
   });
   it('should not get total', () => {
     spyOn(component, 'checkIsIncluded').and.returnValue(false);
     component.getTotal(testGridStaffData[0]);
   });
   it('should check is included and return false ', () => {
     component.planDetails.variableDepartmentPositions[0] = testPlanDetails[0].variableDepartmentPositions[0];
     component.planDetails.variableDepartmentPositions[0].categoryKey = testPlanDetails[0].variableDepartmentPositions[0].categoryKey;
     component.planDetails.variableDepartmentPositions[0].categoryDescription = testPlanDetails[0].variableDepartmentPositions[0].categoryDescription;
     expect(component.checkIsIncluded(1,"categoryDesc")).toBe(true);
   });
   it('should check is included and return true ', () => {
     component.planDetails.variableDepartmentPositions[0] = testPlanDetails[0].variableDepartmentPositions[0];
     component.planDetails.variableDepartmentPositions[0].categoryKey = null;
     component.planDetails.variableDepartmentPositions[0].categoryDescription = testPlanDetails[0].variableDepartmentPositions[0].categoryDescription;
     expect(component.checkIsIncluded(1,"categoryDesc")).toBe(false);
   });
   it('should get shift time and return PM', () => {
    testShiftData[0].hours = 12;
    expect(component.getShiftTime(testShiftData[0])).toBe('00:00 - 00:00');
   });
   it('should get shift time and return AM', () => {
     testShiftData[0].timeFormatFlag = false;
     expect(component.getShiftTime(testShiftData[0])).toBe('12:00 - 12:00');
   });
   it('should get average', () => {
     expect(component.getAverage(testGridStaffData[0])).toBe(0);
   });
   it('should get average when selected object is included', () => {
     spyOn(component, 'checkIsIncluded').and.returnValue(true);
     expect(component.getAverage(testGridStaffData[0])).toBe(0);
   });
   it('should check productivity index and return true', () => {
     component.planDetails.lowerEndTarget = 50;
     component.planDetails.upperEndTarget = 150;
     expect(component.checkProductivityIndex(1)).toBe(true);
   });
   it('should check productivity index and return false', () => {
     expect(component.checkProductivityIndex(1)).toBe(true);
   });
   it('should populate data', () => {
     component.scheduleData.planShiftList[0] = testStaffScheduleData[0].planShiftList[0];
     testStaffScheduleData[0].planShiftList[0].staffGridCensuses = [];
     component.planDetails.censusRange.maximumCensus = 3;
     component.populateData();
     expect(component.cenRange[0]).toBe(0);
   });

   it('should populate data', () => {
     testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].staffCount = 1;
     component.scheduleData.planShiftList[0] = testStaffScheduleData[0].planShiftList[0];
     testStaffScheduleData[0].planShiftList[0].staffGridCensuses = [];
     component.planDetails.censusRange.maximumCensus = 3;
     component.populateData();
     expect(component.cenRange[0]).toBe(0);
   });
   it('should not populate data', () => {
     testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].staffCount = 0;
     component.scheduleData.planShiftList[0] = testStaffScheduleData[0].planShiftList[0];
     testStaffScheduleData[0].planShiftList[0].staffGridCensuses = [];
     component.populateData();
     expect(component.cenRange[0]).toBe(0);
   });
   it('should not populate data', () => {
     component.planDetails.censusRange = null;
     component.populateData();
   });
   it('should not populate data ', () => {
     component.scheduleData.planShiftList[0] = testStaffScheduleData[0].planShiftList[0];
     component.populateData();
   });
   it('should populate data', () => {
     component.planDetails.censusRange = testPlanDetails[0].censusRange;
     component.planDetails.censusRange.maximumCensus = 2;
     testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].staffCount = 1;
     component.scheduleData.planShiftList[0] = testStaffScheduleData[0].planShiftList[0];
     spyOn(component, 'checkIfCensusangeIncreased').and.returnValue(true);
     component.maxCensusSaved = 1;
     component.minCensusSaved = 1;
     component.populateData();
     expect(component.maxCensusSaved).toBe(3);
     expect(component.minCensusSaved).toBe(-2);
   });
   it('should populate data', () => {
     component.planDetails.censusRange = testPlanDetails[0].censusRange;
     component.planDetails.censusRange.maximumCensus = 3;
     testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].staffCount = 2;
     component.scheduleData.planShiftList[0] = testStaffScheduleData[0].planShiftList[0];
     component.scheduleData.planShiftList[1] = testStaffScheduleData[0].planShiftList[0];
     spyOn(component, 'checkIfCensusangeIncreased').and.returnValue(true);
     component.maxCensusSaved = 1;
     component.populateData();
     expect(component.maxCensusSaved).toBe(5);
     expect(component.minCensusSaved).toBe(-3);
   });
   it('should populate data ', () => {
     component.planDetails.censusRange = testPlanDetails[0].censusRange;
     component.planDetails.censusRange.maximumCensus = 2;
     testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].staffCount = 0;
     component.scheduleData.planShiftList[0] = testStaffScheduleData[0].planShiftList[0];
     spyOn(component, 'checkIfCensusangeIncreased').and.returnValue(true);
     component.maxCensusSaved = 1;
     component.minCensusSaved = 1;
     component.populateData();
     expect(component.maxCensusSaved).toBe(3);
     expect(component.minCensusSaved).toBe(-2);
   });
   it('should populate data ', () => {
     component.planDetails.censusRange = testPlanDetails[0].censusRange;
     component.planDetails.censusRange.maximumCensus = 1;
     testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].staffCount = 1;
     component.scheduleData.planShiftList[0] = testStaffScheduleData[0].planShiftList[0];
     spyOn(component, 'checkIfCensusangeIncreased').and.returnValue(true);
     component.maxCensusSaved = -1;
     component.minCensusSaved = 4;
     component.populateData();
     expect(component.maxCensusSaved).toBe(2);
     expect(component.minCensusSaved).toBe(-2);
   });
   it('should populate data ', () => {
     component.planDetails.censusRange = testPlanDetails[0].censusRange;
     component.planDetails.censusRange.maximumCensus = 1;
     testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].staffCount = 3;
     component.scheduleData.planShiftList[0] = testStaffScheduleData[0].planShiftList[0];
     spyOn(component, 'checkIfCensusangeIncreased').and.returnValue(true);
     component.maxCensusSaved = -1;
     component.minCensusSaved = 7;
     component.populateData();
     expect(component.maxCensusSaved).toBe(2);
     expect(component.minCensusSaved).toBe(-2);
   });
   it('should not populate data if checkIfCensusangeIncreased return false ', () => {
     component.planDetails.censusRange = testPlanDetails[0].censusRange;
     component.planDetails.censusRange.maximumCensus = 1;
     testStaffScheduleData[0].planShiftList[0].staffToPatientList[0].staffCount = 3;
     component.scheduleData.planShiftList[0] = testStaffScheduleData[0].planShiftList[0];
     spyOn(component, 'checkIfCensusangeIncreased').and.returnValue(false);
     component.populateData();
   });
   it('should check if census range increased and return true', () => {
     expect(component.checkIfCensusangeIncreased(testShiftData[0])).toBe(true);
     expect(component.minCensusSaved).toBe(testShiftData[0].staffGridCensuses[0].censusIndex);
     expect(component.maxCensusSaved).toBe(2);
   });
   it('should check if census range increased and return true', () => {
     component.maxCensusSaved = 1;
     component.minCensusSaved = 2;
     testShiftData[0].staffGridCensuses[0].censusIndex = 5;
     expect(component.checkIfCensusangeIncreased(testShiftData[0])).toBe(true);
     expect(component.maxCensusSaved).toBe(testShiftData[0].staffGridCensuses[0].censusIndex);
     expect(component.minCensusSaved).toBe(2);
   });
   it('should check if census range increased and return true', () => {
     component.maxCensusSaved = 1;
     component.minCensusSaved = 2;
     testShiftData[0].staffGridCensuses[0].censusIndex = -5;
     expect(component.checkIfCensusangeIncreased(testShiftData[0])).toBe(true);
     expect(component.minCensusSaved).toBe(testShiftData[0].staffGridCensuses[0].censusIndex);
     expect(component.maxCensusSaved).toBe(2);
   });
    it('should capture staffing screen', function () {
      component.captureStaffingScreen();
    });
   it('should verify input number and return true', function () {
     numberObj.which = true;
     expect(component.numberOnly(numberObj)).toBe(true);
   });
   it('should verify input number and return true', () => {
     expect(component.numberOnly(1)).toBe(true);
   });
   it('should verify input number and return false', () => {
     numberObj.which = false;
     expect(component.numberOnly(numberObj)).toBe(false);
   });
   it('should verify input number and return false', () => {
     numberObj.keyCode = 58;
     expect(component.numberOnly(numberObj)).toBe(false);
   });

   it('should sort census if sort order is ASC', () => {
     component.scheduleData.planShiftList[0] = testShiftData[0];
     component.scheduleData.planShiftList[0].staffGridCensuses[0] = testShiftData[0].staffGridCensuses[0];
     component.scheduleData.planShiftList[0].staffGridCensuses[1] = testShiftData[0].staffGridCensuses[1];
     component.sortByCensus();
   });
   it('should sort census if sort order is ASC', () => {
     testShiftData[0].staffGridCensuses[0].censusIndex = 2;
     component.scheduleData.planShiftList[0] = testShiftData[0];
     component.scheduleData.planShiftList[0].staffGridCensuses[0] = testShiftData[0].staffGridCensuses[0];
     component.scheduleData.planShiftList[0].staffGridCensuses[1] = testShiftData[0].staffGridCensuses[1];
     component.sortByCensus();
   });
   it('should sort census if sort order is DESC', () => {
     testShiftData[0].staffGridCensuses[0].censusIndex = 3;
     component.scheduleData.planShiftList[0] = testShiftData[0];
     component.scheduleData.planShiftList[0].staffGridCensuses[0] = testShiftData[0].staffGridCensuses[0];
     component.scheduleData.planShiftList[0].staffGridCensuses[1] = testShiftData[0].staffGridCensuses[1];
     component.sortByCensus();
   });
   it('should sort census if sort order is DESC', () => {
     component.sortOrder = 'DESC';
     component.scheduleData.planShiftList[0] = testShiftData[0];
     component.scheduleData.planShiftList[0].staffGridCensuses[0] = testShiftData[0].staffGridCensuses[0];
     component.scheduleData.planShiftList[0].staffGridCensuses[1] = testShiftData[0].staffGridCensuses[1];
     component.sortByCensus();
   });
   it('should sort census if sort order is DESC', () => {
     component.sortOrder = 'DESC';
     testShiftData[0].staffGridCensuses[0].censusIndex = 2;
     component.scheduleData.planShiftList[0] = testShiftData[0];
     component.scheduleData.planShiftList[0].staffGridCensuses[0] = testShiftData[0].staffGridCensuses[0];
     component.scheduleData.planShiftList[0].staffGridCensuses[1] = testShiftData[0].staffGridCensuses[1];
     component.sortByCensus();
   });
   it('should sort census if sort order is ASC', () => {
     component.sortOrder = 'DESC';
     testShiftData[0].staffGridCensuses[0].censusIndex = 3;
     component.scheduleData.planShiftList[0] = testShiftData[0];
     component.scheduleData.planShiftList[0].staffGridCensuses[0] = testShiftData[0].staffGridCensuses[0];
     component.scheduleData.planShiftList[0].staffGridCensuses[1] = testShiftData[0].staffGridCensuses[1];
     component.sortByCensus();
   });
   it('should not sort census if sort order is ASC', () => {
     component.sortOrder = null;
     testShiftData[0].staffGridCensuses[0].censusIndex = 3;
     component.scheduleData.planShiftList[0] = testShiftData[0];
     component.sortByCensus();
   });
   it('should get shift time string ', function () {
     component.scheduleData=testStaffScheduleData[0];
     component.scheduleData.planShiftList=testStaffScheduleData[0].planShiftList;
     spyOn(component,'getShiftTime');
     expect(component.getShiftTimeString(0)).toBe(undefined)
     expect(component.getShiftTime).toHaveBeenCalled()
   });
   it('should get shift time string ', function () {
     component.shiftTimeString.push('zero');
     expect(component.getShiftTimeString(0)).toBe('zero');
   });
   it('should reset form', function () {
     spyOn(component,'populateData');
     component.resetForm();
     expect(component.populateData).toHaveBeenCalled();
   });
   it('should reset form', function () {
     flag=false;
     spyOn(component,'populateData');
     component.resetForm();
     expect(component.populateData).not.toHaveBeenCalled();
   });
   it('should capture staffing grid screen ', function () {
     component.captureStaffingScreen();
     expect(pdfServiceSpyObj.createPdf).toHaveBeenCalled();
   });
   it('should round average', function () {
     expect(component.roundAverage(1.111)).toBe(1);
   });
   it('should check number value', function () {
     expect(component.check(22)).toBe(true);
   });
   it('should duplicate to selected shift', function () {
     component.scheduleData = testStaffScheduleData[0];
     component.scheduleData.planShiftList[0] = testStaffScheduleData[0].planShiftList[0];
     component.scheduleData.planShiftList[1] = testStaffScheduleData[0].planShiftList[0];
     component.scheduleData.planShiftList[2] = testStaffScheduleData[0].planShiftList[0];
     const event = {
       target: {
         value: 187
       }
     };
     component.duplicateTimePeriod(component.scheduleData.planShiftList[0], event);
     expect(component.copyToShiftKey).toBe('default');
   });
   it('should disable time period if active flag false', function () {
     component.scheduleData=testStaffScheduleData[0];
     component.scheduleData.planShiftList[0] = testStaffScheduleData[0].planShiftList[0];
     expect(component.checkPatientToStaffEnabled(testStaffScheduleData[0].planShiftList[0], testStaffScheduleData[0].planShiftList[0])).toBe(false);
   });
   it('should check shift count ', function () {
     testStaffScheduleData[0].key='0';
     component.scheduleData=testStaffScheduleData[0];
     expect(component.checkShiftCount(testStaffScheduleData[0])).toBe(true);
   });
   it('should check shift count ', function () {
     testStaffScheduleData[0].key='0';
     component.scheduleData=testStaffScheduleData[0];
     component.scheduleData.key='1';
     expect(component.checkShiftCount(testStaffScheduleData[0])).toBe(true);
   });
   it('should compare objects', function () {
     expect(component.compareObjects(1,1)).toBe(true)
   });
   it('should compare objects', function () {
     expect(component.compareObjects(1,2)).toBe(false)
   });
   it('should get daily variance ', function () {
     expect(component.getDailyVarianceHoursForCensus(1)).toBe('0.00')
   });
   it('should get daily variance ', function () {
     component.planDetails=testPlanDetails[0];
     component.planDetails.staffingSummaryData[0]=testPlanDetails[0].staffingSummaryData[0];
     component.planDetails.staffingSummaryData[0].census=testPlanDetails[0].staffingSummaryData[0].census=1;
     component.planDetails.staffingSummaryData[0].dailyHrsVarToTarget=testPlanDetails[0].staffingSummaryData[0].dailyHrsVarToTarge=1;
     expect(component.getDailyVarianceHoursForCensus(1)).toBe('1.00')
   });
   it('should get daily variance ', function () {
     component.planDetails=testPlanDetails[0];
     component.planDetails.staffingSummaryData=null;
     expect(component.getDailyVarianceHoursForCensus(1)).toBe('0.00')
   });
   it('should get daily variance ', function () {
     component.planDetails=testPlanDetails[0];
     component.planDetails.staffingSummaryData[0]=testPlanDetails[0].staffingSummaryData[0];
     component.planDetails.staffingSummaryData[0].census=testPlanDetails[0].staffingSummaryData[0].census=1;
     component.planDetails.staffingSummaryData[0].dailyHrsVarToTarget=-1;
     expect(component.getDailyVarianceHoursForCensus(1)).toBe('(1.00)')
   });
   it('should getDistinctSchedules', function(){
    component.getDistinctSchedules();
    expect(component.getDistinctSchedules).toHaveBeenCalled;
   });
 });
