export class PredictedResponse {
  public departmentKey: number
  public departmentForecast: DepartmentForecast[] = [];
}
export class DepartmentForecast {
  public date: string;
  public dayForecastValues: DayForecastValues[] = [];
}
export class DayForecastValues {
  public shiftTime: number;
  public shiftFormat: string;
  public censusValue: number;
  public lower: number;
  public upper: number;
}

export function predictedResponse() {
 return [{
    departmentKey : 123,
   departmentForecast : [{
     date: '20/10/2021',
     dayForecastValues : [{
       shiftTime : 3,
       shiftFormat : "AM",
       censusValue : 1,
       lower : 1,
       upper : 2
     }]
   }]
  }]
}

