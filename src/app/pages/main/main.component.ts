import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { interval, Observable, Subscription, timer } from 'rxjs';
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
  // color: ThemePalette = 'warn';
  // mode: ProgressSpinnerMode = 'determinate';
  // value = 100;

  //Circle Spinner
  percent!: number;
  title = 'Start a task';
  subtitle = '';
  //Colors Circle
  outerStrokeColor!: string;
  outerStrokeGradientStopColor!: string;

  creationOfTask: boolean = true;
  pausedState: boolean = false;
  resumeTask: boolean = false;
  tasks: Task[] = [];

  //Timer
  timerInterval = interval(1000);
  currentWorkingTime: number = 0;
  currentRestingTime: number = 0;
  showingTime!: number;
  workingTimeForSpinner!: number;
  restingTimeForSpinner!: number;
  showPlayButton: boolean = true;
  showPauseButton: boolean = false;
  showStopButton: boolean = false;
  roundsBlocks!: number;
  workingSubs!: Subscription;
  restingSubs!: Subscription;

  typeOfBlock!: string;

  myForm: FormGroup = this.formBuilder.group({
    taskName: [, [Validators.required]],
    workingTime: [, [Validators.required, Validators.min(0.5)]],
    amountBlocks: [, [Validators.required, Validators.min(2)]],
    restTime: [, [Validators.required, Validators.min(0.5)]],
    description: [,]
  });

  constructor(private formBuilder: FormBuilder) {}

  //TODO make the value of the progress spinner doesn't change when the timer is paused
  play() {
    if (this.creationOfTask) {
      this.creationOfTask = false;
      const { workingTime, amountBlocks } = this.myForm.value;
      this.workingTimeForSpinner = workingTime;
      this.roundsBlocks = amountBlocks;
      //this.tasks.push(this.myForm.value);
      this.showPauseButton = true;
      this.showStopButton = true;
      //console.log(this.myForm.value);
      // console.log(this.tasks);
      this.workingTimer(this.workingTimeForSpinner * 60, this.roundsBlocks);
    }
    if (this.pausedState) {
      this.pausedState = false;
      this.resumeTask = true;
      this.workingTimer(this.showingTime, this.roundsBlocks);
    }
  }

  pauseTask() {
    this.workingSubs.unsubscribe();
    this.pausedState = true;
  }

  workingTimer(workTime: number, rounds: number) {
    this.outerStrokeColor = '#4882c2';
    this.outerStrokeGradientStopColor = '#53a9ff';
    if (rounds > 0) {
      this.typeOfBlock = 'Working Time Countdown:';
      //Cicle
      this.title = 'Working Countdown:';
      --rounds;
      //rounds = this.roundsBlocks;
      // this.color = 'warn';
      const timeWork = workTime;
      this.workingSubs = this.timerInterval
        .pipe(take(timeWork))
        .subscribe((val) => {
          this.currentWorkingTime = timeWork - (val + 1);
          //Progress Spinner value
          this.showingTime = this.currentWorkingTime;
          // this.value = (this.currentWorkingTime * 100) / timeWork;
          //Circle
          this.subtitle = this.currentWorkingTime.toString();
          this.percent = (this.currentWorkingTime * 100) / timeWork;
          console.log(this.percent);
          //console.log(`Work timing ${this.currentWorkingTime} sec`);
          if (this.currentWorkingTime == 0) {
            const { restTime } = this.myForm.value;
            this.restingTimeForSpinner = restTime;
            this.restTimer(this.restingTimeForSpinner * 60, rounds);
          }
        });
      return this.workingSubs;
    }
    //Spinner
    this.typeOfBlock = '';
    this.showingTime = 0;
    this.creationOfTask = true;
    //Circle
    this.title = 'Start a task';
    this.subtitle = '';
    return;
  }

  restTimer(restTime: number, rounds: number) {
    this.outerStrokeColor = '#e63946';
    this.outerStrokeGradientStopColor = '#e63946';
    if (rounds > 0) {
      this.typeOfBlock = 'Resting Time Countdown:';
      // this.color = 'primary';
      //Circle
      this.title = 'Resting Countdown:';

      const timeRest = restTime;
      this.restingSubs = this.timerInterval
        .pipe(take(timeRest))
        .subscribe((val) => {
          this.currentRestingTime = timeRest - (val + 1);
          //Progress Spinner value
          // this.value = (this.currentRestingTime * 100) / timeRest;
          this.showingTime = this.currentRestingTime;
          //Circle
          this.subtitle = this.currentRestingTime.toString();
          this.percent = (this.currentRestingTime * 100) / timeRest;
          //console.log(`Rest timing ${this.currentRestingTime} sec`);
          if (this.currentRestingTime == 0) {
            this.workingTimer(this.workingTimeForSpinner * 60, rounds);
          }
        });
      return this.restingSubs;
    }
    this.typeOfBlock = '';
    this.showingTime = 0;
    //Circle
    this.title = 'Start a task';
    this.subtitle = '';
    return;
  }
}
