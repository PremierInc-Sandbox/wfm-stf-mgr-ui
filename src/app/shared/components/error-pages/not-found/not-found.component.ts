import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {
  public errorMessage = '400 Not Found, Please enter plan name.';

  constructor() {
  }

  ngOnInit() {
  }

}
