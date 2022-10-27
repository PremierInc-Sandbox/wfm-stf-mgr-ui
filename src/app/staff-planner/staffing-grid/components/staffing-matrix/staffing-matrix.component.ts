import {Component, OnInit, Input, DoCheck} from '@angular/core';
import {PlanDetails} from '../../../../shared/domain/plan-details';
import {
  StaffSchedule,
  StaffGridCensus,
  staffToPatient,
  shift,
  shifttime
} from '../../../../shared/domain/staff-schedule';
import {StaffingMatrixSummaryData} from '../../../../shared/domain/staffing-matrix-summary';
import {NonVariableDepartmentPosition} from '../../../../shared/domain/non-var-postn';
import {OffGridActivities} from '../../../../shared/domain/off-grid-activities';
import {StaffGridCalculator} from '../../../../shared/domain/staff-grid-calculator';
import {PdfDataService} from '../../../../shared/service/pdf-data.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {PromptDialogComponent} from '../../../../shared/components/prompt-dialog/prompt-dialog.component';
import {AlertBox} from '../../../../shared/domain/alert-box';
import {Util} from "../../../../shared/util/util";

@Component({
  selector: 'app-staffing-matrix',
  templateUrl: './staffing-matrix.component.html',
  styleUrls: ['./staffing-matrix.component.scss']
})
export class StaffingMatrixComponent implements OnInit, DoCheck {
  @Input('scheduleData') scheduleData: StaffSchedule = new StaffSchedule();
  @Input('planDetails') planDetails: PlanDetails = new PlanDetails();
  schLabel: string;
  objSchedule: StaffSchedule;
  cenRange: number[];
  strScheduledata: string;
  scheduleIndex = -1;
  sortOrder = 'DESC';
  flag = false;

  daysInPlan = 0;
  daysInYear = 365;
  nonVarTotalhours = 0;
  ogatotalhours = 0;
  lstStaffingMatrixSummaryData: StaffingMatrixSummaryData[] = [];
  staffGridCalculator: StaffGridCalculator = new StaffGridCalculator();

  minCensusSaved = 0;
  maxCensusSaved = 0;

  shiftTimeString: string[] = [];
  alertBox: AlertBox;
  copyFromScheduleKey = 'default';

  distinctScheduleList: StaffSchedule[] = [];

  copyToShiftKey = 'default';

  constructor(private pdfDataService: PdfDataService, private dialog: MatDialog) {
    this.alertBox = new AlertBox(this.dialog);

  }

  ngOnInit(): void {
    this.strScheduledata = JSON.stringify(this.scheduleData);
    this.scheduleIndex = this.planDetails.staffScheduleList.indexOf(this.scheduleData);
    this.populateData();
    this.getSummaryData();
    this.getDistinctSchedules();
  }
  getColSpan(objShift: shift) {
    let colSpan = 0;
    for (const stp of objShift.staffToPatientList) {
        if (stp.activeFlag) {
          colSpan += 1;
        }
      }
    if (objShift.activeFlag) {
     return colSpan + 1;
   } else {
     return colSpan;
   }
  }
  getDistinctSchedules(): void {
    this.distinctScheduleList = this.planDetails.staffScheduleList.filter(schedule => schedule.key !== this.scheduleData.key);
  }

  getShiftTimeString(shiftIndex: number): string {
    if (this.shiftTimeString.length < 1) {
      for (const shift of this.scheduleData.planShiftList) {
        this.shiftTimeString.push(this.getShiftTime(shift));
      }
    }

    return this.shiftTimeString[shiftIndex];
  }
  resetForm(): void {

    const alertMessage = 'Updates will not be saved if you reset the plan to its original state. Are you sure you want to continue?';
    const dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', '190px' , '600px',
      'Staffing Grid', alertMessage);

    document.body.classList.add('pr-modal-open');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.scheduleData = JSON.parse(this.strScheduledata);
        this.planDetails.staffScheduleList[this.scheduleIndex] = this.scheduleData;
        this.populateData();
      }
      document.body.classList.remove('pr-modal-open');
    });
  }

  getShifttime(objShift: shift): shifttime {
    const objshifttime: shifttime = new shifttime();
    const oldFormatFlag = objShift.timeFormatFlag;
    objshifttime.startTime.hours = Number(objShift.startTime.split(':')[0]);
    objshifttime.startTime.mins = Number(objShift.startTime.split(':')[1]);
    objshifttime.endTime.hours = (1 * objshifttime.startTime.hours) + (1 * objShift.hours);
    objshifttime.endTime.mins = objshifttime.startTime.mins;
    while (objshifttime.endTime.hours >= 24) {
      objshifttime.endTime.hours = objshifttime.endTime.hours - 24;
      // objShift.timeFormatFlag = !objShift.timeFormatFlag;
    }

    if (objShift.timeFormatFlag) {
      objshifttime.timeformatflag = 'AM';
    } else {
      objshifttime.timeformatflag = 'PM';
    }

    while (objshifttime.startTime.hours >= 12 && oldFormatFlag) {
        objshifttime.startTime.hours = objshifttime.startTime.hours - 12;
    }


    return objshifttime;
  }

  pad(num: number, size: number, isHour: boolean): string {
    let s = num + '';
    while (s.length < size) {
      if (s === '0' && isHour) {
        s = '00';
      } else {
        s = '0' + s;
      }
       }
    return s;
  }

  getTotal(objstaffGridCensus: StaffGridCensus): number {
    let sum = 0;
    for (const objstaffToPatient of objstaffGridCensus.staffToPatientList) {
      sum = (1 * sum) + (1 * objstaffToPatient.staffCount);
    }
    return sum;
  }

  checkIsIncluded(varposkey: number , variablePositionCategoryDescription: String): boolean {
    let isIncluded = false;
    // return this.planDetails.varPosition.filter(ele=>ele.categoryKey===varposkey)[0].includeFlag
    for (const objVarpos of this.planDetails.variableDepartmentPositions) {
      if (objVarpos.categoryKey === varposkey && objVarpos.categoryDescription === variablePositionCategoryDescription) {
        isIncluded = objVarpos.includedInNursingHoursFlag;
      }
    }

    return isIncluded;
  }

  getShiftTime(objshift: shift): string {
    let shiftTiming: string;
    const oldFormatFlag = objshift.timeFormatFlag;
    const objshifttime: shifttime = this.getShifttime(objshift);
    shiftTiming = this.pad(objshifttime.startTime.hours, 2, true) + ':' + this.pad(objshifttime.startTime.mins, 2, false);
    shiftTiming = shiftTiming + ' - ' + this.pad(objshifttime.endTime.hours, 2, true) + ':'
      + this.pad(objshifttime.endTime.mins, 2, false);

    return shiftTiming;

  }

  getAverage(objstaffGridCensus: StaffGridCensus) {
    let sum = 0;
    for (const objstaffToPatient of objstaffGridCensus.staffToPatientList) {
      if (this.checkIsIncluded(objstaffToPatient.variablePositionKey, objstaffToPatient.variablePositionCategoryDescription)) {
        sum = (1 * sum) + (1 * objstaffToPatient.staffCount);
      }

    }
    if (sum === 0) {
      return sum;
    } else {
      return (objstaffGridCensus.censusIndex / sum).toFixed(2);
    }
  }

  checkProductivityIndex(cenProductivityIndex: number): boolean {
    //Get lowEntTarget and upperEndTarget value from plan setup page, in future it will be dynamic value
    if (Util.isNullOrUndefined(this.planDetails.lowerEndTarget && this.planDetails.upperEndTarget)) {
      this.planDetails.lowerEndTarget = 100;
      this.planDetails.upperEndTarget = 120;
    }
    const objCenProductivityIndex = cenProductivityIndex * 100;
    if (objCenProductivityIndex >= this.planDetails.lowerEndTarget && objCenProductivityIndex <= this.planDetails.upperEndTarget) {
      return true;
    } else {
      return false;
    }
  }


  populateData(): void {
    if (this.planDetails.censusRange) {
      this.cenRange = [];
      const crMin = this.planDetails.censusRange.minimumCensus;
      const crMax = this.planDetails.censusRange.maximumCensus;
      for (let j = crMin; j <= crMax; j++) {
        this.cenRange.push(j);
      }
    }

    for (const shift of this.scheduleData.planShiftList) {
      // if staffgridcensus value is null
      if (!shift.staffGridCensuses || shift.staffGridCensuses.length === 0) {

        shift.staffGridCensuses = [];

        let cenValPos = 0;
        for (const cen of this.cenRange) {

          const objstaffGridCensus = new StaffGridCensus();
          objstaffGridCensus.censusIndex = cen;
          objstaffGridCensus.censusValue = Number(this.planDetails.censusRange.occurrenceNumber[cen - 1]);
          for (const objstaffToPatient of shift.staffToPatientList) {
            let stpval = 1;
            const objnewStaffToPatient: staffToPatient = new staffToPatient();
            objnewStaffToPatient.variablePositionCategoryAbbreviation = objstaffToPatient.variablePositionCategoryAbbreviation;
            objnewStaffToPatient.variablePositionCategoryDescription = objstaffToPatient.variablePositionCategoryDescription;
            objnewStaffToPatient.variablePositionKey = objstaffToPatient.variablePositionKey;
            // objnewStaffToPatient.varpostval=objstaffToPatient.varpostval;

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
        while (this.maxCensusSaved <= this.planDetails.censusRange.maximumCensus) {
          const cen = this.maxCensusSaved;
          const objstaffGridCensus = new StaffGridCensus();
          objstaffGridCensus.censusIndex = cen;
          objstaffGridCensus.censusValue = Number(this.planDetails.censusRange.occurrenceNumber[cen - 1]);

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
        while (this.minCensusSaved >= this.planDetails.censusRange.minimumCensus) {
          isMinCensusReduced = true;
          const cen = this.minCensusSaved;
          const objstaffGridCensus = new StaffGridCensus();
          objstaffGridCensus.censusIndex = cen;
          objstaffGridCensus.censusValue = Number(this.planDetails.censusRange.occurrenceNumber[cen - 1]);

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
        shift.staffGridCensuses.sort(this.sortCensus);


      }
    }
      shift.staffGridCensuses = shift.staffGridCensuses.sort((o1, o2) => o2.censusIndex - o1.censusIndex);
      this.orderStafftoPatientByVarpos(shift);
      for (const shiftstp of shift.staffToPatientList) {
       for (const stpCens of shift.staffGridCensuses) {
         for (const stp of stpCens.staffToPatientList) {
             if (stp.variablePositionKey === shiftstp.variablePositionKey && stp.variablePositionCategoryDescription === shiftstp.variablePositionCategoryDescription){
               stp.activeFlag = shiftstp.activeFlag;
             }
         }
       }
     }
      }
  }
  orderStafftoPatientByVarpos(objShift: shift): void {
    const staffToPatientList: staffToPatient[] = [];
    this.planDetails.variableDepartmentPositions.forEach(ele => {
      const objstaffToPatient = objShift.staffToPatientList.filter(eleStaff => eleStaff.variablePositionKey === ele.categoryKey && eleStaff.variablePositionCategoryDescription === ele.categoryDescription)[0];
      if (objstaffToPatient) {
       staffToPatientList.push(objstaffToPatient);
       }
      });
    objShift.staffToPatientList = staffToPatientList;

    for (const staffGridCensus of objShift.staffGridCensuses) {
    const saffGridCensusActivities: staffToPatient[] = [];
    this.planDetails.variableDepartmentPositions.forEach(ele => {
       const objStaffGridCensus = staffGridCensus.staffToPatientList.filter
       (eleStaff => eleStaff.variablePositionKey === ele.categoryKey && eleStaff.variablePositionCategoryDescription === ele.categoryDescription)[0];
       if (objStaffGridCensus) {
       saffGridCensusActivities.push(objStaffGridCensus);
       }
      });
    staffGridCensus.staffToPatientList = saffGridCensusActivities;
    }
  }

  checkIfCensusangeIncreased(objshift: shift): boolean {
    const censusData = this.alertBox.checkIfCensusangeIncreased(objshift, this.planDetails);
    const isCensusangeIncreased = Boolean(censusData.pop());
    this.maxCensusSaved = Number(censusData.pop());
    this.minCensusSaved = Number(censusData.pop());
    return isCensusangeIncreased;
  }

  getSummaryData(): void {
    this.planDetails = this.staffGridCalculator.getSummaryData(this.planDetails);
  }

  ngDoCheck(): void {
    this.getSummaryData();
  }
  captureStaffingScreen(): void {
    const fileName = this.planDetails.departmentCode + ' - ' + this.planDetails.name + ' - ' + this.scheduleData.name;
    this.pdfDataService.createPdf(this.planDetails, this.scheduleData.key, this.sortOrder.toLowerCase(), fileName);
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  sortByCensus(): void {

    for (const objshift of this.scheduleData.planShiftList) {
      if (this.sortOrder === 'ASC') {
        objshift.staffGridCensuses.sort(this.sortAscending);
      } else if (this.sortOrder === 'DESC') {
        objshift.staffGridCensuses.sort(this.sortCensus);
 }
    }
    if (this.sortOrder === 'ASC') {
      this.sortOrder = 'DESC';
    } else if (this.sortOrder === 'DESC') {
      this.sortOrder = 'ASC';
 }

  }
  sortCensus(a, b): 1 | -1 | 0 {
    return (a.censusIndex > b.censusIndex) ? 1 : (a.censusIndex < b.censusIndex) ? -1 : 0;
  }
  sortAscending(a, b): 1 | -1 | 0 {
    return (a.censusIndex < b.censusIndex) ? 1 :
      (a.censusIndex > b.censusIndex) ? -1 : 0;
  }



  roundAverage(value: number): number {
    return parseInt(value.toString(), 10);
  }

  check(value: number): boolean {
    return isFinite(value);
  }

  duplicateTimePeriod(shiftData: shift, event): void {
    let currentStaffGridCensusString: string;
    for (const fromStaffGridCensus of shiftData.staffGridCensuses) {
      for (const planShift of this.scheduleData.planShiftList) {
        if (planShift.key.toString() === this.copyToShiftKey) {
          for (const toStaffGridCensus of planShift.staffGridCensuses) {
            if (fromStaffGridCensus.censusIndex === toStaffGridCensus.censusIndex) {
              currentStaffGridCensusString = JSON.stringify(fromStaffGridCensus.staffToPatientList);
              toStaffGridCensus.staffToPatientList = JSON.parse(currentStaffGridCensusString);
            }
          }
        }
      }
    }
    setTimeout(() => {
        event.target.value = 'default';
      },
      5000);
    this.copyToShiftKey = 'default';
  }

checkPatientToStaffEnabled(shiftObj: shift, timePeriod: shift): boolean {
    let isJobCodeInactive = false;
    for (const staffToPatientData of shiftObj.staffToPatientList) {
        for (const stp of timePeriod.staffToPatientList) {
          if (timePeriod.key !== shiftObj.key) {
            if (staffToPatientData.variablePositionKey === stp.variablePositionKey && staffToPatientData.variablePositionCategoryDescription === stp.variablePositionCategoryDescription) {
              if ((staffToPatientData.activeFlag && !stp.activeFlag) || (!staffToPatientData.activeFlag && stp.activeFlag)) {
                  return true;
              } else {
                isJobCodeInactive = false;
              }
            }
          }
       }
    }
    return isJobCodeInactive;
  }

  checkShiftCount(schedule: StaffSchedule): boolean {
    const canCopySchedule = false;
    // skip the same schedule
    if (schedule.key === this.scheduleData.key) {
      return true;
    }
    // skip if the shift counts mis match
    if (schedule.planShiftList.length !== this.scheduleData.planShiftList.length) {
      return true;
    } else {
      return false;
    }

    return canCopySchedule;
  }
  compareObjects(o1: any, o2: any): boolean {
    return o1 === o2;
  }

  getDailyVarianceHoursForCensus(census: number): string {
    let dailyVarianceHrstoTarget = 0;
    let resultData;
    const staffSummarData = this.planDetails.staffingSummaryData;
    if (!Util.isNullOrUndefined(staffSummarData)) {
      const data = staffSummarData.filter(summaryData => summaryData.census === census);
      for (const summaryData of staffSummarData) {
        if (summaryData.census === census) {
          dailyVarianceHrstoTarget = summaryData.dailyHrsVarToTarget;
          break;
        }
      }
    }
    if (dailyVarianceHrstoTarget < 0) {
      dailyVarianceHrstoTarget = dailyVarianceHrstoTarget * -1;
      resultData = '(' + dailyVarianceHrstoTarget.toFixed(2) + ')';
    } else {
      resultData = dailyVarianceHrstoTarget.toFixed(2);
    }

    return resultData;
  }
}

