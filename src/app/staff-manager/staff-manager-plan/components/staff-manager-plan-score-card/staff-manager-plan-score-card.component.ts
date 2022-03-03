import {Component, HostListener, OnInit, Input} from '@angular/core';
import {ConfirmWindowOptions, PlanDetails} from '../../../../shared/domain/plan-details';
import {StaffVariance} from '../../../../shared/domain/staff-variance';
import {OAPlanData} from '../../../../shared/domain/OAPlanData';
import {OASuggestedData} from '../../../../shared/domain/OASuggestedData';
import {StaffGridCalculator} from '../../../../shared/domain/staff-grid-calculator';
import {OAService} from '../../../../shared/service/oa-service';
import * as moment from 'moment';

import {NonVariableDepartmentPosition} from '../../../../shared/domain/non-var-postn';
import {AlertBox} from '../../../../shared/domain/alert-box';
import {MatDialog} from '@angular/material/dialog';
import {ScheduleService} from '../../../../shared/service/schedule-service';
import {Util} from "../../../../shared/util/util";

@Component({
  selector: 'app-staff-manager-plan-score-card',
  templateUrl: './staff-manager-plan-score-card.component.html',
  styleUrls: ['./staff-manager-plan-score-card.component.scss']
})
export class StaffManagerPlanScoreCardComponent implements OnInit {
  @Input('staffVariance') staffVariance: StaffVariance = new StaffVariance();
  @Input('planDetails') planDetails: PlanDetails = new PlanDetails();
  oAPlanDataEntity = new OAPlanData();
  oASuggestedData = new OASuggestedData();
  currentDate = new Date();
  ogatotalhours = 0;
  ogaPlanHours = 0;
  nonVarTotalhours = 0;
  productivityIndex = 0;
  targetHours = 0;
  isProductivityIndexpositive = false;
  private flag = false;
  staffGridCalculator: StaffGridCalculator = new StaffGridCalculator();
  toggleTarget = 'Primary Target WHpU';
  toggleWhpu = 'ACTUAL WHpU';
  excludeEducationOrientationFlag = true;
  alertBox: AlertBox;
  constructor(private oaService: OAService, private dialog: MatDialog, private scheduleService: ScheduleService,) {
    this.alertBox = new AlertBox(this.dialog);
  }

  ngOnInit(): void {
    this.scheduleService.setStaffVarianceData(this.staffVariance);
    this.scheduleService.setPlanDetails(this.planDetails);
    this.getOGAPlanhours();
    this.getOGATotalhours();
    this.loadOAPlanDataEntity();
    this.getSuggestedData();
    setTimeout(() => {
      // console.log(this.getActualWHpU());
    }, 1000);


  }

  loadOAPlanDataEntity(): void {
    this.oAPlanDataEntity.facilityCode = this.planDetails.facilityCode != null ? this.planDetails.facilityCode :
      this.planDetails.facilityKey;
    this.oAPlanDataEntity.departmentCode = this.planDetails.departmentCode != null ? this.planDetails.departmentCode
      : this.planDetails.departmentKey;
    this.oAPlanDataEntity.planStartDate = moment(new Date(this.currentDate)).format('YYYY-MM-DD');
  }

  getSuggestedData(): void {
    this.oASuggestedData = this.planDetails.oAStaffingMetric;
    if (!Util.isNullOrUndefined(this.oASuggestedData)) {
      this.staffVariance.targetHours = this.oASuggestedData.workHourPerUnitPrimary;
    }
  }
  getProductivityIndex(): number {
    //Get lowEntTarget and upperEndTarget value from plan setup page, in future in will be dynamic value
    if (Util.isNullOrUndefined(this.planDetails.lowerEndTarget && this.planDetails.upperEndTarget)) {
      this.planDetails.lowerEndTarget = 100;
      this.planDetails.upperEndTarget = 120;
    }
    if (!Util.isNullOrUndefined(this.oASuggestedData && this.oASuggestedData.workHourPerUnitPrimary)) {
      this.productivityIndex = (this.oASuggestedData.workHourPerUnitPrimary / this.getActualWHpU()) * 100;
      if (this.productivityIndex >= this.planDetails.lowerEndTarget && this.productivityIndex <= this.planDetails.upperEndTarget) {
        this.isProductivityIndexpositive = true;
      } else {
        this.isProductivityIndexpositive = false;
      }
    }
    return isFinite(this.productivityIndex) ? this.productivityIndex : 0;
  }
  getWHpUExcludeEOFlag() {
    if (sessionStorage.getItem('wHpUExcludeEOFlag') !== undefined && sessionStorage.getItem('wHpUExcludeEOFlag') !== null) {
      this.excludeEducationOrientationFlag = JSON.parse(sessionStorage.getItem('wHpUExcludeEOFlag'));
    }
  }
  getOGATotalhours(): number {
    return this.scheduleService.getOGATotalhours();
  }
  getOGAPlanhours(): number {
    return this.scheduleService.getOGAPlanhours();
  }

  getActualWHpU(): number {
    return this.scheduleService.getActualWHPU(this.staffVariance, this.planDetails, true);
  }

  getActualHour(){
    return  this.getActualWHpU() * this.getAverageCensus();
  }

  getPlannedMinusDailyHours(): number {
    let dailyTotalHours: number;
    // WHpU E&O flag changes
    if (!(this.excludeEducationOrientationFlag)) {
      dailyTotalHours = this.scheduleService.getOGATotalhours();
    }
    let remainder = 0;
    if (dailyTotalHours < Number(this.ogatotalhours.toFixed(2))) {
      if (dailyTotalHours > 0 || (dailyTotalHours === 0 && this.flag) ) {
        remainder = Number(this.ogatotalhours.toFixed(2)) - dailyTotalHours;
      }
    }

    return Number(remainder.toFixed(2));
  }


  getAverageCensus(): number {
    return this.scheduleService.getAverageCensus();
  }
  getPlannedWHpU(): number {
    let totalPlanWhpu = 0;
    this.planDetails = this.staffGridCalculator.getSummaryData(this.planDetails);
    totalPlanWhpu = this.getTotalPlanWhpu();
    if (!Util.isNullOrUndefined(totalPlanWhpu)) {
      return totalPlanWhpu;
    } else {
      return 0;
    }
  }
  getTotalPlanWhpu(): number {
    let totalPlanWhpu = 0;
    if (this.isCensusExists()) {
      totalPlanWhpu = this.getPlanWHpuFromPlanner(Math.round(this.scheduleService.getAverageCensus()));
    }
    return totalPlanWhpu;
  }
  isCensusExists(): boolean {
    if (!Util.isNullOrUndefined(this.staffVariance.staffVarianceSummaries)) {
      for (const staffsummary of this.staffVariance.staffVarianceSummaries) {
        if (!Util.isNullOrUndefined(staffsummary.censusValue)) {
          return true;
        }
      }
    }
  }
  getPlanWHpuFromPlanner(census: number): number {
    for (const summarydata of this.planDetails.staffingSummaryData) {
      if (summarydata.census === census) {
        return summarydata.totalPlanWhpu;
      }
    }
  }
  check(value: any): boolean {
    if (Util.isNullOrUndefined(value)) {
      return false;
    } else {
      return true;
    }
  }
  checkHoursVariance(value: any, valueOne: any): boolean {
    if (Util.isNullOrUndefined(value) || value === 0 || Util.isNullOrUndefined(valueOne)) {
      return false;
    } else {
      return true;
    }
  }

  toggleScoreTextBasedOnDate(): void {
    if (this.staffVariance.selectedDate > this.staffVariance.recordDateForFuture) { // future date selected
      this.toggleTarget = 'Target WHpU';
      this.toggleWhpu = 'Expected WHpU';
    } else {
      this.toggleTarget = 'Primary Target WHpU';
      this.toggleWhpu = 'ACTUAL WHpU';
    }
  }
}
