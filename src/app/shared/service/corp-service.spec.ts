import {TestBed, inject} from '@angular/core/testing';
import {HttpTestingController, HttpClientTestingModule} from '@angular/common/http/testing';
import {CorpService} from './corp-service';
import {entityDetailsDataService} from './service-data/entity-details-data-service';
import {corpDetailsData} from './fixtures/corp-details-data';

describe('Department Service', () => {
  let service: CorpService;
  let httpMock: HttpTestingController;
  let request = null;
  const corpDataTest = entityDetailsDataService();
  const testcorpDetailsData = corpDetailsData();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CorpService]
    });

    service = TestBed.get(CorpService);
    httpMock = TestBed.get(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
    request = null;
  });

  it('should be created', inject([CorpService], (corpService: CorpService) => {
    expect(corpService).toBeTruthy();
  }));

  it('should get corpy by user', () => {
    service.getCorporations().subscribe(data => {
      expect(data).toEqual(testcorpDetailsData);
    });
    request = httpMock.expectOne(service.fetchCorporationsUrl);
    expect(request.request.method).toBe('GET');
    request.flush(testcorpDetailsData);
  });

});
