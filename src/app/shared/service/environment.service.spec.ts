import {TestBed, inject} from '@angular/core/testing';
import {HttpTestingController, HttpClientTestingModule} from '@angular/common/http/testing';
import {EnvironmentService} from './environment.service';
import {planDetailsDataService} from './service-data/plan-data-db';
import {UserService} from './user.service';
import {PageRedirectionService} from './page-redirection.service';
import {PlanService} from './plan-service';
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;
import { of } from 'rxjs';
import {customUserData} from "./fixtures/user-data";
import {URLS} from '../domain/urls';

describe('PlanService', () => {
  let service: EnvironmentService;
  let httpMock: HttpTestingController;
  let userService: UserService;
  let planDetailsTest = planDetailsDataService();
  let request = null;
  let backend;
  let userServiceSpyObj: SpyObj<UserService> = createSpyObj('UserService', ['logout', 'refreshUser']);
  const userData = customUserData();
  userServiceSpyObj.user = userData[0];
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EnvironmentService, UserService, PageRedirectionService]
    });

    service = TestBed.get(EnvironmentService);
    userService = TestBed.get(UserService);
    httpMock = TestBed.get(HttpTestingController);
    backend = TestBed.get(HttpTestingController)
  });
  beforeEach(() => {
    planDetailsTest = planDetailsDataService();
  });
  afterEach(() => {
    httpMock.verify();
    request = null;
  }); 
  afterEach(inject([HttpTestingController], (backend: HttpTestingController) => {
    backend.verify();
  })); 
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should be initialize', async () => {
    service.environment;
    service.current;
    service.environmentObserver;
    //service.initialize();
    // userServiceSpyObj.refreshUser().subscribe(data => {
    //   expect(data).toBe(userData[0]);
    //   done();
    // });
    // request = httpMock.expectOne(URLS.fetchUser);
    // expect(request.request.method).toBe('GET');
    // request.flush(userData[0]);    
  });
  it('should init', async () => {
    spyOn(service, 'refreshEnvironment').and.returnValue(of(userData[0]));
    service.initialize();
  });
});
