import {AfterViewInit, Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, Router, RoutesRecognized} from '@angular/router';
import {PlanService} from '../../../shared/service/plan-service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {ErrorHandlerService} from '../../../shared/service/error-handler-service';
import {CopyPlanModalComponent} from '../components/copy-plan-modal/copy-plan-modal.component';
import {PlanDetails} from '../../../shared/domain/plan-details';
import {CorpDetails} from '../../../shared/domain/CorpDetails';
import {CorpService} from '../../../shared/service/corp-service';
import {EntityService} from '../../../shared/service/entity-service';
import {EntityDetails} from '../../../shared/domain/EntityDetails';
import {DepartmentService} from '../../../shared/service/department-service';
import {DeptDetails, Permissions} from '../../../shared/domain/DeptDetails';
import {User} from '../../../shared/domain/user';
import {UserService} from '../../../shared/service/user.service';
import {OAServiceValues} from '../../../shared/domain/OAServiceValues';
import * as moment from 'moment';

import {AlertBox} from '../../../shared/domain/alert-box';
import {filter, map, pairwise, startWith} from 'rxjs/operators';
import {Observable} from "rxjs";
import {ProductHelp} from "../../../shared/domain/product-help";
import {PageRedirectionService} from "../../../shared/service/page-redirection.service";
import {PlatformLocation} from "@angular/common";
import {RoutingStateService} from "../../../shared/domain/routing-state.service";
import {Log} from "../../../shared/service/log";
import {FormControl} from "@angular/forms";
import { UserAccess } from 'src/app/shared/domain/userAccess';
import {LoaderService} from '../../../shared/service/loader.service';
import {Util} from "../../../shared/util/util";

@Component({
  selector: 'app-plan-list',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class PlanListComponent implements OnInit, AfterViewInit {
  myControl = new FormControl();
  myControlEnt = new FormControl();
  myControlDept = new FormControl();
  myControlView = new FormControl();
  corpSearch: Observable<CorpDetails[]>;
  entitySearch: Observable<EntityDetails[]>;
  deptSearch: Observable<DeptDetails[]>;
  corpModel: string;
  entityModel: string;
  deptModel: string;
  allDeptId = 'AllDepts';
  selectPlanOptions = ["Active", "All", "Archived"];
  accessLevel = '';
  plannerFlag = false;
  managerFlag = false;


  public errorMessage = '';
  selectPlan: string;
  selectePlanValue;
  departmentSortOrder = 'asc';
  corpDetails: CorpDetails[];
  corpDetailsCodeList: Array<string> = [];
  entDetailsCodeList: Array<string> = [];
  deptDetailsCodeList: Array<string> = [];
  entityDetails: EntityDetails [];
  deptDetails: DeptDetails [];
  disablePlanFlag: boolean;
  activePlanData: PlanDetails[] = [];
  listDeptKeys: Array<number> = [];
  listfacKeysInDept: string[] = [];
  listCorpKeysInFac: string[] = [];
  isActiveFound = null;
  corpValue = 0;
  selectedentityValue = '';
  selecteddepartmentValue = '';
  displayedColumns = ['departmentName', 'defaultPlanFlag', 'planName',
    'dateUpdated', 'updatedBy', 'dateRange', 'volume', 'hours', 'planStatus', 'action'];
  dataSource: MatTableDataSource<PlanDetails> = new MatTableDataSource();
  user: User;
  showPlnStts: boolean;
  selectedViewFilter: string;
  paginateValue = 25;
  searchActivated = false;

  @HostListener('document:click', ['$event'])
  clickedOutside($event) {
      if (event.target['id'] !== 'cross' && event.target['id'] !== 'textbox' && event.target['id'] !== 'drop' ) {
        this.corpModel = sessionStorage.getItem('corpName');
      }else if (event.target['id'] === 'cross' || event.target['id'] === 'textbox' || event.target['id'] === 'drop' ) {
        this.corpModel = '';
      }

    if (event.target['id'] !== 'crossEnt' && event.target['id'] !== 'textboxEnt' && event.target['id'] !== 'dropEnt' ) {
      this.entityModel = sessionStorage.getItem('entName');
    }else if (event.target['id'] === 'crossEnt' || event.target['id'] === 'textboxEnt' || event.target['id'] === 'dropEnt' ) {
      this.entityModel = '';
    }

    if (event.target['id'] !== 'crossDept' && event.target['id'] !== 'textboxDept' && event.target['id'] !== 'dropDept' ) {
      this.deptModel = sessionStorage.getItem('departmentName');
    }else if (event.target['id'] === 'crossDept' || event.target['id'] === 'textboxDept' || event.target['id'] === 'dropDept' ) {
      this.deptModel = '';
    }

    if (event.target['id'] !== 'textboxView' && event.target['id'] !== 'dropView' ) {
      this.selectPlan = sessionStorage.getItem('viewFilter');
    }else if(event.target['id'] === 'textboxView' || event.target['id'] === 'dropView'){
      this.selectPlan = '';
    }






  }

  @HostListener('keydown.backspace', ['$event'])
  onKeyDown(evt: KeyboardEvent) {
    if (event.target['id'] === 'textboxView' || event.target['id'] === 'dropView') {
      evt.preventDefault();
    }
  }



  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  objOAServiceValues: OAServiceValues = new OAServiceValues();
  alertBox: AlertBox;
  private productHelp: ProductHelp;
  userAccess:UserAccess;
  userAccessRetrived:boolean;
  constructor(private planService: PlanService, private corpService: CorpService,
              private entityService: EntityService,
              private departmentService: DepartmentService,
              private userService: UserService,
              private dialog: MatDialog, public router: Router,
              private errorHandler: ErrorHandlerService,
              private pageRedirectionService: PageRedirectionService,
              private platformLocation: PlatformLocation,
              private routingState: RoutingStateService,
              private loaderService: LoaderService) {
    this.user = this.userService.user;
    this.productHelp = new ProductHelp();
    this.alertBox = new AlertBox(this.dialog);
    this.alertBox.handleWindowPerformance(window.performance,
        this.planService, this.productHelp, this.pageRedirectionService, this.userService);
  }

  plansData: PlanDetails[];
  plan: PlanDetails;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.data = this.plansData;
  }

  ngOnInit() {
    this.checkUserRole();
    this.clearLocalStorage();
    const pageSize = parseInt(sessionStorage.getItem('pageSize'), 10);
    if (!Util.isNullOrUndefined(pageSize) && isFinite(pageSize)) {
          this.paginateValue = pageSize;
    }
    // this.myControl.setValue( this.selectedCorp : this.corpModel);
  }

  checkUserRole(){
    this.userService.userAccess.subscribe(user=>
      {
        this.loaderService.show();
          if(user.role==undefined)
          {
            this.userAccess=new UserAccess();
          }
          else{
            this.userAccess=user;
            // sessionStorage.removeItem('corpId');
            this.loadCorpDetails();
            this.userAccessRetrived=true;
            this.loaderService.hide();
          }
      });
  }

  ngDoCheck() {
    //if(!this.userAccessRetrived)
    //this.checkUserRole();
  }

  filterDept(value: string){
    if(value.length>0){
      this.searchActivated = true;
    }
    else{
      this.searchActivated = false;
    }
    const filterValue = value.toLowerCase();
    for (let dept of this.deptDetailsCodeList) {
      if (dept.toLowerCase() === filterValue) {
        this.searchActivated = false;
        return this.deptDetails;
      }
    }
    return this.deptDetails.filter(clients => clients.name.toLowerCase().includes(filterValue) || clients.code.toLowerCase().includes(filterValue));
  }
  clear(){
    this.corpModel = '';
  }
  clearEnt(){
    this.entityModel = '';
  }

  clearDept(){
    this.deptModel = '';
  }

  clearLocalStorage() {
    localStorage.setItem('plankey', '');
  }
isPlanActive( planAction: string, defaultPlanFlag: boolean): boolean {
  if (defaultPlanFlag && planAction.toLocaleUpperCase() === 'ACTIVE') {
    return true;
  } else {
    return false;
  }
}
  // fetch plans from DB
  loadPlans() {
    this.addFilter();
    if ((this.selecteddepartmentValue === '' || this.selecteddepartmentValue === 'AllDepts') &&
      this.deptDetails !== null) {
      this.listDeptKeys = [];
      for (const department of this.deptDetails) {
        if (department.key !== null) {
          this.listDeptKeys.push(Number(department.key));
        }
      }
    }
    if (this.listDeptKeys.length !== 0) {
      this.planService.getPlans(this.listDeptKeys).subscribe(data => {
        this.populatePlanDetails(data);
        this.showPlnStts = true;
      });
    } else {
      this.plansData = null;
    }
  }
  limitDecimals(value){
    if(value !== null){
      let limitedValue = String(value);
      return (limitedValue.indexOf('.') > 0) ? limitedValue.slice(0, limitedValue.indexOf('.') + 2) : limitedValue;
    }else{
      return value;
    }
  }

  populatePlanDetails(planData: PlanDetails[]) {
      this.plansData = planData;
      setTimeout(() => this.dataSource.paginator = this.paginator);
      this.plansData.sort(this.sortData);
      this.dataSource.data = this.plansData;
      setTimeout(() => this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
          if (sortHeaderId.localeCompare('planStatus') === 0) {
              return data['totalAnnualHoursVariance'];
          } else if (sortHeaderId.localeCompare('hours') === 0) {
              return data['totalAnnualHours'];
          } else if (sortHeaderId.localeCompare('dateUpdated') === 0) {
              return data['updatedTimeStamp'];
          } else if (sortHeaderId.localeCompare('updatedBy') === 0) {
              const updatedBy = data['updatedBy'] ? data['updatedBy'] : 'N/A';
              return updatedBy.toString().toLocaleLowerCase();
          } else if (sortHeaderId.localeCompare('volume') === 0) {
              const utilizedAverageVolume = data['utilizedAverageVolume'];
              const days = this.findLeapYear(data['effectiveEndDate']);
              const volume = utilizedAverageVolume * days;
              return volume;
          } else if (sortHeaderId.localeCompare('planName') === 0) {
              return data['name'].toString().toLocaleLowerCase();
          } else if (sortHeaderId.localeCompare('dateRange') === 0) {
              return data['effectiveStartDate'];
          } else {
              return data[sortHeaderId].toString().toLocaleLowerCase();
          }
      });
      setTimeout(() => this.dataSource.sort = this.sort);
      setTimeout(() => {
          if (!Util.isNullOrUndefined(this.paginator)) {
              this.paginator.pageSize = this.paginateValue;
          }
      });
  }

  viewActivePlans() {
    // user selected view stored in local storage for retaining
    sessionStorage.setItem('viewFilter', 'Active');
    this.storeUserSelections();
    this.selectedViewFilter = 'Active';
    // user selected view assigned to default in view dropdown on navigation
    this.selectPlan = 'Active';

    this.addFilter();
    for (const department of this.deptDetails) {
      if (department.key !== null) {
        this.listDeptKeys.push(Number(department.key));
      }
    }
    if (this.listDeptKeys.length !== 0) {
      this.getplansByActions('Active');
    } else {
      this.plansData = null;
    }
  }

  // logic to enable and disable based on plan status and action
  checkPlanDisabled(plan: PlanDetails) {
    if (plan != null && plan.name != null) {
      if ((plan.status === null || plan.status === 'In Process') ||
        (plan.action === null || plan.action === 'Archived')) {
        this.disablePlanFlag = true;
      } else {
        this.disablePlanFlag = false;
      }
    }
    return this.disablePlanFlag;
  }

  IsDateRangeOverlapping(selectedPlan: PlanDetails, planData: PlanDetails) {
    const isPlanActive = this.alertBox.isDateRangeOverlapping(selectedPlan, planData);
    return isPlanActive;
  }

  // make plan active and inactive for a specific effective data range
  updatePlanActvStts(selectedPlan: PlanDetails, event: MatCheckboxChange, selectedView: string) {
    this.activePlanData = [];
    this.isActiveFound = false;
    if (event.checked) {
      if (selectedPlan.effectiveStartDate !== null && selectedPlan.effectiveEndDate !== null) {
        for (const planData of this.plansData) {
          if (selectedPlan.name !== planData.name && selectedPlan.departmentName === planData.departmentName) {

            if (this.IsDateRangeOverlapping(selectedPlan, planData) && planData.defaultPlanFlag === true) {
              this.isActiveFound = true;
              this.activePlanData.push(planData);
            }


          }
        }

        if (this.isActiveFound) {
          const alertMessage = 'You already have an active plan in this period.'
            + '\n'
            + 'Click Confirm to make this plan your Active plan effective from tomorrow.';
          const dialogRef = this.alertBox.openAlertWithReturn('exit-dialog',
             '190px', '600px', 'Staff Planner', alertMessage);
          document.body.classList.add('pr-modal-open');

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              for (const actPlanData of this.activePlanData ) {
                // if(actPlanData.key !== selectedPlan.key ) {
                  actPlanData.defaultPlanFlag = false;
                  actPlanData.action = 'Inactive';
                  this.planService.updatePlanAsActive(actPlanData).subscribe(planData => {
                    return planData;
                  });
                // }

                  selectedPlan.action = 'Active';
                  selectedPlan.defaultPlanFlag = true;
                  this.planService.updatePlanAsActive(selectedPlan).subscribe(planData => {
                  selectedPlan = planData;
                  return selectedPlan;
                });
                  this.displayPlansWithDelay(selectedView);
              }

            } else {
              this.displayPlans(selectedView);
            }
            document.body.classList.remove('pr-modal-open');
          });

        } else {
          const dialogRef = this.alertBox.openAlertWithReturn('exit-dialog',
             '175px', '350px', 'Staff Planner', 'Do you want to make this plan Active?');
          document.body.classList.add('pr-modal-open');
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              selectedPlan.action = 'Active';
              selectedPlan.defaultPlanFlag = true;
              this.planService.updatePlanAsActive(selectedPlan).subscribe(planData => {
                return planData;
              });
              this.displayPlansWithDelay(selectedView);
            } else {
              this.displayPlans(selectedView);
            }
            document.body.classList.remove('pr-modal-open');
          });
        }
      }
    } else {
      const dialogRef = this.alertBox.openAlertWithReturn('exit-dialog',
        '175px', '420px', 'Staff Planner', 'Do you want to make this plan Inactive?');
      document.body.classList.add('pr-modal-open');

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          selectedPlan.action = 'Inactive';
          selectedPlan.defaultPlanFlag = false;
          this.planService.updatePlanAsActive(selectedPlan).subscribe(planData => {
            return true;
          });
          this.displayPlansWithDelay(selectedView);
        } else {
          this.displayPlans(selectedView);
        }
        document.body.classList.remove('pr-modal-open');
      });

    }
  }

  deleteRow(plan: PlanDetails, selectedView: string) {
    const dialogRef = this.alertBox.openAlertWithReturn('exit-dialog',
      '175px', '350px',
    'Staff Planner', 'Are you sure you want to delete this plan?');
    document.body.classList.add('pr-modal-open');

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index: number = this.plansData.indexOf(plan);
        if (index !== -1) {
          this.plansData.splice(index, 1);
        }
        this.planService.updateDeleteFlag(plan).subscribe(data => {
          return this.displayPlans(selectedView);
        });
        document.body.classList.remove('pr-modal-open');
      }
    });
  }

  // display modal window page
  createCopyPlan(copy: PlanDetails, selectedView: any) {
    localStorage.setItem('planId', copy.key);
    localStorage.setItem('listDeptKeys', this.listDeptKeys.toString());
    const dialogs = this.dialog.open(CopyPlanModalComponent);
    document.body.classList.add('pr-modal-open');
    dialogs.afterClosed().subscribe(res => {
      document.body.classList.remove('pr-modal-open');
    });
  }

  // update the plan action and status as per request
  updatePlanStatus(plan: PlanDetails, selectedView: string) {
    if (plan != null && (plan.action === 'Archived' || plan.action === 'Inactive')) {
      this.planService.updatePlanStatus(plan).subscribe((data) => {
        return this.displayPlans(selectedView);
      });
      // this.displayPlans(selectedView);
    }
  }

  // criteria to display plan(s) based on corporation, entity & department selection
  addFilter() {
    this.listDeptKeys = [];
    if (this.selecteddepartmentValue !== '' && !(this.selecteddepartmentValue === 'AllDepts')) {
      this.listDeptKeys.push(Number(this.selecteddepartmentValue));
    }
  }

  displayPlansWithDelay(selectedView: string) {
    setTimeout(() => {
        this.displayPlans(selectedView);
      },
      1000);
  }

  // display plans on change of view
  displayPlans(selectedView: string) {
    this.showPlnStts = false;
    // user selected view stored in local storage for retaining
    sessionStorage.setItem('viewFilter', selectedView);
    this.storeUserSelections();
    this.selectedViewFilter = selectedView;
    // user selected view assigned to default in view dropdown on navigation
    this.selectPlan = selectedView;
    if (selectedView === 'Active' || selectedView === 'Archived') {
      this.addFilter();
      if ((this.selecteddepartmentValue === '' || this.selecteddepartmentValue === 'AllDepts') &&
        this.deptDetails !== null) {
        for (const department of this.deptDetails) {
          if (department.key !== null) {
            this.listDeptKeys.push(Number(department.key));
          }
        }
      }
      if (this.listDeptKeys.length !== 0) {
            this.getplansByActions(selectedView);
      } else {
        this.plansData = null;
      }

    } else {
      this.loadPlans();
    }
  }
  displayPlansForChange(selectedView: string, event) {
    this.selecteddepartmentValue = event.option.id;
    sessionStorage.setItem('departmentName', this.deptModel);
    this.showPlnStts = false;
    // user selected view stored in local storage for retaining
    this.displayPlans(selectedView);
  }

  getplansByActions(selectedView: string) {
    this.planService.getAllPlansByPlanAction(selectedView, this.listDeptKeys).subscribe(actionData => {
        this.populatePlanDetails(actionData);
    });
  }

  sortData(a, b) {
    return (a.departmentName.toLocaleLowerCase() > b.departmentName.toLocaleLowerCase()) ? 1 :
      (a.departmentName.toLocaleLowerCase() < b.departmentName.toLocaleLowerCase()) ? -1 : 0;
  }
  loadCorpDetails() {

    if (this.userAccess) {
      if (this.userAccess.featureToggle) {
        this.listfacKeysInDept = this.userAccess.department.filter(permission => permission.permissions.includes(Permissions.STAFFPLANNER)).map(dept => dept.facilityId.toString());
        this.listCorpKeysInFac = this.userAccess.facility.filter(fac => this.listfacKeysInDept.includes(fac.id)).map(fac => fac.corporationId);
        this.corpDetails = this.userAccess.corporation.filter(corp => this.listCorpKeysInFac.includes(corp.id.toString()));
      } else {
        this.corpDetails = this.userAccess.corporation;
      }
      // this.corpValue = this.corpDetails[0].corp_id;
      if ((sessionStorage.getItem('viewFilter') !== undefined && sessionStorage.getItem('viewFilter') !== null) &&
        (sessionStorage.getItem('corpId') !== null && sessionStorage.getItem('corpId') !== '')
      && !Util.isNullOrUndefined(this.corpDetails.find(entity => entity.id === Number(sessionStorage.getItem('corpId'))))) {
        this.corpValue = Number(sessionStorage.getItem('corpId'));
      } else {
        this.corpValue = this.corpDetails[0].id;
      }
      this.corpModel = this.alertBox.updateCorporationModel(this.corpDetails);
      setTimeout(()=>this.corpSearch = this.myControl.valueChanges
        .pipe(
          startWith(''),
          map(value => this.alertBox.filter(value, this.corpDetailsCodeList, this.corpDetails))
        ),1000);
      for (let corpList of this.corpDetails) {
       let list = corpList.code + '-' + corpList.name;
       this.corpDetailsCodeList.push(list);
      }


      this.loadFacilityDetails();
      sessionStorage.setItem('corpId', this.corpValue.toString());
      sessionStorage.setItem('corpName', this.corpModel.toString());

    }
  }

  loadFacilityDetails() {
    if (this.userAccess) {
      this.populateFacilityDetail(false);
      if (sessionStorage.getItem('entName') !== null && !Util.isNullOrUndefined(
          this.entityDetails.find(entity => entity.code + '-' + entity.name === sessionStorage.getItem('entName')))) {
            this.entityModel = sessionStorage.getItem('entName');
        } else {
            this.entityModel = this.entityDetails[0].code + '-' +this.entityDetails[0].name;
        }
        if (sessionStorage.getItem('selectedEntity') !== null
        && !Util.isNullOrUndefined(this.entityDetails.find(entity => entity.id === sessionStorage.getItem('selectedEntity')))) {
        this.selectedentityValue = sessionStorage.getItem('selectedEntity');
      } else {
        this.selectedentityValue = this.entityDetails[0].id;
      }
      this.planService.entitySelected = this.selectedentityValue.toString();
      sessionStorage.setItem('entName', this.entityModel.toString());
      //sessionStorage.setItem('selectedEntity', this.selectedentityValue.toString());
      this.loadDeptDetails();
    }
  }

  populateFacilityDetail(updateModel: boolean): void {
    if (this.userAccess.featureToggle) {
      this.entityDetails = this.userAccess.facility.filter(fac => fac.corporationId === this.corpValue.toString() && this.listfacKeysInDept.includes(fac.id.toString()));
    } else {
      this.entityDetails = this.userAccess.facility.filter(fac => fac.corporationId === this.corpValue.toString());
    }
      setTimeout(() => this.entitySearch = this.myControlEnt.valueChanges
          .pipe(
              startWith(''),
              map(value => this.alertBox.filterEnt(value, this.entityDetails, this.entDetailsCodeList))
          ), 1000);
      this.entityDetails.sort((a, b) => (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) ? 1 :
          (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) ? -1 : 0);
      if (this.corpValue === Number(sessionStorage.getItem('corpId')) &&
          (this.planService.entitySelected !== null &&this.planService.entitySelected !== '')
          && !Util.isNullOrUndefined(this.entityDetails.find(entity => entity.id === this.planService.entitySelected))) {
          this.selectedentityValue = this.planService.entitySelected;
      } else {
          this.entityModel = this.entityDetails[0].code + '-' + this.entityDetails[0].name;
          if (updateModel) {
              this.selectedentityValue = this.entityDetails[0].id;
          }
      }
  }

  loadFacilityDetailsForChange(event) {
    this.corpValue = event.option.id;
    if (this.userAccess) {
      this.populateFacilityDetail(true);
      this.planService.entitySelected = this.selectedentityValue.toString();
      sessionStorage.setItem('corpName', this.corpModel.toString());
      sessionStorage.setItem('corpId', this.corpValue.toString());
      sessionStorage.setItem('selectedEntity', this.selectedentityValue.toString());
      sessionStorage.setItem('entName', this.entityModel.toString());
      this.loadDeptDetails();

    }
  }

  loadDeptDetails() {
    if (this.userAccess) {
      this.updateDepartmentDetail();
      for (let deptList of this.deptDetails) {
        let list = deptList.code + '-' + deptList.name;
        this.deptDetailsCodeList.push(list);
      }
      sessionStorage.setItem('departmentId', this.selecteddepartmentValue.toString());
      sessionStorage.setItem('departmentName', this.deptModel);
      this.planService.entitySelected = this.selectedentityValue.toString();
      //sessionStorage.setItem('selectedEntity', this.selectedentityValue.toString());
    }
  }

  updateDepartmentDetail(): void {
    if (this.userAccess.featureToggle) {
      this.deptDetails = this.userAccess.department.filter(dept => dept.facilityId.toString() === this.selectedentityValue
        && dept.permissions.includes(Permissions.STAFFPLANNER));
    } else {
      this.deptDetails = this.userAccess.department.filter(dept => dept.facilityId.toString() === this.selectedentityValue);
    }
      setTimeout(() => this.deptSearch = this.myControlDept.valueChanges
          .pipe(
              startWith(''),
              map(value => this.filterDept(value))
          ), 1000);
      if ((sessionStorage.getItem('viewFilter') !== undefined && sessionStorage.getItem('viewFilter') !== null) &&
          (sessionStorage.getItem('departmentId') !== undefined && sessionStorage.getItem('departmentId') !== null)
          && (this.selectedentityValue.toString() === sessionStorage.getItem('entityId'))) {
          this.selecteddepartmentValue = sessionStorage.getItem('departmentId');
          // this.selecteddepartmentValue = 'AllDepts';
      } else {
          this.selecteddepartmentValue = 'AllDepts';
      }
      if ((sessionStorage.getItem('viewFilter') !== undefined && sessionStorage.getItem('viewFilter') !== null) &&
          (sessionStorage.getItem('departmentName') !== undefined && sessionStorage.getItem('departmentName') !== null)
          && (this.selectedentityValue.toString() === sessionStorage.getItem('entityId'))) {
          this.deptModel = sessionStorage.getItem('departmentName');
          // this.selecteddepartmentValue = 'AllDepts';
      } else {
          this.deptModel = 'All Departments' ;
      }

      if (this.selectedViewFilter !== null && this.selectedViewFilter !== undefined) {
          this.displayPlans(this.selectedViewFilter);
      } else if (sessionStorage.getItem('viewFilter') !== null && sessionStorage.getItem('viewFilter') !== undefined) {
          this.displayPlans(sessionStorage.getItem('viewFilter'));
      } else {
          this.viewActivePlans();
      }
  }

  loadDeptDetailsForChange(event) {
    this.selectedentityValue = event.option.id;
    if (this.userAccess) {
        this.updateDepartmentDetail();
        sessionStorage.setItem('departmentId', this.selecteddepartmentValue.toString());
        console.log(this.selecteddepartmentValue);
        sessionStorage.setItem('departmentName', this.deptModel);
        sessionStorage.setItem('entName', this.entityModel.toString());
        this.planService.entitySelected = this.selectedentityValue.toString();
        sessionStorage.setItem('selectedEntity', this.selectedentityValue.toString());
    }
  }

  storevalues() {
    if (this.deptDetails != null && this.deptDetails.length > 0) {
      localStorage.setItem('Corpid', this.corpValue.toString());
      if (this.selecteddepartmentValue === 'AllDepts') {
        localStorage.setItem('Departmentid', this.deptDetails[0].key);
      } else {
        localStorage.setItem('Departmentid', this.selecteddepartmentValue);
      }
      localStorage.setItem('Enitityid', this.selectedentityValue.toString());
      // user selected corp, entity and dept combinations stored in session
      this.storeUserSelections();
      this.router.navigate(['/plan-setup']);
    }
  }

  storeUserSelections() {
    if (this.deptDetails != null && this.deptDetails.length > 0) {
      sessionStorage.setItem('corpId', this.corpValue.toString());
      sessionStorage.setItem('entityId', this.selectedentityValue);
      sessionStorage.setItem('departmentId', this.selecteddepartmentValue);
      sessionStorage.setItem('departmentName', this.deptModel);
    }
  }
  sendUserSelections(selectedPlanAction,plankey,option) {
    sessionStorage.removeItem('reload');
    this.planService.selectedPlanAction = selectedPlanAction;
    this.checkForUserAuthority(plankey,option)
    this.storeUserSelections();

  }

  sortChange(e) {
    this.departmentSortOrder = e.direction;
  }


  roundOf(x: number) {
    return Math.round(x);
  }

  checkDisplayPlanStatus(displayPlanStatus: string, selectPlan: string) {
    return  displayPlanStatus !== null && selectPlan === 'All' && this.showPlnStts;
  }

  onPaginateChange(event) {
    sessionStorage.setItem('pageSize', event.pageSize);
  }

  findLeapYear(effectiveEndDate: Date) {
    const planDate: Date = new Date(effectiveEndDate);
    let planYear: number;
    planYear = planDate.getFullYear();

    if ((planYear % 4 === 0 && planYear % 100 !== 0) || planYear % 400 === 0) {

      return 366;
    } else {
      return 365;
    }
  }

  canDeactivate(): boolean {
    sessionStorage.removeItem('reload');
    return true;
  }


  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHandler(event) {
    if (localStorage.getItem('url') != null && localStorage.getItem('url').localeCompare('app') === 0) {
      localStorage.setItem('url', 'unload');
    } else {
      localStorage.setItem('url', 'planner');
    }
  }

  private checkForUserAuthority(plankey: number,option:number) {
   this.planService.checkUserAccessToPlan(plankey).subscribe(result=>{
     if(result['data']&&option===0) {
       this.router.navigate(['/plan-setup'], {queryParams: {plankey: plankey}});
     }else if(result['data']&&option===1){
       this.router.navigate(['/staffing-grid'], {queryParams: {plankey: plankey}});
     }else {
       this.alertBox.openAlert('exit-dialog', '175px', '600px',
         'Staff Planner', 'User is not authorized to access selected Plan. Please refresh the page');
     }
   },error => {
     console.error('User is not authorized to acces plan key')
   })
  }

    checkVal($event): boolean {
        return false;
    }

}
