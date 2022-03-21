import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(
    private firestore: AngularFirestore,
    public auth: AngularFireAuth
  ) {}
}
