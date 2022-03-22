import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.css']
})
export class TaskCardComponent {
  @Input() taskInput!: any;
  @Input() indexTask!: number;
  @Input() uidUser!: string;
  @Input() currentLang!: string;
  //Output that send the id of the task to main.component.ts
  @Output() repeatTaskEvent = new EventEmitter<string>();
  constructor(private taskService: TaskService) {}

  eliminateTask() {
    this.taskService.deleteTask(
      this.taskInput.id,
      this.uidUser,
      this.currentLang
    );
  }

  repeatTask() {
    //Emit the output
    this.repeatTaskEvent.emit(this.taskInput.id);
  }
}
