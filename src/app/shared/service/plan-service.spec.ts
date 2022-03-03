import {inject, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {PlanService} from './plan-service';
import {planDetailsDataService} from './service-data/plan-data-db';
import {jobCategoryData} from './fixtures/job-category-data';
import {activityData} from './fixtures/activity-data';
import {productHelpData} from './fixtures/product-help-data';
import {throwError} from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('PlanService', () => {
  let service: PlanService;
  let httpMock: HttpTestingController;
  const jobCategoryDataTest = jobCategoryData();
  let planDetailsTest = planDetailsDataService();
  let request = null;
  const mockHandleError: SpyObj<PlanService> = jasmine.createSpyObj(['handleError']);
  const activityDataTest = activityData();
  const productHelpTest = productHelpData();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PlanService]
    });

    service = TestBed.get(PlanService);
    httpMock = TestBed.get(HttpTestingController);
  });
  beforeEach(() => {
    planDetailsTest = planDetailsDataService();
  });
  afterEach(() => {
    httpMock.verify();
    request = null;
  });

  it('should be created', inject([PlanService], (service: PlanService) => {
    expect(service).toBeTruthy();
  }));
  it('should get departments keyes with Active plans', () => {
    service.getDepartmentsKeyesWithActivePlans().subscribe(data => {      
    });
    request = httpMock.expectOne(service.deptKeysWithActivePlansURL);
    expect(request.request.method).toBe('GET');
  });
  it('should get plans and return plan details', () => {
    service.getPlans([1]).subscribe(data => {
      expect(data).toBe(planDetailsTest);
    });
    request = httpMock.expectOne(service.planUrl + '/' + 1);
    expect(request.request.method).toBe('GET');
  });
  it('should get all plans ', () => {
    service.getAllPlans().subscribe(data => {
      expect(data).toBe(planDetailsTest);
    });
    request = httpMock.expectOne(service.allPlansUrl);
    expect(request.request.method).toBe('GET');
    request.flush(planDetailsTest);
  });
  it('should get job category data ', () => {
    service.getJobCategoryData().subscribe(data => {
      expect(data).toEqual(jobCategoryDataTest);
    });
    request = httpMock.expectOne(service.jobCategoryURL);
    expect(request.request.method).toBe('GET');
    request.flush(jobCategoryDataTest);
  });
  it('should create a plan', () => {
    planDetailsTest[0].name = null;
    service.createPlan(planDetailsTest[0]);
  });
  it('should update delete flag', () => {
    const handleeError = spyOn(service as any, 'handleError');
    service.updateDeleteFlag(planDetailsTest[0]).subscribe(data => {
      expect(data).toEqual(planDetailsTest[0]);
    });
    request = httpMock.expectOne(service.UpdateDeleteFlagUrl + planDetailsTest[0].key);
    expect(request.request.method).toBe('PUT');
    request.flush(planDetailsTest[0]);
  });
  it('should get plan data by name', () => {
    const handleeError = spyOn(service as any, 'handleError');
    service.getPlanDataByName(planDetailsTest[0].name).subscribe(data => {
      expect(data).toEqual(planDetailsTest[0]);
    });
    request = httpMock.expectOne(service.planDataByNameUrl + '/' + planDetailsTest[0].name);
    expect(request.request.method).toBe('GET');
    request.flush(planDetailsTest[0]);
  });
  it('should update plan status', () => {
    service.updatePlanStatus(planDetailsTest[0]).subscribe(data => {
      expect(data).toEqual(planDetailsTest[0]);
    });
    request = httpMock.expectOne(service.updateStatusUrl + '/' + service.planUpdateStatus + '/plan-key/' + planDetailsTest[0].key);
    expect(request.request.method).toBe('PUT');
    request.flush(planDetailsTest[0]);
  });
  it('should update plan as active', () => {
    service.updatePlanAsActive(planDetailsTest[0]).subscribe(data => {
      expect(data).toEqual(planDetailsTest[0]);
    });
    request = httpMock.expectOne(service.updatePlanAsActiveUrl);
    expect(request.request.method).toBe('PUT');
    request.flush(planDetailsTest[0]);
  });
  it('should get all plans by plan action', () => {
    service.getAllPlansByPlanAction(planDetailsTest[0].action, [planDetailsTest[0].departmentKey]).subscribe(data => {
      expect(data).toEqual(planDetailsTest);
    });
    request = httpMock.expectOne(service.planByPlanActionUrl + '/' + planDetailsTest[0].action + '/' + planDetailsTest[0].departmentKey);
    expect(request.request.method).toBe('GET');
    request.flush(planDetailsTest);
  });

  it('should get plan details', () => {
    service.getPlandetails(planDetailsTest[0].key).subscribe(data => {
      expect(data).toEqual(planDetailsTest[0]);
    });
    request = httpMock.expectOne(service.offGridPlanDetailsbyPlanKeyURL + planDetailsTest[0].key);
    expect(request.request.method).toBe('GET');
    request.flush(planDetailsTest[0]);
  });

  it('should remove Plan Key From Session Attribute', () => {
    service.removePlanKeyFromSessionAttribute(Number(planDetailsTest[0].key)).subscribe(data => {
    });
    request = httpMock.expectOne(service.removePlanKeyFromSessionUrl + planDetailsTest[0].key);
    expect(request.request.method).toBe('PUT');
    request.flush(planDetailsTest[0]);
  });

  it('should remove Plan Key From Session Attribute Subscribe', () => {
    service.removePlanKeyFromSessionAttributeSubscribe(Number(planDetailsTest[0].key)).subscribe(data => {
    });
    request = httpMock.expectOne(service.removePlanKeyFromSessionUrl + planDetailsTest[0].key);
    expect(request.request.method).toBe('PUT');
    request.flush(planDetailsTest[0]);
  });
  
  it('should update Session For Plan', () => {
    service.updateSessionForPlan(Number(planDetailsTest[0].key)).subscribe(data => {
    });
    request = httpMock.expectOne(service.sessionUpdateUrl + planDetailsTest[0].key);
    expect(request.request.method).toBe('PUT');
    request.flush(planDetailsTest[0]);
  });

  it('should get product help link', () => {
    service.getRedirectUrl().subscribe(data => {
      expect(data).toEqual(productHelpTest[0]);
    });
    request = httpMock.expectOne(service.applicationRedirectUrl);
    expect(request.request.method).toBe('GET');
    request.flush(productHelpTest[0]);
  });

  it('should call check error function', async (done) => {
    const handleeError = spyOn(service as any, 'handleError');
    handleeError.and.returnValue(throwError('hello'));
    service.createPlan(planDetailsTest[0]).subscribe(() => fail('Observable should have failed'), data => {
      expect(handleeError).toHaveBeenCalled();
      done();
    });
    const request2 = httpMock.expectOne(service.savePlanUrl);
    request2.error(new ErrorEvent('error'));
  });

  it('should check User Access To Plan', () => {
    service.checkUserAccessToPlan(Number(planDetailsTest[0].key)).subscribe(data => {
    });
    request = httpMock.expectOne(service.checkUserAccessUrl + planDetailsTest[0].key);
    expect(request.request.method).toBe('GET');
    request.flush(planDetailsTest[0]);
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
    expect();
  });
});
