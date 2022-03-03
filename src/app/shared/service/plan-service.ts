import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {PlanDetails} from '../domain/plan-details';
import {JobCategory} from '../domain/job-category';
import {catchError} from 'rxjs/operators';
import {Activity} from '../domain/off-grid-activities';
import {ProductHelp} from '../domain/product-help';
import {Util} from "../util/util";


@Injectable({
  providedIn: 'root'
})
export class PlanService {
  public planUrl: string;
  public allPlansUrl: string;
  public savePlanUrl: string;
  public updateStatusUrl: string;
  public updatePlanAsActiveUrl: string;
  public planDataByNameUrl: string;
  public planByPlanActionUrl: string;
  public jobCategoryURL: string;
  public offGridPlanDetailsbyPlanKeyURL: string;
  public UpdateDeleteFlagUrl: string;
  public deptKeysWithActivePlansURL: string;
  public selectedPlanAction: string;
  public applicationRedirectUrl: string;
  planUpdateStatus: string;
  planAlreadyInUse: boolean | null;
  removePlanKeyFromSessionUrl: string;
  sessionUpdateUrl: string;
  public sessionUpdateInterval: any;
  entitySelected: string;
  isRoutedFlag = false;
  checkUserAccessUrl: string;
  getSystemOptionValuesFromDTMUrl:string;
  private allPlansNameUrl: string;
  sharedPlanDetails = {};

  // Define API
  constructor(private http: HttpClient) {
    this.planUrl = '/pcops/staff-scheduler-rest/plans/department';
    this.allPlansUrl = '/pcops/staff-scheduler-rest/plans';
    this.allPlansNameUrl = '/pcops/staff-scheduler-rest/plans/all-name';
    this.updateStatusUrl = '/pcops/staff-scheduler-rest/plans/update-status';
    this.updatePlanAsActiveUrl = '/pcops/staff-scheduler-rest/plans/active-plan';
    this.savePlanUrl = '/pcops/staff-scheduler-rest/plans/plan';
    this.planDataByNameUrl = '/pcops/staff-scheduler-rest/plans/plan-name';
    this.planByPlanActionUrl = '/pcops/staff-scheduler-rest/plans/plan-by-action';
    this.jobCategoryURL = '/pcops/staff-scheduler-rest/job-details';
    this.offGridPlanDetailsbyPlanKeyURL = '/pcops/staff-scheduler-rest/plans/';
    this.UpdateDeleteFlagUrl = '/pcops/staff-scheduler-rest/plans/update-flag/';
    this.deptKeysWithActivePlansURL = '/pcops/staff-scheduler-rest/plans/departments-with-active-plans';
    this.applicationRedirectUrl = '/pcops/staff-scheduler-rest/message/redirect-url';
    this.removePlanKeyFromSessionUrl = '/pcops/staff-scheduler-rest/plans/remove-session-attribute/';
    this.sessionUpdateUrl = '/pcops/staff-scheduler-rest/plans/update-session/';
    this.checkUserAccessUrl = '/pcops/staff-scheduler-rest/plans/check-user-access/';
    this.getSystemOptionValuesFromDTMUrl = '/pcops/staff-scheduler-rest/plans';
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  public getDepartmentsKeyesWithActivePlans(): Observable<number[]> {
    return this.http.get<number[]>(this.deptKeysWithActivePlansURL, this.httpOptions);
  }

  public getPlans( listDeptKeys: Array<number>): Observable<PlanDetails[]>  {
    return this.http.get<PlanDetails[]>(this.planUrl + '/' + listDeptKeys, this.httpOptions);
  }

  public getAllPlans(): Observable<PlanDetails[]>  {
    return this.http.get<PlanDetails[]>(this.allPlansUrl, this.httpOptions);
  }

  public getAllPlansName(planKey: string): Observable<string[]>  {
      if(planKey === null) {
          return this.http.get<string[]>(this.allPlansNameUrl, this.httpOptions);
      } else {
          return this.http.get<string[]>(this.allPlansNameUrl + '/key/' + planKey, this.httpOptions);
      }
  }

  public getJobCategoryData(): Observable<JobCategory[]>  {
    return this.http.get<JobCategory[]>(this.jobCategoryURL, this.httpOptions);
  }

  // Create plan
  createPlan(plan: PlanDetails): Observable<PlanDetails> {
    plan.action = 'Inactive';
    plan.status = 'In Process';

    if (plan.name != null) {
      return this.http.post<PlanDetails>(this.savePlanUrl, plan, this.httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }
  }

  updatePlanStatus(planDetail: PlanDetails): Observable<PlanDetails> {
      if (planDetail.action === 'Inactive') {
          this.planUpdateStatus = 'Archived';
      } else {
          this.planUpdateStatus = 'Inactive';
      }
      return this.http.put<PlanDetails>(this.updateStatusUrl + '/' + this.planUpdateStatus + '/plan-key/' + planDetail.key, this.httpOptions);
  }

  // Delete plan
  updateDeleteFlag(plan: PlanDetails): Observable<PlanDetails> {
    return this.http.put<PlanDetails>(this.UpdateDeleteFlagUrl + plan.key, this.httpOptions);
  }

  getPlanDataByName(planName: string): Observable<PlanDetails> {
    return this.http.get<PlanDetails>(this.planDataByNameUrl + '/' + planName, this.httpOptions);
  }

  updatePlanAsActive(planDetail: PlanDetails): Observable<PlanDetails> {
    return this.http.put<PlanDetails>(this.updatePlanAsActiveUrl, planDetail, this.httpOptions);
  }

  getAllPlansByPlanAction(planAction: string, listDeptKeys: Array<number> = []): Observable<PlanDetails[]> {
    return this.http.get<PlanDetails[]>(this.planByPlanActionUrl + '/' + planAction + '/' + listDeptKeys, this.httpOptions);
  }

  public getPlandetails(plankey: string): Observable<PlanDetails>  {
    if(Util.isNullOrUndefined(this.sharedPlanDetails) || !this.sharedPlanDetails.hasOwnProperty(plankey)){
      this.sharedPlanDetails[plankey] = this.http.get<PlanDetails>(this.offGridPlanDetailsbyPlanKeyURL + plankey, this.httpOptions);
    }
    return this.sharedPlanDetails[plankey];
  }

  public getRedirectUrl(): Observable<ProductHelp> {
    return this.http.get<ProductHelp>(this.applicationRedirectUrl, this.httpOptions);
  }

  public removePlanKeyFromSessionAttribute(planKey: number): Observable<Response> {
      window.clearInterval(this.sessionUpdateInterval);
      return this.http.put<Response>(this.removePlanKeyFromSessionUrl + planKey, this.httpOptions) .pipe(
      catchError(this.handleError)
    );
  }

   public removePlanKeyFromSessionAttributeSubscribe(planKey: number): Observable<Response> {
       window.clearInterval(this.sessionUpdateInterval);
       return this.http.put<Response>(this.removePlanKeyFromSessionUrl + planKey, null,  this.httpOptions);
    }

    public updateSessionForPlan(planKey: number): Observable<Response> {
        return this.http.put<Response>(this.sessionUpdateUrl + planKey, this.httpOptions) .pipe(
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

  public checkUserAccessToPlan(planKey: number): Observable<boolean> {
    return this.http.get<boolean>(this.checkUserAccessUrl + planKey,this.httpOptions);
  }
  public getSystemOptionValuesFromDTM(facilityId: number, date: string): Observable<number>  {
    return this.http.get<number>(this.getSystemOptionValuesFromDTMUrl + '/facility/' + facilityId + '/start-date/' + date , this.httpOptions);
  }


}
