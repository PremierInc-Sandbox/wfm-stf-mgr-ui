import {Component, HostListener, NgModule, OnInit, ViewChild} from '@angular/core';
import {NonVariablePosComponent} from '../components/non-variable-pos/non-variable-pos.component';
import {VariablePosComponent} from '../components/variable-pos/variable-pos.component';
import {ActivatedRoute, Router} from '@angular/router';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import {PlanModalComponent} from '../components/plan-modal/plan-modal.component';
import {PlanDetails, ConfirmWindowOptions} from '../../../shared/domain/plan-details';
import {PlanService} from '../../../shared/service/plan-service';
import {TargetProductivityRangeComponent} from '../components/target-productivity-range/target-productivity-range.component';
import {EntityService} from '../../../shared/service/entity-service';
import {DepartmentService} from '../../../shared/service/department-service';
import {VariableDepartmentPosition, CustomError} from '../../../shared/domain/var-pos';
import {NonVariableDepartmentPosition} from '../../../shared/domain/non-var-postn';
import {CensusRange} from '../../../shared/domain/census-range';
import {SavePlanParams} from '../../../shared/domain/save-plan-params';
import {OAService} from '../../../shared/service/oa-service';
import {OAPlanData} from '../../../shared/domain/OAPlanData';
import {OASuggestedData} from '../../../shared/domain/OASuggestedData';
import * as moment from 'moment';

import {AlertBox} from '../../../shared/domain/alert-box';
import {ScheduleService} from '../../../shared/service/schedule-service';
import {Location, PlatformLocation} from '@angular/common';
// import { template } from '@angular/core/src/render3';
import {Observable} from 'rxjs';
import {DeactivationGuarded} from '../../../shared/guard/can-deactivate-guard.service';
import {RouterHistoryTrackerService} from '../../../shared/service/router-history-tracker.service';
import {FormControl} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import {EntityDetails} from '../../../shared/domain/EntityDetails';
import {DeptDetails, Permissions} from '../../../shared/domain/DeptDetails';
import { UserAccess } from 'src/app/shared/domain/userAccess';
import { corpDetailsData } from 'src/app/shared/service/fixtures/corp-details-data';
import {StaffGridCalculator} from '../../../shared/domain/staff-grid-calculator';
import {shift, StaffGridCensus, StaffSchedule, staffToPatient} from '../../../shared/domain/staff-schedule';
import {StaffGridService} from '../../../shared/service/Staffgrid-service';
import {UserService} from '../../../shared/service/user.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Util} from "../../../shared/util/util";

export interface Department {
  key: string;
  name: string;
  code: string;
  active_plan: PlanDetails;
}

export interface Corporation {
  id: string;
  code: string;
  name: string;
}


export interface Entity {
  code: string;
  name: string;
  corporationId: string;
  id: string;
}

NgModule({
  imports: [MatNativeDateModule, MatDatepickerModule, MatDatepicker]
});
@Component({
  selector: 'app-plan-setup',
  templateUrl: './plan-setup.component.html',
  styleUrls: ['./plan-setup.component.scss']
})
export class PlanSetupComponent implements OnInit, DeactivationGuarded {

  myControlEnt = new FormControl();
  myControlDept = new FormControl();
  entityModel: string;
  deptModel: string;
  entitySearch: Observable<EntityDetails[]>;
  deptSearch: Observable<Department[]>;
  isDaily: boolean = true;
  utilizedAverageVolumeAnnual: number;

  @ViewChild(NonVariablePosComponent)
  nonVariablePos: NonVariablePosComponent;

  @ViewChild(VariablePosComponent)
  variablePos: VariablePosComponent;

  @ViewChild(TargetProductivityRangeComponent) target: TargetProductivityRangeComponent;

  activeStatusValue = 'No';

  departments: Department[] = [];

  entities: Entity[] = [];
  listfacKeysInDept: string[] = [];
  currentEntity: Entity = null;
  currentDepartment: Department = null;
  oAPlanDataEntity = new OAPlanData();
  oASuggestedData = new OASuggestedData();
  cmin = 0;
  cmax = 0;
  staffGridCalculator: StaffGridCalculator = new StaffGridCalculator();
  tabSelected = [false, true, true, true];
  previousIndex = 0;
  @ViewChild('pageGroup') pageGroup;
  range: number;

  error: CustomError = new CustomError();
  showMsg = false;
  plan: PlanDetails;
  showError = false;
  plansData: PlanDetails[];
  plansName: string[];
  planKey: string;
  isSaveExitBtnSubmit = false;
  isSaveNextBtnSubmit = false;
  isSaveBtn = false;
  objSavePlanParams: SavePlanParams = new SavePlanParams();
  deptListKeys: Array<number> = [];
  showOccurance: boolean;
  showVariable: boolean;
  systemFlag = true;
  systemOptionValue: string;
  totalCensus = 0;
  effectiveStartDate: string;
  effectiveEndDate: string;
  btnNexttxt: string;
  btnExittxt: string;
  targetBudgetFlag: boolean;
  errorDateFlag: boolean;
  patternPlanAverageVolumne: boolean;
  patternTargetbudget: boolean;
  alertBox: AlertBox;
  @ViewChild('census') censusData;
  // censusData: CensusComponent;
  screenLoadFlag = true;
  endDate: string;

  strplanDetails = '';
  isBackButtonClicked = false;
  entDetailsCodeList: Array<string> = [];
  deptDetailsCodeList: Array<string> = [];
  minEffStartDate: Date;
  minEffEndDate: Date;
  maxEffStartDate: Date;

  userAccess:UserAccess;
  minCensusSaved = 0;
  maxCensusSaved = 0;
  cenRange: number[];
  staffSchedules: StaffSchedule[];

  @HostListener('document:click', ['$event'])
  clickedOutside($event) {
    if ($event.target['id'] !== 'crossEnt' && $event.target['id'] !== 'textboxEnt' && $event.target['id'] !== 'dropEnt' ) {
      this.entityModel = sessionStorage.getItem('entName');
    }else if ($event.target['id'] === 'crossEnt' || $event.target['id'] === 'textboxEnt' || $event.target['id'] === 'dropEnt' ) {
      this.entityModel = '';
    }

    if ($event.target['id'] !== 'crossDept' && $event.target['id'] !== 'textboxDept' && $event.target['id'] !== 'dropDept' ) {
      this.deptModel = this.getDepartmentVal();
    }else if ($event.target['id'] === 'crossDept' || $event.target['id'] === 'textboxDept' || $event.target['id'] === 'dropDept' ) {
      this.deptModel = '';
    }
  }

  constructor(
    private router: Router,
    private planService: PlanService,
    private dialog: MatDialog,
    private entityService: EntityService,
    private oaService: OAService,
    private departmentService: DepartmentService,
    private route: ActivatedRoute,
    private scheduleServiceScheduleService: ScheduleService,
    private platformLocation: PlatformLocation,
    private staffGridService: StaffGridService,
    private routerTracker: RouterHistoryTrackerService,
    private _snackbar: MatSnackBar
  ) {
    this.alertBox = new AlertBox(this.dialog);
    this.plan = new PlanDetails();
    this.plan.userKey = 12345;
    this.minEffStartDate = new Date();
    let endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);
    this.minEffEndDate = endDate;

    if (this.plan.lowerEndTarget === undefined && this.plan.upperEndTarget === undefined) {
      this.plan.lowerEndTarget = 100;
      this.plan.upperEndTarget = 120;
    }
    if (this.plan.action === 'Active') {
      this.activeStatusValue = 'Yes';

    }
    this.targetBudgetFlag = false;
    this.patternPlanAverageVolumne = false;
    this.patternTargetbudget = false;
  }

  testLowerBound(event: any): void {
    this.plan.lowerEndTarget = event;
  }

  testUpperBound(event: any): void {
    this.plan.upperEndTarget = event;
  }

  getCensusMin(event: number): void {
    this.plan.censusRange.minimumCensus = event;
    this.checkCensusRange();
  }

  getCensusMax(event: number): void {
    this.plan.censusRange.maximumCensus = event;
    this.checkCensusRange();
  }
  applyMinValue(event: number): void {
    this.cmin = event;
  }
  applyMaxValue(event: number): void {
    this.cmax = event;
  }

  getOccurance(event: any): void {
    this.plan.censusRange.occurrenceNumber = event;
  }

  // display modal window page
  openModal(): void {
    document.body.classList.add('pr-modal-open');
    const dialogs = this.dialog.open(PlanModalComponent, {});
    dialogs.afterClosed().subscribe(res => {
      document.body.classList.remove('pr-modal-open');
    });
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1.id === o2.id && o1.name === o2.name;
  }

  compareEntityObjects(o1: any, o2: any): boolean {
    return o1 === o2;
  }

  compareDepartmentObjects(o1: any, o2: any): boolean {
    return o1 === o2;
  }
  checkIfPlanEdited(): boolean {
    if (!this.censusData.isApplyButtonClicked) {
      this.plan.censusRange.minimumCensus = this.censusData.previousCensusMin;
      this.plan.censusRange.maximumCensus = this.censusData.previousCensusMax;
    }
    const tempStrPlanDetails = this.getPlanStringForComparison(this.plan);
    const templan: PlanDetails = JSON.parse(tempStrPlanDetails);
    const strplan: PlanDetails = JSON.parse(this.strplanDetails);
    if (this.strplanDetails === tempStrPlanDetails || Util.isNullOrUndefined(this.strplanDetails) || this.strplanDetails === '') {
    return false;
    } else {
    return true;
    }
  }
  getPlanStringForComparison( plan: PlanDetails): string {
    const tempStrPlanDetails = JSON.stringify(plan);
    const templan: PlanDetails = JSON.parse(tempStrPlanDetails);
    templan.oAStaffingMetric = null;

    templan.secondaryWHpU = 0;
    templan.fte = 0;
    templan.primaryWHpU = 0;
    templan.educationOrientationTargetPaid = 0;
    templan.annualizedCurrentAvg = 0;
    templan.annualizedBudgetedAvg = 0;
    templan.targetBudget = parseInt(this.plan.targetBudget);
    templan.budgetAverageVolume = 0;
    templan.currentAverageVolume = 0;
    templan.temporaryEffectiveEndDate = null;
    templan.temporaryEffectiveStartDate = null;
    templan.staffScheduleList = null;
    templan.staffingSummaryData = null;
    templan.totalAnnualHours = 0;
    templan.totalAnnualVolume = 0;




    return JSON.stringify(templan);
  }
  openDialog(): void {
    this.isBackButtonClicked = false;
    if (this.checkIfPlanEdited()) {
      const dialogRef = this.alertBox.openAlertWithSaveAndReturn('exit-dialog', '210px', '600px',
        'Exit Staffing Plan Setup', '');
      document.body.classList.add('pr-modal-open');
      dialogRef.afterClosed().subscribe(result => {
        document.body.classList.remove('pr-modal-open');
        if (result) {
          if (result === ConfirmWindowOptions.save) {
            if (this.mandatoryCheckSNFailed(true)) {
              // flags to enable error messages
              this.objSavePlanParams.isCensusApplied = true;
              this.objSavePlanParams.isSaveNextBtnSubmitForCensus = true;
              this.isSaveNextBtnSubmit = true;
              this.plan.censusRange.minimumCensus = this.cmin;
              this.plan.censusRange.maximumCensus = this.cmax;
              const dialogRef = this.alertBox.openAlertOnSaveConfirm('exit-dialog', '190px', '600px',
                'Save Staffing Plan Setup', '');
            } else {
              this.plan.censusRange.minimumCensus = this.cmin;
              this.plan.censusRange.maximumCensus = this.cmax;
              this.saveAndNextPlanDetails();
              localStorage.setItem('Corpid', '');
              localStorage.setItem('Departmentid', '');
              localStorage.setItem('Enitityid', '');
             // this.removeSessionAttributes();
              this.router.navigate(['/home']);
            }
          } else {
            localStorage.setItem('Corpid', '');
            localStorage.setItem('Departmentid', '');
            localStorage.setItem('Enitityid', '');
           // this.removeSessionAttributes();
            this.router.navigate(['/home']);
          }
        }
        document.body.classList.remove('pr-modal-open');
      });
    } else {
      localStorage.setItem('Corpid', '');
      localStorage.setItem('Departmentid', '');
      localStorage.setItem('Enitityid', '');
     // this.removeSessionAttributes();
      this.router.navigate(['/home']);
    }
  }

  planUtilizeCalCulation(){
    let currentCalendarYearTotalDays = this.staffGridCalculator.getCurrentCalendarYearTotalDays(this.plan.effectiveEndDate);
    if(!this.isDaily){
      if(!this.plan.utilizedAverageVolumeBase) return false;
      this.utilizedAverageVolumeAnnual = Number((this.plan.utilizedAverageVolumeBase * currentCalendarYearTotalDays).toFixed(4));
    }
    else{
      if(!this.utilizedAverageVolumeAnnual) return false;
      let dailyVolumeString = String(this.utilizedAverageVolumeAnnual / currentCalendarYearTotalDays);
      this.plan.utilizedAverageVolumeBase =  this.utilizedAverageVolumeAnnual / currentCalendarYearTotalDays;
      this.plan.utilizedAverageVolume = (dailyVolumeString.indexOf('.') > 0) ? Number(dailyVolumeString.slice(0, dailyVolumeString.indexOf('.') + 5)) : this.plan.utilizedAverageVolumeBase;
    }
  }

  updatePlanUtilizedAvgVolumeBase(utilizedAverageVolume){
    let currentCalendarYearTotalDays = this.staffGridCalculator.getCurrentCalendarYearTotalDays(this.plan.effectiveEndDate);
    this.plan.utilizedAverageVolumeBase = utilizedAverageVolume;
    if(!this.plan.utilizedAverageVolumeBase) return false;
    this.utilizedAverageVolumeAnnual = Number((this.plan.utilizedAverageVolumeBase * currentCalendarYearTotalDays).toFixed(4));
  }

  updatePlanUtilizedAvgVolumeAnnual(utilizedAverageVolumeAnnual){
    let currentCalendarYearTotalDays = this.staffGridCalculator.getCurrentCalendarYearTotalDays(this.plan.effectiveEndDate);
    let dailyVolumeString = String(utilizedAverageVolumeAnnual / currentCalendarYearTotalDays);
    this.plan.utilizedAverageVolumeBase = utilizedAverageVolumeAnnual / currentCalendarYearTotalDays;
    this.plan.utilizedAverageVolume = (dailyVolumeString.indexOf('.') > 0) ? Number(dailyVolumeString.slice(0, dailyVolumeString.indexOf('.') + 5)) : this.plan.utilizedAverageVolumeBase;
  }

  planUtilizeConvertion(type: string, isPlanCompleted){
    if(isPlanCompleted){
      return false;
    }
    else{
      this.isDaily = (type === 'daily' );
      this.planUtilizeCalCulation();
    }
  }

  formatEffectiveDates(): void {
    this.plan.temporaryEffectiveStartDate = moment(this.plan.effectiveStartDate).format('YYYY-MM-DD');
    this.plan.temporaryEffectiveEndDate = moment(this.plan.effectiveEndDate).format('YYYY-MM-DD');
  }
  censusValidation(): void {
    if ((this.plan.censusRange.maximumCensus === 0 || this.plan.censusRange.minimumCensus === 0 ||
      !this.plan.censusRange.maximumCensus || !this.plan.censusRange.minimumCensus)
      && (this.cmin === 0 || this.cmax === 0 || !this.cmin || !this.cmax)) {
      const errorIndex: number = this.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values for the Census Range. All values must be greater than zero.');
      if (errorIndex < 0) {
        this.objSavePlanParams.saveNextErrorMessages.push('Enter minimum and maximum values for the Census Range. All values must be greater than zero.');
      }
    } else {
      const errorminmaxIndex: number = this.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values for the Census Range. All values must be greater than zero.');
      if (errorminmaxIndex !== -1) {
        this.objSavePlanParams.saveNextErrorMessages.splice(errorminmaxIndex, 1);
      }
    }
  }

  onSubmit(buttonType): void {
    this.isSaveBtn = false;
    this.censusValidation();
    this.checkCensusRange();
    this.formatEffectiveDates();
    this.isBackButtonClicked = false;
    if (buttonType === 'Save-Exit') {
      this.plan.censusRange.minimumCensus = this.cmin;
      this.plan.censusRange.maximumCensus = this.cmax;
      if (this.plan.planCompleted) {
        sessionStorage.removeItem('lock');
        this.router.navigate(['/home']);
        return;
      }
      if (this.plan.totalAnnualHours) {
        if (this.plan.totalAnnualHours > 0) {
          const alertMessage = 'Changes made to the Plan will be reflected in the Staffing Grid when you complete the workflow. ' + '\n' +
            'Click Confirm to Exit, Cancel to remain in the Plan and complete the workflow';
          const dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', '190px', '600px',
            'Staff Planner', alertMessage);
          document.body.classList.add('pr-modal-open');
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.isSaveExitBtnSubmit = true;
              if (this.plan.targetBudget === '' || Util.isNullOrUndefined(this.plan.censusRange.minimumCensus) ||
                Util.isNullOrUndefined(this.plan.censusRange.maximumCensus) || this.mandatoryCheckSEFailed() ||
              this.plan.utilizedAverageVolume >= this.plan.censusRange.maximumCensus ||
                this.plan.utilizedAverageVolume <= this.plan.censusRange.minimumCensus) {
                this.openModal();
              } else {
                this.isSaveExitBtnSubmit = true;
                this.saveAndExitPlanDetails();
              }
            }
            document.body.classList.remove('pr-modal-open');
          });
        }
      } else {
        this.isSaveExitBtnSubmit = true;
        let planUtilizedAverageVolume;
        if(!this.isDaily){
          const currentCalendarYearTotalDays = this.staffGridCalculator.getCurrentCalendarYearTotalDays(this.plan.effectiveEndDate);
          planUtilizedAverageVolume = this.utilizedAverageVolumeAnnual / currentCalendarYearTotalDays;
        }
        else{
          planUtilizedAverageVolume = this.plan.utilizedAverageVolume;
        }
        if (this.plan.targetBudget === '' || Util.isNullOrUndefined(this.plan.censusRange.minimumCensus) ||
          Util.isNullOrUndefined(this.plan.censusRange.maximumCensus) || this.mandatoryCheckSEFailed() ||
          planUtilizedAverageVolume >= this.plan.censusRange.maximumCensus ||
          planUtilizedAverageVolume <= this.plan.censusRange.minimumCensus) {
          this.openModal();
        } else {
          this.isSaveExitBtnSubmit = true;
          this.saveAndExitPlanDetails();
        }
      }
    } else if (buttonType === 'Save-Next') {
        this.plan.censusRange.minimumCensus = this.cmin;
        this.plan.censusRange.maximumCensus = this.cmax;

        if (this.plan.planCompleted) {
          localStorage.setItem('plankey', this.plan.key);
          sessionStorage.setItem('plankey', this.plan.key);
          this.loadOtherPages();
          return;
        }
        this.isSaveNextBtnSubmit = true;
        this.objSavePlanParams.isSaveNextBtnSubmitForCensus = true;

        if (this.mandatoryCheckSNFailed(true) === true) {
        this.pageGroup.selectedIndex = this.previousIndex;
        this.openModal();
      } else {
        this.objSavePlanParams.isSaveNextBtnSubmitForCensus = true;
        this.isSaveNextBtnSubmit = true;
        this.saveAndNextPlanDetails();
      }
    } else if (buttonType === 'Save') {
      this.plan.censusRange.minimumCensus = this.cmin;
      this.plan.censusRange.maximumCensus = this.cmax;

      if (this.plan.planCompleted) {
        localStorage.setItem('plankey', this.plan.key);
        sessionStorage.setItem('plankey', this.plan.key);
        this.loadOtherPages();
        return;
      }
      this.isSaveNextBtnSubmit = true;
      this.isSaveBtn = true;
      this.objSavePlanParams.isSaveNextBtnSubmitForCensus = true;

      if (this.mandatoryCheckSNFailed(false) === true) {
        this.pageGroup.selectedIndex = this.previousIndex;
        this.openModal();
      } else if (!this.isVariablePostnEmpty() && !this.isVariablePostDescriptionUnique()) {
        this.openModal();
      } else {
        this.objSavePlanParams.isSaveNextBtnSubmitForCensus = true;
        this.isSaveNextBtnSubmit = true;
        this.savePlanDetails();
      }

    }
  }

  numberOnly(event): boolean {
    if (Util.isNullOrUndefined(event)) {
      return false;
    } else {
      const charCode = (event.which) ? event.which : event.keyCode;
      if (charCode !== 46 && charCode > 31
        && (charCode < 48 || charCode > 57)) {
        return false;
      }
      return true;
    }
  }

  numberAndDecimalOnly(event): boolean {
    if (Util.isNullOrUndefined(event)) {
      return false;
    } else {
      const charCode = (event.which) ? event.which : event.keyCode;
      if (charCode > 31 && (charCode < 48 && charCode !== 46 || charCode > 57)) {
        return false;
      }
      const targetBudget = this.plan.targetBudget;
      if (targetBudget) {
        if (targetBudget.toString().indexOf('.') >= 0 && targetBudget.toString().indexOf('.') < 4) {
          const index = targetBudget.toString().indexOf('.') + 4;
          if (targetBudget.toString().charAt(index) !== '') {
            this.plan.targetBudget = parseFloat(targetBudget.toString().substring(0, index) + targetBudget.toString().charAt(index));
            return false;
          }
        }
        if (targetBudget.toString().charAt(4) === ('.')) {
          this.plan.targetBudget = parseFloat(targetBudget.toString().substring(0, 4));
          return false;
        }
      }
    }
  }

  updateDataFromOA(editAction: boolean): void {
    // if(this.plan.effectiveStartDate){
    //   let endDate = new Date(this.plan.effectiveStartDate);
    //   endDate.setDate(endDate.getDate() + 1);
    //   this.minEffEndDate = endDate;
    // }
    this.invokeAndLoadDtmOAData(editAction);
  }
  updateDataFromOAOnChange(editAction: boolean, event): void {
    this.plan.departmentKey = event.option.id;
    sessionStorage.setItem('departmentId',this.plan.departmentKey);
    sessionStorage.setItem('departmentName',this.deptModel);
    this.invokeAndLoadDtmOAData(editAction);
  }

  invokeAndLoadDtmOAData(editAction: boolean) {
    if (this.plan.effectiveStartDate != null && this.numberOnlyForDate(event) && this.isValidDateRange(this.plan.effectiveStartDate)) {
      if((this.alertBox.isNullOrUndefined(sessionStorage.getItem('wHpUExcludeEOFlag'))) || ((this.alertBox.isNullOrUndefined(sessionStorage.getItem('wHpUExcludeEOFKey'))) || sessionStorage.getItem('wHpUExcludeEOFKey') !== JSON.stringify(this.plan.facilityKey))){
        this.planService.getSystemOptionValuesFromDTM(this.plan.facilityKey, moment(new Date(this.plan.effectiveStartDate)).format('YYYY-MM-DD')).subscribe(data => {
          if (data['data'] === 2) {
            this.systemFlag = true;
            this.systemOptionValue = 'Exclude E&O';
          } else {
            if (data['data'] === 1) {
              this.systemOptionValue = 'Paid';
            } else {
              this.systemOptionValue = 'Worked';
            }
            this.systemFlag = false;
          }
          sessionStorage.setItem('wHpUExcludeEOFlag', JSON.stringify(this.systemFlag));
          sessionStorage.setItem('wHpUExcludeEOFKey', JSON.stringify(this.plan.facilityKey));
          sessionStorage.setItem('systemOptionValue', this.systemOptionValue);
        });
      }
      this.systemOptionValue = sessionStorage.getItem('systemOptionValue');
      this.loadOAData(editAction);
    }
  }

  loadOAData(editAction: boolean) {
    this.loadOAPlanDataEntity();
    this.getSuggestedData(editAction);
  }

  isValidDateRange(editedValue: any): boolean {
    const selectedDate = new Date(this.plan.effectiveStartDate);
    if (new Date(this.plan.effectiveStartDate).getFullYear() > 2015) {
      return true;
    } else {
      return false;
    }
  }

  loadAllPlans(): void {

    this.planService.getAllPlansName(this.planKey).subscribe(data => {
          this.plansName = data;
    });

  }

  mandatoryCheckSEFailed(): boolean {
    const planNameExpression = new RegExp('^[a-zA-Z0-9]+[\\sa-zA-Z0-9]*$');
    const actvPlnStrtDt = moment(this.plan.effectiveStartDate, 'YYYY-MM-DD');
    const actvPlnEndtDt = moment(this.plan.effectiveEndDate, 'YYYY-MM-DD');

    if (actvPlnEndtDt < actvPlnStrtDt) {
      this.errorDateFlag = true;
    } else {
      this.errorDateFlag = false;
    }
    let indexOf;
    this.patternPlanAverageVolumne = true;
    const targetBudget = this.plan.targetBudget.toString();
    indexOf = targetBudget.lastIndexOf('.');
    let targetbudgetFlag = false;
    if (indexOf > 0 && targetBudget.substr(indexOf, targetBudget.length).length > 2) {
      targetbudgetFlag = false;
      this.patternTargetbudget = true;
    } else {
      this.patternTargetbudget = false;
    }

    if (targetbudgetFlag || (this.plan.name === null || this.plan.name === undefined) || this.plan.name === '' ||
      (planNameExpression.test(this.plan.name) === false) || (this.showError === true) || this.isVariablePostnEmpty() || !this.isVariablePostDescriptionUnique() ||
      ((this.plan.effectiveStartDate === null ||
        this.plan.effectiveStartDate === undefined) ||
        (this.plan.effectiveEndDate === null ||
          this.plan.effectiveEndDate === undefined) ||
        (actvPlnEndtDt < actvPlnStrtDt))) {

      return true;
    } else {

      return false;
    }
  }

  mandatoryCheckSNFailed(saveFlag: boolean): boolean {
    const actvPlnStrtDt = moment(this.plan.effectiveStartDate, 'YYYY-MM-DD');
    const actvPlnEndtDt = moment(this.plan.effectiveEndDate, 'YYYY-MM-DD');
    const planNameExpression = new RegExp('^[a-zA-Z0-9]+[\\sa-zA-Z0-9]*$');

    if (actvPlnEndtDt < actvPlnStrtDt) {
      this.errorDateFlag = true;
    } else {
      this.errorDateFlag = false;
    }
    // let isCensusValid = false;
    // isCensusValid = this.isOccuranceValueEmpty();
    const averageVolume = Util.isNullOrUndefined(this.plan.utilizedAverageVolume) ? '' : this.plan.utilizedAverageVolume.toString();
    const annualAverageVolume = Util.isNullOrUndefined(this.utilizedAverageVolumeAnnual) ? '' : this.utilizedAverageVolumeAnnual.toString();
    let indexOf = averageVolume.lastIndexOf('.');
    let annualIndexOf = annualAverageVolume.lastIndexOf('.');
    let planUtilizedAvgVolFlag = false;
    if ((indexOf > 0 && averageVolume.substr(indexOf, averageVolume.length).length > 2) || (annualIndexOf > 0 && annualAverageVolume.substr(indexOf, annualAverageVolume.length).length > 2)) {
      planUtilizedAvgVolFlag = false;
      this.patternPlanAverageVolumne = true;
    } else {
      if(this.plan.utilizedAverageVolume < 1){
        this.patternPlanAverageVolumne = false;
      }
      else{
        this.patternPlanAverageVolumne = true;
      }
    }

    const targetBudget = Util.isNullOrUndefined(this.plan.targetBudget) ? '' : this.plan.targetBudget.toString();
    indexOf = targetBudget.lastIndexOf('.');
    const targetbudgetFlag = false;
    if (indexOf > 0 && targetBudget.substr(indexOf, targetBudget.length).length > 2) {
      this.patternTargetbudget = true;
    } else {
      this.patternTargetbudget = false;
    }


    if (
      (saveFlag && planUtilizedAvgVolFlag || (planNameExpression.test(this.plan.name) === false) || this.plan.name === '' ||
        this.plan.name === undefined || this.showError === true || saveFlag && this.plan.utilizedAverageVolume === null ||
        saveFlag && this.plan.utilizedAverageVolume === undefined || saveFlag && this.utilizedAverageVolumeAnnual === null || saveFlag && this.utilizedAverageVolumeAnnual === undefined) ||
      ( saveFlag && this.plan.targetBudget === null || saveFlag && this.plan.targetBudget === undefined ||
        saveFlag && this.plan.targetBudget === '' || saveFlag && this.plan.targetBudget <= 0) ||
      (saveFlag && this.isVariablePostnEmpty()) || Util.isNullOrUndefined(this.plan.censusRange.minimumCensus) || saveFlag &&  !this.isVariablePostDescriptionUnique() ||
      Util.isNullOrUndefined(this.plan.censusRange.maximumCensus) || !saveFlag && this.censusMinMaxValidation() ||
      ((this.plan.effectiveStartDate === null || this.plan.effectiveStartDate === undefined) ||
        (this.plan.effectiveEndDate === null ||
          this.plan.effectiveEndDate === undefined) ||
        (actvPlnEndtDt < actvPlnStrtDt))
      || saveFlag &&  this.chekForCensusError()) {
      return true;
    } else {
      return false;
    }
  }

  chekForCensusError(): boolean {
    if (this.objSavePlanParams.saveNextErrorMessages.length > 0 || this.objSavePlanParams.validationErrorMessages.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  isOccuranceValueEmpty(): boolean {
    if (this.plan.censusRange.minimumCensus > 0 && this.plan.censusRange.maximumCensus > 0) {
      for (let i = this.plan.censusRange.minimumCensus - 1; i <= this.plan.censusRange.maximumCensus - 1; i++) {
        if (this.plan.censusRange.occurrenceNumber[i] === '' || this.plan.censusRange.occurrenceNumber[i] === null ||
          this.plan.censusRange.occurrenceNumber[i] === undefined) {
          this.showOccurance = true;
          return true;
        }
      }
      if (!this.plan.censusRange.occurrenceNumber || this.plan.censusRange.occurrenceNumber.length < 1) {
        this.showOccurance = true;
        return true;
      }
    }
    return false;
  }

  isVariablePostnEmpty(): boolean {
    this.showVariable = false;
    if (this.plan.variableDepartmentPositions.length === 1) {
      const staff = this.plan.variableDepartmentPositions[0];
      if (staff.categoryAbbreviation === '' || staff.categoryAbbreviation === null || staff.categoryAbbreviation === undefined) {
        this.showVariable = true;
      }
    }
    if (this.showVariable) {
      return true;
    } else {
      return false;
    }
  }
  isVariablePostDescriptionUnique(){
    let isVariablePostDescriptionUnique=true;
    let variableDepartmentPositions: VariableDepartmentPosition[]=[];
    this.plan.variableDepartmentPositions.forEach(element => {
      if(element.categoryKey){
        let elementKey = this.plan.variableDepartmentPositions.filter(ele => ele.categoryKey === element.categoryKey && ele.categoryDescription.toUpperCase() === element.categoryDescription.toUpperCase()).length > 1;
        if(elementKey){
          isVariablePostDescriptionUnique=false;
        }
      }
      else{
        variableDepartmentPositions.push(element);
      }
    });

    variableDepartmentPositions.forEach( element=>{
      let index=this.plan.variableDepartmentPositions.indexOf(element);
      this.plan.variableDepartmentPositions.splice(index,1);
    });
    return isVariablePostDescriptionUnique;
  }

  saveAvgVolAndName(){
    if((this.plan.utilizedAverageVolume !== this.plan.utilizedAverageVolumeBase) && (this.plan.utilizedAverageVolumeBase !== undefined && this.plan.utilizedAverageVolumeBase !== null)){
      this.plan.utilizedAverageVolume = this.plan.utilizedAverageVolumeBase;
    }
    if(!this.isDaily)
      this.plan.utilizedAverageVolume =this.utilizedAverageVolumeAnnual;

    if (!Util.isNullOrUndefined(this.plan.name)) {
      this.plan.name = this.plan.name.trim();
      this.plan.dailyFlag=this.isDaily;
    }
  }
  sortData(a, b): 0 | 1 | -1 {
    return (a.censusIndex > b.censusIndex) ? 1 :
      (a.censusIndex < b.censusIndex) ? -1 : 0;
  }
  checkIfCensusangeIncreased(objshift: shift): boolean {
    const censusData = this.alertBox.checkIfCensusangeIncreased(objshift, this.plan);
    const isCensusangeIncreased = Boolean(censusData.pop());
    this.maxCensusSaved = Number(censusData.pop());
    this.minCensusSaved = Number(censusData.pop());
    return isCensusangeIncreased;
  }
  saveTotalAnnualHrsVariance(): void {
    for (const staffSchedule of this.plan.staffScheduleList) {
      for (const shift of staffSchedule.planShiftList) {
        shift.staffGridCensuses.sort(this.sortData);
        if (this.checkIfCensusangeIncreased(shift)) {
          // add newly added census rows to existing saved census rows ///census range changed by increasing the max
          this.maxCensusSaved++;
          while (this.maxCensusSaved <= this.plan.censusRange.maximumCensus) {
            const cen = this.maxCensusSaved;
            const objstaffGridCensus = new StaffGridCensus();
            objstaffGridCensus.censusIndex = cen;
            objstaffGridCensus.censusValue = Number(this.plan.censusRange.occurrenceNumber[cen - 1]);

            for (const objstaffToPatient of shift.staffToPatientList) {
              let stpval = 1;
              const objnewStaffToPatient: staffToPatient = new staffToPatient();
              objnewStaffToPatient.variablePositionCategoryAbbreviation = objstaffToPatient.variablePositionCategoryAbbreviation;
              objnewStaffToPatient.variablePositionCategoryDescription = objstaffToPatient.variablePositionCategoryDescription;
              objnewStaffToPatient.variablePositionKey = objstaffToPatient.variablePositionKey;
              if (objstaffToPatient.staffCount > 0) {
                if (cen > objstaffToPatient.staffCount) {
                  if (cen % objstaffToPatient.staffCount === 0) {
                    stpval = cen / objstaffToPatient.staffCount;
                  } else {
                    stpval = ((cen - (cen % objstaffToPatient.staffCount)) / objstaffToPatient.staffCount) + 1;
                  }

                }
                objnewStaffToPatient.staffCount = stpval;
              } else {
                objnewStaffToPatient.staffCount = 0;
              }
              objstaffGridCensus.staffToPatientList.push(objnewStaffToPatient);
            }

            shift.staffGridCensuses.push(objstaffGridCensus);
            this.maxCensusSaved++;
          }
          // add newly added census rows to existing saved census rows ///census range changed by reducing the min
          let isMinCensusReduced = false;
          this.minCensusSaved--;
          while (this.minCensusSaved >= this.plan.censusRange.minimumCensus) {
            isMinCensusReduced = true;
            const cen = this.minCensusSaved;
            const objstaffGridCensus = new StaffGridCensus();
            objstaffGridCensus.censusIndex = cen;
            objstaffGridCensus.censusValue = Number(this.plan.censusRange.occurrenceNumber[cen - 1]);

            for (const objstaffToPatient of shift.staffToPatientList) {
              let stpval = 1;
              const objnewStaffToPatient: staffToPatient = new staffToPatient();
              objnewStaffToPatient.variablePositionCategoryAbbreviation = objstaffToPatient.variablePositionCategoryAbbreviation;
              objnewStaffToPatient.variablePositionCategoryDescription = objstaffToPatient.variablePositionCategoryDescription;
              objnewStaffToPatient.variablePositionKey = objstaffToPatient.variablePositionKey;

              if (objstaffToPatient.staffCount > 0) {
                if (cen > objstaffToPatient.staffCount) {
                  if (cen % objstaffToPatient.staffCount === 0) {
                    stpval = cen / objstaffToPatient.staffCount;
                  } else {
                    stpval = ((cen - (cen % objstaffToPatient.staffCount)) / objstaffToPatient.staffCount) + 1;
                  }

                }
                objnewStaffToPatient.staffCount = stpval;
              } else {
                objnewStaffToPatient.staffCount = 0;
              }
              objstaffGridCensus.staffToPatientList.push(objnewStaffToPatient);
            }

            shift.staffGridCensuses.push(objstaffGridCensus);
            this.minCensusSaved--;
          }
          if (isMinCensusReduced) {
            shift.staffGridCensuses.sort(this.sortData);
          }
        }

      }
    }
    this.plan = this.staffGridCalculator.getSummaryData(this.plan);
    let annualTotalHoursVariance = 0;
    if (this.plan.staffingSummaryData) {
      for (const staffSummary of this.plan.staffingSummaryData) {
        annualTotalHoursVariance = annualTotalHoursVariance + Number(staffSummary.annualHrsVarToTarget);
      }
    }
    this.plan.totalAnnualHoursVariance =  Math.round(annualTotalHoursVariance);
  }
  // save plan data
  saveAndExitPlanDetails(): void {
    this.saveAvgVolAndName();
    this.saveTotalAnnualHrsVariance();
    this.planService.createPlan(this.plan).subscribe(data => {
      // this.removeSessionAttributes();
      this.showMsg = true;
      setTimeout(() => {
      }, 1500);
      this.router.navigate(['/home']);
    });
  }

  saveAndNextPlanDetails(): void {
    this.saveAvgVolAndName();
    this.saveTotalAnnualHrsVariance();
    this.planService.createPlan(this.plan).subscribe(data => {
      this.showMsg = true;
      const currentplandata: PlanDetails = data;
      this.plan.key = data.key;
      localStorage.setItem('plankey', currentplandata.key);
      sessionStorage.setItem('plankey', currentplandata.key);
      setTimeout(() => {
      }, 1500);
      this.loadOtherPages();
    }, error1 => {
      this.pageGroup.selectedIndex = this.previousIndex;
    });
  }
  removeErrorMessagesForSave() {
    const errorminmaxIndex: number = this.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values for the Census Range. All values must be greater than zero.');
    if (errorminmaxIndex !== -1) {
      this.objSavePlanParams.saveNextErrorMessages.splice(errorminmaxIndex, 1);
    }
    const errorminmaxIndexForPlanUtil: number = this.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.');
    if (errorminmaxIndexForPlanUtil !== -1) {
      this.objSavePlanParams.saveNextErrorMessages.splice(errorminmaxIndexForPlanUtil, 1);
    }
    const errorminmaxIndexForOccur: number = this.objSavePlanParams.saveNextErrorMessages.indexOf('Enter an Occurrence value.');
    if (errorminmaxIndexForOccur !== -1) {
      this.objSavePlanParams.saveNextErrorMessages.splice(errorminmaxIndexForOccur, 1);
    }
    const errorIndex: number = this.objSavePlanParams.validationErrorMessages.indexOf('Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.');
    if (errorIndex !== -1) {
      this.objSavePlanParams.validationErrorMessages.splice(errorIndex, 1);
    }
  }
  censusMinMaxValidation() {
    if ((this.plan.censusRange.maximumCensus !== 0 && this.plan.censusRange.minimumCensus !== 0) &&
      (this.plan.censusRange.minimumCensus >= this.plan.censusRange.maximumCensus ||
        this.plan.censusRange.maximumCensus <= this.plan.censusRange.minimumCensus) ||
      (this.plan.censusRange.minimumCensus > 50 || this.plan.censusRange.maximumCensus > 50)) {
      return true;
    } else {
      return false;
    }
  }
  savePlanDetails(): void {
    this.saveAvgVolAndName();
    this.saveTotalAnnualHrsVariance();
    this.removeErrorMessagesForSave();
    this.planService.createPlan(this.plan).subscribe(data => {
      setTimeout( () => this.strplanDetails = this.getPlanStringForComparison(this.plan), 1000);
      this.showMsg = true;
      const currentplandata: PlanDetails = data;
      this.plan.key = data.key;
      localStorage.setItem('plankey', currentplandata.key);
      sessionStorage.setItem('plankey', currentplandata.key);
      this.success();
      setTimeout(() => {
      }, 1500);
    }, error1 => {
      this.pageGroup.selectedIndex = this.previousIndex;
    });
  }
  success() {
    this._snackbar.open("Plan setup data saved successfully", "close", {
      duration: 10000
    });
  }

  populatePatientsAndTargetData(): void {
    this.plan.secondaryWHpU = this.oASuggestedData.workHourPerUnitSecondary;
    this.plan.fte = this.oASuggestedData.fullTimeEquivalent;
    this.plan.primaryWHpU = this.oASuggestedData.workHourPerUnitPrimary;
    this.plan.educationOrientationTargetPaid = this.oASuggestedData.educationOrientationTargetPaid;
    if (Util.isNullOrUndefined(this.plan.currentAverageVolume)) {
        this.plan.annualizedCurrentAvg = null;
    } else {
        this.plan.annualizedCurrentAvg = this.round(this.plan.currentAverageVolume * this.findLeapYear(), 2);
    }
    if (Util.isNullOrUndefined(this.plan.budgetAverageVolume)) {
          this.plan.annualizedBudgetedAvg = null;
    } else {
          this.plan.annualizedBudgetedAvg = this.round(this.plan.budgetAverageVolume * this.findLeapYear(), 2);
    }
    sessionStorage.setItem('keyVolume', this.oASuggestedData.keyVolume);
    this.screenLoadFlag = false;
  }

  round(result: number, precision: number): number {
    const factor = Math.pow(10, precision);
    const tempNumber = result * factor;
    const roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
  }

  async ngOnInit() {
    window.scrollTo(0, 0);
    this.planService.isRoutedFlag = true;
    this.route.queryParamMap.subscribe(queryParams => {
      this.planKey = queryParams.get('plankey');
    });
    if (this.planKey == null) {
      this.loadAllPlans();
      this.systemFlag = false
      // from back button
      this.planKey = localStorage.getItem('plankey');
      if (this.planKey === '') {
        // From create new plan
        this.getformvalues();
      } else {
        this.plan = await this.getPlandetails();
        this.plan.effectiveStartDate = moment(this.plan.effectiveStartDate, 'YYYY-MM-DD').toDate();
        this.plan.effectiveEndDate = moment(this.plan.effectiveEndDate, 'YYYY-MM-DD').toDate();
        this.isDaily=!this.plan.dailyFlag;
        this.checkForSessionAttributes();
      }
    } else {
      const wHpUExcludeEOFlag = this.alertBox.getWHpUExcludeEOFlag();
      if (!wHpUExcludeEOFlag) {
        this.systemFlag = false;
      } else {
        this.systemFlag = true;
      }
      this.plan = await this.getPlandetails();
      this.plan.effectiveStartDate = moment(this.plan.effectiveStartDate, 'YYYY-MM-DD').toDate();
      this.plan.effectiveEndDate = moment(this.plan.effectiveEndDate, 'YYYY-MM-DD').toDate();
      this.isDaily=this.plan.dailyFlag;
      this.checkForSessionAttributes();
    }

      if (!this.plan.planCompleted) {
          this.loadAllPlans();
      }

      if (!Util.isNullOrUndefined(this.plan.key)) {
      this.loadSchedulesForThePlan();
    }
    this.userAccess=JSON.parse(sessionStorage.getItem("userAccess"));
    this.loadFacilityDetails();
    this.loadDeptDetails();
    this.getvariablePos();
    if (!(this.plan.corporationId === null ||
      this.plan.corporationId === undefined)) {
      this.getEntityval();
      this.getDepartmentVal();
      this.updateDataFromOA(false);
    }
    this.loadButtontext();
    setTimeout( () => this.strplanDetails = this.getPlanStringForComparison(this.plan), 1000);
    if (this.plan.action === 'Active') {
      this.activeStatusValue = 'Yes';
    }
    this.loadPlanUtilizedBaseValue();
  }

  loadPlanUtilizedBaseValue(){
    let currentCalendarYearTotalDays = this.staffGridCalculator.getCurrentCalendarYearTotalDays(this.plan.effectiveEndDate);
    if(this.plan.utilizedAverageVolume && !this.plan.utilizedAverageVolumeBase){
      if(!this.plan.dailyFlag){
        this.utilizedAverageVolumeAnnual = this.plan.utilizedAverageVolume;
        this.plan.utilizedAverageVolumeBase =this.plan.utilizedAverageVolume / currentCalendarYearTotalDays;
      }
      else{
        this.plan.utilizedAverageVolumeBase = this.plan.utilizedAverageVolume;
        this.utilizedAverageVolumeAnnual=this.plan.utilizedAverageVolume * currentCalendarYearTotalDays;
      }
    }
    this.planUtilizeCalCulation();
  }

  loadOAPlanDataEntity(): void {
    this.getDepartmentVal();
    this.oAPlanDataEntity.facilityCode = this.plan.facilityCode != null ? this.plan.facilityCode : this.plan.facilityKey;
    this.oAPlanDataEntity.departmentCode = this.plan.departmentCode != null ? this.plan.departmentCode : this.plan.departmentKey;
    this.oAPlanDataEntity.planStartDate = moment(this.plan.effectiveStartDate).format('YYYY-MM-DD');
    this.endDate = moment(this.plan.effectiveStartDate).subtract(1, 'years').subtract(1, 'days').format('YYYY-MM-DD');
  }

  getPlandetails(): Promise<any> {

    this.route.queryParamMap.subscribe(queryParams => {
      this.planKey = queryParams.get('plankey');
    });

    if (this.planKey == null) {
      // from back button
      this.planKey = localStorage.getItem('plankey');
      if (this.planKey === '') {
        // From create new plan
        this.getformvalues();
        this.loadFacilityDetails();
        this.getvariablePos();
        this.loadDeptDetails();
      } else {
        localStorage.setItem('plankey', this.planKey);
        sessionStorage.setItem('plankey', this.planKey);
        return this.planService.getPlandetails(this.planKey).toPromise();
      }

    } else {
      localStorage.setItem('plankey', this.planKey);
      sessionStorage.setItem('plankey', this.planKey);
      return this.planService.getPlandetails(this.planKey).toPromise();
    }
    this.getvariablePos();


  }

  loadButtontext(): void {
    if (this.plan.planCompleted) {
      this.btnExittxt = 'Exit';
      this.btnNexttxt = 'Next';
    } else {
      this.btnExittxt = 'Save & Exit';
      this.btnNexttxt = 'Save & Next';
    }
  }

  getvariablePos(): void {
    if (!this.plan.variableDepartmentPositions || this.plan.variableDepartmentPositions.length === 0) {
      const objvarpos = new VariableDepartmentPosition();
      objvarpos.categoryAbbreviation = '';
      objvarpos.categoryDescription = '';
      objvarpos.includedInNursingHoursFlag = true;
      this.plan.variableDepartmentPositions = [];
      this.plan.variableDepartmentPositions[0] = objvarpos;
    }
    if (!this.plan.nonVariableDepartmentPositions || this.plan.nonVariableDepartmentPositions.length === 0) {
      const objNonVarPos = new NonVariableDepartmentPosition();
      objNonVarPos.title = '';
      this.plan.nonVariableDepartmentPositions = [];
      this.plan.nonVariableDepartmentPositions[0] = objNonVarPos;
    }
    if (!this.plan.censusRange) {
      const objCensusRange: CensusRange = new CensusRange();
      this.plan.censusRange = objCensusRange;
    }
  }

  validatePlanName(): void {


    if (this.plansName) {
      if (!Util.isNullOrUndefined(this.plan.name)) {
      if (this.plansName.filter(ele => ele.toUpperCase() === this.plan.name.trim().toUpperCase()).length > 0) {
        let deleteFlag = true;
        for (const plan of this.plansName.filter(ele => ele.toUpperCase() === this.plan.name.trim().toUpperCase())) {
            deleteFlag = false;
        }
        if (!deleteFlag) {
          this.showError = true;
        } else {
          this.showError = false;
        }
      } else {
        this.showError = false;
      }
    }
    }

  }

  getformvalues(): void {
    this.plan.corporationId = localStorage.getItem('Corpid');
    this.plan.departmentKey = localStorage.getItem('Departmentid');
    this.plan.facilityKey = localStorage.getItem('Enitityid');

  }

  loadFacilityDetails(): void {
    if (sessionStorage.getItem('facility-list') !== null) {
      this.entities = JSON.parse(sessionStorage.getItem('facility-list'));
    } else {
      if(this.userAccess) {
        if (this.userAccess.featureToggle) {
          this.listfacKeysInDept = this.userAccess.department.filter(permission => permission.permissions.includes(Permissions.STAFFPLANNER)).map(dept => dept.facilityId.toString());
          this.entities = this.userAccess.facility.filter(fac => fac.corporationId === this.plan.corporationId.toString() && this.listfacKeysInDept.includes(fac.id.toString()));
        } else {
          this.entities = this.userAccess.facility.filter(fac => fac.corporationId == this.plan.corporationId);
        }
        setTimeout(() => this.entitySearch = this.myControlEnt.valueChanges
              .pipe(
                startWith(''),
                map(value => this.filterEnt(value))
              ), 1000);

        this.entities.sort((a, b) => (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) ? 1 :
          (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) ? -1 : 0);
        if (!Util.isNullOrUndefined(this.plan.facilityCode) && (!Util.isNullOrUndefined(this.plan.facilityName))) {
          this.entityModel = this.plan.facilityCode + '-' + this.plan.facilityName;
        } else {
          if ((sessionStorage.getItem('entName') !== undefined && sessionStorage.getItem('entName') !== null &&
            sessionStorage.getItem('entName') !== '' && sessionStorage.getItem('entName').localeCompare('All Departments') !== 0)) {
            let entity = this.entities.find(data => (data.code + '-' + data.name).localeCompare( sessionStorage.getItem('entName')) === 0);
            if(!Util.isNullOrUndefined(entity)) {
              this.entityModel = sessionStorage.getItem('entName');
            }else{
              this.entityModel = this.entities[0].code + '-' + this.entities[0].name;
            }
          }else {
            this.entityModel = this.entities[0].code + '-' + this.entities[0].name;
          }
        }

      }
    }
  }

  loadDeptDetails(): void {

    if (sessionStorage.getItem('department-list') !== null) {
      this.departments = JSON.parse(sessionStorage.getItem('department-list'));
    } else {
      if(this.userAccess) {
        if (this.userAccess.featureToggle) {
          this.departments = this.userAccess.department.filter(dept => dept.facilityId.toString() === this.plan.facilityKey.toString()
            && dept.permissions.includes(Permissions.STAFFPLANNER));
        } else {
          this.departments = this.userAccess.department.filter(dept => dept.facilityId.toString() === this.plan.facilityKey.toString());
        }
        setTimeout(()=> this.deptSearch = this.myControlDept.valueChanges
              .pipe(
                startWith(''),
                map(value => this.filterDept(value))
              ),1000);
        this.departments.sort((a, b) => (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) ? 1 :
          (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) ? -1 : 0);
        if (!Util.isNullOrUndefined(this.plan.departmentCode && this.plan.departmentName)) {
          this.deptModel = this.plan.departmentCode + '-' + this.plan.departmentName;
        } else {
          if((sessionStorage.getItem('departmentName') !== undefined && sessionStorage.getItem('departmentName') !== null &&
            sessionStorage.getItem('departmentName') !=='' && sessionStorage.getItem('departmentName').localeCompare('All Departments')!==0)){
            let depts = this.departments.find(data => (data.code + '-' + data.name).localeCompare( sessionStorage.getItem('departmentName'))===0);
            if(!Util.isNullOrUndefined(depts)) {
              this.deptModel = sessionStorage.getItem('departmentName');
            }else{
              this.deptModel = this.departments[0].code + '-' + this.departments[0].name;
            }
          }else{
            this.deptModel = this.departments[0].code + '-' + this.departments[0].name;
          }
        }
      }
    }
  }

  LoadDepartmentsByEntity(event): void {
    if((this.alertBox.isNullOrUndefined(sessionStorage.getItem('wHpUExcludeEOFlag'))) || ((this.alertBox.isNullOrUndefined(sessionStorage.getItem('wHpUExcludeEOFKey'))) || sessionStorage.getItem('wHpUExcludeEOFKey') !== JSON.stringify(this.plan.facilityKey))){
      this.planService.getSystemOptionValuesFromDTM(this.plan.facilityKey, moment(new Date(this.plan.effectiveStartDate)).format('YYYY-MM-DD')).subscribe(data => {
        if (data['data'] === 2) {
          this.systemFlag = true;
        } else{
          this.systemFlag = false;
        }
        sessionStorage.setItem('wHpUExcludeEOFlag', JSON.stringify(this.systemFlag));
        sessionStorage.setItem('wHpUExcludeEOFKey', JSON.stringify(this.plan.facilityKey));
      });
    }
    // this.plan.facilityKey = event.option.id;
    this.plan.facilityKey = event.option.id;
    // this.departments=this.userAccess.department.filter(dept=> dept.facilityId.toString()===this.plan.facilityKey );
    if(this.userAccess) {
      if (this.userAccess.featureToggle) {
        this.departments = this.userAccess.department.filter(dept => dept.facilityId.toString() === this.plan.facilityKey
          && dept.permissions.includes(Permissions.STAFFPLANNER));
      } else {
        this.departments = this.userAccess.department.filter(dept => dept.facilityId.toString() === this.plan.facilityKey);
      }
      this.deptModel = this.departments[0].code + ' - ' +  this.departments[0].name;
        setTimeout(()=> this.deptSearch = this.myControlDept.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filterDept(value))
          ),1000);
      if (this.departments.length > 0) {
        this.plan.departmentKey = this.departments[0].key;
        this.updateDataFromOA(true);
      }
      sessionStorage.setItem('selectedEntity', this.plan.facilityKey.trim());
      sessionStorage.setItem('entName', this.entityModel.trim());
      sessionStorage.setItem('departmentId',this.departments[0].key);
      sessionStorage.setItem('departmentName',this.deptModel);
    }
  }

  getEntityval(): string {
    if (this.entities.length > 0) {
      this.currentEntity = this.entities.filter(t => t.id === this.plan.facilityKey.toString())[0];
      this.plan.facilityCode = this.currentEntity.code;
      return this.plan.facilityCode + '-' + this.currentEntity.name;
    }
  }

  getDepartmentVal(): string {
    if (this.departments.length > 0) {
      this.currentDepartment = this.departments.filter(t => t.key.toString() === this.plan.departmentKey.toString())[0];
      this.plan.departmentCode = this.currentDepartment.code;
      return this.plan.departmentCode + '-' + this.currentDepartment.name;
    }
  }

  getSuggestedData(editAction: boolean): void {
    this.oaService.getOASuggestedData(this.oAPlanDataEntity).subscribe(data => {
        this.oASuggestedData = data['data'];
        this.populatePatientsAndTargetData();
        if (editAction) {
          if (!Util.isNullOrUndefined(this.plan.primaryWHpU)) {
            this.plan.targetBudget = this.plan.primaryWHpU.toFixed(4);
          } else {
            this.plan.targetBudget = '';
          }
        } else {
          if (!Util.isNullOrUndefined(this.plan.targetBudget)) {
            this.plan.targetBudget = Number(this.plan.targetBudget).toFixed(4);
          }
        }
      }
    );

    this.oaService.getBudgetVolume(this.oAPlanDataEntity, this.endDate).subscribe(data => {
        this.oASuggestedData = data['data'];
        this.plan.budgetAverageVolume = this.oASuggestedData.budgetAverageKeyVolume;
    });
    // this.oaService.getCumulativeVolume(this.oAPlanDataEntity, this.endDate).subscribe(data => {
    //   this.oASuggestedData.cumulativeHoursVarianceFiscal = data['data'];
    // });
    this.oaService.getHistoricVolume(this.oAPlanDataEntity, this.endDate).subscribe(data => {
          this.oASuggestedData.historicalAverageKeyVolume = data['data'];
          this.plan.currentAverageVolume = this.oASuggestedData.historicalAverageKeyVolume;
    });
  }

  findLeapYear(): number {
    const planDate: Date = new Date(this.plan.effectiveEndDate);
    let planYear: number;
    planYear = planDate.getFullYear();

    if ((planYear % 4 === 0 && planYear % 100 !== 0) || planYear % 400 === 0) {
      return 366;
    } else {
      return 365;
    }
  }


  nullCheck(value: any): void {
    this.targetBudgetFlag = value === '';
  }

  checkSaveButtons(): boolean {
    return this.isSaveExitBtnSubmit === true || this.isSaveNextBtnSubmit === true;
  }

  checkSaveCondition(): boolean {
    return this.isSaveExitBtnSubmit || this.isSaveNextBtnSubmit;
  }

  checkDates(startDate: boolean, endDate: boolean): boolean {
    return startDate || endDate;
  }

  checkDateRange(endDate: Date, startDate: Date): boolean {
    return endDate < startDate;
  }

  checkTargetBudgetFlag(): boolean {
    return this.targetBudgetFlag || this.checkSaveCondition();
  }

  checkCensusRange(): void {
    if (this.plan.censusRange.maximumCensus && this.plan.censusRange.minimumCensus) {
      let planUtilizedAverageVolume;
      if (!this.isDaily) {
        const currentCalendarYearTotalDays = this.staffGridCalculator.getCurrentCalendarYearTotalDays(this.plan.effectiveEndDate);
        planUtilizedAverageVolume = this.utilizedAverageVolumeAnnual / currentCalendarYearTotalDays;
      } else {
        planUtilizedAverageVolume = this.plan.utilizedAverageVolume;
      }
      if (this.plan.censusRange.maximumCensus > this.plan.censusRange.minimumCensus && ((planUtilizedAverageVolume <= this.plan.censusRange.minimumCensus) ||
        (planUtilizedAverageVolume >= this.plan.censusRange.maximumCensus))) {
        const errorIndx1: number = this.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.');
        const errorIndex: number = this.objSavePlanParams.validationErrorMessages.indexOf('Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.');
        if (errorIndex < 0 && errorIndx1 < 0) {
          this.objSavePlanParams.validationErrorMessages.push('Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.');
        }
      } else {
        const errorIndex: number = this.objSavePlanParams.validationErrorMessages.indexOf('Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.');
        if (errorIndex !== -1) {
          this.objSavePlanParams.validationErrorMessages.splice(errorIndex, 1);
        }
        if (this.cmax > this.cmin && ((planUtilizedAverageVolume <= this.cmin) ||
          (planUtilizedAverageVolume >= this.cmax))) {
          const errorIndex1: number = this.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.');
          if (errorIndex1 < 0) {
            this.objSavePlanParams.saveNextErrorMessages.push('Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.');
          }
        } else {
          const errorIndexMinMax: number = this.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.');
          if (errorIndexMinMax !== -1) {
            this.objSavePlanParams.saveNextErrorMessages.splice(errorIndexMinMax, 1);
          }
        }
      }
    }


  }

  numberOnlyForDate(event): boolean {
    if (!Util.isNullOrUndefined(event) && !(event.keyCode >= 47 && event.keyCode <= 57)) {
      event.preventDefault();
    }
    if (Util.isNullOrUndefined(this.plan.effectiveStartDate)) {
      return true;
    }
    if (this.plan.effectiveStartDate.toString()) {
      // const date = this.datepipe.transform(this.plan.effectiveStartDate.toString(), 'dd/MM/yyyy');
      const date = moment(new Date(this.plan.effectiveStartDate.toString())).format('MM/DD/YYYY');
      if (date) {
        const index = date.lastIndexOf('/');
        const b = date.substring(index, date.length - 1).length;
        if (date.substring(index, date.length - 1).length > 4) {
          const date1 = new Date(date.toString().substring(0, index) + date.toString().substring(index, index + 5));
          this.plan.effectiveStartDate = date1;
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
  }


  numberOnlyForEndDate(event): boolean {
    if (!(event.keyCode >= 47 && event.keyCode <= 57)) {
      event.preventDefault();
    }
    if (Util.isNullOrUndefined(this.plan.effectiveEndDate)) {
      return true;
    }
    if (this.plan.effectiveEndDate.toString()) {
      // const date = this.datepipe.transform(this.plan.effectiveStartDate.toString(), 'dd/MM/yyyy');
      const date = moment(this.plan.effectiveEndDate.toString()).format('MM/DD/YYYY');
      if (date) {
        const index = date.lastIndexOf('/');
        const b = date.substring(index, date.length - 1).length;
        if (date.substring(index, date.length - 1).length > 4) {
          const date1 = new Date(date.toString().substring(0, index) + date.toString().substring(index, index + 5));
          this.plan.effectiveEndDate = date1;
          return false;
        }
      }
    }
  }
  numberOnlyForEndDate1(): void {
    // if(this.plan.effectiveEndDate){
    //   let startDate = new Date(this.plan.effectiveEndDate);
    //   startDate.setDate(startDate.getDate() - 1);
    //   this.maxEffStartDate = startDate;
    // }
    //this.planUtilizeCalCulation();
    this.numberOnlyForEndDate(event);
  }

  loadOtherPages(): void {
    this.isBackButtonClicked = false;
    let currentSelectedIndex:number = this.pageGroup.selectedIndex;
    if(this.systemFlag)
    currentSelectedIndex++;

    const conditionCheck = (Util.isNullOrUndefined(this.plan.key) && this.previousIndex == 0) || !Util.isNullOrUndefined(this.plan.key);
    if (conditionCheck) {
      switch (currentSelectedIndex) {
        case 1:
          if (!this.systemFlag) {
            this.router.navigate(['/off-grid-activities'], {queryParams: {plankey: this.plan.key}});
          } else {
            this.router.navigate(['/staff-schedule'], {queryParams: {plankey: this.plan.key}});
          }
          break;
        case 2:
          if (!this.systemFlag) {
            this.router.navigate(['/staff-schedule'], {queryParams: {plankey: this.plan.key}});
          } else {
            this.navigateToNextTab('/staff-schedule');
          }
          break;
        case 3:
          this.navigateToNextTab('/staffing-grid');
          break;
      }
    } else {
      this.pageGroup.selectedIndex = this.previousIndex;
    }
  }

  navigateToNextTab(command) {
    this.staffSchedules = this.plan.staffScheduleList;
    if (sessionStorage.getItem('newPlanKey') !== null) {
      const newPlanKey = sessionStorage.getItem('newPlanKey');
      if (newPlanKey === this.plan.key.toString()) {
        this.staffSchedules = JSON.parse(sessionStorage.getItem('staffScheduleList'));
        sessionStorage.removeItem('newPlanKey');
        sessionStorage.removeItem('staffScheduleList');
      }
    }
    if (!Util.isNullOrUndefined(this.staffSchedules)) {
      if (this.staffSchedules.length > 0) {
        this.router.navigate([command], {queryParams: {plankey: this.plan.key}});
      } else {
        this.alertBox.openAlert('exit-dialog', '175px', '350px', 'Staff Planner', 'Submit schedule and shift details?');
        this.pageGroup.selectedIndex = this.previousIndex;
      }
    } else {
      this.alertBox.openAlert('exit-dialog', '175px', '350px', 'Staff Planner', 'Submit schedule and shift details?');
      this.pageGroup.selectedIndex = this.previousIndex;
    }
  }

  checkTabChange(): void {
    if (this.previousIndex !== this.pageGroup.selectedIndex) {
      this.onSubmit('Save-Next');
    }
  }
  loadSchedulesForThePlan(): void {
    this.scheduleServiceScheduleService.getScheduleDetails(this.plan.key).subscribe(data => {
      this.plan.staffScheduleList = data;
      this.loadStaffGridDetails(data);
    });
  }
  loadStaffGridDetails(staffScheduleList: StaffSchedule[]): void {
    this.staffGridService.getStaffGridDetails(this.planKey).subscribe(data => {
      for (const staffGridCen of data) {
        for (const staffSchedule of staffScheduleList) {
          for (const staffShift of staffSchedule.planShiftList) {
            if (staffShift.key === staffGridCen.shiftKey) {
              this.checkForNewlyAddedVarpos(staffGridCen, staffShift);
              if (!staffShift.staffGridCensuses) {
                staffShift.staffGridCensuses = [];
              }
              staffGridCen.censusValue = Number(this.plan.censusRange.occurrenceNumber[staffGridCen.censusIndex - 1]);
              this.orderStaffGridCensusByVarpos(staffGridCen);
              staffShift.staffGridCensuses.push(staffGridCen);
            }
            this.orderStafftoPatientByVarpos(staffShift);
          }
        }

      }
      this.plan.staffScheduleList = staffScheduleList;
      this.populateData();
      setTimeout( () => this.strplanDetails = this.getPlanStringForComparison(this.plan), 1000);
    });
  }

  orderStafftoPatientByVarpos(objShift: shift): void {
    const staffToPatientList: staffToPatient[] = [];
    this.plan.variableDepartmentPositions.forEach(ele => {
      const objstaffToPatient = objShift.staffToPatientList.filter(eleStaff => eleStaff.variablePositionKey === ele.categoryKey && eleStaff.variablePositionCategoryDescription===ele.categoryDescription)[0];
      if (objstaffToPatient) {
        staffToPatientList.push(objstaffToPatient);
      }
    });
    objShift.staffToPatientList = staffToPatientList;
  }

  checkForNewlyAddedVarpos(staffGridCen: StaffGridCensus, staffShift: shift): void {
    for (const staffToPatientratio of staffShift.staffToPatientList) {
      let isVarPosFound = false;
      for (const censusstaffToPatientratio of staffGridCen.staffToPatientList) {
        if (censusstaffToPatientratio.variablePositionKey === staffToPatientratio.variablePositionKey && censusstaffToPatientratio.variablePositionCategoryDescription===staffToPatientratio.variablePositionCategoryDescription) {
          isVarPosFound = true;
        }
      }
      // newly added variable position
      if (!isVarPosFound) {
        const objStaffToPatient: staffToPatient = new staffToPatient();
        objStaffToPatient.variablePositionCategoryAbbreviation = staffToPatientratio.variablePositionCategoryAbbreviation;
        objStaffToPatient.variablePositionCategoryDescription = staffToPatientratio.variablePositionCategoryDescription;
        objStaffToPatient.variablePositionKey = staffToPatientratio.variablePositionKey;
        // pre-populate values
        if (staffToPatientratio.staffCount) {
          if (staffGridCen.censusIndex % staffToPatientratio.staffCount === 0) {
            objStaffToPatient.staffCount = staffGridCen.censusIndex / staffToPatientratio.staffCount;
          } else {
            objStaffToPatient.staffCount = ((staffGridCen.censusIndex - (staffGridCen.censusIndex % staffToPatientratio.staffCount))
              / staffToPatientratio.staffCount) + 1;
          }
        } else {
          objStaffToPatient.staffCount = 0;
        }
        staffGridCen.staffToPatientList.push(objStaffToPatient);
      }
    }

  }

  populateData(): void {
    if (this.plan.censusRange) {
      this.cenRange = [];
      const crMin = this.plan.censusRange.minimumCensus;
      const crMax = this.plan.censusRange.maximumCensus;
      for (let j = crMin; j <= crMax; j++) {
        this.cenRange.push(j);
      }
    }
    for (const staffSchedule of this.plan.staffScheduleList) {
      for (const shift of staffSchedule.planShiftList) {
        shift.staffGridCensuses.sort(this.sortData);
        // if staffgridcensus value is null
        if (!shift.staffGridCensuses || shift.staffGridCensuses.length === 0) {
          shift.staffGridCensuses = [];

          let cenValPos = 0;
          for (const cen of this.cenRange) {

            const objstaffGridCensus = new StaffGridCensus();
            objstaffGridCensus.censusIndex = cen;
            objstaffGridCensus.censusValue = Number(this.plan.censusRange.occurrenceNumber[cen - 1]);
            for (const objstaffToPatient of shift.staffToPatientList) {
              let stpval = 1;
              const objnewStaffToPatient: staffToPatient = new staffToPatient();
              objnewStaffToPatient.variablePositionCategoryAbbreviation = objstaffToPatient.variablePositionCategoryAbbreviation;
              objnewStaffToPatient.variablePositionCategoryDescription = objstaffToPatient.variablePositionCategoryDescription;
              objnewStaffToPatient.variablePositionKey = objstaffToPatient.variablePositionKey;

              if (objstaffToPatient.staffCount > 0) {
                if (cen > objstaffToPatient.staffCount) {
                  if (cen % objstaffToPatient.staffCount === 0) {
                    stpval = cen / objstaffToPatient.staffCount;
                  } else {
                    stpval = ((cen - (cen % objstaffToPatient.staffCount)) / objstaffToPatient.staffCount) + 1;
                  }

                }
                objnewStaffToPatient.staffCount = stpval;
              } else {
                objnewStaffToPatient.staffCount = 0;
              }
              objstaffGridCensus.staffToPatientList.push(objnewStaffToPatient);
            }
            shift.staffGridCensuses.push(objstaffGridCensus);

            cenValPos++;
          }

        } else if (this.checkIfCensusangeIncreased(shift)) {
          // add newly added census rows to existing saved census rows ///census range changed by increasing the max
          this.maxCensusSaved++;
          while (this.maxCensusSaved <= this.plan.censusRange.maximumCensus) {
            const cen = this.maxCensusSaved;
            const objstaffGridCensus = new StaffGridCensus();
            objstaffGridCensus.censusIndex = cen;
            objstaffGridCensus.censusValue = Number(this.plan.censusRange.occurrenceNumber[cen - 1]);

            for (const objstaffToPatient of shift.staffToPatientList) {
              let stpval = 1;
              const objnewStaffToPatient: staffToPatient = new staffToPatient();
              objnewStaffToPatient.variablePositionCategoryAbbreviation = objstaffToPatient.variablePositionCategoryAbbreviation;
              objnewStaffToPatient.variablePositionCategoryDescription = objstaffToPatient.variablePositionCategoryDescription;
              objnewStaffToPatient.variablePositionKey = objstaffToPatient.variablePositionKey;
              if (objstaffToPatient.staffCount > 0) {
                if (cen > objstaffToPatient.staffCount) {
                  if (cen % objstaffToPatient.staffCount === 0) {
                    stpval = cen / objstaffToPatient.staffCount;
                  } else {
                    stpval = ((cen - (cen % objstaffToPatient.staffCount)) / objstaffToPatient.staffCount) + 1;
                  }

                }
                objnewStaffToPatient.staffCount = stpval;
              } else {
                objnewStaffToPatient.staffCount = 0;
              }
              objstaffGridCensus.staffToPatientList.push(objnewStaffToPatient);
            }

            shift.staffGridCensuses.push(objstaffGridCensus);
            this.maxCensusSaved++;
          }
          // add newly added census rows to existing saved census rows ///census range changed by reducing the min
          let isMinCensusReduced = false;
          this.minCensusSaved--;
          while (this.minCensusSaved >= this.plan.censusRange.minimumCensus) {
            isMinCensusReduced = true;
            const cen = this.minCensusSaved;
            const objstaffGridCensus = new StaffGridCensus();
            objstaffGridCensus.censusIndex = cen;
            objstaffGridCensus.censusValue = Number(this.plan.censusRange.occurrenceNumber[cen - 1]);

            for (const objstaffToPatient of shift.staffToPatientList) {
              let stpval = 1;
              const objnewStaffToPatient: staffToPatient = new staffToPatient();
              objnewStaffToPatient.variablePositionCategoryAbbreviation = objstaffToPatient.variablePositionCategoryAbbreviation;
              objnewStaffToPatient.variablePositionCategoryDescription = objstaffToPatient.variablePositionCategoryDescription;
              objnewStaffToPatient.variablePositionKey = objstaffToPatient.variablePositionKey;

              if (objstaffToPatient.staffCount > 0) {
                if (cen > objstaffToPatient.staffCount) {
                  if (cen % objstaffToPatient.staffCount === 0) {
                    stpval = cen / objstaffToPatient.staffCount;
                  } else {
                    stpval = ((cen - (cen % objstaffToPatient.staffCount)) / objstaffToPatient.staffCount) + 1;
                  }

                }
                objnewStaffToPatient.staffCount = stpval;
              } else {
                objnewStaffToPatient.staffCount = 0;
              }
              objstaffGridCensus.staffToPatientList.push(objnewStaffToPatient);
            }

            shift.staffGridCensuses.push(objstaffGridCensus);
            this.minCensusSaved--;
          }
          if (isMinCensusReduced) {
            shift.staffGridCensuses.sort(this.sortData);
          }
        }

      }
    }
  }

  orderStaffGridCensusByVarpos(objStaffGridCensus: StaffGridCensus): void {
    const staffGridCensusActivities: staffToPatient[] = [];
    this.plan.variableDepartmentPositions.forEach(ele => {
      const staffGridCensusActivity = objStaffGridCensus.staffToPatientList.filter(eleStaff =>
        eleStaff.variablePositionKey === ele.categoryKey && eleStaff.variablePositionCategoryDescription == ele.categoryDescription)[0];
      if (staffGridCensusActivity) {
        staffGridCensusActivities.push(staffGridCensusActivity);
      }
    });
    objStaffGridCensus.staffToPatientList = staffGridCensusActivities;
  }

  private checkForSessionAttributes(): void {
   const locked = sessionStorage.getItem('lock');
   if (Util.isNullOrUndefined(locked)) {
    if (this.plan.planAlreadyInUse) {
        this.planService.planAlreadyInUse = true;
        this.plan.planCompleted = true;
        this.alertBox.openAlert('exit-dialog', '175px', '450px', 'Cannot update plan at this time', 'Plan is currently being edited by another user');
        document.body.classList.add('pr-modal-open');
        sessionStorage.setItem('lock', 'true');
      } else {
        this.planService.planAlreadyInUse = false;
        sessionStorage.setItem('lock', 'false');
      }
    } else {
        // tslint:disable-next-line:max-line-length no-conditional-assignment
      if (((locked.localeCompare('true') === 0 )) && this.plan.planAlreadyInUse) {
        this.planService.planAlreadyInUse = true;
        this.plan.planCompleted = true;
        sessionStorage.setItem('lock', 'true');
        this.alertBox.openAlert('exit-dialog', '175px', '450px', 'Cannot update plan at this time', 'Plan is currently being edited by another user');
        document.body.classList.add('pr-modal-open');
      } else {
        this.planService.planAlreadyInUse = false;
        sessionStorage.setItem('lock', 'false');
      }
    }
  }

    triggerUpdateSession(): void {
        this.planService.sessionUpdateInterval = setInterval(() => {
            this.updateSession();
        }, 1680000);
    }

    private updateSession(): void {
        if (!this.planService.planAlreadyInUse) {
            const planKey = sessionStorage.getItem('plankey');
            if (!Util.isNullOrUndefined(planKey)) {
                this.planService.updateSessionForPlan(Number(planKey)).toPromise();
            }
        }
    }

    private removeSessionAttributes(): void {
     sessionStorage.removeItem('lock');
     if (!this.planService.planAlreadyInUse) {
      const planKey = sessionStorage.getItem('plankey');
      if (!Util.isNullOrUndefined(planKey)) {
        this.planService.removePlanKeyFromSessionAttribute(Number(planKey)).toPromise();
      }
    }
  }
    canDeactivate(): Observable<boolean> | boolean {
      sessionStorage.removeItem('reload');
      if (this.checkIfPlanEdited() && this.isBackButtonClicked) {
        let dialogRef;
        let moveForward : boolean;
        dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', '175px', '600px',
          'Exit Staffing Plan Setup', 'You will lose any unsaved data, do you want to continue?');
        // you have access to the component instance

        document.body.classList.add('pr-modal-open');
        this.isBackButtonClicked = false;
        return new Observable<boolean>( observer => {
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              if (this.alertBox.checkForLandingPage(this.routerTracker.nextUrl, true)) {
                this.removeSessionAttributes();
              }
              observer.next(true);
            } else {
             // history.pushState(null, '', '');
              observer.next(false);
            }
          });
        });
        // return confirm('Are you sure you want to leave Hello ?');
      } else {
        if (this.alertBox.checkForLandingPage(this.routerTracker.nextUrl, true)) {
          this.removeSessionAttributes();
        }
        return true;
      }
    }

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.isBackButtonClicked = true;
  }

  clearEnt() {
    this.entityModel = '';
  }
  clearDept() {
    this.deptModel = '';
  }
  filterEnt(value: string) {
    for (let entList of this.entities) {
      let list = entList.code + '-' + entList.name;
      this.entDetailsCodeList.push(list);
    }
    const filterValue = value.toLowerCase();
    for (let ent of this.entDetailsCodeList) {
      if (ent.toLowerCase() === filterValue) {
        return this.entities;
      }
    }
    return this.entities.filter(clients => clients.name.toLowerCase().includes(filterValue) ||
      clients.code.toLowerCase().includes(filterValue));
  }
  filterDept(value: string) {
    for (let deptList of this.departments) {
      let list = deptList.code + ' - ' + deptList.name;
      this.deptDetailsCodeList.push(list);
    }
    const filterValue = value.toLowerCase();
    for (let dept of this.deptDetailsCodeList) {
      if (dept.toLowerCase() === filterValue) {
        return this.departments;
      }
    }
    return this.departments.filter(clients => clients.name.toLowerCase().includes(filterValue) ||
      clients.code.toLowerCase().includes(filterValue));
  }

}



