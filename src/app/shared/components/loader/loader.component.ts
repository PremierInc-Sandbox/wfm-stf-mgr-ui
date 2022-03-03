import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {Subscription} from 'rxjs';
import {LoaderService} from '../../service/loader.service';
import {LoaderState} from '../../domain/loaderstate';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit, OnDestroy {
  show = false;

  @Input() value = 100;
  @Input() diameter = 100;
  @Input() mode = 'indeterminate';
  @Input() strokeWidth = 10;
  @Input() overlay = false;
  @Input() color = 'primary';

  private subscription: Subscription;

  constructor(private loaderService: LoaderService) {
  }

  ngOnInit() {
    this.subscription = this.loaderService.loaderState
      .subscribe((state: LoaderState) => {
         this.show = state.show;
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
