import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(
    private firestore: AngularFirestore,
    public auth: AngularFireAuth
  ) {}

  async saveTaskFirestore(task: any, userId: string) {
    let tempId = this.firestore.createId();
    await this.firestore
      .collection('tasks')
      .doc(userId)
      .collection('tasksCompletedFromThisUser')
      .doc(tempId)
      .set({
        amountBlocks: task.amountBlocks,
        description: task.description,
        restTime: task.restTime,
        taskName: task.taskName,
        workingTime: task.workingTime,
        id: tempId
      });
  }

  async deleteTask(taskId: string, uidUser: string) {
    await this.firestore
      .collection('tasks')
      .doc(uidUser)
      .collection('tasksCompletedFromThisUser', (ref) =>
        ref.where('id', '==', taskId)
      )
      .get()
      .subscribe((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          doc.ref.delete();
        });
      });
  }
}
