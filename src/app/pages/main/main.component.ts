import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { TimerService } from 'src/app/services/timer.service';
import { interval, timer } from 'rxjs';
import { take } from 'rxjs/operators';

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
  value = 100;

  tasks: Task[] = [];

  //Timer
  timerInterval = interval(1000);
  currentWorkingTime: number = 0;
  currentRestingTime: number = 0;

  myForm: FormGroup = this.formBuilder.group({
    taskName: [, [Validators.required]],
    workingTime: [, [Validators.required, Validators.min(1)]],
    restTime: [, [Validators.required, Validators.min(1)]],
    description: [,]
  });

  constructor(
    private formBuilder: FormBuilder,
    private timerService: TimerService
  ) {}

  saveTask() {
    const { workingTime, restTime } = this.myForm.value;
    this.tasks.push(this.myForm.value);
    this.myForm.reset();
    //console.log(this.myForm.value);
    // console.log(this.tasks);
    // this.timerService.workingTimer(workingTime);
    this.workingTimer(workingTime);
    //this.timerService.restTimer(restTime);
  }

  workingTimer(workTime: number) {
    const timeWork = workTime;
    const countDownWork = this.timerInterval.pipe(take(timeWork));
    return countDownWork.subscribe((val) => {
      this.currentWorkingTime = timeWork - (val + 1);
      this.value = (this.currentWorkingTime * 100) / timeWork;
      console.log(`Work timing ${this.currentWorkingTime}`);
      if (this.currentWorkingTime == 0) {
        console.log('Time is UP');
      }
    });
  }
}
