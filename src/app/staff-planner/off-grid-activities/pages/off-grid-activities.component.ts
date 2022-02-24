import {Component, HostListener, OnInit, Renderer2, ViewChild, ViewEncapsulation} from '@angular/core';
import {
  OffGridActivities,
  OGAsummary,
  ogaTypeKey,
  VariableDepartmet
} from '../../../shared/domain/off-grid-activities';
import {PlanService} from '../../../shared/service/plan-service';
import {PlanDetails, ConfirmWindowOptions} from '../../../shared/domain/plan-details';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {AlertBox} from '../../../shared/domain/alert-box';
import {OAPlanData} from '../../../shared/domain/OAPlanData';
import {OASuggestedData} from '../../../shared/domain/OASuggestedData';
import {OAService} from '../../../shared/service/oa-service';
import {ScheduleService} from '../../../shared/service/schedule-service';
import {ActivityGridComponent} from '../components/activity-grid/activity-grid.component';
import {PlatformLocation} from '@angular/common';
import {Observable} from "rxjs";
import {CanDeactivateGuard} from "../../../shared/guard/can-deactivate-guard.service";
import {RouterHistoryTrackerService} from "../../../shared/service/router-history-tracker.service";
import {JobCategory} from '../../../shared/domain/job-category';
import {Util} from "../../../shared/util/util";
@Component({
  selector: 'app-off-grid-activities',
  templateUrl: './off-grid-activities.component.html',
  styleUrls: ['./off-grid-activities.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OffGridActivitiesComponent implements OnInit {
  planName = '6120 STEPDOWN 2019-01 DRAFT';
  strInhouseActivity = 'Annual In-House Education Activity';
  strCertificationActivity = 'Annual Certification & Other Courses';
  strOrientationActivity = 'Annual Orientation';
  strOtherActivity = 'Other Activities';
  listOGAsummary: Array<OGAsummary> = [];

  @ViewChild('tabGroup') tabGroup;

  planDetails: PlanDetails = new PlanDetails();
  entitydisplayval: string;
  departmentdisplayval: string;
  primaryWHpUdisplayval: string;
  annualBudgetdisplayval: string;
  objExistingSummary: OGAsummary;
  objOGASummary: OGAsummary;
  jobCatgData: JobCategory[];

  btnNexttxt: string;
  btnExittxt: string;

  prevSelectedIndex = 0;
  alertBox: AlertBox;

  oAPlanDataEntity = new OAPlanData();
  oASuggestedData = new OASuggestedData();

  tabSelected = [true,false,true,true];
  previousIndex = 1;
  @ViewChild('pageGroup') pageGroup;
  activityIndex = -1;


  errorMessage:string = 'Enter an Activity Name.';
  @ViewChild(ActivityGridComponent)
  activityGridComponent: ActivityGridComponent;
  isPlanEdited = false;
  isBackButtonClicked = false;

  @HostListener('document:keyup', ['$event'])
  restPlanEditFlag(event) {
    if (event.target.nodeName === 'INPUT') {
      this.isPlanEdited = true;
    }
  }
  constructor(private planService: PlanService, private router: Router, private dialog: MatDialog, private oaService: OAService,
              private scheduleServiceScheduleService: ScheduleService, private renderer: Renderer2,private platformLocation: PlatformLocation, private route: ActivatedRoute,
              private routerTracker : RouterHistoryTrackerService) {
    this.alertBox = new AlertBox(this.dialog);
    platformLocation.onPopState(() => {
     // this.isBackButtonClicked = true;
    });
  }

  ngOnInit() {
    this.planService.isRoutedFlag = true;
    this.loadplandetails();
  }

  loadsummary() {
    this.getSummary();
  }

  loadplandetails() {

    let palnkey = localStorage.getItem('plankey');
      if ((!palnkey) || palnkey === '') {
            this.route.queryParamMap.subscribe(queryParams => {
                palnkey = queryParams.get('plankey');
            });
    }
    let previousLock = true;
    this.planService.getPlandetails(palnkey).subscribe(data => {
        if(!Util.isNullOrUndefined(this.planService.planAlreadyInUse) && !this.planService.planAlreadyInUse){
            previousLock = false;
        }
      this.planDetails = data;

      sessionStorage.setItem('plankey', this.planDetails.key);
      this.scheduleServiceScheduleService.getScheduleDetails(this.planDetails.key).subscribe(data => {
        this.planDetails.staffScheduleList = data;
      });
      if (!previousLock){
          this.planDetails.planAlreadyInUse = false;
      }
      this.checkForSessionAttributes();
      this.loadButtontext();
      this.loadJobCategory();
      this.loaOffgridDefault();
      this.orderActivitiesByVarPos();
      this.updateDataFromOA();

    });
  }

    loadJobCategory(): void {
        this.planService.getJobCategoryData().subscribe(data => {
            this.jobCatgData = data;
        });
    }

  orderActivitiesByVarPos() {
    for (const activity of this.planDetails.offGridActivities) {
      this.orderVariableDepartmetByVarpos(activity);
    }
  }

  orderVariableDepartmetByVarpos(objOffGridActivity: OffGridActivities) {
    const activities: VariableDepartmet[] = [];
    this.planDetails.variableDepartmentPositions.forEach(ele => {
      const objvardepartment = objOffGridActivity.variableDepartmentList.filter(eleStaff => eleStaff.key === ele.categoryKey && eleStaff.categoryDescription=== ele.categoryDescription)[0];
      if (objvardepartment) {
        activities.push(objvardepartment);
      }
    });
    objOffGridActivity.variableDepartmentList = activities;
  }

  getDaysInplanYear() {
    const planDate: Date = new Date(this.planDetails.effectiveEndDate);
    return this.alertBox.getDaysInplanYear(planDate);
  }

  loadButtontext() {
    const text =  this.alertBox.loadButtontext(this.planDetails.planCompleted);
    this.btnExittxt = text[0];
    this.btnNexttxt = text[1];
  }


  loaOffgridDefault() {

    if (!this.planDetails.offGridActivities) {
      this.planDetails.offGridActivities = [];
    }

    if (this.planDetails.offGridActivities.length === 0) {
      // let newoffgridactivity:OffGridActivities=new OffGridActivities();

      // for (let i = 0; i < this.planDetails.varPosition.length; i++)
      //  {
      //   let vardepart:VariableDepartmet = new VariableDepartmet();
      //   vardepart.variable_department_abrv = this.planDetails.varPosition[i].categoryAbbrev;
      //   vardepart.variable_department_position_name = this.planDetails.varPosition[i].categoryDesc;
      //   vardepart.variable_department_position_key = this.planDetails.varPosition[i].categoryKey;
      //   vardepart.staff_count = 0;

      //   newoffgridactivity.activities.push(vardepart);
      // }
      // this.planDetails.offgridactivities.push(newoffgridactivity);
    }

  }

  clickonbackbutton() {
    this.isBackButtonClicked = false;
    if (this.planDetails.planCompleted) {
      this.clickOnTabOrCancelButton();
    } else {
      if(!this.isPlanEdited && (!Util.isNullOrUndefined(this.activityGridComponent)&&this.activityGridComponent.isPlanEdited)){
        this.isPlanEdited = true;
      }
      if(this.isPlanEdited){
        document.body.classList.add('pr-modal-open');
        const dialogRef = this.alertBox.openAlertWithSaveAndReturn('exit-dialog',
          '210px','600px', 'Exit Off Grid Activities','');
        document.body.classList.add('pr-modal-open');
        dialogRef.afterClosed().subscribe(result => {
          document.body.classList.remove('pr-modal-open');
          if (result) {
            if(result==ConfirmWindowOptions.exit)
            {
              this.clickOnTabOrCancelButton();
            }
            else
            {
              if(this.validateActivities())
              {
                this.pageGroup.selectedIndex = this.previousIndex;
              }
              this.saveAndNextPlanDetails();
            }

          } else {
            this.validateActivities();
            setTimeout(()=>this.setFocusToInputElement(this.activityIndex),10);
            this.pageGroup.selectedIndex = this.previousIndex;
          }
          document.body.classList.remove('pr-modal-open');
        });
      }else{
        this.clickOnTabOrCancelButton();
      }

    }
  }

  saveAndNextPlanDetails() {
    this.isBackButtonClicked = false;
    for (const offgridActivities of this.planDetails.offGridActivities) {
      for (const varPos of offgridActivities.variableDepartmentList) {
        if (Util.isNullOrUndefined(varPos.staffCount) || varPos.staffCount.toString() === '') {
          varPos.staffCount = 0;
        }
      }
    }
    if (!this.planDetails.planCompleted) {
      if (this.validateActivities()) {
        const dialogRef = this.alertBox.openAlertForOGA('exit-dialog', '175px', '350px', 'Off Grid Activities', this.errorMessage);
        if (!Util.isNullOrUndefined(dialogRef)) {
          dialogRef.afterClosed().subscribe(result => {
            setTimeout(() => this.setFocusToInputElement(this.activityIndex), 10);
            document.body.classList.remove('pr-modal-open');
          });
        }
        this.pageGroup.selectedIndex = this.previousIndex;
        return;
      } else {
        this.planService.createPlan(this.planDetails).subscribe(data => {
          setTimeout(() => {
          }, 1500);
          this.loadOtherPages();
        });
      }
    } else {
      this.loadOtherPages();
    }
  }
  savePlanDetails()
  {
    for (const offgridActivities of this.planDetails.offGridActivities) {
      for (const varPos of offgridActivities.variableDepartmentList) {
        if (Util.isNullOrUndefined(varPos.staffCount) || varPos.staffCount.toString() === '') {
          varPos.staffCount = 0;
        }
      }
    }
    this.planService.createPlan(this.planDetails).subscribe(data => {
      setTimeout(() => {
      }, 1500);
    });
  }

  saveAndExitPlanDetails() {
    this.isBackButtonClicked = false;
    for (const offgridActivities of this.planDetails.offGridActivities) {
      for (const varPos of offgridActivities.variableDepartmentList) {
        if (Util.isNullOrUndefined(varPos.staffCount) || varPos.staffCount.toString() === '') {
          varPos.staffCount = 0;
        }
      }
    }
    if (this.planDetails.planCompleted) {
      sessionStorage.removeItem('lock');
      this.router.navigate(['/home']);
      return;
    }
    if (this.validateActivities()) {
      const dialogRef = this.alertBox.openAlertForOGA('exit-dialog','175px','350px','Off Grid Activities',this.errorMessage);
      if (!Util.isNullOrUndefined(dialogRef)){
        dialogRef.afterClosed().subscribe(result => {
          setTimeout(()=>this.setFocusToInputElement(this.activityIndex),10);
          document.body.classList.remove('pr-modal-open');
        });
      }
      return;
    }

    if (this.planDetails.totalAnnualHours) {
      if (this.planDetails.totalAnnualHours > 0) {

        const alertMessage = 'Updates to the plan are reflected in the Staffing Grid only after you complete the workflow. \n' +
          '\n' +
          'Click Confirm to exit the workflow.\n' +
          '\n' +
          'Click Cancel to stay in this plan and finish the workflow.\n';
        const dialogRef = this.alertBox.openAlertWithReturn('exit-dialog',
          '190px','600px','Staff Planner', alertMessage);
        document.body.classList.add('pr-modal-open');
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
              this.returnToHomePage();
          }else{
            setTimeout(()=>this.setFocusToInputElement(this.activityIndex),10);
          }
          document.body.classList.remove('pr-modal-open');
        });
      }
    } else {
      this.returnToHomePage();
    }


  }

  returnToHomePage() {
    this.planService.createPlan(this.planDetails).subscribe(data => {
      // this.removeSessionAttributes();
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 1500);
    });
  }

  validateActivities() {
    let isError = false;
    let isLastNamePresent = true;
    for (const activity of  this.planDetails.offGridActivities.filter(act => act.typeKey === ((1 * this.prevSelectedIndex) + 1))) {
      const indexValue = activity.name !== null ? activity.name.indexOf(' ') === 0 : false;
      if (!isLastNamePresent) {
        return true;
      }
      if (indexValue || activity.shiftHours > 0 || activity.variableDepartmentList.filter(act => act.staffCount > 0).length > 0) {
        if (!activity.name || activity.name === '' || activity.name.indexOf(' ') === 0 || indexValue) {
          if(activity.name)
          {
            if(activity.name.indexOf(' ') === 0) {
              this.errorMessage = 'The first character cannot be a space.';
            }
          }
          else
          {
            this.errorMessage = 'Enter an Activity Name.';
          }
          this.activityIndex  = this.planDetails.offGridActivities.filter(act => act.typeKey === ((1 * this.prevSelectedIndex) + 1)).indexOf(activity);
          isError = true;
        }
      }
      if (activity.code === '' || activity.name === null || activity.name.indexOf(' ') === 0 || activity.name === '') {
        if(activity.name)
        {
          if(activity.name.indexOf(' ') === 0) {
            this.errorMessage = 'The first character cannot be a space.';
          }
        }
        else
        {
          this.errorMessage = 'Enter an Activity Name.';
        }
        this.activityIndex  = this.planDetails.offGridActivities.filter(act => act.typeKey === ((1 * this.prevSelectedIndex) + 1)).indexOf(activity);
        isLastNamePresent = false;
      }
    }
    return isError;
  }

  getSummary() {
    if (this.validateActivities() && this.tabGroup.selectedIndex !== this.prevSelectedIndex) {
      this.tabGroup.selectedIndex = this.prevSelectedIndex;
      const dialogRef = this.alertBox.openAlertForOGA('exit-dialog', '175px', '350px', 'Off Grid Activities', 'Enter an Activity Name.');
      if (!Util.isNullOrUndefined(dialogRef)) {
        dialogRef.afterClosed().subscribe(result => {
          setTimeout(() => this.setFocusToInputElement(this.activityIndex), 10);
          document.body.classList.remove('pr-modal-open');
        });
      }
      return;
    }

    this.listOGAsummary = [];
    for (const plan of this.planDetails.offGridActivities) {
      const objOffGridactivity = plan;
      for (const activities of objOffGridactivity.variableDepartmentList) {
        const objvariablepo = activities;
        if (this.listOGAsummary.length > 0) {
          this.objExistingSummary = this.listOGAsummary.filter
          (t => t.variable_department_position_key === objvariablepo.key && t.variablePositionDescription===objvariablepo.categoryDescription)[0];
        }
        if (this.listOGAsummary.length > 0) {

          if (this.objExistingSummary != null) {
            if (objOffGridactivity.typeKey === ogaTypeKey.Orientation) {
              this.objExistingSummary.OrientationHrs = (1 * this.objExistingSummary.OrientationHrs) +
                (objOffGridactivity.shiftHours * objvariablepo.staffCount);
            } else if (objOffGridactivity.typeKey === ogaTypeKey.Certification) {
              this.objExistingSummary.EduAndCertHrs = (1 * this.objExistingSummary.EduAndCertHrs) +
                (objOffGridactivity.shiftHours * objvariablepo.staffCount);
            } else if (objOffGridactivity.typeKey === ogaTypeKey.InHouse) {
              this.objExistingSummary.InHouseEduHrs = (1 * this.objExistingSummary.InHouseEduHrs) +
                (objOffGridactivity.shiftHours * objvariablepo.staffCount);
            } else {
              this.objExistingSummary.OtherHrs = (1 * this.objExistingSummary.OtherHrs) +
                (objOffGridactivity.shiftHours * objvariablepo.staffCount);
            }
            this.objExistingSummary.TotalnHrs = (1 * this.objExistingSummary.OtherHrs) +
              (1 * this.objExistingSummary.OrientationHrs) + (1 * this.objExistingSummary.EduAndCertHrs) +
              (1 * this.objExistingSummary.InHouseEduHrs);
          }
        }
        if (this.listOGAsummary.length === 0 || this.objExistingSummary == null) {
          this.objOGASummary = new OGAsummary();
          this.objOGASummary.variable_department_abrv = objvariablepo.categoryAbbreviation;
            this.objOGASummary.variablePositionDescription = objvariablepo.categoryDescription;
          this.objOGASummary.variable_department_position_name = this.jobCatgData.filter(jobVariableCategory =>
              jobVariableCategory.key === objvariablepo.key).map(categoryName => categoryName.name)[0];
          this.objOGASummary.variable_department_position_key = objvariablepo.key;
          if (objOffGridactivity.typeKey === ogaTypeKey.Orientation) {
            this.objOGASummary.OrientationHrs = objOffGridactivity.shiftHours * objvariablepo.staffCount;
          } else if (objOffGridactivity.typeKey === ogaTypeKey.Certification) {
            this.objOGASummary.EduAndCertHrs = objOffGridactivity.shiftHours * objvariablepo.staffCount;
          } else if (objOffGridactivity.typeKey === ogaTypeKey.InHouse) {
            this.objOGASummary.InHouseEduHrs = objOffGridactivity.shiftHours * objvariablepo.staffCount;
          } else {
            this.objOGASummary.OtherHrs = objOffGridactivity.shiftHours * objvariablepo.staffCount;
          }
          this.objOGASummary.TotalnHrs = (1 * this.objOGASummary.OtherHrs) +
            (1 * this.objOGASummary.OrientationHrs) + (1 * this.objOGASummary.EduAndCertHrs) +
            (1 * this.objOGASummary.InHouseEduHrs);
          this.listOGAsummary.push(this.objOGASummary);
        }

      }
    }
    this.prevSelectedIndex = this.tabGroup.selectedIndex;
  }

  updateDataFromOA() {
    if (this.planDetails.effectiveStartDate != null) {
      this.oAPlanDataEntity = this.alertBox.loadOAPlanDataEntity(this.planDetails);
      this.getSuggestedData();
    }
  }

  getSuggestedData() {
    this.oASuggestedData = this.planDetails.oAStaffingMetric;
    this.entitydisplayval = this.planDetails.facilityCode + '-' + this.planDetails.facilityName;
    this.departmentdisplayval = this.planDetails.departmentCode + '-' + this.planDetails.departmentName;
    this.primaryWHpUdisplayval = Util.isNullOrUndefined(this.planDetails.primaryWHpU) ? Number
    (this.planDetails.targetBudget).toFixed(4).toString() + ' Hours' :
      this.planDetails.primaryWHpU.toFixed(4).toString() + ' Hours';
    if ( Math.round(this.planDetails.budgetAverageVolume * this.getDaysInplanYear()) !== 0) {
      this.annualBudgetdisplayval = Math.round(this.planDetails.budgetAverageVolume * this.getDaysInplanYear()).toString()
        + ' ' + this.oASuggestedData.keyVolume;
    } else {
      this.annualBudgetdisplayval = '-';
    }
  }

  loadOtherPages() {
    this.isBackButtonClicked = false;
    const currentSelectedIndex = this.pageGroup.selectedIndex;
    if (!Util.isNullOrUndefined(this.planDetails.key)) {
      localStorage.setItem('plankey', this.planDetails.key);
      switch (currentSelectedIndex) {
        case 0:
          this.router.navigate(['/plan-setup'],{queryParams: {plankey: this.planDetails.key}});
          break;
        case 1:
            // this.removeSessionAttributes();
            this.router.navigate(['/plan-list']);
            break;
        case 2:
          this.router.navigate(['/staff-schedule'], {queryParams: {plankey: this.planDetails.key}});
          break;
        case 3:
          if (!Util.isNullOrUndefined(this.planDetails.staffScheduleList)) {
            if (this.planDetails.staffScheduleList.length > 0) {
            this.router.navigate(['/staffing-grid'], {queryParams: {plankey: this.planDetails.key}});
            } else {
              this.alertBox.openAlert('exit-dialog', '175px', '350px', 'Off Grid Activities', 'Submit schedule and shift details?');
              this.pageGroup.selectedIndex = this.previousIndex;
            }
          } else {
            this.alertBox.openAlert('exit-dialog', '175px', '350px', 'Off Grid Activities', 'Submit schedule and shift details?');
            this.pageGroup.selectedIndex = this.previousIndex;
          }
          break;
      }
    } else {
      this.pageGroup.selectedIndex = this.previousIndex;
    }
  }

  checkTabChange() {
    if (this.previousIndex !== this.pageGroup.selectedIndex) {
      this.pageGroup.selectedIndex > this.previousIndex ? this.saveAndNextPlanDetails() : this.clickonbackbutton();
    }
  }

  clickOnTabOrCancelButton() {
    this.isBackButtonClicked = false;
    if (this.previousIndex === this.pageGroup.selectedIndex) {
      // this.removeSessionAttributes();
      this.router.navigate(['/home']);
    } else {
      this.loadOtherPages();
    }
  }

  private setFocusToInputElement(lastIndex: number) {

    try {
      const element = this.renderer.selectRootElement('#census-' + lastIndex);
      setTimeout(() => element.focus(), 0);
    } catch (error) {
      console.error(error);
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

  canDeactivate(): Observable<boolean> | boolean {
    sessionStorage.removeItem('reload');
    if(this.isPlanEdited&&this.isBackButtonClicked){
     let dialogRef;
      let moveForward : boolean;
      dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', '175px', '600px',
        'Exit Off Grid Activities', 'You will lose any unsaved data, do you want to continue?');
      // you have access to the component instance

      document.body.classList.add('pr-modal-open');
      this.isBackButtonClicked = false;
      return new Observable<boolean>( observer => {
        dialogRef.afterClosed().subscribe(result=>{
            if (result){
              if(this.alertBox.checkForLandingPage(this.routerTracker.nextUrl,true)) {
                this.removeSessionAttributes();
              }
              observer.next(true);
            }else{
            //  history.pushState(null, '', '');
              observer.next(false);
            }
        });
      });
     // return confirm('Are you sure you want to leave Hello ?');
    } else {
      if(this.alertBox.checkForLandingPage(this.routerTracker.nextUrl,true)) {
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
