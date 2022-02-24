import {CensusRange} from './census-range';
import {VariableDepartmentPosition} from './var-pos';
import {OffGridActivities} from './off-grid-activities';
import {StaffSchedule} from './staff-schedule';
import {NonVariableDepartmentPosition} from './non-var-postn';
import {StaffingMatrixSummaryData} from './staffing-matrix-summary';
import {OASuggestedData} from "./OASuggestedData";

export class PlanDetails {
  public name: string;
  public key: string;
  public status: string;
  public planCompleted: boolean;
  public action: string;
  public corpName: string;
  public planUtilizedAvgVol: number;
  public dateUpdated: string;
  public departmentKey: any;
  public departmentCode: string;
  public departmentName: string;
  public facilityCode: string;
  public facilityKey: any;
  public facilityName: string;
  public censusRange: CensusRange = new CensusRange();
  public effectiveStartDate: Date;
  public effectiveEndDate: Date;
  public userNotes: string;
  public lowerEndTarget: any;
  public upperEndTarget: any;
  public workHoursBalance: number;
  public hours: number;
  public fte: number;
  public volume: number;
  public targetBudget: any;
  public utilizedAverageVolume: number;
  public utilizedAverageVolumeBase: number;
  public temporaryEffectiveStartDate: string;
  public temporaryEffectiveEndDate: string;
  public userKey: number;

  public isnewlycreated = false;
  public variableDepartmentPositions: VariableDepartmentPosition[] = [];
  public nonVariableDepartmentPositions: NonVariableDepartmentPosition[] = [];
  public defaultPlanFlag: boolean;
  public offGridActivities: OffGridActivities[] = [];
  public displayPlanStatus: string;
  public corporationId: string;
  public staffScheduleList: StaffSchedule[] = [];
  public totalAnnualVolume: number;
  public totalAnnualHours: number;
  public totalAnnualHoursVariance: number;
  public currentAverageVolume: number;
  public budgetAverageVolume: number;
  public annualizedCurrentAvg: number;
  public annualizedBudgetedAvg: number;
  public updatedTimeStamp: Date;
  public primaryWHpU: any;
  public secondaryWHpU: any;
  public educationOrientationTargetPaid: any;
  public deleteFlag: boolean;
  staffingSummaryData: StaffingMatrixSummaryData[];
  public planAlreadyInUse: boolean;
  public oAStaffingMetric: OASuggestedData;
  public dailyFlag: boolean;
}

export enum ConfirmWindowOptions {
  exit= 1,
  save= 2
}
