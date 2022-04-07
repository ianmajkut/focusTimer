


# FocusTimer :clock1:
![focusTimer](https://user-images.githubusercontent.com/65124829/162219304-6dcd51d6-6413-4e3e-a6c0-d45c8b28eaf7.jpeg)


## About

Angular project implementing [angularfire](https://github.com/angular/angularfire), [angular material](https://material.angular.io/), internationalization with [ngx-translate](https://github.com/ngx-translate/core), [tsparticles](https://www.npmjs.com/package/tsparticles), [ng-circle-progress](https://www.npmjs.com/package/ng-circle-progress).

The project aims to allow the user to create work and rest blocks in order to stay focused and manage time better. It also allows us, once we are logged in, to store the completed tasks and be able to repeat them. For user administration and registration/login, we chose to use Firebase. 


## Countdown and Task

For the creation of the task, the form field component of angular material is used with its respective validations. Once the task has been created, it will switch between the `workingTimer()` and `restTimer()` methods.

```ts

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

```

Once we are done we unsubscribe to the timer subscriptions and call saveTask() and launchConfetti() methods.

```ts
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
```

## When we enter..

When we open the app, one of the first things we do is check the status of the user. If the user is logged, we check if he has any completed task

```ts
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
  
  ......
  
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
```

## Services 

The app has two main services

### login-register.service.ts

This service is mainly used in the components of the `auth/` folder, responsible for login, signup and verification. 

```ts
// Async validator to check if the username is available or not with a debounce time of 500ms
  checkUser(control: AbstractControl) {
    const username: string = control.value;
    return this.firestore
      .collection('users', (ref) => ref.where('username', '==', username))
      .valueChanges()
      .pipe(
        debounceTime(500),
        take(1),
        map((arr) => (arr.length ? { usernameNoAvailable: true } : null))
      );
  }

  async register(user: any, password: string) {
    try {
      //Take the mail and password of the user and create a new user in firebase
      await this.auth.createUserWithEmailAndPassword(user.email, password);

      let tempId = this.firestore.createId();
      //Call method sendVerificationEmail() to send a verification email to the user
      await this.sendVerificationEmail();
      //Take the user and add it to the database collection 'users'
      return await this.firestore.collection('users').doc(tempId).set({
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        uid: tempId
      });
    } catch (error) {
      throw error;
    }
  }
  //Method to send a verification email to the user
  async sendVerificationEmail() {
    try {
      return await (await this.auth.currentUser)?.sendEmailVerification();
    } catch (error) {
      throw error;
    }
  }
  //Method to login with email and password
  async login(email: string, password: string) {
    try {
      return await this.auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      throw error;
    }
  }

  //Method to create a new user in firestore with google
  async googleSignInRegister(user: any) {
    try {
      return await this.firestore.collection('users').doc(user.user?.uid).set({
        fullname: user.user?.displayName,
        email: user.user?.email,
        uid: user.user?.uid
      });
    } catch (error) {
      throw error;
    }
  }
```

### task.service.ts

This service is mainly used in `main.component.ts` to save tasks and delete them.

```ts
//Method to save a Task on Firebase
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

  //Method to delete a Task on Firebase
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
    //Toastr message english
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
    //Toastr message spanish
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
```

## Translation

For translation ngx-translate was used. It is very important that in the `assets/i18n/` folder we have the json of the languages that we want to translate. In my case simply Spanish (`es.json`) and English (`en-US.json`). In both files there will be the texts that we want to be used.

Example: 
```
//es.json file
{
  "greet": "Hola",
  "state of mind": "Estoy bien"
}
```
```
//en-US.json
{
  "greet": "Hi",
  "state of mind": "i'm fine"
}
```
I hope it was understood :confounded:
What we also need to do is import the TranslateModule and configure the HttpLoader. You can see the ngx-translate [documentation](https://github.com/ngx-translate/core) to do it correctly. I import the TranslateModule in each module :-1: :tired_face:, although you can have a SharedModule or you can also configure it for lazy loaded modules :+1: :ok_hand:
