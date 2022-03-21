import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import {
  SignupComponent,
  SignupErrorDialogComponent
} from './signup/signup.component';
import { AuthComponent } from './auth/auth.component';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { VerificationComponent } from './verification/verification.component';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [
    LoginComponent,
    AuthComponent,
    SignupComponent,
    VerificationComponent,
    SignupErrorDialogComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    NgxSpinnerModule
  ]
})
export class AuthModule {}
