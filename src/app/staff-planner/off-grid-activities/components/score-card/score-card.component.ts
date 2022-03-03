import {Component, DoCheck, Input, OnInit} from '@angular/core';
import {OffGridActivities, ogaTypeKey} from '../../../../shared/domain/off-grid-activities';
import {PlanDetails} from '../../../../shared/domain/plan-details';


@Component({
  selector: 'app-score-card',
  templateUrl: './score-card.component.html',
  styleUrls: ['./score-card.component.scss']
})
export class ScoreCardComponent implements OnInit, DoCheck {
  @Input('planDetails') planDetails = new PlanDetails();
  offGrid: OffGridActivities;
  totalInhousehrs = 0;
  totalOrientationhrs = 0;
  totalCertificationhrs = 0;
  totalOtherhrs = 0;

  constructor() {
    this.offGrid = new OffGridActivities();
  }

  ngOnInit() {
  }

  ngDoCheck() {
    this.getActivitiesTotalHours();
  }

  getActivitiesTotalHours() {
    this.totalInhousehrs = 0;
    this.totalOrientationhrs = 0;
    this.totalCertificationhrs = 0;
    this.totalOtherhrs = 0;
    for (const offgridActivites of this.planDetails.offGridActivities) {
      const objOffGridactivity = offgridActivites;
      if (objOffGridactivity.typeKey === ogaTypeKey.InHouse) {
        this.totalInhousehrs = (1 * this.totalInhousehrs) + (1 * this.getTotalHours(objOffGridactivity));
      }
      if (objOffGridactivity.typeKey === ogaTypeKey.Certification) {
        this.totalCertificationhrs = (1 * this.totalCertificationhrs) + (1 * this.getTotalHours(objOffGridactivity));
      }
      if (objOffGridactivity.typeKey === ogaTypeKey.Orientation) {
        this.totalOrientationhrs = (1 * this.totalOrientationhrs) + (1 * this.getTotalHours(objOffGridactivity));
      }
      if (objOffGridactivity.typeKey === ogaTypeKey.Other) {
        this.totalOtherhrs = (1 * this.totalOtherhrs) + (1 * this.getTotalHours(objOffGridactivity));
      }
    }
  }

  isScorecardOverlaps() {
    if (this.totalInhousehrs.toFixed(0).length + ((this.totalInhousehrs) / this.planDetails.fte).toFixed(2).length >= 13) {
      return true;
    } else if (this.totalCertificationhrs.toFixed(0).length +
      ((this.totalCertificationhrs) / this.planDetails.fte).toFixed(2).length >= 13) {
      return true;
    } else if (this.totalOrientationhrs.toFixed(0).length + ((this.totalOrientationhrs) / this.planDetails.fte).toFixed(2).length >= 13) {
      return true;
    } else if (this.totalOtherhrs.toFixed(0).length + ((this.totalOtherhrs) / this.planDetails.fte).toFixed(2).length >= 13) {
      return true;
    } else {
      return false;
    }
  }

  getTotalHours(objOffGridActivities: OffGridActivities) {
    let sum = 0;
    for (const objoffgridact of objOffGridActivities.variableDepartmentList) {
      sum = (1 * sum) + (objOffGridActivities.shiftHours * objoffgridact.staffCount);
    }
    return sum;
  }

  check(data: number) {
    return isFinite(data);
  }
}
