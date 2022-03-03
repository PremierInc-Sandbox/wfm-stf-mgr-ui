import {Component, OnInit, EventEmitter, Output, ViewChild, HostListener} from '@angular/core';
import {PlanService} from '../../../shared/service/plan-service';
import {staffingMatrixData} from '../staffing-grid.mock';
import {PlanDetails, ConfirmWindowOptions} from '../../../shared/domain/plan-details';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {Router, ActivatedRoute} from '@angular/router';
import {ScheduleService} from '../../../shared/service/schedule-service';
import {StaffGridService} from '../../../shared/service/Staffgrid-service';
import {StaffSchedule, StaffGridCensus, staffToPatient, shift, StaffGrid} from '../../../shared/domain/staff-schedule';
import {SubmitPlanModelComponent} from '../components/submit-plan-model/submit-plan-model.component';
import {ChangeDetectorRef} from '@angular/core';
import {PromptDialogComponent} from '../../../shared/components/prompt-dialog/prompt-dialog.component';
import {StaffingMatrixSummaryComponent} from '../components/staffing-matrix-summary/staffing-matrix-summary.component';

import {AlertBox} from '../../../shared/domain/alert-box';
import {OAPlanData} from '../../../shared/domain/OAPlanData';
import {OASuggestedData} from '../../../shared/domain/OASuggestedData';
import {OAService} from '../../../shared/service/oa-service';
import { PlatformLocation } from '@angular/common';
import * as moment from 'moment';
import {Observable} from "rxjs";
import {RouterHistoryTrackerService} from "../../../shared/service/router-history-tracker.service";
import {Util} from "../../../shared/util/util";

@Component({
  selector: 'app-staffing-grid',
  templateUrl: './staffing-grid.component.html',
  styleUrls: ['./staffing-grid.component.scss']
})
export class StaffingGridComponent implements OnInit {
  planDetails: PlanDetails = new PlanDetails();
  planKey: string;
  tabIndex = 0;
  showMatrixSummary = false;
  entitydisplayval: string;
  departmentdisplayval: string;
  primaryWHpUdisplayval: string;
  annualBudgetdisplayval: string;
  autoSavedStatus = '';
  private autoSaveHours: number;
  private autoSaveMeridian: string;

  cenRange: number[];

  minCensusSaved = 0;
  maxCensusSaved = 0;

  btnExittxt: string;
  alertBox: AlertBox;

  tabSelected = [true, true, true, false];
  previousIndex = 3;
  @ViewChild('pageGroup') pageGroup;


  @ViewChild('tabGroup') tabGroup;
  @ViewChild('summaryTab') summaryTab: StaffingMatrixSummaryComponent;
  excludeEducationAndOrientationFlag = true;

  oAPlanDataEntity = new OAPlanData();
  oASuggestedData = new OASuggestedData();
  dataSaved =  false;
  saveAndExit = false;
  strplanDetails = '';
  isBackButtonClicked = false;
  wHpUExcludeEOFlag: boolean;

  constructor(private dialog: MatDialog,
              private route: ActivatedRoute,
              private scheduleServiceScheduleService: ScheduleService,
              private staffGridService: StaffGridService,
              private router: Router, private planService: PlanService,
              private cdref: ChangeDetectorRef, private oaService: OAService, private platformLocation: PlatformLocation,
              private routerTracker : RouterHistoryTrackerService) {
    this.alertBox = new AlertBox(this.dialog);
    platformLocation.onPopState(() => {
      window.clearInterval(this.staffGridService.autoSaveInterval);
      //this.isBackButtonClicked = true;
      });
  }

  ngOnInit(): void {
    this.planService.isRoutedFlag = true;
    const wHpUExcludeEOFlag = this.alertBox.getWHpUExcludeEOFlag();
    if (!wHpUExcludeEOFlag) {
      this.previousIndex = 3;
      this.excludeEducationAndOrientationFlag = false;
    } else {
      this.previousIndex = 2;
      this.excludeEducationAndOrientationFlag = true;
    }
    this.loadplandetails();
    this.triggerAutoSave();
  }

  triggerAutoSave(): void {
      this.staffGridService.autoSaveInterval = (Number)(setInterval(() => {
          this.autoSave();
      }, 120000));
  }

    @HostListener('document:keydown', ['$event'])
    @HostListener('document:click', ['$event'])
    restartAutoSaveTrigger(event): void {
        window.clearInterval(this.staffGridService.autoSaveInterval);
        this.triggerAutoSave();
    }

  autoSave(): void {
      if (!this.planDetails.planCompleted && !this.saveAndExit) {
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
                staffGridData.variablePositionCategoryDescription=stp.variablePositionCategoryDescription;
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
          let isReloadNeeded = false;
        let annualTotalHoursVariance = 0;
        if (this.planDetails.staffingSummaryData) {
          for (const staffSummary of this.planDetails.staffingSummaryData) {
            annualTotalHoursVariance = annualTotalHoursVariance + Number(staffSummary.annualHrsVarToTarget);
          }
        }
        this.planDetails.totalAnnualHoursVariance =  Math.round(annualTotalHoursVariance);
          this.staffGridService.saveStaffGridDetails(this.planDetails.staffScheduleList, this.planDetails.status, this.planDetails.action,
            this.planDetails.totalAnnualHours, this.planDetails.totalAnnualHoursVariance).subscribe(data => {
        this.strplanDetails = this.getPlanStringForComparison(this.planDetails);
        this.dataSaved = true;
        }, error1 => {
          this.dataSaved = false;
        });
          for (const staffSchedule of this.planDetails.staffScheduleList) {
              for (const planShift of staffSchedule.planShiftList) {
                  for (const staffGridCensuse of planShift.staffGridCensuses) {
                      if (Util.isNullOrUndefined(staffGridCensuse.key) || staffGridCensuse.key === '') {
                          isReloadNeeded = true;
                          break;
                      }
                  }
              }
          }

          if (new Date().getHours() > 11) {
              this.autoSaveMeridian = ' PM';
              if (new Date().getHours() > 12) {
                  this.autoSaveHours = new Date().getHours() - 12;
              } else {
                  this.autoSaveHours = new Date().getHours();
              }
          } else {
              this.autoSaveMeridian = ' AM';
              this.autoSaveHours = new Date().getHours();
          }
          if (isReloadNeeded) {
              this.loadplandetails();
          }
          // tslint:disable-next-line:max-line-length
          this.autoSavedStatus = 'Plan is auto saved at: ' + (this.autoSaveHours < 10 ? '0' + this.autoSaveHours : this.autoSaveHours) + ':' +  (new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes()) + this.autoSaveMeridian;
          setTimeout(() => {
              this.autoSavedStatus = '';
          }, 15000);
      }
  }

  checkIfSummaryTabIsActive(): void {
    if (this.tabGroup.selectedIndex === this.planDetails.staffScheduleList.length) {
      this.summaryTab.ngOnInit();
    }
  }

  addThousandSepToStr(str: string): string {
    return str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  saveStaffGridDetailsandGoBack(): void {
    window.clearInterval(this.staffGridService.autoSaveInterval);
    for (const staffSchedule of this.planDetails.staffScheduleList) {
      for (const planShift of staffSchedule.planShiftList) {
        for (const staffGridCensuse of planShift.staffGridCensuses) {
          for (const staffToPatientVal of staffGridCensuse.staffToPatientList){
            if (Util.isNullOrUndefined(staffToPatientVal.staffCount) || staffToPatientVal.staffCount.toString() === '' ) {
              staffToPatientVal.staffCount = 0 ;
            }
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
            staffGridData.variablePositionCategoryDescription=stp.variablePositionCategoryDescription;
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
    if (!this.planDetails.planCompleted) {
      let annualTotalHoursVariance = 0;
      if (this.planDetails.staffingSummaryData) {
        for (const staffSummary of this.planDetails.staffingSummaryData) {
          annualTotalHoursVariance = annualTotalHoursVariance + Number(staffSummary.annualHrsVarToTarget);
        }
      }
      this.planDetails.totalAnnualHoursVariance =  Math.round(annualTotalHoursVariance);
      this.staffGridService.saveStaffGridDetails(this.planDetails.staffScheduleList,
        this.planDetails.status, this.planDetails.action, this.planDetails.totalAnnualHours,
        this.planDetails.totalAnnualHoursVariance).subscribe(data => {
        this.saveAndExit = false;
        this.clickOnTabOrCancelButton();
      }, error1 => {
        this.saveAndExit = false;
        this.clickOnTabOrCancelButton();
      });
    }
  }
  saveAndExitStaffGridDetails(): void {
    this.isBackButtonClicked = false;
    this.saveAndExit = true;
    window.clearInterval(this.staffGridService.autoSaveInterval);
    for (const staffSchedule of this.planDetails.staffScheduleList) {
      for (const planShift of staffSchedule.planShiftList) {
        for (const staffGridCensuse of planShift.staffGridCensuses) {
          for (const staffToPatientVal of staffGridCensuse.staffToPatientList){
            if (Util.isNullOrUndefined(staffToPatientVal.staffCount) || staffToPatientVal.staffCount.toString() === '' ) {
              staffToPatientVal.staffCount = 0 ;
            }
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
            staffGridData.variablePositionCategoryDescription=stp.variablePositionCategoryDescription;
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
    if (!this.planDetails.planCompleted) {
      let annualTotalHoursVariance = 0;
      if (this.planDetails.staffingSummaryData) {
        for (const staffSummary of this.planDetails.staffingSummaryData) {
          annualTotalHoursVariance = annualTotalHoursVariance + Number(staffSummary.annualHrsVarToTarget);
        }
      }
      this.planDetails.totalAnnualHoursVariance =  Math.round(annualTotalHoursVariance);
      this.staffGridService.saveStaffGridDetails(this.planDetails.staffScheduleList,
        this.planDetails.status, this.planDetails.action, this.planDetails.totalAnnualHours,
        this.planDetails.totalAnnualHoursVariance).subscribe(data => {
        this.saveAndExit = false;
        window.clearInterval(this.staffGridService.autoSaveInterval);
        // this.removeSessionAttributes();
        sessionStorage.removeItem('lock');
        this.router.navigate(['/home']);
      }, error1 => {
        // this.removeSessionAttributes();
        window.clearInterval(this.staffGridService.autoSaveInterval);
        sessionStorage.removeItem('lock');
        this.router.navigate(['/home']);
        this.saveAndExit = false;
      });
    }else{
      // this.removeSessionAttributes();
      sessionStorage.removeItem('lock');
      this.router.navigate(['/home']);
    }
  }
  checkIfPlanEdited(): boolean {
    const tempStrPlanDetails = this.getPlanStringForComparison(this.planDetails);

    if (this.strplanDetails === tempStrPlanDetails || Util.isNullOrUndefined(this.strplanDetails) || this.strplanDetails === '') {
      return false;
    } else {
      return true;
    }
  }

  getPlanStringForComparison( plan: PlanDetails): string
  {
    const tempStrPlanDetails = JSON.stringify(plan);
    let templan:PlanDetails =JSON.parse(tempStrPlanDetails);
    templan.totalAnnualHoursVariance = null;
    templan.totalAnnualVolume = null;

    return JSON.stringify(templan);
  }
  clickonbackbutton(): void {
    this.isBackButtonClicked = false;
    if (this.planDetails.planCompleted) {
      this.clickOnTabOrCancelButton();
    } else {
      if (!this.dataSaved && this.checkIfPlanEdited()) {
        document.body.classList.add('pr-modal-open');
        const dialogRef = this.alertBox.openAlertWithSaveAndReturn('exit-dialog',
          '210px', '600px', 'Exit Staffing Grid','');
        dialogRef.afterClosed().subscribe(result => {
          document.body.classList.remove('pr-modal-open');
          if (result) {
          if (result === ConfirmWindowOptions.save) {
            this.saveStaffGridDetailsandGoBack();
          }else{
            window.clearInterval(this.staffGridService.autoSaveInterval);
            this.clickOnTabOrCancelButton();
          }
          } else {
            this.pageGroup.selectedIndex = this.previousIndex;
          }
        });
      } else {
        window.clearInterval(this.staffGridService.autoSaveInterval);
        this.clickOnTabOrCancelButton();
      }
    }

  }

  loadplandetails(): void {
    this.planKey = localStorage.getItem('plankey');
    if ((!this.planKey) || this.planKey === '') {
      this.route.queryParamMap.subscribe(queryParams => {
        this.planKey = queryParams.get('plankey');
      });
    }

    let previousLock = true;
    let systemOptionValue;
    this.planService.getPlandetails(this.planKey).subscribe(data => {
        if (!Util.isNullOrUndefined(this.planService.planAlreadyInUse) && !this.planService.planAlreadyInUse) {
            previousLock = false;
        }
        this.planDetails = data;
      if (this.planDetails.effectiveStartDate !== null && this.planDetails.effectiveStartDate !== undefined) {
        if((this.alertBox.isNullOrUndefined(sessionStorage.getItem('wHpUExcludeEOFlag'))) || ((this.alertBox.isNullOrUndefined(sessionStorage.getItem('wHpUExcludeEOFKey'))) || sessionStorage.getItem('wHpUExcludeEOFKey') !== JSON.stringify(this.planDetails.facilityKey))){
          this.planService.getSystemOptionValuesFromDTM(this.planDetails.facilityKey, moment(new Date(this.planDetails.effectiveStartDate)).format('YYYY-MM-DD')).subscribe(data => {
            if (data['data'] === 2) {
              systemOptionValue = 'Exclude E&O';
              this.excludeEducationAndOrientationFlag = true;
            } else {
              if (data['data'] === 1) {
                systemOptionValue = 'Paid';
              } else {
                systemOptionValue = 'Worked';
              }
              this.excludeEducationAndOrientationFlag = false;
            }
            sessionStorage.setItem('wHpUExcludeEOFlag', JSON.stringify(this.excludeEducationAndOrientationFlag));
            sessionStorage.setItem('wHpUExcludeEOFKey', JSON.stringify(this.planDetails.facilityKey));
            sessionStorage.setItem('systemOptionValue', systemOptionValue);
            if (!this.excludeEducationAndOrientationFlag) {
              this.previousIndex = 3;
            } else {
              this.previousIndex = 2;
            }
          });
        }
      }
        sessionStorage.setItem('plankey', this.planDetails.key);
        if (!previousLock) {
            this.planDetails.planAlreadyInUse = false;
        }
        this.checkForSessionAttributes();
        this.loadButtontext();
        this.updateDataFromOA();
      // Get header display values
      this.loadSchedules();

    });

  }

  getDaysInplanYear(): number {
    const planDate: Date = new Date(this.planDetails.effectiveEndDate);
    let planYear: number;
    planYear = planDate.getFullYear();

    if ((planYear % 4 === 0 && planYear % 100 !== 0) || planYear % 400 === 0) {
      return 366;
    } else {
      return 365;
    }
  }

  loadButtontext(): void {
    if (this.planDetails.planCompleted) {
      this.btnExittxt = 'Exit';
    } else {
      this.btnExittxt = 'Save & Exit';
    }

  }

  loadStaffGridDetails(staffScheduleList: StaffSchedule[]): void {
    this.staffGridService.getStaffGridDetails(this.planKey).subscribe(data => {
      for (const staffGridCen of data) {
        for (const staffSchedule of staffScheduleList) {
          for (const staffShift of staffSchedule.planShiftList) {
            if (staffShift.key === staffGridCen.shiftKey) {
              this.checkForNewlyAddedVarpos(staffGridCen, staffShift);
              if (!staffShift.staffGridCensuses) {
                staffShift.staffGridCensuses = [];
              }
              staffGridCen.censusValue = Number(this.planDetails.censusRange.occurrenceNumber[staffGridCen.censusIndex - 1]);
              this.orderStaffGridCensusByVarpos(staffGridCen);
              staffShift.staffGridCensuses.push(staffGridCen);
            }
            this.orderStafftoPatientByVarpos(staffShift);
          }
        }

      }

      this.planDetails.staffScheduleList = staffScheduleList;
      this.populateData();

      if (this.planDetails.planCompleted) {
        sessionStorage.setItem('plankey', this.planDetails.key);
        this.tabIndex = this.planDetails.staffScheduleList.length;
      }
      setTimeout( () => this.strplanDetails =this.getPlanStringForComparison(this.planDetails), 1000);
    });
  }

  orderStaffGridCensusByVarpos(objStaffGridCensus: StaffGridCensus): void {
    const staffGridCensusActivities: staffToPatient[] = [];
    this.planDetails.variableDepartmentPositions.forEach(ele => {
      const staffGridCensusActivity = objStaffGridCensus.staffToPatientList.filter
      (eleStaff => eleStaff.variablePositionKey === ele.categoryKey && eleStaff.variablePositionCategoryDescription===ele.categoryDescription)[0];
      if (staffGridCensusActivity) {
        staffGridCensusActivities.push(staffGridCensusActivity);
      }
    });
    objStaffGridCensus.staffToPatientList = staffGridCensusActivities;
  }

  orderStafftoPatientByVarpos(objShift: shift): void {
    const staffToPatientList: staffToPatient[] = [];
    this.planDetails.variableDepartmentPositions.forEach(ele => {
      const objstaffToPatient = objShift.staffToPatientList.filter(eleStaff => eleStaff.variablePositionKey === ele.categoryKey && eleStaff.variablePositionCategoryDescription===ele.categoryDescription)[0];
      if (objstaffToPatient) {
        staffToPatientList.push(objstaffToPatient);
      }
    });
    objShift.staffToPatientList = staffToPatientList;
  }

  checkForNewlyAddedVarpos(staffGridCen: StaffGridCensus, staffShift: shift): void {
    for (const staffToPatientratio of staffShift.staffToPatientList) {
      let isVarPosFound = false;
      for (const censusstaffToPatientratio of staffGridCen.staffToPatientList) {
        if (censusstaffToPatientratio.variablePositionKey === staffToPatientratio.variablePositionKey && censusstaffToPatientratio.variablePositionCategoryDescription===staffToPatientratio.variablePositionCategoryDescription) {
          isVarPosFound = true;
        }
      }
      // newly added variable position
      if (!isVarPosFound) {
        const objStaffToPatient: staffToPatient = new staffToPatient();
        objStaffToPatient.variablePositionCategoryAbbreviation = staffToPatientratio.variablePositionCategoryAbbreviation;
        objStaffToPatient.variablePositionCategoryDescription = staffToPatientratio.variablePositionCategoryDescription;
        objStaffToPatient.variablePositionKey = staffToPatientratio.variablePositionKey;
        // pre-populate values
        if (staffToPatientratio.staffCount) {
          if (staffGridCen.censusIndex % staffToPatientratio.staffCount === 0) {
            objStaffToPatient.staffCount = staffGridCen.censusIndex / staffToPatientratio.staffCount;
          } else {
            objStaffToPatient.staffCount = ((staffGridCen.censusIndex - (staffGridCen.censusIndex % staffToPatientratio.staffCount))
              / staffToPatientratio.staffCount) + 1;
          }
        } else {
          objStaffToPatient.staffCount = 0;
        }
        staffGridCen.staffToPatientList.push(objStaffToPatient);
      }
    }

  }

  populateData(): void {
    if (this.planDetails.censusRange) {
      this.cenRange = [];
      const crMin = this.planDetails.censusRange.minimumCensus;
      const crMax = this.planDetails.censusRange.maximumCensus;
      for (let j = crMin; j <= crMax; j++) {
        this.cenRange.push(j);
      }
    }
    for (const staffSchedule of this.planDetails.staffScheduleList) {
      for (const shift of staffSchedule.planShiftList) {
        shift.staffGridCensuses.sort(this.sortData);
        // if staffgridcensus value is null
        if (!shift.staffGridCensuses || shift.staffGridCensuses.length === 0) {
          shift.staffGridCensuses = [];

          let cenValPos = 0;
          for (const cen of this.cenRange) {

            const objstaffGridCensus = new StaffGridCensus();
            objstaffGridCensus.censusIndex = cen;
            objstaffGridCensus.censusValue = Number(this.planDetails.censusRange.occurrenceNumber[cen - 1]);
            for (const objstaffToPatient of shift.staffToPatientList) {
              let stpval = 1;
              const objnewStaffToPatient: staffToPatient = new staffToPatient();
              objnewStaffToPatient.variablePositionCategoryAbbreviation = objstaffToPatient.variablePositionCategoryAbbreviation;
              objnewStaffToPatient.variablePositionCategoryDescription = objstaffToPatient.variablePositionCategoryDescription;
              objnewStaffToPatient.variablePositionKey = objstaffToPatient.variablePositionKey;

              if (objstaffToPatient.staffCount > 0) {
                if (cen > objstaffToPatient.staffCount) {
                  if (cen % objstaffToPatient.staffCount === 0) {
                    stpval = cen / objstaffToPatient.staffCount;
                  } else {
                    stpval = ((cen - (cen % objstaffToPatient.staffCount)) / objstaffToPatient.staffCount) + 1;
                  }

                }
                objnewStaffToPatient.staffCount = stpval;
              } else {
                objnewStaffToPatient.staffCount = 0;
              }
              objstaffGridCensus.staffToPatientList.push(objnewStaffToPatient);
            }
            shift.staffGridCensuses.push(objstaffGridCensus);

            cenValPos++;
          }

        } else if (this.checkIfCensusangeIncreased(shift)) {
          // add newly added census rows to existing saved census rows ///census range changed by increasing the max
          this.maxCensusSaved++;
          while (this.maxCensusSaved <= this.planDetails.censusRange.maximumCensus) {
            const cen = this.maxCensusSaved;
            const objstaffGridCensus = new StaffGridCensus();
            objstaffGridCensus.censusIndex = cen;
            objstaffGridCensus.censusValue = Number(this.planDetails.censusRange.occurrenceNumber[cen - 1]);

            for (const objstaffToPatient of shift.staffToPatientList) {
              let stpval = 1;
              const objnewStaffToPatient: staffToPatient = new staffToPatient();
              objnewStaffToPatient.variablePositionCategoryAbbreviation = objstaffToPatient.variablePositionCategoryAbbreviation;
              objnewStaffToPatient.variablePositionCategoryDescription = objstaffToPatient.variablePositionCategoryDescription;
              objnewStaffToPatient.variablePositionKey = objstaffToPatient.variablePositionKey;
              if (objstaffToPatient.staffCount > 0) {
                if (cen > objstaffToPatient.staffCount) {
                  if (cen % objstaffToPatient.staffCount === 0) {
                    stpval = cen / objstaffToPatient.staffCount;
                  } else {
                    stpval = ((cen - (cen % objstaffToPatient.staffCount)) / objstaffToPatient.staffCount) + 1;
                  }

                }
                objnewStaffToPatient.staffCount = stpval;
              } else {
                objnewStaffToPatient.staffCount = 0;
              }
              objstaffGridCensus.staffToPatientList.push(objnewStaffToPatient);
            }

            shift.staffGridCensuses.push(objstaffGridCensus);
            this.maxCensusSaved++;
          }
          // add newly added census rows to existing saved census rows ///census range changed by reducing the min
          let isMinCensusReduced = false;
          this.minCensusSaved--;
          while (this.minCensusSaved >= this.planDetails.censusRange.minimumCensus) {
            isMinCensusReduced = true;
            const cen = this.minCensusSaved;
            const objstaffGridCensus = new StaffGridCensus();
            objstaffGridCensus.censusIndex = cen;
            objstaffGridCensus.censusValue = Number(this.planDetails.censusRange.occurrenceNumber[cen - 1]);

            for (const objstaffToPatient of shift.staffToPatientList) {
              let stpval = 1;
              const objnewStaffToPatient: staffToPatient = new staffToPatient();
              objnewStaffToPatient.variablePositionCategoryAbbreviation = objstaffToPatient.variablePositionCategoryAbbreviation;
              objnewStaffToPatient.variablePositionCategoryDescription = objstaffToPatient.variablePositionCategoryDescription;
              objnewStaffToPatient.variablePositionKey = objstaffToPatient.variablePositionKey;

              if (objstaffToPatient.staffCount > 0) {
                if (cen > objstaffToPatient.staffCount) {
                  if (cen % objstaffToPatient.staffCount === 0) {
                    stpval = cen / objstaffToPatient.staffCount;
                  } else {
                    stpval = ((cen - (cen % objstaffToPatient.staffCount)) / objstaffToPatient.staffCount) + 1;
                  }

                }
                objnewStaffToPatient.staffCount = stpval;
              } else {
                objnewStaffToPatient.staffCount = 0;
              }
              objstaffGridCensus.staffToPatientList.push(objnewStaffToPatient);
            }

            shift.staffGridCensuses.push(objstaffGridCensus);
            this.minCensusSaved--;
          }
          if (isMinCensusReduced) {
            shift.staffGridCensuses.sort(this.sortData);
          }
        }

      }
    }

    this.showMatrixSummary = true;

  }

  sortData(a, b): 0 | 1 | -1 {
    return (a.censusIndex > b.censusIndex) ? 1 :
      (a.censusIndex < b.censusIndex) ? -1 : 0;
  }

  checkIfCensusangeIncreased(objshift: shift): boolean {
    const censusData = this.alertBox.checkIfCensusangeIncreased(objshift, this.planDetails);
    const isCensusangeIncreased = Boolean(censusData.pop());
    this.maxCensusSaved = Number(censusData.pop());
    this.minCensusSaved = Number(censusData.pop());
    return isCensusangeIncreased;
  }

  loadSchedules(): void {

    this.scheduleServiceScheduleService.getScheduleDetails(this.planKey).subscribe(data => {
      this.loadStaffGridDetails(data);
    });

  }

  submitPlan(): void {
    this.isBackButtonClicked = false;
    for (const staffSchedule of this.planDetails.staffScheduleList) {
      for (const planShift of staffSchedule.planShiftList) {
        for (const staffGridCensuse of planShift.staffGridCensuses) {
          for (const staffToPatientVal of staffGridCensuse.staffToPatientList){
            if (Util.isNullOrUndefined(staffToPatientVal.staffCount) || staffToPatientVal.staffCount.toString() === '' ) {
              staffToPatientVal.staffCount = 0 ;
            }
          }
        }
      }
    }
    sessionStorage.setItem('plandetails', JSON.stringify(this.planDetails));
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.panelClass = '';
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    document.body.classList.add('pr-modal-open');
    const planmodal = this.dialog.open(SubmitPlanModelComponent, dialogConfig);
    planmodal.afterClosed().subscribe(res => {
      window.clearInterval(this.staffGridService.autoSaveInterval);
      // this.removeSessionAttributes();
      document.body.classList.remove('pr-modal-open');
    });
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
    if (Math.round((this.planDetails.budgetAverageVolume * this.getDaysInplanYear())) !== 0) {
      this.annualBudgetdisplayval = Math.round((this.planDetails.budgetAverageVolume * this.getDaysInplanYear())).toString()
        + ' ' + this.oASuggestedData.keyVolume;
    } else {
      this.annualBudgetdisplayval = '-';
    }
  }

  loadOtherPages(): void {
    this.isBackButtonClicked = false;
    const currentSelectedIndex = this.pageGroup.selectedIndex;
    if (this.previousIndex !== currentSelectedIndex && !Util.isNullOrUndefined(this.planDetails.key)) {
      sessionStorage.setItem('plankey', this.planDetails.key);
      switch (currentSelectedIndex) {
        case 0:
          this.router.navigate(['/plan-setup'],{queryParams: {plankey: this.planDetails.key}});
          break;
        case 1:
          if (!this.excludeEducationAndOrientationFlag) {
            this.router.navigate(['/off-grid-activities'], {queryParams: {plankey: this.planDetails.key}});
          } else {
            this.router.navigate(['/staff-schedule'], {queryParams: {plankey: this.planDetails.key}});
          }
          break;
        case 2:
          this.router.navigate(['/staff-schedule'], {queryParams: {plankey: this.planDetails.key}});
          break;
        case 3:
          this.router.navigate(['/staffing-grid'], {queryParams: {plankey: this.planDetails.key}});
          break;
      }
    } else {
      this.pageGroup.selectedIndex = this.previousIndex;
    }
  }

  checkTabChange(): void {
    if (this.previousIndex !== this.pageGroup.selectedIndex) {
      this.clickonbackbutton();
    }
  }

  clickOnTabOrCancelButton(): void {
    this.isBackButtonClicked = false;
    window.clearInterval(this.staffGridService.autoSaveInterval);
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
        window.clearInterval(this.staffGridService.autoSaveInterval);
        sessionStorage.setItem('lock', 'true');
      } else {
        this.planService.planAlreadyInUse = false;
        sessionStorage.setItem('lock', 'false');
      }
  }

  private removeSessionAttributes(): Promise<Response> {
    sessionStorage.removeItem('lock');
    if (!this.planService.planAlreadyInUse) {
      const planKey = sessionStorage.getItem('plankey');
      if (!Util.isNullOrUndefined(planKey)) {
        return this.planService.removePlanKeyFromSessionAttribute(Number(planKey)).toPromise();
      }
    }
  }

  async canDeactivate(): Promise<Observable<boolean> | boolean> {
    sessionStorage.removeItem('reload');
    if(this.checkIfPlanEdited()&&this.isBackButtonClicked){
      let dialogRef;
      let moveForward : boolean;
      dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', '175px', '600px',
        'Exit Staffing Grid', 'You will lose any unsaved data, do you want to continue?');
      // you have access to the component instance

      document.body.classList.add('pr-modal-open');
      this.isBackButtonClicked = false;
      return new Observable<boolean>( observer => {
        dialogRef.afterClosed().subscribe(result=>{
          if (result){
            window.clearInterval(this.staffGridService.autoSaveInterval);
            if(this.alertBox.checkForLandingPage(this.routerTracker.nextUrl,true)) {
              this.removeSessionAttributes();
            }
            observer.next(true);
          }else{
            observer.next(false);
          }
        });
      });
      // return confirm('Are you sure you want to leave Hello ?');
    } else {
      if (this.alertBox.checkForLandingPage(this.routerTracker.nextUrl, true)) {
        await this.removeSessionAttributes();
        window.clearInterval(this.staffGridService.autoSaveInterval);
        return true;
      } else {
        window.clearInterval(this.staffGridService.autoSaveInterval);
        return true;
      }
    }
  }
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.isBackButtonClicked = true;
  }
}
