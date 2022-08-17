import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PlanDetails} from '../../../../shared/domain/plan-details';
import {SavePlanParams} from '../../../../shared/domain/save-plan-params';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {AlertBox} from '../../../../shared/domain/alert-box';
import {StaffGridCalculator} from '../../../../shared/domain/staff-grid-calculator';
import {Util} from "../../../../shared/util/util";
@Component({
  selector: 'app-census',
  templateUrl: './census.component.html',
  styleUrls: ['./census.component.scss']
})
export class CensusComponent implements OnInit {
  range: number;
  numberOfCols: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  numberOfRows: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  disable = false;
  occurPlcHolder = false;
  isApplyButton = false;
  isApplyButtonClicked = false;
  isCensusChangedWithAnnualhr = false;
  showOccuranceMsg: boolean;
  year: number;
  censusDays = 0;
  minCensus = 0;
  maxCensus = 0;
  addErrorMessage = true;
  previousCensusMax = 0;
  previousCensusMin = 0;
  previuosOccurnum: string[] = [];
  cmin = 0;
  cmax = 0;
  applyValMax = 0;
  applyValMin = 0;
  censusToggle : boolean = false;
  staffGridCalculator: StaffGridCalculator = new StaffGridCalculator();

  @Input('planUtilizedAvgVol') planUtilizedVal = 0;
  @Output() censusMinChange = new EventEmitter();
  @Output() censusMaxChange = new EventEmitter();
  @Output() occuranceChange = new EventEmitter();
  @Output() applyCensusMin = new EventEmitter();
  @Output() applyCensusMax = new EventEmitter();
  @Input('plan') plan: PlanDetails = new PlanDetails();
  @Input('objSavePlanParams') objSavePlanParams: SavePlanParams = new SavePlanParams();
  @Input('showOccurance') showOccurance: boolean;
  alertBox: AlertBox;

  initialFlag = false;
  occuranceFlag = false;


  constructor(private dialog: MatDialog) {
    this.plan = new PlanDetails();
    this.alertBox = new AlertBox(this.dialog);

  }

  getCensusValues(): void {
    this.previousCensusMax = this.plan.censusRange.maximumCensus;
    this.previousCensusMin = this.plan.censusRange.minimumCensus;
    this.previuosOccurnum = JSON.parse(JSON.stringify(this.plan.censusRange.occurrenceNumber));
    this.minCensus = this.plan.censusRange.minimumCensus;
    this.maxCensus = this.plan.censusRange.maximumCensus;
    if(this.plan.censusRange.occurrenceNumber.length){
      this.censusToggle = true;
    }
  }

  validateMinLength(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    this.objSavePlanParams.isSaveNextBtnSubmitForCensus = false;
    if (this.plan.censusRange.minimumCensus && this.plan.censusRange.minimumCensus.toString().length > 1) {
      return false;
    }
    return true;
  }

  validateMaxLength(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    this.objSavePlanParams.isSaveNextBtnSubmitForCensus = false;
    if (this.plan.censusRange.maximumCensus && this.plan.censusRange.maximumCensus.toString().length > 2 ) {
      return false;
    }
    return true;
  }

  isMaximise(){
    this.censusToggle = !this.censusToggle;
  }

  nodelete(event): boolean {
    return false;
  }

  onCensusMin(): void {
    this.showOccuranceMsg = false;
    this.objSavePlanParams.isSaveNextBtnSubmitForCensus = false;
    this.censusMinChange.emit(this.plan.censusRange.minimumCensus);
    this.disable = true;
    for (let i = 0; i < this.plan.censusRange.occurrenceNumber.length; i++) {
      if (i < this.plan.censusRange.minimumCensus - 1) {
        this.plan.censusRange.occurrenceNumber[i] = '0';
      }
    }
  }

  onCensusMax(): void {
    this.showOccuranceMsg = false;
    this.objSavePlanParams.isSaveNextBtnSubmitForCensus = false;
    this.censusMaxChange.emit(this.plan.censusRange.maximumCensus);
    this.disable = true;
    for (let i = 0; i < this.plan.censusRange.occurrenceNumber.length; i++) {
      if (i > this.plan.censusRange.maximumCensus - 1) {
        this.plan.censusRange.occurrenceNumber[i] = '0';
      }
    }
  }

  onOccuranceChange(): void {
    this.occuranceChange.emit(this.plan.censusRange.occurrenceNumber);
  }

  getCensusVal(): number {
    let sum = 0;
    for (const occurNum of this.plan.censusRange.occurrenceNumber) {
      if (Number(occurNum) > 0) {
        sum = (1 * sum) + (1 * Number(occurNum));
      }
    }
    this.year = new Date(this.plan.effectiveEndDate).getFullYear();
    this.findLeapYear(this.year);
    this.plan.censusRange.censusDays = this.censusDays - sum;
    // save error message if days crossing 365
    if (this.plan.censusRange.censusDays < 0) {
      const errorIndex: number = this.objSavePlanParams.validationErrorMessages.indexOf('Enter a value for annual occurrences that is less than the number of days in the year.');
      if (errorIndex < 0) {
        this.objSavePlanParams.validationErrorMessages.push('Enter a value for annual occurrences that is less than the number of days in the year.');
      }
    } else {
      // delete occurance error if exists
      const errorIndex: number = this.objSavePlanParams.validationErrorMessages.indexOf('Enter a value for annual occurrences that is less than the number of days in the year.');
      if (errorIndex !== -1) {
        this.objSavePlanParams.validationErrorMessages.splice(errorIndex, 1);
      }
    }
    return this.censusDays - sum;
  }


  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  ngOnInit() {
    if(this.plan.censusRange.maximumCensus === 0){
      this.plan.censusRange.maximumCensus = 2;
    }
    if(this.plan.censusRange.minimumCensus === 0){
      this.plan.censusRange.minimumCensus = 1;
    }
    this.getCensusValues();
    this.checkifcensusexists();
    this.findLeapYear(this.year);
    for (let index = 0; index < 100; index++) {
      if (Util.isNullOrUndefined(this.plan.censusRange.occurrenceNumber[index])) {
        this.plan.censusRange.occurrenceNumber[index] = '0';
      }
    }


  }

  findLeapYear(year: number): void {
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
      this.censusDays = 366;
    } else {
      this.censusDays = 365;
    }
  }

  checkifcensusexists(): void {
    if (this.plan.censusRange) {
      // check if min and max exists
      if (this.plan.censusRange.maximumCensus === 0 || this.plan.censusRange.minimumCensus === 0) {
        const errorIndex: number = this.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values for the Census Range. All values must be greater than zero.');
        if (errorIndex < 0) {
          this.objSavePlanParams.saveNextErrorMessages.push('Enter minimum and maximum values for the Census Range. All values must be greater than zero.');
        }
      }

      if (this.plan.censusRange.occurrenceNumber) {
        if (this.plan.censusRange.occurrenceNumber.length > 0) {
          this.addErrorMessage = false;
          this.applyToggle();
        } else {
          // if (this.plan.censusRange.maximumCensus > 0 || this.plan.censusRange.minimumCensus > 0) {
          const errorIndex: number = this.objSavePlanParams.saveNextErrorMessages.indexOf('Enter an Occurrence value.');
          if (errorIndex < 0) {
            this.objSavePlanParams.saveNextErrorMessages.push('Enter an Occurrence value.');
          }
        }
      }
    }

  }

  getVal(j): number {
    j = 5 * j;
    return j;
  }
  applyCensus(): void {
    this.objSavePlanParams.validationErrorMessages= [];
    for (let index = 0; index < 100; index++) {
      if (Util.isEmpty(this.plan.censusRange.occurrenceNumber[index])) {
        this.objSavePlanParams.isSaveNextBtnSubmitForCensus = true;
        this.showOccuranceMsg = true;
        return;
      }
    }
    this.onCensusMin();
    this.onCensusMax();
    this.isApplyButtonClicked = true;
    this.applyToggle();
    if(this.plan.censusRange.minimumCensus > 0){
      this.censusToggle = true;
    }
  }

  applyToggle(): void {
    if (this.plan.censusRange.maximumCensus <= 100) {
      this.applyValMax = this.plan.censusRange.maximumCensus;
    }
    this.cmin = this.plan.censusRange.minimumCensus;
    this.cmax = this.plan.censusRange.maximumCensus;
    this.applyCensusMin.emit(this.cmin);
    this.applyCensusMax.emit(this.cmax);
    this.objSavePlanParams.isCensusApplied = true;
    // Delete min max related errors

    this.deleteMinMaxErrors();


    // check for min max validation
    if (this.censusMinMaxValidation()) {
      const errorId: number = this.objSavePlanParams.saveNextErrorMessages.indexOf('Maximum value must be greater than the minimum value.');
      const errorIndex: number = this.objSavePlanParams.validationErrorMessages.indexOf('Maximum value must be greater than the minimum value.');
      if (errorIndex < 0) {
        this.objSavePlanParams.validationErrorMessages.push('Maximum value must be greater than the minimum value.');
        // this.objSavePlanParams.saveNextErrorMessages.splice(errorId,1);
      } else {
        this.objSavePlanParams.saveNextErrorMessages.splice(errorId, 1);
      }
    } else {
      const errorminmaxIndex: number = this.objSavePlanParams.validationErrorMessages.indexOf('Maximum value must be greater than the minimum value.');
      if (errorminmaxIndex !== -1) {
        this.objSavePlanParams.validationErrorMessages.splice(errorminmaxIndex, 1);
      }
      // delete occurance error if exists
      const errorIndex: number = this.objSavePlanParams.saveNextErrorMessages.indexOf('Enter an Occurrence value.');
      if (errorIndex !== -1) {
        this.objSavePlanParams.saveNextErrorMessages.splice(errorIndex, 1);
      }

      if (this.plan.censusRange.minimumCensus > 100 || this.plan.censusRange.maximumCensus > 100) {
        const errorIdx1: number = this.objSavePlanParams.saveNextErrorMessages.indexOf('Maximum and minimum value can not be greater than 100.');
        const errorIndx1: number = this.objSavePlanParams.validationErrorMessages.indexOf('Maximum and minimum value can not be greater than 100.');
        if (errorIndx1 < 0) {
          this.objSavePlanParams.validationErrorMessages.push('Maximum and minimum value can not be greater than 100.');
          // this.objSavePlanParams.saveNextErrorMessages.splice(errorId,1);
        } else {
          this.objSavePlanParams.saveNextErrorMessages.splice(errorIdx1, 1);
        }
      } else {
        const errorminmaxIndx: number = this.objSavePlanParams.validationErrorMessages.indexOf('Maximum and minimum value can not be greater than 100.');
        if (errorminmaxIndx !== -1) {
          this.objSavePlanParams.validationErrorMessages.splice(errorminmaxIndx, 1);
        }
      }




      // check for plan utilized volume limit
      if (this.censusPlanUtilizedAngVolume()) {
        this.addErrorMessage = true;
        const errorInd: number = this.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.');
        const errorIndex: number = this.objSavePlanParams.validationErrorMessages.indexOf('Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.');
        if (errorIndex < 0 && this.addErrorMessage && this.plan.censusRange.minimumCensus !== 0 &&
          this.plan.censusRange.maximumCensus !== 0) {
          this.objSavePlanParams.validationErrorMessages.push('Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.');
        } else if (errorIndex >= 0 && this.addErrorMessage && this.plan.censusRange.minimumCensus !== 0 &&
          this.plan.censusRange.maximumCensus !== 0) {
          this.objSavePlanParams.saveNextErrorMessages.splice(errorInd, 1);
        } else { // don't add error message when user clicks on a plan in process status and min and max census are 0.
          this.addErrorMessage = true;
 }

      } else {
        const errorIndexSN: number = this.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.');
        const errorIndex: number = this.objSavePlanParams.validationErrorMessages.indexOf('Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.');
        if (errorIndex !== -1) {
          this.objSavePlanParams.validationErrorMessages.splice(errorIndex, 1);
        } else if (errorIndexSN !== -1) {
          this.objSavePlanParams.saveNextErrorMessages.splice(errorIndexSN, 1);
        }
      }
    }
    const errorIdx: number = this.objSavePlanParams.saveNextErrorMessages.indexOf('Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.');
    const errorIndx: number = this.objSavePlanParams.validationErrorMessages.indexOf('Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.');
    if (errorIdx !== -1 && errorIndx !== -1) {
      this.objSavePlanParams.saveNextErrorMessages.splice(errorIdx, 1);
    }


    const errorId: number = this.objSavePlanParams.saveNextErrorMessages.indexOf('Maximum value must be greater than the minimum value.');
    const errorIndex: number = this.objSavePlanParams.validationErrorMessages.indexOf('Maximum value must be greater than the minimum value.');
    if (errorId !== -1 && errorIndex !== -1) {
      this.objSavePlanParams.saveNextErrorMessages.splice(errorId, 1);
    }
    // if(!this.isCensusChangedWithAnnualhr)
    if (this.plan.key) {
      if (this.previousCensusMax !== this.plan.censusRange.maximumCensus ||
        this.previousCensusMin !== this.plan.censusRange.minimumCensus) {
        if (this.plan.totalAnnualHours) {
          if (this.plan.totalAnnualHours > 0 && !this.isCensusChangedWithAnnualhr) {
            if (this.previousCensusMax>0 && this.previousCensusMax > this.plan.censusRange.maximumCensus ||
              this.previousCensusMin>0 && this.previousCensusMin < this.plan.censusRange.minimumCensus) {
              const alertMessage = 'Deleting the Census range will impact Staffing Grid data you previously entered and saved. \n' +
                '\n' +
                'Click Confirm if you are sure you want to continue. \n';
              const dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', '190px', '600px',
                'Plan Setup - Census', alertMessage);
              document.body.classList.add('pr-modal-open');

              dialogRef.afterClosed().subscribe(result => {
                if (!result) {
                  this.plan.censusRange.maximumCensus = this.previousCensusMax;
                  this.plan.censusRange.minimumCensus = this.previousCensusMin;
                  this.plan.censusRange.occurrenceNumber = this.previuosOccurnum;
                  this.ngOnInit();

                } else {
                  this.isCensusChangedWithAnnualhr = true;
                  this.setCensusData();
                }
                document.body.classList.remove('pr-modal-open');


                if (this.censusPlanUtilizedAngVolume()) {
                  const errorIndex: number = this.objSavePlanParams.validationErrorMessages.indexOf('Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.');
                  if (errorIndex < 0 && this.addErrorMessage) {
                    this.objSavePlanParams.validationErrorMessages.push('Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.');
                  } else { // don't add error message when user clicks on a plan in process status and min and max census are 0.
                    this.addErrorMessage = true;
                  }

                } else {
                  const errorIndex: number = this.objSavePlanParams.validationErrorMessages.indexOf('Enter minimum and maximum values that are within the Plan Utilized Daily Volume range or update the volume range.');
                  if (errorIndex !== -1) {
                    this.objSavePlanParams.validationErrorMessages.splice(errorIndex, 1);
                  }
                }
              });
            } else {
              this.setCensusData();
            }
          } else {
            this.setCensusData();
          }
        } else {
          this.setCensusData();
        }
      } else {
        this.setCensusData();
      }
    } else {
      this.setCensusData();
    }


  }

  setCensusData(): void {
    this.isApplyButton = true;
    this.occurPlcHolder = true;
    this.disable = true;
    this.showOccuranceMsg = false;
    this.minCensus = this.plan.censusRange.minimumCensus;
    this.maxCensus = this.plan.censusRange.maximumCensus;
    this.onCensusMax();
    this.onCensusMin();
  }

  resetCensusBox(event): void {
    for (let i = 0; i < this.plan.censusRange.occurrenceNumber.length; i++) {
      this.plan.censusRange.occurrenceNumber[i] = '0';
    }
    this.findLeapYear(this.year);
  }

  isOccuranceCensus(): boolean {
    if (this.plan.censusRange.minimumCensus > 0 && this.plan.censusRange.maximumCensus > 0) {
      for (let i = this.plan.censusRange.minimumCensus - 1; i < this.plan.censusRange.maximumCensus; i++) {
        if (this.plan.censusRange.occurrenceNumber[i] === '' ||
          this.plan.censusRange.occurrenceNumber[i] === null || this.plan.censusRange.occurrenceNumber[i] === undefined) {
          this.objSavePlanParams.isSaveNextBtnSubmitForCensus = true;
          this.showOccuranceMsg = true;
          return true;
        }
      }
      if (!this.plan.censusRange.occurrenceNumber || this.plan.censusRange.occurrenceNumber.length < 1) {
        this.objSavePlanParams.isSaveNextBtnSubmitForCensus = true;
        this.showOccuranceMsg = true;
        return true;
      }
    }
    return false;
  }

  censusPlanUtilizedAngVolume(): boolean {
    let currentCalendarYearTotalDays = this.staffGridCalculator.getCurrentCalendarYearTotalDays(this.plan.effectiveEndDate);
    let planUtilizedVal:number;
    if(!Util.isNullOrUndefined(this.plan.dailyFlag))
    {
    if(this.plan.dailyFlag)
    planUtilizedVal = this.plan.utilizedAverageVolume;
    else
    planUtilizedVal = this.plan.utilizedAverageVolume / currentCalendarYearTotalDays;
    }
    else
    {
      planUtilizedVal=this.plan.utilizedAverageVolume;
    }
    if ((planUtilizedVal <= this.plan.censusRange.minimumCensus) ||
      (planUtilizedVal >= this.plan.censusRange.maximumCensus) || !planUtilizedVal) {
      this.objSavePlanParams.isSaveNextBtnSubmitForCensus = true;
      return true;
    } else {
      return false;
    }
  }

  censusMaxCheck(): boolean {
    if (this.plan.censusRange.maximumCensus > 100 || this.plan.censusRange.minimumCensus > 100) {
      return true;
    } else {
      return false;
    }
  }

  isCensusChanges(): boolean {
    if (Util.isNullOrUndefined(this.plan.censusRange.minimumCensus) || Util.isNullOrUndefined(this.plan.censusRange.maximumCensus)) {
      this.showOccuranceMsg = true;
      return true;
    }
    if (((this.plan.censusRange.minimumCensus === 0 || this.plan.censusRange.minimumCensus < 0 ||
      this.plan.censusRange.minimumCensus === undefined)
      && (this.plan.censusRange.maximumCensus === 0 || this.plan.censusRange.maximumCensus < 0 ||
        this.plan.censusRange.maximumCensus === undefined)) ||
      (this.plan.censusRange.minimumCensus === 0 || this.plan.censusRange.minimumCensus < 0 ||
        this.plan.censusRange.minimumCensus === undefined) ||
      (this.plan.censusRange.maximumCensus === 0 || this.plan.censusRange.maximumCensus < 0 ||
        this.plan.censusRange.maximumCensus === undefined)) {
      this.showOccuranceMsg = true;

      return true;
    } else {
      this.showOccuranceMsg = false;
      return false;
    }
  }

  censusMinMaxValidation(): boolean {
    if ((this.plan.censusRange.maximumCensus !== 0 && this.plan.censusRange.minimumCensus !== 0) &&
      (this.plan.censusRange.minimumCensus >= this.plan.censusRange.maximumCensus ||
        this.plan.censusRange.maximumCensus <= this.plan.censusRange.minimumCensus)) {
      return true;
    } else {
      return false;
    }
  }

  checkCensusValues(censusValue: any): void {
    this.isApplyButton = true;
    for (const element of this.plan.censusRange.occurrenceNumber) {
      if (element === '') {
        this.objSavePlanParams.isSaveNextBtnSubmitForCensus = true;
        this.showOccuranceMsg = true;
        break;
      }
    }
    this.initialFlag = true;

    this.deleteMinMaxErrors();
  }

  checkOccurance(occuranceValue: string): void {
    let isOccuranceHasnull = false;
    for (const element of this.plan.censusRange.occurrenceNumber) {
      if (element === '') {
        isOccuranceHasnull = true;
        const errorIndex: number = this.objSavePlanParams.saveNextErrorMessages.indexOf('Enter an Occurrence value.');
        if (errorIndex < 0) {
          this.objSavePlanParams.saveNextErrorMessages.push('Enter an Occurrence value.');
        }
      }
    }
    if (!isOccuranceHasnull) {
      const errorIndex: number = this.objSavePlanParams.saveNextErrorMessages.indexOf('Enter an Occurrence value.');
      if (errorIndex !== -1) {
        this.objSavePlanParams.saveNextErrorMessages.splice(errorIndex, 1);
      }
    }

  }

  checkMinMaxCensus(censusRangeMaxValue: number, censusRangeMinValue: number): boolean {
    return this.initialFlag && censusRangeMaxValue != null && censusRangeMinValue != null;
  }

  checkCensusDatas(): boolean {
    return (this.isOccuranceCensus() || this.isCensusChanges() || this.censusMinMaxValidation()) && this.showOccuranceMsg;
  }

  deleteMinMaxErrors(): void {
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
  
  onPasteMinCensus(event){
    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text');
    let trimmedText = pastedText.replace(/[^0-9]/g, '');
    this.plan.censusRange.minimumCensus = trimmedText;
  }

  onPasteMaxCensus(event){
    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text');
    let trimmedText = pastedText.replace(/[^0-9]/g, '');
    this.plan.censusRange.maximumCensus = trimmedText;
  }
  
}
export class Occurrence {
  census: number;
  occurrence: number;

  constructor(census) {
    this.census = census;
  }
}
