import { AfterViewInit, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { interval, Observable, Subscription, timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { Task } from '../../interfaces/interface';
import { ISourceOptions } from 'tsparticles';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements AfterViewInit {
  confettiHide: boolean = true;

  //Stle for Conffeti
  options: ISourceOptions = {
    particles: {
      number: {
        value: 0
      },
      color: {
        value: ['#00FFFC', '#FC00FF', '#fffc00']
      },
      shape: {
        type: ['circle', 'square', 'triangle', 'polygon'],
        options: {
          polygon: [
            {
              sides: 5
            },
            {
              sides: 6
            }
          ]
        }
      },
      opacity: {
        value: 1,
        animation: {
          enable: true,
          minimumValue: 0,
          speed: 2,
          startValue: 'max',
          destroy: 'min'
        }
      },
      size: {
        value: 4,
        random: {
          enable: true,
          minimumValue: 2
        }
      },
      links: {
        enable: false
      },
      life: {
        duration: {
          sync: true,
          value: 5
        },
        count: 1
      },
      move: {
        enable: true,
        gravity: {
          enable: true,
          acceleration: 10
        },
        speed: {
          min: 10,
          max: 20
        },
        decay: 0.1,
        direction: 'none',
        straight: false,
        outModes: {
          default: 'destroy',
          top: 'none'
        }
      },
      rotate: {
        value: {
          min: 0,
          max: 360
        },
        direction: 'random',
        animation: {
          enable: true,
          speed: 60
        }
      },
      tilt: {
        direction: 'random',
        enable: true,
        value: {
          min: 0,
          max: 360
        },
        animation: {
          enable: true,
          speed: 60
        }
      },
      roll: {
        darken: {
          enable: true,
          value: 25
        },
        enable: true,
        speed: {
          min: 15,
          max: 25
        }
      },
      wobble: {
        distance: 30,
        enable: true,
        speed: {
          min: -15,
          max: 15
        }
      }
    },
    emitters: {
      life: {
        count: 0,
        duration: 0.1,
        delay: 0.4
      },
      rate: {
        delay: 0.1,
        quantity: 150
      },
      size: {
        width: 0,
        height: 0
      }
    }
  };

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
  completedTasks: Task[] = [];

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
    taskName: ['a', [Validators.required]],
    workingTime: ['0.1', [Validators.required]],
    amountBlocks: ['2', [Validators.required, Validators.min(2)]],
    restTime: ['0.1', [Validators.required]],
    description: [,]
  });

  //Auth
  public isLogged!: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private auth: AngularFireAuth
  ) {
    this.completedTasks =
      JSON.parse(localStorage.getItem('completedTasks')!) || [];
  }

  ngAfterViewInit(): void {
    this.getUserState();
  }

  async getUserState() {
    await this.auth.authState.subscribe((user) => {
      if (user?.email) {
        this.isLogged = true;
      } else {
        this.isLogged = false;
      }
    });
  }

  logout() {
    this.auth.signOut();
  }

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

  stopTask() {
    this.workingSubs.unsubscribe();
    this.creationOfTask = true;
    this.myForm.reset();
    this.workingTimeForSpinner = 0;
    this.roundsBlocks = 0;
    this.showPauseButton = false;
    this.showStopButton = false;
    this.percent = 0;
    this.title = '';
    this.subtitle = '';
  }

  workingTimer(workTime: number, rounds: number) {
    this.showPauseButton = true;
    this.showStopButton = true;
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
          //console.log(`Val: ${val}. TimeWork: ${timeWork}`);
          this.currentWorkingTime = timeWork - (val + 1);
          //console.log(`Current working time: ${this.currentWorkingTime}`);
          //Progress Spinner value
          this.showingTime = this.currentWorkingTime;
          // this.value = (this.currentWorkingTime * 100) / timeWork;
          //Circle
          this.subtitle = this.currentWorkingTime.toString();
          this.percent =
            (this.currentWorkingTime * 100) / (this.workingTimeForSpinner * 60);
          //console.log(this.percent);
          //console.log(`Work timing ${this.currentWorkingTime} sec`);
          if (this.currentWorkingTime == 0) {
            const { restTime } = this.myForm.value;
            this.restingTimeForSpinner = restTime;
            this.restTimer(this.restingTimeForSpinner * 60, rounds);
          }
        });
      return this.workingSubs;
    }
    return;
  }

  restTimer(restTime: number, rounds: number) {
    this.showPauseButton = false;
    this.showStopButton = false;
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
          this.percent =
            (this.currentRestingTime * 100) / (this.restingTimeForSpinner * 60);
          //console.log(`Rest timing ${this.currentRestingTime} sec`);
          if (this.currentRestingTime == 0) {
            this.workingTimer(this.workingTimeForSpinner * 60, rounds);
          }
        });
      return this.restingSubs;
    }
    //Circle
    this.title = 'Start a task';
    this.subtitle = '';
    this.creationOfTask = true;
    this.workingSubs.unsubscribe();
    this.restingSubs.unsubscribe();

    //Form
    this.completedTasks.push(this.myForm.value);
    this.saveLocalStorage(this.completedTasks);

    this.myForm.reset();
    this.launchConfetti();

    return;
  }

  launchConfetti() {
    this.confettiHide = false;
    this.toastr.success(
      'You are very productive! You have completed your task!',
      'Congrats!',
      {
        timeOut: 5000,
        extendedTimeOut: 3000,
        disableTimeOut: false,
        closeButton: true,
        positionClass: 'toast-top-center',
        progressBar: true,
        progressAnimation: 'decreasing'
      }
    );
    setTimeout(() => {
      this.confettiHide = true;
    }, 5000);
  }

  saveLocalStorage(completedTasks: Task[]) {
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
  }
}
