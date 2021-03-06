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

  async register(user: any, password: string) {
    try {
      //Take the mail and password of the user and create a new user in firebase
      await this.auth.createUserWithEmailAndPassword(user.email, password);

      let tempId = this.firestore.createId();
      //Call method sendVerificationEmail() to send a verification email to the user
      await this.sendVerificationEmail();
      //Take the user and add it to the database collection 'users'
      return await this.firestore.collection('users').doc(tempId).set({
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        uid: tempId
      });
    } catch (error) {
      throw error;
    }
  }
  //Method to send a verification email to the user
  async sendVerificationEmail() {
    try {
      return await (await this.auth.currentUser)?.sendEmailVerification();
    } catch (error) {
      throw error;
    }
  }
  //Method to login with email and password
  async login(email: string, password: string) {
    try {
      return await this.auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      throw error;
    }
  }

  //Method to create a new user in firestore with google
  async googleSignInRegister(user: any) {
    try {
      return await this.firestore.collection('users').doc(user.user?.uid).set({
        fullname: user.user?.displayName,
        email: user.user?.email,
        uid: user.user?.uid
      });
    } catch (error) {
      throw error;
    }
  }
}
