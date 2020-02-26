import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WebSocketService } from './web-socket.service';
import { DatabaseControllerService } from './database-controller.service';
import { TestComponent } from './test-component/test-component.component';
import { TempComponent } from './temp/temp.component';
import { HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    TestComponent,
    TempComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FontAwesomeModule
  ],
  providers: [WebSocketService,DatabaseControllerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
