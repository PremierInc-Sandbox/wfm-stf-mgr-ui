import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface PromptDialogData {
  alertMessgae: string;
  confirmWinodw: any;
  headerText: string;
}

@Component({
  selector: 'app-prompt-dialog',
  templateUrl: './prompt-dialog.component.html',
  styleUrls: ['./prompt-dialog.component.scss']
})
export class PromptDialogComponent implements OnInit {
  alertMessgae = '';
  headerText = '';
  confirmWinodw = false;

  constructor(public dialogRef: MatDialogRef<PromptDialogComponent>, @Inject(MAT_DIALOG_DATA) data) {
    this.alertMessgae = data.alertMessgae;
    this.confirmWinodw = data.confirmWinodw;
    this.headerText = data.headerText;
  }

  ngOnInit() {
  }

  toggleModalHide() {
    this.dialogRef.close();
  }

}
