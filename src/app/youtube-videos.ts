import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { YoutubeService } from './youtube.service';

@Component({
  selector: 'app-youtube-videos',
  standalone: true,
  imports: [AsyncPipe, DatePipe],
  template: `
    @if (state$ | async; as state) {
      @if (state.loading) {
        <span>Loading latest videos&hellip;</span>
      } @else if (state.error) {
        <span>Couldn't load YouTube videos right now.</span>
      } @else if (state.items.length === 0) {
        <span>No videos yet.</span>
      } @else {
        <ul class="yt-videos feed">
          @for (v of state.items.slice(0,3); track v.id) {
            <li>
              <a [href]="v.url" target="_blank" rel="noopener">
                @if (v.thumbnail) {
                  <img [src]="v.thumbnail" alt="" width="160" height="90" loading="lazy">
                }
                <span class="yt-title">{{ v.title }}</span>
              </a>
              <span><time [attr.datetime]="v.date">{{ v.date | date: 'MMM d, y' }}</time></span>
            </li>
          }
        </ul>
      }
    }
  `,
})
export class YoutubeVideos {
  state$ = inject(YoutubeService).videos$;
}