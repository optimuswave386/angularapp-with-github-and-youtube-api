   import 'dotenv/config';
   import { mkdirSync, writeFileSync } from 'node:fs';

   const content = `export const environment = {
     youtubeApiKey: '${process.env.YOUTUBE_API_KEY ?? ''}',
     youtubeHandle: '${process.env.YOUTUBE_HANDLE ?? ''}',
   };
   `;

   mkdirSync('src/environments', { recursive: true });
   writeFileSync('src/environments/environment.ts', content);
   writeFileSync('src/environments/environment.development.ts', content);