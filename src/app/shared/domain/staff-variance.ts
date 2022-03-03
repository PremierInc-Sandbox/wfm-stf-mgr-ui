import {StaffVarianceSummary} from './staff-summary';

export class StaffVariance {
  public departmentEntryKey: number;
  public departmentKey: number;
  public planKey: number;
  public recordStatusKey: number;
  public actualHours: number;
  public targetHours: number;
  public dailyVarianceHours: number;
  public priorCumulativeHours: number;
  public fullTimeEquivalent: number;
  public createdBy: string;
  public createdTime: Date;
  public updatedBy: string;
  public updatedTime: Date;
  public departmentName = '';
  public comments = '';
  public shiftComments: string[];
  public staffVarianceSummaries: StaffVarianceSummary [] = [];
  public lowerThreshold: number;
  public upperThreshold: number;
  public recordDate: Date;
  public selectedDate: string;
  public recordDateForFuture: string;
  public planAlreadyInUse = false;
  public disableFlag = false;
  public commentsUpdatedBy: string;
}
