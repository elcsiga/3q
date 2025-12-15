import { AfterViewInit, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { getRandomTopic, initConversation, stopConversation } from './ai';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit {

  protected status = signal<'noMic' | 'askForMic' | 'loading' | 'ready' | 'starting' | 'playing' | 'stopping' | 'error'>('loading');

  @ViewChild('test') testSound!: ElementRef<HTMLAudioElement>;
  @ViewChild('intro') introSound!: ElementRef<HTMLAudioElement>;
  @ViewChild('outro') outroSound!: ElementRef<HTMLAudioElement>;
  @ViewChild('correct') correctSound!: ElementRef<HTMLAudioElement>;
  @ViewChild('incorrect') incorrectSound!: ElementRef<HTMLAudioElement>;

  private readonly activatedRoute = inject(ActivatedRoute);

  ngAfterViewInit(): void {
    this.testSound.nativeElement.volume = 0.5;
    this.introSound.nativeElement.volume = 0.5;
    this.outroSound.nativeElement.volume = 0.3;
    this.correctSound.nativeElement.volume = 0.4;
    this.incorrectSound.nativeElement.volume = 0.5;

    this.checkPermissions();
  }

  checkPermissions() {
    navigator.permissions.query({ name: "microphone" }).then((result) => {
      if (result.state === "granted") {
        this.status.set("loading");
        setTimeout(() => this.status.set("ready"), 2000);
        console.log('Microphone permission granted.');
      } else if (result.state === "prompt") {
        this.status.set("noMic");
        console.log('Need microphone permission.')
      } else if (result.state === "denied") {
        this.status.set("error");
        console.log('Microphone permission denied.')
      }
    });
  }

  enableMic() {
    this.status.set("askForMic");
    this.testSound.nativeElement.play();
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .finally(() => {
        this.checkPermissions()
      });
  }

  start() {

    const name = this.activatedRoute.snapshot.queryParamMap.get('name') || 'Karesz';
    const topic = this.activatedRoute.snapshot.queryParamMap.get('topic') || getRandomTopic();

    console.log(`Name: ${name}`);
    console.log(`Topic: ${topic}`);
    console.log(`Starting quiz.`);

    this.introSound.nativeElement.play();
    this.status.set('starting')

    setTimeout(() => initConversation(name, topic, {
      correctAnswer: () => {
        console.log('Correct answer.');
        this.correctSound.nativeElement.play()
      },
      incorrectAnswer: () => {
        console.log('Incorrect answer.');
        this.incorrectSound.nativeElement.play()
      },
      endConversation: () => {
        console.log('End of quiz.');
        setTimeout(() => {
          this.outroSound.nativeElement.play();
          this.status.set('stopping');
        }, 2000);

        setTimeout(() => {
          stopConversation();
          this.status.set('ready');
        }, 16000);
      }
    })
      .then(() => {
        this.status.set('playing');
        this.introSound.nativeElement.volume = 0.2;
      })
      .catch((e: any) => {
        console.error(e);
        this.status.set('error');
      })
      , 3000);
  }

  stop() {
    this.status.set('stopping');
    stopConversation();
    setTimeout(() => this.status.set('ready'), 1000);
  }
}
