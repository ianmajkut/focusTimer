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

  async saveTaskFirestore(task: any, userId: string) {
    await this.firestore
      .collection('tasks')
      .doc(userId)
      .collection('tasksCompletedFromThisUser')
      .add(task);
  }
}
