export class StaffSchedule {
  key = '';
  name = '';
  scheduleDays: boolean[] = [];
  planShiftList: shift[] = [];
  IsMaximized = false;
  HasError = false;
  errormsg: string[] = [];
  planKey: any;
}
export class shift {
  key = '';
  name = '';
  hours = 1;
  timeFormatFlag = true;
  startTime = '12:00';
  shiftStartTime = '';
  staffToPatientList: staffToPatient[] = [];
  staffGridCensuses: StaffGridCensus[] = [];
  staffGrid: StaffGrid[] = [];
  last = false;
  HasError = false;
  errormsg: string[] = [];
  activeFlag: boolean;
}
export enum boolvalue {
  false= 0,
  true= 1
}
export class StaffGrid {
  key;
  staffCount;
  variablePositionKey;
  variablePositionCategoryDescription;
  censusLookupKey;
  shiftLookupKey;
}
export class staffToPatient {
  variablePositionKey: number;
  variablePositionCategoryAbbreviation = '';
  variablePositionCategoryDescription = '';
  staffCount = 0;
  activeFlag: boolean;
}
export class StaffGridCensus {
    key = '';
    shiftKey = '';
    censusIndex = 0;
    censusValue = 0;
    productivityIndex = 0;
    totalPlanWHpU = 0;
    staffToPatientList: staffToPatient[] = [];
}

export  class ScheudleErrors {
  // schedule errors
 public errmsg_duplicate_schedulename = 'You cannot use a Grid Name that is already in use. Enter a unique Grid Name. ';
 public errmsg_duplicate_scheduledays = 'You cannot include the same days of the week in two different Grids. Update your days of the week to be unique to this Grid. ';
 public errmsg_Noschedule_added = 'Minimum one Grid must present. ';
 public errmsg_empty_schedulename = 'Enter a Grid Name. ';
 public errmsg_dayselected_empty = 'Please select a day. ';
 public errmsg_shift = 'One ore more Time Periods has error. ';

// shift errors
 public errmsg_empty_shiftname = 'Enter a Time Period Name. ';
 public errmsg_duplicate_shiftname = 'Another Time Period already has this name, Enter a different Time Period name. ';
 public errmsg_duplicate_shift_time = 'Another Time Period already has this start time and hour, Enter a different Time Period Start Time or Hour. ';
 public errmsg_empty_shifthour = 'Please enter Time Periods hours. ';
 public errmsg_total_shifthour = 'Total hours across Time Perios should equal 24. ';
 public errmsg_exceeds_shifthour = 'Total hours across Time Periods should equal 24. ';
 public errmsg_exceeds_shiftcount = 'You can only add six Time Periods to a single Grid. ';
 public errmsg_shift_time_overlaps = 'Time Period time cannot overlap. ';
 public errmsg_shift_time_format = 'Time Period start time must follow 00:00. ';
 public errmsg_time_diff_exceeds = 'Start time of any time period and end time of any time period cannot exceed 24 hours. ';
 public errmsg_require_minimum_one_role = 'Please check at least one role. ';

//
}
export  class shifttime {
  startTime: time = new time();
  endTime: time = new time();
  timeformatflag?: string;
}
export class time {
hours = 0;
mins: number;
}
export class shiftMins {
  objshift: shift;
  timestart: boolean;
  timeEnds: boolean;
}
