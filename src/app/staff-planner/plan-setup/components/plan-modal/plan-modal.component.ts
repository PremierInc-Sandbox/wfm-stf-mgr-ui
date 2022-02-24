import {Component, OnInit} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-plan-modal',
  templateUrl: './plan-modal.component.html',
  styleUrls: ['./plan-modal.component.scss']
})
export class PlanModalComponent implements OnInit {
  constructor(public  dialogRef: MatDialogRef<PlanModalComponent>) {
  }

  toggleModalHide() {
    document.body.classList.remove('pr-modal-open');
    this.dialogRef.close();
  }

  ngOnInit() {
  }

}
