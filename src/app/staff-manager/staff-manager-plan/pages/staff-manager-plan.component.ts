import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PlanService} from '../../../shared/service/plan-service';
import {PlanDetails, ConfirmWindowOptions} from '../../../shared/domain/plan-details';
import {formatDate, PlatformLocation} from '@angular/common';
import {StaffVariance} from '../../../shared/domain/staff-variance';
import {StaffVarianceDetails, StaffVarianceSummary} from '../../../shared/domain/staff-summary';
import {ScheduleService} from '../../../shared/service/schedule-service';
import {shift, StaffGridCensus, StaffSchedule, staffToPatient, shiftMins, StaffGrid} from '../../../shared/domain/staff-schedule';
import {StaffGridService} from '../../../shared/service/Staffgrid-service';
import {StaffVarianceService} from '../../../shared/service/staff-variance.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {PromptDialogComponent} from '../../../shared/components/prompt-dialog/prompt-dialog.component';
import {NonVariableDepartmentPosition} from '../../../shared/domain/non-var-postn';
import {OffGridActivities} from '../../../shared/domain/off-grid-activities';
import {OASuggestedData} from '../../../shared/domain/OASuggestedData';
import {OAService} from '../../../shared/service/oa-service';
import {OAPlanData} from '../../../shared/domain/OAPlanData';
import * as moment from 'moment';
import {$NBSP} from 'codelyzer/angular/styles/chars';
import {AlertBox} from '../../../shared/domain/alert-box';
import {StaffGridCalculator} from '../../../shared/domain/staff-grid-calculator';
import {retry} from 'rxjs/operators';

import {ProductHelp} from '../../../shared/domain/product-help';
import {PageRedirectionService} from '../../../shared/service/page-redirection.service';
import {StaffManagerPlanScoreCardComponent} from '../components/staff-manager-plan-score-card/staff-manager-plan-score-card.component';
import {StaffManagerPlanCalculatorComponent} from '../components/staff-manager-plan-calculator/staff-manager-plan-calculator.component';
import {PredictedDataService} from '../../../shared/service/predicted-data.service';
//import {toDate} from '@angular/common/src/i18n/format_date';
import {months} from 'moment';
import {PredictedModel} from "../../../shared/domain/predicted-model";
import {Observable} from "rxjs";
import {RouterHistoryTrackerService} from "../../../shared/service/router-history-tracker.service";
import {Log} from "../../../shared/service/log";
import {UserService} from "../../../shared/service/user.service";
import {HistoricDataModel} from "../../../shared/domain/HistoricDataModel";
import {PredictedResponse} from "../../../shared/domain/PredictedResponse";
import {MatSnackBar} from '@angular/material/snack-bar';
import {Util} from "../../../shared/util/util";


@Component({
  selector: 'app-staff-manager-plan',
  templateUrl: './staff-manager-plan.component.html',
  styleUrls: ['./staff-manager-plan.component.scss']
})
export class StaffManagerPlanComponent implements OnInit {
  featureToggleFlag = false;
  today = new Date();
  todayDate = '';
  todayTime = '';
  public planKey: string;
  planDetails: PlanDetails = new PlanDetails();
  entitydisplayval: string;
  departmentdisplayval: string;
  public planName: string;
  staffVariance: StaffVariance = new StaffVariance();
  staffVarianceForEx: StaffVariance = new StaffVariance();
  stffVar: StaffVariance = new StaffVariance();
  predictedValues: PredictedModel = new PredictedModel();
  historicData: HistoricDataModel = new HistoricDataModel();
  predictedResponse: PredictedResponse = new PredictedResponse();
  strStaffVariance: string;
  strStfVar: string;
  currentDate = new Date();
  rcrdDate = new Date();
  modelDate = '';
  commentsError = false;
  futureFlag = false;
  previousDate = null;
  alertBox: AlertBox;
  autoSavedStatus = '';
  private autoSaveHours: number;
  private autoSaveMeridian: string;
  private dataSaved = false;
  private flag = false;
  strVarianceDetailsdata = '';
  timer = 60*2;
  countdownFlag = false;
  countDownStatus = '';
  timeZoneFlag = false;

  numbers: number[];

  isUserExiting = false;
  @ViewChild('scorecard') staffmanagerScoreCard: StaffManagerPlanScoreCardComponent;
  @ViewChild('calculator') staffmanagerCalculator: StaffManagerPlanCalculatorComponent;
  dates = [];


  objCurrentshift: shift = new shift();
  staffGridCalculator: StaffGridCalculator = new StaffGridCalculator();
  productHelp: ProductHelp = new ProductHelp();
  isBackButtonClicked = false;
  isSaveButtonClicked = false;

  constructor(private route: ActivatedRoute, private planService: PlanService, private staffManagerService: StaffVarianceService,
              private oaService: OAService, private scheduleService: ScheduleService,
              private staffGridService: StaffGridService, private dialog: MatDialog, private router: Router,
              private platformLocation: PlatformLocation, private pageRedirectionService: PageRedirectionService,private staffPredictedService:PredictedDataService,
              private routerTracker : RouterHistoryTrackerService,
              private userService: UserService, private _snackbar: MatSnackBar) {
    platformLocation.onPopState(() => {
      window.clearInterval(this.staffManagerService.autoSaveInterval);
      window.clearInterval(this.staffManagerService.notifyJobSchedulerInterval);
      // this.isBackButtonClicked = true;
      this.productHelp = new ProductHelp();
    });
    this.departmentdisplayval = '';
    this.alertBox = new AlertBox(this.dialog);
    this.alertBox.triggerTimeZoneFlag();
    this.todayDate = moment(new Date()).format('MM/DD/YYYY');
    const navigation = this.router.getCurrentNavigation();
    this.previousDate = navigation.extras.state ? moment(navigation.extras.state.selectedDate).format('YYYY-MM-DD') :
      moment(new Date(this.currentDate)).format('YYYY-MM-DD');
    const storageDate = localStorage.getItem('previousDate');
    if (Util.isNullOrUndefined(navigation.extras.state)) {
      if (!Util.isNullOrUndefined(storageDate)) {
        this.previousDate = storageDate;
      }
    }
    if (new Date().getHours() > 12) {
      setInterval(() => {
        this.todayTime = (new Date().getHours() - 12 < 10 ? '0' + (new Date().getHours() - 12).toString() : +new Date().getHours()) +
          ':' + (new Date().getMinutes() < 10 ? '0' + new Date().getMinutes().toString() : +new Date().getMinutes())
          + ':' + (new Date().getSeconds() < 10 ? '0' + new Date().getSeconds().toString() : +new Date().getSeconds()) + ' PM';
      }, 1);
    } else if (new Date().getHours() === 12) {
      setInterval(() => {
        this.todayTime = new Date().getHours() + ':' + (new Date().getMinutes() < 10 ? '0' + new Date().getMinutes().toString() : +
          new Date().getMinutes()) + ':' + (new Date().getSeconds() < 10 ? '0' + new Date().getSeconds().toString() :
          +new Date().getSeconds()) + ' PM';
      }, 1);
    } else {
      setInterval(() => {
        this.todayTime = (new Date().getHours() < 10 ? '0' + new Date().getHours().toString() : +new Date().getHours())
          + ':' + (new Date().getMinutes() < 10 ? '0' + new Date().getMinutes().toString() : +new Date().getMinutes())
          + ':' + (new Date().getSeconds() < 10 ? '0' + new Date().getSeconds().toString() : +new Date().getSeconds()) + ' AM';
      }, 1);

    }

    this.rcrdDate = this.staffVariance.recordDate;
  }
  checkIfPlanEdited(): boolean {
    if (this.staffVariance.targetHours === null ) {
      this.staffVariance.targetHours = 0;
    }
    if (this.staffVariance.priorCumulativeHours === null ) {
      this.staffVariance.priorCumulativeHours = 0;
    }
    for (const staffsum of this.staffVariance.staffVarianceSummaries) {
      if (staffsum.censusValue == null || staffsum.censusValue == undefined) {
        staffsum.censusValue = null;
      }
    }
    const tempStrVarianceDetails = JSON.stringify(this.staffVariance);
    if (this.strVarianceDetailsdata === tempStrVarianceDetails) {
      return false;
    } else {
      return true;
    }
  }

  ngOnInit(): void {
    this.planService.isRoutedFlag = true;
    this.loadplandetails();
    this.triggerAutoSave();
    this.triggerRedirectTimer();
    // this.startCountdown(20);
    this.notifyUser();
  }

    triggerAutoSave(): void {
        if (!Util.isNullOrUndefined(this.staffManagerService) && !this.staffManagerService.planAlreadyInUse) {
            this.staffManagerService.autoSaveInterval = (Number)(setInterval(() => {
                this.autoSave();
            }, 120000));
        }
    }

  notifyUser(): void {
    if (this.staffManagerService && !this.staffManagerService.planAlreadyInUse) {
      this.staffManagerService.notifyJobSchedulerInterval = (Number)(setInterval(() => {
        this.checkTime();
      }, 1000));
    }
  }

    @HostListener('document:keydown', ['$event'])
    @HostListener('document:click', ['$event'])
    restartAutoSaveTrigger(event): void {
        window.clearInterval(this.staffManagerService.autoSaveInterval);
        window.clearInterval(this.staffManagerService.autoRedirectInterval);
        this.dataSaved = false;
        this.triggerAutoSave();
        this.triggerRedirectTimer();
    }
    loadStaffVarianceDetails(): void {
    let selectedDate;
    if (Util.isNullOrUndefined(this.previousDate)) {
      selectedDate = moment(new Date(this.currentDate)).format('YYYY-MM-DD');
    } else {
      selectedDate = this.previousDate;
    }
    if(!Util.isNullOrUndefined(this.planDetails.key)){
            sessionStorage.setItem('activePlanKey',this.planDetails.key);
    }
    localStorage.setItem('previousDate', selectedDate);
    this.staffManagerService.getStaffVarianceByDepartmentAndPlan(this.planDetails.departmentKey, this.planDetails.key,
      selectedDate).subscribe(data => {
      this.staffVariance = data['data'];
      this.scheduleService.setStaffVarianceData(this.staffVariance);
      this.checkForSessionAttributes();
      this.departmentdisplayval = this.planDetails.departmentCode + '-' + this.planDetails.departmentName;
      if(this.staffVariance) {
        this.staffVariance.disableFlag = false;
      }
      this.StaffSummaryDetails();
      this.setShiftTimeRange();
    });
    setTimeout( () => this.strVarianceDetailsdata = JSON.stringify(this.staffVariance), 1000);
  }

  loadplandetails(): void {
    this.route.queryParamMap.subscribe(queryParams => {
      this.planKey = queryParams.get('plankey');
    });
    this.planService.getPlandetails(this.planKey).subscribe(data => {
      this.planDetails = data;
      this.scheduleService.setPlanDetails(this.planDetails);
      this.getExcludeEducationOrientationFlag();
      this.entitydisplayval = this.planDetails.facilityCode + '-' + this.planDetails.facilityName;
      this.departmentdisplayval = this.planDetails.departmentName;
      this.planName = this.planDetails.name;
      this.loadSchedules();
    });
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

  autoSave(): void {
          this.commentsError = false;
          //this.staffVariance.targetHours = this.staffmanagerScoreCard.targetHours;
          let actualCount = 0;
          let isReloadNeeded = false;
          for (const staffSummary of this.staffVariance.staffVarianceSummaries) {
              if (!isReloadNeeded && Util.isNullOrUndefined(staffSummary.shiftDetailKey)) {
                  isReloadNeeded = true;
              }
              actualCount = this.getActualCountAndStaffHours(staffSummary, actualCount);
          }

          if (!Util.isNullOrUndefined(this.staffVariance.comments) && this.staffVariance.comments.length > 500) {
              this.commentsError = true;
          }
          this.staffVariance.actualHours = this.staffmanagerCalculator.getActualTotalForAllVariablePosition() +
            this.scheduleService.getOGATotalhours() + this.staffmanagerScoreCard.nonVarTotalhours;
          if (this.staffmanagerScoreCard.oASuggestedData !== null || this.staffmanagerScoreCard.oASuggestedData !== undefined) {
            if(this.staffmanagerCalculator.getOGATotalhours() < this.staffmanagerCalculator.ogatotalhours){
              this.staffVariance.dailyVarianceHours = (this.staffmanagerScoreCard.getActualHour() + (this.staffmanagerCalculator.ogatotalhours - this.staffmanagerCalculator.getOGATotalhours()) - (this.staffmanagerScoreCard.oASuggestedData.workHourPerUnitPrimary *
                this.scheduleService.getAverageCensus()  + this.staffmanagerScoreCard.getPlannedMinusDailyHours()));
            }
            else{
              this.staffVariance.dailyVarianceHours = (this.staffmanagerScoreCard.getActualHour() - (this.staffmanagerScoreCard.oASuggestedData.workHourPerUnitPrimary *
                this.scheduleService.getAverageCensus()  + this.staffmanagerScoreCard.getPlannedMinusDailyHours()));
            }
          }

          if (!(actualCount === 0  || this.commentsError)) {
            this.staffManagerService.saveStaffVarianceDetails(this.staffVariance).subscribe(result => {
              this.strVarianceDetailsdata = JSON.stringify(this.staffVariance);
              this.dataSaved = true;
            }, error => {
              this.dataSaved = false;
            });
            this.autoSaveHours = new Date().getHours();
            if (this.autoSaveHours > 11) {
                      this.autoSaveMeridian = ' PM';
                      if (this.autoSaveHours > 12) {
                          this.autoSaveHours = this.autoSaveHours - 12;
                      }
                  } else {
                      this.autoSaveMeridian = ' AM';
                  }
            if (isReloadNeeded) {
                      this.loadplandetails();
                  }
              // tslint:disable-next-line:max-line-length
            this.autoSavedStatus = 'Plan is auto saved at: ' + (this.autoSaveHours < 10 ? '0' + this.autoSaveHours : this.autoSaveHours) + ':' +  (new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes()) + this.autoSaveMeridian;
            setTimeout(() => {
                  this.autoSavedStatus = '';
              }, 15000);
          }
      }
      getActualCountAndStaffHours(staffSummary: StaffVarianceSummary, actualCount: number) {
        for (const staffVariancedetail of staffSummary.staffVarianceDetails) {
          if (staffVariancedetail.actualCount) {
            if (typeof staffVariancedetail.actualCount == 'string'){
              staffVariancedetail.actualCount = parseFloat(staffVariancedetail.actualCount);
            }
            actualCount = actualCount + Number(staffVariancedetail.actualCount);
          }
        }
        if (staffSummary.additionalStaffHours && typeof staffSummary.additionalStaffHours === 'string') {
          staffSummary.additionalStaffHours = parseFloat(staffSummary.additionalStaffHours);
        }
        if (!Util.isNullOrUndefined(staffSummary.comments) && staffSummary.comments.length > 500) {
          this.commentsError = true;
        }
        return actualCount;
      }


      saveAndExitCheckForError(): boolean {
        let isError = false;

        let actualCount = 0;
        for (const staffSummary of this.staffVariance.staffVarianceSummaries) {
      for (const staffVariancedetail of staffSummary.staffVarianceDetails) {
        if (staffVariancedetail.actualCount) {
          actualCount = actualCount + Number(staffVariancedetail.actualCount);
        }
      }
    // check for individual comments length
      if (!Util.isNullOrUndefined(staffSummary.comments) && staffSummary.comments.length > 500) {
        isError = true;
      }
    }
    // check for overall comments length
        if (!Util.isNullOrUndefined(this.staffVariance.comments) && this.staffVariance.comments.length > 500) {
       isError = true;
    }
    // check for actualCount
        if (actualCount === 0) {
      isError = true;
    }

        return isError;

      }
  saveAndExitToplanner(): void {
    this.saveAndExitStaffingDetails(true);
  }
  saveAndExitStaffingDetails(isrouteToPlanner: boolean): void {
    this.isBackButtonClicked = false;
    //this.staffVariance.targetHours = this.staffmanagerScoreCard.targetHours;
    if (!Util.isNullOrUndefined(this.staffmanagerScoreCard.oASuggestedData)) {
      this.commentsError = false;
    }

    let tempStaffVariance: StaffVariance = new StaffVariance();
    const strStaffVariance = JSON.stringify(this.staffVariance);
    tempStaffVariance = JSON.parse(strStaffVariance);
    tempStaffVariance.actualHours = this.staffmanagerCalculator.getActualTotalForAllVariablePosition() + this.scheduleService.getOGATotalhours() + this.staffmanagerCalculator.nonVarTotalhours;
    if (!Util.isNullOrUndefined(this.staffmanagerScoreCard.oASuggestedData)) {
      if(this.staffmanagerCalculator.getOGATotalhours() < this.staffmanagerCalculator.ogatotalhours){
        tempStaffVariance.dailyVarianceHours = (this.staffmanagerScoreCard.getActualHour() + (this.staffmanagerCalculator.ogatotalhours - this.staffmanagerCalculator.getOGATotalhours()) - (this.staffmanagerScoreCard.oASuggestedData.workHourPerUnitPrimary *
          this.scheduleService.getAverageCensus()  + this.staffmanagerScoreCard.getPlannedMinusDailyHours()));
      }
      else{
        tempStaffVariance.dailyVarianceHours = (this.staffmanagerScoreCard.getActualHour() - (this.staffmanagerScoreCard.oASuggestedData.workHourPerUnitPrimary *
          this.scheduleService.getAverageCensus()  + this.staffmanagerScoreCard.getPlannedMinusDailyHours()));
      }

    }
    // get targetwhpu
    let tempTargetWhpu = 0;
    if (!Util.isNullOrUndefined(this.staffmanagerScoreCard.oASuggestedData)) {
      tempTargetWhpu = (this.staffmanagerScoreCard.oASuggestedData.workHourPerUnitPrimary * this.scheduleService.getAverageCensus());
    }
    if (this.staffmanagerScoreCard.ogatotalhours > this.scheduleService.getOGATotalhours()) {
      tempTargetWhpu = tempTargetWhpu - (this.staffmanagerScoreCard.ogatotalhours - this.scheduleService.getOGATotalhours());
    }
    //tempStaffVariance.targetHours = this.staffmanagerScoreCard.targetHours;
    let scheduledCount = 0;

    for (const staffSummary of tempStaffVariance.staffVarianceSummaries) {
      for (const staffVariancedetail of staffSummary.staffVarianceDetails) {
        if (staffVariancedetail.scheduleCount) {
          staffVariancedetail.actualCount = staffVariancedetail.scheduleCount;
          scheduledCount = scheduledCount + Number(staffVariancedetail.scheduleCount);
        }
      }
    }


    let actualCount = 0;
    for (const staffSummary of tempStaffVariance.staffVarianceSummaries) {
      actualCount = this.getActualCountAndStaffHours(staffSummary, actualCount);
    }

    if (!Util.isNullOrUndefined(tempStaffVariance.comments) && tempStaffVariance.comments.length > 500) {
      this.commentsError = true;
    }


    if (actualCount === 0 && !this.futureFlag) {
      this.alertBox.openAlert('exit-dialog', '175px', '450px',
        'Staffing Calculator', 'Enter actual values.');
    } else if (this.commentsError) {
      const alertMessage = 'Entered Comments should be less than 500 Characters';

      this.alertBox.openAlert('exit-dialog', '180px', '450px',
        'Staffing Calculator', alertMessage);

    } else if (scheduledCount === 0 && this.futureFlag) {
      this.alertBox.openAlert('exit-dialog', '175px', '450px',
        'Staffing Calculator', 'Enter scheduled values.');
    } else {
      if (tempStaffVariance.staffVarianceSummaries[0].shiftDetailKey && !this.isUserExiting && tempStaffVariance.recordStatusKey !== 4) {
        const dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', '190px', '550px',
          'Staffing Calculator',
          'Grid data on this page will overwrite and replace any existing saved data. Are you sure you want to continue?');

        document.body.classList.add('pr-modal-open');
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
              this.staffManagerService.saveStaffVarianceDetails(tempStaffVariance).subscribe(data => {
                  window.clearInterval(this.staffManagerService.autoSaveInterval);
                  window.clearInterval(this.staffManagerService.autoRedirectInterval);
                  window.clearInterval(this.staffManagerService.notifyJobSchedulerInterval);
                  // this.removeSessionAttributes();
                if (!this.isSaveButtonClicked) {
                  this._snackbar.dismiss();
                  if (isrouteToPlanner) {
                    this.router.navigate(['/plan-list']);
                  } else {
                    this.router.navigate(['/staff-manager']);
                  }
                }else{
                  this.success();
                }
                this.isSaveButtonClicked = false;
            });
          }
          document.body.classList.remove('pr-modal-open');
        });

      }else {
          this.staffManagerService.saveStaffVarianceDetails(tempStaffVariance).subscribe(data => {
              window.clearInterval(this.staffManagerService.autoSaveInterval);
              window.clearInterval(this.staffManagerService.autoRedirectInterval);
              window.clearInterval(this.staffManagerService.notifyJobSchedulerInterval);
              // this.removeSessionAttributes();
              if(!this.isSaveButtonClicked) {
                if (isrouteToPlanner) {
                  this.router.navigate(['/plan-list']);
                } else {
                  this.router.navigate(['/staff-manager']);
                }
              }else{
                this.success();
              }
            this.isSaveButtonClicked = false;
        });
      }

    }
  }

  saveAndExitStaffingDetailsForDates(): void {

    this.isBackButtonClicked = false;
    if (!Util.isNullOrUndefined(this.staffmanagerScoreCard.oASuggestedData)) {
      this.commentsError = false;
    }
    //this.staffVariance.targetHours = this.staffmanagerScoreCard.targetHours;
    let tempStaffVariance: StaffVariance = new StaffVariance();
    const strStaffVariance = JSON.stringify(this.staffVariance);
    tempStaffVariance = JSON.parse(strStaffVariance);
    tempStaffVariance.actualHours = this.staffmanagerCalculator.getActualTotalForAllVariablePosition() + this.scheduleService.getOGATotalhours() + this.staffmanagerScoreCard.nonVarTotalhours
    if (!Util.isNullOrUndefined(this.staffmanagerScoreCard.oASuggestedData)) {
      if(this.staffmanagerCalculator.getOGATotalhours() < this.staffmanagerCalculator.ogatotalhours){
        tempStaffVariance.dailyVarianceHours = (this.staffmanagerScoreCard.getActualHour() + (this.staffmanagerCalculator.ogatotalhours - this.staffmanagerCalculator.getOGATotalhours()) - (this.staffmanagerScoreCard.oASuggestedData.workHourPerUnitPrimary *
          this.scheduleService.getAverageCensus() + this.staffmanagerScoreCard.getPlannedMinusDailyHours()));
      }
      else{
        tempStaffVariance.dailyVarianceHours = (this.staffmanagerScoreCard.getActualHour() - (this.staffmanagerScoreCard.oASuggestedData.workHourPerUnitPrimary *
          this.scheduleService.getAverageCensus() + this.staffmanagerScoreCard.getPlannedMinusDailyHours()));
      }

    }
// get targetwhpu
    let tempTargetWhpu = 0;
    if (!Util.isNullOrUndefined(this.staffmanagerScoreCard.oASuggestedData)) {
      tempTargetWhpu = (this.staffmanagerScoreCard.oASuggestedData.workHourPerUnitPrimary * this.scheduleService.getAverageCensus());
    }
    if (this.staffmanagerScoreCard.ogatotalhours > this.scheduleService.getOGATotalhours()) {
      tempTargetWhpu = tempTargetWhpu - (this.staffmanagerScoreCard.ogatotalhours - this.scheduleService.getOGATotalhours());
    }
    //tempStaffVariance.targetHours = this.staffmanagerScoreCard.targetHours;
    let scheduledCount = 0;

    for (const staffSummary of tempStaffVariance.staffVarianceSummaries) {
      for (const staffVariancedetail of staffSummary.staffVarianceDetails) {
        if (staffVariancedetail.scheduleCount) {
          if (typeof staffVariancedetail.scheduleCount == 'string'){
            staffVariancedetail.scheduleCount = parseFloat(staffVariancedetail.scheduleCount);
          }
          staffVariancedetail.actualCount = staffVariancedetail.scheduleCount;
          scheduledCount = scheduledCount + Number(staffVariancedetail.scheduleCount);
        }
      }
    }


    let actualCount = 0;
    for (const staffSummary of tempStaffVariance.staffVarianceSummaries) {
      actualCount = this.getActualCountAndStaffHours(staffSummary, actualCount);
    }

    if (!Util.isNullOrUndefined(tempStaffVariance.comments) && tempStaffVariance.comments.length > 500) {
      this.commentsError = true;
    }


    if (actualCount === 0 && !this.futureFlag) {
      this.alertBox.openAlert('exit-dialog', '175px', '450px',
        'Staffing Calculator', 'Enter actual values.');
      this.modelDate = moment(this.staffVariance.recordDate).format('MM/DD/YYYY');
    } else if (this.commentsError) {
      const alertMessage = 'Entered Comments should be less than 500 Characters';
      this.alertBox.openAlert('exit-dialog', '180px', '450px',
        'Staffing Calculator', alertMessage);
      this.modelDate = moment(this.staffVariance.recordDate).format('MM/DD/YYYY');
    } else if (scheduledCount === 0 && this.futureFlag) {
      this.alertBox.openAlert('exit-dialog', '175px', '450px',
        'Staffing Calculator', 'Enter scheduled values.');
      this.modelDate = moment(this.staffVariance.recordDate).format('MM/DD/YYYY');
    } else {
      if (tempStaffVariance.staffVarianceSummaries[0].shiftDetailKey && !this.isUserExiting && tempStaffVariance.recordStatusKey !== 4) {
        const dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', '190px', '550px',
          'Staffing Calculator',
          'Grid data on this page will overwrite and replace any existing saved data. Are you sure you want to continue?');

        document.body.classList.add('pr-modal-open');
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.staffManagerService.saveStaffVarianceDetails(tempStaffVariance).subscribe(data => {
              window.clearInterval(this.staffManagerService.autoSaveInterval);
              window.clearInterval(this.staffManagerService.autoRedirectInterval);
              window.clearInterval(this.staffManagerService.notifyJobSchedulerInterval);
              this.removeSessionAttributes();
              this.loadDates();
            });
          }
          document.body.classList.remove('pr-modal-open');
        });

      } else {
        this.staffManagerService.saveStaffVarianceDetails(tempStaffVariance).subscribe(data => {
          window.clearInterval(this.staffManagerService.autoSaveInterval);
          window.clearInterval(this.staffManagerService.autoRedirectInterval);
          window.clearInterval(this.staffManagerService.notifyJobSchedulerInterval);
          this.removeSessionAttributes();
          this.loadDates();
        });
      }


    }
  }



  // loadPredictedValue() {
  //   if (!Util.isNullOrUndefined(this.historicData)) {
  //     let selectedDate: string = moment(this.staffVariance.recordDate).format('DD-MM-YYYY');
  //     this.staffPredictedService.getPredictedDataFromVolumeForecasting(this.historicData[0]).subscribe(data => {
  //       let dataStr = JSON.stringify(data);
  //       dataStr = dataStr.substring(1, dataStr.length - 1);
  //       dataStr = dataStr.replace(/'/g, '"');
  //       this.predictedResponse = JSON.parse(dataStr);
  //       console.log(this.predictedResponse);
  //       if (!Util.isNullOrUndefined(this.staffVariance)) {
  //         for (const dates of this.predictedResponse.departmentForecast) {
  //           for (let i = 0; i < 6; i++) {
  //             if (selectedDate === dates.date && dates.dayForecastValues[i].shiftTime
  //               === this.staffVariance.staffVarianceSummaries[i].shiftTime) {
  //               this.staffVariance.staffVarianceSummaries[i].predictedCount = Math.round(dates.dayForecastValues[i].censusValue);
  //             }
  //           }
  //         }
  //       }
  //     });
  //   }
  // }
  getHistoricDataforPastRecords() {
    if (!Util.isNullOrUndefined(this.staffVariance) && this.featureToggleFlag) {
      this.modelDate = moment.parseZone(this.staffVariance.recordDate).format('MM/DD/YYYY');
      let selectedDate: string = moment.parseZone(this.staffVariance.recordDate).format('YYYY-MM-DD');
      let createDate: string = moment.parseZone(this.planDetails.effectiveStartDate).format('YYYY-MM-DD');
      this.staffPredictedService.getHistoricDataforPastRecords(this.planDetails.departmentKey, this.planDetails.key, selectedDate, createDate).subscribe(data => {
        this.historicData = data['data'];

      if (!Util.isNullOrUndefined(this.historicData)) {
        let selectedDate: string = moment(this.staffVariance.recordDate).format('DD-MM-YYYY');
        this.staffPredictedService.getPredictedDataFromVolumeForecasting(this.historicData[0]).subscribe(data => {
          let dataStr = JSON.stringify(data);
          dataStr = dataStr.substring(1, dataStr.length - 1);
          dataStr = dataStr.replace(/'/g, '"');
          this.predictedResponse = JSON.parse(dataStr);
          if (!Util.isNullOrUndefined(this.staffVariance)) {
            for (const dates of this.predictedResponse.departmentForecast) {
              for (let i = 0; i < 6; i++) {
                if (selectedDate === dates.date && dates.dayForecastValues[i].shiftTime
                  === this.staffVariance.staffVarianceSummaries[i].shiftTime) {
                  this.staffVariance.staffVarianceSummaries[i].predictedCount = Math.round(dates.dayForecastValues[i].censusValue);
                }
              }
            }
          }
        });
      }
      });
    }
  }
  StaffSummaryDetails(): number {
    this.getHistoricDataforPastRecords();
    // this.loadPredictedValue();
    if (!this.staffVariance) {
      this.staffVariance = new StaffVariance();
    }
    if (Util.isNullOrUndefined(this.staffVariance.staffVarianceSummaries)) {
      return 0;
    }
    if (this.staffVariance.staffVarianceSummaries.length < 1) {
      let shiftTime = 3;
      this.staffVariance.staffVarianceSummaries = [];
      // create 6 default staff summary with timings
      for (let i = 0; i < 6; i++) {
        const staffVarianceSummary: StaffVarianceSummary = new StaffVarianceSummary();
        const createDate = new Date(this.staffVariance.recordDate);
        const presentDate = new Date();
        const difference = this.compareTwoDates(createDate, presentDate);
        this.timeZoneFlag = this.alertBox.getTimeZoneFlag();
        if ((this.staffVariance.recordStatusKey === 5) && (difference.localeCompare('1') !== 0 && difference.localeCompare(('0')) !== 0) && createDate < presentDate && this.featureToggleFlag) {
          this.staffVariance.disableFlag = true;
        }
        if ((this.staffVariance.recordStatusKey === 5) && (difference.localeCompare('1') === 0) && this.timeZoneFlag && createDate < presentDate && this.featureToggleFlag) {
          this.staffVariance.disableFlag = true;
        }
        // Set the shift time
        if (i === 0) {
          staffVarianceSummary.shiftTime = shiftTime;
        } else {
          staffVarianceSummary.shiftTime = shiftTime + 4;
          shiftTime = shiftTime + 4;
        }
        // Set the shift time format
        staffVarianceSummary.shiftFormat = 'AM';
        if (staffVarianceSummary.shiftTime > 12) {
          staffVarianceSummary.shiftTime = shiftTime - 12;
          staffVarianceSummary.shiftFormat = 'PM';
        }
        staffVarianceSummary.defaultShiftKey = i + 1;

        // get active shift for summary
        staffVarianceSummary.plannedShifts = this.getActiveshiftFromPlan(staffVarianceSummary.shiftTime, staffVarianceSummary.shiftFormat);
        staffVarianceSummary.staffVarianceDetails = [];
        for (const varpos of this.planDetails.variableDepartmentPositions) {
          const staffDetail: StaffVarianceDetails = new StaffVarianceDetails();
          staffDetail.variableCategoryKey = varpos.categoryKey;
          staffVarianceSummary.staffVarianceDetails.push(staffDetail);
        }
        this.staffVariance.staffVarianceSummaries.push(staffVarianceSummary);
        this.stffVar.staffVarianceSummaries.push(staffVarianceSummary);
      }
      this.staffVarianceForEx = this.staffVariance;
      for (const staffsum of this.staffVarianceForEx.staffVarianceSummaries) {
        if (staffsum.censusValue == null || staffsum.censusValue == undefined) {
          staffsum.censusValue = null;
        }
      }
      this.strStaffVariance = JSON.stringify(this.staffVariance);
      this.strStfVar = JSON.stringify(this.stffVar);
      setTimeout( () => this.strVarianceDetailsdata = JSON.stringify(this.staffVarianceForEx), 1000);
    } else {
      for (const staffVarianceSummary of this.staffVariance.staffVarianceSummaries) {
        if (staffVarianceSummary.censusValue) {
          staffVarianceSummary.isCensusvalid = true;
        }
        staffVarianceSummary.plannedShifts = this.getActiveshiftFromPlan(staffVarianceSummary.shiftTime, staffVarianceSummary.shiftFormat);
      }
      this.staffVarianceForEx = this.staffVariance;
      for (const staffsum of this.staffVarianceForEx.staffVarianceSummaries) {
        if (staffsum.censusValue == null || staffsum.censusValue == undefined) {
          staffsum.censusValue = null;
        }
      }
      this.strStaffVariance = JSON.stringify(this.staffVariance);
      setTimeout( () => this.strVarianceDetailsdata = JSON.stringify(this.staffVarianceForEx), 1000);
    }
  }

  private compareTwoDates(createdDate: Date, selectedDate: Date): string {
// To calculate the time difference of two dates
    const differenceInTime = createdDate.getTime() - selectedDate.getTime();

// To calculate the no. of days between two dates
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);

    return Math.abs(differenceInDays).toFixed(0);
  }

  getPlannedTotal(staffSummaryIndex: number): any {
    const staffSummary: StaffVarianceSummary = this.staffVariance.staffVarianceSummaries[staffSummaryIndex];
    if (staffSummary) {
      if (staffSummary.plannedShift) {
        if (staffSummary.plannedShift.staffGridCensuses) {
          for (const census of staffSummary.plannedShift.staffGridCensuses) {
            if (census.censusIndex == staffSummary.censusValue) {
              let plannedtotal = 0;
              let rowIndex = 0;
              for (const staffgridCensusActivity of census.staffToPatientList) {
                if (staffSummary.staffVarianceDetails[rowIndex].actualCount) {
                  plannedtotal = plannedtotal + Number(staffgridCensusActivity.staffCount);
                }
                rowIndex++;
              }
              return plannedtotal;
            }

          }

          return '-';
        } else {
          return '-';
        }
      }
    } else {
      return '-';
    }
  }

  getVarianceTotal(staffSummaryIndex: number): string {

    const staffSummary: StaffVarianceSummary = this.staffVariance.staffVarianceSummaries[staffSummaryIndex];
    if (staffSummary) {
      // check if details exist
      if (staffSummary.staffVarianceDetails) {
        let actualtotal = 0;
        // loop through each detail
        for (const staffVarianceDetail of staffSummary.staffVarianceDetails) {
          if (staffVarianceDetail.actualCount) {
            actualtotal = actualtotal + Number(staffVarianceDetail.actualCount);
          }
        }

        let plannedtotal = 0;
        const strPlannedtotal = this.getPlannedTotal(staffSummaryIndex);

        if (staffSummary.additionalStaffHours) {
          actualtotal = Util.isNullOrUndefined(actualtotal) ? 0 : actualtotal;
          actualtotal = actualtotal + Number(staffSummary.additionalStaffHours);
        }



        if (strPlannedtotal !== '-') {
          plannedtotal = Number(strPlannedtotal);
        }
        if (actualtotal) {
          return  (actualtotal - plannedtotal).toFixed(2);
        } else {
          return '-';
        }
      } else {
        return '-';
      }
    } else {
      return '-';
    }
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
    isElevenPMShifExists = this.checkIfLastShiftExist(varPosIndex);


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

  checkIfLastShiftExist(varPosIndex: number): boolean {
    let isElevenPMShifExists = true;
    if (this.staffVariance.staffVarianceSummaries) {
      if (this.staffVariance.staffVarianceSummaries[this.staffVariance.staffVarianceSummaries.length - 1]) {
        if (this.staffVariance.staffVarianceSummaries[this.staffVariance.staffVarianceSummaries.length - 1]
          .staffVarianceDetails[varPosIndex]) {
          if (this.staffVariance.staffVarianceSummaries[this.staffVariance.staffVarianceSummaries.length - 1]
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

  getActualTotalForAllVariablePosition(): number {
    let totalHours = 0;
    let count = 0;
    for (const variableDepartmentPostition of this.planDetails.variableDepartmentPositions) {
      totalHours = totalHours + Number(this.getActualTotalForVariablePosition(count));
      count = count + Number(1);
    }
    return totalHours + this.getAdditionalStaffTotalhours();
  }

  getPlannedTotalForVariablePosition(varPosIndex: number): number {
    let totalHours = 0;
    let previousPlannedCount = 0;
    let staffVarianceSummaryCount = 0;
    let actualTotal = 0;
    let isElevenPMShifExists = true;

    // check if 11 PM shift exists
    // check if 11 PM exists
    isElevenPMShifExists = this.checkIfLastShiftExist(varPosIndex);

    if (Util.isNullOrUndefined(this.staffVariance.staffVarianceSummaries)) {
      return 0;
    }
    for (const staffsummary of this.staffVariance.staffVarianceSummaries) {
      if (staffsummary.staffVarianceDetails[varPosIndex].actualCount) {
        const staffGridCensus: StaffGridCensus = staffsummary.plannedShift.staffGridCensuses.filter
        (census => census.censusIndex == staffsummary.censusValue)[0];
        if (staffGridCensus) {
          if (staffGridCensus.staffToPatientList[varPosIndex]) {
            totalHours = totalHours + Number(staffGridCensus.staffToPatientList[varPosIndex].staffCount * 4);
            previousPlannedCount = staffGridCensus.staffToPatientList[varPosIndex].staffCount;
            actualTotal = Number(actualTotal) + Number(staffGridCensus.staffToPatientList[varPosIndex].staffCount);
            staffVarianceSummaryCount = Number(staffVarianceSummaryCount) + Number(1) ;
          }
        }
      } else {
        if (isElevenPMShifExists) {
        totalHours = totalHours + Number(previousPlannedCount * 4);
        } else {
          if (staffVarianceSummaryCount === 0) {
            // to exclude inifinity error
            staffVarianceSummaryCount = 1;
          }
          // remove added total hours
          totalHours = totalHours + Number(actualTotal * 4 / staffVarianceSummaryCount);
          previousPlannedCount = 0;
        }
      }
    }
    return totalHours;
  }

  getPlannedTotalForAllVariablePosition(): number {
    let totalHours = 0;
    let count = 0;
    for (const variableDepartmentPostition of this.planDetails.variableDepartmentPositions) {
      totalHours = totalHours + Number(this.getPlannedTotalForVariablePosition(count));
      count = count + Number(1);
    }
    return totalHours;
  }

  getTotalVarianceForVariablePosition(varPosIndex: number): number {
    return this.getActualTotalForVariablePosition(varPosIndex) - this.getPlannedTotalForVariablePosition(varPosIndex);
  }

  getTotalVarianceForAllVariablePosition(): number {
    let totalHours = 0;
    let count = 0;
    for (const variableDepartmentPostition of this.planDetails.variableDepartmentPositions) {
      totalHours = totalHours + Number(this.getTotalVarianceForVariablePosition(count));
      count = count + Number(1);
    }
    return totalHours + this.getAdditionalStaffTotalhours();
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
    let totalOGAActualHours = 0;
    if (Util.isNullOrUndefined(this.staffVariance.staffVarianceSummaries)) {
      return 0;
    }
    for (const staffsummary of this.staffVariance.staffVarianceSummaries) {
      if (!Util.isNullOrUndefined(staffsummary.offGridActivitiesHour) && staffsummary.offGridActivitiesHour.toString().trim().length > 0) {
        totalOGAActualHours = totalOGAActualHours + Number(staffsummary.offGridActivitiesHour);
        this.flag = true;
      }

    }
    return totalOGAActualHours;
  }

  getActiveshiftFromPlan(shifttime: number, shiftFormat: string): shiftMins[] {

    let shiftArray: shiftMins[] = [];
    let staffSchedule: StaffSchedule;
    let currentDay = this.currentDate.getDay() - 1;
    for (const planSchedule of this.planDetails.staffScheduleList) {
      if (currentDay < 0) {
        currentDay = 6; // to denote Sunday
      }
      if (planSchedule.scheduleDays[currentDay]) {
        staffSchedule = planSchedule;
      }
    }
    let count = 4;
    while (count > 0) {
      if (staffSchedule) {
        for (const planShift of staffSchedule.planShiftList) {
          let planShiftStarttime: number;
          let minutes: number;
          const shiftObj: shiftMins = new shiftMins() ;
          planShiftStarttime = Number(planShift.startTime.split(':')[0]);
          minutes = Number(planShift.startTime.split(':')[1]);
          if (shiftFormat.toLocaleUpperCase() === 'AM') {
            if (planShift.timeFormatFlag) {
              this.getShiftArray(planShiftStarttime, shifttime, minutes , planShift, shiftObj, shiftArray);
            }
            if (!planShift.timeFormatFlag) {
              planShiftStarttime = planShiftStarttime - 12;
              if (planShiftStarttime + planShift.hours > 12) {
                if (shifttime < planShiftStarttime + planShift.hours - 12) {
                  shiftObj.objshift = planShift;
                  shiftArray.push(shiftObj);
                } else if (shifttime === planShiftStarttime + planShift.hours - 12 && minutes > 0) {
                  shiftObj.objshift = planShift;
                  shiftObj.timeEnds = true;
                  shiftArray.push(shiftObj);
                }
              }

            }
          } else if (shiftFormat.toLocaleUpperCase() === 'PM') {
            if (!planShift.timeFormatFlag) {
              if (shifttime !== 12) {
                planShiftStarttime = planShiftStarttime - 12;
              }
              this.getShiftArray(planShiftStarttime, shifttime, minutes , planShift, shiftObj, shiftArray);
            }
            if (planShift.timeFormatFlag) {
              if (planShiftStarttime + planShift.hours > 12) {
                if (shifttime < planShiftStarttime + planShift.hours - 12) {
                  shiftObj.objshift = planShift;
                  shiftArray.push(shiftObj);
                } else if (shifttime === 12 && shifttime < planShiftStarttime + planShift.hours ) {
                  shiftObj.objshift = planShift;
                  shiftArray.push(shiftObj);
                } else if (shifttime === planShiftStarttime + planShift.hours - 12 && minutes > 0) {
                  shiftObj.objshift = planShift;
                  shiftObj.timeEnds = true;
                  shiftArray.push(shiftObj);
                }
              }
            }
          }
        }
        count--;
      }
      if (shifttime === 11 && shiftFormat.toLocaleUpperCase() === 'AM' ) {
        shifttime += 1;
        shiftFormat = 'PM';
      } else if (shifttime === 12 && shiftFormat.toLocaleUpperCase() === 'PM' ) {
        shifttime = shifttime - 12 + 1;
      } else if (shifttime === 11 && shiftFormat.toLocaleUpperCase() === 'PM' ) {
        shifttime = shifttime + 1 - 12;
        shiftFormat = 'AM';
      } else {
        shifttime += 1;
      }
    }
    return shiftArray;
  }

  getShiftArray(planShiftStarttime: number , shifttime: number, minutes: number , planShift: shift, shiftObj: shiftMins, shiftArray: shiftMins[]) {
    if (planShiftStarttime <= shifttime && shifttime < planShiftStarttime + planShift.hours) {
      shiftObj.objshift = planShift;
      if (planShiftStarttime === shifttime && minutes > 0) {
        shiftObj.timestart = true;
      }
      shiftArray.push(shiftObj);
    }
    if ( shifttime === planShiftStarttime + planShift.hours && minutes > 0) {
      shiftObj.objshift = planShift;
      shiftObj.timeEnds = true;
      shiftArray.push(shiftObj);
    }

    if (planShiftStarttime + planShift.hours > 24) {
      planShiftStarttime = planShiftStarttime + planShift.hours - 24;
      if (planShiftStarttime > shifttime) {
        shiftObj.objshift = planShift;
        shiftArray.push(shiftObj);
      } else if (planShiftStarttime === shifttime && minutes > 0) {
        shiftObj.objshift = planShift;
        shiftObj.timeEnds = true;
        shiftArray.push(shiftObj);
      }
    }
  }


  loadSchedules(): void {

    this.scheduleService.getScheduleDetails(this.planKey).subscribe(data => {
      this.planDetails.staffScheduleList = data;
      setTimeout(()=>this.getDates(),1000);
      this.loadStaffGridDetails(data);
    });

  }

  loadStaffGridDetails(staffScheduleList: StaffSchedule[]): void {
    this.staffGridService.getStaffGridDetails(this.planKey).subscribe(data => {
     for (const staffGridCen of data) {
        for (const staffSchedule of staffScheduleList) {
          for (const staffShift of staffSchedule.planShiftList) {
            if (staffShift.key === staffGridCen.shiftKey) {
              if (!staffShift.staffGridCensuses) {
                staffShift.staffGridCensuses = [];
              }
              staffGridCen.censusValue = Number(this.planDetails.censusRange.occurrenceNumber[staffGridCen.censusIndex - 1]);
              this.orderStaffGridCensusByVarpos(staffGridCen);
              staffShift.staffGridCensuses.push(staffGridCen);
            }
          }
        }

     }
     this.planDetails.staffScheduleList = staffScheduleList;
     this.loadStaffVarianceDetails();

    });
  }

  orderStaffGridCensusByVarpos(objStaffGridCensus: StaffGridCensus): void {
    const staffGridCensusActivities: staffToPatient[] = [];
    this.planDetails.variableDepartmentPositions.forEach(ele => {
      const staffGridCensusActivity = objStaffGridCensus.staffToPatientList.filter(eleStaff =>
        eleStaff.variablePositionKey == ele.categoryKey && eleStaff.variablePositionCategoryDescription == ele.categoryDescription)[0];
      if (staffGridCensusActivity) {
        staffGridCensusActivities.push(staffGridCensusActivity);
      }
    });
    objStaffGridCensus.staffToPatientList = staffGridCensusActivities;
  }

  resetForm(): void {
    const dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', '175px', '550px',
      'Staffing Calculator', 'Do you want to reset form to its original state?');

    document.body.classList.add('pr-modal-open');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.staffVariance = JSON.parse(this.strStaffVariance);
      }
      document.body.classList.remove('pr-modal-open');
    });

  }

  openDialog(): void {
    this.isBackButtonClicked = false;
    if (!this.dataSaved && this.checkIfPlanEdited()) {
      const dialogRef = this.alertBox.openAlertWithSaveAndReturn('exit-dialog', '210px', '600px',
        'Exit Staffing Calculator', '');
      document.body.classList.add('pr-modal-open');
      dialogRef.afterClosed().subscribe(result => {
        document.body.classList.remove('pr-modal-open');
        if (result) {
          window.clearInterval(this.staffManagerService.autoSaveInterval);
          window.clearInterval(this.staffManagerService.autoRedirectInterval);
          window.clearInterval(this.staffManagerService.notifyJobSchedulerInterval);
          // this.removeSessionAttributes();
          if (result === ConfirmWindowOptions.save) {
            this.isUserExiting = true;
            this.saveAndExitStaffingDetails(false);
            this.removeSessionAttributes();
          } else {
            this.router.navigate(['/staff-manager']);
          }
        }
      });
    } else {
      window.clearInterval(this.staffManagerService.autoSaveInterval);
      window.clearInterval(this.staffManagerService.autoRedirectInterval);
      window.clearInterval(this.staffManagerService.notifyJobSchedulerInterval);
      // this.removeSessionAttributes();
      this.router.navigate(['/staff-manager']);
    }
  }

  clear(index: number): void {
    this.staffVariance.staffVarianceSummaries[index].censusValue = null;
  }

  checkDates(day: number): boolean {
    let scheduleExistForPlan = false;
    for (const schedule of this.planDetails.staffScheduleList) {
      if ((schedule.scheduleDays[0] === true && day === 1) ||
        (schedule.scheduleDays[1] === true && day === 2) ||
        (schedule.scheduleDays[2] === true && day === 3) ||
        (schedule.scheduleDays[3] === true && day === 4) ||
        (schedule.scheduleDays[4] === true && day === 5) ||
        (schedule.scheduleDays[5] === true && day === 6) ||
        (schedule.scheduleDays[6] === true && day === 0)) {
        scheduleExistForPlan = true;
      }

}
    return scheduleExistForPlan;
  }

  getDates(): void {
    const mom = moment(this.previousDate).add(1, 'day');
    const mom2 = moment(this.previousDate);
    let newDate = new Date();
    const startDate = moment(this.planDetails.effectiveStartDate).toDate();
    const endDate = moment(this.planDetails.effectiveEndDate).toDate();

    for (let x = 0; x < 7; x++) {
      newDate = mom.subtract(1, 'day').toDate();
      if (startDate <= newDate && endDate >= newDate && this.checkDates(newDate.getDay())) {
        this.dates.push(moment(newDate).format('MM/DD/YYYY'));
      }
    }
    this.dates.sort();
    this.dates.push('---------------');
    for (let x = 0; x < 5; x++) {
      newDate = mom2.add(1, 'day').toDate();
      if (startDate <= newDate && endDate >= newDate && this.checkDates(newDate.getDay())) {
        this.dates.push(moment(newDate).format('MM/DD/YYYY'));
      }
    }
  }


    loadDates(): void {
      let selectedDate: string = moment(this.modelDate).format('YYYY-MM-DD');
      this.staffVariance.recordDateForFuture = moment(new Date()).format('YYYY-MM-DD');
      this.staffVariance.selectedDate = moment(this.modelDate).format('YYYY-MM-DD');
      if(this.staffVariance.selectedDate > this.staffVariance.recordDateForFuture){
        this.futureFlag = true;
      }else if (this.staffVariance.selectedDate <= this.staffVariance.recordDateForFuture){
        this.futureFlag = false;
      }
      // this.staffVariance = new StaffVariance();
      sessionStorage.removeItem('lock');
      if (this.staffManagerService && !this.staffManagerService.planAlreadyInUse) {
        const activePlanKey = sessionStorage.getItem('activePlanKey');
        if (!Util.isNullOrUndefined(activePlanKey)) {
          this.staffManagerService.removePlanKeyFromSessionAttribute(Number(activePlanKey)).toPromise().then(()=>{
            this.setDataForPage(selectedDate);
          }).catch(()=>{
            this.setDataForPage(selectedDate);
          });
        }
      }else{
        this.setDataForPage(selectedDate);
      }
      this.staffmanagerCalculator.getActualHeaderForCalculator();
      this.staffmanagerScoreCard.toggleScoreTextBasedOnDate();
    }
     private setDataForPage(selectedDate): void {
      this.staffManagerService.getStaffVarianceByDepartmentAndPlan(this.planDetails.departmentKey, this.planDetails.key,
        selectedDate).subscribe(data => {
        this.staffVariance = data['data'];
        this.scheduleService.setStaffVarianceData(this.staffVariance);
        setTimeout(() => this.strVarianceDetailsdata = JSON.stringify(this.staffVariance), 1000);
        if (this.staffVariance) {
          this.staffVariance.planAlreadyInUse = false;
          this.staffVariance.disableFlag = false;
        }
        sessionStorage.setItem('lock', 'false');
        this.departmentdisplayval = this.planDetails.departmentCode + '-' + this.planDetails.departmentName;
        this.StaffSummaryDetails();
        this.setShiftTimeRange();
      }, error => {
        this.makeSummaryData();
      });
  }

  setShiftTimeRange() {
    if (this.staffVariance !== null && this.staffVariance !== undefined && this.staffVariance.staffVarianceSummaries !== null
        && this.staffVariance.staffVarianceSummaries !== undefined) {
      for (const staffVarianceSummary of this.staffVariance.staffVarianceSummaries) {
        if (staffVarianceSummary.shiftTime === 3 && staffVarianceSummary.shiftFormat === 'AM') {
          staffVarianceSummary.shiftTimeRange = '03:00 - 07:00';
        } else if (staffVarianceSummary.shiftTime === 7 && staffVarianceSummary.shiftFormat === 'AM') {
          staffVarianceSummary.shiftTimeRange = '07:00 - 11:00';
        } else if (staffVarianceSummary.shiftTime === 11 && staffVarianceSummary.shiftFormat === 'AM') {
          staffVarianceSummary.shiftTimeRange = '11:00 - 15:00';
        } else if (staffVarianceSummary.shiftTime === 3 && staffVarianceSummary.shiftFormat === 'PM') {
          staffVarianceSummary.shiftTimeRange = '15:00 - 19:00';
        } else if (staffVarianceSummary.shiftTime === 7 && staffVarianceSummary.shiftFormat === 'PM') {
          staffVarianceSummary.shiftTimeRange = '19:00 - 23:00';
        } else if (staffVarianceSummary.shiftTime === 11 && staffVarianceSummary.shiftFormat === 'PM') {
          staffVarianceSummary.shiftTimeRange = '23:00 - 03:00';
        } else {
          staffVarianceSummary.shiftTimeRange = '';
        }
      }
    }
  }


  openDialogForDates(): void {
    if (!this.dataSaved && this.checkIfPlanEdited()) {
      const dialogRef = this.alertBox.openAlertWithSaveAndReturn('exit-dialog', '210px', '600px',
        'Exit Staffing Calculator', '');
      document.body.classList.add('pr-modal-open');
      dialogRef.afterClosed().subscribe(result => {
        document.body.classList.remove('pr-modal-open');
        if (result) {
          window.clearInterval(this.staffManagerService.autoSaveInterval);
          window.clearInterval(this.staffManagerService.autoRedirectInterval);
          window.clearInterval(this.staffManagerService.notifyJobSchedulerInterval);
          this.removeSessionAttributes();
          if (result === ConfirmWindowOptions.save) {
            this.isUserExiting = true;
            this.saveAndExitStaffingDetailsForDates();
          }else{
            this.loadDates();
          }
        }else{
          this.modelDate = moment(this.staffVariance.recordDate).format('MM/DD/YYYY');
        }
      });
    } else {
      window.clearInterval(this.staffManagerService.autoSaveInterval);
      window.clearInterval(this.staffManagerService.autoRedirectInterval);
      window.clearInterval(this.staffManagerService.notifyJobSchedulerInterval);
      this.removeSessionAttributes();
      this.loadDates();
    }
  }

  makeSummaryData() {
    this.staffVariance = new StaffVariance();
    setTimeout( () => this.strVarianceDetailsdata = JSON.stringify(this.staffVariance), 1000);
    this.staffVariance.disableFlag = true;
    let shiftTime = 3;
    this.staffVariance.staffVarianceSummaries = [];
    // create 6 default staff summary with timings
    for (let i = 0; i < 6; i++) {
      const staffVarianceSummary: StaffVarianceSummary = new StaffVarianceSummary();
      // Set the shift time
      if (i === 0) {
        staffVarianceSummary.shiftTime = shiftTime;
      } else {
        staffVarianceSummary.shiftTime = shiftTime + 4;
        shiftTime = shiftTime + 4;
      }
      // Set the shift time format
      staffVarianceSummary.shiftFormat = 'AM';
      if (staffVarianceSummary.shiftTime > 12) {
        staffVarianceSummary.shiftTime = shiftTime - 12;
        staffVarianceSummary.shiftFormat = 'PM';
      }
      staffVarianceSummary.defaultShiftKey = i + 1;

      // get active shift for summary
      staffVarianceSummary.plannedShifts = this.getActiveshiftFromPlan(staffVarianceSummary.shiftTime, staffVarianceSummary.shiftFormat);
      staffVarianceSummary.staffVarianceDetails = [];
      for (const varpos of this.planDetails.variableDepartmentPositions) {
        const staffDetail: StaffVarianceDetails = new StaffVarianceDetails();
        staffDetail.variableCategoryKey = varpos.categoryKey;
        staffVarianceSummary.staffVarianceDetails.push(staffDetail);
      }
      this.staffVariance.staffVarianceSummaries.push(staffVarianceSummary);
      this.stffVar.staffVarianceSummaries.push(staffVarianceSummary);
    }
    this.setShiftTimeRange();
    this.strStaffVariance = JSON.stringify(this.staffVariance);
    this.strStfVar = JSON.stringify(this.stffVar);
  }


    private checkForSessionAttributes(): void {
    const locked = sessionStorage.getItem('lock');
    if (Util.isNullOrUndefined(locked)) {
      if (this.staffVariance && this.staffVariance.planAlreadyInUse) {
        if(this.staffManagerService){
          this.staffManagerService.planAlreadyInUse = true;
        }
        let alertMessage: string = 'Plan is currently being edited by ' + this.staffVariance.activeManagerUser;
        this.alertBox.openAlert('exit-dialog', '175px', '450px', 'Cannot update plan at this time', alertMessage);
        document.body.classList.add('pr-modal-open');
        window.clearInterval(this.staffManagerService.autoSaveInterval);
        window.clearInterval(this.staffManagerService.autoRedirectInterval);
        window.clearInterval(this.staffManagerService.notifyJobSchedulerInterval);
        sessionStorage.setItem('lock', 'true');
      } else {
        if(this.staffManagerService){
          this.staffManagerService.planAlreadyInUse = false;
        }
        sessionStorage.setItem('lock', 'false');
      }
    } else {
      if((locked.localeCompare('true')===0)&&this.staffVariance && this.staffVariance.planAlreadyInUse){
        this.staffVariance.planAlreadyInUse = true;
        window.clearInterval(this.staffManagerService.autoSaveInterval);
        window.clearInterval(this.staffManagerService.autoRedirectInterval);
        window.clearInterval(this.staffManagerService.notifyJobSchedulerInterval);
        sessionStorage.setItem('lock', 'true');
        this.alertBox.openAlert('exit-dialog', '175px', '450px', 'Cannot update plan at this time', 'Plan is currently being edited by another user');
        document.body.classList.add('pr-modal-open');
      } else {
        if(this.staffVariance) {
          this.staffVariance.planAlreadyInUse = false;
        }
        sessionStorage.setItem('lock', 'false');
      }
    }
  }

  private removeSessionAttributes(): void {
     sessionStorage.removeItem('lock');
     if (this.staffManagerService && !this.staffManagerService.planAlreadyInUse) {
      const activePlanKey = sessionStorage.getItem('activePlanKey');
      if (!Util.isNullOrUndefined(activePlanKey)) {
        this.staffManagerService.removePlanKeyFromSessionAttribute(Number(activePlanKey)).toPromise();
      }
    }
  }

    private triggerUpdateSession(): void {
        this.staffManagerService.sessionUpdateInterval = setInterval(() => {
            this.updateSession();
        }, 1680000);
    }

    private updateSession(): void {
        if (this.staffManagerService && !this.staffManagerService.planAlreadyInUse) {
            const activePlanKey = sessionStorage.getItem('activePlanKey');
            if (!Util.isNullOrUndefined(activePlanKey)) {
                this.staffManagerService.updateSessionForStaffVariance(Number(activePlanKey)).toPromise();
            }
        }
    }

    private triggerRedirectTimer(): void {
        if (this.staffManagerService && !this.staffManagerService.planAlreadyInUse) {
            this.staffManagerService.autoRedirectInterval = (Number)(setInterval(() => {
                this.redirect();
            }, 1800000));
        }
    }

    private redirect(): void {
            // this.removeSessionAttributes();
            window.clearInterval(this.staffManagerService.autoRedirectInterval);
            window.clearInterval(this.staffManagerService.autoSaveInterval);
            window.clearInterval(this.staffManagerService.notifyJobSchedulerInterval);
            const objDialogRef = this.alertBox.openAlertWithReturnNoConfirm('exit-dialog', '175px', '600px',
                'User Inactivity', 'This page will be redirected due to user inactivity.');
            objDialogRef.afterClosed().subscribe(result => {
                sessionStorage.removeItem('reload');
                document.body.classList.remove('pr-modal-open');
                this.router.navigate(['/staff-manager']);
            });
    }

  private checkTime(): void {
    const timezone = moment().tz('America/New_York');
    const hours = timezone.format('hh');
    const ampm = timezone.format('a');
    const min = timezone.format('mm');
    const sec = timezone.format('ss');

    let  minutes = parseInt((this.timer / 60).toString(),10);
    let seconds = parseInt((this.timer % 60).toString(),10);

    let minStr = minutes < 10 ? "0" + minutes : minutes;
    let secStr = seconds < 10 ? "0" + seconds : seconds;


    if (--this.timer < 0) {
      this.timer = 0;
      this.countdownFlag = false;
    }
    if(!this.countdownFlag&&hours.localeCompare("05") === 0&& min.localeCompare("57")>=0 && ampm.indexOf('am') >= 0){
      window.clearInterval(this.staffManagerService.autoRedirectInterval);
      window.clearInterval(this.staffManagerService.autoSaveInterval);
      this.countdownFlag = true;
      let endTime = moment("05:59:45 am", "hh:mm:ss a");
      let startTime = moment(hours+":"+min+":"+sec+" "+ampm, "hh:mm:ss a")

      let mins = moment.utc(moment(endTime, "HH:mm:ss").diff(moment(startTime, "HH:mm:ss"))).format("mm:ss");
      let countdown = parseInt(mins.split(":")[0],10)*60 +parseInt(mins.split(":")[1],10)
      this.timer = countdown < 0 ? countdown*-1 : countdown;
    }
    if(hours.localeCompare("05") === 0&&min.localeCompare("59")===0 && sec.localeCompare("45")>=0 && ampm.indexOf('am') >= 0){
      this.removeSessionAttributes();
      window.clearInterval(this.staffManagerService.autoRedirectInterval);
      window.clearInterval(this.staffManagerService.autoSaveInterval);
      window.clearInterval(this.staffManagerService.notifyJobSchedulerInterval);
     const dialogRef =  this.alertBox.openAlertWithReturnNoConfirm('exit-dialog', '175px', '600px',
        'Staffing Planner',  'Plans are locked at 6AM ET for the previous day. This plan will be saved and locked');
      dialogRef.afterClosed().subscribe(result => {
        document.body.classList.remove('pr-modal-open');
      });
      this.performSaveAndLogout();
    }
    if(this.countdownFlag){
      if(this.timer===0){
        this.countDownStatus = "The plan you are editing will be saved and you will be logged out in less than a minutes";
      }else{
        this.countDownStatus = "The plan you are editing will be saved and you will be logged out "+minStr + ":" + secStr;
      }
    }
  }

  private performSaveAndLogout(): void {
    // if user made changes to the plan
    this.commentsError = false;
    //this.staffVariance.targetHours = this.staffmanagerScoreCard.targetHours;
    let actualCount = 0;
    let isReloadNeeded = false;
    for (const staffSummary of this.staffVariance.staffVarianceSummaries) {
      if (!isReloadNeeded && Util.isNullOrUndefined(staffSummary.shiftDetailKey)) {
        isReloadNeeded = true;
      }
      actualCount = this.getActualCountAndStaffHours(staffSummary, actualCount);
    }

    if (!Util.isNullOrUndefined(this.staffVariance.comments) && this.staffVariance.comments.length > 500) {
      this.commentsError = true;
    }

    if (!(actualCount === 0  || this.commentsError)) {
      this.staffManagerService.saveStaffVarianceDetails(this.staffVariance).subscribe(result => {
        this.dataSaved = true;
        this.userService.logout().subscribe(() => {
          localStorage.setItem('loginAttribute','logout');
          sessionStorage.removeItem('reload');
          Log.info('User logged out successfully.');
          this.planService.getRedirectUrl().subscribe(data => {
            this.productHelp.logoutUrl = data.logoutUrl;
            this.productHelp.environmentName = data.environmentName;
            this.pageRedirectionService.redirectToExternalPage(this.productHelp.logoutUrl);
          });
        }, error => {
          Log.error('Error logging user out.');
          this.userService.logout().subscribe(() => {
            localStorage.setItem('loginAttribute','logout');
            Log.info('User logged out successfully.');
            this.planService.getRedirectUrl().subscribe(data => {
              this.productHelp.logoutUrl = data.logoutUrl;
              this.productHelp.environmentName = data.environmentName;
              this.pageRedirectionService.redirectToExternalPage(this.productHelp.logoutUrl);
            });
          }, error => {
            Log.error('Error logging user out.');
            this.pageRedirectionService.redirectToLogout();
          }, () => {
          });
        }, () => {
        });
      }, error => {
        this.dataSaved = false;
      });
    }else{
      this.userService.logout().subscribe(() => {
        localStorage.setItem('loginAttribute','logout');
        sessionStorage.removeItem('reload');
        Log.info('User logged out successfully.');
        this.planService.getRedirectUrl().subscribe(data => {
          this.productHelp.logoutUrl = data.logoutUrl;
          this.productHelp.environmentName = data.environmentName;
          this.pageRedirectionService.redirectToExternalPage(this.productHelp.logoutUrl);
        });
      }, error => {
        Log.error('Error logging user out.');
        this.pageRedirectionService.redirectToLogout();
      }, () => {
      });
    }
  }

  canDeactivate(): Observable<boolean> | boolean {
    sessionStorage.removeItem('reload');
    if(this.checkIfPlanEdited()&&this.isBackButtonClicked){
      let dialogRef;
      let moveForward : boolean;
      dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', '175px', '600px',
        'Exit Staffing Calculator', 'You will lose any unsaved data, do you want to continue?');
      // you have access to the component instance

      document.body.classList.add('pr-modal-open');
      this.isBackButtonClicked = false;
      return new Observable<boolean>( observer => {
        dialogRef.afterClosed().subscribe(result=>{
          if (result){
            if(this.alertBox.checkForLandingPage(this.routerTracker.nextUrl,false)) {
              this.removeSessionAttributes();
            }
            observer.next(true);
          }else{
            // history.pushState(null, '', '');
            observer.next(false);
          }
        });
      });
      // return confirm('Are you sure you want to leave Hello ?');
    } else {
      if(this.alertBox.checkForLandingPage(this.routerTracker.nextUrl,false)) {
        this.removeSessionAttributes();
      }
      return true;
    }
  }
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.isBackButtonClicked = true;
  }

  private getExcludeEducationOrientationFlag() {
    let systemOptionValue;
    if((this.alertBox.isNullOrUndefined(sessionStorage.getItem('wHpUExcludeEOFlag'))) || ((this.alertBox.isNullOrUndefined(sessionStorage.getItem('wHpUExcludeEOFKey'))) || sessionStorage.getItem('wHpUExcludeEOFKey') !== JSON.stringify(this.planDetails.facilityKey))){
      if (this.planDetails.effectiveStartDate !== null && this.planDetails.effectiveStartDate !== undefined) {
        this.planService.getSystemOptionValuesFromDTM(this.planDetails.facilityKey, moment(new Date(this.planDetails.effectiveStartDate)).format('YYYY-MM-DD')).subscribe(data => {
          if (data['data'] === 2) {
            this.staffmanagerCalculator.excludeEducationOrientationFlag = true;
            systemOptionValue = 'Exclude E&O';
          } else {
            if (data['data'] === 1) {
              systemOptionValue = 'Paid';
            } else {
              systemOptionValue = 'Worked';
            }
            this.staffmanagerCalculator.excludeEducationOrientationFlag = false;
          }
          sessionStorage.setItem('wHpUExcludeEOFlag', JSON.stringify(this.staffmanagerCalculator.excludeEducationOrientationFlag));
          sessionStorage.setItem('wHpUExcludeEOFKey', JSON.stringify(this.planDetails.facilityKey));
          sessionStorage.setItem('systemOptionValue', systemOptionValue);
        });
      }
    }
  }

  saveStaffingDetails() {
    this.isSaveButtonClicked = true;
    this.saveAndExitStaffingDetails(false);
  }

  success() {
    this._snackbar.open("Staffing Calculator form saved successfully.", "close", {
      duration: 10000
    });
  }
}
