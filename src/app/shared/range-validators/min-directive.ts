import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, Validator, ValidatorFn, Validators} from '@angular/forms';

@Directive({
  selector: '[min][formControlName],[min][formControl],[min][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: MinDirective,
      multi: true
    }
  ]
})

export class MinDirective implements Validator {
  private _validator: ValidatorFn;

  @Input()
  public set min(value: string) {
    this._validator = Validators.min(parseInt(value, 10));
  }

  public validate(control: AbstractControl): { [key: string]: any } {
    return this._validator(control);
  }
}
