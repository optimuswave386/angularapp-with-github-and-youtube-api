import {
  AfterViewInit, Component, ElementRef, ChangeDetectorRef, HostListener, OnDestroy,
  PLATFORM_ID, ViewChild, inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Projects } from '../projects/projects';
import { Notes } from '../notes/notes';
import { Contact } from '../contact/contact';

@Component({
  selector: 'app-home',
  imports: [Projects, Notes],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit, OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('hero') hero?: ElementRef<HTMLElement>;
  @ViewChild('track') track?: ElementRef<HTMLElement>;

    // ---------- Hero carousel ----------
  dots: number[] = [];
  current = 0;
  //userPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  userPaused = false;
  touchX: number | null = null;
  private count = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  private initCarousel(): void {
    const track = this.track?.nativeElement;
    if (!track) return;
    this.count = track.children.length;
    this.dots = Array.from({ length: this.count }, (_, i) => i);
    this.cdr.detectChanges(); // render the dots now, before goTo(0)
    this.goTo(0);
    this.start();
  }

  goTo(n: number): void {
    const track = this.track?.nativeElement;
    if (!track || this.count === 0) return;
    this.current = (n + this.count) % this.count;
    track.style.transform = `translateX(${-100 * this.current}%)`;
    Array.from(track.children).forEach((slide, j) =>
      slide.setAttribute('aria-hidden', String(j !== this.current)));
  }

  stop(): void {
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
  }

  start(): void {
    this.stop();
    if (!this.userPaused) {
      this.timer = setInterval(() => this.goTo(this.current + 1), 6000);
    }
  }

  toggleAuto(): void {
    this.userPaused = !this.userPaused;
    this.start();
  }

  onCarouselKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft') this.goTo(this.current - 1);
    else if (e.key === 'ArrowRight') this.goTo(this.current + 1);
  }

  onTrackPointerDown(e: PointerEvent): void {
    this.touchX = e.clientX;
  }

  onTrackPointerUp(e: PointerEvent): void {
    if (this.touchX === null) return;
    const dx = e.clientX - this.touchX;
    this.touchX = null;
    if (Math.abs(dx) > 40) this.goTo(this.current + (dx < 0 ? 1 : -1));
  }

  // ---------- Hero colour: different on each page load ----------
  private randomizeHero(): void {
    const colors = ['#2438e8', '#6a2ee8', '#0a6560', '#b0175a', '#a31d2d', '#4b3fd1', '#9a3412'];
    let last: string | null = null;
    try { last = sessionStorage.getItem('heroColor'); } catch {}
    const choices = colors.filter(c => c !== last);
    const pick = choices[Math.floor(Math.random() * choices.length)];
    this.hero?.nativeElement.style.setProperty('--hero', pick);
    try { sessionStorage.setItem('heroColor', pick); } catch {}
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.randomizeHero();
    this.userPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.initCarousel();
  }

  ngOnDestroy(): void {
    this.stop();
  }

}
