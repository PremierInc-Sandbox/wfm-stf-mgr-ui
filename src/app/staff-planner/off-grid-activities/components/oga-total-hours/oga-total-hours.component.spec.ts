import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {OgaTotalHoursComponent} from './oga-total-hours.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {PlanDetails} from '../../../../shared/domain/plan-details';

describe('OgaTotalHoursComponent', () => {
  let component: OgaTotalHoursComponent;
  let fixture: ComponentFixture<OgaTotalHoursComponent>;
  const planDetailsDataTest = PlanDetails;
  const objVariableDept = [
    {
      categoryAbbreviation: 'ER',
      key: 1,
      categoryDescription: 'Charlotte',
      staffCount: 10,
    },
    {
      categoryAbbreviation: 'DEN',
      key: 1,
      categoryDescription: 'Charlotte',
      staffCount: 6,
    }
  ];

  const objOffGridActivities = {
    planId: '1',
    code: 'testCode',
    name: 'testName',
    shiftHours: 8,
    typeKey: 4,
    variableDepartmentList: objVariableDept,
    totalHours: 12,
    key: 1,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OgaTotalHoursComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OgaTotalHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call getActivitiesTotalHours', () => {
    component.ngOnInit();
    expect(component.totalOGAhrs).toBe(0);
  });
  it('should getTotalHours be called by getActivitiesTotalHours', () => {
    component.planDetails[0] = planDetailsDataTest;
    component.planDetails.offGridActivities[0] = objOffGridActivities;
    component.getActivitiesTotalHours();
    expect(component.totalOGAhrs).toBe(128);
  });
  it('should get total hours correctly', () => {
    const expectedTotalHours = 128;
    expect(component.getTotalHours(objOffGridActivities)).toBe(expectedTotalHours);
  });
  it('should find leap year', () => {
    component.findLeapYear(4);
    expect(component.leapDays).toBe(366);
  });
});

