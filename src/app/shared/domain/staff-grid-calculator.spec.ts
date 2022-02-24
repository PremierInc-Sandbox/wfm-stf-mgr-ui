import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import { StaffGridCalculator } from './staff-grid-calculator';
import {shiftData} from '../service/fixtures/shift-data';
import {staffGridData} from '../service/fixtures/staff-grid-data';
import {planDetailsData} from '../service/fixtures/plan-details-data';
import {staffScheduleData} from '../service/fixtures/staff-schedule-data';
import { PlanDetails } from './plan-details';
describe('StaffGridCalculator', () => {
  let component: StaffGridCalculator=new StaffGridCalculator();
  let testShiftData = shiftData();
  let testGridStaffData;
  let testPlanDetails;
  let testStaffScheduleData;

  beforeEach(() => {
    testShiftData = shiftData();
    testGridStaffData = staffGridData();
    testPlanDetails = planDetailsData();
    testStaffScheduleData = staffScheduleData();
  });

  it('should create an instance', () => {
    expect(new StaffGridCalculator()).toBeTruthy();
  });

  it('should round to two numbers', () => {
    component.roundToTwo(1);
  });
  it('should assign productivity value for all shifts', () => {
    let planDetails:PlanDetails[]=planDetailsData();
    let planDetailsProcessed:PlanDetails;
    planDetailsProcessed=component.assignprodutivityValuesForallShifts(0, 6, 8,planDetails[0]);
    expect(planDetailsProcessed.staffScheduleList[0].planShiftList[0].staffGridCensuses[0].productivityIndex).toBe(6);
  });
  it('should assign totalPlanWHpU value for all shifts', () => {
    let planDetails:PlanDetails[]=planDetailsData();
    let planDetailsProcessed:PlanDetails;
    planDetailsProcessed=component.assignprodutivityValuesForallShifts(0, 6, 8,planDetails[0]);
    expect(planDetailsProcessed.staffScheduleList[0].planShiftList[0].staffGridCensuses[0].totalPlanWHpU).toBe(8);
  });
  it('should return 366 for leap year', () => {
    const planDate: Date = new Date('02/02/2020');
    let planYear: number;
    planYear = planDate.getFullYear();
    expect(component.getDayInYear(planYear)).toBe(366);
  });
  it('should return 365 for not leap year', () => {
    const planDate: Date = new Date('02/02/2019');
    let planYear: number;
    planYear = planDate.getFullYear();
    expect(component.getDayInYear(planYear)).toBe(365);
  });
  it('should get total scheduled days in plan', () => {
    let planDetails:PlanDetails=planDetailsData()[0];
    expect(component.getDaysInPlan(planDetails)).toBe(7);
  });
  it('should get OGA total hours in plan', () => {
    let planDetails:PlanDetails=planDetailsData()[0];
    expect(component.getOGATotalhours(planDetails)).toBeDefined();
  });
  it('should get non variable total hours for the plan', () => {
    let planDetails:PlanDetails=planDetailsData()[0];
    planDetails.nonVariableDepartmentPositions[0].shiftHours=12;
    expect(component.getNonvarTotalhours(planDetails)).toBe(24);
  });
  it('should get non variable days count', () => {
    let planDetails:PlanDetails=planDetailsData()[0];
    expect(component.getNonvarDaysCount(planDetails.nonVariableDepartmentPositions[0])).toBe(2);
  });
  it('should get getShiftHoursMultiplyByPositionSum hours', () => {
    let planDetails:PlanDetails=planDetailsData()[0];
    planDetails.staffScheduleList[0].planShiftList[0].hours=8;
    planDetails.staffScheduleList[0].planShiftList[0].staffGridCensuses[0].staffToPatientList[0].staffCount=10;
    expect(component.getShiftHoursMultiplyByPositionSum(planDetails.staffScheduleList[0].planShiftList[0],0)).toBe(80);
  });
  it('should get getDaysCountforSchedule', () => {
    let planDetails:PlanDetails=planDetailsData()[0];
    expect(component.getDaysCountforSchedule(planDetails.staffScheduleList[0])).toBe(7);
  });
  it('should get schedule total hours', () => {
    let planDetails:PlanDetails=planDetailsData()[0];
    planDetails.staffScheduleList[0].planShiftList[0].hours=8;
    planDetails.staffScheduleList[0].planShiftList[0].staffGridCensuses[0].staffToPatientList[0].staffCount=10;
    expect(component.getScheduleTotalhours(0,planDetails)).toBe(560);
  });
  it('should not get shift hours multiply by position when shift is not found', () => {
    let planDetails:PlanDetails=planDetailsData()[0];
    expect(component.getShiftHoursMultiplyByPositionSum(testPlanDetails[0].staffScheduleList[0].planShiftList[0], null)).toBe(0);
  });
  it('should not get days count for schedule when no days are selected', () => {
    testStaffScheduleData[0].scheduleDays[0] = false;
    expect(component.getDaysCountforSchedule(testStaffScheduleData[0])).toBe(0);
  });

});
