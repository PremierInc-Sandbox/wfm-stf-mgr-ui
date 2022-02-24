import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ScheudleErrors, shift, StaffSchedule, staffToPatient} from '../../../../shared/domain/staff-schedule';
import {PlanDetails} from '../../../../shared/domain/plan-details';
import {ScheduleService} from '../../../../shared/service/schedule-service';
import {CustomError} from '../../../../shared/domain/var-pos';
import {AlertBox} from '../../../../shared/domain/alert-box';
import {MatDialog} from '@angular/material/dialog';
import {Shift} from '../../../../shared/domain/manager-shift';
@Component({
  selector: 'app-schedule-control',
  templateUrl: './schedule-control.component.html',
  styleUrls: ['./schedule-control.component.scss']
})
export class ScheduleControlComponent implements OnInit {
  @Input('objSchedule') objSchedule: StaffSchedule = new StaffSchedule();
  @Input('planDetails') planDetails1: PlanDetails = new PlanDetails();
  @Output() onclick: EventEmitter<StaffSchedule> = new EventEmitter<StaffSchedule>();
  @Output() onchange: EventEmitter<StaffSchedule> = new EventEmitter<StaffSchedule>();
  @Input() id = '';
  @Output() public getScheduleData = new EventEmitter<StaffSchedule>();
  objScheudleErrors: ScheudleErrors = new ScheudleErrors();
  // newShift:shift=new shift();
  errormsg = '';
  error: CustomError = new CustomError();
  showError: boolean;
  planShiftListExpanse = Array;
  planDetails: PlanDetails = new PlanDetails();
  isPlanEdited = false;
  addTimePeriodFlag = false;
  alertBox: AlertBox;

  constructor(private scheduleServiceScheduleService: ScheduleService, private dialog: MatDialog) {
    this.alertBox = new AlertBox(this.dialog);
  }

  ngOnInit(): void {
  }

  public onChange(): void {
    this.getScheduleData.emit(this.objSchedule);
  }

  validateSchduleName(objselectedSchedule: StaffSchedule): void {
    let currentIndex: number;
    currentIndex = this.planDetails1.staffScheduleList.indexOf(objselectedSchedule);

    if (this.planDetails1.staffScheduleList) {
      // check if name entered
      if (this.objSchedule.name === '') {
        this.objSchedule.IsMaximized = true;
        this.objSchedule.HasError = true;
        this.addToErrors(this.objScheudleErrors.errmsg_empty_schedulename);
      } else {
        // schedule.IsMaximized=false;
        this.objSchedule.HasError = this.removeFromErrors(this.objScheudleErrors.errmsg_empty_schedulename);
      }

      if (this.planDetails1.staffScheduleList.filter(ele => ele.name.toUpperCase() === this.objSchedule.name.toUpperCase()).length > 1) {
        this.objSchedule.IsMaximized = true;
        this.objSchedule.HasError = true;
        this.addToErrors(this.objScheudleErrors.errmsg_duplicate_schedulename);
      } else {
        // this.objSchedule.IsMaximized=false;
        let selectedIndex: number;
        selectedIndex = this.planDetails1.staffScheduleList.indexOf(this.objSchedule);

        if (selectedIndex === currentIndex) {
          this.objSchedule.HasError = this.removeFromErrors(this.objScheudleErrors.errmsg_duplicate_schedulename);
        } else {
          this.removeErrorsfromGivenSchedule(this.objScheudleErrors.errmsg_duplicate_schedulename, objselectedSchedule);
        }

        for (const objTempSchedule of this.planDetails1.staffScheduleList) {
          if (objTempSchedule.errormsg) {
            if (objTempSchedule.errormsg.indexOf(this.objScheudleErrors.errmsg_duplicate_schedulename) > -1) {
              this.validateSchduleName(objTempSchedule);
          }
            }
        }


      }


    }
  }

  checkScheduledays(objDelSchedule: StaffSchedule, index: number): void {
    // remove select day error if any day selected
    if (objDelSchedule.scheduleDays[index]) {
      objDelSchedule.HasError = this.removeFromErrors(this.objScheudleErrors.errmsg_dayselected_empty);
    }
    let IsAllSelected = true;
    for (let i = 0; i < 7; i++) {
      if (!objDelSchedule.scheduleDays[i]) {
        IsAllSelected = false;
      }
    }

    objDelSchedule.scheduleDays[7] = IsAllSelected;

    this.onchange.emit(objDelSchedule);

  }

  checkAllScheduledays(objDelSchedule: StaffSchedule): void {
    if (objDelSchedule.scheduleDays[7]) {
      for (let i = 0; i < 7; i++) {
        objDelSchedule.scheduleDays[i] = true;
      }
    } else {
      for (let i = 0; i < 7; i++) {
        objDelSchedule.scheduleDays[i] = false;
      }
    }
    this.removeFromErrors(this.objScheudleErrors.errmsg_dayselected_empty);
    this.onchange.emit(objDelSchedule);
  }

  expandSchedule(): void {
    this.objSchedule.IsMaximized = !this.objSchedule.IsMaximized;
  }

  removeSchedule(objDelSchedule: StaffSchedule): void {

    this.onclick.emit(objDelSchedule);
  }

  updatePlanEdited(planEdited: boolean): void {
    this.isPlanEdited  = planEdited;
  }

  addToErrors(strerrormsg: string): void {
    if (this.objSchedule.errormsg) {
      const objindex: number = this.objSchedule.errormsg.indexOf(strerrormsg);
      if (objindex < 0) {
        this.objSchedule.errormsg.push(strerrormsg);
      }
    } else {
      this.objSchedule.errormsg = [];
      this.addToErrors(strerrormsg);
    }
  }

  removeFromErrors(strerrormsg: string): boolean {
    if (this.objSchedule.errormsg) {
      if (this.objSchedule.errormsg.length > 0) {
        const objindex: number = this.objSchedule.errormsg.indexOf(strerrormsg);
        if (objindex > -1) {
          this.objSchedule.errormsg.splice(objindex, 1);
        }
      }
      return this.objSchedule.errormsg.length !== 0;
    } else {
      return false;
    }
  }

  removeErrorsfromGivenSchedule(strerrormsg: string, objselectedSchedule: StaffSchedule): boolean {
    if (objselectedSchedule.errormsg) {
      if (objselectedSchedule.errormsg.length > 0) {
        const objindex: number = objselectedSchedule.errormsg.indexOf(strerrormsg);
        if (objindex > -1) {
          objselectedSchedule.errormsg.splice(objindex, 1);
        }
      }
      if (objselectedSchedule.errormsg.length === 0) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  addShift(isDuplicate: boolean): void {
    this.isPlanEdited = true;
    if (!this.objSchedule.planShiftList) {
      this.objSchedule.planShiftList = [];
    }
    this.objSchedule.planShiftList.forEach(ele => {
        this.alertBox.validateshift(ele);
        this.checkDuplicateStartTime(ele);
        if (ele.HasError) {
          this.addTimePeriodFlag = true;
        }
        ele.last = false;
    });
    if (!this.addTimePeriodFlag) {

      const objnewShift: shift = new shift();
      objnewShift.last = true;

      this.objSchedule.planShiftList[0].staffToPatientList.forEach(ele => {
        const objstaffToPatient: staffToPatient = new staffToPatient();
        objstaffToPatient.variablePositionCategoryAbbreviation = ele.variablePositionCategoryAbbreviation;
        objstaffToPatient.variablePositionCategoryDescription = ele.variablePositionCategoryDescription;
        objstaffToPatient.variablePositionKey = ele.variablePositionKey;
        objstaffToPatient.activeFlag = false;
        objnewShift.activeFlag = false;
        objnewShift.staffToPatientList.push(objstaffToPatient);
      });

      objnewShift.startTime = '07:00';
      objnewShift.hours = 12;
      this.objSchedule.planShiftList.splice(0, 0, objnewShift);
      this.planShiftListExpanse[this.objSchedule.name + 0] = false;
    }
    this.addTimePeriodFlag = false;
  }
  updatePlanShiftExpanse(index: number){
    this.planShiftListExpanse[this.objSchedule.name + index] = false;
  }
  checkDuplicateStartTime(objNewshift: shift) {
    if (this.objSchedule.planShiftList.filter(e => e.startTime === objNewshift.startTime && e.hours === objNewshift.hours).length > 1) {
      objNewshift.HasError = true;
      this.alertBox.addToShiftErrors(this.objScheudleErrors.errmsg_duplicate_shift_time, objNewshift);
    } else {
      objNewshift.HasError = this.alertBox.removeFromShiftErrors(this.objScheudleErrors.errmsg_duplicate_shift_time, objNewshift);
    }
  }
}
