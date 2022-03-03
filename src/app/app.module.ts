import {APP_INITIALIZER, NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {SharedModule} from './shared/shared.module';
import {HTTP_INTERCEPTORS, HttpClientModule, HttpClientXsrfModule} from '@angular/common/http';
import {ErrorHandlerService} from './shared/service/error-handler-service';
import {StaffPlannerModule} from './staff-planner/staff-planner.module';
import {StaffManagerModule} from './staff-manager/staff-manager.module';
import {UserService} from './shared/service/user.service';
import {PageRedirectionService} from './shared/service/page-redirection.service';
import {EnvironmentService} from './shared/service/environment.service';
import {AppLoadService} from './shared/service/app-load.service';
import {WindowRef} from './shared/service/window-ref';
import {LoadingInterceptor} from './shared/interceptor/loading-interceptor';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AppRoutingModule,
    SharedModule,
    HttpClientModule,
    StaffPlannerModule,
    StaffManagerModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN'
    })
  ],
  providers: [
    SharedModule,
    ErrorHandlerService,
    EnvironmentService,
    UserService,
    PageRedirectionService,
    WindowRef,
    AppLoadService,
    {
      provide: APP_INITIALIZER,
      useFactory: (appLoadService: AppLoadService) => () => appLoadService.initializeApp(),
      deps: [AppLoadService, UserService, PageRedirectionService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    }
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
