import {
  AfterViewInit, Component, ElementRef, ChangeDetectorRef, HostListener, OnDestroy,
  PLATFORM_ID, ViewChild, inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  //imports: [],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit, OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('hero') hero?: ElementRef<HTMLElement>;
  @ViewChild('scroller') scroller?: ElementRef<HTMLElement>;
  @ViewChild('indicator') indicator?: ElementRef<HTMLElement>;
  @ViewChild('thumb') thumb?: ElementRef<HTMLElement>;
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


  // paste: resizeObserver, dragging, dragStartY, dragStartTop,
  //        layoutIndicator, onThumbDown, onThumbMove, onThumbUp,
  //        onTrackDown, randomizeHero  (unchanged)

  // ---------- Work section: scroll indicator ----------
  private resizeObserver?: ResizeObserver;
  private dragging = false;
  private dragStartY = 0;
  private dragStartTop = 0;

  layoutIndicator(): void {
    const sc = this.scroller?.nativeElement;
    const ind = this.indicator?.nativeElement;
    const thumb = this.thumb?.nativeElement;
    if (!sc || !ind || !thumb) return;

    const ch = sc.clientHeight, sh = sc.scrollHeight;
    if (sh <= ch + 1) { ind.hidden = true; return; }
    ind.hidden = false;
    const trackH = ind.clientHeight;
    const h = Math.max(36, (trackH * ch) / sh);
    const y = (sc.scrollTop / (sh - ch)) * (trackH - h);
    thumb.style.height = `${h}px`;
    thumb.style.transform = `translateY(${y}px)`;
  }

  onThumbDown(e: PointerEvent): void {
    e.stopPropagation();
    this.dragging = true;
    this.dragStartY = e.clientY;
    this.dragStartTop = this.scroller!.nativeElement.scrollTop;
    this.thumb!.nativeElement.setPointerCapture(e.pointerId);
  }

  onThumbMove(e: PointerEvent): void {
    if (!this.dragging) return;
    const sc = this.scroller!.nativeElement;
    const travel = this.indicator!.nativeElement.clientHeight - this.thumb!.nativeElement.offsetHeight;
    const ratio = (sc.scrollHeight - sc.clientHeight) / travel;
    sc.scrollTop = this.dragStartTop + (e.clientY - this.dragStartY) * ratio;
  }

  onThumbUp(): void {
    this.dragging = false;
  }

  onTrackDown(e: PointerEvent): void {
    const thumb = this.thumb!.nativeElement;
    if (e.target === thumb) return;
    const sc = this.scroller!.nativeElement;
    const ind = this.indicator!.nativeElement;
    const rect = ind.getBoundingClientRect();
    const travel = ind.clientHeight - thumb.offsetHeight;
    const pos = Math.min(Math.max(e.clientY - rect.top - thumb.offsetHeight / 2, 0), travel);
    sc.scrollTo({ top: (pos / travel) * (sc.scrollHeight - sc.clientHeight), behavior: 'smooth' });
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

  @HostListener('window:resize')
  onResize(): void {
    if (this.isBrowser) this.layoutIndicator();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.randomizeHero();
    this.layoutIndicator();
    if (this.scroller && 'ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => this.layoutIndicator());
      this.resizeObserver.observe(this.scroller.nativeElement);
    }
    this.userPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.initCarousel();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.stop();
  }

}
