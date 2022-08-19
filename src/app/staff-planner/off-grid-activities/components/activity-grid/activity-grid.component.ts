import { Component, Input, OnInit,Renderer2 } from '@angular/core';
import {Activity, OffGridActivities, VariableDepartmet} from '../../../../shared/domain/off-grid-activities';
import {PlanService} from '../../../../shared/service/plan-service';
import {PlanDetails} from 'src/app/shared/domain/plan-details';
import {map} from 'rxjs/operators';
import {PromptDialogComponent} from '../../../../shared/components/prompt-dialog/prompt-dialog.component';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {AlertBox} from '../../../../shared/domain/alert-box';
import {Util} from "../../../../shared/util/util";

@Component({
  selector: 'app-activity-grid',
  templateUrl: './activity-grid.component.html',
  styleUrls: ['./activity-grid.component.scss']
})
export class ActivityGridComponent implements OnInit {
  @Input('planDetails') planDetails: PlanDetails = new PlanDetails();
  @Input('ogaTypeKeyval') ogaTypeKeyval = 0;
  @Input('activityHeader') activityHeader = '';

  newoffgridactivity: OffGridActivities = new OffGridActivities();
  staffvalues: Array<number> = [];
  alertBox: AlertBox;
  isPlanEdited = false;
  loadFlag = true;

  constructor(private planService: PlanService, private dialog: MatDialog, private renderer: Renderer2) {
    this.alertBox = new AlertBox(this.dialog);
  }

  Listoffgridactivity: Array<OffGridActivities> = [];
  lstVariableDepartmet: VariableDepartmet[] = [];
  variableDepartment: Array<string> = [];
  vardepart: VariableDepartmet;
  activityEmptyFlag = false;

  ngOnInit() {
    this.getDistinctVariableDepartments();
    this.getActivitylist();
  }

  getActivitylist() {
    // Get applied Activities
    if (!this.planDetails.offGridActivities) {
      this.planDetails.offGridActivities = [];
      setTimeout( () => this.setFocusToInputElement(0), 10);
    } else {
      this.Listoffgridactivity = this.planDetails.offGridActivities.filter(t => t.typeKey === this.ogaTypeKeyval || !t.typeKey);
      if (this.Listoffgridactivity.length === 0) {
        this.addOffGridActivity(-1);
      } else {
        setTimeout( () => this.setFocusToInputElement(this.Listoffgridactivity.length - 1), 10);
      }
    }
  }

  getDistinctVariableDepartments() {
    this.planDetails.variableDepartmentPositions.forEach(ele => {
      const objvariableDepartment: VariableDepartmet = new VariableDepartmet();
      objvariableDepartment.categoryAbbreviation = ele.categoryAbbreviation;
      objvariableDepartment.key = ele.categoryKey;
      objvariableDepartment.categoryDescription = ele.categoryDescription;
      this.lstVariableDepartmet.push(objvariableDepartment);
    });
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }

  pasteNumberOnly(event:ClipboardEvent):boolean{
    let shiftHours=event.clipboardData;
    let a=shiftHours.getData("text");
    if((!(/^[+]?\d*$/.test(a)))){
      return false;
    }else {
      return true;
    }
  }

  activityTyped(lastIndex: number) {
    if (this.planDetails.offGridActivities.filter(val => val.name !== null && val.name.toUpperCase() ===
      this.Listoffgridactivity[lastIndex].name.toUpperCase()).length > 1) {
      if (this.Listoffgridactivity[lastIndex].name.toUpperCase() !== '') {
        const dialogRef = this.alertBox.openAlertForOGA('exit-dialog',  '175px', '350px', 'Off Grid Activities', 'Entered Activity Name already exist');
        if (!Util.isNullOrUndefined(dialogRef)) {
          dialogRef.afterClosed().subscribe(result => {
            setTimeout( () => this.setFocusToInputElement(lastIndex), 10);
            document.body.classList.remove('pr-modal-open');
          });
        }
      }
      this.Listoffgridactivity[lastIndex].name = null;
    } else {
        this.Listoffgridactivity[lastIndex].code = this.Listoffgridactivity[lastIndex].name;
        this.Listoffgridactivity[lastIndex].key = null;
    }
  }

  addOffGridActivity(lastIndex: number) {

    if (lastIndex === -1) {
      this.addNewOffgridActivity();
      return;
    }

    let emptyAcitivityFlag = false;
    let errorMessage = 'Enter an Activity Name.';

    for (const activity of this.Listoffgridactivity) {
      if (activity.code === '' || activity.name === null || activity.name.indexOf(' ') === 0 || activity.name === '') {
        if (activity.name) {
          if (activity.name.indexOf(' ') === 0) {
            errorMessage = 'The first character cannot be a space.';
          }
        }
        emptyAcitivityFlag = true;
        break;
      }
    }

    if (!emptyAcitivityFlag && this.Listoffgridactivity[lastIndex].code !== '') {
      this.addNewOffgridActivity();
    } else {
      document.body.classList.add('pr-modal-open');
      const dialogRef = this.alertBox.openAlertForOGA('exit-dialog', '175px', '350px', 'Off Grid Activities', errorMessage);
      if (!Util.isNullOrUndefined(dialogRef)) {
        dialogRef.afterClosed().subscribe(result => {
          setTimeout(() => this.setFocusToInputElement(lastIndex), 10);
          document.body.classList.remove('pr-modal-open');
        });
      }
    }
  }

  addNewOffgridActivity() {
    this.newoffgridactivity = new OffGridActivities();
    if (!this.planDetails.offGridActivities) {

      this.planDetails.offGridActivities = [];
    }
    for (const variableDepartment of this.lstVariableDepartmet) {
      this.vardepart = new VariableDepartmet();
      this.vardepart.categoryAbbreviation = variableDepartment.categoryAbbreviation;
      this.vardepart.categoryDescription = variableDepartment.categoryDescription;
      this.vardepart.key = variableDepartment.key;
      this.vardepart.staffCount = 0;
      this.newoffgridactivity.variableDepartmentList.push(this.vardepart);
    }
    this.newoffgridactivity.typeKey = this.ogaTypeKeyval;
    this.planDetails.offGridActivities.push(this.newoffgridactivity);
    this.Listoffgridactivity.push(this.newoffgridactivity);
    if (!this.loadFlag) {
      this.isPlanEdited = true;
    }
    this.loadFlag = false;
    setTimeout( () => this.setFocusToInputElement(this.Listoffgridactivity.length - 1), 10);
  }

  removeOffGridActivity(activityCode: OffGridActivities) {

    let alertMessage = 'Are you sure you want to delete this activity?';
    let width = '400px';
    let height = '175px';

    if (this.planDetails.totalAnnualHours) {
      if (this.planDetails.totalAnnualHours > 0) {
        alertMessage = 'Deleting a Activity will lead to loss of data entered and ' +
          'saved in the Staffing Grid previously. Click Confirm to continue?';
        width = '600px';
        height = '190px';
      }
    }
    const dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', height, width,
      'Off Grid Activities', alertMessage);
    document.body.classList.add('pr-modal-open');

    dialogRef.afterClosed().subscribe(result => {
      const index = this.planDetails.offGridActivities.indexOf(activityCode);
      if (result) {
        this.planDetails.offGridActivities.splice(index, 1);
        this.isPlanEdited = true;
        this.getActivitylist();
        setTimeout( () => this.setFocusToInputElement(index - 1), 10);
      } else {
        setTimeout( () => this.setFocusToInputElement(index), 10);
      }
      document.body.classList.remove('pr-modal-open');
    });

  }

  getStaffCOunt(objOffGridActivities: OffGridActivities) {
    let sum = 0;
    for (const vardepart of objOffGridActivities.variableDepartmentList) {
      sum = (sum * 1) + (vardepart.staffCount * 1);
    }
    return Number(sum * 1);
  }

  getTotalHours(objOffGridActivities: OffGridActivities) {
    let sum = 0;
    for (const vardepart of objOffGridActivities.variableDepartmentList) {
      sum = (sum * 1) + (vardepart.staffCount * 1);
    }
    return sum * objOffGridActivities.shiftHours;

  }

  clear(index: number) {
    if(this.planDetails.planCompleted){
        return;
    }
    let offGridName = this.Listoffgridactivity[index].name;
    this.Listoffgridactivity[index].name = '';
    this.Listoffgridactivity[index].code = '';
    offGridName&&offGridName.length>0?this.isPlanEdited = true:this.isPlanEdited = false;
  }

  private setFocusToInputElement(lastIndex: number) {

    try {
      const element = this.renderer.selectRootElement('#census-' + lastIndex);
      setTimeout(() => element.focus(), 0);
    } catch (error) {
      console.error(error);
    }
  }
}
