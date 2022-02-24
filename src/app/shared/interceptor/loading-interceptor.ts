import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpXsrfTokenExtractor
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {finalize, tap} from 'rxjs/operators';
import {LoaderService} from '../service/loader.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loaderService: LoaderService,private tokenExtractor: HttpXsrfTokenExtractor) {
  }
  count=0;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.showLoader();
    this.count++;
    let requestMethod: string = req.method;
    requestMethod = requestMethod.toLowerCase();
    if (requestMethod && (requestMethod === 'post' || requestMethod === 'delete' || requestMethod === 'put')) {
      const headerName = 'X-XSRF-TOKEN';
      let token = this.tokenExtractor.getToken() as string;
      if (token !== null && !req.headers.has(headerName)) {
        req = req.clone({headers: req.headers.set(headerName, token)});
      }
    }
    return next.handle(req)

      .pipe ( tap (

        event =>{},

        error =>{}

        ),finalize(() => {
          this.count--;
          if ( this.count == 0 )  this.onEnd();
        })
      );
  }

  private onEnd(): void {
    this.hideLoader();
  }

  private showLoader(): void {
    this.loaderService.show();
  }

  private hideLoader(): void {
    this.loaderService.hide();
  }

}
