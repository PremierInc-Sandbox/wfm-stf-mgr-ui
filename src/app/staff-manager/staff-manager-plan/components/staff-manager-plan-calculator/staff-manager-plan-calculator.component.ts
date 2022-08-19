import {Component, HostListener, OnInit,Input} from '@angular/core';
import {ConfirmWindowOptions, PlanDetails} from '../../../../shared/domain/plan-details';
import {StaffVariance} from '../../../../shared/domain/staff-variance';
import {AlertBox} from '../../../../shared/domain/alert-box';
import {shift, StaffGridCensus, StaffSchedule, staffToPatient} from '../../../../shared/domain/staff-schedule';
import {StaffGridCalculator} from '../../../../shared/domain/staff-grid-calculator';
import * as moment from 'moment';
import {NonVariableDepartmentPosition} from '../../../../shared/domain/non-var-postn';
import {OffGridActivities} from '../../../../shared/domain/off-grid-activities';
import {StaffVarianceDetails, StaffVarianceSummary} from '../../../../shared/domain/staff-summary';
import { MatDialog } from '@angular/material/dialog';
import {PredictedModel} from "../../../../shared/domain/predicted-model";
import {UserService} from "../../../../shared/service/user.service";
import {OASuggestedData} from "../../../../shared/domain/OASuggestedData";
import {Util} from "../../../../shared/util/util";

@Component({
  selector: 'app-staff-manager-plan-calculator',
  templateUrl: './staff-manager-plan-calculator.component.html',
  styleUrls: ['./staff-manager-plan-calculator.component.scss']
})
export class StaffManagerPlanCalculatorComponent implements OnInit {
  @Input('staffVariance') staffVariance: StaffVariance = new StaffVariance();
  @Input('planDetails') planDetails: PlanDetails = new PlanDetails();
  @Input('predictedValues') predictedValues: PredictedModel = new PredictedModel();
  featureToggleFlag = false;
  today = new Date();
  ogatotalhours = 0;
  nonVarTotalhours = 0;
  alertBox: AlertBox;
  private flag = false;
  dateCheck = false;
  initDate: string;
  plannedValue: string;
  actualValue: string;
  startValue: number;
  staffGridCalculator: StaffGridCalculator = new StaffGridCalculator();
  hours = 'Planned';
  excludeEducationOrientationFlag: boolean;
  constructor(private dialog: MatDialog, private userService: UserService) {
  this.alertBox = new AlertBox(this.dialog);
  }

  ngOnInit(): void {
    this.actualValue = 'Actual';
    this.plannedValue = 'Planned';
  }

  getOGAandNonVariableHours(): void {
    this.getOGAPlanhours();
    this.getNonvarTotalhours();
  }

  getNonvarTotalhours(): void {
    this.nonVarTotalhours = 0;
    for (const nonVar of this.planDetails.nonVariableDepartmentPositions) {
      this.nonVarTotalhours = this.nonVarTotalhours + nonVar.shiftHours * this.getNonvarDaysCount(nonVar);
    }
    if (this.nonVarTotalhours) {
      this.nonVarTotalhours = this.nonVarTotalhours / 7;
    } else {
      this.nonVarTotalhours = 0;
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
  getWHpUExcludeEOFlag() {
    if (sessionStorage.getItem('wHpUExcludeEOFlag') !== undefined && sessionStorage.getItem('wHpUExcludeEOFlag') !== null) {
      this.excludeEducationOrientationFlag = JSON.parse(sessionStorage.getItem('wHpUExcludeEOFlag'));
    }
  }
  getOGAPlanhours(): void {
    this.ogatotalhours = 0;
    // WHpU E&O flag changes
    this.getWHpUExcludeEOFlag();
    if (!(this.excludeEducationOrientationFlag)) {
      for (const objOffGridActivities of this.planDetails.offGridActivities) {
        if (this.alertBox.getOGAplanHours(objOffGridActivities)) {
          this.ogatotalhours = this.ogatotalhours + this.alertBox.getOGAplanHours(objOffGridActivities);
        }
      }
      const planDate: Date = new Date();
      let planYear: number;
      let daysInYear: number;
      planYear = planDate.getFullYear();
      daysInYear = this.alertBox.findLeapYear(planYear);
      this.ogatotalhours = this.ogatotalhours / daysInYear;
    }
  }

  getPlannedTotal(staffSummaryIndex: number): any {
    const staffSummary: StaffVarianceSummary = this.staffVariance.staffVarianceSummaries[staffSummaryIndex];
    if (staffSummary) {
      let plannedtotal = 0;
      // let rowIndex = 0;
      for (const staffvarDetails of staffSummary.staffVarianceDetails) {
        if (staffvarDetails.actualCount) {
          plannedtotal = plannedtotal + Number(staffvarDetails.plannedCount);
        }
      }
      return plannedtotal.toFixed(2);
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
      if (staffsummary.staffVarianceDetails[varPosIndex].plannedCount) {
            totalHours = totalHours + Number(staffsummary.staffVarianceDetails[varPosIndex].plannedCount * 4);
            previousPlannedCount = staffsummary.staffVarianceDetails[varPosIndex].plannedCount;
            actualTotal = Number(actualTotal) + Number(staffsummary.staffVarianceDetails[varPosIndex].plannedCount);
            staffVarianceSummaryCount = Number(staffVarianceSummaryCount) + Number(1) ;
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

  numberOnlyForCensus(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
  }
  getSelectedVal() {
    let selectedValue = '';
    if (!Util.isNullOrUndefined(event)) {
    this.startValue = (event.target as HTMLInputElement).selectionStart;
    }
    if (!Util.isNullOrUndefined((document.activeElement as HTMLInputElement).value  &&
      (document.activeElement as HTMLInputElement).selectionStart &&  (document.activeElement as HTMLInputElement).selectionEnd)) {
      selectedValue = (document.activeElement as HTMLInputElement).value.substring(
        (document.activeElement as HTMLInputElement).selectionStart, (document.activeElement as HTMLInputElement).selectionEnd);
    }
    return selectedValue;
  }

  numberOnly(event, i: number, summaryIndex: number): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 && charCode !== 46 || charCode > 57)) {
      return false;
    }
    if (Util.isNullOrUndefined(this.staffVariance.staffVarianceSummaries[summaryIndex].staffVarianceDetails[i].actualCount)) {
      return true;
    }
    const actValue = this.staffVariance.staffVarianceSummaries[summaryIndex].staffVarianceDetails[i].actualCount;
    if (actValue) {
      let selectedValue = '';
      selectedValue = this.getSelectedVal();
      if (actValue.toString().indexOf('.') >= 0 && actValue.toString().indexOf('.') < 4 && selectedValue.length === 0 && this.startValue > actValue.toString().indexOf('.')) {
        const index = actValue.toString().indexOf('.') + 2;
        if (actValue.toString().charAt(index) !== '') {
          this.staffVariance.staffVarianceSummaries[summaryIndex].staffVarianceDetails[i].actualCount =
            parseFloat(actValue.toString().substring(0, index) + actValue.toString().charAt(index));
          return false;
        }
      }
      if (actValue.toString().charAt(4) === ('.')) {
        this.staffVariance.staffVarianceSummaries[summaryIndex].staffVarianceDetails[i].actualCount =
          parseFloat(actValue.toString().substring(0, 4));
        return false;
      }
    }
  }

  pasteNumberAndDecimalOnly(event:ClipboardEvent):boolean{
    let OGAHours=event.clipboardData;
    let a=OGAHours.getData("text");
    if((!(/^[+]?\d*\.?\d*$/.test(a)))){
      return false;
    }else {
      return true;
    }
  }

  numberOnlyforSchedCount(event, i: number, summaryIndex: number): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 && charCode !== 46 || charCode > 57)) {
      return false;
    }
    if (Util.isNullOrUndefined(this.staffVariance.staffVarianceSummaries[summaryIndex].staffVarianceDetails[i].scheduleCount)) {
      return true;
    }
    const actValue = this.staffVariance.staffVarianceSummaries[summaryIndex].staffVarianceDetails[i].scheduleCount;
    if (actValue) {
      let selectedValue = '';
      selectedValue = this.getSelectedVal();
      if (actValue.toString().indexOf('.') >= 0 && actValue.toString().indexOf('.') < 4 && selectedValue.length === 0 && this.startValue > actValue.toString().indexOf('.')) {
        const index = actValue.toString().indexOf('.') + 2;
        if (actValue.toString().charAt(index) !== '') {
          this.staffVariance.staffVarianceSummaries[summaryIndex].staffVarianceDetails[i].scheduleCount =
            parseFloat(actValue.toString().substring(0, index) + actValue.toString().charAt(index));
          return false;
        }
      }
      if (actValue.toString().charAt(4) === ('.')) {
        this.staffVariance.staffVarianceSummaries[summaryIndex].staffVarianceDetails[i].scheduleCount =
          parseFloat(actValue.toString().substring(0, 4));
        return false;
      }
    }
  }

  numberAndDecOnly(event, summaryIndex: number): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 && charCode !== 46 || charCode > 57)) {
      return false;
    }
    if (Util.isNullOrUndefined(this.staffVariance.staffVarianceSummaries[summaryIndex])) {
      return true;
    }
    const staffHours = this.staffVariance.staffVarianceSummaries[summaryIndex].additionalStaffHours;
    if (staffHours) {
      let selectedValue = '';
      selectedValue = this.getSelectedVal();
      if (staffHours.toString().indexOf('.') >= 0 && staffHours.toString().indexOf('.') < 4 && selectedValue.length === 0 && this.startValue > staffHours.toString().indexOf('.')) {
        const index = staffHours.toString().indexOf('.') + 2;
        if (staffHours.toString().charAt(index) !== '') {
          this.staffVariance.staffVarianceSummaries[summaryIndex].additionalStaffHours =
            parseFloat(staffHours.toString().substring(0, index) + staffHours.toString().charAt(index));
          return false;
        }
      }
      if (staffHours.toString().charAt(4) === ('.')) {
        this.staffVariance.staffVarianceSummaries[summaryIndex].additionalStaffHours = parseFloat(staffHours.toString().substring(0, 4));
        return false;
      }
    }

  }

  numberAndDecimalOnly(event, summaryIndex: number): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 && charCode !== 46 || charCode > 57)) {
      return false;
    }
    if (Util.isNullOrUndefined(this.staffVariance.staffVarianceSummaries[summaryIndex])) {
      return true;
    }
    const ogahr = this.staffVariance.staffVarianceSummaries[summaryIndex].offGridActivitiesHour;
    if (ogahr) {
      let selectedValue = '';
      selectedValue = this.getSelectedVal();
      if (ogahr.toString().indexOf('.') >= 0 && ogahr.toString().indexOf('.') < 4 && selectedValue.length === 0 && this.startValue > ogahr.toString().indexOf('.')) {
        const index = ogahr.toString().indexOf('.') + 2;
        if (ogahr.toString().charAt(index) !== '') {
          this.staffVariance.staffVarianceSummaries[summaryIndex].offGridActivitiesHour = parseFloat
          (ogahr.toString().substring(0, index) + ogahr.toString().charAt(index));
          return false;
        }
      }
      if (ogahr.toString().charAt(4) === ('.')) {
        this.staffVariance.staffVarianceSummaries[summaryIndex].offGridActivitiesHour = parseFloat(ogahr.toString().substring(0, 4));
        return false;
      }
    }


  }

  censusDialog(staffSummaryIndex: number, censusValue: number): void {

    let isCensusAvailable = false;
    const staffSummary: StaffVarianceSummary = this.staffVariance.staffVarianceSummaries[staffSummaryIndex];
    if (staffSummary) {
      if (!Util.isNullOrUndefined(staffSummary.plannedShifts) && staffSummary.plannedShifts.length>0) {
        for(const shiftMins  of staffSummary.plannedShifts) {
          if (shiftMins.objshift.staffGridCensuses) {
            for (const census of shiftMins.objshift.staffGridCensuses) {

              if (census.censusIndex == staffSummary.censusValue) {
                isCensusAvailable = true;
                staffSummary.isCensusvalid = true;
              }
            }
            if (!censusValue || !isCensusAvailable) {
              staffSummary.censusValue = null;
              staffSummary.additionalStaffHours = null;
              staffSummary.isCensusvalid = false;
              for (const staffVarianceDetail of staffSummary.staffVarianceDetails) {
                staffVarianceDetail.actualCount = null;
              }

            }

          }
        }
      } else if (censusValue >= this.planDetails.censusRange.minimumCensus && censusValue <= this.planDetails.censusRange.maximumCensus) {
        staffSummary.isCensusvalid = true;
        isCensusAvailable = true;
      } else {
        staffSummary.censusValue = null;
        staffSummary.additionalStaffHours = null;
        staffSummary.isCensusvalid = false;
        for (const staffVarianceDetail of staffSummary.staffVarianceDetails) {
          staffVarianceDetail.actualCount = null;
          staffVarianceDetail.scheduleCount = null;
        }
      }
    }
    if (!isCensusAvailable && censusValue) {
      this.openCensusDialog();
    }
  }

  openCensusDialog(): void {
    this.alertBox.openAlert('exit-dialog', '175px', '600px',
      'Enter new census value',  'Set correct census value.');
  }

  checkLength(elementId: string, comments: string, staffSummaryIndex: number): void {
    if (elementId.localeCompare('txtDiv') !== 0 && !Util.isNullOrUndefined(this.staffVariance.staffVarianceSummaries[staffSummaryIndex])) {
      this.staffVariance.staffVarianceSummaries[staffSummaryIndex].comments = comments;
      this.staffVariance.staffVarianceSummaries[staffSummaryIndex].commentsUpdatedBy = this.userService.user.lastName+', '+this.userService.user.firstName;
    }
    if (elementId.localeCompare('txtDiv') === 0 && !Util.isNullOrUndefined(this.staffVariance)) {
      this.staffVariance.comments = comments;
      this.staffVariance.commentsUpdatedBy = this.userService.user.lastName+', '+this.userService.user.firstName;
    }
    this.placeCaretAtEnd(document.getElementById(elementId));
  }

  placeCaretAtEnd(el): void {
    el.focus();
    if (typeof window.getSelection !== 'undefined'
      && typeof document.createRange !== 'undefined') {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  checkCommentsLength(index: number): boolean {
    if (index >= 0 && !Util.isNullOrUndefined(this.staffVariance.staffVarianceSummaries[index].comments) &&
      this.staffVariance.staffVarianceSummaries[index].comments.length > 500) {
      return true;
    }

    if (index < 0 && !Util.isNullOrUndefined(this.staffVariance.comments) &&
      this.staffVariance.comments.length > 500) {
      return true;
    }
    return false;
  }

  getTabIndex(index: number): number {
    if (Util.isNullOrUndefined(index)) {
      return 0;
    }
    index = index + 1;
    return index;
  }

  getTabIndexForTotal(staffvariance: StaffVarianceSummary[]): number {
    if (Util.isNullOrUndefined(staffvariance)) {
      return 0;
    } else {
      let length = staffvariance.length;
      length = length + 2;
      return length;
    }
  }

  clear(index: number): void {
    this.staffVariance.staffVarianceSummaries[index].censusValue = null;
  }

  getActualHeaderForCalculator(): void {

    if (this.staffVariance.selectedDate > this.staffVariance.recordDateForFuture) {
      this.actualValue = 'Scheduled';
      this.plannedValue = 'Expected';
      this.dateCheck = true;
    } else {
      this.actualValue = 'Actual';
      this.plannedValue = 'Planned';
      this.dateCheck = false;
    }
  }
}
