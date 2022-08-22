import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import {PromptDialogComponent} from '../components/prompt-dialog/prompt-dialog.component';
import {PromptDialogSaveComponent} from '../components/prompt-dialog-save/prompt-dialog-save.component';
import * as moment from 'moment';
import {PlanDetails} from './plan-details';
import {ScheudleErrors, shift, shifttime, StaffGridCensus} from './staff-schedule';
import {OAPlanData} from './OAPlanData';
import {OASuggestedData} from './OASuggestedData';
import {OAService} from '../service/oa-service';
import {HttpClient} from '@angular/common/http';
import {OffGridActivities} from "./off-grid-activities";
import {StaffVarianceSummary} from "./staff-summary";
import {StaffVariance} from "./staff-variance";
import {Log} from '../service/log';
import {PlanService} from '../service/plan-service';
import {ProductHelp} from './product-help';
import {PageRedirectionService} from '../service/page-redirection.service';
import {UserService} from '../service/user.service';
import {CorpDetails} from './CorpDetails';
import {EntityDetails} from './EntityDetails';
import {max} from 'rxjs/operators';
import {Util} from "../util/util";

export class AlertBox {
  alertMessage = 'Are you sure you want to delete this position?';
  width = '350px';
  height = '175px';
  oAPlanDataEntity = new OAPlanData();
  oASuggestedData = new OASuggestedData();
  oaService: OAService;
  objScheudleErrors: ScheudleErrors = new ScheudleErrors();
  constructor(private dialog: MatDialog) {
  }

  openAlert(panelClass: string, height: string, width: string, headerText: string, alertMessage: string) {
    const dialogConfig = this.makeDialogConfig(panelClass, height, width, headerText, alertMessage, false);
    const dialogRef = this.dialog.open(PromptDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      document.body.classList.remove('pr-modal-open');
    });

  }
    openAlertWithReturnNoConfirm(panelClass: string, height: string, width: string, headerText: string, alertMessage: string) {
        const dialogConfig = this.makeDialogConfig(panelClass, height, width, headerText, alertMessage, false);
        const dialogRef = this.dialog.open(PromptDialogComponent, dialogConfig);
        return dialogRef;
        dialogRef.afterClosed().subscribe(result => {
            document.body.classList.remove('pr-modal-open');
        });
    }

  openAlertOnSaveConfirm(panelClass: string, height: string, width: string, headerText: string, alertMessage: string) {
    const dialogConfig = this.makeDialogConfig(panelClass, height, width, headerText, alertMessage, false);
    const dialogRef = this.dialog.open(PromptDialogSaveComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      document.body.classList.remove('pr-modal-open');
    });

  }

  openAlertWithReturn(panelClass: string, height: string, width: string, headerText: string, alertMessage: string) {
    const dialogConfig = this.makeDialogConfig(panelClass, height, width, headerText, alertMessage, true);
    const dialogRef = this.dialog.open(PromptDialogComponent, dialogConfig);
    return dialogRef;
  }
  openAlertWithSaveAndReturn(panelClass: string, height: string, width: string, headerText: string, alertMessage: string) {
    const dialogConfig = this.makeDialogConfig(panelClass, height, width, headerText, alertMessage, true);
    const dialogRef = this.dialog.open(PromptDialogSaveComponent, dialogConfig);
    return dialogRef;
  }

  isDateRangeOverlapping(selectedPlan: PlanDetails, planData: PlanDetails): boolean {
    let isPlanActive = false;
    const effStartDate = moment(selectedPlan.effectiveStartDate, 'YYYY-MM-DD');
    const effEndDate = moment(selectedPlan.effectiveEndDate, 'YYYY-MM-DD');
    const actvPlnStrtDt = moment(planData.effectiveStartDate, 'YYYY-MM-DD');
    const actvPlnEndtDt = moment(planData.effectiveEndDate, 'YYYY-MM-DD');

    if (((effStartDate.isSameOrAfter(actvPlnStrtDt) && effStartDate.isSameOrBefore(actvPlnEndtDt)) ||
      (effEndDate.isSameOrAfter(actvPlnStrtDt) && effEndDate.isSameOrBefore(actvPlnEndtDt))) ||
      ((actvPlnStrtDt.isSameOrAfter(effStartDate) && actvPlnStrtDt.isSameOrBefore(effEndDate)) ||
        (actvPlnEndtDt.isSameOrAfter(effStartDate) && actvPlnEndtDt.isSameOrBefore(effEndDate)))) {
      isPlanActive = true;
    } else {
      isPlanActive = false;
    }
    return isPlanActive;
  }

  getDaysInplanYear(planDate: Date): number {
    let planYear: number;
    planYear = planDate.getFullYear();
    if ((planYear % 4 === 0 && planYear % 100 !== 0) || planYear % 400 === 0) {
      return 366;
    } else {
      return 365;
    }
  }

  loadButtontext(isPlanCompleted: boolean): string[] {
    if (isPlanCompleted) {
      return ['Exit', 'Next'];
    }
    return ['Save & Exit', 'Save & Next'];
  }


  deleteRow(plan: PlanDetails, i: number) {

    if (plan.totalAnnualHours) {
      if (plan.totalAnnualHours > 0) {
        if (i === 2) {
          this.alertMessage = 'Deleting this non-variable position will impact Staffing Grid data you previously entered and saved. \n';

        } else {
          this.alertMessage = 'Deleting this variable position will impact Staffing Grid data you previously entered and saved. \n';

        }
        this.alertMessage = this.alertMessage + '\n' +
        'Click Yes if you are sure you want to continue.\n';
        this.width = '600px';
        this.height = '190px';
      }
    }
  }

  getShifttime(objShift: shift): shifttime {
    const objshifttime: shifttime = new shifttime();

    objshifttime.startTime.hours = Number(objShift.startTime.split(':')[0]);

    objshifttime.startTime.mins = Number(objShift.startTime.split(':')[1]);
    objshifttime.endTime.hours = (1 * objshifttime.startTime.hours) + (1 * objShift.hours);
    objshifttime.endTime.mins = objshifttime.startTime.mins;
    return objshifttime;
  }

  isTotalHoursExceed(planShiftList){
    const earlierShift = [], latestShift = [];
    planShiftList.forEach(shift => {
      const time = parseFloat(shift.startTime.replace(':', '.'));
      earlierShift.push(time);
      latestShift.push(time + shift.hours);
    });
    const startTime = Math.min(...earlierShift);
    const endTime = Math.max(...latestShift);
    if((endTime - startTime) > 24){ return true }
    else{ return false};
  }

  getMaxShiftIndex(planShiftList){
    let latestShiftList = [], earlierShiftList = [], shiftIndex = [];
    planShiftList.map(shift => {
      let start = parseFloat(shift.startTime.replace(':', '.'));
      earlierShiftList.push(start);
      latestShiftList.push(start + shift.hours);
    });
    const startTime = Math.min(...earlierShiftList);
    latestShiftList.map((endTime, index) =>{
      if((endTime - startTime) > 24){
        shiftIndex.push(index);
      }
    });
    return shiftIndex;
    //return shiftList.indexOf(Math.max(...shiftList));
  }

  isTimeOverlaps( tempShift: shift , tempshifttime: shifttime, objshifttime: shifttime): boolean {
    let isShifttimeOverlaps = false;

    if (tempshifttime && objshifttime) {
    const punchCard: boolean[] = [];

    // initiate the array
    for (let i = 0; i < 24; i++) {
      punchCard.push(false);
    }
    // fill the punchCard for existing shift
    let starthour = 0;
    let idx = 0
    let hours: number = objshifttime.endTime.hours - objshifttime.startTime.hours;
    while (starthour <= hours) {
      let index: number = objshifttime.startTime.hours + starthour;
      if (index > 23) {
        index = index - 24;
        idx = index;
      }
      punchCard[index] = true;
      starthour++;
    }
    if(hours === 23){
      punchCard[idx] = false;
    }

    // fill the puch card for another shift to identify the overlap
    starthour = 0;
    hours = tempshifttime.endTime.hours - tempshifttime.startTime.hours;
    while (starthour <= hours) {
      let index: number = tempshifttime.startTime.hours + starthour;
      // if 24 hours crossed reset hours
      if (index > 23) {
        index = index - 24;
      }
      if (!punchCard[index]) {
      punchCard[index] = true;
      } else {
         let newIndex = index + 1 >= 24 ? (index+1) - 24 :(index+1);
        if (punchCard[newIndex] && starthour + 1 <= hours) {
          isShifttimeOverlaps = true;
        } else {
          if (objshifttime.startTime.hours < tempshifttime.startTime.hours) {
          if (tempshifttime.endTime.mins < objshifttime.endTime.mins) {
          isShifttimeOverlaps = true;
          }
          }
          if (objshifttime.startTime.hours > tempshifttime.startTime.hours) {
          if (tempshifttime.endTime.mins > objshifttime.endTime.mins) {
          isShifttimeOverlaps = true;
          }
          }
        }
      }
      starthour++;
    }
  }
    return isShifttimeOverlaps;
  }

  loadOAPlanDataEntity(planDetails: PlanDetails): OAPlanData {
    this.oAPlanDataEntity.facilityCode = planDetails.facilityCode != null ? planDetails.facilityCode : planDetails.facilityKey;
    this.oAPlanDataEntity.departmentCode = planDetails.departmentCode != null ? planDetails.departmentCode : planDetails.departmentKey;
    this.oAPlanDataEntity.planStartDate = moment(planDetails.effectiveStartDate).format('YYYY-MM-DD');
    return this.oAPlanDataEntity;
  }

  checkIfCensusangeIncreased(objshift: shift, planDetails: PlanDetails): Array<string> {
    const data = new Array();
    let isCensusangeIncreased = false;

    let minCensusSaved = objshift.staffGridCensuses[0].censusIndex;
    let maxCensusSaved = objshift.staffGridCensuses[0].censusIndex;

    for (const staffgridcensus of objshift.staffGridCensuses) {
      if (staffgridcensus.censusIndex > minCensusSaved) {
        if (staffgridcensus.censusIndex >= maxCensusSaved) {
          maxCensusSaved = staffgridcensus.censusIndex;
        }
      } else {
        if (staffgridcensus.censusIndex <= minCensusSaved) {
          minCensusSaved = staffgridcensus.censusIndex;
        }
      }

    }

    if (planDetails.censusRange.minimumCensus !== minCensusSaved ||
      planDetails.censusRange.maximumCensus !== maxCensusSaved) {
      isCensusangeIncreased = true;
    }
    data.push(minCensusSaved);
    data.push(maxCensusSaved);
    data.push(isCensusangeIncreased);
    return data;
  }

  loadOtherPages(previousIndex: number, selectedIndex: number, planDetails: PlanDetails) {
    if (previousIndex !== selectedIndex) {
      localStorage.setItem('plankey', planDetails.key);
      switch (selectedIndex) {
        case 0:
         // this.router.navigate(['/plan-setup']);
          break;
        case 1:
          // this.router.navigate(['/off-grid-activities']);
          break;
        case 2:
         // this.router.navigate(['/staff-schedule']);
          break;
        case 3:
          // this.router.navigate(['/staffing-grid'], {queryParams: {plankey: this.planDetails.key}});
          break;
      }
    }
  }

  openAlertForOGA(panelClass: string, height: string, width: string, headerText: string, alertMessage: string) {
    const dialogConfig = this.makeDialogConfig(panelClass, height, width, headerText, alertMessage, false);
    const dialogRef = this.dialog.open(PromptDialogComponent, dialogConfig);
    return dialogRef;
  }

  private makeDialogConfig(panelClass: string, height: string, width: string, headerText: string, alertMessage: string, confirm: boolean) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = panelClass;
    dialogConfig.width = width;
    dialogConfig.height = height;
    dialogConfig.disableClose = false;
    dialogConfig.data = {
      alertMessgae: alertMessage,
      confirmWinodw: confirm ? true : false,
      headerText
    };
    document.body.classList.add('pr-modal-open');
    return dialogConfig;
  }

  checkForLandingPage(nextUrl: string,plannerFlag: boolean) {

    let removeAttribute = true;
    if(!Util.isNullOrUndefined(nextUrl)){
      let homePage = nextUrl.includes('plan-list') || nextUrl.includes('home') || nextUrl.includes('staff-manager')
      if(plannerFlag){
        homePage = homePage || nextUrl.includes('plan-manager');
      }
      removeAttribute = homePage?true:false;
    }
    return removeAttribute;
  }

  getWHpUExcludeEOFlag(): boolean {
    let wHpUExcludeEOFlag = false;
    if (sessionStorage.getItem('wHpUExcludeEOFlag') !== null && sessionStorage.getItem('wHpUExcludeEOFlag') !== undefined) {
      wHpUExcludeEOFlag = JSON.parse(sessionStorage.getItem('wHpUExcludeEOFlag'));
    }
    return wHpUExcludeEOFlag;
  }

  findLeapYear(year: number): number {
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
      return 366;
    } else {
      return 365;
    }
  }

  getOGAplanHours(objOffGridActivities: OffGridActivities): number {
    let sum = 0;
    for (const vardepart of objOffGridActivities.variableDepartmentList) {
      if (vardepart.staffCount) {
        sum = (sum * 1) + (vardepart.staffCount * 1);
      }
    }
    if (objOffGridActivities.shiftHours) {
      return sum * objOffGridActivities.shiftHours;
    }
  }

  getPlannedhoursForCensus(staffVariance: StaffVariance, staffSummaryIndex: number, censusIndex: number, varPosIndex: number, minCensus: number, maxCensus: number): any {
    const staffSummary: StaffVarianceSummary = staffVariance.staffVarianceSummaries[staffSummaryIndex];
    if (staffSummary) {
      if (!Util.isNullOrUndefined(staffSummary.plannedShifts) && staffSummary.plannedShifts.length>0) {
        let total :number = 0;
        let isCensusIdentified = false;
        for (const shiftMins  of staffSummary.plannedShifts) {
          let minutes: number;
          minutes = Number(shiftMins.objshift.startTime.split(':')[1]);
          if (shiftMins.objshift.staffGridCensuses) {
            // identify the census
            for (const census of shiftMins.objshift.staffGridCensuses) {

              if (census.censusIndex == censusIndex) {
                isCensusIdentified = true;
                if (!Util.isNullOrUndefined(census.staffToPatientList[varPosIndex]) && !Util.isNullOrUndefined(census.staffToPatientList[varPosIndex].staffCount)) {
                  if (shiftMins.timestart) {
                    total += ((60 - minutes) / 60) *  census.staffToPatientList[varPosIndex].staffCount;
                  } else if (shiftMins.timeEnds) {
                    total += (minutes / 60) *  census.staffToPatientList[varPosIndex].staffCount;
                  } else {
                    total += census.staffToPatientList[varPosIndex].staffCount;
                  }
                } else {
                  total += 0;
                }
              }
            }

          } else {
            return '-';
          }
        }
        if (!isCensusIdentified) {
          staffSummary.additionalStaffHours = null;
          staffSummary.isCensusvalid = false;
          for (const staffVarianceDetail of staffSummary.staffVarianceDetails) {
            staffVarianceDetail.actualCount = null;
            staffVarianceDetail.scheduleCount = null;
            staffVarianceDetail.plannedCount = null;
          }
          return '-';
        }
        staffSummary.staffVarianceDetails[varPosIndex].plannedCount = total / 4;
        return staffSummary.staffVarianceDetails[varPosIndex].plannedCount.toFixed(2);
      } else if (censusIndex >= minCensus && censusIndex <= maxCensus) {
        staffSummary.staffVarianceDetails[varPosIndex].plannedCount = 0;
        staffSummary.isCensusvalid = true;
        return 0;
      } else {
        staffSummary.additionalStaffHours = null;
        staffSummary.isCensusvalid = false;
        for (const staffVarianceDetail of staffSummary.staffVarianceDetails) {
          staffVarianceDetail.actualCount = null;
          staffVarianceDetail.scheduleCount = null;
          staffVarianceDetail.plannedCount = null;
        }
        return '-';
    }
    }
  }

  getVariancehoursForCensus(staffVariance: StaffVariance, staffSummaryIndex: number, censusIndex: number, varPosIndex: number, actualvalue: number): string {
    const staffSummary: StaffVarianceSummary = staffVariance.staffVarianceSummaries[staffSummaryIndex];
    // check if summary exist
    if (staffSummary) {
      if (actualvalue && !Util.isNullOrUndefined(staffSummary.staffVarianceDetails[varPosIndex]) &&
        !Util.isNullOrUndefined(staffSummary.staffVarianceDetails[varPosIndex].plannedCount)) {
        return (actualvalue - staffSummary.staffVarianceDetails[varPosIndex].plannedCount).toFixed(2);
      } else {
        return '-';
      }
    } else {
      return '-';
    }
  }

  getActualTotal(staffVariance: StaffVariance, staffSummaryIndex: number): string {
    const staffSummary: StaffVarianceSummary = staffVariance.staffVarianceSummaries[staffSummaryIndex];
    if (staffSummary) {
      // check if details exist
      if (staffSummary.staffVarianceDetails) {
        let actualtotal = 0;
        // loop through each detail
        for (const staffVarianceDetail of staffSummary.staffVarianceDetails) {
          if (staffVarianceDetail.actualCount) {
            actualtotal = actualtotal + Number(staffVarianceDetail.actualCount);
          }
        }
        if (staffSummary.additionalStaffHours) {
          actualtotal = actualtotal + Number(staffSummary.additionalStaffHours);
        }

        // If actual exist send else return -
        if (actualtotal) {
          return actualtotal.toFixed(2);
        } else {
          return '-';
        }
      } else {
        return '-';
      }
    } else {
      return '-';
    }
  }

  handleWindowPerformance(performance: Performance, planService: PlanService,
                            productHelp: ProductHelp, pageRedirectionService: PageRedirectionService, userService: UserService): void {
        if (performance) {
            console.info('window.performance works fine on this browser');
            console.info(performance.navigation.type);
            if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
                console.info('This page is reloaded');
            } else {
                console.info('This page is not reloaded');
                if (Util.isNullOrUndefined(sessionStorage.getItem('reload'))) {
                    sessionStorage.setItem('reload', 'false');
                    return;
                } else {
                    sessionStorage.removeItem('reload');
                }
                userService.logout().subscribe(() => {
                    Log.info('User logged out successfully.');
                    planService.getRedirectUrl().subscribe(data => {
                        productHelp.logoutUrl = data.logoutUrl;
                        productHelp.environmentName = data.environmentName;
                        pageRedirectionService.redirectToExternalPage(productHelp.logoutUrl);
                    });
                }, error => {
                    Log.error('Error logging user out.');
                    pageRedirectionService.redirectToLogout();
                }, () => {
                });
            }
        }
    }

    filter(value: string, corpDetailsCodeList: Array<string>, corpDetails: CorpDetails[]): CorpDetails[] {
        for (const corpList of corpDetails) {
            const list = corpList.code + '-' + corpList.name;
            corpDetailsCodeList.push(list);
        }
        const filterValue = value.toLowerCase();
        for (const corp of corpDetailsCodeList) {
            if (corp.toLowerCase() === filterValue) {
                return corpDetails;
            }
        }
        return corpDetails.filter(clients => clients.name.toLowerCase().includes(filterValue)
            || clients.code.toLowerCase().includes(filterValue));
    }

    filterEnt(value: string, entityDetails: EntityDetails[], entDetailsCodeList: Array<string>): EntityDetails[] {
        for (const entList of entityDetails) {
            const list = entList.code + '-' + entList.name;
            entDetailsCodeList.push(list);
        }
        const filterValue = value.toLowerCase();
        for (const ent of entDetailsCodeList) {
            if (ent.toLowerCase() === filterValue) {
                return entityDetails;
            }
        }
        return entityDetails.filter(clients => clients.name.toLowerCase().includes(filterValue)
            || clients.code.toLowerCase().includes(filterValue));
    }

    getUpdatedDate(updated: Date): string {
        const updatedDate = new Date(updated);
        let day = updatedDate.getDate().toString();
        let month = (updatedDate.getMonth() + 1).toString();
        const year = updatedDate.getFullYear().toString();
        if (parseInt(day, 10) < 10) {
            day = '0' + day;
        }
        if (parseInt(month, 10) < 10) {
            month = '0' + month;
        }
        const today = month + '/' + day + '/' + +year;
        return today;
    }

    getUpdatedTime(updated: Date): string {
        const updatedTime = new Date(updated);
        let hours = updatedTime.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours > 12 ? hours - 12 : hours;
        let hour = hours.toString();
        let minutes = updatedTime.getMinutes().toString();
        let seconds = updatedTime.getSeconds().toString();
        hour = parseInt(hour, 10) > 9 ? hour : '0' + hour;
        minutes = parseInt(minutes, 10) > 9 ? minutes : '0' + minutes;
        seconds = parseInt(seconds, 10) > 9 ? seconds : '0' + seconds;
        const time = hour + ':' + minutes + ':' + seconds + '' + ampm;
        return time;
    }

    isNullOrUndefined(value){
      return (value === null || value === undefined);
    }

    updateCorporationModel(corpDetails: CorpDetails[]): string {
        let corpModel: string;
        if (sessionStorage.getItem('corpName') != null
            && !Util.isNullOrUndefined(corpDetails.find(entity => entity.code + '-' + entity.name === (sessionStorage.getItem('corpName'))))) {
            corpModel = sessionStorage.getItem('corpName');
        } else {
            corpModel = corpDetails[0].code + '-' + corpDetails[0].name;
        }
        return corpModel;
    }

    public getTimeZoneFlag(): boolean {
        const timezone = moment().tz('America/New_York');
        const hours = timezone.format('hh');
        const ampm = timezone.format('a');
        let timeZoneFlag = true;
        if (timezone.hours() === 6 && timezone.minutes() === 0 && ampm.indexOf('am') >= 0) {
            timeZoneFlag = true;
        } else {
            timeZoneFlag = false;
        }
        return timeZoneFlag;
    }

    public triggerTimeZoneFlag(): void {
        setInterval(() => {
            this.getTimeZoneFlag();
        }, 60000);
    }
  validateshift(objnewShift: shift): void {
    // check name
    if (objnewShift.name === '') {
      objnewShift.HasError = true;
      this.addToShiftErrors(this.objScheudleErrors.errmsg_empty_shiftname, objnewShift);
      // this.cdRef.detectChanges();
    } else {
      objnewShift.HasError = this.removeFromShiftErrors(this.objScheudleErrors.errmsg_empty_shiftname, objnewShift);
    }

    // check shift hours
    if (objnewShift.hours === 0 || Util.isNullOrUndefined(objnewShift.hours)) {
      objnewShift.HasError = true;
      this.addToShiftErrors(this.objScheudleErrors.errmsg_empty_shifthour, objnewShift);
    } else {
      objnewShift.HasError = this.removeFromShiftErrors(this.objScheudleErrors.errmsg_empty_shifthour, objnewShift);
    }
  }

  addToShiftErrors(strerrormsg: string, objShift: shift): void {
    if (objShift.errormsg) {
      const objindex: number = objShift.errormsg.indexOf(strerrormsg);
      if (objindex < 0) {
        objShift.errormsg.push(strerrormsg);
      }
    } else {
      objShift.errormsg = [];
      this.addToShiftErrors(strerrormsg, objShift);
    }
  }

  removeFromShiftErrors(strerrormsg: string, objShift: shift): boolean {
    if (objShift.errormsg) {
      if (objShift.errormsg.length > 0) {
        const objindex: number = objShift.errormsg.indexOf(strerrormsg);
        if (objindex > -1) {
          objShift.errormsg.splice(objindex, 1);
        }
      }
      if (objShift.errormsg.length === 0) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
  pasteNumberOnlyForCensus(event: ClipboardEvent): boolean {
    let census = event.clipboardData;
    let a = census.getData("text");
    if ((!(/^[+]?\d*$/.test(a)))) {
      return false;
    } else {
      return true;
    }
  }
}
