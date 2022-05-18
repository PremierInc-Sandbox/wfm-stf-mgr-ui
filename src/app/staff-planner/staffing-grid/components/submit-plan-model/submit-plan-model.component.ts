import {Component, OnInit} from '@angular/core';
import {PlanDetails} from '../../../../shared/domain/plan-details';
import {PlanService} from '../../../../shared/service/plan-service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {Router} from '@angular/router';
import {StaffGridService} from '../../../../shared/service/Staffgrid-service';
import {
  StaffGrid,
  StaffGridCensus, StaffSchedule,
} from '../../../../shared/domain/staff-schedule';
import {DepartmentService} from '../../../../shared/service/department-service';
import {DeptDetails} from '../../../../shared/domain/DeptDetails';
import * as moment from 'moment';
import {AlertBox} from '../../../../shared/domain/alert-box';
import {VariableDepartmentPosition} from "../../../../shared/domain/var-pos";

@Component({
  selector: 'app-submit-plan-model',
  templateUrl: './submit-plan-model.component.html',
  styleUrls: ['./submit-plan-model.component.scss']
})
export class SubmitPlanModelComponent implements OnInit {

  public planDetails: PlanDetails = new PlanDetails();
  alertBox: AlertBox;


  constructor(private router: Router, private dialog: MatDialog, private planService: PlanService
    ,         private staffGridService: StaffGridService,
              private departmentService: DepartmentService,
              public  dialogRef: MatDialogRef<SubmitPlanModelComponent>) {
    this.alertBox = new AlertBox(this.dialog);
  }
  enabledStaffToPatientVarpos: VariableDepartmentPosition[] = [];
  isIncluded = false
  isIncludedInStafftoPatient = false;
  isPlanActive = false;
  isError = false;
  errormsg: string[] = [];
  deptDetails: DeptDetails [];
  listDeptKeys: Array<number> = [];
  plansData: PlanDetails[];
  activeData: PlanDetails[] = [];
  public activePlanData: PlanDetails;

  isActiveFound = false;
  isActivePlanExistInsamePeriod = false;
  activePlanWarningMsg = '';

  ngOnInit(): void {
    this.getplandetails();
  }

  toggleModalHide(): void {
    this.dialogRef.close();
  }

  getplandetails(): void {
    this.planDetails = JSON.parse(sessionStorage.getItem('plandetails'));
    this.validateTotalvalue();
  }

  submitPlan(): void {
    this.errormsg = [];
    if (this.validateTotalvalue()) {
      let planAction = '';

      if (this.isPlanActive) {
        planAction = 'Active';
      } else {
        planAction = 'Inactive';
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
              staffGridData.variablePositionCategoryDescription=stp.variablePositionCategoryDescription;
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
          shiftstp.shiftStartTime = shiftStartTime;
        }
      }
      let annualTotalHoursVariance = 0;
      if (this.planDetails.staffingSummaryData) {
        for (const staffSummary of this.planDetails.staffingSummaryData) {
          annualTotalHoursVariance = annualTotalHoursVariance + Number(staffSummary.annualHrsVarToTarget);
        }
      }
      this.planDetails.totalAnnualHoursVariance = annualTotalHoursVariance;
      this.staffGridService.saveStaffGridDetails(this.planDetails.staffScheduleList, 'Completed', planAction,
        this.planDetails.totalAnnualHours, this.planDetails.totalAnnualHoursVariance).subscribe(data => {
        if (this.isActiveFound) {
          for (const dataPlan of this.activeData) {

            dataPlan.defaultPlanFlag = false;
            dataPlan.action = 'Inactive';
            this.planService.updatePlanAsActive(dataPlan).subscribe(planData => {
              return planData;
            });
          }
        }
        this.dialogRef.close();
        clearInterval(this.staffGridService.autoSaveInterval);
         sessionStorage.removeItem('lock');
        this.router.navigate(['/home']);
      });
    }
  }

  validateTotalvalue(): boolean {
    let isvalid = true;


    for (const schedule of this.planDetails.staffScheduleList) {
      this.getEnabledVarpos(schedule);
      let zeroCensuslevels = '';
      for (const shift of schedule.planShiftList) {

        for (const objStaffGridCensuses of shift.staffGridCensuses) {
          if (Number(this.getTotal(objStaffGridCensuses)) === 0) {
            this.isError = true;
            isvalid = false;
            if (zeroCensuslevels === '') {
              zeroCensuslevels = objStaffGridCensuses.censusIndex.toString();
            } else {
              if (zeroCensuslevels.split(',').filter(x => x === objStaffGridCensuses.censusIndex.toString()).length < 1) {
                zeroCensuslevels = zeroCensuslevels + ',' + objStaffGridCensuses.censusIndex.toString();
              }
            }
          }
        }

      }
      if (zeroCensuslevels !== '') {
        this.errormsg.push('Please update staffing grid for variable positions for census levels - ' +
          zeroCensuslevels + '. in the \'' + schedule.name + ' \' Schedule tab.');
      }
      this.isIncluded  = false;
      this.enabledStaffToPatientVarpos = []
    }

    return isvalid;
  }

  checkotherPlanStatusForActive(): void {
    this.activeData = [];
    // reset values
    this.isActivePlanExistInsamePeriod = false;
    this.activePlanWarningMsg = '';
    if (this.isPlanActive) {
      // get department details
      this.departmentService.getDepts(this.planDetails.facilityKey).subscribe(data => {
        this.deptDetails = data;
        this.listDeptKeys = [];
        // get the department key array
        for (const department of this.deptDetails) {
          if (department.key !== null) {
            this.listDeptKeys.push(Number(department.key));
          }
        }
        // get all plan for the available department
        this.planService.getPlans(this.listDeptKeys).subscribe(planresultdata => {
          this.plansData = planresultdata;

          // validate with plans to find any existing active plan on same period
          this.isActiveFound = false;
          for (const planData of this.plansData) {
            if (this.planDetails.name !== planData.name && this.planDetails.departmentKey === planData.departmentKey) {
              if (planData.defaultPlanFlag === true && this.IsDateRangeOverlapping(this.planDetails, planData)) {
                this.isActiveFound = true;
                this.activeData.push(planData);
              }
            }
          }
          // if active plan found alert the user
          if (this.isActiveFound) {
            this.isActivePlanExistInsamePeriod = true;
            this.activePlanWarningMsg = 'When this box is checked and you submit this plan, it will become the new Active plan effective from tomorrow.';
          }
        });
      });
    }
  }

  IsDateRangeOverlapping(submittingPlan: PlanDetails, planData: PlanDetails): boolean {
    const isPlanActive = this.alertBox.isDateRangeOverlapping(submittingPlan, planData);
    return isPlanActive;
  }
  getEnabledVarpos(schedule : StaffSchedule) {
    for (const objVarpos of this.planDetails.variableDepartmentPositions) {
      if (objVarpos.includedInNursingHoursFlag && !(this.enabledStaffToPatientVarpos.indexOf(objVarpos) >= 0)) {
        this.isIncluded = objVarpos.includedInNursingHoursFlag;
        this.enabledStaffToPatientVarpos.push(objVarpos);
      }
    }
    for (const shift of schedule.planShiftList) {
      for (const stp of shift.staffToPatientList) {
        for (const enabledStpVarpos of this.enabledStaffToPatientVarpos) {
          if (stp.activeFlag && stp.variablePositionKey === enabledStpVarpos.categoryKey && stp.variablePositionCategoryDescription === enabledStpVarpos.categoryDescription) {
            const index: number = this.enabledStaffToPatientVarpos.indexOf(enabledStpVarpos);
            if (index !== -1) {
              this.enabledStaffToPatientVarpos.splice(index, 1);
            }
          }
        }
      }
    }
  }

  getTotal(objstaffGridCensus: StaffGridCensus): string {
    let sum = 0;
    for (const objstaffToPatient of objstaffGridCensus.staffToPatientList) {
      if (this.isIncluded && this.enabledStaffToPatientVarpos.length === 0) {
        sum = (1 * sum) + (1 * objstaffToPatient.staffCount);
      }
    }
    return sum.toFixed(1);
  }

  checkIsIncluded(varposkey: any): boolean {
    let isIncluded = false;
    for (const objVarpos of this.planDetails.variableDepartmentPositions) {
      if (objVarpos.categoryKey === varposkey) {
        isIncluded = objVarpos.includedInNursingHoursFlag;
      }
    }

    return isIncluded;
  }

}
