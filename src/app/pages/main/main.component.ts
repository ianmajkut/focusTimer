import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

interface Task {
  taskName: string;
  workingTime: number;
  restTime: number;
  description?: string;
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  //Spinner
  color: ThemePalette = 'warn';
  mode: ProgressSpinnerMode = 'determinate';
  value = 0;

  tasks: Task[] = [];

  myForm: FormGroup = this.formBuilder.group({
    taskName: [, [Validators.required]],
    workingTime: [, [Validators.required, Validators.min(1)]],
    restTime: [, [Validators.required, Validators.min(1)]],
    description: [,]
  });

  constructor(private formBuilder: FormBuilder) {}

  saveTask() {
    this.tasks.push(this.myForm.value);
    this.myForm.reset();
    console.log(this.tasks);
  }
}
