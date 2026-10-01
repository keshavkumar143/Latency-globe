import { EXTERNAL_URLS } from './externalUrls';

/**
 * Basemaps for the globe. Tiles stream in as you zoom, down to street level. Each style
 * needs its attribution shown on screen.
 */
export const MAP_STYLES = Object.freeze({
  satellite: {
    id: 'satellite',
    label: 'Satellite',
    tileUrl: EXTERNAL_URLS.esriImageryTile,
    maxLevel: 18,
    atmosphereColor: '#6cb8ff',
    attribution: 'Imagery: Esri, Vantor, Earthstar Geographics, and the GIS User Community',
  },
  dark: {
    id: 'dark',
    label: 'Dark',
    tileUrl: EXTERNAL_URLS.esriDarkGrayTile,
    maxLevel: 16,
    atmosphereColor: '#3b82f6',
    attribution: 'Esri, HERE, Garmin, © OpenStreetMap contributors, and the GIS user community',
  },
  streets: {
    id: 'streets',
    label: 'Streets',
    tileUrl: EXTERNAL_URLS.esriStreetTile,
    maxLevel: 18,
    atmosphereColor: '#93c5fd',
    attribution: 'Esri, HERE, Garmin, USGS, © OpenStreetMap contributors, and the GIS user community',
  },
});

export const DEFAULT_MAP_STYLE_ID = MAP_STYLES.satellite.id;
export const MAP_STYLE_STORAGE_KEY = 'pingatlas:map-style';
