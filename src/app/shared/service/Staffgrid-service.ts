import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {StaffGridCensus, StaffSchedule} from '../domain/staff-schedule';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class StaffGridService {
  public fetchStaffGridDetailsUrl: string;
  public saveStaffGridDetailsUrl: string;
  public autoSaveInterval: number;

  constructor(private http: HttpClient) {
    this.fetchStaffGridDetailsUrl = '/pcops/staff-scheduler-rest/staff-grid/plan-key/';
    this.saveStaffGridDetailsUrl = '/pcops/staff-scheduler-rest/staff-grid';
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  public getStaffGridDetails(plankey: any): Observable<StaffGridCensus[]> {
    return this.http.get<StaffGridCensus[]>(this.fetchStaffGridDetailsUrl + plankey, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public saveStaffGridDetails(staffSchedules: StaffSchedule[], planStatus: string, planAction: string,
                              totalAnnualhours: number, totalAnnualhoursVariance: number): Observable<StaffSchedule[]> {
    const header = new HttpHeaders(
      {
        Accept: 'application/json',
        planStatus: planStatus,
        planAction: planAction,
        totalAnnualhours: totalAnnualhours.toString(),
        totalAnnualhoursVariance: totalAnnualhoursVariance.toString()
      }
    );
    return this.http.post<StaffSchedule[]>(this.saveStaffGridDetailsUrl, staffSchedules, {headers: header})
      .pipe(
        catchError(this.handleError)
      );
    // }
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
