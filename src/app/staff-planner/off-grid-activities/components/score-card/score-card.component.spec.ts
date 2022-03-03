import {async, ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {ScoreCardComponent} from './score-card.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';

describe('ScoreCardComponent', () => {
  let component: ScoreCardComponent;
  let fixture: ComponentFixture<ScoreCardComponent>;

  const objVariableDept = [
    {
      key: 1,
      categoryAbbreviation: 'ER',
      categoryDescription: 'Charlotte',
      staffCount: 10,
    },
    {
      key: 1,
      categoryAbbreviation: 'DEN',
      categoryDescription: 'Charlotte',
      staffCount: 6,
    }
  ];

  const objOffGridActivities = {
    planId: '1',
    code: 'testCode',
    name: 'testName',
    shiftHours: 8,
    typeKey: 1,
    variableDepartmentList: objVariableDept,
    totalHours: 12,
    key: 1,
  };
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ScoreCardComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  let totalHours;
  const expectedTotalHours = 128;
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call getActivitiesTotalhours', () => {
    component.ngOnInit();
  });
  it('should get activities total hours when ogaType is in house hours', () => {
    component.planDetails.offGridActivities[0] = objOffGridActivities;
    component.getActivitiesTotalHours();
    totalHours = component.totalInhousehrs;
    expect(totalHours).toBe(expectedTotalHours);
  });
  it('should get activities total hours when ogaType is certification hours', () => {
    component.planDetails.offGridActivities[0] = objOffGridActivities;
    objOffGridActivities.typeKey = 2;
    component.getActivitiesTotalHours();
    totalHours = component.totalCertificationhrs;
    expect(totalHours).toBe(expectedTotalHours);
  });
  it('should get activities total hours when ogaType is orientation hours', () => {
    component.planDetails.offGridActivities[0] = objOffGridActivities;
    objOffGridActivities.typeKey = 3;
    component.getActivitiesTotalHours();
    totalHours = component.totalOrientationhrs;
    expect(totalHours).toBe(expectedTotalHours);
  });
  it('should get activities total hours when ogaType is other hours', () => {
    component.planDetails.offGridActivities[0] = objOffGridActivities;
    objOffGridActivities.typeKey = 4;
    component.getActivitiesTotalHours();
    totalHours = component.totalOtherhrs;
    expect(totalHours).toBe(expectedTotalHours);
  });
  it('should getTotalHours be called by getActivitiesTotalHours', () => {
    component.planDetails.offGridActivities[0] = objOffGridActivities;
    spyOn(component, 'getTotalHours');
    component.getActivitiesTotalHours();
    expect(component.getTotalHours).toHaveBeenCalled();
  });
  it('should get total hours correctly', () => {
    expect(component.getTotalHours(objOffGridActivities)).toBe(expectedTotalHours);
  });
});
