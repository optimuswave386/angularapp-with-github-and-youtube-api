import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Project {
  _id: string;
  tag: string;
  index: string;
  title: string;
  description: string;
  stack: string[];
  href: string;
  status: string;
  year: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private http = inject(HttpClient);

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${environment.apiUrl}/cep/getProjects`);
  }
}