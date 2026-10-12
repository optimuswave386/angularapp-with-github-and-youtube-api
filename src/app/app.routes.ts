import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Portfolio } from './portfolio/portfolio';
import { Search } from './search/search';
import { Notes } from './notes/notes';
import { Contact } from './contact/contact';

export const routes: Routes = [
  { path: '', component: Home, title: 'Asad — Full-stack developer' },
  { path: 'notes', component: Notes, title: 'Notes' },
  { path: 'contact', component: Contact, title: 'Contact' },
  { path: 'portfolio', component: Portfolio, title: 'Portfolio' },
  { path: 'search', component: Search, title: 'Search' },
  { path: '**', redirectTo: '' }
];
