import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {StaffVariance} from '../domain/staff-variance';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {PlanDetails} from "../domain/plan-details";
import {EntityCorpTimePeriod} from "../domain/entity-corp-time-period";
@Injectable({
  providedIn: 'root'
})
export class StaffVarianceService {

  public getAllDepartmentPlansUrl: string;
  public getPlansByDepartmentUrl: string;
  public fetchStaffVarianceUrl: string;
  public saveStaffVarianceUrl: string;
  public planAlreadyInUse = false;
  public removePlanKeyFromSessionUrl: string;
  public updateSessionUrl: string;
  public getReleasedTimePeriodFromDTMUrl: string;
  public sessionUpdateInterval: any;
  public autoSaveInterval: number;
  public autoRedirectInterval: number;
  public notifyJobSchedulerInterval: number;

  constructor(private http: HttpClient) {
    this.getAllDepartmentPlansUrl = '/pcops/staff-scheduler-rest/staff-manager/staff-variance';
    this.getPlansByDepartmentUrl = '/pcops/staff-scheduler-rest/staff-manager/staff-variance';
    this.fetchStaffVarianceUrl = '/pcops/staff-scheduler-rest/staff-manager/staff-variance';
    this.saveStaffVarianceUrl = '/pcops/staff-scheduler-rest/staff-manager/staff-variance-details';
    this.removePlanKeyFromSessionUrl = '/pcops/staff-scheduler-rest/staff-manager/remove-session-attribute/';
    this.updateSessionUrl = '/pcops/staff-scheduler-rest/staff-manager/update-session/';
    this.getReleasedTimePeriodFromDTMUrl = '/pcops/staff-scheduler-rest/staff-manager/staff-variance';
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  public getAllDepartmentPlans(): Observable<any[]> {
    return this.http.get<any[]>(this.getAllDepartmentPlansUrl, this.httpOptions).pipe(
      catchError(
        this.handleError
      )
    );
  }

  public getPlansByDepartment(facilityId: number, dateValue: string): Observable<StaffVariance[]> {
    return this.http.get<StaffVariance[]>(this.getPlansByDepartmentUrl + '/facility/' + facilityId
      + '/selected-date/' + dateValue, this.httpOptions).pipe(
      catchError(
        this.handleError
      )
    );
  }
  public getStaffVarianceByDepartmentAndPlan(deptKey: any, planKey: any, date: any) {
    return this.http.get<Response>(this.fetchStaffVarianceUrl + '/department-key/' + deptKey + '/plan-key/'
      + planKey + '/selected-date/' + date, this.httpOptions)
      .pipe(
      catchError(
        this.handleError
      )
    );
  }
  public saveStaffVarianceDetails(staffVariance: StaffVariance) {
     return this.http.post(this.saveStaffVarianceUrl , staffVariance , this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }
  public removePlanKeyFromSessionAttribute(planKey: number) {
      window.clearInterval(this.sessionUpdateInterval);
      return this.http.put<Response>(this.removePlanKeyFromSessionUrl + planKey, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  public updateSessionForStaffVariance(planKey: number) {
    return this.http.put<Response>(this.updateSessionUrl + planKey, this.httpOptions).pipe(
        catchError(this.handleError)
    );
  }

  public removePlanKeyFromSessionAttributeSubscribe(planKey: number): Observable<Response> {
    return this.http.put<Response>(this.removePlanKeyFromSessionUrl + planKey, null,  this.httpOptions);
  }

  public getReleasedTimePeriodFromDTM(deptKeys: Array<number> = [], date: string): Observable<EntityCorpTimePeriod[]>  {
    return this.http.get<EntityCorpTimePeriod[]>(this.getReleasedTimePeriodFromDTMUrl + '/department/' + deptKeys + '/selected-date/'
      + date + '/released-time-period', this.httpOptions).pipe(
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
