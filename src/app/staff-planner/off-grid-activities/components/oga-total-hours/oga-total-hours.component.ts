import {Component, DoCheck, Input, OnInit} from '@angular/core';
import {OffGridActivities} from '../../../../shared/domain/off-grid-activities';
import {PlanDetails} from '../../../../shared/domain/plan-details';

@Component({
  selector: 'app-oga-total-hours',
  templateUrl: './oga-total-hours.component.html',
  styleUrls: ['./oga-total-hours.component.scss']
})
export class OgaTotalHoursComponent implements OnInit, DoCheck {
  @Input('planDetails') planDetails = new PlanDetails();

  totalOGAhrs;
  year: number;
  leapDays = 0;

  constructor() {
  }

  ngOnInit() {
    this.totalOGAhrs = 0;
    this.year = (new Date()).getFullYear();
    this.findLeapYear(this.year);
  }

  ngDoCheck() {
    this.getActivitiesTotalHours();
  }

  findLeapYear(year: number) {
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
      this.leapDays = 366;
    } else {
      this.leapDays = 365;
    }
  }

  getActivitiesTotalHours() {
    this.totalOGAhrs = 0;
    for (const offgridActivities of this.planDetails.offGridActivities) {
      const objOffGridactivity = offgridActivities;
      this.totalOGAhrs = (1 * this.totalOGAhrs) + (1 * this.getTotalHours(objOffGridactivity));
    }
  }

  getTotalHours(objOffGridActivities: OffGridActivities) {
    let sum = 0;
    for (const activities of objOffGridActivities.variableDepartmentList) {
      sum = (1 * sum) + (objOffGridActivities.shiftHours * activities.staffCount);
    }
    return sum;
  }

  isNumber(value): number{
    if (!isNaN(parseInt(value))) {
      return parseInt(value);
    }
    return 0;
  }

  getOgaTargetHours(){
    let ogaHours;
    if(this.planDetails.dailyFlag){
      ogaHours=Math.ceil((this.planDetails.utilizedAverageVolume*this.planDetails.targetBudget*this.planDetails.oAStaffingMetric.educationOrientationTargetPaid*this.leapDays)/100);
    }else{
      ogaHours=Math.ceil((this.planDetails.utilizedAverageVolume*this.planDetails.targetBudget*this.planDetails.oAStaffingMetric.educationOrientationTargetPaid)/100);
    }
    return ogaHours;
  }
}
