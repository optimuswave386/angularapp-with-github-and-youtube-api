import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Projects } from './projects/projects';
import { Search } from './search/search';
import { Notes } from './notes/notes';
import { Contact } from './contact/contact';

export const routes: Routes = [
  { path: '', component: Home, title: 'Asad — Full-stack developer' },
  { path: 'notes', component: Notes, title: 'Notes' },
  { path: 'contact', component: Contact, title: 'Contact' },
  { path: 'projects', component: Projects, title: 'Projects' },
  { path: 'search', component: Search, title: 'Search' },
  { path: '**', redirectTo: '' }
];
