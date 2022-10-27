import {Component, OnInit} from '@angular/core';
import {PlanDetails} from '../../../../shared/domain/plan-details';
import {PlanService} from '../../../../shared/service/plan-service';
import {ScheduleService} from '../../../../shared/service/schedule-service';
import {StaffGrid, StaffSchedule} from '../../../../shared/domain/staff-schedule';
import {StaffGridService} from '../../../../shared/service/Staffgrid-service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {Router} from '@angular/router';

@Component({
  selector: 'app-copy-plan-modal',
  templateUrl: './copy-plan-modal.component.html',
  styleUrls: ['./copy-plan-modal.component.scss']
})
export class CopyPlanModalComponent implements OnInit {
  plan: PlanDetails;
  planName: string;
  deptArray: string[];
  deptStr: string;
  newPlankey: string;
  showMsg = false;
  isPlanNmDuplicate: boolean;
  isHide = true;
  deptListKeys: number[];

  constructor(private router: Router, private dialog: MatDialog, private planService: PlanService,
              public  dialogRef: MatDialogRef<CopyPlanModalComponent>,
              private scheduleServiceScheduleService: ScheduleService,
              private staffGridService: StaffGridService) {
    this.plan = new PlanDetails();
  }

  plansData: PlanDetails[];
  newPlan: PlanDetails;

  toggleModalHide() {
    this.dialogRef.close();
    document.body.classList.remove('pr-modal-open');
  }

  saveCopyingPlan(copyPlan: string) {

    this.isPlanNmDuplicate = false;
    for (const planObj of this.plansData) {
      if (planObj.name.toUpperCase() === copyPlan.toUpperCase()) {
        this.isPlanNmDuplicate = true;
        this.isHide = true;
        break;
      }
    }
    if (!this.isPlanNmDuplicate) {
      this.isHide = false;
      const planKey = localStorage.getItem('planId');
      this.planService.getPlandetails(planKey).subscribe(parentplandata => {
        const objOffgridactivities = parentplandata.offGridActivities;
        this.newPlan = parentplandata;
        this.newPlan.name = copyPlan;
        this.newPlan.isnewlycreated = true;
        this.newPlan.key = null;
        this.newPlan.defaultPlanFlag = false;
        this.planService.removePlanKeyFromSessionAttributeSubscribe(Number(planKey)).subscribe(removeSession => {

        this.planService.createPlan(this.newPlan).subscribe(data => {
          this.newPlankey = data.key;
          // copy offgrid activites
          // for(const objoffgridactivity of objOffgridactivities)
          // {
          // objoffgridactivity.offGridActivityKey=null;
          // }
          data.offGridActivities = objOffgridactivities;
          this.planService.createPlan(data).toPromise();
          const oldstaffScheduleList: StaffSchedule[] = [];
          // copy scheduledata
          this.scheduleServiceScheduleService.getScheduleDetails(planKey).subscribe(scheduleData => {
            let staffScheduleList: StaffSchedule[] = [];
            staffScheduleList = scheduleData;
            for (const objschedule of staffScheduleList) {
              objschedule.key = null;
              objschedule.planKey = this.newPlankey;
              for (const objshift of objschedule.planShiftList) {
                objshift.key = null;
              }
            }

            for (const sched of staffScheduleList) {
              for (const shiftstp of sched.planShiftList) {
                let formatFlag = shiftstp.timeFormatFlag ? " AM":" PM"
                let shiftStartTime = shiftstp.startTime + formatFlag;
                shiftstp.shiftStartTime = shiftStartTime;
              }
            }
            this.scheduleServiceScheduleService.createSchedule(staffScheduleList).subscribe(schedule => {
              // copy staff grid details
              this.scheduleServiceScheduleService.getScheduleDetails(this.newPlankey).subscribe(staffschedule => {
                  const staffScheduleArray: StaffSchedule[] = staffschedule;
                  sessionStorage.setItem('staffScheduleList', JSON.stringify(staffScheduleArray));
                  this.loadStaffGridDetailsCensus(staffScheduleArray, oldstaffScheduleList, planKey, this.newPlan);
                }
              );
            });
          });

          this.showMsg = true;
          this.isHide = false;
          setTimeout(() => {
            this.dialog.closeAll();
            document.body.classList.remove('pr-modal-open');
            sessionStorage.setItem('newPlanKey', this.newPlankey);
            this.router.navigate(['/plan-setup'], {queryParams: {plankey: this.newPlankey}});
          }, 1000);

        });
        });
      });
    }

  }


  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    this.deptStr = localStorage.getItem('listDeptKeys');
    if (this.deptStr != null) {
      this.deptArray = this.deptStr.split(',');

      this.deptListKeys = this.deptArray.map(Number);
      this.planService.getAllPlans().subscribe(data => {
        this.plansData = data;
      });
    }
    }

  checkDuplicate(planname: string ) {
    this.isHide = true;
    for (const planObj of this.plansData) {
      if (planObj.name.toUpperCase() === planname.trim().toUpperCase()) {
        this.isHide = false;
        break;
      }
    }
  }

  loadStaffGridDetailsCensus(newstaffScheduleList: StaffSchedule[], oldstaffScheduleList: StaffSchedule[],
                             planKey: string, planDetail: PlanDetails) {
    this.staffGridService.getStaffGridDetails(planKey).subscribe(data => {
      this.scheduleServiceScheduleService.getScheduleDetails(planKey).subscribe(scheduleData => {
        oldstaffScheduleList = scheduleData;
        let scheduleindex = 0;
        for (const schedule of oldstaffScheduleList) {
          let shiftindex = 0;
          for (const shift of schedule.planShiftList) {
            for (const staffGridCen of data) {
              if (shift.key === staffGridCen.shiftKey) {
                newstaffScheduleList[scheduleindex].planShiftList[shiftindex].staffGridCensuses.push(staffGridCen);
                const mappedShiftKey = newstaffScheduleList[scheduleindex].planShiftList[shiftindex].key;
                for (const census of newstaffScheduleList[scheduleindex].planShiftList[shiftindex].staffGridCensuses) {
                  census.key = null;
                  census.shiftKey = mappedShiftKey;
                }
              }
            }
            shiftindex = shiftindex + 1;
          }
          scheduleindex = scheduleindex + 1;
        }
        for (const sched of newstaffScheduleList) {
          for (const shiftstp of sched.planShiftList) {
            const staffGrid: StaffGrid[] = [];
            for (const sgd of shiftstp.staffGridCensuses) {
              for (const stp of sgd.staffToPatientList) {
                const staffGridData: StaffGrid = new StaffGrid() ;
                staffGridData.censusLookupKey = sgd.censusIndex;
                staffGridData.shiftLookupKey = '';
                staffGridData.variablePositionKey = stp.variablePositionKey;
                staffGridData.staffCount = stp.staffCount;
                staffGrid.push(staffGridData);
              }
            }
            shiftstp.staffGrid = staffGrid;
          }
        }
        for (const sched of newstaffScheduleList) {
          for (const shiftstp of sched.planShiftList) {
            let formatFlag = shiftstp.timeFormatFlag ? " AM":" PM"
            let shiftStartTime = shiftstp.startTime + formatFlag;
            shiftstp.shiftStartTime = shiftStartTime;
          }
        }
        let annualTotalHoursVariance = 0;
        if (this.newPlan.staffingSummaryData) {
          for (const staffSummary of this.newPlan.staffingSummaryData) {
            annualTotalHoursVariance = annualTotalHoursVariance + Number(staffSummary.annualHrsVarToTarget);
          }
        }
        this.newPlan.totalAnnualHoursVariance = annualTotalHoursVariance;
        this.staffGridService.saveStaffGridDetails(newstaffScheduleList, this.newPlan.status, this.newPlan.action,
          this.newPlan.totalAnnualHours, this.newPlan.totalAnnualHoursVariance).subscribe(newPlanData => {
        });
      });
    });
  }
}
