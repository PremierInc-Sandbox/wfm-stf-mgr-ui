import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PlanService} from '../../../../shared/service/plan-service';
import {JobCategory} from '../../../../shared/domain/job-category';
import {PlanDetails} from '../../../../shared/domain/plan-details';
import {VariableDepartmentPosition, CustomError} from '../../../../shared/domain/var-pos';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {PromptDialogComponent} from '../../../../shared/components/prompt-dialog/prompt-dialog.component';
import {AlertBox} from '../../../../shared/domain/alert-box';

@Component({
  selector: 'app-variable-pos',
  templateUrl: './variable-pos.component.html',
  styleUrls: ['./variable-pos.component.scss']
})

export class VariablePosComponent implements OnInit {
  staffArray = [0];
  newIndex = 0;
  isShowDelete: boolean;
  showError: boolean;
  isMaxIndex: boolean;
  desc: string [] = [''];
  abbrv: string [] = [''];
  error: CustomError = new CustomError();
  @Input('plan') plan: PlanDetails = new PlanDetails();
  @Output() categpryChange = new EventEmitter();
  @Output() abbreviationChange = new EventEmitter();
  @Output() descriptionChange = new EventEmitter();
  @Output() includeFlag = new EventEmitter();
  @Input('isSaveNextBtnSubmit') isSaveNextBtnSubmit: boolean;
  @Input('showVariable') showVariable: boolean;
  @Input('isSaveBtn') isSaveBtn: boolean;
  @Input('isSaveExitBtnSubmit') isSaveExitBtnSubmit: boolean;
  strVariablePosition: string;
  alertBox: AlertBox;

  constructor(private planService: PlanService, private dialog: MatDialog) {
    this.plan = new PlanDetails();
    this.isSaveNextBtnSubmit = false;
    this.alertBox = new AlertBox(this.dialog);
  }

  jobCatgData: JobCategory[];

  ngOnInit() {
    this.loadJobCategory();
    this.checkDup();
    this.strVariablePosition = JSON.stringify(this.plan.variableDepartmentPositions);
    if (this.plan.variableDepartmentPositions[0].categoryAbbreviation === '') {
      this.plan.variableDepartmentPositions[0].includedInNursingHoursFlag = false;
    }
  }

  loadJobCategory(): void {
    this.planService.getJobCategoryData().subscribe(data => {
      this.jobCatgData = data;
    });
  }

  checkDup(){
    this.plan.variableDepartmentPositions.forEach(element => {
      if(this.plan.variableDepartmentPositions.filter(ele => ele.categoryKey === element.categoryKey && ele.categoryDescription.toUpperCase() === element.categoryDescription.toUpperCase()).length > 1)
        this.error = {
          isError: true,
          errorMessage: 'Duplicate description exists.'
        };
        else{
          this.error =new CustomError();
        }
      this.isMaxIndex = true;
    });
  }

  newStaff(varPos: VariableDepartmentPosition): void {

    let isDuplicateDescription:Boolean;
    this.plan.variableDepartmentPositions.forEach(element => {
      if(this.plan.variableDepartmentPositions.filter(ele =>ele.categoryKey === element.categoryKey && ele.categoryDescription === element.categoryDescription).length > 1)
      isDuplicateDescription=true;
    });

    this.isShowDelete = true;
    if (this.plan.variableDepartmentPositions.length === 8) {
      this.error = {
        isError: true,
        errorMessage: 'User is unable to add new position unless they delete an existing one.'
      };
      this.isMaxIndex = true;
    }
    else if(isDuplicateDescription)
    {
      this.error = {
        isError: true,
        errorMessage: 'Duplicate description exists.'
      };
      this.isMaxIndex = true;
    } else {
      const objvarpos: VariableDepartmentPosition = new VariableDepartmentPosition();
      objvarpos.includedInNursingHoursFlag = false;
      if (varPos.categoryKey != null) {
        this.showError = false;
        this.plan.variableDepartmentPositions.push(objvarpos);
      } else {
        this.showError = true;
      }
    }
    this.strVariablePosition = JSON.stringify(this.plan.variableDepartmentPositions);
  }

  validateVariable(): void {
    this.plan.variableDepartmentPositions.forEach(staff => {
      if (staff.categoryAbbreviation === '' || staff.categoryAbbreviation === null || staff.categoryAbbreviation === undefined) {
        this.isSaveNextBtnSubmit = true;
        return true;
      } else {
        this.isSaveNextBtnSubmit = false;
        return false;
      }
    });

  }

  deleteRow(staff: VariableDepartmentPosition): void {
    this.alertBox.deleteRow(this.plan, 1);
    const dialogRef = this.alertBox.openAlertWithReturn('exit-dialog', this.alertBox.height, this.alertBox.width,
      'Plan SetUp - Variable Position', this.alertBox.alertMessage);
    document.body.classList.add('pr-modal-open');

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index: number = this.plan.variableDepartmentPositions.indexOf(staff);

        if (index !== -1) {
          this.plan.variableDepartmentPositions.splice(index, 1);
          this.isMaxIndex = false;
        }
      }
      document.body.classList.remove('pr-modal-open');
    });
  }


  clearFields(varPos: VariableDepartmentPosition): void {
    varPos.categoryKey = -1;
    varPos.categoryAbbreviation = 'Abbreviation';
    varPos.categoryDescription = 'Description';
  }

  checkDuplicate(selection,staff: VariableDepartmentPosition)
  {
    this.isSaveNextBtnSubmit = false;
    this.showError = false;
    if (this.plan.variableDepartmentPositions.filter(ele => ele.categoryKey === staff.categoryKey && ele.categoryDescription.toString().toUpperCase() === staff.categoryDescription.toString().toUpperCase()).length > 1) {
      this.error = {
        isError: true,
        errorMessage: 'The description already exists.'
      };
      this.isMaxIndex = true;
    }
    else{
      this.error=new CustomError();
    }


  }
  changeCategory(selection, index, staff: VariableDepartmentPosition): void {
    this.isSaveNextBtnSubmit = false;
    this.showError = false;
      const objjob: JobCategory = this.jobCatgData.filter(dat => dat.key.toString() === selection.target.value.toString())[0];
      staff.categoryKey = objjob.key;
      staff.categoryAbbreviation = objjob.abbreviation;
      staff.categoryDescription = objjob.description;
    this.strVariablePosition = JSON.stringify(this.plan.variableDepartmentPositions);

      if(this.plan.variableDepartmentPositions.filter(ele => ele.categoryKey === objjob.key && ele.categoryDescription.toUpperCase() === objjob.description.toUpperCase()).length > 1)
      {
        this.error = {
          isError: true,
          errorMessage: 'Duplicate description exists.'
        };
        this.isMaxIndex = true;
      }
      else{
          this.error =new CustomError();}

}
}
