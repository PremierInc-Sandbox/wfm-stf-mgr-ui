import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {PageRedirectionService} from './page-redirection.service';
import {planDetailsDataService} from './service-data/plan-data-db';
import * as template from 'url-template';
import {environment as env} from '../../../environments/environment';
describe('PlanService', () => {
  let service: PageRedirectionService;
  let httpMock: HttpTestingController;
  let planDetailsTest = planDetailsDataService();
  let request = null;
  const response = {
    status: 301,
    config: {
      headers: 'header',
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PageRedirectionService]
    });

    service = TestBed.get(PageRedirectionService);
    httpMock = TestBed.get(HttpTestingController);
  });
  beforeEach(() => {
    planDetailsTest = planDetailsDataService();
  });
  afterEach(() => {
    httpMock.verify();
    request = null;
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should ', function () {
    (service.window as any) ={location: {
        href:''
        }};
    service.redirectToExternalPage('url');
    expect(service.window.location.href).toBe('url');
  });
  xit('should redirect to log out page', function () {
    (service.window as any) ={location: {
        href:''
      }};
    service.logoutUrl= template.parse(env['url.logout']);
    spyOn(service,'redirectToExternalPage').and.stub();
    service.redirectToLogout();
    expect(service.redirectToExternalPage).toHaveBeenCalled();
  });
  it('should redirect to whoops page', () => {
    spyOn(service, 'redirectToWhoopsPage');
    service.redirectAccordingToResponseCode(response);
    expect(service.redirectToWhoopsPage).toHaveBeenCalled();
  });
  it('should redirect to whoops page', () => {
    response.status = 302;
    spyOn(service, 'redirectToExternalPage');
    service.redirectAccordingToResponseCode(response);
    expect(service.redirectToExternalPage).toHaveBeenCalled();
  });
  it('should generate an error code with 400 status code', () => {
    expect(service.generateErrorCode(400)).toBe('0x38cf0424');
  });
  it('should generate an error code with 401 status code', () => {
    expect(service.generateErrorCode(401)).toBe('0x38cf0425');
  });
  it('should generate an error code with 403 status code', () => {
    expect(service.generateErrorCode(403)).toBe('0x38cf0427');
  });
  it('should generate an error code with 404 status code', () => {
    expect(service.generateErrorCode(404)).toBe('0x38cf0428');
  });
  it('should generate an error code with 405 status code', () => {
    expect(service.generateErrorCode(405)).toBe('0x38cf042c');
  });

  it('should generate an error code with 500 status code', () => {
    expect(service.generateErrorCode(500)).toBe('0x38cf042f');
  });
  it('should generate an error code with 501 status code', () => {
    expect(service.generateErrorCode(501)).toBe('0x38cf0430');
  });
  it('should generate an error code with 502 status code', () => {
    expect(service.generateErrorCode(502)).toBe('0x38cf0431');
  });
  it('should generate an error code with 503 status code', () => {
    expect(service.generateErrorCode(503)).toBe('0x38cf0432');
  });
  it('should generate an error code with 504 status code', () => {
    expect(service.generateErrorCode(504)).toBe('0x38cf0433');
  });
  it('should not generate an error code because not status code matched', () => {
    expect(service.generateErrorCode(null)).toBe('');
  });
});
