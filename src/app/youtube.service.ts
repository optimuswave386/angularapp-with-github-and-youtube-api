import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay, startWith, switchMap, throwError } from 'rxjs';
import { environment } from '../environments/environment';

interface ChannelResponse {
  items?: { contentDetails: { relatedPlaylists: { uploads: string } } }[];
}

interface PlaylistResponse {
  items?: {
    snippet: {
      title: string;
      publishedAt: string;
      resourceId: { videoId: string };
      thumbnails?: { medium?: { url: string }; default?: { url: string } };
    };
  }[];
}

export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  date: string;
}

export interface VideoState {
  loading: boolean;
  error: boolean;
  items: VideoItem[];
}

const LOADING: VideoState = { loading: true, error: false, items: [] };

@Injectable({ providedIn: 'root' })
export class YoutubeService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly api = 'https://www.googleapis.com/youtube/v3';
  private readonly key = environment.youtubeApiKey;

  // On the server we skip the request: a referrer-restricted key
  // is rejected there because server requests carry no referrer.
  readonly videos$: Observable<VideoState> = this.isBrowser ? this.load() : of(LOADING);

  private load(): Observable<VideoState> {
    return this.http
      .get<ChannelResponse>(`${this.api}/channels`, {
        params: {
          part: 'contentDetails',
          forHandle: environment.youtubeHandle,
          key: this.key,
        },
      })
      .pipe(
        map(res => res.items?.[0]?.contentDetails.relatedPlaylists.uploads),
        switchMap(playlistId =>
          playlistId
            ? this.http.get<PlaylistResponse>(`${this.api}/playlistItems`, {
                params: { part: 'snippet', playlistId, maxResults: 6, key: this.key },
              })
            : throwError(() => new Error('Channel not found')),
        ),
        map((res): VideoState => ({
          loading: false,
          error: false,
          items: (res.items ?? [])
            // private or deleted videos show up with placeholder titles
            .filter(i => i.snippet.title !== 'Private video' && i.snippet.title !== 'Deleted video')
            .map(i => ({
              id: i.snippet.resourceId.videoId,
              title: i.snippet.title,
              thumbnail: i.snippet.thumbnails?.medium?.url ?? i.snippet.thumbnails?.default?.url ?? '',
              url: `https://www.youtube.com/watch?v=${i.snippet.resourceId.videoId}`,
              date: i.snippet.publishedAt,
            })),
        })),
        catchError(() => of<VideoState>({ loading: false, error: true, items: [] })),
        startWith(LOADING),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
  }
}