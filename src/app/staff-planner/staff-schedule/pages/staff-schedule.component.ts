import {ChangeDetectorRef, Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {PlanService} from '../../../shared/service/plan-service';
import {ScheduleService} from '../../../shared/service/schedule-service';
import {PlanDetails, ConfirmWindowOptions} from '../../../shared/domain/plan-details';
import {
  ScheudleErrors,
  shift,
  shifttime, StaffGrid,
  StaffSchedule,
  staffToPatient
} from '../../../shared/domain/staff-schedule';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {PromptDialogComponent} from '../../../shared/components/prompt-dialog/prompt-dialog.component';

import {AlertBox} from '../../../shared/domain/alert-box';
import {OAPlanData} from '../../../shared/domain/OAPlanData';
import {OASuggestedData} from '../../../shared/domain/OASuggestedData';
import {OAService} from '../../../shared/service/oa-service';
import * as moment from 'moment';
import {ScheduleShiftComponent} from '../components/schedule-shift/schedule-shift.component';
import {ScheduleControlComponent} from '../components/schedule-control/schedule-control.component';
// import {forEach} from '@angular/router/src/utils/collection';
import {Observable, of} from 'rxjs';
import {PlatformLocation} from '@angular/common';
import {RouterHistoryTrackerService} from '../../../shared/service/router-history-tracker.service';
import {Util} from "../../../shared/util/util";

@Component({
  selector: 'app-staff-schedule',
  templateUrl: './staff-schedule.component.html',
  styleUrls: ['./staff-schedule.component.scss']
})
export class StaffScheduleComponent implements OnInit {
  errormsg = '';
  objSchedule: StaffSchedule = new StaffSchedule();

  planDetails: PlanDetails = new PlanDetails();
  entitydisplayval: string;
  departmentdisplayval: string;
  primaryWHpUdisplayval: string;
  annualBudgetdisplayval: string;
  schedule: StaffSchedule;
  objScheudleErrors: ScheudleErrors = new ScheudleErrors();
  btnNexttxt: string;
  btnExittxt: string;
  alertBox: AlertBox;
  isDaySelected: boolean;
  daycount: number;
  oAPlanDataEntity = new OAPlanData();
  oASuggestedData = new OASuggestedData();

  strplanDetails = '';

  tabSelected = [true, true, false, true];
  previousIndex: number;
  isBackButtonClicked = false;
  @ViewChild('pageGroup') pageGroup;
  @ViewChild(ScheduleControlComponent) scheduleControlComponent;
  systemFlag = true;


  constructor(private planService: PlanService,
              private scheduleServiceScheduleService: ScheduleService,
              private router: Router, private cdRef: ChangeDetectorRef, private dialog: MatDialog,  private oaService: OAService, private platformLocation: PlatformLocation, private route: ActivatedRoute,
              private routerTracker : RouterHistoryTrackerService) {
    this.alertBox = new AlertBox(this.dialog);
    platformLocation.onPopState(() => {
      this.isBackButtonClicked = true;
    });
  }

  ngOnInit(): void {
    this.planService.isRoutedFlag = true;
    const wHpUExcludeEOFlag = this.alertBox.getWHpUExcludeEOFlag();
    if (!wHpUExcludeEOFlag) {
      this.previousIndex = 2;
      this.systemFlag = false;
    } else {
      this.previousIndex = 1;
      this.systemFlag = true;
    }
    this.loadplandetails();
  }

  public onSchedule(objschd: StaffSchedule): void {
    this.objSchedule = objschd;
  }

  validateAllSchedules(): boolean {
    let isError = false;
    this.planDetails.staffScheduleList.forEach(
      schedule => {
        this.daycount = 1;
        this.isDaySelected = false;
        this.checkDayCountandDaySelected(schedule);
        if (!this.isDaySelected) {
          isError = true;
          schedule.HasError = true;
          this.addToScheduleErrors(this.objScheudleErrors.errmsg_dayselected_empty, schedule);
        } else {
          schedule.HasError = this.removeFromScheduleErrors(this.objScheudleErrors.errmsg_dayselected_empty, schedule);
        }

      }
    );
    return isError;
  }

  checkIfPlanEdited(): boolean {
    const tempStrPlanDetails = this.getPlanString(this.planDetails);
    if (this.strplanDetails === tempStrPlanDetails || Util.isNullOrUndefined(this.strplanDetails) || this.strplanDetails === '') {
      return false;
    } else {
      return true;
    }
  }
  getPlanString(tempPlan: PlanDetails): string {
    let strLocalPlan: string = JSON.stringify(this.planDetails);
    let localPlan: PlanDetails = JSON.parse(strLocalPlan);
    localPlan.staffScheduleList.forEach(schedule => {
        schedule.HasError = false;
        schedule.errormsg = [];
        schedule.planShiftList.forEach(shift => {
          shift.HasError = false;
          shift.errormsg = [];
        });
      });


    return JSON.stringify(localPlan);
  }

  clickonbackbutton(): void {
    this.isBackButtonClicked = false;
    if (this.planDetails.planCompleted) {
      this.clickOnTabOrCancelButton();
    } else {
      if (this.checkIfPlanEdited()) {
        const dialogRef = this.alertBox.openAlertWithSaveAndReturn('exit-dialog', '210px', '600px',
          'Exit Staffing Schedule Setup', '');
        document.body.classList.add('pr-modal-open');
        dialogRef.afterClosed().subscribe(result => {
          document.body.classList.remove('pr-modal-open');
          if (result) {
            let hasError = false;
            if (result === ConfirmWindowOptions.exit) {
              this.clickOnTabOrCancelButton();
            } else {
              if (this.validateExistingSchedules()) {
                hasError = true;
                this.pageGroup.selectedIndex = this.previousIndex;
                const dialogRef = this.alertBox.openAlertOnSaveConfirm('exit-dialog', '190px', '600px',
                  'Save Staffing Schedule Setup', '');
              } else {
                this.saveAndNextScheduleDetails();
              }
            }
            // check if back button clicked
            if ( this.pageGroup.selectedIndex === this.previousIndex && !hasError) {
                // this.removeSessionAttributes();
                this.router.navigate(['/home']);
            }
          } else {
            this.pageGroup.selectedIndex = this.previousIndex;
          }
          document.body.classList.remove('pr-modal-open');
        });
      } else {
        this.clickOnTabOrCancelButton();
      }

    }
  }

  saveAndNextScheduleDetails(): void {
    this.isBackButtonClicked = false;
    if (this.planDetails.planCompleted) {
      this.loadOtherPages();
      return;
    }

    if (this.validateExistingSchedules()) {
      this.pageGroup.selectedIndex = this.previousIndex;
      return;
    }
    if (this.planDetails.staffScheduleList) {
      if (this.planDetails.staffScheduleList.length === 0) {
        this.alertBox.openAlert('exit-dialog',  '175px', '350px',
          'Exit Staffing Schedule Setup', this.objScheudleErrors.errmsg_Noschedule_added);
        this.pageGroup.selectedIndex = this.previousIndex;
        return;
      }
    } else {
      this.alertBox.openAlert('exit-dialog',  '175px', '350px',
        'Exit Staffing Schedule Setup', this.objScheudleErrors.errmsg_Noschedule_added);
      this.pageGroup.selectedIndex = this.previousIndex;
      return;
    }
    const planKey = localStorage.getItem('plankey');
    this.objSchedule.planKey = planKey;
    // set default value
    for (let i = 0; i < 8; i++) {
      if (this.objSchedule.scheduleDays[i] == null) {
        this.objSchedule.scheduleDays[i] = false;
      }
    }
    for (const sched of this.planDetails.staffScheduleList) {
      for (const shiftstp of sched.planShiftList) {
        for (const stp of shiftstp.staffToPatientList) {
          if (Util.isNullOrUndefined(stp.staffCount) || stp.staffCount.toString() === '' ) {
            stp.staffCount = 0;
          }
        }

      }
    }
    for (const sched of this.planDetails.staffScheduleList) {
      for (const shiftstp of sched.planShiftList) {
        const staffGrid: StaffGrid[] = [];
        for (const sgd of shiftstp.staffGridCensuses) {
          for(const stp of sgd.staffToPatientList){
            const staffGridData: StaffGrid = new StaffGrid() ;
            staffGridData.censusLookupKey = sgd.censusIndex;
            staffGridData.shiftLookupKey = sgd.shiftKey;
            staffGridData.variablePositionKey = stp.variablePositionKey;
            staffGridData.staffCount = stp.staffCount;
            staffGrid.push(staffGridData);
          }
        }
        shiftstp.staffGrid = staffGrid;
      }
    }

    for (const sched of this.planDetails.staffScheduleList) {
      for (const shiftstp of sched.planShiftList) {
        let formatFlag = shiftstp.timeFormatFlag ? " AM":" PM"
        let shiftStartTime = shiftstp.startTime + formatFlag;
        if(!shiftstp.timeFormatFlag){
          if(shiftstp.startTime.localeCompare("00:00")===0){
            shiftStartTime = "12:00"+formatFlag;
          }
        }
        shiftstp.shiftStartTime = shiftStartTime;
      }
    }

    this.scheduleServiceScheduleService.createSchedule(this.planDetails.staffScheduleList).subscribe(data => {
      this.loadOtherPages();
    });
  }

  saveAndExitScheduleDetails(): void {
    this.isBackButtonClicked = false;
    if (this.planDetails.planCompleted) {
      sessionStorage.removeItem('lock');
      this.router.navigate(['/home']);
      return;
    }

    if (this.planDetails.totalAnnualHours) {
      if (this.planDetails.totalAnnualHours > 0) {
        const alertMessage = 'Updates to the plan are reflected in the Staffing Grid only after you complete the workflow. \n' +
          '\n' +
          'Click Confirm to exit the workflow.\n' +
          '\n' +
          'Click Cancel to stay in this plan and finish the workflow.\n';
        const dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', '190px', '600px',
          'Exit Staffing Schedule Setup', alertMessage);

        document.body.classList.add('pr-modal-open');
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.saveData();
          }
          document.body.classList.remove('pr-modal-open');
        });
      }
    } else {
      this.saveData();
    }
  }

  saveData(): void {
    if (this.validateExistingSchedules()) {
      return;
    }
    if (this.planDetails.staffScheduleList) {
      if (this.planDetails.staffScheduleList.length === 0) {
        this.alertBox.openAlert('exit-dialog', '175px', '350px',
          'Exit Staffing Schedule Setup', this.objScheudleErrors.errmsg_Noschedule_added);
        return;
      }
    } else {
      this.alertBox.openAlert('exit-dialog', '175px', '350px',
        'Exit Staffing Schedule Setup', this.objScheudleErrors.errmsg_Noschedule_added);
      return;
    }
    const planKey = localStorage.getItem('plankey');
    this.objSchedule.planKey = planKey;
    for (let i = 0; i < 8; i++) {
      if (this.objSchedule.scheduleDays[i] == null) {
        this.objSchedule.scheduleDays[i] = false;
      }
    }
    for (const sched of this.planDetails.staffScheduleList) {
      for (const shiftstp of sched.planShiftList) {
        for (const stp of shiftstp.staffToPatientList) {
          if (Util.isNullOrUndefined(stp.staffCount) || stp.staffCount.toString() === '' ) {
            stp.staffCount = 0;
          }
        }
      }
    }
    for (const sched of this.planDetails.staffScheduleList) {
      for (const shiftstp of sched.planShiftList) {
        const staffGrid: StaffGrid[] = [];
        for (const sgd of shiftstp.staffGridCensuses) {
          for(const stp of sgd.staffToPatientList){
            const staffGridData: StaffGrid = new StaffGrid() ;
            staffGridData.censusLookupKey = sgd.censusIndex;
            staffGridData.shiftLookupKey = sgd.shiftKey;
            staffGridData.variablePositionKey = stp.variablePositionKey;
            staffGridData.staffCount = stp.staffCount;
            staffGrid.push(staffGridData);
          }
        }
        shiftstp.staffGrid = staffGrid;
      }
    }

    for (const sched of this.planDetails.staffScheduleList) {
      for (const shiftstp of sched.planShiftList) {
        const formatFlag = shiftstp.timeFormatFlag ? " AM":" PM";
        const shiftStartTime = shiftstp.startTime + formatFlag;
        shiftstp.shiftStartTime = shiftStartTime;
      }
    }
    this.scheduleServiceScheduleService.createSchedule(this.planDetails.staffScheduleList).subscribe(data => {
      // this.removeSessionAttributes();
      this.router.navigate(['/home']);
    });
  }

  loadSchedules(): void {
    const planKey = sessionStorage.getItem('plankey');
    this.scheduleServiceScheduleService.getScheduleDetails(planKey).subscribe(data => {
      this.planDetails.staffScheduleList = data;
      this.planDetails.staffScheduleList.forEach(schedule => {
        schedule.HasError = false;
        schedule.planShiftList.forEach(shift => {
            shift.HasError = false;
          });
      });
      this.populateSchedules();
    });
  }

  populateSchedules(): void {

    if (this.planDetails.staffScheduleList.length === 0) {
      const listobjStaffSchedule: StaffSchedule[] = [];
      const objStaffSchedule: StaffSchedule = new StaffSchedule();
      objStaffSchedule.planKey = localStorage.getItem('plankey');
      objStaffSchedule.IsMaximized = true;
      objStaffSchedule.HasError = false;
      const objshift: shift = new shift();
      objshift.last = true;
      objshift.startTime = '07:00';
      objshift.hours = 12;
      objshift.staffToPatientList = this.getStaffToPatientList();

      objStaffSchedule.planShiftList[0] = objshift;
      listobjStaffSchedule.push(objStaffSchedule);

      // setTimeout(() => {
      this.planDetails.staffScheduleList = listobjStaffSchedule;
      // }, 200);

    } else {
      for (const objSchedule of this.planDetails.staffScheduleList) {
        objSchedule.IsMaximized = true;
        for (const objShift of objSchedule.planShiftList) {
          this.orderStafftoPatientByVarpos(objShift);
        }
      }
    }
    setTimeout( () => this.strplanDetails = this.getPlanString(this.planDetails), 1000);
  }

  orderStafftoPatientByVarpos(objShift: shift): void {
    const staffToPatientList: staffToPatient[] = [];
    this.planDetails.variableDepartmentPositions.forEach(ele => {
      if (objShift.staffToPatientList) {
        const objstaffToPatient = objShift.staffToPatientList.filter(eleStaff => eleStaff.variablePositionKey === ele.categoryKey && ele.categoryDescription===eleStaff.variablePositionCategoryDescription)[0];
        if (objstaffToPatient) {
          staffToPatientList.push(objstaffToPatient);
        }
      }
    });
    objShift.staffToPatientList = staffToPatientList;
  }

  addSchedule(): void {
    let errorExist = false;
    if (this.planDetails.staffScheduleList.length > 0) {
      this.planDetails.staffScheduleList.forEach(ele => {
        if (!Util.isNullOrUndefined(ele.errormsg) && ele.errormsg.length > 0) {
          errorExist = true;
        }
      });
    }
    if (!errorExist) {
      this.checkScheduledays(this.objSchedule);

    if (this.validateExistingSchedules()) {
      return;
    }
    // If validation succcess
    if (this.planDetails.staffScheduleList.length > 0) {
      this.planDetails.staffScheduleList.forEach(ele => {
        ele.IsMaximized = false;
        ele.HasError = false;
//          ele.errormsg = '';
      });
      // let listobjStaffSchedule:StaffSchedule[]=[];
      const objStaffSchedule: StaffSchedule = new StaffSchedule();
      objStaffSchedule.planKey = localStorage.getItem('plankey');
      objStaffSchedule.IsMaximized = true;
      const objshift: shift = new shift();
      objshift.last = true;
      objshift.startTime = '07:00';
      objshift.hours = 12;
      objshift.activeFlag = false;
      objshift.staffToPatientList = this.getStaffToPatientList();
      objStaffSchedule.planShiftList[0] = objshift;

      setTimeout(() => {
        this.planDetails.staffScheduleList.push(objStaffSchedule);
      }, 200);
    } else {
      if (!this.planDetails.staffScheduleList) {
        this.planDetails.staffScheduleList = [];
      }
      const objStaffSchedule: StaffSchedule = new StaffSchedule();
      objStaffSchedule.IsMaximized = true;
      const objshift: shift = new shift();
      objshift.last = true;
      objshift.startTime = '07:00';
      objshift.hours = 12;
      objshift.staffToPatientList = this.getStaffToPatientList();

      objStaffSchedule.planShiftList[0] = objshift;
      setTimeout(() => {
        this.planDetails.staffScheduleList.push(objStaffSchedule);
      }, 200);

      }
    }
  }

  getStaffToPatientList(): staffToPatient[] {
    const staffToPatientList: staffToPatient[] = [];
    this.planDetails.variableDepartmentPositions.forEach(ele => {
      const objstaffToPatient: staffToPatient = new staffToPatient();
      objstaffToPatient.variablePositionCategoryAbbreviation = ele.categoryAbbreviation;
      objstaffToPatient.variablePositionCategoryDescription =   ele.categoryDescription;
      objstaffToPatient.variablePositionKey = ele.categoryKey;
      objstaffToPatient.activeFlag = false;
      staffToPatientList.push(objstaffToPatient);
    });
    return staffToPatientList;
  }

  validateExistingSchedules(): boolean {
    const lastschedule: StaffSchedule = this.planDetails.staffScheduleList[this.planDetails.staffScheduleList.length - 1];
    for (const schedule of this.planDetails.staffScheduleList) {
      if (schedule.name === '') {
        schedule.IsMaximized = true;
        schedule.HasError = true;
        this.addToScheduleErrors(this.objScheudleErrors.errmsg_empty_schedulename, schedule);

      } else {
        schedule.HasError = this.removeFromScheduleErrors(this.objScheudleErrors.errmsg_empty_schedulename, schedule);
      }
      // check if schedule already present
      if (this.planDetails.staffScheduleList.filter(name => name.name.toUpperCase() === lastschedule.name.toUpperCase()).length > 1) {
        schedule.IsMaximized = true;
        schedule.HasError = true;
        this.addToScheduleErrors(this.objScheudleErrors.errmsg_duplicate_schedulename, schedule);

      } else {
        // schedule.IsMaximized=false;
        schedule.HasError = this.removeFromScheduleErrors(this.objScheudleErrors.errmsg_duplicate_schedulename, schedule);
      }
    }
    for (const schedule of this.planDetails.staffScheduleList) {
      this.daycount = 1;
      this.isDaySelected = false;
      this.checkDayCountandDaySelected(schedule);
      if (!this.isDaySelected) {
        schedule.IsMaximized = true;
        schedule.HasError = true;
        this.addToScheduleErrors(this.objScheudleErrors.errmsg_dayselected_empty, schedule);
      } else {
        // schedule.IsMaximized=false;
        schedule.HasError = this.removeFromScheduleErrors(this.objScheudleErrors.errmsg_dayselected_empty, schedule);
      }

    }
    for (const schedule of this.planDetails.staffScheduleList) {
      // check for shift mandatory field errors
        for (const shift of   schedule.planShiftList) {
        this.validateshift(shift, schedule);
        this.ValidateShifttime(shift, schedule);
        // Remove warnings from error list
        if (shift.errormsg) {
          const objindex: number = shift.errormsg.indexOf(this.objScheudleErrors.errmsg_exceeds_shifthour);
          if (objindex > -1) {
            shift.errormsg.splice(objindex, 1);
          }
        }
        if (shift.errormsg) {
          const objindex: number = shift.errormsg.indexOf(this.objScheudleErrors.errmsg_exceeds_shiftcount);
          if (objindex > -1) {
            shift.errormsg.splice(objindex, 1);
          }
        }
        if (shift.errormsg) {
          if (shift.errormsg.length > 0) {
            shift.HasError = true;
          } else {
            shift.HasError = false;
          }
        }

        if (shift.HasError) {
          schedule.IsMaximized = true;
        }

      }
    }

    let isErrorFound = false;
    // chek forschedule errors
    this.planDetails.staffScheduleList.forEach(
      objschedule => {
        if (objschedule.HasError) {
          isErrorFound = true;
        }
        objschedule.planShiftList.forEach(shift => {
          if (shift.HasError) {
            isErrorFound = true;
          }
        });

      }
    );

    return isErrorFound;

  }

  removeschedule(objDelSchedule: StaffSchedule): void {
    let alertMessage = 'Are you sure you want to delete this schedule?';
    let width = '350px';
    let height = '175px';
    if (this.planDetails.totalAnnualHours) {
      if (this.planDetails.totalAnnualHours > 0) {
        alertMessage = 'Deleting this schedule will impact Staffing Grid data you previously entered and saved. \n' +
          '\n' +
          'Click Confirm if you are sure you want to continue.\n';
        width = '500px';
        height = '190px';
      }
    }

    const dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', height, width,
      'Exit Staffing Schedule Setup', alertMessage);

    document.body.classList.add('pr-modal-open');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index: number = this.planDetails.staffScheduleList.indexOf(objDelSchedule);
        if (index !== -1) {
          this.planDetails.staffScheduleList.splice(index, 1);
        }
        if (this.planDetails.staffScheduleList.length === 0) {
          this.addSchedule();
        }
        this.validateExistingSchedules();
        this.checkErrorInSchedule();
      }
      document.body.classList.remove('pr-modal-open');
    });


  }

  validateshift(objnewShift: shift, objNewSchedule): void {
    // check name and hours
    this.alertBox.validateshift(objnewShift);

    // look for duplicate shifts
    if (objNewSchedule.planShiftList.filter(e => e.name.toUpperCase() === objnewShift.name.toUpperCase()).length > 1) {
      objnewShift.HasError = true;
      this.alertBox.addToShiftErrors(this.objScheudleErrors.errmsg_duplicate_shiftname, objnewShift);
    } else {
      objnewShift.HasError = this.alertBox.removeFromShiftErrors(this.objScheudleErrors.errmsg_duplicate_shiftname, objnewShift);
    }

    // Check for duplicate shifts with same start and end time
    if(this.objSchedule.name === objNewSchedule.name){
      if (objNewSchedule.planShiftList.filter(e => e.startTime === objnewShift.startTime && e.hours === objnewShift.hours).length > 1) {
        objnewShift.HasError = true;
        this.alertBox.addToShiftErrors(this.objScheudleErrors.errmsg_duplicate_shift_time, objnewShift);
      } else {
        objnewShift.HasError = this.alertBox.removeFromShiftErrors(this.objScheudleErrors.errmsg_duplicate_shift_time, objnewShift);
      }
    }

    // Check for atleast one role
    objNewSchedule.planShiftList.forEach( shift => {
      if(shift.staffToPatientList.filter(e => e.activeFlag).length <= 0){
        shift.HasError = true;
        this.alertBox.addToShiftErrors(this.objScheudleErrors.errmsg_require_minimum_one_role, shift);
      }else {
        objnewShift.HasError = this.alertBox.removeFromShiftErrors(this.objScheudleErrors.errmsg_require_minimum_one_role, shift);
      }
    });

  }

  ValidateShifttime(objShift: shift, schedule: StaffSchedule): void {
    let isShiftTimeExceeds = false;
    let currentIndex: number;
    currentIndex = schedule.planShiftList.indexOf(objShift);
    isShiftTimeExceeds = this.alertBox.isTotalHoursExceed(schedule.planShiftList);
    if (isShiftTimeExceeds) {
      let shiftIndex = this.alertBox.getMaxShiftIndex(schedule.planShiftList);
      shiftIndex.map( position =>{
        if(position === schedule.planShiftList.indexOf(objShift)){
          objShift.HasError = true;
          this.alertBox.addToShiftErrors(this.objScheudleErrors.errmsg_time_diff_exceeds, objShift);
        }
      });
      let position = shiftIndex.filter( key => key === currentIndex);
      if(!position.length){
        objShift.HasError = false;
        this.alertBox.removeFromShiftErrors(this.objScheudleErrors.errmsg_time_diff_exceeds, objShift);
      }
    } else {
      objShift.HasError = this.alertBox.removeFromShiftErrors(this.objScheudleErrors.errmsg_time_diff_exceeds, objShift);
    }
  }


  checkScheduledays(objDelSchedule: StaffSchedule): boolean {
    const ismatch = false;
    const Scheduleindex = this.planDetails.staffScheduleList.indexOf(objDelSchedule);
    let lstStaffSchedule: StaffSchedule[] = [];
    lstStaffSchedule = this.planDetails.staffScheduleList;
    // lstStaffSchedule=lstStaffSchedule.splice(Scheduleindex,1);

    for (let i = 0; i < lstStaffSchedule.length; i++) {
      if (i !== Scheduleindex) {

        for (let j = 0; j < 7; j++) {

          if (lstStaffSchedule[i].scheduleDays[j] === true) {
            if (lstStaffSchedule[i].scheduleDays[j] === objDelSchedule.scheduleDays[j]) {
              objDelSchedule.HasError = true;
              this.addToScheduleErrors(this.objScheudleErrors.errmsg_duplicate_scheduledays, objDelSchedule);
              return true;
            } else {
              lstStaffSchedule[i].HasError = this.removeFromScheduleErrors(this.objScheudleErrors.errmsg_duplicate_scheduledays,
                lstStaffSchedule[i]);
            }
          }
        }
      }
    }
    if (!ismatch) {
      objDelSchedule.HasError = this.removeFromScheduleErrors(this.objScheudleErrors.errmsg_duplicate_scheduledays, objDelSchedule);
      return;

    } else {
      return true;
    }
  }
  checkErrorInSchedule(): void{
    let isErrorFound = false;
    this.planDetails.staffScheduleList.forEach(schedule => {
      this.planDetails.staffScheduleList.forEach(sched => {
        if(sched.key != schedule.key) {
          for (let i = 0; i < 7; i++) {
            if (sched.scheduleDays[i] == schedule.scheduleDays[i]) {
              isErrorFound = true;
            }
          }
        }
      })
      })
    if(!isErrorFound){
      this.planDetails.staffScheduleList.forEach(schedule => {
        this.removeFromScheduleErrors(this.objScheudleErrors.errmsg_duplicate_scheduledays, schedule);
      })
    }

  }
  loadplandetails(): void {
    let palnkey = localStorage.getItem('plankey');
    if ((!palnkey) || palnkey === '') {
          this.route.queryParamMap.subscribe(queryParams => {
              palnkey = queryParams.get('plankey');
          });
      }
    const lockedFlag = localStorage.getItem('lock');
    let previousLock = true;
    this.planService.getPlandetails(palnkey).subscribe(data => {
        if (!Util.isNullOrUndefined(this.planService.planAlreadyInUse) && !this.planService.planAlreadyInUse) {
            previousLock = false;
        }
        this.planDetails = data;
      if (this.planDetails.effectiveStartDate != null && this.planDetails.effectiveStartDate !== undefined) {
        if((this.alertBox.isNullOrUndefined(sessionStorage.getItem('wHpUExcludeEOFlag'))) || ((this.alertBox.isNullOrUndefined(sessionStorage.getItem('wHpUExcludeEOFKey'))) || sessionStorage.getItem('wHpUExcludeEOFKey') !== JSON.stringify(this.planDetails.facilityKey))){
          this.planService.getSystemOptionValuesFromDTM(this.planDetails.facilityKey,
            moment(new Date(this.planDetails.effectiveStartDate)).format('YYYY-MM-DD')).subscribe(
            flag => {
              if (flag['data'] === 2) {
                this.systemFlag = true;
              } else {
                this.systemFlag = false;
              }
              sessionStorage.setItem('wHpUExcludeEOFlag', JSON.stringify(this.systemFlag));
              sessionStorage.setItem('wHpUExcludeEOFKey', JSON.stringify(this.planDetails.facilityKey));
              if (!this.systemFlag) {
                this.previousIndex = 2;
              } else {
                this.previousIndex = 1;
              }
            });
        }
      }
        sessionStorage.setItem('plankey', this.planDetails.key);
        if (!previousLock) {
            this.planDetails.planAlreadyInUse = false;
        }
        this.checkForSessionAttributes();
        this.updateDataFromOA();
        this.loadSchedules();
        this.loadButtontext();
    });

  }

  getDaysInplanYear(): number {
    const planDate: Date = new Date(this.planDetails.effectiveEndDate);
    return this.alertBox.getDaysInplanYear(planDate);
  }

  loadButtontext(): void {
    const text =  this.alertBox.loadButtontext(this.planDetails.planCompleted);
    this.btnExittxt = text[0];
    this.btnNexttxt = text[1];
  }

  addToScheduleErrors(strerrormsg: string, objSchedule: StaffSchedule): void {
    if (objSchedule.errormsg) {
      const objindex: number = objSchedule.errormsg.indexOf(strerrormsg);
      if (objindex < 0) {
        objSchedule.errormsg.push(strerrormsg);
      }
    } else {
      objSchedule.errormsg = [];
      this.addToScheduleErrors(strerrormsg, objSchedule);
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
  getShifttime(objShift: shift): shifttime {
    return this.alertBox.getShifttime(objShift);
  }

  checkDayCountandDaySelected(schedule: StaffSchedule): void {
    schedule.scheduleDays.forEach(
      day => {
        if (this.daycount < 8) {
          if (day) {
            this.isDaySelected = true;
          }
        }
        this.daycount++;
      }
    );
  }


  updateDataFromOA(): void {
    if (this.planDetails.effectiveStartDate != null) {
      this.oAPlanDataEntity = this.alertBox.loadOAPlanDataEntity(this.planDetails);
      this.getSuggestedData();
    }
  }

  getSuggestedData(): void {
    this.oASuggestedData = this.planDetails.oAStaffingMetric;
    this.entitydisplayval = this.planDetails.facilityCode + '-' + this.planDetails.facilityName;
    this.departmentdisplayval = this.planDetails.departmentCode + '-' + this.planDetails.departmentName;
    this.primaryWHpUdisplayval = Util.isNullOrUndefined(this.planDetails.primaryWHpU) ? Number(this.planDetails.targetBudget).toFixed(4) + ' Hours' :
      this.planDetails.primaryWHpU.toFixed(4).toString() + ' Hours';
    if (Math.round(this.planDetails.budgetAverageVolume * this.getDaysInplanYear()) !== 0) {
      if (!Util.isNullOrUndefined(this.oASuggestedData)) {
      this.annualBudgetdisplayval = Math.round(this.planDetails.budgetAverageVolume * this.getDaysInplanYear()).toString()
        + ' ' + this.oASuggestedData.keyVolume;
      }
    } else {
      this.annualBudgetdisplayval = '-';
    }
  }

  getId(idx: number): string {
    return 'census-' + idx;
  }

  loadOtherPages(): void {
    this.isBackButtonClicked = false;
    const currentSelectedIndex = this.pageGroup.selectedIndex;
    if (this.previousIndex !== currentSelectedIndex && !Util.isNullOrUndefined(this.planDetails.key)) {
      localStorage.setItem('plankey', this.planDetails.key);
      switch (currentSelectedIndex) {
        case 0:
          this.router.navigate(['/plan-setup'],{queryParams: {plankey: this.planDetails.key}});
          break;
        case 1:
          if (!this.systemFlag) {
            this.router.navigate(['/off-grid-activities'], {queryParams: {plankey: this.planDetails.key}});
          } else {
            this.pageGroup.selectedIndex = this.previousIndex;
          }
          break;
        case 2:
          if (!this.systemFlag) {
            this.router.navigate(['/staff-schedule'], {queryParams: {plankey: this.planDetails.key}});
          } else {
            if (this.archivePlanCheck()) {
              // this.alertBox.openAlert('exit-dialog', '175px', '350px', 'Staff Planner', 'Submit schedule and shift details?');
              this.pageGroup.selectedIndex = this.previousIndex;
            } else {
              this.router.navigate(['/staffing-grid'], {queryParams: {plankey: this.planDetails.key}});
            }
          }
          break;
        case 3:
          if (this.archivePlanCheck()) {
            // this.alertBox.openAlert('exit-dialog', '175px', '350px', 'Staff Planner', 'Submit schedule and shift details?');
            this.pageGroup.selectedIndex = this.previousIndex;
          } else {
            this.router.navigate(['/staffing-grid'], {queryParams: {plankey: this.planDetails.key}});
          }
          break;
        default:
          // this.removeSessionAttributes();
          this.router.navigate(['/home']);
      }
    } else {
      this.pageGroup.selectedIndex = this.previousIndex;
    }
  }

  checkTabChange(): void {
    if (this.previousIndex !== this.pageGroup.selectedIndex) {
      this.pageGroup.selectedIndex > this.previousIndex ? this.saveAndNextScheduleDetails() : this.clickonbackbutton();
    }
  }

  clickOnTabOrCancelButton(): void {
    this.isBackButtonClicked = false
    if (this.previousIndex === this.pageGroup.selectedIndex) {
        // this.removeSessionAttributes();
      this.router.navigate(['/home']);
    } else {
      this.loadOtherPages();
    }
  }

  private checkForSessionAttributes(): void {
    const locked = sessionStorage.getItem('lock');
    if (this.planDetails.planAlreadyInUse) {
        this.planService.planAlreadyInUse = true;
        this.planDetails.planCompleted = true;
        this.alertBox.openAlert('exit-dialog', '175px', '450px', 'Cannot update plan at this time', 'Plan is currently being edited by another user');
        document.body.classList.add('pr-modal-open');
        sessionStorage.setItem('lock', 'true');
      } else {
        this.planService.planAlreadyInUse = false
        sessionStorage.setItem('lock', 'false');
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

  private archivePlanCheck(): boolean {
    let errorFlag = false;
    if (this.planDetails.action === 'Archived') {
      for (const schedule of this.planDetails.staffScheduleList) {
        if (schedule.name === '') {
          errorFlag = true;
          break;
        }
        for (const shift of schedule.planShiftList) {
          if (shift.name === '') {
            errorFlag = true;
            break;
          }
        }
      }
    }
    return errorFlag;
  }

  canDeactivate(): Observable<boolean> | boolean {
    sessionStorage.removeItem('reload');
    if (this.checkIfPlanEdited() && this.isBackButtonClicked) {
      let dialogRef;
      let moveForward : boolean;
      dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', '175px', '600px',
        'Exit Staffing Schedule Setup', 'You will lose any unsaved data, do you want to continue?');
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
}

