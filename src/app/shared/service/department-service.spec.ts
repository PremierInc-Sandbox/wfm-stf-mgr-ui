import {TestBed, inject} from '@angular/core/testing';
import {HttpTestingController, HttpClientTestingModule} from '@angular/common/http/testing';
import {DepartmentService} from './department-service';
import {planDetailsDataService} from './service-data/plan-data-db';

describe('Department Service', () => {
  let service: DepartmentService;
  let httpMock: HttpTestingController;
  let request = null;
  const planDetailsDataTest = planDetailsDataService();
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DepartmentService]
    });
    service = TestBed.get(DepartmentService);
    httpMock = TestBed.get(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
    request = null;
  });

  it('should be created', inject([DepartmentService], (departmentService: DepartmentService) => {
    expect(departmentService).toBeTruthy();
  }));
  it('should get department data', () => {
    service.getDepts(planDetailsDataTest[1]).subscribe(data => {
    });
    request = httpMock.expectOne(service.fetchDepartmentUrl + planDetailsDataTest[1]);
    expect(request.request.method).toBe('GET');
    request.flush(planDetailsDataTest[1]);
  });
});
