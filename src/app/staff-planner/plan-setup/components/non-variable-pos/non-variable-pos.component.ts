import {Component, Input, OnInit} from '@angular/core';
import {PlanDetails} from '../../../../shared/domain/plan-details';
import {NonVariableDepartmentPosition} from '../../../../shared/domain/non-var-postn';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {PromptDialogComponent} from '../../../../shared/components/prompt-dialog/prompt-dialog.component';

import {AlertBox} from '../../../../shared/domain/alert-box';
import {CustomError} from '../../../../shared/domain/var-pos';
import {Util} from "../../../../shared/util/util";
@Component({
  selector: 'app-non-variable-pos',
  templateUrl: './non-variable-pos.component.html',
  styleUrls: ['./non-variable-pos.component.scss']
})

export class NonVariablePosComponent implements OnInit {
  @Input('plan') plan: PlanDetails = new PlanDetails();

  staffArray = [0];
  newIndex = 0;
  isShowError: boolean;
  title: string [] = [''];
  shiftHours: string [] = [''];
  error: CustomError = new CustomError();
  isMaxIndex: boolean;
  emptyErrorFlag = false;
  emptySelectFlag = false;
  emptyHourFlag = false;
  alertBox: AlertBox;

  constructor(private dialog: MatDialog) {
    this.alertBox = new AlertBox(this.dialog);
  }

  selectAll(nonVariableDepartmentPosition: NonVariableDepartmentPosition): void {
    if (nonVariableDepartmentPosition.allDaySelected) {
      for (const weekdays of nonVariableDepartmentPosition.weekDays) {
        weekdays.selected = nonVariableDepartmentPosition.allDaySelected;
      }
    } else {
      for (const weekdays of nonVariableDepartmentPosition.weekDays) {
        weekdays.selected = nonVariableDepartmentPosition.allDaySelected = false;
      }
    }
    this.checkAllSelected(nonVariableDepartmentPosition);
  }

  checkIfAllSelected(nonVariableDepartmentPosition: NonVariableDepartmentPosition): void {
    let numberOfDaysSelected = 0;
    if (nonVariableDepartmentPosition.allDaySelected) {
      nonVariableDepartmentPosition.allDaySelected = false;
    }

    for (const weekDay of nonVariableDepartmentPosition.weekDays) {
      if (weekDay.selected === true) {
        numberOfDaysSelected++;
      }
    }
    if (numberOfDaysSelected === nonVariableDepartmentPosition.weekDays.length) {
      nonVariableDepartmentPosition.allDaySelected = true;
    }

  }

  ngOnInit() {
    window.scrollTo(0, 0);
  }

  newNonVarpos(staff: NonVariableDepartmentPosition): void {
    if (this.plan.nonVariableDepartmentPositions.length === 10) {
      this.error = {
        isError: true,
        errorMessage: 'User is unable to add new position unless they delete an existing one.'
      };
      this.isMaxIndex = true;
    } else {
      const objNonVariableDepartmentPosition: NonVariableDepartmentPosition = new NonVariableDepartmentPosition();
      let weekdayValid = false;
      for (const weeDay of staff.weekDays) {
        if (weeDay.selected === true) {
          weekdayValid = true;
          break;
        }
      }

      if ((staff.shiftHours === 0 || staff.shiftHours === undefined &&
        staff.title === '' || staff.title === null || staff.title === undefined) ||
        (staff.shiftHours === 0 || staff.shiftHours === undefined) ||
        (staff.title === '' || staff.title === null || staff.title === undefined) || (!weekdayValid)) {
        this.isShowError = true;

      } else {
        this.isShowError = false;
        this.plan.nonVariableDepartmentPositions.push(objNonVariableDepartmentPosition);
      }
    }
  }

  clearNonDeptFields(staff: NonVariableDepartmentPosition): void {
    for (let i = 0; i < staff.weekDays.length; i++) {

      staff.weekDays[i] = null;
    }
    staff.title = '';
    staff.shiftHours = 0;
    staff.allDaySelected = false;
  }

  deleteRow(staff: NonVariableDepartmentPosition): void {

    this.alertBox.deleteRow(this.plan, 2);
    const dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', this.alertBox.height, this.alertBox.width,
      'Plan SetUp - Non Variable Position', this.alertBox.alertMessage);
    document.body.classList.add('pr-modal-open');

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index: number = this.plan.nonVariableDepartmentPositions.indexOf(staff);
        if (index !== -1) {
          this.plan.nonVariableDepartmentPositions.splice(index, 1);
          this.isMaxIndex = false;
          this.isShowError = false;
        }
      }
      document.body.classList.remove('pr-modal-open');
    });
  }

  numberOnlyCheck(event): boolean {
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

  pasteNumberAndDecimalOnly(event:ClipboardEvent):boolean{
    let shiftHours=event.clipboardData;
    let a=shiftHours.getData("text");
    if((!(/^[+]?\d*\.?\d*$/.test(a)))){
      return false;
    }else {
      return true;
    }
  }

  numberOnly(event, summaryIndex: number): boolean {
    this.isShowError = false;
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 && charCode !== 46 || charCode > 57)) {
      return false;
    }
    if (Util.isNullOrUndefined(this.plan.nonVariableDepartmentPositions[summaryIndex].shiftHours)) {
      return true;
    }
    const shiftHours = this.plan.nonVariableDepartmentPositions[summaryIndex].shiftHours;
    if (shiftHours) {
      if (shiftHours.toString().indexOf('.') >= 0 && shiftHours.toString().indexOf('.') < 4) {
        const index = shiftHours.toString().indexOf('.') + 2;
        if (shiftHours.toString().charAt(index) !== '') {
          // if(ogahr.toString().charAt(index))
          this.plan.nonVariableDepartmentPositions[summaryIndex].shiftHours =
            parseFloat(shiftHours.toString().substring(0, index) + shiftHours.toString().charAt(index));
          return false;
        }
      }
      if (shiftHours.toString().charAt(4) === ('.')) {
        this.plan.nonVariableDepartmentPositions[summaryIndex].shiftHours = parseFloat(shiftHours.toString().substring(0, 4));
        return false;
      }
    }
  }

  validateLength(title: string): boolean {
    this.isShowError = false;
    if (!Util.isNullOrUndefined((title)) && title.length > 120) {
      return false;
    } else {
      return true;
    }
  }

  checkTitle(title: string): void {
    if (title === '') {
      this.emptyErrorFlag = true;
    } else {
      this.emptyErrorFlag = false;
    }
  }

  checkAllSelected(nVarDeptPosition: NonVariableDepartmentPosition): void {
    let numberOfDaysSelected = 0;

    for (const weekDay of nVarDeptPosition.weekDays) {
      if (weekDay.selected === true) {
        numberOfDaysSelected++;
      }
    }

    if (numberOfDaysSelected === 0) {
      this.emptySelectFlag = true;
    } else {
      this.emptySelectFlag = false;
    }
  }

  checkEmpty(nonVariableDepPositionArray: NonVariableDepartmentPosition[]): void {
    this.emptyHourFlag = false;
    this.emptyHourFlag = false;
    this.emptySelectFlag = false;
    for (const nonVariableDepPosition of nonVariableDepPositionArray) {
      if (nonVariableDepPosition.shiftHours.toString() === '') {
        this.emptyHourFlag = true;
        break;
      } else {
        this.emptyErrorFlag = false;
      }
      if (nonVariableDepPosition.title === '') {
        this.emptyErrorFlag = true;
        break;
      }
      let numberOfDaysSelected = 0;
      for (const weekDay of nonVariableDepPosition.weekDays) {
        if (weekDay.selected === true) {
          numberOfDaysSelected++;
        }
      }
      if (numberOfDaysSelected === 0) {
        this.emptySelectFlag = true;
        break;
      }
    }
  }

  checkHours(hours: any): void {
    if (hours === '') {
      this.emptyHourFlag = true;
    } else {
      this.emptyHourFlag = false;
    }
  }

  checkEmptyPosition(): boolean {
    return this.emptyErrorFlag || this.emptySelectFlag || this.emptyHourFlag;
  }
}
