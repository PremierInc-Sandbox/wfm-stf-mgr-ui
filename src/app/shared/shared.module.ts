import {ModuleWithProviders, NgModule} from '@angular/core';
import {AppRoutingModule} from '../app-routing.module';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {PromptDialogComponent} from './components/prompt-dialog/prompt-dialog.component';
import {PromptDialogSaveComponent} from './components/prompt-dialog-save/prompt-dialog-save.component';
import {HeaderComponent} from '../shared/components/header/header.component';
import {FooterComponent} from '../shared/components/footer/footer.component';
import {MinDirective} from './range-validators/min-directive';
import {MaxDirective} from './range-validators/max-directive';
import {SidenavComponent} from '../shared/components/sidenav/sidenav.component';
import {InternalServerComponent} from './components/error-pages/internal-server/internal-server.component';
import {LoaderComponent} from './components/loader/loader.component';
import {NotFoundComponent} from './components/error-pages/not-found/not-found.component';
import {MatPaginatorModule} from '@angular/material/paginator';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {BrowserModule} from '@angular/platform-browser';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {AutofocusModule} from './components/autofocus/autofocus.module';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';

import {CorpService} from './service/corp-service';
import {EntityService} from './service/entity-service';
import {DepartmentService} from './service/department-service';
import {ScheduleService} from './service/schedule-service';
import {PlanService} from './service/plan-service';
import {ErrorHandlerService} from './service/error-handler-service';
import {NoAccessComponent} from "./components/error-pages/no-access/not-found.component";
import {Util} from "./util/util";
import { SvgIconComponent } from './components/svg-icon/svg-icon.component';

// Put shared services here
export const providers = [
  CorpService,
  EntityService,
  EntityService,
  DepartmentService,
  ScheduleService,
  PlanService,
  ErrorHandlerService,
  Util
];



const MaterialComponents = [

  BrowserAnimationsModule,
  MatToolbarModule,
  NoopAnimationsModule,
  AppRoutingModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatGridListModule,
  MatInputModule,
  MatNativeDateModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSnackBarModule,
  MatTableModule,
  MatTooltipModule,
  MatSlideToggleModule,
  MatIconModule,
  MatAutocompleteModule
];

@NgModule({
  imports: [MaterialComponents, AutofocusModule, NgxMaterialTimepickerModule ],
  exports: [MaterialComponents, HeaderComponent,
    FooterComponent,
    InternalServerComponent,
    NotFoundComponent,
    LoaderComponent,
    MinDirective,
    MaxDirective,
    SidenavComponent, AutofocusModule , NgxMaterialTimepickerModule, MatPaginatorModule , FormsModule, ReactiveFormsModule , RouterModule,
    BrowserModule,SvgIconComponent],
    providers: [],
  entryComponents: [
    PromptDialogComponent,
    PromptDialogSaveComponent
  ],
  declarations: [
    PromptDialogComponent,
    PromptDialogSaveComponent,
    HeaderComponent,
    FooterComponent,
    SidenavComponent,
    MinDirective,
    MaxDirective,
    InternalServerComponent,
    NotFoundComponent,
    NoAccessComponent,
    LoaderComponent,
    SvgIconComponent
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [...providers]
    };
  }
}
