import { Component } from '@angular/core';
import { AfterViewInit, OnDestroy, inject } from '@angular/core';
import {AsyncPipe} from "@angular/common"
import { ProjectsService } from '../projects.service';

@Component({
  selector: 'app-gallery',
  imports: [AsyncPipe],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
})
export class Gallery {
  private projectsService = inject(ProjectsService);
  gallery$ = this.projectsService.getProjects();

}
