import {PlanDetails} from './plan-details';
import {StaffSchedule,  StaffGridCensus,  staffToPatient,  shift,  shifttime } from './staff-schedule';
import {OffGridActivities} from './off-grid-activities';
import {StaffingMatrixSummaryData} from './staffing-matrix-summary';
import {NonVariableDepartmentPosition} from './non-var-postn';
import {Util} from "../util/util";

// This class act as library to calculate the staff grid summary
export class StaffGridCalculator {
  rowCount: number;
  lstStaffingMatrixSummaryData: StaffingMatrixSummaryData[] = [];
  cenRange: number[];
  constructor() {
    this.rowCount = 0;
  }

  getSummaryData(planDetails: PlanDetails): PlanDetails {
    this.populatePredefinedData(planDetails);
    this.lstStaffingMatrixSummaryData = [];
    let cenValPos = 0;
    // populate summary data for each census occurance
    for (const cen of this.cenRange) {
      const objStaffingMatrixSummaryData: StaffingMatrixSummaryData = new StaffingMatrixSummaryData();
      // store the census and ocurance value in the summary
      objStaffingMatrixSummaryData.census = cen;
      objStaffingMatrixSummaryData.occ = (Number)(planDetails.censusRange.occurrenceNumber[cen - 1]);
      // get the varaibale,non vriable and OGA hours as per the Formula sheet to calculate the totla plan WHPU
      objStaffingMatrixSummaryData.varWHPU = this.getvarWHPU(cen, planDetails);
      objStaffingMatrixSummaryData.nonVarWHPU = this.getnonVarWHPU(cen, planDetails);
      objStaffingMatrixSummaryData.ogaWHPU = this.getOGAWHPU(cen, planDetails);
      // totalPlanWhpu=varWHPU+nonVarWHPU+OGAWHPU;
      objStaffingMatrixSummaryData.totalPlanWhpu = objStaffingMatrixSummaryData.varWHPU +
        objStaffingMatrixSummaryData.nonVarWHPU + objStaffingMatrixSummaryData.ogaWHPU;
      // Get the remaining fields for summary page based of formula sheet
      objStaffingMatrixSummaryData.totalPlanDailyhrs = (this.getvarWHPU(cen, planDetails) +
        this.getnonVarWHPU(cen, planDetails) + this.getOGAWHPU(cen, planDetails)) * cen;
      objStaffingMatrixSummaryData.dailyHrsVarToTarget = objStaffingMatrixSummaryData.totalPlanDailyhrs -
        (planDetails.targetBudget * cen);
      objStaffingMatrixSummaryData.totalPlanAnnualHrs = objStaffingMatrixSummaryData.totalPlanDailyhrs *
        Number(planDetails.censusRange.occurrenceNumber[cen - 1]);
      objStaffingMatrixSummaryData.annualHrsVarToTarget = objStaffingMatrixSummaryData.dailyHrsVarToTarget *
        Number(planDetails.censusRange.occurrenceNumber[cen - 1]);
      objStaffingMatrixSummaryData.productivity = (planDetails.targetBudget / objStaffingMatrixSummaryData.totalPlanWhpu);
      // Productivity for each census needs to be assigned to shift which will be displayed a column in staff grid matrix page
      this.assignprodutivityValuesForallShifts(cen, objStaffingMatrixSummaryData.productivity,
        objStaffingMatrixSummaryData.totalPlanWhpu, planDetails);
      this.lstStaffingMatrixSummaryData.push(objStaffingMatrixSummaryData);
      cenValPos++;
    }

    const planDate: Date = new Date(planDetails.effectiveEndDate);
    let planYear: number;
    let planUtilizedVolume;
    planYear = planDate.getFullYear();
    let currentCalendarYearTotalDays  = this.getCurrentCalendarYearTotalDays(planDetails.effectiveEndDate);

    if (planDetails.dailyFlag) {
      planUtilizedVolume = planDetails.utilizedAverageVolume;
    } else {
      planUtilizedVolume = planDetails.utilizedAverageVolume / currentCalendarYearTotalDays;
    }

    // populate values for score card
    planDetails.totalAnnualVolume = this.getDayInYear(planYear) * planUtilizedVolume;

    let totalAnnualHours = 0;
    for (const summary of this.lstStaffingMatrixSummaryData) {
      totalAnnualHours = totalAnnualHours + summary.totalPlanAnnualHrs;
    }
    planDetails.totalAnnualHours = Math.round(totalAnnualHours);
    planDetails.totalAnnualHoursVariance = this.roundToTwo((planDetails.targetBudget *
    planDetails.totalAnnualVolume)) - planDetails.totalAnnualHours;
    // Assign the populated local summry list to plandetails
    planDetails.staffingSummaryData = this.lstStaffingMatrixSummaryData;
    return planDetails;
  }
  getCurrentCalendarYearTotalDays(effectiveEndDate) {
    let numberOfDays, currentYear;
    if (effectiveEndDate) {
      currentYear = new Date(effectiveEndDate).getFullYear();
      } else {
      currentYear = (new Date).getFullYear();
    }
    numberOfDays = ((currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0) ? 366 : 365;
    return numberOfDays;
  }

  // this method will round the number to 2 digits with preceding Zero
  roundToTwo(num): number {
    num = num + 'e+2';
    return +(Math.round(num) + 'e-2');
  }
  // generate the census level integer array based on Max and Min census
  populatePredefinedData(planDetails: PlanDetails): void {
    if (planDetails.censusRange) {
      this.cenRange = [];
      const crMin = planDetails.censusRange.minimumCensus;
      const crMax = planDetails.censusRange.maximumCensus;
      for (let j = crMin; j <= crMax; j++) {
        this.cenRange.push(j);
      }
    }
  }
  // This method will get the variableWhpU hours based on formula sheet
  getvarWHPU(censusLevel: number, planDetails: PlanDetails): number {
    const totalhours = this.getScheduleTotalhours(censusLevel, planDetails);
    return totalhours / (this.getDaysInPlan(planDetails) * censusLevel);
  }
  // This method will get return the available schedule days count.
  getDaysInPlan(planDetails: PlanDetails): number {
    let daysInPlan = 0;
    for (const schedule of planDetails.staffScheduleList) {
      const scheduleDays = Number(this.getDaysCountforSchedule(schedule));
      daysInPlan = daysInPlan + scheduleDays;
    }
    return daysInPlan;
  }
  // This method will get the NonvariableWhpU hours based on formula sheet
  getnonVarWHPU(censusLevel: number, planDetails: PlanDetails): number {
    return (this.getNonvarTotalhours(planDetails) / 7) / censusLevel;
  }
  // This method will get the non variable hours based on formula sheet (sum of (selected days * shifthr ))
  getNonvarTotalhours(planDetails: PlanDetails): number {
    let nonVarTotalhours = 0;
    for (const nonVar of planDetails.nonVariableDepartmentPositions) {
      nonVarTotalhours = nonVarTotalhours + nonVar.shiftHours * this.getNonvarDaysCount(nonVar);
    }
    return nonVarTotalhours;
  }
  // This method will get the OGAWHPU hours based on formula sheet
  getOGAWHPU(censusLevel: number, planDetails: PlanDetails): number {

    const planDate: Date = new Date(planDetails.effectiveEndDate);
    let planYear: number;
    planYear = planDate.getFullYear();

    return (this.getOGATotalhours(planDetails) / this.getDayInYear(planYear)) / censusLevel;
  }
  // This method will get OGATotalhours hours based on formula sheet (sum of OGA hour of each off grid activity)
  getOGATotalhours(planDetails: PlanDetails): number {
    let ogatotalhours = 0;
    let wHpUExcludeEOFlag = false;
    if (sessionStorage.getItem('wHpUExcludeEOFlag') !== undefined && sessionStorage.getItem('wHpUExcludeEOFlag') !== null) {
      wHpUExcludeEOFlag = JSON.parse(sessionStorage.getItem('wHpUExcludeEOFlag'));
    }
    if (!wHpUExcludeEOFlag) {
      for (const objOffGridActivities of planDetails.offGridActivities) {
        ogatotalhours = ogatotalhours + this.getTotalHours(objOffGridActivities);
      }
    }
    return ogatotalhours;
  }
  // This method will return  OGA hours of given activity (sum of vardepart(staff count * shifthr ))
  getTotalHours(objOffGridActivities: OffGridActivities): number {
    let sum = 0;
    for (const vardepart of objOffGridActivities.variableDepartmentList) {
      sum = (sum * 1) + (vardepart.staffCount * 1);
    }
    return sum * objOffGridActivities.shiftHours;
  }
  // This method will return 366 if the given year is Leap year else will return 365
  getDayInYear(year: number): number {
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
      return 366;
    } else {
      return 365;
    }
  }
  // this method will return number of selected days for given nonVariable position
  getNonvarDaysCount(objNonVariableDeptPosition: NonVariableDepartmentPosition): number {
    let nonVardays = 0;
    for (const day of objNonVariableDeptPosition.weekDays) {
      if (day.selected) {
        nonVardays++;
      }
    }
    return nonVardays;
  }
  // This method will get total schedules hours accross the plan
  getScheduleTotalhours(censusLevel: number, planDetails: PlanDetails): number {
    let scheduletotalhours = 0;
    for (const schedule of planDetails.staffScheduleList) {
      const scheduleDays = Number(this.getDaysCountforSchedule(schedule));

      let totalShiftHours = 0;
      for (const shift of schedule.planShiftList) {
        totalShiftHours = totalShiftHours + Number(this.getShiftHoursMultiplyByPositionSum(shift, censusLevel));
      }
      scheduletotalhours = scheduletotalhours + (totalShiftHours * scheduleDays);
    }
    return scheduletotalhours;
  }
  // this method will get number of selected days for the given schedule
  getDaysCountforSchedule(objSchdule: StaffSchedule): number {
    let dayCount = 0;

    let counter = 0;
    for (const isDaySelected of objSchdule.scheduleDays) {
      if (isDaySelected) {
        dayCount++;
      }
      counter++;
    }
    return dayCount;
  }
  // get staff grid staff count sum and mulitply by the shift hour for the given census level
  getShiftHoursMultiplyByPositionSum(objshif: shift, censusLevel: number): number {
    let sumPositions = 0;
    let objStaffGridCensus: StaffGridCensus;
    if (objshif.staffGridCensuses) {
      objStaffGridCensus = objshif.staffGridCensuses.filter(data => data.censusIndex === censusLevel)[0];
    }
    if (objStaffGridCensus) {
      for (const varpos of objStaffGridCensus.staffToPatientList) {
        sumPositions = sumPositions + Number(varpos.staffCount);
      }
    }
    return sumPositions * objshif.hours;
  }
  // Productivity for each census needs to be assigned to shift which will be displayed a column in staff grid matrix page
  assignprodutivityValuesForallShifts(censusIndex: number, productivityPercent: number, totalPlanWhpu: number , planDetails: PlanDetails): PlanDetails {
    if (!Util.isNullOrUndefined(planDetails.staffScheduleList)) {
      for (const schedule of planDetails.staffScheduleList) {
        if (!Util.isNullOrUndefined(schedule.planShiftList)) {
          for (const shift of schedule.planShiftList) {
            if (!Util.isNullOrUndefined(shift.staffGridCensuses)) {
              for (const objStaffGridCensuses of shift.staffGridCensuses) {
                // Assign the procutivity to StaffGridCensuses in the given census Index
                if (objStaffGridCensuses.censusIndex === censusIndex) {
                  objStaffGridCensuses.productivityIndex = productivityPercent;
                  objStaffGridCensuses.totalPlanWHpU = totalPlanWhpu;
                }
              }
            }
          }
        }
      }
    }
    return planDetails;
  }
}
