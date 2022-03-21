import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LoginRegisterService } from 'src/app/services/login-register.service';
import { SignupErrorDialogComponent } from '../signup/signup.component';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(
    private fb: FormBuilder,
    private login_register: LoginRegisterService,
    private auth: AngularFireAuth,
    private router: Router,
    public dialog: MatDialog
  ) {}

  emailPattern: string = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  errMessage: string = '';

  myForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async login() {
    const { email, password } = this.myForm.value;
    try {
      const user = await this.login_register.login(email, password);
      if (user && user.user?.emailVerified) {
        this.router.navigateByUrl('/home');
      } else if (user) {
        this.router.navigateByUrl('/auth/verification');
      }
    } catch (error: any) {
      this.errMessage = error.message;
      this.dialog.open(SignupErrorDialogComponent, {
        data: {
          errMessage: this.errMessage
        }
      });
    }
  }

  async googleSignIn() {
    try {
      const user = await this.auth.signInWithPopup(
        new firebase.auth.GoogleAuthProvider()
      );
      //Check if the user is already registered in the database
      if (user.additionalUserInfo?.isNewUser) {
        await this.login_register.googleSignInRegister(user);
      }
      if (user && user.user?.emailVerified) {
        this.router.navigateByUrl('/home');
      }
    } catch (error: any) {
      this.errMessage = error.message;
      this.dialog.open(SignupErrorDialogComponent, {
        data: {
          errMessage: this.errMessage
        }
      });
    }
  }
}
