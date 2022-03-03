import {TestBed, inject} from '@angular/core/testing';
import {HttpTestingController, HttpClientTestingModule} from '@angular/common/http/testing';
import {OAService} from './oa-service';
import {oaPlanDataSample} from './fixtures/oa-Plan-Data-Sample';
import {oaSuggestedDataSample} from './fixtures/oa-suggested-data-sample';
import {entityCumulativeVarianceData} from "./fixtures/entity-cumulative-variance-data";

describe('OAService', () => {
  let service: OAService;
  let httpMock: HttpTestingController;
  const testoaPlanData = oaPlanDataSample();
  let request = null;
  const testosSuggestedData = oaSuggestedDataSample();
  const testEntityCumulativeVarianceData = entityCumulativeVarianceData();
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OAService]
    });
    service = TestBed.get(OAService);
    httpMock = TestBed.get(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();

  });
  it('should ', () => {
    expect(service).toBeTruthy();
  });
  it('should update header', () => {
    service.updateGetHeader(testoaPlanData[0]);
  });
  it('should OASuggestedData', () => {
    service.getOASuggestedData(testoaPlanData[0]).subscribe(data => {
      expect(data).toEqual(testosSuggestedData[0]);
    });
    request = httpMock.expectOne(service.oaSuggestedUrl+'/facility/1/department/1/startDate/1');
    expect(request.request.method).toBe('GET');
    request.flush(testosSuggestedData[0]);
  });
  it('should get oawhpu primary', () => {
    spyOn(service, 'updateGetHeader');
    service.getOaWhpuPrimary(testoaPlanData[0]).subscribe(data => {
      expect(data).toEqual(1);
    });
    expect(service.updateGetHeader).toHaveBeenCalled();
    request = httpMock.expectOne(service.whpuPrimaryUrl);
    expect(request.request.method).toBe('GET');
    request.flush(1);
  });
  it('should get oawhpu secondary', () => {
    spyOn(service, 'updateGetHeader');
    service.getOaWhpuSecondary(testoaPlanData[0]).subscribe(data => {
      expect(data).toEqual(1);
    });
    expect(service.updateGetHeader).toHaveBeenCalled();
    request = httpMock.expectOne(service.whpuSecondaryUrl);
    expect(request.request.method).toBe('GET');
    request.flush(1);
  });
  it('should get Oa target paid', () => {
    spyOn(service, 'updateGetHeader');
    service.getOaEOTargetPaid(testoaPlanData[0]).subscribe(data => {
      expect(data).toEqual(1);
    });
    expect(service.updateGetHeader).toHaveBeenCalled();
    request = httpMock.expectOne(service.eOTargetPaidUrl);
    expect(request.request.method).toBe('GET');
    request.flush(1);
  });
  it('should get key volume', () => {
    spyOn(service, 'updateGetHeader');
    service.getOaKeyVolume(testoaPlanData[0]).subscribe(data => {
      expect(data).toEqual(1);
    });
    expect(service.updateGetHeader).toHaveBeenCalled();
    request = httpMock.expectOne(service.keyVolumeUrl);
    expect(request.request.method).toBe('GET');
    request.flush(1);
  });
  it('should get key volume', () => {
    spyOn(service, 'updateGetHeader');
    service.getOaHoursPerFTE(testoaPlanData[0]).subscribe(data => {
      expect(data).toEqual(1);
    });
    expect(service.updateGetHeader).toHaveBeenCalled();
    request = httpMock.expectOne(service.hoursPerFTEUrl);
    expect(request.request.method).toBe('GET');
    request.flush(1);
  });

  it('should get prior cumulative variance', () => {
    service.getPriorCumulativeHrsVariance('10', [100], '1000').subscribe(data => {
      expect(data).toEqual(testEntityCumulativeVarianceData);
    });
    request = httpMock.expectOne(service.oaManagerMetricUrl + '/facility/' + 10 + '/department/' + [100] + '/time-period/' + 1000);
    expect(request.request.method).toBe('GET');
    request.flush(testEntityCumulativeVarianceData);
  });

  it('should handle error', () => {
    const error = {error: null, headers: null, message: null, name: null, ok: null, status: 500, statusText: null, type: null, url: null};
    service.handleError(error);
  });
});
