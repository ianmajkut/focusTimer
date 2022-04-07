import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { LoginRegisterService } from 'src/app/services/login-register.service';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.css']
})
export class VerificationComponent implements OnInit {
  constructor(
    private login_register: LoginRegisterService,
    private auth: AngularFireAuth,
    private router: Router,
    private spinner: NgxSpinnerService,
    private translateService: TranslateService,
    private activeRoute: ActivatedRoute
  ) {
    //Obtain the language from the url
    this.lang = this.activeRoute.snapshot.params['lang'];
    this.translateService.use(this.lang);
  }

  public user: Observable<any> = this.auth.user;
  isEmailVerified!: boolean | undefined;
  lang!: string;

  //Check if user is verified to prevent sending verification email again
  ngOnInit(): void {
    this.spinner.show();
    this.auth.authState.subscribe((user) => {
      this.isEmailVerified = user?.emailVerified;
      this.spinner.hide();
    });
  }

  goLogin() {
    this.router.navigateByUrl(`/auth/login/${this.lang}`);
  }
}
