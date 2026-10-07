import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay, startWith } from 'rxjs';

interface GithubEvent {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };            // "owner/repo"
  payload: {
    ref?: string;
    ref_type?: string;
    action?: string;
    commits?: { sha: string; message: string }[];
    pull_request?: { title: string; html_url: string };
    issue?: { title: string; html_url: string };
  };
}

export interface ActivityItem {
  id: string;
  text: string;
  detail?: string;
  url: string;
  date: string;
}

export interface ActivityState {
  loading: boolean;
  error: boolean;
  items: ActivityItem[];
}

@Injectable({ providedIn: 'root' })
export class GithubService {
  private readonly http = inject(HttpClient);
  private readonly username = 'optimuswave386';

  readonly activity$: Observable<ActivityState> = this.http
    .get<GithubEvent[]>(`https://api.github.com/users/${this.username}/events/public`, {
      params: { per_page: 30 },
    })
    .pipe(
      map((events): ActivityState => ({
        loading: false,
        error: false,
        items: events
          .map(e => this.toItem(e))
          .filter((i): i is ActivityItem => i !== null)
          .slice(0, 8),
      })),
      catchError(() => of<ActivityState>({ loading: false, error: true, items: [] })),
      startWith<ActivityState>({ loading: true, error: false, items: [] }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

  // Turn a raw GitHub event into a line you can display.
  // Event types we don't handle are dropped.
  private toItem(e: GithubEvent): ActivityItem | null {
    const repo = e.repo.name;
    const repoUrl = `https://github.com/${repo}`;
    const p = e.payload;

    switch (e.type) {
      case 'PushEvent': {
        const branch = p.ref?.replace('refs/heads/', '');
        const last = p.commits?.[p.commits.length - 1];
        return {
          id: e.id,
          text: `Pushed to ${repo}${branch ? ` (${branch})` : ''}`,
          detail: last?.message.split('\n')[0],
          url: repoUrl,
          date: e.created_at,
        };
      }
      case 'CreateEvent':
        return {
          id: e.id,
          text: `Created ${p.ref_type}${p.ref ? ` ${p.ref}` : ''} in ${repo}`,
          url: repoUrl,
          date: e.created_at,
        };
      case 'PullRequestEvent':
        return {
          id: e.id,
          text: `${p.action} pull request in ${repo}`,
          detail: p.pull_request?.title,
          url: p.pull_request?.html_url ?? repoUrl,
          date: e.created_at,
        };
      case 'IssuesEvent':
        return {
          id: e.id,
          text: `${p.action} issue in ${repo}`,
          detail: p.issue?.title,
          url: p.issue?.html_url ?? repoUrl,
          date: e.created_at,
        };
      case 'WatchEvent':
        return { id: e.id, text: `Starred ${repo}`, url: repoUrl, date: e.created_at };
      default:
        return null;
    }
  }
}