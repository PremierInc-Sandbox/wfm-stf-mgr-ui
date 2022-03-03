import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {StaffGridService} from './Staffgrid-service';
import {planDetailsDataService} from './service-data/plan-data-db';
import {throwError} from 'rxjs';
import {UserService} from './user.service';
import {PageRedirectionService} from './page-redirection.service';
import {staffGridData} from './fixtures/staff-grid-data';
import {staffScheduleData} from './fixtures/staff-schedule-data';

describe('PlanService', () => {
  let service: StaffGridService;
  let httpMock: HttpTestingController;
  let planDetailsTest = planDetailsDataService();
  let request = null;
  const testStaffGridData = staffGridData();
  const testStaffScheduleData = staffScheduleData();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StaffGridService, UserService, PageRedirectionService]
    });
    service = TestBed.get(StaffGridService);
    httpMock = TestBed.get(HttpTestingController);
  });
  beforeEach(() => {
    planDetailsTest = planDetailsDataService();
  });
  afterEach(() => {
    httpMock.verify();
    request = null;
  });
  it('should ', () => {
    service.getStaffGridDetails(1).subscribe(data => {
      expect(data).toBe(testStaffGridData);
    });
    request = httpMock.expectOne(service.fetchStaffGridDetailsUrl + 1);
    expect(request.request.method).toBe('GET');
    request.flush(testStaffGridData);
  });
  it('should ', () => {
    service.saveStaffGridDetails(testStaffScheduleData, 'Active', '', 0, 0).subscribe(data => {
      expect(data).toBe(testStaffScheduleData);
    });
    request = httpMock.expectOne(service.saveStaffGridDetailsUrl);
    expect(request.request.method).toBe('POST');
    request.flush(testStaffScheduleData);
  });

  it('should call check error function', () => {
    const handleeError = spyOn(service as any, 'handleError');
    handleeError.and.returnValue(throwError('hello'));
    service.getStaffGridDetails(1).subscribe(() => fail('Observable should have failed'), data => {
      expect(handleeError).toHaveBeenCalled();
    });
    const request2 = httpMock.expectOne(service.fetchStaffGridDetailsUrl + 1);
    expect(request2.request.method).toBe('GET');
    request2.error(new ErrorEvent('error'));
  });
  it('should call check error function', () => {
    const handleeError = spyOn(service as any, 'handleError');
    handleeError.and.returnValue(throwError('hello'));
    service.saveStaffGridDetails(testStaffScheduleData, 'Active', '', 0, 0).subscribe(() => fail('Observable should have failed'), data => {
      expect(handleeError).toHaveBeenCalled();
    });
    const request2 = httpMock.expectOne(service.saveStaffGridDetailsUrl);
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
});
