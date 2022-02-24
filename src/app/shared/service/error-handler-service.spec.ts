import {TestBed, inject} from '@angular/core/testing';
import {HttpTestingController, HttpClientTestingModule} from '@angular/common/http/testing';
import {ErrorHandlerService} from './error-handler-service';
import {Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import SpyObj = jasmine.SpyObj;

describe('Department Service', () => {
  let service: ErrorHandlerService;
  let httpMock: HttpTestingController;
  let request = null;
  const mockRouter: SpyObj<Router> = jasmine.createSpyObj('Router', ['navigate']);
  let error: HttpErrorResponse = {
    error: null,
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
      imports: [HttpClientTestingModule],
      providers: [ErrorHandlerService, {provide: Router, useValue: mockRouter}]
    });

    service = TestBed.get(ErrorHandlerService);
    httpMock = TestBed.get(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
    request = null;
  });

  it('should be created', inject([ErrorHandlerService], (service: ErrorHandlerService) => {
    expect(service).toBeTruthy();
  }));
  it('should handleOtherError be called', () => {
    service.handleError(error);
  });
  it('should handle500Error be called', () => {
    error = {error: null, headers: null, message: null, name: null, ok: null, status: 500, statusText: null, type: null, url: null};
    service.handleError(error);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/500']);
  });
  it('should handle404Error be called', () => {
    error = {error: null, headers: null, message: null, name: null, ok: null, status: 404, statusText: null, type: null, url: null};
    service.handleError(error);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/404']);
  });

});
