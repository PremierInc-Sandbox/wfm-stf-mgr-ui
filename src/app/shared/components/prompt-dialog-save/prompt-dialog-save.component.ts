import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Util} from "../../util/util";

@Component({
  selector: 'app-prompt-dialog-save',
  templateUrl: './prompt-dialog-save.component.html',
  styleUrls: ['./prompt-dialog-save.component.scss']
})
export class PromptDialogSaveComponent implements OnInit {

  alertMessgae = '';
  headerText = '';
  confirmWinodw = false;

  constructor(public dialogRef: MatDialogRef<PromptDialogSaveComponent>, @Inject(MAT_DIALOG_DATA) data) {
    this.alertMessgae = data.alertMessgae;
    this.confirmWinodw = data.confirmWinodw;
    this.headerText = data.headerText;
  }

  ngOnInit() {
  }

  toggleModalHide(): void {
    this.dialogRef.close();
  }
  isAlertMessageExist(): boolean {
    if (!Util.isNullOrUndefined(this.alertMessgae)) {
      if (this.alertMessgae.length > 0 && this.alertMessgae !== '') {
      return true;
      } else {
      return false;
      }
    } else {
    return false;
    }

  }
}
