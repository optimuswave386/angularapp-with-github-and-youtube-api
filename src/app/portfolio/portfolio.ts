import { Component } from '@angular/core';
import { Projects } from '../projects/projects';
import { Gallery } from '../gallery/gallery';

@Component({
  selector: 'app-portfolio',
  imports: [Gallery, Projects],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.css',
})
export class Portfolio {}
