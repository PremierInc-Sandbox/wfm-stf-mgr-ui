import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {StaffVariance} from '../domain/staff-variance';
import {StaffVarianceSummary} from '../domain/staff-summary';
import {PredictedModel} from '../domain/predicted-model';
import {HistoricDataModel} from '../domain/HistoricDataModel';
import {PredictedResponse} from "../domain/PredictedResponse";

@Injectable({
  providedIn: 'root'
})
export class PredictedDataService {
  public getPredictedDataForPresentDateUrl: string ;
  public getPredictedDataForFutureDateUrl: string ;
  public getHistoricDataforPastRecordsUrl: string;
  public savePredictedDataUrl: string;
  public getPredictedDataFromVolumeForecastingUrl: string;


constructor(private http: HttpClient) {
  this.getPredictedDataForPresentDateUrl = '/pcops/staff-scheduler-rest/staff-predicted/staff-variance/present-date';
  this.getHistoricDataforPastRecordsUrl = '/pcops/staff-scheduler-rest/staff-predicted/staff-variance/present-date/historic-data';
  this.getPredictedDataForFutureDateUrl = '/pcops/staff-scheduler-rest/staff-predicted/staff-variance';
  this.savePredictedDataUrl = '/pcops/staff-scheduler-rest/staff-predicted/predicted-data';
  this.getPredictedDataFromVolumeForecastingUrl = '/pcops/volume-forecasting/predict';
  // https://pco-stf-gateway-dev.premierinc.com/pcops/volume-forecasting/predict
}
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };


  public getPredictedDataFromVolumeForecasting(historicDataModel: HistoricDataModel): Observable<PredictedResponse> {
    return this.http.post<PredictedResponse>(this.getPredictedDataFromVolumeForecastingUrl, historicDataModel , this.httpOptions)
      .pipe(
        catchError(
          this.handleError
        )
      );
  }


  public getPredictedDataForPresentDate(deptKey: any, planKey: any, date: any) {
    return this.http.get<Response>(this.getPredictedDataForPresentDateUrl + '/department-key/' + deptKey + '/plan-key/'
      + planKey + '/selected-date/' + date, this.httpOptions)
      .pipe(
        catchError(
          this.handleError
        )
      );
  }
  public getHistoricDataforPastRecords(deptKey: any, planKey: any, date: any, createdDate: any) {
    return this.http.get<Response>(this.getHistoricDataforPastRecordsUrl + '/department-key/' + deptKey + '/plan-key/'
      + planKey + '/selected-date/'  + date + '/created-date/' + createdDate, this.httpOptions)
      .pipe(
        catchError(
          this.handleError
        )
      );
  }
  public getPredictedDataForFutureDate(): Observable<any[]> {
    return this.http.get<any[]>(this.getPredictedDataForFutureDateUrl, this.httpOptions).pipe(
      catchError(
        this.handleError
      )
    );
  }

  public handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }

}
