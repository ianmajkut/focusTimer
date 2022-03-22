import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { isThisTypeNode } from 'typescript';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(
    private firestore: AngularFirestore,
    public auth: AngularFireAuth,
    private toastr: ToastrService
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

  async deleteTask(taskId: string, uidUser: string, currentLang: string) {
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
    if (currentLang === 'en-US') {
      this.toastr.error('You have deleted a task!', 'Alert', {
        timeOut: 5000,
        extendedTimeOut: 3000,
        disableTimeOut: false,
        closeButton: true,
        positionClass: 'toast-top-center',
        progressBar: true,
        progressAnimation: 'decreasing'
      });
    }
    if (currentLang === 'es') {
      this.toastr.error('Has eliminado una tarea!', 'Alerta', {
        timeOut: 5000,
        extendedTimeOut: 3000,
        disableTimeOut: false,
        closeButton: true,
        positionClass: 'toast-top-center',
        progressBar: true,
        progressAnimation: 'decreasing'
      });
    }
  }
}
