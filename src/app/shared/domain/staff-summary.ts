import {shift, shiftMins} from './staff-schedule';
export class StaffVarianceSummary {
  public shiftDetailKey: number;
  public censusValue: number;
  public comments: string;
  public additionalStaffHours: number;
  public offGridActivitiesHour: number;
  public defaultShiftKey: number;
  public shiftTime: number;
  public shiftFormat: string;
  public plannedShift: shift;
  public plannedShifts: shiftMins[] = [];
  public staffVarianceDetails: StaffVarianceDetails[] = [];
  public isCensusvalid = false;
  public predictedCount: number;
  public commentsUpdatedBy: string;
  public shiftTimeRange: string;
}
export class StaffVarianceDetails {
  public  variableCategoryKey: number;
  public actualCount: number;
  public scheduleCount: number;
  public variableAbbrevation: string;
  public plannedCount: number;
}
