export class PredictedModel {
  public departmentKey: number;
  public rcrdDate: Date;
  public dayForecastValues: DayForecastValues[] = [];
}
export class DayForecastValues {
  public shiftTime: number;
  public shiftFormat: string;
  public censusValue: number;
  public lower: number;
  public upper: number;
}
