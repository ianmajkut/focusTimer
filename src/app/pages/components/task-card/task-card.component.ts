import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.css']
})
export class TaskCardComponent {
  @Input() taskInput!: any;
  @Input() indexTask!: number;
  constructor() {}

  eliminateTask() {
    console.log(this.indexTask);
  }
}
