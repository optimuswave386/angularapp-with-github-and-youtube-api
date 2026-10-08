import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { map } from 'rxjs';

export type LinkTuple = [url: string, label: string, category: string];

export interface Note {
  _id: string;
  datenoted: string;
  note: string;
  links?: {
    hrefs?: LinkTuple[];
  };
}

@Injectable({ providedIn: 'root' })
export class NotesService {
  private http = inject(HttpClient);

  getNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(`${environment.apiUrl}/dn/getNotes`).pipe(
      map(notes => notes.slice(-3).reverse())
    );
  }
}