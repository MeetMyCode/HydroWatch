import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WebSocketService } from './services/web-socket.service';
import { DatabaseControllerService } from './services/database-controller.service';
import { GetDatePickerService } from "./services/get-chart-date-service.service";
import { HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DatePickerComponent } from './date-picker/date-picker.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from './login/login.component';




@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    DatePickerComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FontAwesomeModule,
    NgbModule,
    ReactiveFormsModule
  ],
  providers: [WebSocketService,DatabaseControllerService, GetDatePickerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
