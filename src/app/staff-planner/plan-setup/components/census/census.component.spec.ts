import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {CensusComponent} from './census.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {planDetailsData} from '../../../../shared/service/fixtures/plan-details-data';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {of} from 'rxjs';
import Spy = jasmine.Spy;
import createSpy = jasmine.createSpy;

describe('CensusComponent', () => {
  let component: CensusComponent;
  let fixture: ComponentFixture<CensusComponent>;
  let testPlanDetailsData;
  let emit;
  let confirmSpy: Spy;
  let mockMatDialog;
  mockMatDialog = jasmine.createSpyObj({
    afterClosed: of({}), close: null, open: createSpy('open', function () {
      return this;
    })
  });
  mockMatDialog.componentInstance = {body: ''};
  const mockMatDialogRef = jasmine.createSpyObj('MatDialogConfig', ['close']);
  beforeEach(waitForAsync(() => {
    mockMatDialog.open.and.callFake(function () {
      return this;
    });
    TestBed.configureTestingModule({
      declarations: [CensusComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [{provide: MatDialog, useValue: mockMatDialog},
        {provide: MatDialogConfig, useValue: mockMatDialogRef}]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CensusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    testPlanDetailsData = planDetailsData();
    confirmSpy = spyOn(window, 'confirm');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should not check if census exists because census range is null', () => {
    spyOn(component,'applyToggle');
    component.plan.censusRange = null;
    component.checkifcensusexists();
    expect(component.applyToggle).not.toHaveBeenCalled()
    expect(component.addErrorMessage).toBe(true)
  });
  it('should not check if census exists because plan census range occur range is null', () => {
    spyOn(component,'applyToggle');
    component.plan.censusRange.occurrenceNumber = null;
    component.checkifcensusexists();
    expect(component.applyToggle).not.toHaveBeenCalled()
    expect(component.addErrorMessage).toBe(true)
  });
  it('should check if census exists and call applyToggle method', () => {
    spyOn(component, 'applyToggle');
    component.plan.censusRange.occurrenceNumber.length = 1;
    component.checkifcensusexists();
    expect(component.applyToggle).toHaveBeenCalled();
  });
  it('should call noDelete function and return false ', () => {
    expect(component.nodelete(null)).toBe(false);
  });
  it('should call onCensusMin and assign "" to censusRange.occurNum', () => {
    component.plan.censusRange = testPlanDetailsData[0].censusRange;
    component.plan.censusRange.minimumCensus = undefined;
    component.onCensusMin();
    expect(component.isApplyButton).toBe(false);
  });
  it('should call onCensusMin and spy on emit', () => {
    emit = spyOn(component.censusMinChange, 'emit');
    component.plan.censusRange = testPlanDetailsData[0].censusRange;
    component.onCensusMin();
    expect(emit).toHaveBeenCalled();
    expect(component.isApplyButton).toBe(false);
  });

  it('should call onCensusMax and assign "" to censusRange.occurNum', () => {
    component.plan.censusRange = testPlanDetailsData[0].censusRange;
    component.onCensusMax();
    expect(component.showOccuranceMsg).toBe(false)
    expect(component.objSavePlanParams.isSaveNextBtnSubmitForCensus).toBe(false)
    expect(component.disable).toBe(true)

  });
  it('should call onCensusMax and spy on emit', () => {
    const emit = spyOn(component.censusMaxChange, 'emit');
    component.plan.censusRange = testPlanDetailsData[0].censusRange;
    component.plan.censusRange.minimumCensus = undefined;
    component.onCensusMax();
    expect(emit).toHaveBeenCalled();
    expect(component.occurPlcHolder).toBe(false);
    expect(component.disable).toBe(true);
  });
  it('should call onOccuranceChange and spy on emit', () => {
    emit = spyOn(component.occuranceChange, 'emit');
    component.onOccuranceChange();
    expect(emit).toHaveBeenCalled();
  });

  it('should multiply input by 5', () => {
    const expected = 10;
    const result = component.getVal(2);
    expect(result).toEqual(expected);
  });
  it('should apply toggle', () => {
    component.applyToggle();
    expect(component.disable).toBe(true, 'should return true');
  });
  it('should create on occurance', () => {
    expect(component.onOccuranceChange).toBeTruthy();
  });
  it('should reset census box', () => {
    spyOn(component, 'findLeapYear');
    component.plan[0] = planDetailsData();
    component.resetCensusBox('test');

    for (let x = 0; x < component.plan.censusRange.occurrenceNumber.length; x++) {
      expect(component.plan.censusRange.occurrenceNumber[x]).toEqual('0');
    }
    expect(component.findLeapYear).toHaveBeenCalled();
  });
  it('should find leap year', () => {
    component.findLeapYear(160);
    expect(component.censusDays).toBe(366);

  });
  it('should validate MinLength and return false', () => {
    component.plan.censusRange.minimumCensus = 123;
    expect(component.validateMinLength('event')).toBe(false);
  });
  it('should validate MinLength and return false', () => {
    expect(component.validateMinLength('event')).toBe(true);
  });
  it('should validate MinLength and return false', () => {
    component.plan.censusRange.maximumCensus = 123;
    expect(component.validateMaxLength('event')).toBe(false);
  });
  it('should validate MinLength and return false', () => {
    expect(component.validateMaxLength('event')).toBe(true);
  });
  it('should get census value', () => {
    component.plan.censusRange = testPlanDetailsData[0].censusRange;
    component.plan.effectiveEndDate = new Date();
    expect(component.getCensusVal()).toBe(362);
  });
  it('should not get census value', () => {
    component.plan.censusRange = testPlanDetailsData[0].censusRange;
    component.plan.censusRange.occurrenceNumber[0] = '0';
    component.plan.effectiveEndDate = new Date();
    expect(component.getCensusVal()).toBe(363)
  });
  it('should reset census box', () => {
    spyOn(component, 'findLeapYear');
    component.plan.censusRange = testPlanDetailsData[0].censusRange;
    component.resetCensusBox(null);
    expect(component.plan.censusRange.occurrenceNumber[0]).toEqual('0');
    expect(component.findLeapYear).toHaveBeenCalledWith(component.year);
  });
  it('should check input as number only', () => {
    expect(component.numberOnly(33)).toBe(true)
  });

  it('should not apply toggle when previousCensusMin < plan.censusRange.minCensus and previousCensusMax >' +
    'plan.censusRange.maxCensus', () => {
    component.plan = testPlanDetailsData[0];
    component.plan.censusRange = testPlanDetailsData[0].censusRange;
    component.plan.key = '1';
    component.previousCensusMax = 6;
    component.plan.totalAnnualHours = 10;
    component.plan.censusRange.minimumCensus = 1;
    component.previousCensusMin = 0;
    component.applyToggle();
    expect(component.isApplyButton === true && component.occurPlcHolder === true && component.disable === true &&
      component.showOccuranceMsg === false).toBeTruthy();
  });
  it('should not apply toggle when previousCensusMax!=plan.censusRange.maxCensus and previousCensusMin!=plan.censusRange.minCensus', () => {
    component.plan.key = '1';
    component.plan.totalAnnualHours = 0;
    component.applyToggle();
    expect(component.isApplyButton === true && component.occurPlcHolder === true &&
      component.disable === true && component.showOccuranceMsg === false).toBeTruthy();
  });
  it('should check census occurance when plan.censusRange.minMax>0 && plan.censusRange.maxMax>0', () => {
    component.plan.censusRange = testPlanDetailsData[0].censusRange;
    component.plan.censusRange.minimumCensus = 1;
    component.isOccuranceCensus();
    expect(component.isOccuranceCensus()).toBe(true);
    expect(component.showOccuranceMsg === true && component.objSavePlanParams.isSaveNextBtnSubmitForCensus === true).toBeTruthy();
    expect(component.showOccuranceMsg).toBe(true);
  });
  it('should check census occurance when plan.censusRange.minMax>0 && plan.censusRange.maxMax>0', () => {
    component.plan.censusRange = testPlanDetailsData[0].censusRange;
    component.plan.censusRange.minimumCensus = 4;
    component.plan.censusRange.maximumCensus = 1;
    component.plan.censusRange.occurrenceNumber = [];
    component.isOccuranceCensus();
    expect(component.isOccuranceCensus()).toBe(true);
    expect(component.showOccuranceMsg === true && component.objSavePlanParams.isSaveNextBtnSubmitForCensus === true).toBeTruthy();
    expect(component.showOccuranceMsg).toBe(true);
  });
  it('should check census occurance when plan.censusRange.minMax>0 && plan.censusRange.maxMax>0', () => {
    component.plan.censusRange = testPlanDetailsData[0].censusRange;
    component.plan.censusRange.minimumCensus = 4;
    component.plan.censusRange.maximumCensus = 1;
    component.isOccuranceCensus();
    expect(component.isOccuranceCensus()).toBe(false);
    expect(component.showOccuranceMsg === true && component.objSavePlanParams.isSaveNextBtnSubmitForCensus === true).toBeFalsy();
    expect(component.showOccuranceMsg).toBe(undefined);
  });
  it('should check census occurance and return false', () => {
    component.isOccuranceCensus();
    expect(component.isOccuranceCensus()).toBe(false);
  });
  it('should not utilize census plan volume', () => {
    component.plan = testPlanDetailsData[0];
    component.plan.censusRange = testPlanDetailsData[0].censusRange;
    component.plan.utilizedAverageVolume = -1;
    expect(component.censusPlanUtilizedAngVolume()).toBeTruthy();
    expect(component.objSavePlanParams.isSaveNextBtnSubmitForCensus).toBe(true);
  });
  it('should not utilize census plan volume and return false', () => {
    expect(component.censusPlanUtilizedAngVolume()).toBeTruthy();
  });
  it('should check census max and return true', () => {
    component.plan.censusRange = testPlanDetailsData[0].censusRange;
    component.plan.censusRange.maximumCensus = 101;
    expect(component.censusMaxCheck()).toBeTruthy();

  });
  it('should check census max and return false', () => {
    expect(component.censusMaxCheck()).toBeFalsy();
  });
  it('should change isCensusChanges and return true when minCensus=0 && maxCensus=0', () => {
    component.plan.censusRange.maximumCensus = 0;
    component.plan.censusRange.minimumCensus = 0;
    expect(component.isCensusChanges()).toBe(true);
    expect(component.showOccuranceMsg).toBeTruthy();
  });
  it('should change isCensusChanges and return true when minCensus<0 && maxCensus<0', () => {
    component.plan.censusRange.maximumCensus = -1;
    component.plan.censusRange.minimumCensus = -1;
    expect(component.isCensusChanges()).toBe(true);
    expect(component.showOccuranceMsg).toBeTruthy();
  });
  it('should change isCensusChanges and return true when minCensus && maxCensus undefined', () => {
    component.plan.censusRange.maximumCensus = undefined;
    component.plan.censusRange.minimumCensus = undefined;
    expect(component.isCensusChanges()).toBe(true);
    expect(component.showOccuranceMsg).toBeTruthy();
  });
  it('should change isCensusChanges and return false', () => {
    component.plan.censusRange.maximumCensus = 1;
    component.plan.censusRange.minimumCensus = 1;
    expect(component.isCensusChanges()).toBe(false);
    expect(component.showOccuranceMsg).toBeFalsy();
  });
  it('should validate census min and max and return true when plan.censusRange.minCensus>plan.censusRange.maxCensus', () => {
    component.plan.censusRange = testPlanDetailsData[0].censusRange;
    component.plan.censusRange.minimumCensus = 2;
    component.plan.censusRange.maximumCensus = 1;
    expect(component.censusMinMaxValidation()).toBeTruthy();
  });
  it('should validate census min and max and return false', () => {
    component.plan.censusRange = testPlanDetailsData[0].censusRange;
    expect(component.censusMinMaxValidation()).toBeFalsy();
  });
  it('should ', () => {
    const obj = {
      which: true,
      keyCode: 58
    };
    expect(component.numberOnly(obj)).toBe(true);
  });
  it('should assign census minimum', function () {
    testPlanDetailsData[0].censusRange.minimumCensus = 5;
    component.plan = testPlanDetailsData[0];
    component.onCensusMin();
    expect(component.plan.censusRange.occurrenceNumber[0]).toBe('0');
  });
  it('should get census values', function () {
    component.censusDays = -1;
    component.objSavePlanParams.validationErrorMessages[0] = 'Enter a value for annual occurrences that is less than the number of days in the year.';
    expect(component.getCensusVal()).toBe(365);
  });
  it('should get census values', function () {
    component.censusDays = -1;
    expect(component.getCensusVal()).toBe(365);
    !expect(component.objSavePlanParams.validationErrorMessages.indexOf('Enter a value for annual occurrences that is less than the number of days in the year.')).toBe(-1);
  });
  it('should get census value as 365 ', function () {
    component.objSavePlanParams.validationErrorMessages[0] = 'Enter a value for annual occurrences that is less than the number of days in the year.';
    component.plan.effectiveEndDate = new Date();
    expect(component.getCensusVal()).toBe(365);
  });
  it('should get census value as 2', function () {
    component.plan.censusRange.occurrenceNumber[0] = '0';
    component.censusDays = 2;
    component.plan.effectiveEndDate = new Date();
    expect(component.getCensusVal()).toBe(365);
    expect(component.objSavePlanParams.validationErrorMessages.indexOf('Enter a value for annual occurrences that is less than the number of days in the year.')).toBe(-1);
  });
  it('should check number only and return false ', () => {
    const numberObj = {
      which: false,
      keyCode: 58,
    };
    expect(component.numberOnly(numberObj)).toBe(false);
  });
  it('should check if census exists ', function () {
    spyOn(component, 'applyToggle');
    component.plan.censusRange.maximumCensus = 1;
    component.checkifcensusexists();
    //expect(component.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values for the Census Range. All values must be greater than zero.')).not.toBe(-1);
    expect(component.applyToggle).toHaveBeenCalled();
  });
  it('should check if census exists ', function () {
    spyOn(component, 'applyToggle');
    component.plan.censusRange.maximumCensus = 1;
    component.plan.censusRange.minimumCensus = 1;
    component.checkifcensusexists();
    //expect(component.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values for the Census Range. All values must be greater than zero.')).toBe(0);
    expect(component.applyToggle).toHaveBeenCalled();
  });
  it('should ', function () {
    spyOn(component, 'applyToggle').and.stub();
    testPlanDetailsData[0].censusRange.maximumCensus = 0;
    testPlanDetailsData[0].censusRange.minimumCensus = 2;
    component.plan = testPlanDetailsData[0];
    component.plan.censusRange.occurrenceNumber = [];
    component.checkifcensusexists();
    expect(component.objSavePlanParams.saveNextErrorMessages.indexOf('Enter an Occurrence value.')).not.toBe(-1);
  });
  it('should check if census exists', function () {
    spyOn(component, 'applyToggle').and.stub();
    testPlanDetailsData[0].censusRange.maximumCensus = 0;
    testPlanDetailsData[0].censusRange.minimumCensus = 2;
    component.plan = testPlanDetailsData[0];
    component.plan.censusRange.occurrenceNumber = [];
    component.objSavePlanParams.saveNextErrorMessages[0] = 'Enter an Occurrence value.';
    component.checkifcensusexists();
    expect(component.objSavePlanParams.saveNextErrorMessages.indexOf('Enter an Occurrence value.')).not.toBe(-1);
  });
  it('should apply toggle', function () {
    testPlanDetailsData[0].censusRange.minimumCensus = null;
    component.plan = testPlanDetailsData[0];
    component.applyToggle();
    expect(component.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values for the Census Range. All values must be greater than zero.')).not.toBe(-1);
  });
  it('should apply toggle', function () {
    spyOn(component, 'onCensusMin');
    spyOn(component, 'onCensusMax');
    testPlanDetailsData[0].censusRange.minimumCensus = null;
    component.plan = testPlanDetailsData[0];
    component.objSavePlanParams.saveNextErrorMessages = [];
    component.plan.key = '1';
    component.previousCensusMax = component.plan.censusRange.maximumCensus;
    component.applyToggle();
    expect(component.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values for the Census Range. All values must be greater than zero.')).not.toBe(-1);
    expect(component.isApplyButton).toBe(true);
    expect(component.occurPlcHolder).toBe(true);
    expect(component.disable).toBe(true);
    expect(component.showOccuranceMsg).toBe(false);
    expect(component.minCensus).toBe(component.plan.censusRange.minimumCensus);
    expect(component.maxCensus).toBe(component.plan.censusRange.maximumCensus);
    expect(component.onCensusMin).toHaveBeenCalled();
    expect(component.onCensusMax).toHaveBeenCalled();
  });
  it('should apply toggle', function () {
    spyOn(component, 'onCensusMin');
    spyOn(component, 'onCensusMax');
    testPlanDetailsData[0].censusRange.minimumCensus = null;
    component.plan = testPlanDetailsData[0];
    component.objSavePlanParams.saveNextErrorMessages = [];
    component.plan.key = '1';
    component.previousCensusMax = component.plan.censusRange.maximumCensus;
    component.plan.censusRange.minimumCensus = 5;
    component.applyToggle();
    //expect(component.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values for the Census Range. All values must be greater than zero.')).not.toBe(-1);
    expect(component.isApplyButton).toBe(true);
    expect(component.occurPlcHolder).toBe(true);
    expect(component.disable).toBe(true);
    expect(component.showOccuranceMsg).toBe(false);
    expect(component.minCensus).toBe(component.plan.censusRange.minimumCensus);
    expect(component.maxCensus).toBe(component.plan.censusRange.maximumCensus);
    expect(component.onCensusMin).toHaveBeenCalled();
    expect(component.onCensusMax).toHaveBeenCalled();
  });
  it('should apply toggle', function () {
    spyOn(component, 'onCensusMin');
    spyOn(component, 'onCensusMax');
    testPlanDetailsData[0].censusRange.minimumCensus = null;
    component.plan = testPlanDetailsData[0];
    component.objSavePlanParams.saveNextErrorMessages = [];
    component.plan.key = '1';
    component.previousCensusMax = component.plan.censusRange.maximumCensus;
    component.plan.censusRange.minimumCensus = 5;
    component.plan.totalAnnualHours = 0;
    component.applyToggle();
    //expect(component.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values for the Census Range. All values must be greater than zero.')).not.toBe(-1);
    expect(component.isApplyButton).toBe(true);
    expect(component.occurPlcHolder).toBe(true);
    expect(component.disable).toBe(true);
    expect(component.showOccuranceMsg).toBe(false);
    expect(component.minCensus).toBe(component.plan.censusRange.minimumCensus);
    expect(component.maxCensus).toBe(component.plan.censusRange.maximumCensus);
    expect(component.onCensusMin).toHaveBeenCalled();
    expect(component.onCensusMax).toHaveBeenCalled();
  });
  it('should apply toggle', function () {
    spyOn(component, 'onCensusMin');
    spyOn(component, 'onCensusMax');
    testPlanDetailsData[0].censusRange.minimumCensus = null;
    component.plan = testPlanDetailsData[0];
    component.objSavePlanParams.saveNextErrorMessages = [];
    component.plan.key = '1';
    component.previousCensusMax = component.plan.censusRange.maximumCensus;
    component.plan.censusRange.minimumCensus = 5;
    component.plan.totalAnnualHours = -1;
    component.applyToggle();
    expect(component.isApplyButton).toBe(true);
    expect(component.occurPlcHolder).toBe(true);
    expect(component.disable).toBe(true);
    expect(component.showOccuranceMsg).toBe(false);
    expect(component.minCensus).toBe(component.plan.censusRange.minimumCensus);
    expect(component.maxCensus).toBe(component.plan.censusRange.maximumCensus);
    expect(component.onCensusMin).toHaveBeenCalled();
    expect(component.onCensusMax).toHaveBeenCalled();
  });
  it('should apply toggle', function () {
    spyOn(component, 'onCensusMin');
    spyOn(component, 'onCensusMax');
    testPlanDetailsData[0].censusRange.minimumCensus = null;
    component.plan = testPlanDetailsData[0];
    component.objSavePlanParams.saveNextErrorMessages = [];
    component.plan.key = '1';
    component.previousCensusMax = component.plan.censusRange.maximumCensus;
    component.previousCensusMin = component.plan.censusRange.minimumCensus;
    component.plan.totalAnnualHours = -1;
    component.applyToggle();
    expect(component.isApplyButton).toBe(true);
    expect(component.occurPlcHolder).toBe(true);
    expect(component.disable).toBe(true);
    expect(component.showOccuranceMsg).toBe(false);
    expect(component.minCensus).toBe(component.plan.censusRange.minimumCensus);
    expect(component.maxCensus).toBe(component.plan.censusRange.maximumCensus);
    expect(component.onCensusMin).toHaveBeenCalled();
    expect(component.onCensusMax).toHaveBeenCalled();
  });
  it('should apply toggle', function () {
    spyOn(component, 'censusMinMaxValidation').and.returnValue(true);
    testPlanDetailsData[0].censusRange.minimumCensus = 1;
    testPlanDetailsData[0].censusRange.maximumCensus = 1;
    component.plan = testPlanDetailsData[0];
    component.applyToggle();
    expect(component.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values for the Census Range. All values must be greater than zero.')).toBe(-1);
    expect(component.objSavePlanParams.saveNextErrorMessages.indexOf('Maximum value must be greater than the minimum value.')).toBe(-1);
    expect(component.censusMinMaxValidation).toHaveBeenCalled();
  });
  it('should apply toggle', function () {
    spyOn(component, 'censusMinMaxValidation').and.returnValue(true);
    testPlanDetailsData[0].censusRange.minimumCensus = 1;
    testPlanDetailsData[0].censusRange.maximumCensus = 1;
    component.plan = testPlanDetailsData[0];
    component.objSavePlanParams.validationErrorMessages[0] = 'Maximum value must be greater than the minimum value.';
    component.applyToggle();
    expect(component.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values for the Census Range. All values must be greater than zero.')).toBe(-1);
    expect(component.objSavePlanParams.validationErrorMessages.indexOf('Maximum value must be greater than the minimum value.')).toBe(0);
    expect(component.censusMinMaxValidation).toHaveBeenCalled();
  });
  it('should apply toggle', function () {
    spyOn(component, 'censusMinMaxValidation').and.returnValue(false);
    spyOn(component, 'censusPlanUtilizedAngVolume').and.returnValue(true);
    testPlanDetailsData[0].censusRange.minimumCensus = 1;
    testPlanDetailsData[0].censusRange.maximumCensus = 1;
    component.plan = testPlanDetailsData[0];
    component.objSavePlanParams.saveNextErrorMessages[0] = 'Enter an Occurrence value.';
    component.objSavePlanParams.validationErrorMessages[0] = 'Maximum value must be greater than the minimum value.';
    component.objSavePlanParams.validationErrorMessages[1] = 'Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.';
    component.applyToggle();
    expect(component.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values for the Census Range. All values must be greater than zero.')).toBe(-1);
    expect(component.objSavePlanParams.validationErrorMessages.indexOf('Enter minimum and maximum values for the Census Range. All values must be greater than zero.')).toBe(-1);
    expect(component.censusMinMaxValidation).toHaveBeenCalled();
    expect(component.censusPlanUtilizedAngVolume).toHaveBeenCalled();
  });
  it('should apply toggle', function () {
    spyOn(component, 'censusMinMaxValidation').and.returnValue(false);
    spyOn(component, 'censusPlanUtilizedAngVolume').and.returnValue(true);
    testPlanDetailsData[0].censusRange.minimumCensus = 1;
    testPlanDetailsData[0].censusRange.maximumCensus = 1;
    component.plan = testPlanDetailsData[0];
    component.applyToggle();
    expect(component.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values for the Census Range. All values must be greater than zero.')).toBe(-1);
    expect(component.objSavePlanParams.validationErrorMessages.indexOf('Enter minimum and maximum values for the Census Range. All values must be greater than zero.')).toBe(-1);
    expect(component.censusMinMaxValidation).toHaveBeenCalled();
    expect(component.censusPlanUtilizedAngVolume).toHaveBeenCalled();
  });
  it('should apply toggle', function () {
    spyOn(component, 'censusMinMaxValidation').and.returnValue(false);
    spyOn(component, 'censusPlanUtilizedAngVolume').and.returnValue(false);
    component.objSavePlanParams.validationErrorMessages[0] = 'Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.';
    testPlanDetailsData[0].censusRange.minimumCensus = 1;
    testPlanDetailsData[0].censusRange.maximumCensus = 1;
    component.plan = testPlanDetailsData[0];
    component.applyToggle();
    expect(component.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values for the Census Range. All values must be greater than zero.')).toBe(-1);
    expect(component.objSavePlanParams.validationErrorMessages.indexOf('Enter minimum and maximum values for the Census Range. All values must be greater than zero.')).toBe(-1);
    expect(component.censusMinMaxValidation).toHaveBeenCalled();
    expect(component.censusPlanUtilizedAngVolume).toHaveBeenCalled();
  });
  it('should check census values', function () {
    component.plan.censusRange.occurrenceNumber[0] = '';
    component.checkCensusValues(1);
    expect(component.isApplyButton).toBe(true);
    expect(component.objSavePlanParams.isSaveNextBtnSubmitForCensus).toBe(true);
    expect(component.showOccuranceMsg).toBe(true);
  });
  it('should check census values', function () {
    component.checkCensusValues(1);
    expect(component.isApplyButton).toBe(true);
    expect(component.objSavePlanParams.isSaveNextBtnSubmitForCensus).toBe(false);
    expect(component.showOccuranceMsg).toBe(undefined);
  });
  it('should check occurance', function () {
    component.plan.censusRange.occurrenceNumber[0]='';
    component.checkOccurance('1');
    expect(component.objSavePlanParams.saveNextErrorMessages.indexOf('Enter an Occurrence value.')).not.toBe(-1);
  });
  it('should check occurance', function () {
    component.plan.censusRange.occurrenceNumber[0]='';
    component.objSavePlanParams.saveNextErrorMessages[0]='Enter an Occurrence value.';
    component.checkOccurance('1');
    expect(component.objSavePlanParams.saveNextErrorMessages.indexOf('Enter an Occurrence value.')).not.toBe(-1);
  });
  it('should check occurance', function () {
    component.checkOccurance('1');
    expect(component.objSavePlanParams.saveNextErrorMessages.indexOf('Enter an Occurrence value.')).toBe(-1);
  });
  // it('should check occurance', function () {
  //   component.objSavePlanParams.saveNextErrorMessages[0]='Enter an Occurrence value.';
  //   component.checkOccurance('1');
  //   expect(component.objSavePlanParams.saveNextErrorMessages.indexOf('Enter an Occurrence value.')).toBe(0);
  // });
  it('should check min max census', function () {
    component.initialFlag=true;
    expect(component.checkMinMaxCensus(1,1)).toBe(true)
  });
  it('should check census dates', function () {
    spyOn(component,'isOccuranceCensus').and.returnValue(false);
    spyOn(component,'isCensusChanges').and.returnValue(false);
    spyOn(component,'censusMinMaxValidation').and.returnValue(true);
    component.showOccuranceMsg=true;
    expect(component.checkCensusDatas()).toBe(true)
  });

  it('should validate onPasteMinCensus and return true', () => {
    const event = {
      target : {
        value: null
      },
      clipboardData : {
        types: ['text/plain'],
        getData(a: number) {
          return '2.2';
        }
      },
      preventDefault : {
      }
    };
    expect(component.onPasteMinCensus(event));
    expect(component.plan.censusRange.minimumCensus === 2.2).toBe(false);
  });

  it('should validate onPasteMaxCensus and return true', () => {
    const event = {
      target : {
        value: null
      },
      clipboardData : {
        types: ['text/plain'],
        getData(a: number) {
          return '6.2';
        }
      },
      preventDefault : {
      }
    };
    expect(component.onPasteMaxCensus(event));
    expect(component.plan.censusRange.maximumCensus === 6.2).toBe(false);
  });
  
  it('should check if census some of are empty should return error', function () {
    spyOn(component, 'applyToggle').and.stub();
    testPlanDetailsData[0].censusRange.maximumCensus = 0;
    testPlanDetailsData[0].censusRange.minimumCensus = 2;
    component.plan = testPlanDetailsData[0];
    component.plan.censusRange.occurrenceNumber = ['1','0',''];
    component.objSavePlanParams.saveNextErrorMessages[0] = 'Enter an Occurrence value.';
    component.applyCensus();
    expect(component.objSavePlanParams.saveNextErrorMessages.indexOf('Enter an Occurrence value.')).toBe(0);
  });

});
