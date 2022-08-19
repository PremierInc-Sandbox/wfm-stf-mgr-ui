import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {
  ScheudleErrors,
  shift,
  shifttime,
  StaffSchedule,
  staffToPatient
} from '../../../../shared/domain/staff-schedule';
import {PlanDetails} from '../../../../shared/domain/plan-details';
import { MatDialog } from '@angular/material/dialog';
import {MatDialogConfig} from '@angular/material/dialog';
import {PromptDialogComponent} from '../../../../shared/components/prompt-dialog/prompt-dialog.component';
import {AlertBox} from '../../../../shared/domain/alert-box';
import {CustomError} from '../../../../shared/domain/var-pos';
import {Util} from "../../../../shared/util/util";
@Component({
  selector: 'app-schedule-shift',
  templateUrl: './schedule-shift.component.html',
  styleUrls: ['./schedule-shift.component.scss']
})
export class ScheduleShiftComponent implements OnInit, OnChanges {
  maxIndex = 0;
  @Input('objShift') objShift: shift = new shift();
  @Input('objSchedule') objSchedule: StaffSchedule = new StaffSchedule();
  @Input('planDetails') planDetails: PlanDetails = new PlanDetails();
  @Output() onclick: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onPlanShiftExpanse: EventEmitter<number> = new EventEmitter<number>();
  objScheudleErrors: ScheudleErrors = new ScheudleErrors();
  errormsg = '';
  error: CustomError = new CustomError();
  alertBox: AlertBox;
  isPlanEdited = false;
  shiftTimeError = '';
  staffToPatientCount = [];
  constructor(private dialog: MatDialog) {
    this.alertBox = new AlertBox(this.dialog);
  }

  ngOnInit() {
    this.objShift.staffToPatientList.forEach( (list, index) => {
      if (Util.isNullOrUndefined(list.activeFlag)) {
        this.objShift.staffToPatientList[index].activeFlag = false;
      }
    });
  }

  ngOnChanges() {
  }

  duplicateShift(): void {
    this.addShift(true);
  }
  addShift(isDuplicate: boolean): void {
    this.validateshift(this.objShift);
    if (this.objShift.errormsg) {
      if (this.objShift.errormsg.length > 0) {
        return;
      }
    }

    this.isPlanEdited = true;
    this.onclick.emit(true);
    if (!this.objSchedule.planShiftList) {
      this.objSchedule.planShiftList = [];
    }

    if (this.objSchedule.planShiftList.length === 0) {
      this.objSchedule.planShiftList.push(this.objShift);
    }
    this.objSchedule.planShiftList.forEach(ele => {
      ele.last = false;
    });

    const objnewShift: shift = new shift();
    objnewShift.last = true;
    if (isDuplicate) {
      const index = this.objSchedule.planShiftList.findIndex(ele => ele.name === this.objShift.name);
      objnewShift.activeFlag = this.objSchedule.planShiftList[index].activeFlag;
      const strStaffToPatient: string = JSON.stringify(this.objSchedule.planShiftList[index].staffToPatientList);
      objnewShift.staffToPatientList = JSON.parse(strStaffToPatient);
    } else {
      this.objShift.staffToPatientList.forEach(ele => {
        const objstaffToPatient: staffToPatient = new staffToPatient();
        objstaffToPatient.variablePositionCategoryAbbreviation = ele.variablePositionCategoryAbbreviation;
        objstaffToPatient.variablePositionCategoryDescription = ele.variablePositionCategoryDescription;
        objstaffToPatient.variablePositionKey = ele.variablePositionKey;
        objstaffToPatient.activeFlag = false;
        objnewShift.activeFlag = false;
        objnewShift.staffToPatientList.push(objstaffToPatient);
      });
    }

    objnewShift.startTime = '07:00';
    objnewShift.hours = 12;
    const index = this.objSchedule.planShiftList.findIndex(ele => ele.name === this.objShift.name);
    this.objSchedule.planShiftList.splice(index + 1, 0, objnewShift);
    this.onPlanShiftExpanse.emit(index + 1);
  }

  validateShiftName(objcShift: shift): void {
    let currentIndex: number;
    currentIndex = this.objSchedule.planShiftList.indexOf(objcShift);

    if (!objcShift.name || objcShift.name === '' || objcShift.name === null) {
      this.objShift.HasError = true;
      this.addToShiftErrors(this.objScheudleErrors.errmsg_empty_shiftname);
    } else {
      this.objShift.HasError = this.removeFromShiftErrors(this.objScheudleErrors.errmsg_empty_shiftname);
    }

    if (this.objSchedule.planShiftList.filter(e => e.name.toUpperCase() === this.objShift.name.toUpperCase()).length > 1) {
      this.objShift.HasError = true;
      this.addToShiftErrors(this.objScheudleErrors.errmsg_duplicate_shiftname);
    } else {
      let selectedIndex: number;
      selectedIndex = this.objSchedule.planShiftList.indexOf(this.objShift);

      if (selectedIndex === currentIndex) {
        this.objShift.HasError = this.removeFromShiftErrors(this.objScheudleErrors.errmsg_duplicate_shiftname);
      } else {
        this.removeFromgivenShiftErrors(this.objScheudleErrors.errmsg_duplicate_shiftname, objcShift);
      }

      for (const objTempShift of this.objSchedule.planShiftList) {
        if (objTempShift.errormsg) {
          if (objTempShift.errormsg.indexOf(this.objScheudleErrors.errmsg_duplicate_shiftname) > -1) {
            this.validateShiftName(objTempShift);
          }
        }
      }
    }
  }

  ValidateShifttime(objShift: shift): void {
    let isShiftTimeExceeds = false;
    let currentIndex: number;
    currentIndex = this.objSchedule.planShiftList.indexOf(objShift);
    isShiftTimeExceeds = this.alertBox.isTotalHoursExceed(this.objSchedule.planShiftList);

    if (isShiftTimeExceeds) {
      let shiftIndex = this.alertBox.getMaxShiftIndex(this.objSchedule.planShiftList);
      let currentIndex = this.objSchedule.planShiftList.indexOf(objShift);
      shiftIndex.map( position =>{
        if(position === currentIndex){
          objShift.HasError = true;
          this.addToShiftErrors(this.objScheudleErrors.errmsg_time_diff_exceeds);
        }
      });
      let position = shiftIndex.filter( key => key === currentIndex);
      if(!position.length){
        objShift.HasError = false;
        this.removeFromgivenShiftErrors(this.objScheudleErrors.errmsg_time_diff_exceeds, objShift);
      }
    } else {
      let selectedIndex: number;
      selectedIndex = this.objSchedule.planShiftList.indexOf(this.objShift);

      if (selectedIndex === currentIndex) {
        this.objShift.HasError = this.removeFromShiftErrors(this.objScheudleErrors.errmsg_time_diff_exceeds);
      } else {
        this.removeFromgivenShiftErrors(this.objScheudleErrors.errmsg_time_diff_exceeds, objShift);
      }

      for (const objTempShift of this.objSchedule.planShiftList) {
        if (objTempShift.errormsg) {
          if (objTempShift.errormsg.indexOf(this.objScheudleErrors.errmsg_time_diff_exceeds) > -1) {
            this.ValidateShifttime(objTempShift);
          }
        }
      }
    }
  }

  getShifttime(objShift: shift): shifttime {
    return this.alertBox.getShifttime(objShift);
  }

  validateShiftLength(event): boolean {
    this.numberOnly(event);
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 43 || charCode === 45 || charCode === 46) {
      return false;
    } else {
      if (this.objShift.hours) {
        if (this.objShift.hours.toString().length > 2) {
          return false;
        } else {
          return true;
        }
      }
    }
  }

  togglePatient(index){
    if(!this.objShift.staffToPatientList[index].activeFlag){
      this.objShift.staffToPatientList[index].staffCount = 0;
    }
  }

  validatehour(objshift: shift): boolean {

    if (objshift.hours === 0 || !objshift.hours) {
      this.objShift.HasError = true;
      this.addToShiftErrors(this.objScheudleErrors.errmsg_empty_shifthour);
    } else {
      this.objShift.HasError = this.removeFromShiftErrors(this.objScheudleErrors.errmsg_empty_shifthour);
    }

    const hours = objshift.hours;

    if (hours > 24) {
      this.objShift.HasError = true;
      this.addToShiftErrors(this.objScheudleErrors.errmsg_exceeds_shifthour);
    } else {
      this.objShift.HasError = this.removeFromShiftErrors(this.objScheudleErrors.errmsg_exceeds_shifthour);
      for (const objTempShift of this.objSchedule.planShiftList) {
        if (objTempShift.errormsg) {
          if (objTempShift.errormsg.indexOf(this.objScheudleErrors.errmsg_exceeds_shifthour) > -1) {
            this.removeFromgivenShiftErrors(this.objScheudleErrors.errmsg_exceeds_shifthour, objTempShift);
          }
        }
      }
    }
    if (hours === 24) {
      this.objSchedule.HasError = this.removeFromScheduleErrors(this.objScheudleErrors.errmsg_total_shifthour, this.objSchedule);
    }

    if (hours === 0 || !hours) {
      this.objShift.HasError = true;
      this.addToShiftErrors(this.objScheudleErrors.errmsg_empty_shifthour);
    } else {
      this.objShift.HasError = this.removeFromShiftErrors(this.objScheudleErrors.errmsg_empty_shifthour);
    }
    this.ValidateShifttime(this.objShift);
    return true;
  }

  validateshift(objnewShift: shift): void {
// check name
    if (objnewShift.name === '') {
      this.objShift.HasError = true;
      this.addToShiftErrors(this.objScheudleErrors.errmsg_empty_shiftname);
    } else {
      this.objShift.HasError = this.removeFromShiftErrors(this.objScheudleErrors.errmsg_empty_shiftname);
    }

// check shift hours
    if (objnewShift.hours === 0) {
      this.objShift.HasError = true;
      this.addToShiftErrors(this.objScheudleErrors.errmsg_empty_shifthour);
    } else {
      this.objShift.HasError = this.removeFromShiftErrors(this.objScheudleErrors.errmsg_empty_shifthour);
    }

// look for duplicate shifts
    if (this.objSchedule.planShiftList.filter(e => e.name.toUpperCase() === objnewShift.name.toUpperCase()).length > 1) {
      this.objShift.HasError = true;
      this.addToShiftErrors(this.objScheudleErrors.errmsg_duplicate_shiftname);
    } else {
      this.objShift.HasError = this.removeFromShiftErrors(this.objScheudleErrors.errmsg_duplicate_shiftname);
    }

    // Check for duplicate shifts with same start and end time
    if(this.objSchedule.planShiftList.filter(e => e.startTime === objnewShift.startTime && e.hours === objnewShift.hours).length > 1){
      this.objShift.HasError = true;
      this.addToShiftErrors(this.objScheudleErrors.errmsg_duplicate_shift_time);
    } else {
      this.objShift.HasError = this.removeFromShiftErrors(this.objScheudleErrors.errmsg_duplicate_shift_time);
    }
    // Check for atleast one role
    this.objSchedule.planShiftList.forEach( shift => {
      if(shift.staffToPatientList.filter(e => e.activeFlag).length <= 0){
        shift.HasError = true;
        this.alertBox.addToShiftErrors(this.objScheudleErrors.errmsg_require_minimum_one_role, shift);
      }else {
        shift.HasError = this.alertBox.removeFromShiftErrors(this.objScheudleErrors.errmsg_require_minimum_one_role, shift);
      }
    });


// Check hours sum
    let hours = 0;
    this.objSchedule.planShiftList.forEach(
      shift => {
        hours = hours + shift.hours;
      }
    );
    this.ValidateShifttime(this.objShift);
  }

  removeShift(objdelshift: shift): void {

    let alertMessage = 'Are you sure you want to remove this shift?';

    let width = '350px';
    let height = '175px';
    if (this.planDetails.totalAnnualHours) {
      if (this.planDetails.totalAnnualHours > 0) {
        alertMessage = 'Deleting this shift will impact Staffing Grid data you previously entered and saved. \n' +
          '\n' +
          'Click Confirm if you are sure you want to continue.\n';
        width = '350px';
        height = '210px';
      }
    }
    document.body.classList.add('pr-modal-open');
    const dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', height, width,
      'Exit Staff Schedule Setup', alertMessage);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let delindex;
        const sCheduleName = objdelshift.name;
        delindex = this.objSchedule.planShiftList.indexOf(objdelshift);
        if (delindex > -1) {
          this.objSchedule.planShiftList.splice(delindex, 1);
        }

        if (sCheduleName) {
          let duplicateshift: shift;
          duplicateshift = this.objSchedule.planShiftList.filter(ele => ele.name === sCheduleName)[0];
          if (!Util.isNullOrUndefined(duplicateshift) && this.objSchedule.planShiftList.filter(ele => ele.name === sCheduleName)) {
            duplicateshift.HasError = this.removeFromgivenShiftErrors(this.objScheudleErrors.errmsg_duplicate_shiftname, duplicateshift);
          }
        }
        this.validateshift(this.objSchedule.planShiftList[0]);
        this.validatehour(this.objSchedule.planShiftList[0]);
        this.ValidateShifttime(this.objSchedule.planShiftList[0]);
        this.onclick.emit(true);
        this.isPlanEdited = true;
      }
      document.body.classList.remove('pr-modal-open');
    });


  }

  numberOnly(event): boolean {

    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault(); // don't don't write input
      return false;
    }
    return true;
  }

  pasteNumberOnly(event:ClipboardEvent):boolean{
    let shiftHours=event.clipboardData;
    let a=shiftHours.getData("text");
    if((!(/^[+]?\d*$/.test(a)))){
      return false;
    }else {
      return true;
    }
  }

  numberOnlyForTime(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        if (event.key !== ':' && !(event.keyCode >= 37 && event.keyCode <= 40)) {
          event.preventDefault();
        }
    }
    if (charCode === 46) {
      return false;
    } else if(charCode === 8 && event.target.value.charAt(event.target.selectionStart - 1) === ":") {
      return false;
    }
    else{

      return true;
    }
  }

  addToShiftErrors(strerrormsg: string): void {
    if (this.objShift.errormsg) {
      const objindex: number = this.objShift.errormsg.indexOf(strerrormsg);
      if (objindex < 0) {
        this.objShift.errormsg.push(strerrormsg);
      }
    } else {
      this.objShift.errormsg = [];
      this.addToShiftErrors(strerrormsg);
    }
  }

  removeFromShiftErrors(strerrormsg: string): boolean {
    if (this.objShift.errormsg) {
      if (this.objShift.errormsg.length > 0) {
        const objindex: number = this.objShift.errormsg.indexOf(strerrormsg);
        if (objindex > -1) {
          this.objShift.errormsg.splice(objindex, 1);
        }
      }
      if (this.objShift.errormsg.length === 0) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  removeFromgivenShiftErrors(strerrormsg: string, objShift: shift): boolean {
    if (!Util.isNullOrUndefined(objShift) && objShift.errormsg) {
      if (objShift.errormsg.length > 0) {
        const objindex: number = objShift.errormsg.indexOf(strerrormsg);
        if (objindex > -1) {
          objShift.errormsg.splice(objindex, 1);
        }
      }
      if (objShift.errormsg.length === 0) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  removeFromScheduleErrors(strerrormsg: string, objSchedule: StaffSchedule): boolean {
    if (objSchedule.errormsg) {
      if (objSchedule.errormsg.length > 0) {
        const objindex: number = objSchedule.errormsg.indexOf(strerrormsg);
        if (objindex > -1) {
          objSchedule.errormsg.splice(objindex, 1);
        }
      }
      if (objSchedule.errormsg.length === 0) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }

  }
}
