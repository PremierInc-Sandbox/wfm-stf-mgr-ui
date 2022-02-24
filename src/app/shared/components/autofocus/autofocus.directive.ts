import {AfterContentChecked, AfterViewChecked, AfterViewInit, Directive, ElementRef, OnInit} from '@angular/core';
import {Util} from "../../util/util";


@Directive({
  selector: '[appAutofocus]'
})
export class AutofocusDirective implements AfterViewInit {

  constructor(private element: ElementRef) {
  }



  ngAfterViewInit(): void {
    if (!Util.isNullOrUndefined(this.element) &&
      (this.element.nativeElement.id === 'census-0'|| this.element.nativeElement.id === 'grid-000')) {
      setTimeout(() => this.element.nativeElement.focus(),5);
    }
  }

}
