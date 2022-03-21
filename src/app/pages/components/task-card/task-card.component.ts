import { Component, Input } from '@angular/core';
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
  constructor(private taskService: TaskService) {}

  eliminateTask() {
    this.taskService.deleteTask(this.taskInput.id, this.uidUser);
  }
}
