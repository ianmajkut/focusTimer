import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginRegisterService } from 'src/app/services/login-register.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';

export interface User {
  fullname: string;
  email: string;
  username: string;
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private login_register: LoginRegisterService,
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
    fullname: ['', [Validators.required, Validators.minLength(5)]],
    email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
    username: [
      '',
      [Validators.required, Validators.minLength(6)],
      [this.login_register.checkUser.bind(this.login_register)]
    ],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  //Getter to access the username field and check the status
  get username() {
    return this.myForm.get('username');
  }

  signup() {
    this.spinner.show();
    const { fullname, email, username } = this.myForm.value;
    const user: User = { fullname, email, username };

    this.login_register.register(user, this.myForm.value.password).then(
      () => {
        this.myForm.reset();
        this.spinner.hide();
        this.router.navigateByUrl(`/auth/verification/${this.lang}`);
      },
      (error) => {
        this.spinner.hide();
        this.errMessage = error.message;
        this.dialog.open(SignupErrorDialogComponent, {
          data: {
            errMessage: this.errMessage
          }
        });
      }
    );
  }
}

@Component({
  selector: 'app-signup-error-dialog',
  template: `
    <h1 mat-dialog-title>Error</h1>
    <div mat-dialog-content>
      {{ data.errMessage }}
    </div>
    <div mat-dialog-actions>
      <button mat-flat-button mat-dialog-close color="warn">Close</button>
    </div>
  `
})
export class SignupErrorDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { errMessage: string }) {}
}
