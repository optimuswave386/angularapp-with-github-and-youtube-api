import {
  ElementRef, ChangeDetectorRef, HostListener, 
  PLATFORM_ID, ViewChild
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { AfterViewInit, OnDestroy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ProjectsService } from '../projects.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements AfterViewInit, OnDestroy {
  private projectsService = inject(ProjectsService);

  projects$ = this.projectsService.getProjects();

  variants = ['box--sq box--mint', 'box--ink', 'box--glass'];
  variantFor(i: number) {
    return this.variants[i % this.variants.length];
  }

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private scrollerEl?: ElementRef<HTMLElement>;

  @ViewChild('scroller')
  set scroller(ref: ElementRef<HTMLElement> | undefined) {
    this.resizeObserver?.disconnect();
    this.scrollerEl = ref;
    if (!ref || !this.isBrowser) return;

    // wait one frame so indicator/thumb queries are resolved and layout is done
    requestAnimationFrame(() => {
      this.layoutIndicator();
      if ('ResizeObserver' in window) {
        this.resizeObserver = new ResizeObserver(() => this.layoutIndicator());
        this.resizeObserver.observe(ref.nativeElement);
        const content = ref.nativeElement.firstElementChild; // .bento
        if (content) this.resizeObserver.observe(content);
      }
    });
  }
  get scroller() { return this.scrollerEl; }

  @ViewChild('indicator') indicator?: ElementRef<HTMLElement>;
  @ViewChild('thumb') thumb?: ElementRef<HTMLElement>;

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
    thumb.style.visibility = 'visible';
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

  @HostListener('window:resize')
  onResize(): void {
    if (this.isBrowser) this.layoutIndicator();
  }

  ngAfterViewInit() {
    // Initialization logic for after view is initialized
    if (!this.isBrowser) return;
    this.layoutIndicator();
  }

  ngOnDestroy() {
    // Cleanup logic when component is destroyed
    this.resizeObserver?.disconnect();
  }

}
