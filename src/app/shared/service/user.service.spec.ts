import {TestBed} from '@angular/core/testing';
import {HttpTestingController, HttpClientTestingModule} from '@angular/common/http/testing';
import {UserService} from './user.service';
import {PageRedirectionService} from './page-redirection.service';
import {customUserData} from './fixtures/user-data';
import {URLS} from '../domain/urls';


describe('Department Service', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let request = null;
  const userData = customUserData();
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService, PageRedirectionService]
    });

    service = TestBed.get(UserService);
    httpMock = TestBed.get(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
    request = null;
  });

  it('should be created ', () => {
    expect(service).toBeTruthy();
  });
  it('should ', async (done) => {
    service.refreshUser().subscribe(data => {
      expect(data).toBe(userData[0]);
      done();
    });
    request = httpMock.expectOne(URLS.fetchUser);
    expect(request.request.method).toBe('GET');
    request.flush(userData[0]);
  });

  it('should logout', () => {
    service.logout();
    expect(service.userObj).toBe(null);
    expect(service.logout()).not.toBe(null);
  });
  it('should fetch user', async (done) => {
    service.fetchUserRole().subscribe(data => {
      //expect(data).toBe(userData[0]);
      done();
    });
    request = httpMock.expectOne(URLS.fetchUserRole);
    expect(request.request.method).toBe('GET');
    request.flush(userData[0]);
  });
  it('should user', () => {
    service.user;
    service.fetchUserObserver;
  });
});
