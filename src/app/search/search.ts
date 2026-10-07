import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SearchItem, SearchService } from '../search.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search {
  private readonly route = inject(ActivatedRoute);
  private readonly searchService = inject(SearchService);

  query = '';
  results: SearchItem[] = [];

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      this.query = (params.get('q') ?? '').trim();
      this.results = this.searchService.search(this.query);
    });
  }
}
