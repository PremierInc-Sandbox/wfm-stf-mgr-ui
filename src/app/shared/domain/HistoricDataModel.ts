export class HistoricDataModel {
  public departmentList: DepartmentList[] = [];
}
export class DepartmentList {
  public departmentKey: number;
  public historicalDataPast: SummaryDate[] = [];
}
export class SummaryDate {
  public staffVarianceSummaries: StaffSummaries[] = [];
  public date: string;
}
export class StaffSummaries {
  public shiftDetailKey: number;
  public censusValue: number;
  public shiftTime: number;
  public shiftFormat: string;
}
