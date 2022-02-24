import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {StaffSchedule} from '../domain/staff-schedule';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {OASuggestedData} from '../domain/OASuggestedData';
import {PlanDetails} from '../domain/plan-details';
import {StaffVariance} from '../domain/staff-variance';
import {PlanService} from './plan-service';

import {NonVariableDepartmentPosition} from '../domain/non-var-postn';
import {AlertBox} from '../domain/alert-box';
import {StaffVarianceService} from '../service/staff-variance.service';
import * as moment from 'moment';
import {MatDialog} from '@angular/material/dialog';
import {Util} from "../util/util";

@Injectable({
  providedIn: 'root'
})

export class ScheduleService {
  public fetchScheduleDetailsUrl: string;
  public saveScheduleDetailsUrl: string;
  nonVarTotalhours = 0;
  private flag = false;
  excludeEducationOrientationFlag = true;
  oASuggestedData = new OASuggestedData();
  targetHours = 0;
  ogaPlanHours = 0;
  planDetails : PlanDetails;
  staffVariance : StaffVariance;
  alertBox: AlertBox;
  previousDate = null;
  currentDate = new Date();
  constructor(private http: HttpClient, private staffManagerService: StaffVarianceService, private dialog: MatDialog) {
    this.fetchScheduleDetailsUrl = '/pcops/staff-scheduler-rest/schedule/plan-key/';
    this.saveScheduleDetailsUrl = '/pcops/staff-scheduler-rest/schedule';
    this.alertBox = new AlertBox(this.dialog);
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  public getScheduleDetails(plankey: any): Observable<StaffSchedule[]> {
    return this.http.get<StaffSchedule[]>(this.fetchScheduleDetailsUrl + plankey, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  public createSchedule(schdule: StaffSchedule[]): Observable<StaffSchedule[]> {
    // if (schdule.scheduleName != null) {
    return this.http.post<StaffSchedule[]>(this.saveScheduleDetailsUrl, schdule, this.httpOptions)
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

  getActualWHPU(staffVariance, planDetails, isWithAvgCensus){
    this.staffVariance = staffVariance;
    this.planDetails = planDetails;
      let actualtotalhours = 0;
      let rowCount = 0;
      this.getSuggestedData();
      for (const varPos of this.planDetails.variableDepartmentPositions) {
        let actualTotalForVariablePosition: number;
        actualTotalForVariablePosition = this.getActualTotalForVariablePosition(rowCount);
        if (actualTotalForVariablePosition) {
          actualtotalhours = actualtotalhours + Number(actualTotalForVariablePosition);
        }
        rowCount++;
      }
      // get additinonal staff hours
      let additinalStafftotalHour: number;
      additinalStafftotalHour = this.getAdditionalStaffTotalhours();
      if (additinalStafftotalHour) {
        actualtotalhours = actualtotalhours + Number(additinalStafftotalHour);
      }

      // get OGA hours
      let oGATotalhours: number;
      oGATotalhours = this.getOGATotalhours();
      if (oGATotalhours) {
        actualtotalhours = actualtotalhours + Number(oGATotalhours);
      }
      // add non variable hours
      this.nonVarTotalhours = this.getNonvarTotalhours();
      if (this.nonVarTotalhours) {
        actualtotalhours = actualtotalhours + Number(this.nonVarTotalhours);
      }
      actualtotalhours = isWithAvgCensus ? actualtotalhours / this.getAverageCensus() : actualtotalhours;
      this.staffVariance.actualHours = actualtotalhours;
      this.staffVariance.dailyVarianceHours = this.staffVariance.targetHours - this.staffVariance.actualHours;
      return isFinite(actualtotalhours) ? actualtotalhours : 0;
    }

    getActualTotalForVariablePosition(varPosIndex: number): number {
      let totalHours = 0;
      let previousActualCount = 0;
      let staffVarianceSummaryCount = 0;
      let actualTotal = 0;
      let isElevenPMShifExists = true;
      if (Util.isNullOrUndefined(this.staffVariance.staffVarianceSummaries)) {
        return 0;
      }
      // check if 11 PM exists
      isElevenPMShifExists = this.checkIfLastShiftExist(this.staffVariance, varPosIndex);


      for (const staffsummary of this.staffVariance.staffVarianceSummaries) {
        if (staffsummary.staffVarianceDetails[varPosIndex].actualCount) {
          totalHours = totalHours + Number(staffsummary.staffVarianceDetails[varPosIndex].actualCount * 4);
          previousActualCount = staffsummary.staffVarianceDetails[varPosIndex].actualCount;
          actualTotal = Number(actualTotal) + Number(staffsummary.staffVarianceDetails[varPosIndex].actualCount);
          staffVarianceSummaryCount = Number(staffVarianceSummaryCount) + Number(1) ;
        } else {
          if (isElevenPMShifExists) {
            totalHours = totalHours + Number(previousActualCount * 4);
          } else {
            if (staffVarianceSummaryCount === 0) {
              // to exclude inifinity error
              staffVarianceSummaryCount = 1;
            }
            // remove added total hours
            totalHours = totalHours + Number(actualTotal * 4 / staffVarianceSummaryCount);
            previousActualCount = 0;
          }
        }
      }

      return totalHours;
    }
    checkIfLastShiftExist(staffVariance, varPosIndex: number): boolean {
      let isElevenPMShifExists = true;
      if (staffVariance.staffVarianceSummaries) {
        if (staffVariance.staffVarianceSummaries[staffVariance.staffVarianceSummaries.length - 1]) {
          if (staffVariance.staffVarianceSummaries[staffVariance.staffVarianceSummaries.length - 1]
            .staffVarianceDetails[varPosIndex]) {
            if (staffVariance.staffVarianceSummaries[staffVariance.staffVarianceSummaries.length - 1]
              .staffVarianceDetails[varPosIndex].actualCount) {
              isElevenPMShifExists = true;
            } else {
              isElevenPMShifExists = false;
            }
          } else {
            isElevenPMShifExists = false;
          }
        } else {
          isElevenPMShifExists = false;
        }
      }
      return isElevenPMShifExists;
    }

    getAdditionalStaffTotalhours(): number {

      let totalActualHours = 0;
      let previousActualCount = 0;
      if (Util.isNullOrUndefined(this.staffVariance.staffVarianceSummaries)) {
        return totalActualHours;
      }

      for (const staffsummary of this.staffVariance.staffVarianceSummaries) {
        if (staffsummary.additionalStaffHours) {
          totalActualHours = totalActualHours + Number(staffsummary.additionalStaffHours * 4);
          previousActualCount = staffsummary.additionalStaffHours;
        } else {
          totalActualHours = totalActualHours + Number(previousActualCount * 4);
        }
      }
      return totalActualHours;
    }

    getOGATotalhours(): number {
      this.flag = false;
      let totalOGActualHours = 0;
      // WHpU E&O flag changes
      this.getWHpUExcludeEOFlag();
      if (!(this.excludeEducationOrientationFlag)) {
        if (Util.isNullOrUndefined(this.staffVariance.staffVarianceSummaries)) {
          return 0;
        }
        for (const staffsummary of this.staffVariance.staffVarianceSummaries) {
          if (!Util.isNullOrUndefined(staffsummary.offGridActivitiesHour) && staffsummary.offGridActivitiesHour.toString().trim().length > 0) {
            totalOGActualHours = totalOGActualHours + Number(staffsummary.offGridActivitiesHour);
            this.flag = true;
          }

        }
      }
      const planOgahours = this.getOGAPlanhours();
      const averageCensus = this.getAverageCensus();
      let oaTarget = this.oASuggestedData.workHourPerUnitPrimary * averageCensus;
      if (oaTarget === null || oaTarget === undefined) {
        oaTarget = 0;
      }
      if (totalOGActualHours < planOgahours) {
        this.staffVariance.targetHours = oaTarget -
          (planOgahours - totalOGActualHours);
      } else {
        this.staffVariance.targetHours = oaTarget;
      }
      this.targetHours = this.staffVariance.targetHours;
      return totalOGActualHours;
    }

    getOGAPlanhours(): number {
      this.ogaPlanHours = 0;
      // WHpU E&O flag changes
      this.getWHpUExcludeEOFlag();
      if (!(this.excludeEducationOrientationFlag)) {
        for (const objOffGridActivities of this.planDetails.offGridActivities) {
          if (this.alertBox.getOGAplanHours(objOffGridActivities)) {
            this.ogaPlanHours = this.ogaPlanHours + this.alertBox.getOGAplanHours(objOffGridActivities);
          }
        }
        const planDate: Date = new Date();
        let planYear: number;
        let daysInYear: number;
        planYear = planDate.getFullYear();
        daysInYear = this.alertBox.findLeapYear(planYear);
        this.ogaPlanHours = this.ogaPlanHours / daysInYear;
      }
      return this.ogaPlanHours;
    }

  getNonvarTotalhours(): number {
      this.nonVarTotalhours = 0;
      for (const nonVar of this.planDetails.nonVariableDepartmentPositions) {
        this.nonVarTotalhours = this.nonVarTotalhours + nonVar.shiftHours * this.getNonvarDaysCount(nonVar);
      }
      if (this.nonVarTotalhours) {
        this.nonVarTotalhours = this.nonVarTotalhours / 7;
      } else {
        this.nonVarTotalhours = 0;
      }
      return this.nonVarTotalhours;
  }
  getAverageCensus(): number {
      if (Util.isNullOrUndefined(this.staffVariance.staffVarianceSummaries)) {
        return 1;
      }
      let avgCensus = 1;
      let totalCensus = 0;
      let censusCount = 0;
      for (const staffsummary of this.staffVariance.staffVarianceSummaries) {
        if (staffsummary.censusValue) {
          totalCensus = Number(totalCensus) + Number(staffsummary.censusValue);
          censusCount = Number(censusCount) + Number(1);
        }
      }

      if (totalCensus > 0) {
        avgCensus = totalCensus / censusCount;
      }
      return avgCensus;
  }
  getWHpUExcludeEOFlag() {
      if (sessionStorage.getItem('wHpUExcludeEOFlag') !== undefined && sessionStorage.getItem('wHpUExcludeEOFlag') !== null) {
          this.excludeEducationOrientationFlag = JSON.parse(sessionStorage.getItem('wHpUExcludeEOFlag'));
      }
  }
 getSuggestedData(): void {
  this.oASuggestedData = this.planDetails.oAStaffingMetric;
  if (!Util.isNullOrUndefined(this.oASuggestedData)) {
    this.staffVariance.priorCumulativeHours = this.oASuggestedData.cumulativeHoursVariance;
    this.staffVariance.targetHours = this.oASuggestedData.workHourPerUnitPrimary;
  }
 }
getNonvarDaysCount(objNonVariableDeptPosition: NonVariableDepartmentPosition): number {
  let nonVardays = 0;
  for (const day of objNonVariableDeptPosition.weekDays) {
    if (day.selected) {
      nonVardays++;
    }
  }
  return nonVardays;
}

  setStaffVarianceData(staffVariance : StaffVariance){
    this.staffVariance = staffVariance;
  }

  setPlanDetails(planDetails : PlanDetails){
    this.planDetails = planDetails;
  }

}
