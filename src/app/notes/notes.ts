import { PLATFORM_ID, AfterViewInit, OnDestroy, Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { NotesService } from '../notes.service';
import { isPlatformBrowser } from '@angular/common';
 
@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [AsyncPipe, DatePipe],
  templateUrl: './notes.html',
  styleUrl: './notes.css',
})
export class Notes implements AfterViewInit, OnDestroy {
  private notesService = inject(NotesService);
  notes$ = this.notesService.getNotes();

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngAfterViewInit(): void {
    // Implementation for after view initialization
    if (!this.isBrowser) return;
  }

  ngOnDestroy(): void {
    // Implementation for cleanup
  }
}
