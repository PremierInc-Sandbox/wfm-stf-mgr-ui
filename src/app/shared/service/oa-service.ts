import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {OAPlanData} from '../domain/OAPlanData';
import {OASuggestedData} from '../domain/OASuggestedData';
import {EntityCumulativeVariance} from "../domain/entity-cumulative-variance";

@Injectable({
  providedIn: 'root'
})
export class OAService {
  public oaSuggestedUrl: string;
  public oaManagerMetricUrl: string;
  public whpuPrimaryUrl: string;
  public whpuSecondaryUrl: string;
  public eOTargetPaidUrl: string;
  public historicalAvgKeyVolUrl: string;
  public memLoadedAvgBudgetKeyVolumeUrl: string;
  public cumulativeFytdUrl: string;
  public keyVolumeUrl: string;
  public hoursPerFTEUrl: string;
  // oAApiURL = 'http://localhost:8083/oaService';

  constructor(private http: HttpClient) {
    this.whpuPrimaryUrl = '/pcops/staff-scheduler-rest/oaService/whpuPrimary';
    this.whpuSecondaryUrl = '/pcops/staff-scheduler-rest/oaService/whpuSecondary';
    this.eOTargetPaidUrl = '/pcops/staff-scheduler-rest/oaService/eOTargetPaid';
    this.historicalAvgKeyVolUrl = '/pcops/staff-scheduler-rest/oaMetric/historic-volume';
    this.memLoadedAvgBudgetKeyVolumeUrl = '/pcops/staff-scheduler-rest/oaMetric/budget-volume';
    this.keyVolumeUrl = '/pcops/staff-scheduler-rest/oaService/keyVolume';
    this.hoursPerFTEUrl = '/pcops/staff-scheduler-rest/oaService/hoursPerFTE';
    this.oaSuggestedUrl = '/pcops/staff-scheduler-rest/oaMetric/planner';
    this.oaManagerMetricUrl = '/pcops/staff-scheduler-rest/oaMetric/manager';
    this.cumulativeFytdUrl = '/pcops/staff-scheduler-rest/oaMetric/cumulative-volume';
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  updateGetHeader(oAPlanData: OAPlanData) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        body: JSON.stringify(oAPlanData)
      })
    };
  }

  getOASuggestedData(oAPlanData: OAPlanData): Observable<OASuggestedData> {
    return this.http.get<OASuggestedData>(this.oaSuggestedUrl + '/facility/' +
      oAPlanData.facilityCode + '/department/' + oAPlanData.departmentCode + '/startDate/' +
      oAPlanData.planStartDate, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getHistoricVolume(oAPlanData: OAPlanData, endDate: any): Observable<OASuggestedData> {
        return this.http.get<OASuggestedData>(this.historicalAvgKeyVolUrl + '/facility/' +
            oAPlanData.facilityCode + '/department/' + oAPlanData.departmentCode + '/startDate/' +
            endDate + '/endDate/' + oAPlanData.planStartDate, this.httpOptions).pipe(
            catchError(this.handleError)
        );
    }

    getBudgetVolume(oAPlanData: OAPlanData, endDate: any): Observable<OASuggestedData> {
        return this.http.get<OASuggestedData>(this.memLoadedAvgBudgetKeyVolumeUrl + '/facility/' +
            oAPlanData.facilityCode + '/department/' + oAPlanData.departmentCode + '/startDate/' +
            oAPlanData.planStartDate, this.httpOptions).pipe(
            catchError(this.handleError)
        );
    }
    getCumulativeVolume(oAPlanData: OAPlanData, endDate: any): Observable<OASuggestedData> {
      return this.http.get<OASuggestedData>(this.cumulativeFytdUrl + '/facility/' +
        oAPlanData.facilityCode + '/department/' + oAPlanData.departmentCode + '/startDate/' +
        oAPlanData.planStartDate, this.httpOptions).pipe(
        catchError(this.handleError)
    );
  }

  getPlanManagerOASuggestedData(oAPlanData: OAPlanData): Observable<OASuggestedData>  {
    return this.http.get<OASuggestedData>(this.oaManagerMetricUrl + '/facility/' +
      oAPlanData.facilityCode + '/department/' + oAPlanData.departmentCode + '/startDate/' +
      oAPlanData.planStartDate, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getOaWhpuPrimary(oAPlanData: OAPlanData): Observable<number> {
    this.updateGetHeader(oAPlanData);
    return this.http.get<number>(this.whpuPrimaryUrl, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getOaWhpuSecondary(oAPlanData: OAPlanData): Observable<number> {
    this.updateGetHeader(oAPlanData);
    return this.http.get<number>(this.whpuSecondaryUrl, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getOaEOTargetPaid(oAPlanData: OAPlanData): Observable<number> {
    this.updateGetHeader(oAPlanData);
    return this.http.get<number>(this.eOTargetPaidUrl, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getOaKeyVolume(oAPlanData: OAPlanData): Observable<number> {
    this.updateGetHeader(oAPlanData);
    return this.http.get<number>(this.keyVolumeUrl, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getOaHoursPerFTE(oAPlanData: OAPlanData): Observable<number> {
    this.updateGetHeader(oAPlanData);
    return this.http.get<number>(this.hoursPerFTEUrl, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getPriorCumulativeHrsVariance(facilityCode: string, deptKeys: Array<number>, timePeriodCycleId: string): Observable<EntityCumulativeVariance[]> {
    return this.http.get<EntityCumulativeVariance[]>(this.oaManagerMetricUrl + '/facility/' +
      facilityCode + '/department/' + deptKeys + '/time-period/' +
      timePeriodCycleId, this.httpOptions).pipe(
      catchError(this.handleError)
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
