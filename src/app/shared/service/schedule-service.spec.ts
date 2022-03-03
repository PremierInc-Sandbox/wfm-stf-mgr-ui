import {TestBed, inject} from '@angular/core/testing';
import {HttpTestingController, HttpClientTestingModule} from '@angular/common/http/testing';
import {entityDetailsDataService} from './service-data/entity-details-data-service';
import {ScheduleService} from './schedule-service';
import {staffScheduleDataService} from './service-data/staff-schedule-data-service';
import {throwError} from 'rxjs';
import {OASuggestedData} from '../domain/OASuggestedData';
import {oaSuggestedDataSample2} from '../../shared/service/fixtures/oa-suggested-data-sample2';
import {PlanDetails} from '../domain/plan-details';
import {staffVarianceData} from '../../shared/service/fixtures/staffVarianceData';
import {planDetailsData} from '..//service/fixtures/plan-details-data';
import {PlanService} from './plan-service';

import {NonVariableDepartmentPosition} from '../domain/non-var-postn';
import {AlertBox} from '../domain/alert-box';
import {StaffVarianceService} from '../service/staff-variance.service';
import * as moment from 'moment';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import createSpy = jasmine.createSpy;
import createSpyObj = jasmine.createSpyObj;
import {Observable, of} from 'rxjs';


describe('Department Service', () => {
  let service: ScheduleService;
  let httpMock: HttpTestingController;
  let request = null;
  const staffScheduleDataTest = staffScheduleDataService();
  let oASuggestedData = new OASuggestedData();
  let testPlanDetails;
  let flag=true;
  let planDetailsTest = planDetailsData();
  let staffVarianceDetails = staffVarianceData();
  const testOASuggestionData2 = oaSuggestedDataSample2();
  let mockMatDialog = jasmine.createSpyObj({
    afterClosed: createSpy('name', function () {
      return of();}).and.callThrough(), close: null, open: createSpy('open', function () {
        return this;

      }
    )
  });
  mockMatDialog.componentInstance = {body: ''};
  beforeEach(() => {
    mockMatDialog.open.and.callFake(function() {
      return {
        afterClosed(){
          return of(flag);
        }
      }
    });
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatDialogModule],
      providers: [ScheduleService, {provide: MatDialog, useValue: mockMatDialog}]
    });
    service = TestBed.get(ScheduleService);
    httpMock = TestBed.get(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
    request = null;
  });

  it('should be created', inject([ScheduleService], (service: ScheduleService) => {
    expect(service).toBeTruthy();
  }));

  it('should get schedule details', () => {
    service.getScheduleDetails(staffScheduleDataTest[0].planKey).subscribe(data => {
      expect(data).toEqual(staffScheduleDataTest);
    });
    request = httpMock.expectOne(service.fetchScheduleDetailsUrl + staffScheduleDataTest[0].planKey);
    expect(request.request.method).toBe('GET');
    request.flush(staffScheduleDataTest);
  });

  it('should create schedule', () => {
    service.createSchedule(staffScheduleDataTest).subscribe(data => {
      expect(data).toEqual(staffScheduleDataTest);
    });
    request = httpMock.expectOne(service.saveScheduleDetailsUrl);
    expect(request.request.method).toBe('POST');
    request.flush(staffScheduleDataTest);
  });

  it('should call check error function', () => {
    const handleeError = spyOn(service as any, 'handleError');
    handleeError.and.returnValue(throwError('hello'));
    service.getScheduleDetails(staffScheduleDataTest[0].planKey).subscribe(() => fail('Observable should have failed'), data => {
      expect(handleeError).toHaveBeenCalled();
    });
    const request2 = httpMock.expectOne(service.fetchScheduleDetailsUrl + staffScheduleDataTest[0].planKey);
    expect(request2.request.method).toBe('GET');
    request2.error(new ErrorEvent('error'));
  });
  it('should call check error function', () => {
    const handleeError = spyOn(service as any, 'handleError');
    handleeError.and.returnValue(throwError('hello'));
    service.createSchedule(staffScheduleDataTest).subscribe(() => fail('Observable should have failed'), data => {
      expect(handleeError).toHaveBeenCalled();
    });
    const request2 = httpMock.expectOne(service.saveScheduleDetailsUrl);
    expect(request2.request.method).toBe('POST');
    request2.error(new ErrorEvent('error'));
  });
  it('should handle error', () => {
    const error = {
      error: null,
      headers: null,
      message: null,
      name: null,
      ok: null,
      status: 500,
      statusText: null,
      type: null,
      url: null
    };
    service.handleError(error);
  });

  it('Should getActualWHPU', () => {
    planDetailsTest[0].oAStaffingMetric = testOASuggestionData2;
    let actualTotalHrs = service.getActualWHPU(staffVarianceDetails, planDetailsTest[0], false);
    expect(service.getActualWHPU).toHaveBeenCalled;
    expect(actualTotalHrs).toEqual(0);
    staffVarianceDetails[0].staffVarianceSummaries[0].staffVarianceDetails[0].actualCount = 0;
    let actualTotalHrs1 = service.getActualWHPU(staffVarianceDetails, planDetailsTest[0], false);
    expect(actualTotalHrs1).toEqual(0);
  });

  it('should check getOGATotalhours', () =>{
    service.planDetails = planDetailsTest[0];
    service.staffVariance = staffVarianceDetails[0];
    service.getOGATotalhours();
  });

});
