import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { MainComponent } from './main/main.component';
import { LoginComponent } from './login/login.component';
import { SigninComponent } from './signin/signin.component';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
// Import ng-circle-progress
import { NgCircleProgressModule } from 'ng-circle-progress';
import { NgParticlesModule } from 'ng-particles';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TaskCardComponent } from './components/task-card/task-card.component';

@NgModule({
  declarations: [
    MainComponent,
    LoginComponent,
    SigninComponent,
    TaskCardComponent
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 60,
      space: -10,
      outerStrokeGradient: true,
      outerStrokeWidth: 10,
      outerStrokeColor: '#4882c2',
      outerStrokeGradientStopColor: '#53a9ff',
      innerStrokeColor: '#e7e8ea',
      innerStrokeWidth: 10,
      title: 'UI',
      animateTitle: false,
      animationDuration: 1000,
      showUnits: false,
      showBackground: false,
      clockwise: false,
      startFromZero: false,
      titleFontSize: '10'
    }),
    NgParticlesModule
  ]
})
export class PagesModule {}
