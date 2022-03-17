import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AbstractControl } from '@angular/forms';
import { debounceTime, map, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginRegisterService {
  constructor(
    private firestore: AngularFirestore,
    public auth: AngularFireAuth
  ) {}

  // Async validator to check if the username is available or not with a debounce time of 500ms
  checkUser(control: AbstractControl) {
    const username: string = control.value;
    return this.firestore
      .collection('users', (ref) => ref.where('username', '==', username))
      .valueChanges()
      .pipe(
        debounceTime(500),
        take(1),
        map((arr) => (arr.length ? { usernameNoAvailable: true } : null))
      );
  }
}
