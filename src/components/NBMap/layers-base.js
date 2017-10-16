export const baseSources = {
  default: {
    type: 'raster',
    url: 'mapbox://mapbox.dark',
    tileSize: 256
  },
  street: {
    type: 'raster',
    url: 'mapbox://fcc.k74ed5ge',
    tileSize: 256
  },
  satellite: {
    type: 'raster',
    url: 'mapbox://mapbox.satellite',
    tileSize: 256
  }
}

export const baseLayers = [
  {
    id: 'default',
    type: 'raster',
    source: 'default',
    layout: {
      visibility: 'visible'
    }
  },
  {
    id: 'street',
    type: 'raster',
    source: 'street',
    layout: {
      visibility: 'none'
    }
  },
  {
    id: 'satellite',
    type: 'raster',
    source: 'satellite',
    layout: {
      visibility: 'none'
    }
  }
]
