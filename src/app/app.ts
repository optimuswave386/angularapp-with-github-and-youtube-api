import {
  AfterViewInit, Component, signal, ElementRef,
  HostListener, OnDestroy, PLATFORM_ID, ViewChild, inject,
} from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { GithubActivity } from './github-activity';
import { YoutubeVideos } from './youtube-videos';
import { Footer } from './footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GithubActivity, YoutubeVideos, Footer],
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit, OnDestroy {

  protected readonly title = signal('angularapp');
  
  private readonly body = inject(DOCUMENT).body;
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly MOBILE_BREAKPOINT = 768;

  @ViewChild('navLink') navLink?: ElementRef<HTMLElement>;
  @ViewChild('panel') panel?: ElementRef<HTMLElement>;

  // ---------- Sidebar and right panel ----------
  panelOpen = false;

  constructor() {
    // The sidebar starts closed at every width.
    if (this.isBrowser && window.innerWidth > this.MOBILE_BREAKPOINT) {
      this.body.classList.add('sidebar-collapsed');
    }
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.searchTerm = this.router.parseUrl(this.router.url).queryParams['q'] ?? '';
      });
  }

  private closePanel(): void {
    this.panelOpen = false;
    this.body.classList.remove('panel-open');
  }

  private closeSidebar(): void {
    this.body.classList.remove('sidebar-open');
  }

  toggleSidebar(e: Event): void {
    e.preventDefault();
    if (window.innerWidth <= this.MOBILE_BREAKPOINT) {
      this.body.classList.toggle('sidebar-open');
    } else {
      this.body.classList.toggle('sidebar-collapsed');
    }
    this.closePanel();
  }

  togglePanel(e: Event): void {
    e.preventDefault();
    this.panelOpen = !this.panelOpen;
    this.body.classList.toggle('panel-open', this.panelOpen);
    this.closeSidebar();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    const target = e.target as Node;
    if (
      this.panelOpen &&
      !this.panel?.nativeElement.contains(target) &&
      !this.navLink?.nativeElement.contains(target)
    ) {
      this.closePanel();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closePanel();
    this.closeSidebar();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.isBrowser) return;
    // Don't leave a toggle stuck when crossing the breakpoint.
    if (window.innerWidth > this.MOBILE_BREAKPOINT) this.closeSidebar();
    else this.body.classList.remove('sidebar-collapsed');
  }

  searchTerm = '';
  onSearch(e: Event, value: string): void {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    this.router.navigate(['/search'], { queryParams: { q } });
  }



  // ---------- Lifecycle ----------
  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

  }

  ngOnDestroy(): void {
    this.body.classList.remove('sidebar-open', 'sidebar-collapsed', 'panel-open');
  }
}
