import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
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
    private router: Router
  ) {}

  public user: Observable<any> = this.auth.user;
  isEmailVerified!: boolean | undefined;

  //Check if user is verified to prevent sending verification email again
  ngOnInit(): void {
    this.auth.authState.subscribe((user) => {
      this.isEmailVerified = user?.emailVerified;
    });
  }

  goLogin() {
    this.router.navigateByUrl('/auth/login');
  }
}
