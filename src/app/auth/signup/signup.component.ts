import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginRegisterService } from 'src/app/services/login-register.service';
import { Router } from '@angular/router';

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
export class SignupComponent {
  constructor(
    private fb: FormBuilder,
    private login_register: LoginRegisterService,
    private router: Router
  ) {}

  emailPattern: string = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';

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
    const { fullname, email, username } = this.myForm.value;
    const user: User = { fullname, email, username };

    this.login_register.register(user, this.myForm.value.password).then(() => {
      this.myForm.reset();
      this.router.navigateByUrl('/auth/verification');
    });
  }
}
