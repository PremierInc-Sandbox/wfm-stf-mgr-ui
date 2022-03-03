import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {HeaderComponent} from './header.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {UserService} from '../../service/user.service';
import {EnvironmentService} from '../../service/environment.service';
import {SidenavComponent} from '../sidenav/sidenav.component';
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockUserService;
  let mockEnvironmentService;
  beforeEach(waitForAsync(() => {
    mockUserService = {
      get user() {
        return {
          ldapUsername: 1
        };
      }
    };
    TestBed.configureTestingModule({

      declarations: [HeaderComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{provide: UserService, useValue: mockUserService}, {provide: EnvironmentService, useValue: mockEnvironmentService}]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
