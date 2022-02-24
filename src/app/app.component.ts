import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {Router, RouterOutlet} from '@angular/router';
import {PromptDialogComponent} from './shared/components/prompt-dialog/prompt-dialog.component';
import {PlanService} from './shared/service/plan-service';
import {StaffGridService} from './shared/service/Staffgrid-service';
import {StaffVarianceService} from './shared/service/staff-variance.service';

import {AlertBox} from './shared/domain/alert-box';
import {PlanSetupComponent} from './staff-planner/plan-setup/pages/plan-setup.component';
import {OffGridActivitiesComponent} from './staff-planner/off-grid-activities/pages/off-grid-activities.component';
import {StaffScheduleComponent} from './staff-planner/staff-schedule/pages/staff-schedule.component';
import {StaffingGridComponent} from './staff-planner/staffing-grid/pages/staffing-grid.component';
import {StaffManagerPlanComponent} from './staff-manager/staff-manager-plan/pages/staff-manager-plan.component';
import {ConfirmWindowOptions} from './shared/domain/plan-details';
import {StaffManagerComponent} from './staff-manager/home/pages/home.component';
import {PlanListComponent} from './staff-planner/home/pages/home.component';
import {RoutingStateService} from "./shared/domain/routing-state.service";
import {Log} from "./shared/service/log";
import {ProductHelp} from "./shared/domain/product-help";
import {UserService} from "./shared/service/user.service";
import {PageRedirectionService} from "./shared/service/page-redirection.service";
import { UserAccess } from './shared/domain/userAccess';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Privilege} from './shared/domain/user';
import {Permissions} from './shared/domain/DeptDetails';
import {Util} from "./shared/util/util";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'Labor Management';
  selectedValue = '';
  accessLevel = '';
  plannerFlag = false;
  managerFlag = false;
  alertBox: AlertBox;
  currentComponent: any;
  productHelp: ProductHelp = new ProductHelp();
  public autoRedirectInterval: number;
  sessionTimeoutInterval: number;
  userLogoutInterval: number;
  ldapUsername: string;
  privileges: Privilege[];
  deptInPlanner: boolean;
  deptInManager: boolean;

  constructor(private dialog: MatDialog, private router: Router, public planService: PlanService,
              private staffGridService: StaffGridService, private staffVarianceService: StaffVarianceService,
              private routingState: RoutingStateService, private userService: UserService, private pageRedirectionService:
                PageRedirectionService, private _snackbar: MatSnackBar) {
    this.alertBox = new AlertBox(this.dialog);
    routingState.loadRouting();
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event) {
    localStorage.setItem('url', 'app');
    this.removeSessionAttributes(event);
  }

  openDialogForplanner(event) {
    this._snackbar.dismiss();
    // const viewLocation: string = event.view.location.hash;
    let staffManagerPlanComponent: StaffManagerPlanComponent;
    staffManagerPlanComponent = this.currentComponent;
    sessionStorage.removeItem('reload');
    sessionStorage.removeItem('currentDate');
    if (this.currentComponent instanceof StaffManagerPlanComponent && staffManagerPlanComponent.checkIfPlanEdited()) {
      staffManagerPlanComponent.isBackButtonClicked = false;
      // viewLocation.split('?')[0] === '#/plan-manager'
      let objDialogRef;
      objDialogRef = this.alertBox.openAlertWithSaveAndReturn('exit-dialog', '210px', '600px',
        'Exit Staff manger', '');
      document.body.classList.add('pr-modal-open');
      objDialogRef.afterClosed().subscribe(result => {
        document.body.classList.remove('pr-modal-open');
        if (result) {
          if (result === ConfirmWindowOptions.save) {
            if (staffManagerPlanComponent.saveAndExitCheckForError()) {
              this.setSelectedValue('StaffMgmt');
            }
            staffManagerPlanComponent.isUserExiting = true;
            this.removeSessionAttributes(event);
            window.clearInterval(this.staffGridService.autoSaveInterval);
            window.clearInterval(this.staffVarianceService.autoSaveInterval);
            staffManagerPlanComponent.saveAndExitToplanner();
          } else {
            // this.removeSessionAttributes(event);
            window.clearInterval(this.staffGridService.autoSaveInterval);
            window.clearInterval(this.staffVarianceService.autoSaveInterval);
            this.router.navigate(['/plan-list']);
            this.setSelectedValue('StaffPlan');
          }
        } else {
          this.setSelectedValue('StaffMgmt');
        }
        document.body.classList.remove('pr-modal-open');
      });
    } else {
      let dialogRef;
      const location: string = event.view.location.hash;
      document.body.classList.add('pr-modal-open');
      if (this.currentComponent instanceof PlanSetupComponent) {
        let planSetupComponent: PlanSetupComponent;
        planSetupComponent = this.currentComponent;
        planSetupComponent.isBackButtonClicked = false;
        if (planSetupComponent.checkIfPlanEdited()) {
          let objDialogRef;
          objDialogRef = this.alertBox.openAlertWithSaveAndReturn('exit-dialog', '210px', '600px',
            'Exit Staffing Plan Setup', '');
          document.body.classList.add('pr-modal-open');
          objDialogRef.afterClosed().subscribe(result => {
            document.body.classList.remove('pr-modal-open');
            if (result) {
              if (result === ConfirmWindowOptions.save) {
                if (planSetupComponent.mandatoryCheckSNFailed(true)) {
                  // flags to enable error messages
                  planSetupComponent.objSavePlanParams.isCensusApplied = true;
                  planSetupComponent.objSavePlanParams.isSaveNextBtnSubmitForCensus = true;
                  planSetupComponent.isSaveNextBtnSubmit = true;
                  planSetupComponent.plan.censusRange.minimumCensus = planSetupComponent.cmin;
                  planSetupComponent.plan.censusRange.maximumCensus = planSetupComponent.cmax;
                  const dialogRef = this.alertBox.openAlertOnSaveConfirm('exit-dialog', '190px', '600px',
                    'Save Staffing Schedule Setup', '');
                  this.setSelectedValue('StaffPlan');
                } else {
                  planSetupComponent.plan.censusRange.minimumCensus = planSetupComponent.cmin;
                  planSetupComponent.plan.censusRange.maximumCensus = planSetupComponent.cmax;
                  planSetupComponent.saveAndNextPlanDetails();
                  // this.removeSessionAttributes(event);
                  window.clearInterval(this.staffGridService.autoSaveInterval);
                  window.clearInterval(this.staffVarianceService.autoSaveInterval);
                  this.router.navigate(['/plan-list']);
                  this.setSelectedValue('StaffPlan');
                }

              } else {
                // this.removeSessionAttributes(event);
                window.clearInterval(this.staffGridService.autoSaveInterval);
                window.clearInterval(this.staffVarianceService.autoSaveInterval);
                this.router.navigate(['/plan-list']);
                this.setSelectedValue('StaffPlan');
              }
            } else {
              this.setSelectedValue('StaffPlan');
            }
            document.body.classList.remove('pr-modal-open');
          });
        } else {
          this.setSelectedValue('StaffPlan');
          window.clearInterval(this.staffGridService.autoSaveInterval);
          window.clearInterval(this.staffVarianceService.autoSaveInterval);
          // this.removeSessionAttributes(event);
          this.router.navigate(['/plan-list']);
        }
      } else if (this.currentComponent instanceof OffGridActivitiesComponent) {
        //event.view.location.hash === '#/off-grid-activities'
        let offGridActivitiesComponent: OffGridActivitiesComponent;
        offGridActivitiesComponent = this.currentComponent;
        if (offGridActivitiesComponent.isPlanEdited) {
          let objDialogRef;
          objDialogRef = this.alertBox.openAlertWithSaveAndReturn('exit-dialog', '210px', '600px',
            'Exit Off Grid Activities', '');
          document.body.classList.add('pr-modal-open');
          objDialogRef.afterClosed().subscribe(result => {
            document.body.classList.remove('pr-modal-open');
            if (result) {
              if (result === ConfirmWindowOptions.save) {
                if (offGridActivitiesComponent.validateActivities()) {
                  this.setSelectedValue('StaffPlan');
                  offGridActivitiesComponent.saveAndNextPlanDetails();
                  this.router.navigate(['/off-grid-activities'], {queryParams: {plankey: offGridActivitiesComponent.planDetails.key}});
                } else {
                  this.setSelectedValue('StaffPlan');
                  offGridActivitiesComponent.savePlanDetails();
                  // this.removeSessionAttributes(event);
                  window.clearInterval(this.staffGridService.autoSaveInterval);
                  window.clearInterval(this.staffVarianceService.autoSaveInterval);
                  this.router.navigate(['/plan-list']);
                }

              } else {
                // this.removeSessionAttributes(event);
                window.clearInterval(this.staffGridService.autoSaveInterval);
                window.clearInterval(this.staffVarianceService.autoSaveInterval);
                this.router.navigate(['/plan-list']);
              }
            } else {
              this.setSelectedValue('StaffPlan');
            }
            document.body.classList.remove('pr-modal-open');
          });
        } else {
          this.setSelectedValue('StaffPlan');
          window.clearInterval(this.staffGridService.autoSaveInterval);
          window.clearInterval(this.staffVarianceService.autoSaveInterval);
          // this.removeSessionAttributes(event);
          this.router.navigate(['/plan-list']);
        }
      } else if (this.currentComponent instanceof StaffScheduleComponent) {
        //event.view.location.hash === '#/staff-schedule'
        let staffScheduleComponent: StaffScheduleComponent;
        staffScheduleComponent = this.currentComponent;
        staffScheduleComponent.isBackButtonClicked = false;
        if (staffScheduleComponent.checkIfPlanEdited()) {
          let objDialogRef;
          objDialogRef = this.alertBox.openAlertWithSaveAndReturn('exit-dialog', '210px', '600px',
            'Exit Staffing Schedule Setup', '');
          document.body.classList.add('pr-modal-open');
          objDialogRef.afterClosed().subscribe(result => {
            document.body.classList.remove('pr-modal-open');
            if (result) {
              if (result === ConfirmWindowOptions.save) {
                if (staffScheduleComponent.validateExistingSchedules()) {
                  this.setSelectedValue('StaffPlan');
                  const dialogRef = this.alertBox.openAlertOnSaveConfirm('exit-dialog', '190px', '600px',
                    'Save Staffing Schedule Setup', '');
                } else {
                  staffScheduleComponent.saveAndNextScheduleDetails();
                  // this.removeSessionAttributes(event);
                  window.clearInterval(this.staffGridService.autoSaveInterval);
                  window.clearInterval(this.staffVarianceService.autoSaveInterval);
                  this.router.navigate(['/plan-list']);
                }

              } else {
                // this.removeSessionAttributes(event);
                window.clearInterval(this.staffGridService.autoSaveInterval);
                window.clearInterval(this.staffVarianceService.autoSaveInterval);
                this.router.navigate(['/plan-list']);
              }
            } else {
              this.setSelectedValue('StaffPlan');
            }
            document.body.classList.remove('pr-modal-open');
          });
        } else {
          this.setSelectedValue('StaffPlan');
          window.clearInterval(this.staffGridService.autoSaveInterval);
          window.clearInterval(this.staffVarianceService.autoSaveInterval);
          // this.removeSessionAttributes(event);
          this.router.navigate(['/plan-list']);
        }
      } else if (this.currentComponent instanceof StaffingGridComponent) {
        let staffingGridComponent: StaffingGridComponent;
        staffingGridComponent = this.currentComponent;
        staffingGridComponent.isBackButtonClicked = false;
        if (staffingGridComponent.checkIfPlanEdited()) {
          let objDialogRef;
          objDialogRef = this.alertBox.openAlertWithSaveAndReturn('exit-dialog', '210px', '600px',
            'Exit Staffing Grid', '');
          document.body.classList.add('pr-modal-open');
          objDialogRef.afterClosed().subscribe(result => {
            document.body.classList.remove('pr-modal-open');
            if (result) {
              // this.removeSessionAttributes(event);
              window.clearInterval(this.staffGridService.autoSaveInterval);
              window.clearInterval(this.staffVarianceService.autoSaveInterval);
              if (result === ConfirmWindowOptions.save) {
                staffingGridComponent.saveAndExitStaffGridDetails();
                this.router.navigate(['/plan-list']);
              } else {
                this.router.navigate(['/plan-list']);
              }
            } else {
              this.setSelectedValue('StaffPlan');
            }
            document.body.classList.remove('pr-modal-open');
          });
        } else {
          this.setSelectedValue('StaffPlan');
          window.clearInterval(this.staffGridService.autoSaveInterval);
          window.clearInterval(this.staffVarianceService.autoSaveInterval);
          // this.removeSessionAttributes(event);
          this.router.navigate(['/plan-list']);
        }
      } else {
        this.setSelectedValue('StaffPlan');
        window.clearInterval(this.staffGridService.autoSaveInterval);
        window.clearInterval(this.staffVarianceService.autoSaveInterval);
        // this.removeSessionAttributes(event);
        this.router.navigate(['/plan-list']);
      }
    }
  }

  onActivate(component) {
    this._snackbar.dismiss();
    this.currentComponent = component;
    // you have access to the component instance
  }

  onDeactivate(component) {
    this._snackbar.dismiss();
    const urlFlag = component instanceof PlanListComponent || component instanceof StaffManagerComponent;
    if (urlFlag && !Util.isNullOrUndefined(sessionStorage.getItem('lock'))) {
      sessionStorage.removeItem('lock');
    }
    // you have access to the component instance
  }

  openDialog(event) {
    this._snackbar.dismiss();
    //event.view.location.hash === '#/home' || event.view.location.hash === '#/staff-manager' || event.view.location.hash === '#/plan-list'
    sessionStorage.removeItem('reload');
    if (this.currentComponent instanceof PlanListComponent || this.currentComponent instanceof StaffManagerComponent) {
      this.removeSessionAttributes(event);
      window.clearInterval(this.staffGridService.autoSaveInterval);
      window.clearInterval(this.staffVarianceService.autoSaveInterval);
      this.router.navigate(['/staff-manager']);
      this.setSelectedValue('StaffMgmt');
    } else {
      let dialogRef;
      const location: string = event.view.location.hash;
      document.body.classList.add('pr-modal-open');
      //event.view.location.hash.includes(('#/plan-setup'))
      if (this.currentComponent instanceof PlanSetupComponent) {
        let planSetupComponent: PlanSetupComponent;
        planSetupComponent = this.currentComponent;
        planSetupComponent.isBackButtonClicked = false;
        if (planSetupComponent.checkIfPlanEdited()) {
          let objDialogRef;
          objDialogRef = this.alertBox.openAlertWithSaveAndReturn('exit-dialog', '210px', '600px',
            'Exit Staffing Plan Setup', '');
          document.body.classList.add('pr-modal-open');
          objDialogRef.afterClosed().subscribe(result => {
            document.body.classList.remove('pr-modal-open');
            if (result) {
              if (result === ConfirmWindowOptions.save) {
                if (planSetupComponent.mandatoryCheckSNFailed(true)) {
                  // flags to enable error messages
                  planSetupComponent.objSavePlanParams.isCensusApplied = true;
                  planSetupComponent.objSavePlanParams.isSaveNextBtnSubmitForCensus = true;
                  planSetupComponent.isSaveNextBtnSubmit = true;
                  planSetupComponent.plan.censusRange.minimumCensus = planSetupComponent.cmin;
                  planSetupComponent.plan.censusRange.maximumCensus = planSetupComponent.cmax;
                  const dialogRef = this.alertBox.openAlertOnSaveConfirm('exit-dialog', '190px', '600px',
                    'Save Staffing Schedule Setup', '');
                  this.setSelectedValue('StaffPlan');
                } else {
                  planSetupComponent.plan.censusRange.minimumCensus = planSetupComponent.cmin;
                  planSetupComponent.plan.censusRange.maximumCensus = planSetupComponent.cmax;
                  planSetupComponent.saveAndNextPlanDetails();
                  // this.removeSessionAttributes(event);
                  this.router.navigate(['/staff-manager']);
                  this.setSelectedValue('StaffMgmt');
                }

              } else {
                // this.removeSessionAttributes(event);
                this.router.navigate(['/staff-manager']);
                this.setSelectedValue('StaffMgmt');
              }
            } else {
              this.setSelectedValue('StaffPlan');
            }
            document.body.classList.remove('pr-modal-open');
          });
        } else {
          this.openTileNavigationDialog();
        }
      } else if (this.currentComponent instanceof OffGridActivitiesComponent) {
        //event.view.location.hash === '#/off-grid-activities'
        let offGridActivitiesComponent: OffGridActivitiesComponent;
        offGridActivitiesComponent = this.currentComponent;
        offGridActivitiesComponent.isBackButtonClicked = false;
        if (offGridActivitiesComponent.isPlanEdited) {
          let objDialogRef;
          objDialogRef = this.alertBox.openAlertWithSaveAndReturn('exit-dialog', '210px', '600px',
            'Exit Off Grid Activities', '');
          document.body.classList.add('pr-modal-open');
          objDialogRef.afterClosed().subscribe(result => {
            document.body.classList.remove('pr-modal-open');
            if (result) {
              if (result === ConfirmWindowOptions.save) {
                if (offGridActivitiesComponent.validateActivities()) {
                  this.setSelectedValue('StaffPlan');
                  offGridActivitiesComponent.saveAndNextPlanDetails();
                  this.router.navigate(['/off-grid-activities'], {queryParams: {plankey: offGridActivitiesComponent.planDetails.key}});
                } else {
                  this.setSelectedValue('StaffMgmt');
                  offGridActivitiesComponent.savePlanDetails();
                  this.removeSessionAttributes(event);
                  this.router.navigate(['/staff-manager']);
                }

              } else {
                // this.removeSessionAttributes(event);
                this.router.navigate(['/staff-manager']);
              }
            } else {
              this.setSelectedValue('StaffPlan');
            }
            document.body.classList.remove('pr-modal-open');
          });
        } else {
          this.openTileNavigationDialog();
        }
      } else if (this.currentComponent instanceof StaffScheduleComponent) {
        //event.view.location.hash === '#/staff-schedule'
        let staffScheduleComponent: StaffScheduleComponent;
        staffScheduleComponent = this.currentComponent;
        staffScheduleComponent.isBackButtonClicked = false;
        if (staffScheduleComponent.checkIfPlanEdited()) {
          let objDialogRef;
          objDialogRef = this.alertBox.openAlertWithSaveAndReturn('exit-dialog', '210px', '600px',
            'Exit Staffing Schedule Setup', '');
          document.body.classList.add('pr-modal-open');
          objDialogRef.afterClosed().subscribe(result => {
            document.body.classList.remove('pr-modal-open');
            if (result) {
              if (result === ConfirmWindowOptions.save) {
                if (staffScheduleComponent.validateExistingSchedules()) {
                  this.setSelectedValue('StaffPlan');
                  const dialogRef = this.alertBox.openAlertOnSaveConfirm('exit-dialog', '190px', '600px',
                    'Save Staffing Schedule Setup', '');
                } else {
                  staffScheduleComponent.saveAndNextScheduleDetails();
                  // this.removeSessionAttributes(event);
                  this.router.navigate(['/staff-manager']);
                }

              } else {
                // this.removeSessionAttributes(event);
                this.router.navigate(['/staff-manager']);
              }
            } else {
              this.setSelectedValue('StaffPlan');
            }
            document.body.classList.remove('pr-modal-open');
          });
        } else {
          this.openTileNavigationDialog();
        }
      } else if (this.currentComponent instanceof StaffingGridComponent) {
        //event.view.location.hash.includes(('#/staffing-grid'))
        let staffingGridComponent: StaffingGridComponent;
        staffingGridComponent = this.currentComponent;
        staffingGridComponent.isBackButtonClicked = false;
        if (staffingGridComponent.checkIfPlanEdited()) {
          let objDialogRef;
          objDialogRef = this.alertBox.openAlertWithSaveAndReturn('exit-dialog', '210px', '600px',
            'Exit Staffing Grid', '');
          document.body.classList.add('pr-modal-open');
          objDialogRef.afterClosed().subscribe(result => {
            document.body.classList.remove('pr-modal-open');
            if (result) {
              if (result === ConfirmWindowOptions.save) {
                staffingGridComponent.saveAndExitStaffGridDetails();
                // this.removeSessionAttributes(event);
                this.router.navigate(['/staff-manager']);
              } else {
                // this.removeSessionAttributes(event);
                this.router.navigate(['/staff-manager']);
              }
            } else {
              this.setSelectedValue('StaffPlan');
            }
            document.body.classList.remove('pr-modal-open');
          });
        } else {
          this.openTileNavigationDialog();
        }
      } else if (this.currentComponent instanceof StaffManagerPlanComponent) {
        //   dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', '175px', '600px',
        //     'Exit Staffing Calculator', 'Are you sure you want to exit without saving your changes?');
        // }

        const viewLocation: string = event.view.location.hash;
        let staffManagerPlanComponent: StaffManagerPlanComponent;
        staffManagerPlanComponent = this.currentComponent;
        if (this.currentComponent instanceof StaffManagerPlanComponent && staffManagerPlanComponent.checkIfPlanEdited()) {
          staffManagerPlanComponent.isBackButtonClicked = false;
          let objDialogRef;
          objDialogRef = this.alertBox.openAlertWithSaveAndReturn('exit-dialog', '210px', '600px',
            'Exit Staff manger', '');
          document.body.classList.add('pr-modal-open');
          objDialogRef.afterClosed().subscribe(result => {
            document.body.classList.remove('pr-modal-open');
            if (result) {
              if (result === ConfirmWindowOptions.save) {
                if (staffManagerPlanComponent.saveAndExitCheckForError()) {
                  this.setSelectedValue('StaffMgmt');
                }
                staffManagerPlanComponent.isUserExiting = true;
                staffManagerPlanComponent.saveAndExitStaffingDetails(false);
              } else {
                // this.removeSessionAttributes(event);
                this.router.navigate(['/staff-manager']);
                this.setSelectedValue('StaffMgmt');
              }
            } else {
              this.setSelectedValue('StaffMgmt');
            }
            document.body.classList.remove('pr-modal-open');
          });

        } else {
          this.setSelectedValue('StaffMgmt');
          // this.removeSessionAttributes(event);
          window.clearInterval(this.staffGridService.autoSaveInterval);
          window.clearInterval(this.staffVarianceService.autoSaveInterval);
          this.router.navigate(['/staff-manager']);
        }
      } else if (this.planService.selectedPlanAction === 'In Process') {
        dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', '175px', '600px',
          'Exit Staff Planner', 'Are you sure you want to exit without saving your changes?');
      } else {
        dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', '175px', '600px',
          'Exit Staff Planner', 'Are you sure you want to navigate to Staff Manager?');
      }
      document.body.classList.add('pr-modal-open');
      if (dialogRef) {
        dialogRef.afterClosed().subscribe(result => {
          document.body.classList.remove('pr-modal-open');
          if (result) {
            // this.removeSessionAttributes(event);
            this.router.navigate(['/staff-manager']);
            this.setSelectedValue('StaffMgmt');
          } else {
            this.setSelectedValue('StaffPlan');
          }
          window.clearInterval(this.staffGridService.autoSaveInterval);
          window.clearInterval(this.staffVarianceService.autoSaveInterval);
        });
      }
    }
  }

  ngOnInit(): void {
    if (!Util.isNullOrUndefined(localStorage.getItem('loginAttribute'))) {
      localStorage.removeItem('loginAttribute')
    }
    if (!Util.isNullOrUndefined(sessionStorage.getItem('lock'))) {
      sessionStorage.removeItem('lock');
    }

    const selected = sessionStorage.getItem('selected');
    if (Util.isNullOrUndefined(selected)) {
      this.selectedValue = 'StaffPlan';
    } else {
      this.selectedValue = selected;
    }

    if (!Util.isNullOrUndefined(this.router.events)) {
      this.router.events.subscribe(data => {
        if (this.router.url.includes('staff-manager') || this.router.url.includes('plan-manager')) {
          this.setSelectedValue('StaffMgmt');
        } else {
          this.setSelectedValue('StaffPlan');
        }
      });
    }
    this.triggerRedirectTimer();
    this.checkUserSessionTimer();

    this.planService.getRedirectUrl().subscribe(data => {
      this.productHelp.logoutUrl = data.logoutUrl;
      this.productHelp.environmentName = data.environmentName;
    });
    this.userService.userAccess.subscribe(user=>
      {
          if(user && user.role!=undefined)
          {
            let userAccess:UserAccess=user;
            this.routePageBasedonUserAccess(userAccess);
          }
          else{
            this.userService.fetchUserRole().subscribe(data => {
              if(data)
              {
              let userAccess:UserAccess=data;
              if(userAccess.department===null || userAccess.facility.length==0)
              {
              userAccess=new UserAccess();
              this.routePageBasedonUserAccess(userAccess);
              }
              else{
              this.userService.setUserAccess(userAccess);
              sessionStorage.setItem('userAccess',JSON.stringify(userAccess));
              this.routePageBasedonUserAccess(userAccess);
              }
              }
              else{
                this.routePageBasedonUserAccess(new UserAccess);
              }
            });
          }
      }
      );
  }

  routePageBasedonUserAccess(userAccess:UserAccess):void {
    this.privileges = this.userService.user.privileges.filter(privileges => privileges.code === Permissions.SMUSERAUTHENTICATION);
    if (this.privileges.length > 0) {
      userAccess.featureToggle = true;
    }
    this.accessLevel = userAccess.role;
    if (this.accessLevel === 'Staff Scheduler') {
      this.plannerFlag = true;
      this.managerFlag = true;
    } else if (this.accessLevel === 'Staff Planner') {
      this.plannerFlag = true;
      this.router.navigate(['/plan-list']);
    } else if (this.accessLevel === 'Staff Manager') {
      this.managerFlag = true;
      this.router.navigate(['/staff-manager']);
    } else if (this.accessLevel === 'Premier Admin' || this.accessLevel === 'Data Coordinator' || this.accessLevel === 'Labor Coach' ||
      this.accessLevel === 'Executive') {
      this.plannerFlag = true;
      this.managerFlag = true;
    } else if (this.accessLevel === 'User') {
      this.deptInPlanner = userAccess.department.filter(permission => permission.permissions.includes(Permissions.STAFFPLANNER)).map(dept => dept.key.toString()).length > 0;
      this.deptInManager = userAccess.department.filter(permission => permission.permissions.includes(Permissions.STAFFMANAGER)).map(dept => dept.key.toString()).length > 0;
      if (this.deptInPlanner  && this.deptInManager) {
        this.plannerFlag = true;
        this.managerFlag = true;
      } else if (this.deptInPlanner) {
        this.plannerFlag = true;
        this.router.navigate(['/plan-list']);
      } else if (this.deptInManager) {
        this.managerFlag = true;
        this.router.navigate(['/staff-manager']);
      } else {
        const errorCode = this.pageRedirectionService.generateErrorCode(404);
        this.pageRedirectionService.redirectToWhoopsPage(errorCode);
      }
    } else {
      const errorCode = this.pageRedirectionService.generateErrorCode(404);
      this.pageRedirectionService.redirectToWhoopsPage(errorCode);
    }
  }
  setSelectedValue(value: string): void {
    this.selectedValue = value;
    sessionStorage.setItem('selected', value);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent): void {
    const target = (evt.target as HTMLInputElement);
    if (

      evt.which === 8 &&
      (target.nodeName !== 'INPUT' && target.nodeName !== 'SELECT' && target.nodeName !== 'DIV')
    ) {
      evt.preventDefault();
    }
  }

  openTileNavigationDialog(): void {
    if (this.planService.selectedPlanAction === 'Active') {
      const dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', '175px', '600px',
        'Exit Staff Planner', 'Are you sure you want to navigate to Staff Manager?');
      document.body.classList.add('pr-modal-open');
      if (dialogRef) {
        dialogRef.afterClosed().subscribe(result => {
          document.body.classList.remove('pr-modal-open');
          if (result) {
            this.removeSessionAttributes(event);
            this.router.navigate(['/staff-manager']);
            this.setSelectedValue('StaffMgmt');
          } else {
            this.setSelectedValue('StaffPlan');
          }
          window.clearInterval(this.staffGridService.autoSaveInterval);
          window.clearInterval(this.staffVarianceService.autoSaveInterval);
        });
      }
    } else {
      // this.removeSessionAttributes(event);
      window.clearInterval(this.staffGridService.autoSaveInterval);
      window.clearInterval(this.staffVarianceService.autoSaveInterval);
      this.router.navigate(['/staff-manager']);
      this.setSelectedValue('StaffMgmt');
    }
  }

  public removeSessionAttributes(event: any): void {
    sessionStorage.removeItem('lock');
    const urlFlag = this.currentComponent instanceof PlanListComponent || this.currentComponent instanceof StaffManagerComponent;
    if (!this.planService.planAlreadyInUse && !urlFlag) {
      const planKey = sessionStorage.getItem('plankey');
      if (!Util.isNullOrUndefined(planKey)) {
        this.planService.removePlanKeyFromSessionAttributeSubscribe(Number(planKey)).subscribe();
      }
    }

    if (!this.staffVarianceService.planAlreadyInUse && !urlFlag) {
      const activePlanKey = sessionStorage.getItem('activePlanKey');
      if (!Util.isNullOrUndefined(activePlanKey)) {
        this.staffVarianceService.removePlanKeyFromSessionAttributeSubscribe(Number(activePlanKey)).subscribe();
      }
    }
  }

  private triggerRedirectTimer(): void {
    if (this.currentComponent instanceof PlanSetupComponent || this.currentComponent instanceof OffGridActivitiesComponent
      || this.currentComponent instanceof StaffScheduleComponent || this.currentComponent instanceof StaffingGridComponent) {
      this.autoRedirectInterval = (Number)(setInterval(() => {
        this.redirect();
      }, 1800000));
    }

    if (this.currentComponent instanceof PlanListComponent || this.currentComponent instanceof StaffManagerComponent) {
      this.sessionTimeoutInterval = (Number)(setInterval(() => {
        this.alertSessionExpires();
      }, 1800000));
    }


  }

  @HostListener('document:keydown', ['$event'])
  @HostListener('document:click', ['$event'])
  refreshLogoutTrigger(event): void {
    window.clearInterval(this.autoRedirectInterval);
    window.clearInterval(this.sessionTimeoutInterval);
    this.triggerRedirectTimer();
  }

  private redirect(): void {
    if (this.currentComponent instanceof PlanSetupComponent || this.currentComponent instanceof OffGridActivitiesComponent
      || this.currentComponent instanceof StaffScheduleComponent || this.currentComponent instanceof StaffingGridComponent) {
      let isPlanCompleted = false;
      if (this.currentComponent instanceof PlanSetupComponent && !Util.isNullOrUndefined(this.currentComponent.plan)) {
        isPlanCompleted = this.currentComponent.plan.planCompleted;
      } else if (!(this.currentComponent instanceof PlanSetupComponent) && !Util.isNullOrUndefined(this.currentComponent.planDetails)) {
        isPlanCompleted = this.currentComponent.planDetails.planCompleted;
      }
      if (!isPlanCompleted) {
        window.clearInterval(this.autoRedirectInterval);
        window.clearInterval(this.staffGridService.autoSaveInterval);
        const objDialogRef = this.alertBox.openAlertWithReturnNoConfirm('exit-dialog', '175px', '600px',
          'User Inactivity', 'This page will be redirected due to user inactivity.');
        objDialogRef.afterClosed().subscribe(result => {
          document.body.classList.remove('pr-modal-open');
          sessionStorage.removeItem('reload');
          // this.removeSessionAttributes(event);
          this.router.navigate(['/plan-list']);
          this.setSelectedValue('StaffPlan');
        });
      }
      sessionStorage.removeItem('reload');
    }
  }

  private checkUserSessionTimer(): void {
    this.userLogoutInterval = (Number)(setInterval(() => {
      this.checkForLoginAttribute();
    }, 2000));
  }

  private checkForLoginAttribute() {
    let loginAttribute = localStorage.getItem('loginAttribute');
    if (!Util.isNullOrUndefined(loginAttribute) && loginAttribute.localeCompare('logout') === 0) {
      if (this.currentComponent instanceof PlanSetupComponent || this.currentComponent instanceof OffGridActivitiesComponent
        || this.currentComponent instanceof StaffScheduleComponent || this.currentComponent instanceof StaffingGridComponent
        || this.currentComponent instanceof StaffManagerPlanComponent) {
        window.clearInterval(this.autoRedirectInterval);
        window.clearInterval(this.staffGridService.autoSaveInterval)
      }
      localStorage.removeItem('loginAttribute');
      sessionStorage.removeItem('reload');
      this.removeSessionAttributes(event);
      this.pageRedirectionService.redirectToExternalPage(this.productHelp.logoutUrl);
    }
  }

  private alertSessionExpires() {
    localStorage.removeItem('loginAttribute');
    sessionStorage.removeItem('reload');
    this.removeSessionAttributes(event);
    this.pageRedirectionService.redirectToExternalPage(this.productHelp.logoutUrl);
  }
}
