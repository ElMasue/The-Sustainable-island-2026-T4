# Where to put images and SVGs

Use **one** of these depending on how you use the file:

## 1. `public/` – fixed URLs (e.g. map pins, Leaflet icons)

- **`Frontend/public/images/`** – PNG, JPG, etc.
- **`Frontend/public/icons/`** – SVGs or icons used by URL

Files here are served at the site root. Reference them with a leading slash:

- `public/icons/water-pin.svg` → use **`/icons/water-pin.svg`** in code
- `public/images/logo.png` → use **`/images/logo.png`**

**Use for:** Leaflet marker icons, `<img src="...">`, or any place that needs a string URL.

Example in `Map.tsx`:

```ts
const fountainIcon = new Icon({
  iconUrl: '/icons/water-pin.svg',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  // ...
});
```

---

## 2. `src/assets/` – import in components

- **`Frontend/src/assets/images/`** – photos, illustrations
- **`Frontend/src/assets/icons/`** – SVGs you import in React

Import in your component; Vite will bundle and hash the file:

```tsx
import pinIcon from '../assets/icons/water-pin.svg';
import logo from '../assets/images/logo.png';

// Use in Leaflet
iconUrl: pinIcon

// Use in JSX
<img src={logo} alt="Logo" />
```

**Use for:** Icons and images that are part of your component tree and benefit from cache-busting and bundling.

---

## Summary

| Need | Put file in | Use in code |
|------|-------------|-------------|
| Map pin / marker icon (URL string) | `public/icons/` | `'/icons/water-pin.svg'` |
| Other static images by URL | `public/images/` | `'/images/photo.jpg'` |
| Icons or images imported in components | `src/assets/icons/` or `src/assets/images/` | `import x from '../assets/icons/x.svg'` |
