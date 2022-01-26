import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { MainComponent } from './main/main.component';
import { LoginComponent } from './login/login.component';
import { SigninComponent } from './signin/signin.component';

@NgModule({
  declarations: [MainComponent, LoginComponent, SigninComponent],
  imports: [CommonModule, PagesRoutingModule]
})
export class PagesModule {}
