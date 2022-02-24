import {async, ComponentFixture, flush, TestBed, waitForAsync} from '@angular/core/testing';
import {of} from 'rxjs';
import {SidenavComponent} from './sidenav.component';
import {UserService} from '../../service/user.service';
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;
import {PageRedirectionService} from '../../service/page-redirection.service';
import {customUserData} from '../../service/fixtures/user-data';
import {HttpClient} from '@angular/common/http';
import {PlanService} from '../../service/plan-service';
import {productHelpData} from '../../service/fixtures/product-help-data';

describe('SidenavComponent', () => {
  let component: SidenavComponent;
  let fixture: ComponentFixture<SidenavComponent>;
  let compiled;
  let userServiceSpyObj: SpyObj<UserService> = createSpyObj('UserService', ['logout']);
  const pageRedirectService: SpyObj<PageRedirectionService> = createSpyObj('PageRedirectService', ['redirectToLogout', 'redirectToExternalPage', 'redirectToWhoopsPage', 'generateErrorCode', 'getProductHelpUrl']);
  const userDataTest = customUserData();
  userServiceSpyObj.user = userDataTest[0];
  let mockHttpCient;
  let spyObjPlanService: SpyObj<PlanService>=createSpyObj('PlanService', ['getRedirectUrl']);
  let testProductData=productHelpData();
  spyObjPlanService.getRedirectUrl.and.returnValue(of(testProductData[0]));


  userServiceSpyObj.logout.and.returnValue(of(userDataTest));

  beforeEach(waitForAsync(() => {
    const mockPageRedirectionService = jasmine.createSpyObj([
      'redirectToExternalPage',
      'redirectToWhoopsPage',
      'redirectToLogout',
      'redirectAccordingToResponseCode',
      'generateErrorCode'
    ]);
    TestBed.configureTestingModule({
      declarations: [SidenavComponent],
      providers: [{provide: UserService, useValue: userServiceSpyObj}, {
        provide: PageRedirectionService,
        useValue: pageRedirectService
      },
        {provide: HttpClient, useValue: mockHttpCient},
        {provide: PlanService, useValue: spyObjPlanService}]
    })
      .compileComponents();
  }));

  beforeEach(() => {

    fixture = TestBed.createComponent(SidenavComponent);
    component = fixture.componentInstance;
    compiled = fixture.debugElement.nativeElement;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display side nav when toggled', async (done) => {
    const sideNav = compiled.querySelector('.sidenav');

    expect(sideNav.classList.contains('inactive')).toEqual(true);
    expect(sideNav.classList.contains('active')).toEqual(false);

    component.toggle();
    fixture.detectChanges();

    expect(sideNav.classList.contains('active')).toEqual(true);
    expect(sideNav.classList.contains('inactive')).toEqual(false);

    done();
  });

  it('should close side nav when close button tapped', async (done) => {
    spyOn(component, 'toggle');
    const closeButton = compiled.querySelector('.slide-in-menu-close');
    closeButton.click();
    fixture.detectChanges();
    expect(component.toggle).toHaveBeenCalled();
    done();
  });
  it('should toggle active status', () => {
    component.toggle();
    expect(component.state).toBe('active');
    component.state = 'active';
    component.toggle();
    expect(component.state).toBe('inactive');
  });
  it('should redirct after logging out', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.logout();
    expect(userServiceSpyObj.logout).toHaveBeenCalled();
    expect(pageRedirectService.redirectToExternalPage).toHaveBeenCalledWith(component.productHelp.logoutUrl);
  });
  it('should not redirect after logging out because cancel was selected', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.logout();
  });
  it('should open product help window', () => {
    spyOn(window, 'open').and.stub();
    component.productDocumentationHelp();
    expect(window.open).toHaveBeenCalledWith(component.productHelp.productHelpUrl);
  });

});
