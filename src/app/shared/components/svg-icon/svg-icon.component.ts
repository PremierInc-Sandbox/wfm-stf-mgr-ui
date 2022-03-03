import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'app-svg-icon',
  templateUrl: './svg-icon.component.html',
  styleUrls: ['./svg-icon.component.scss']
})
export class SvgIconComponent implements OnInit {

  @Input() name:string;
  @Input() color:string;
  @Input() size:string;

  constructor() { }

  ngOnInit(): void {
  }

}
