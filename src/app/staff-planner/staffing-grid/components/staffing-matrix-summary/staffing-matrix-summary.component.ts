import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {PlanDetails, ConfirmWindowOptions} from '../../../../shared/domain/plan-details';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {StaffingMatrixSummaryData, ColumnDefenition} from '../../../../shared/domain/staffing-matrix-summary';
import {Router} from '@angular/router';
import {StaffGridService} from '../../../../shared/service/Staffgrid-service';
import {PromptDialogComponent} from '../../../../shared/components/prompt-dialog/prompt-dialog.component';
import {PdfDataService} from '../../../../shared/service/pdf-data.service';

import {AlertBox} from '../../../../shared/domain/alert-box';
import {StaffGrid} from '../../../../shared/domain/staff-schedule';
import {Util} from "../../../../shared/util/util";

@Component({
  selector: 'app-staffing-matrix-summary',
  templateUrl: './staffing-matrix-summary.component.html',
  styleUrls: ['./staffing-matrix-summary.component.scss']
})

export class StaffingMatrixSummaryComponent implements OnInit {
  @Input('planDetails') planDetails: PlanDetails = new PlanDetails();
  @Input('planEdited') planEdited: boolean;
  @Input('excludeEducationAndOrientationFlag') excludeEducationAndOrientationFlag: boolean;
  staffingSummaryData: StaffingMatrixSummaryData[] = [];
  colDefs: ColumnDefenition[];
  displayCols: string[];
  alertBox: AlertBox;

  @ViewChild(MatSort) sort: MatSort;
  dataSource: MatTableDataSource<StaffingMatrixSummaryData>;


  constructor(private dialog: MatDialog, private router: Router, private pdfDataService: PdfDataService,
              private staffGridService: StaffGridService) {
    this.alertBox = new AlertBox(this.dialog);
  }

  ngOnInit(): void {
    this.getColumnDefenition();
    this.staffingSummaryData = this.planDetails.staffingSummaryData;
    if (!Util.isNullOrUndefined(this.planDetails.staffingSummaryData)) {
      this.staffingSummaryData = this.staffingSummaryData.sort((o1, o2) => o2.census - o1.census);
      for (const summaryData of this.staffingSummaryData) {
        summaryData.nonVarWHPU = summaryData.nonVarWHPU * summaryData.census;
        summaryData.ogaWHPU = summaryData.ogaWHPU * summaryData.census;
      }
    }

    this.dataSource = new MatTableDataSource(this.staffingSummaryData);
    setTimeout(() => this.dataSource.sort = this.sort);
  }

  clickonAddSchedule(): void {
    if (this.planEdited) {
      document.body.classList.add('pr-modal-open');
      const dialogRef = this.alertBox.openAlertWithSaveAndReturn('exit-dialog', '248px', '600px',
        'Exit Staffing Grid Setup', 'You will be going back to the previous screen to add or delete a schedule.');
      dialogRef.afterClosed().subscribe(result => {
        document.body.classList.remove('pr-modal-open');
        if (result) {
          if (result === ConfirmWindowOptions.save) {
            this.saveStaffGridDetailsandGoBack();
          }
          this.router.navigate(['/staff-schedule'], {queryParams: {plankey: this.planDetails.key}});
        }
      });
    } else {
      this.router.navigate(['/staff-schedule'], {queryParams: {plankey: this.planDetails.key}});
    }
  }

  saveStaffGridDetailsandGoBack(): void {
    window.clearInterval(this.staffGridService.autoSaveInterval);
    if (!this.planDetails.planCompleted) {
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
      this.staffGridService.saveStaffGridDetails(this.planDetails.staffScheduleList,
        this.planDetails.status, this.planDetails.action, this.planDetails.totalAnnualHours,
        this.planDetails.totalAnnualHoursVariance).subscribe(data => {
      }, error1 => {
      });
    }
  }

  findLeapYear(): number {
    const planDate: Date = new Date(this.planDetails.effectiveEndDate);
    let planYear: number;
    planYear = planDate.getFullYear();

    if ((planYear % 4 === 0 && planYear % 100 !== 0) || planYear % 400 === 0) {
      return 366;
    } else {
      return 365;
    }
  }

  getColumnDefenition(): void {
    this.colDefs = !this.excludeEducationAndOrientationFlag ? [
      {id: 'census', value: 'CENSUS', type: 'integer'},
      {id: 'occ', value: 'occurrence at each census', type: 'integer'},
      {id: 'productivity', value: 'productivity (percent)', type: 'percent'},
      {id: 'varWHPU', value: 'variable whpu', type: 'decimal'},
      {id: 'nonVarWHPU', value: 'non-variable hours', type: 'decimal'},
      {id: 'ogaWHPU', value: 'oga hours', type: 'decimal'},
      {id: 'totalPlanWhpu', value: 'total plan whpu', type: 'decimal'},
      {id: 'totalPlanDailyhrs', value: 'total plan daily hours', type: 'decimal'},
      {id: 'dailyHrsVarToTarget', value: 'daily hours variance to target', type: 'decimal'},
      {id: 'totalPlanAnnualHrs', value: 'total plan annual hours', type: 'decimal'},
      {id: 'annualHrsVarToTarget', value: 'annual hours variance to target', type: 'decimal'}
    ] : [
      {id: 'census', value: 'CENSUS', type: 'integer'},
      {id: 'occ', value: 'occurrence at each census', type: 'integer'},
      {id: 'productivity', value: 'productivity (percent)', type: 'percent'},
      {id: 'varWHPU', value: 'variable whpu', type: 'decimal'},
      {id: 'nonVarWHPU', value: 'non-variable hours', type: 'decimal'},
      {id: 'totalPlanWhpu', value: 'total plan whpu', type: 'decimal'},
      {id: 'totalPlanDailyhrs', value: 'total plan daily hours', type: 'decimal'},
      {id: 'dailyHrsVarToTarget', value: 'daily hours variance to target', type: 'decimal'},
      {id: 'totalPlanAnnualHrs', value: 'total plan annual hours', type: 'decimal'},
      {id: 'annualHrsVarToTarget', value: 'annual hours variance to target', type: 'decimal'}
    ];
    this.displayCols = this.colDefs.map(x => x.id);
  }

  checkProductivityIndex(cenProductivityIndex: number): boolean {
     //Get lowEntTarget and upperEndTarget value from plan setup page, in future it will be dynamic value
     if (Util.isNullOrUndefined(this.planDetails.lowerEndTarget && this.planDetails.upperEndTarget)) {
      this.planDetails.lowerEndTarget = 100;
      this.planDetails.upperEndTarget = 120;
    }
    const objCenProductivityIndex = cenProductivityIndex * 100;
    if (objCenProductivityIndex >= this.planDetails.lowerEndTarget && objCenProductivityIndex <= this.planDetails.upperEndTarget) {
      return true;
    } else {
      return false;
    }
  }

  generatePdf(): void {
    let sortOrder = 'desc';
    if (this.sort !== null && this.sort !== undefined) {
      sortOrder = this.sort.direction.length === 0 ? 'desc' : this.sort.direction;
    }
    const fileName = this.planDetails.departmentCode + ' - ' + this.planDetails.name + ' - Summary';
    this.pdfDataService.createPdf(this.planDetails, '0', sortOrder, fileName);
  }

  getBestOption(index: number): number {
    if (this.staffingSummaryData || this.staffingSummaryData.length > 0) {
      return this.staffingSummaryData[index].census;
    } else {
      return 0;
    }
  }

  roundAverage(value: number): number {
    return parseInt(value.toString(), 10);
  }

  check(value: number): boolean {
    return isFinite(value);
  }

}
