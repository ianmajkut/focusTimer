import { AfterViewInit, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { interval, Observable, Subscription, timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { Task } from '../../interfaces/interface';
import { ISourceOptions } from 'tsparticles';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { TaskService } from 'src/app/services/task.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements AfterViewInit {
  confettiHide: boolean = true;

  //Style for Conffeti
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
  //End Style for Conffeti

  //Set default language
  lang: string = 'en-US';

  //Circle Spinner
  percent!: number;
  title: string = 'Start a task';

  subtitle = '';
  //Colors Circle
  outerStrokeColor!: string;
  outerStrokeGradientStopColor!: string;

  creationOfTask: boolean = true;
  pausedState: boolean = false;
  resumeTask: boolean = false;
  completedTasks: any[] = [];

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
  resumeAmountBlocks!: number;
  isLastRound: boolean = false;
  workingSubs!: Subscription;
  restingSubs!: Subscription;

  typeOfBlock!: string;

  myForm: FormGroup = this.formBuilder.group({
    taskName: ['', [Validators.required]],
    workingTime: ['', [Validators.required, Validators.min(1)]],
    amountBlocks: ['', [Validators.required, Validators.min(2)]],
    restTime: ['', [Validators.required, Validators.min(1)]],
    description: [,]
  });

  //Auth
  public isLogged!: boolean;
  userUID!: string;

  //Creation of audio for countdown
  audio: any = new Audio();

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private auth: AngularFireAuth,
    private taskService: TaskService,
    private firestore: AngularFirestore,
    private spinner: NgxSpinnerService,
    private translateService: TranslateService
  ) {
    //Set and load audio for countdown
    this.audio.src = '../../../assets/countdown.wav';
    this.audio.load();
  }

  ngAfterViewInit(): void {
    this.getUserState();
  }

  //Get user state
  async getUserState() {
    this.spinner.show();
    await this.auth.authState.subscribe((user) => {
      if (user?.email) {
        //Obtain the user UID
        this.userUID = user.uid;
        //The user is logged
        this.isLogged = true;
        //Obtain the tasks of the user
        this.getTasks();
      } else {
        this.isLogged = false;
        this.spinner.hide();
      }
    });
  }

  //Method to sign out
  logout() {
    this.spinner.show();
    setTimeout(() => {
      this.auth.signOut();
      this.spinner.hide();
    }, 3000);
  }

  play() {
    if (this.creationOfTask) {
      this.creationOfTask = false;
      //Obtain the values of the form
      const { workingTime, amountBlocks } = this.myForm.value;
      this.workingTimeForSpinner = workingTime;
      this.roundsBlocks = amountBlocks;

      //When we start a task, we have to show the pause and stop button
      this.showPauseButton = true;
      this.showStopButton = true;
      /*
      Call the method to start the countdown,
      send the time that the user has to work (*60 because the time is in minutes)
      and the number of rounds
      */
      this.workingTimer(this.workingTimeForSpinner * 60, this.roundsBlocks);
    }
    if (this.pausedState) {
      //Set the pause state to false
      this.pausedState = false;
      this.resumeTask = true;
      //Play the audio for the countdown
      if (this.currentWorkingTime <= 2) {
        this.audio.play();
      }
      this.workingTimer(this.showingTime, this.resumeAmountBlocks);
    }
  }

  //Method to pause the task
  pauseTask() {
    //Pause the audio
    this.audio.pause();
    //Pause the timer
    this.workingSubs.unsubscribe();
    //Set the paused state to true
    this.pausedState = true;
  }

  //Method to stop the task
  stopTask() {
    //Unsubscribe the timer subscription
    this.workingSubs.unsubscribe();
    //Pause the audio if it is playing and load the audio for the countdown
    this.audio.pause();
    this.audio.load();
    this.creationOfTask = true;
    //Reset the form
    this.myForm.reset();
    //Reset all the variables for the circle spinner and hide the buttons
    this.workingTimeForSpinner = 0;
    this.roundsBlocks = 0;
    this.showPauseButton = false;
    this.showStopButton = false;
    this.percent = 0;
    this.title = '';
    this.subtitle = '';
  }

  //Method to start the working coutndown
  workingTimer(workTime: number, rounds: number) {
    //Show the pause and stop button
    this.showPauseButton = true;
    this.showStopButton = true;
    //Set the color of the circle spinner(working)
    this.outerStrokeColor = '#4882c2';
    this.outerStrokeGradientStopColor = '#53a9ff';
    //Checl if the user has more rounds or if it is the last round
    if (rounds > 0 || this.isLastRound === true) {
      //Set the type of block to working
      this.typeOfBlock = 'Working Time Countdown:';
      //Cicle
      if (this.lang === 'en-US') {
        this.title = 'Working Countdown:';
      }
      if (this.lang === 'es') {
        this.title = 'Cuenta regr. trabajo ';
      }
      /*
      If we paused the task, we have to resume the timer
      so we have to obtain the rounds that the user has left
      */
      this.resumeAmountBlocks = rounds;

      const timeWork = workTime;
      //Countdown
      this.workingSubs = this.timerInterval
        .pipe(take(timeWork))
        .subscribe((val) => {
          this.currentWorkingTime = timeWork - (val + 1);
          //Progress Spinner value
          this.showingTime = this.currentWorkingTime;

          //Circle
          this.subtitle = this.currentWorkingTime.toString();
          this.percent =
            (this.currentWorkingTime * 100) / (this.workingTimeForSpinner * 60);

          if (this.currentWorkingTime === 2) {
            this.audio.play();
          }
          if (this.currentWorkingTime == 0) {
            //Rest the round after the countdown is over
            --rounds;
            if (rounds === 0) {
              //Set the last round to true
              this.isLastRound = true;
            }
            //Obtain the time that the user has to rest
            const { restTime } = this.myForm.value;
            this.restingTimeForSpinner = restTime;
            //Call the method to start the rest countdown
            this.restTimer(this.restingTimeForSpinner * 60, rounds);
          }
        });
      return this.workingSubs;
    }
    return;
  }

  //Method to start the resting coutndown
  restTimer(restTime: number, rounds: number) {
    //We can't pause or stop the task in the resting countdown
    this.showPauseButton = false;
    this.showStopButton = false;
    //Change the color of the circle spinner(resting)
    this.outerStrokeColor = '#e63946';
    this.outerStrokeGradientStopColor = '#e63946';
    if (rounds > 0 || !this.isLastRound) {
      this.typeOfBlock = 'Resting Time Countdown:';

      //Circle
      if (this.lang === 'en-US') {
        this.title = 'Resting Countdown:';
      }
      if (this.lang === 'es') {
        this.title = 'Cuenta regr. descanso ';
      }

      const timeRest = restTime;
      this.restingSubs = this.timerInterval
        .pipe(take(timeRest))
        .subscribe((val) => {
          this.currentRestingTime = timeRest - (val + 1);
          //Progress Spinner value

          this.showingTime = this.currentRestingTime;
          //Circle
          this.subtitle = this.currentRestingTime.toString();
          this.percent =
            (this.currentRestingTime * 100) / (this.restingTimeForSpinner * 60);

          if (this.currentRestingTime === 2) {
            this.audio.play();
          }
          if (this.currentRestingTime == 0) {
            this.workingTimer(this.workingTimeForSpinner * 60, rounds);
          }
        });
      return this.restingSubs;
    }
    //If the user has no more rounds, we have to stop the task
    //Circle
    this.isLastRound = false;
    //Method to change the language of the title for the circle spinner
    this.changeComponentLanguage();
    this.subtitle = '';
    this.creationOfTask = true;
    //Unsubscribe the timer subscriptions
    this.workingSubs.unsubscribe();
    this.restingSubs.unsubscribe();

    //Form
    //Asign the values to the form to a variable
    let task: Task = this.myForm.value;
    //Call method and pass the task to the method
    this.saveTask(task);

    //Reset the form and launch the confetti
    this.myForm.reset();
    this.launchConfetti();

    return;
  }

  //Method to launch the confetti and the toastr
  launchConfetti() {
    this.confettiHide = false;
    if (this.lang === 'en-US') {
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
    }
    if (this.lang === 'es') {
      this.toastr.success(
        'Eres muy productivo! Completaste tu tarea!',
        'Felicidades!',
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
    }

    setTimeout(() => {
      this.confettiHide = true;
    }, 5000);
  }

  //Method to save the task
  saveTask(task: Task) {
    //localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    this.taskService.saveTaskFirestore(task, this.userUID);
  }

  //Obtain the tasks from the database
  async getTasks() {
    await this.firestore
      .collection('tasks')
      .doc(this.userUID)
      .collection('tasksCompletedFromThisUser')
      .valueChanges()
      .subscribe((tasks) => {
        this.completedTasks = tasks;
        this.spinner.hide();
      });
  }
  //Method to repeat the task again, obtaining the tasks from the database and setting the form
  async patchTask(taskId: string) {
    this.spinner.show();
    await this.firestore
      .collection('tasks')
      .doc(this.userUID)
      .collection('tasksCompletedFromThisUser', (ref) =>
        ref.where('id', '==', taskId)
      )
      .get()
      .subscribe((res) => {
        this.myForm.patchValue(res.docs[0].data());
        this.spinner.hide();
      });
  }
  //Method to change the global language
  public selectLanguage(event: any) {
    this.translateService.use(event.target.value);
    this.lang = event.target.value;
    this.changeComponentLanguage();
  }
  //Method to change the language of the title for the circle spinner
  changeComponentLanguage() {
    if (this.lang === 'en-US') {
      this.title = 'Start a task';
    }
    if (this.lang === 'es') {
      this.title = 'Comenzar una tarea';
    }
  }

  //Method to toggle class for the hamburger menu
  switchOpenClose() {
    document.getElementById('menu-btn')?.classList.toggle('open');
    document.getElementById('menu')?.classList.toggle('hidden');
    document.getElementById('body')?.classList.toggle('no-scroll');
  }
}
