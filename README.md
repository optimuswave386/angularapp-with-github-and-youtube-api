# Asad Ali — Portfolio

A personal portfolio site built with **Angular** and **TypeScript**. It started as a static HTML/CSS/JavaScript site and was ported to Angular, with the original scripts rewritten as typed components and services.

**Live site:** [angularapp-with-github-and-youtube-api.vercel.app](https://angularapp-with-github-and-youtube-drab.vercel.app/)

<img width="1437" height="812" alt="screenshot" src="https://github.com/user-attachments/assets/bdf60dce-5d13-4985-835e-6869faf846f0" />

## Features

- **Responsive layout** with a slide-out sidebar and a right-hand panel
- **Hero section** with a random accent color on each page load
- **Image carousel** with auto-advance, pause/play, dots, keyboard arrows, and touch swipe
- **Work section** with a custom scroll indicator
- **Client-side search** with a `/search?q=...` results page and relevance scoring
- **Latest GitHub activity** pulled from the GitHub REST API
- **Latest YouTube videos** pulled from the YouTube Data API v3
- **Accessible markup:** ARIA labels, keyboard support, and reduced-motion handling for the carousel

## Tech stack

- [Angular](https://angular.dev) (standalone components, router, `HttpClient`)
- TypeScript
- RxJS (`shareReplay`, `switchMap`, `catchError`) for API data and state
- Plain CSS (`src/styles.css`)
- Deployed on [Vercel](https://vercel.com)

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 20 or newer
- Angular CLI: `npm install -g @angular/cli`

### Install and run

```bash
git clone https://github.com/optimuswave386/angularapp-with-github-and-youtube-api.git
cd angularapp-with-github-and-youtube-api
npm install
ng serve
```

Open <http://localhost:4200>. The app reloads when you edit a file.

## Configuration

### Environment files

The YouTube section needs an API key. Create (or edit) `src/environments/environment.ts` and `src/environments/environment.development.ts`:

```ts
export const environment = {
  youtubeApiKey: 'YOUR_RESTRICTED_API_KEY',
  youtubeHandle: '@your-channel-handle',
};
```

If the `environments` folder doesn't exist, generate it with `ng generate environments`.

> **Note:** anything in an Angular bundle is public. Use a key restricted to the **YouTube Data API v3** and to your own sites (HTTP referrers, including `http://localhost:4200/*` and your production domain). Never put a real secret, such as a private token, in these files.

### Getting a YouTube API key

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com).
2. Enable **YouTube Data API v3**.
3. Create an API key under **Credentials**.
4. Restrict the key by **HTTP referrer** and by **API** (YouTube Data API v3 only).

### GitHub activity

`src/app/github.service.ts` reads public events for the username set in that file. Change the `username` value to use a different account. No token is needed for public activity (the unauthenticated limit is 60 requests per hour per IP).

### Search content

Searchable items live in the `items` array in `src/app/search.service.ts`. Add an entry (title, description, url, tags) for each project or page you want to be searchable.

## Project structure

```text
src/
├── app/
│   ├── app.component.*            # Shell: header, sidebar, panel, carousel, router outlet
│   ├── app.routes.ts              # Routes: / and /search
│   ├── home/                      # Home page: hero and Work section
│   ├── search/                    # Search results page
│   ├── search.service.ts          # Client-side search index and scoring
│   ├── github.service.ts          # GitHub activity (REST API)
│   ├── github-activity.component.ts
│   ├── youtube.service.ts         # Latest videos (YouTube Data API)
│   └── youtube-videos.component.ts
├── assets/                        # Images and icons
├── environments/                  # API key and channel handle
└── styles.css                     # Global styles
```

## Scripts

| Command | What it does |
| --- | --- |
| `ng serve` | Start the dev server at `localhost:4200` |
| `ng build` | Production build into `dist/` |
| `ng test` | Run unit tests |

## Deployment (Vercel)

The site is deployed as a static single-page app.

1. Push the repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repo (the Angular preset is detected automatically).
3. Use `npm run build` as the build command. The output directory is the folder containing `index.html` (normally `dist/<project-name>/browser`).
4. Keep `vercel.json` in the project root so page refreshes on routes like `/search` work:

   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

5. Add your production URL (for example `https://your-project.vercel.app/*`) to the YouTube API key's allowed referrers.

Server-side rendering is turned off for this deployment.

## Roadmap

- Replace the static search index with a larger one (or a library such as Fuse.js)
- Add unit tests for `SearchService`
- Add the account/profile menu from the original search page

## Connect

- GitHub: <https://github.com/optimuswave386>
- YouTube: <https://www.youtube.com/@Asad-b8c2i>

