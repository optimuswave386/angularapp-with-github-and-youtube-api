import { Injectable } from '@angular/core';

export interface SearchItem {
  title: string;
  description: string;
  url: string;          // '/' for internal routes, or a full https:// link
  external?: boolean;
  tags: string[];
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly items: SearchItem[] = [
    {
      title: 'Home',
      description: 'Portfolio overview: recent website work and projects.',
      url: '/',
      tags: ['portfolio', 'home', 'web developer'],
    },
    {
      title: 'GitHub',
      description: 'Source code and latest repositories.',
      url: 'https://github.com/optimuswave386',
      external: true,
      tags: ['code', 'repositories', 'github'],
    },
    // add one entry per project, e.g. title: 'Canvas game', tags: ['canvas', 'typescript']
  ];

  search(query: string): SearchItem[] {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];

    return this.items
      .map(item => ({ item, score: this.score(item, terms) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(r => r.item);
  }

  // Title matches count most, then tags, then description.
  // Every search word must match somewhere, or the item is excluded.
  private score(item: SearchItem, terms: string[]): number {
    const title = item.title.toLowerCase();
    const desc = item.description.toLowerCase();
    const tags = item.tags.map(t => t.toLowerCase());
    let total = 0;

    for (const t of terms) {
      let s = 0;
      if (title.includes(t)) s += 5;
      if (tags.some(tag => tag.includes(t))) s += 3;
      if (desc.includes(t)) s += 1;
      if (s === 0) return 0;
      total += s;
    }
    return total;
  }
}