import {TestBed, inject} from '@angular/core/testing';
import {HttpTestingController, HttpClientTestingModule} from '@angular/common/http/testing';
import {EntityService} from './entity-service';
import {entityDetailsData} from './fixtures/entityDetailsData';

describe('Entity Service', () => {
  let service: EntityService;
  let httpMock: HttpTestingController;
  let request = null;
  const entityDetailsDataTest = entityDetailsData();
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EntityService]
    });
    service = TestBed.get(EntityService);
    httpMock = TestBed.get(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
    request = null;
  });

  it('should be created', inject([EntityService], (entityService: EntityService) => {
    expect(entityService).toBeTruthy();
  }));
  it('should get facility data', () => {
    service.getFacility(entityDetailsDataTest[0]).subscribe(data => {

    });
    request = httpMock.expectOne(service.entityDetailsUrl + entityDetailsDataTest[0]);
    expect(request.request.method).toBe('GET');
    request.flush(entityDetailsDataTest[0]);
  });
});
