import {AfterViewInit, Component, DoCheck, HostListener, OnInit, ViewChild} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {PlanDetails} from '../../../shared/domain/plan-details';
import {PlanService} from '../../../shared/service/plan-service';
import {CorpService} from '../../../shared/service/corp-service';
import {CorpDetails} from '../../../shared/domain/CorpDetails';
import {EntityService} from '../../../shared/service/entity-service';
import {EntityDetails} from '../../../shared/domain/EntityDetails';
import {DepartmentService} from '../../../shared/service/department-service';
import {DeptDetails, Permissions} from '../../../shared/domain/DeptDetails';
import {DatePipe, PlatformLocation} from '@angular/common';
import * as moment from 'moment-timezone';

import {StaffVarianceService} from '../../../shared/service/staff-variance.service';
import {StaffVariance} from '../../../shared/domain/staff-variance';

import {ScheduleService} from '../../../shared/service/schedule-service';
import {StaffSchedule} from '../../../shared/domain/staff-schedule';
import {Router, RoutesRecognized} from '@angular/router';
import {AlertBox} from '../../../shared/domain/alert-box';
import {filter, map, pairwise, startWith} from 'rxjs/operators';
import {PageRedirectionService} from '../../../shared/service/page-redirection.service';
import {ProductHelp} from '../../../shared/domain/product-help';
import {RoutingStateService} from '../../../shared/domain/routing-state.service';
import {UserService} from '../../../shared/service/user.service';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {UserAccess} from '../../../shared/domain/userAccess';
import {LoaderService} from '../../../shared/service/loader.service';
import {EntityCorpTimePeriod} from "../../../shared/domain/entity-corp-time-period";
import {OAService} from "../../../shared/service/oa-service";
import {EntityCumulativeVariance} from "../../../shared/domain/entity-cumulative-variance";


@Component({
  selector: 'app-pco-staff-manager',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [DatePipe],
})
export class StaffManagerComponent implements OnInit, DoCheck {
  featureToggleFlag = false;
  myControl = new FormControl();
  myControlEnt = new FormControl();
  corpSearch: Observable<CorpDetails[]>;
  entitySearch: Observable<EntityDetails[]>;
  entityCumulativeVariances: EntityCumulativeVariance[];
  corpModel: string;
  entityModel: string;
  @ViewChild('dp') dp;
  displayedColumns = ['dept_nm', 'dateUpdated', 'uploadedBy', 'actualHrs', 'targetHrs', 'dailyVariance', 'priorCumulative', 'comments'];
  dataSource: MatTableDataSource<StaffVariance> = new MatTableDataSource();
  activePlans: PlanDetails[];
  plan: PlanDetails;
  testDept: DeptDetails[];
  staffVarianceDetails: StaffVariance[];
  departmentsWithActivePlans: DeptDetails[];
  corpDetails: CorpDetails[];
  entityDetails: EntityDetails[];
  deptsKeysWithActivePlans: number[];
  selectedCorp = 0;
  selectedEntity = 0;
  currentDate = new Date();
  todaysDate = new Date();
  numberOfDepartments: number;
  totalhoursVariance: number;
  productivityIndex: number;
  isProductivityIndexpositive : boolean;
  numberOfDepartmentsWithoutActivePlans: number;
  numberOfDepartmentsNotMeetingTarget: number;
  numberOfDepartmentsWithTarget = 0;
  numberOfDepartmentsNotStarted = 0;
  twoYearsBeforeCurrentDate: Date;
  planStatus: string;
  initialFlag = true;
  isCommentPresent = false;
  productivityIndexIcon = 0;
  paginateValue = 25;
  alertBox: AlertBox;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  timeZoneFlag = false;
  private productHelp: ProductHelp;
  corpDetailsCodeList: Array<string> = [];
  entDetailsCodeList: Array<string> = [];
  deptDetailsCodeList: Array<string> = [];
  accessLevel = '';
  plannerFlag = false;
  managerFlag = false;
  userAccess: UserAccess;
  userAccessRetrived: boolean;
  entityCorpTimePeriods: EntityCorpTimePeriod[];
  departmentKeys: Array<number> = [];
  listfacKeysInDept: string[];
  listCorpKeysInFac: string[];
  private deptKeys: string[];

  @HostListener('document:click', ['$event'])
  clickedOutside($event) {
    if (event.target['id'] !== 'crossEnt' && event.target['id'] !== 'textboxEnt' && event.target['id'] !== 'dropEnt') {
      this.entityModel = sessionStorage.getItem('entName');
    } else if (event.target['id'] === 'crossEnt' || event.target['id'] === 'textboxEnt' || event.target['id'] === 'dropEnt' ) {
      this.entityModel = '';
    }
    if (event.target['id'] !== 'cross' && event.target['id'] !== 'textbox' && event.target['id'] !== 'drop') {
          this.corpModel = sessionStorage.getItem('corpName');
      } else if (event.target['id'] === 'cross' || event.target['id'] === 'textbox' || event.target['id'] === 'drop' ) {
          this.corpModel = '';
      }
  }


  constructor(
    private router: Router,
    private planService: PlanService,
    private corpService: CorpService,
    private oaService: OAService,
    private entitySerive: EntityService,
    private departmentService: DepartmentService,
    private datePipe: DatePipe,
    private staffVarianceService: StaffVarianceService,
    private scheduleService: ScheduleService,
    private dialog: MatDialog,
    private pageRedirectionService: PageRedirectionService,
    private platformLocation: PlatformLocation,
    private routingState: RoutingStateService,
    private userService: UserService,
    private loaderService: LoaderService
  ) {
    // this.dataSource = new MatTableDataSource(this.staffVarianceDetails);
    this.staffVarianceDetails = [];
    this.entityCumulativeVariances = [];
    this.plan = new PlanDetails();
    this.alertBox = new AlertBox(this.dialog);
    this.alertBox.triggerTimeZoneFlag();
    this.productHelp = new ProductHelp();
    this.alertBox.handleWindowPerformance(window.performance,
          this.planService, this.productHelp, this.pageRedirectionService, this.userService);
  }

  departmentDetails: DeptDetails[];

  ngOnInit(): void {
    this.getMinDate();
    this.checkUserRole();
    const pageSize = parseInt(sessionStorage.getItem('pageSizeSM'), 10);
    this.timeZoneFlag = this.alertBox.getTimeZoneFlag();
    if (!this.alertBox.isNullOrUndefined(pageSize) && isFinite(pageSize)) {
      this.paginateValue = pageSize;
    }
    // this.myControl.setValue( this.selectedCorp : this.corpModel);
  }
  checkUserRole(){
    this.userAccess=JSON.parse(sessionStorage.getItem("userAccess"));
    if(this.userAccess && !this.userAccessRetrived)
    {
      this.loadCorpDetails();
      this.userAccessRetrived=true;
      //if spinner is there close it
      //this.loaderService.close();
      this.accessLevel = this.userAccess.role;
      if (this.accessLevel === 'Staff Scheduler') {
        this.plannerFlag = true;
        this.managerFlag = true;
      } else if (this.accessLevel === 'Staff Planner') {
        this.plannerFlag = true;
        this.router.navigate(['/plan-list']);
      } else if (this.accessLevel === 'Staff Manager') {
        this.managerFlag = true;
      } else if (this.accessLevel === 'Premier Admin' || this.accessLevel === 'Data Coordinator' || this.accessLevel === 'Labor Coach' ||
        this.accessLevel === 'Executive' || this.accessLevel === 'User') {
        this.plannerFlag = true;
        this.managerFlag = true;
      } else {
        const errorCode = this.pageRedirectionService.generateErrorCode(404);
        this.pageRedirectionService.redirectToWhoopsPage(errorCode);
      }
    }
    else if(!this.userAccessRetrived){
      //open the spinner
      //this.loaderService.show();
    }
  }

  ngDoCheck() {
    this.checkUserRole();
  }

  filter(value: string) {
    for (let corpList of this.corpDetails) {
      let list = corpList.code + '-' + corpList.name;
      this.corpDetailsCodeList.push(list);
    }
    const filterValue = value.toLowerCase();
    for (let corp of this.corpDetailsCodeList) {
      if (corp.toLowerCase() === filterValue) {
        return this.corpDetails;
      }
    }

    return this.corpDetails.filter(clients => clients.name.toLowerCase().includes(filterValue) || clients.code.toLowerCase().includes(filterValue));
  }

  filterEnt(value: string) {
    for (let entList of this.entityDetails) {
      let list = entList.code + '-' + entList.name;
      this.entDetailsCodeList.push(list);
    }
    const filterValue = value.toLowerCase();
    for (let ent of this.entDetailsCodeList) {
      if (ent.toLowerCase() === filterValue) {
        return this.entityDetails;
      }
    }
    return this.entityDetails.filter(clients => clients.name.toLowerCase().includes(filterValue)
      || clients.code.toLowerCase().includes(filterValue));
  }

  clear() {
    this.corpModel = '';
  }

  clearEnt() {
    this.entityModel = '';
  }

  getAllDepartmentPlans(): void {
    this.staffVarianceService.getAllDepartmentPlans().subscribe(deparmentData => {
      this.staffVarianceDetails = deparmentData;
      this.numberOfDepartmentsWithoutActivePlans = 0;
      this.totalhoursVariance = 0;
      this.productivityIndex = 0;
      this.numberOfDepartmentsNotMeetingTarget = 0;
      this.setStaffVarianceData();
    });
  }

  setStaffVarianceData(): void {

    this.getReleasedTimePeriod();
    if (this.staffVarianceDetails.length !== 0) {
      this.numberOfDepartments = this.departmentDetails.length;
      this.numberOfDepartmentsWithTarget = this.staffVarianceDetails.length;
      setTimeout(() => this.dataSource.paginator = this.paginator);
      this.staffVarianceDetails.sort(this.sortData);
      this.dataSource.data = this.staffVarianceDetails;
      let count = 0;
      setTimeout(() => this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
        if (sortHeaderId.localeCompare('dept_nm') === 0) {
          return data['departmentName'].toString().toLocaleLowerCase();
        } else if (sortHeaderId.localeCompare('dateUpdated') === 0) {
          let updatedDate = data['updatedTime'] ? data['updatedTime'] : '00/00/0000'
          return updatedDate;
        } else if (sortHeaderId.localeCompare('uploadedBy') === 0) {
          let updatedBy = data['updatedBy'] ? data['updatedBy'] : 'N/A';
          return updatedBy.toString().toLocaleLowerCase();
        } else if (sortHeaderId.localeCompare('actualHrs') === 0) {
          return data['actualHours'];
        } else if (sortHeaderId.localeCompare('targetHrs') === 0) {
          return data['targetHours'];
        } else if (sortHeaderId.localeCompare('dailyVariance') === 0) {
          return data['dailyVarianceHours'];
        } else if (sortHeaderId.localeCompare('priorCumulative') === 0) {
          return data['priorCumulativeHours'];
        } else {
          return data[sortHeaderId].toString().toLocaleLowerCase();
        }
      });
      setTimeout(() => this.dataSource.sort = this.sort);
      if (!this.alertBox.isNullOrUndefined(this.paginator)) {
        setTimeout(() => this.paginator.pageSize = this.paginateValue);
      }
      this.setScoreCard();
    }
  }

  sortData(a, b): 0 | 1 | -1 {
    return (a.departmentName.toLocaleLowerCase() >
      b.departmentName.toLocaleLowerCase()) ? 1 : (a.departmentName.toLocaleLowerCase() <
      b.departmentName.toLocaleLowerCase()) ? -1 : 0;
  }

  loadCorpDetails(): void {
    if (this.userAccess) {
      if (this.userAccess.featureToggle) {
        this.listfacKeysInDept = this.userAccess.department.filter(permission => permission.permissions.includes(Permissions.STAFFMANAGER)).map(dept => dept.facilityId.toString());
        this.listCorpKeysInFac = this.userAccess.facility.filter(fac => this.listfacKeysInDept.includes(fac.id)).map(fac => fac.corporationId);
        this.corpDetails = this.userAccess.corporation.filter(corp => this.listCorpKeysInFac.includes(corp.id.toString()));
      } else {
        this.corpDetails = this.userAccess.corporation;
      }
      if (sessionStorage.getItem('corpId') != null
        && !this.alertBox.isNullOrUndefined(this.corpDetails.find(entity => entity.id === Number(sessionStorage.getItem('corpId'))))) {
        this.selectedCorp = Number(sessionStorage.getItem('corpId'));
      } else {
        this.selectedCorp = this.corpDetails[0].id;
      }
      this.corpModel = this.alertBox.updateCorporationModel(this.corpDetails);
      setTimeout(() => this.corpSearch = this.myControl.valueChanges
        .pipe(
          startWith(''),
          map(value => this.alertBox.filter(value, this.corpDetailsCodeList, this.corpDetails))
        ), 1000);
      this.loadEntityDetails();
      sessionStorage.setItem('corpName', this.corpModel.toString());
    }
  }

  loadEntityDetails(): void {
    if (this.userAccess) {
      this.populateFacilityDetail(false);
      if (sessionStorage.getItem('entName') !== null
        && !this.alertBox.isNullOrUndefined(this.entityDetails.find(entity => entity.code + '-' + entity.name === sessionStorage.getItem('entName')))) {
        this.entityModel = sessionStorage.getItem('entName');
      } else {
        this.entityModel = this.entityDetails[0].code + '-' + this.entityDetails[0].name;
      }
      this.loadDeptDetails();
      sessionStorage.setItem('corpId', this.selectedCorp.toString());
      sessionStorage.setItem('entName', this.entityModel.toString());
      this.initialFlag = false;
    }
  }

    populateFacilityDetail(updateModel: boolean): void {
      if (this.userAccess.featureToggle) {
        this.entityDetails = this.userAccess.facility.filter(fac => fac.corporationId === this.selectedCorp.toString() && this.listfacKeysInDept.includes(fac.id.toString()));
      } else {
        this.entityDetails = this.userAccess.facility.filter(fac => fac.corporationId === this.selectedCorp.toString());
      }
        setTimeout(() => this.entitySearch = this.myControlEnt.valueChanges
            .pipe(
                startWith(''),
                map(value => this.alertBox.filterEnt(value, this.entityDetails, this.entDetailsCodeList))
            ), 1000);
        this.entityDetails.sort((a, b) => (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) ? 1 :
            (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) ? -1 : 0);
        if (sessionStorage.getItem('selectedEntity') !== null
            && !this.alertBox.isNullOrUndefined(this.entityDetails.find(entity => entity.id === sessionStorage
            .getItem('selectedEntity')))) {
            this.selectedEntity = Number(sessionStorage.getItem('selectedEntity'));
        } else {
            this.selectedEntity = Number(this.entityDetails[0].id);
            if (updateModel) {
                this.entityModel = this.entityDetails[0].code + '-' + this.entityDetails[0].name;
            }
        }
    }

  loadEntityDetailsForChange(event): void {
    this.selectedCorp = event.option.id;
    if (this.userAccess) {
      this.populateFacilityDetail(true);
      this.loadDeptDetails();
      sessionStorage.setItem('corpId', this.selectedCorp.toString());
      sessionStorage.setItem('corpName', this.corpModel.toString());
      if (sessionStorage.getItem('viewFilter') === undefined || sessionStorage.getItem('viewFilter') === null) {
        sessionStorage.setItem('viewFilter', 'Active');
      }
      this.initialFlag = false;
    }
  }

  loadDeptDetails(): void {
    if (this.userAccess) {
      if (this.userAccess.featureToggle) {
        this.departmentDetails = this.userAccess.department.filter(dept => dept.facilityId.toString() === this.selectedEntity.toString()
          && dept.permissions.includes(Permissions.STAFFMANAGER));
      } else {
        this.departmentDetails = this.userAccess.department.filter(dept => dept.facilityId.toString() === this.selectedEntity.toString());
      }
      this.numberOfDepartments = this.departmentDetails.length;
      this.loadPlanDetails();
      sessionStorage.setItem('selectedEntity', this.selectedEntity.toString());
      sessionStorage.setItem('entName', this.entityModel.toString());
    }
  }

  loadDeptDetailsForChange(event): void {
    this.selectedEntity = event.option.id;
    if (this.userAccess) {
      if (this.userAccess.featureToggle) {
        this.departmentDetails = this.userAccess.department.filter(dept => dept.facilityId.toString() === this.selectedEntity.toString()
          && dept.permissions.includes(Permissions.STAFFMANAGER));
      } else {
        this.departmentDetails = this.userAccess.department.filter(dept => dept.facilityId.toString() === this.selectedEntity.toString());
      }
      this.numberOfDepartments = this.departmentDetails.length;
      this.loadPlanDetails();
      sessionStorage.setItem('selectedEntity', this.selectedEntity.toString());
      sessionStorage.setItem('entName', this.entityModel.toString());
    }
  }

  loadPlanDetails(): void {
    const selectedDate = moment(new Date(this.currentDate)).format('YYYY-MM-DD');
    this.staffVarianceService.getPlansByDepartment(this.selectedEntity, selectedDate).subscribe(deparmentData => {
      console.log("getPlansByDepartment");
      if(deparmentData['data']){
        this.staffVarianceDetails = deparmentData['data'];
      }else{
        this.staffVarianceDetails = deparmentData;
      }
      if (this.userAccess.featureToggle) {
        this.deptKeys = this.userAccess.department.filter(permission => permission.permissions.includes(Permissions.STAFFMANAGER)).map(dept => dept.key.toString());
        this.staffVarianceDetails = this.staffVarianceDetails.filter(staffvar => this.deptKeys.includes(staffvar.departmentKey.toString()));
      }
      this.numberOfDepartmentsWithoutActivePlans = 0;
      this.totalhoursVariance = 0;
      this.productivityIndex = 0;
      this.numberOfDepartmentsNotMeetingTarget = 0;
      this.numberOfDepartmentsNotStarted = 0;
      this.setStaffVarianceData();
    });
  }

  getMinDate(): void {
    const currentDate = moment();
    this.twoYearsBeforeCurrentDate = currentDate.subtract(2, 'years').toDate();
    this.getDateFromSessionStrage();
    // get max date -- 14 days from today
    // const newCurrentDate = moment();
    // this.maxFutureDate = newCurrentDate.add(14, 'days').toDate();
  }

  getDateFromSessionStrage(): void {
    if (sessionStorage.getItem('currentDate') != null && this.initialFlag) {
      this.currentDate = new Date(sessionStorage.getItem('currentDate'));
    }
  }

  getActivePlansForSelectedDate(selectedDate): void {
    for (const deptDetails of this.departmentDetails) {
      deptDetails.active_plan = null;
    }
    sessionStorage.setItem('currentDate', selectedDate);
    this.currentDate = selectedDate;
    this.numberOfDepartmentsWithoutActivePlans = 0;
    this.totalhoursVariance = 0;
    this.productivityIndex = 0;
    this.numberOfDepartmentsNotStarted = 0;
    this.numberOfDepartmentsNotMeetingTarget = 0;
    const dateSelected = moment(new Date(this.currentDate)).format('YYYY-MM-DD');
    this.staffVarianceService.getPlansByDepartment(this.selectedEntity, dateSelected).subscribe(deparmentData => {
      if(deparmentData['data']){
        this.staffVarianceDetails = deparmentData['data'];
      }else{
        this.staffVarianceDetails = deparmentData;
      }
      if (this.userAccess.featureToggle) {
        this.deptKeys = this.userAccess.department.filter(permission => permission.permissions.includes(Permissions.STAFFMANAGER)).map(dept => dept.key.toString());
        this.staffVarianceDetails = this.staffVarianceDetails.filter(staffvar => this.deptKeys.includes(staffvar.departmentKey.toString()));
      }
    this.setStaffVarianceData();
    });
  }

  getPlanStatus(statusKey: number, createdDate: Date): string {

    const createDate = new Date(createdDate);
    const presentDate = new Date();
    const insertedDate = (createDate.getDate() + '-' + (createDate.getMonth() + 1) + '-' + createDate.getFullYear());
    const currentDate = (presentDate.getDate() + '-' + (presentDate.getMonth() + 1) + '-' + presentDate.getFullYear());
    let statusString: string;


    switch (statusKey) {
      case 2:
        statusString = 'In Process';
        break;
      case 4:
        statusString = 'Closed';
        break;
      case 5:
        statusString = 'Not Started';
        break;
      case 6:
        statusString = 'No Plan Available';
        break;
    }
    return statusString;
  }

  getActiveLink(statusKey: number, createdDate: Date): number {
    const createDate = new Date(createdDate);
    const presentDate = new Date();
    const insertedDate = (createDate.getDate() + '-' + (createDate.getMonth() + 1) + '-' + createDate.getFullYear());
    const currentDate = (presentDate.getDate() + '-' + (presentDate.getMonth() + 1) + '-' + presentDate.getFullYear());
    const difference = this.compareTwoDates(createDate, presentDate);
    this.timeZoneFlag = this.alertBox.getTimeZoneFlag();
    if ((statusKey === 2 || statusKey === 5) && (difference.localeCompare('1') === 0 || difference.localeCompare(('0')) === 0) && !this.timeZoneFlag) {
      return 1;
    } else if ((statusKey === 2 || statusKey === 5) && insertedDate.localeCompare(currentDate) === 0) {
      return 1;
    } else if ((statusKey === 4) && insertedDate.localeCompare(currentDate) !== 0) {
      return 1;
    } else {
      return 0;
    }
  }

  loadScheduleForThePlan(planKey: number): void {
    this.scheduleService.getScheduleDetails(planKey).subscribe(data => {
      this.plan.staffScheduleList = data;
      this.checkScheduleCreatedForToday(this.plan.staffScheduleList, planKey);
    });
  }

  checkScheduleCreatedForToday(staffScheduleList: StaffSchedule[], planKey: number): void {
    let scheduleExistForPlan = false;
    staffScheduleList.forEach(schedule => {
      if ((schedule.scheduleDays[0] === true && this.currentDate.getDay() === 1) ||
        (schedule.scheduleDays[1] === true && this.currentDate.getDay() === 2) ||
        (schedule.scheduleDays[2] === true && this.currentDate.getDay() === 3) ||
        (schedule.scheduleDays[3] === true && this.currentDate.getDay() === 4) ||
        (schedule.scheduleDays[4] === true && this.currentDate.getDay() === 5) ||
        (schedule.scheduleDays[5] === true && this.currentDate.getDay() === 6) ||
        (schedule.scheduleDays[6] === true && this.currentDate.getDay() === 0)) {
        scheduleExistForPlan = true;
      }
    });

    if (scheduleExistForPlan) {
      this.router.navigate(['/plan-manager'], {
        queryParams: {plankey: planKey},
        state: {selectedDate: this.currentDate}
      });
    } else {
      this.openScheduleDialog();
    }
  }

  openScheduleDialog(): void {
    this.alertBox.openAlert('exit-dialog', '190px', '600px',
      'Schedule Setup', 'Active plan for the selected department does not have a plan for this day of week. Please review the departmental plan in the Staff Planner module');
  }

  convertToDateString(): string {
    let day = this.currentDate.getDate().toString();
    let month = (this.currentDate.getMonth() + 1).toString();
    const year = this.currentDate.getFullYear().toString();
    if (parseInt(day, 10) < 10) {
      day = '0' + day;
    }
    if (parseInt(month, 10) < 10) {
      month = '0' + month;
    }
    const today = month + '-' + day + '-' + +year;
    return today;
  }

  getComments(shiftCommnetsList: string[]): string {
    let comments = '';
    let index = 0;
    const shift = ['3 AM - ', '7 AM - ', '11 AM - ', '3 PM - ', '7 PM  - ', '11 PM  - ', 'Total Hours - '];

    for (const shiftCommnet of shiftCommnetsList) {
      if (shiftCommnet !== '' && shiftCommnet !== ' ') {
        comments += shift[index] + shiftCommnet + '\n\n';
        this.isCommentPresent = true;
      }
      index = index + 1;
    }

    return comments;
  }

  checkComments(status: number, comments: string[]): boolean {
    if ((status === 2 || status === 4) && this.getComments(comments).length > 0) {
      return false;
    }
    return true;
  }

  setScoreCard(): void {
    let target = 0;
    let actual = 0;
    let totalVariance = 0;
    let lowerThreshold = 0;
    let upperThreshold = 0;
    let count = 0;
    for (const staffVariance of this.staffVarianceDetails) {
      if (staffVariance.actualHours > 0) {
        target = target + staffVariance.targetHours;
        actual = actual + staffVariance.actualHours;
      }
      if (staffVariance.recordStatusKey === 2 || staffVariance.recordStatusKey === 4) {
        totalVariance = totalVariance + staffVariance.dailyVarianceHours;
        lowerThreshold = lowerThreshold + (this.alertBox.isNullOrUndefined(staffVariance.lowerThreshold) ? 0 : staffVariance.lowerThreshold);
        upperThreshold = upperThreshold + (this.alertBox.isNullOrUndefined(staffVariance.upperThreshold) ? 0 : staffVariance.upperThreshold);
        count = count + 1;
      }
      if (staffVariance.recordStatusKey === 5) {
        this.numberOfDepartmentsNotStarted = this.numberOfDepartmentsNotStarted + 1;
      }
      this.numberOfDepartmentsWithoutActivePlans = this.numberOfDepartmentsWithoutActivePlans + 1;
      if (staffVariance.dailyVarianceHours < 0) {
        this.numberOfDepartmentsNotMeetingTarget = this.numberOfDepartmentsNotMeetingTarget + 1;
      }
    }
    this.numberOfDepartmentsWithoutActivePlans = this.numberOfDepartments - this.staffVarianceDetails.length;
    this.totalhoursVariance = totalVariance;
    this.productivityIndex = (target / actual) * 100;
    lowerThreshold = lowerThreshold / count;
    upperThreshold = upperThreshold / count;
    this.productivityIndex = isFinite(this.productivityIndex) ? this.productivityIndex : 0;
    if (count !== 0 && this.productivityIndex !== 0) {
      this.productivityIndexIcon = this.productivityIndex >= lowerThreshold && this.productivityIndex <= upperThreshold ? 1 : -1;
    }
    this.productivityIndex = this.productivityIndex < 0 ? -1 * this.productivityIndex : this.productivityIndex;
    this.getProductivityIndexpositive();
  }

  getProductivityIndexpositive(){
    let lowerEndTarget = 100;
    let upperEndTarget = 120;
    if (this.productivityIndex >= lowerEndTarget && this.productivityIndex <= upperEndTarget) {
      this.isProductivityIndexpositive = true;
    } else {
      this.isProductivityIndexpositive = false;
    }
  }

  onPaginateChange(event): void {
    sessionStorage.setItem('pageSizeSM', event.pageSize);
  }

  private compareTwoDates(createdDate: Date, selectedDate: Date): string {
// To calculate the time difference of two dates
    const differenceInTime = createdDate.getTime() - selectedDate.getTime();

// To calculate the no. of days between two dates
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);

    return Math.abs(differenceInDays).toFixed(0);
  }

  private openScreenRefreshDialog(): void {
    this.alertBox.openAlert('exit-dialog', '175px', '600px',
      'Staffing Planner', 'Plans have been updated by Job Scheduler. Refresh the page for latest Data');
  }

  canDeactivate(): boolean {
    sessionStorage.removeItem('reload');
    return true;
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event) {
    if (localStorage.getItem('url') != null && localStorage.getItem('url').localeCompare('app') === 0) {
      localStorage.setItem('url', 'unload');
    } else {
      localStorage.setItem('url', 'manager');
    }
  }

  getReleasedTimePeriod() {
    this.departmentKeys = [];
    for (const department of this.departmentDetails) {
      if (department.key !== null) {
        this.departmentKeys.push(Number(department.key));
      }
    }
    this.staffVarianceService.getReleasedTimePeriodFromDTM(this.departmentKeys, moment(new Date(this.currentDate))
      .format('YYYY-MM-DD')).subscribe(data => {
      this.entityCorpTimePeriods = data['data'];
      this.getPriorCumulativeHoursVariance();
    });
  }

  getPriorCumulativeHoursVariance() {
    const departmentKeys = [];
    let timePeriodCycleId = 0;
    let selectedFacCd = '';
    for (const facility of this.entityDetails) {
      if (this.selectedEntity === Number(facility.id)) {
        selectedFacCd = facility.code;
      }
    }
    if (this.entityCorpTimePeriods !== null && this.entityCorpTimePeriods !== undefined) {
       for (const entityCorpTimePeriod of this.entityCorpTimePeriods) {
         departmentKeys.push(entityCorpTimePeriod.entityId);
         timePeriodCycleId = entityCorpTimePeriod.corpTimePeriod.id;
       }
       if (timePeriodCycleId !== null && timePeriodCycleId !== undefined) {
         const timePeriodNumber = timePeriodCycleId.toString();
         if (departmentKeys.length > 0) {
           this.oaService.getPriorCumulativeHrsVariance(selectedFacCd, departmentKeys, timePeriodNumber).subscribe(data => {
             this.entityCumulativeVariances = data['data'];
             for (const entityCumulativeVar of this.entityCumulativeVariances) {
               if (entityCumulativeVar !== null) {
                 for (const staffVariance of this.staffVarianceDetails) {
                   if (staffVariance.departmentKey === entityCumulativeVar.departmentId) {
                     staffVariance.priorCumulativeHours = entityCumulativeVar.priorCumulativeHrsVariance;
                   }
                 }
               }
             }
           });
         }
      }
    }
  }
}
