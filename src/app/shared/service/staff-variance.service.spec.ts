import {TestBed} from '@angular/core/testing';

import {StaffVarianceService} from './staff-variance.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {staffVarianceData} from './fixtures/staffVarianceData';
import {combineAll} from 'rxjs/operators';
//import {extendsDirectlyFromObject} from '@angular/core/src/render3/jit/directive';
import {Observable} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';

describe('StaffVarianceService', () => {

  let service: StaffVarianceService;
  let httpMock: HttpTestingController;
  let request = null;
  let error: HttpErrorResponse = {
    error: {message:'wow'},
    headers: null,
    message: null,
    name: null,
    ok: null,
    status: null,
    statusText: null,
    type: null,
    url: 'url'
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.get(StaffVarianceService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    const service: StaffVarianceService = TestBed.get(StaffVarianceService);
    expect(service).toBeTruthy();
  });

  it('should get department data', () => {
    service.getPlansByDepartment(1, '05-12-2019').subscribe(data => {

    });
    request = httpMock.expectOne(service.getPlansByDepartmentUrl + '/facility/1/selected-date/05-12-2019');
    expect(request.request.method).toBe('GET');
    request.flush(staffVarianceData());
  });

  it('should get department data', () => {
    service.getAllDepartmentPlans().subscribe(data => {
    });
    request = httpMock.expectOne(service.getAllDepartmentPlansUrl);
    expect(request.request.method).toBe('GET');
    request.flush(staffVarianceData());
  });
  it('should get staff variance by department and plan key', function () {
    service.getStaffVarianceByDepartmentAndPlan(1,1,1);
  });
  it('should save staff variance details', function () {
    let testStaffVarianceDetails=staffVarianceData();
    service.saveStaffVarianceDetails(testStaffVarianceDetails[0]);
  });

  it('should removePlanKeyFromSessionAttribute', function () {
    let testStaffVarianceDetails=staffVarianceData();
    service.removePlanKeyFromSessionAttribute(1).subscribe(data => {
    });
    request = httpMock.expectOne(service.removePlanKeyFromSessionUrl + 1);
    expect(request.request.method).toBe('PUT');
    request.flush(testStaffVarianceDetails);
  });

  it('should updateSessionForStaffVariance', function () {
    let testStaffVarianceDetails=staffVarianceData();
    service.updateSessionForStaffVariance(1).subscribe(data => {
    });
    request = httpMock.expectOne(service.updateSessionUrl  + 1);
    expect(request.request.method).toBe('PUT');
    request.flush(testStaffVarianceDetails);
  });

  it('should removePlanKeyFromSessionAttributeSubscribe', function () {
    let testStaffVarianceDetails=staffVarianceData();
    service.removePlanKeyFromSessionAttributeSubscribe(1).subscribe(data => {
    });
    request = httpMock.expectOne(service.removePlanKeyFromSessionUrl  + 1);
    expect(request.request.method).toBe('PUT');
    request.flush(testStaffVarianceDetails);
  });


  it('should get released time period from dtm', function() {
    service.getReleasedTimePeriodFromDTM([100, 200], '05-12-2019');
  });

  it('should handle error', function () {
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
    expect();
  });
});
