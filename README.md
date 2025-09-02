# Të ardhura & Shpenzime (PWA)

App React (Vite) për të ardhura/shpenzime me nënkategori, grafiqe, PWA offline, eksport PDF dhe backup JSON.

## Nisja lokale
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy në GitHub Pages
1. Ndrysho `base` te `vite.config.js` që të përputhet me emrin e repos, p.sh. `/te-ardhura-shpenzime/`.
2. Shto remote, bëj push.
3. `npm run deploy` (përdor `gh-pages` për të publikuar `dist/`).

**PWA**: `sw.js` dhe `manifest.webmanifest` janë gati. Kërkon HTTPS ose `localhost`.
