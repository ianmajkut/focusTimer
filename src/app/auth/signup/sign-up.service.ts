import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class SignUpService {
  constructor() {}

  checkUsername(control: AbstractControl) {}
}
