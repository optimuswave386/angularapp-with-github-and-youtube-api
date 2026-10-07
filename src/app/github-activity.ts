import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { GithubService } from './github.service';

@Component({
  selector: 'app-github-activity',
  standalone: true,
  imports: [AsyncPipe, DatePipe],
  template: `
    @if (state$ | async; as state) {
      @if (state.loading) {
        <span>Loading latest activity&hellip;</span>
      } @else if (state.error) {
        <span>Couldn't load GitHub activity right now.</span>
      } @else if (state.items.length === 0) {
        <span>No recent public activity.</span>
      } @else {
        <ul class="gh-activity feed">
          @for (item of state.items.slice(0, 7); track item.id) {
            <li>
              <a [href]="item.url" target="_blank" rel="noopener">{{ item.text }}</a>
              @if (item.detail) {
                <span class="gh-detail">{{ item.detail }}</span>
              }
              <span><time [attr.datetime]="item.date">{{ item.date | date: 'MMM d' }}</time></span>
            </li>
          }
        </ul>
      }
    }
  `,
})
export class GithubActivity {
  state$ = inject(GithubService).activity$;
}