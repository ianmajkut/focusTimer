import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginRegisterService } from 'src/app/services/login-register.service';
import { SignupErrorDialogComponent } from '../signup/signup.component';
import firebase from 'firebase/compat/app';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private login_register: LoginRegisterService,
    private auth: AngularFireAuth,
    private router: Router,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private activeRoute: ActivatedRoute,
    private translateService: TranslateService
  ) {
    this.lang = this.activeRoute.snapshot.params['lang'];
    this.translateService.use(this.lang);
  }

  ngOnInit() {
    this.spinner.show();

    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }

  emailPattern: string = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  errMessage: string = '';

  lang!: string;

  myForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async login() {
    this.spinner.show();
    const { email, password } = this.myForm.value;
    try {
      const user = await this.login_register.login(email, password);
      if (user && user.user?.emailVerified) {
        this.spinner.hide();
        this.router.navigateByUrl('/home/');
      } else if (user) {
        this.spinner.hide();
        this.router.navigateByUrl(`/auth/verification/${this.lang}`);
      }
    } catch (error: any) {
      this.spinner.hide();
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
      this.spinner.show();
      const user = await this.auth.signInWithPopup(
        new firebase.auth.GoogleAuthProvider()
      );
      //Check if the user is already registered in the database
      if (user.additionalUserInfo?.isNewUser) {
        await this.login_register.googleSignInRegister(user);
      }
      if (user && user.user?.emailVerified) {
        this.spinner.hide();
        this.router.navigateByUrl('/home');
      }
    } catch (error: any) {
      this.spinner.hide();
      this.errMessage = error.message;
      this.dialog.open(SignupErrorDialogComponent, {
        data: {
          errMessage: this.errMessage
        }
      });
    }
  }
}
