import { Injectable } from '@angular/core';
import { interval, timer } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  timerInterval = interval(1000);

  workingTimer(workTime: number) {
    const timeWork = workTime;
    const countDownWork = this.timerInterval.pipe(take(timeWork));
    return countDownWork.subscribe((val) => {
      const currentTime = timeWork - (val + 1);
      console.log(`Work timing ${currentTime}`);
      if (currentTime == 0) {
        console.log('Time is UP');
      }
    });
  }

  // restTimer(restTime: number) {
  //   const timeRest = restTime;
  //   const countDownRest = this.timerInterval.pipe(take(timeRest));

  //   return countDownRest.subscribe((val) => {
  //     const currentTime = timeRest - (val + 1);
  //     // console.log(`Rest timing ${currentTime}`);
  //     // if (currentTime == 0) {
  //     //   console.log('Time is UP');
  //     // }
  //   });
  // }
}
