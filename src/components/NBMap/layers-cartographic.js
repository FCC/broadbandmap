// Common layer styles (geography outline) for block, tract, county, and state
// Used by Location and Area Summary maps

export const LayersCartographic = [
  {
    id: 'county-highlighted',
    source: {
      type: 'vector',
      url: 'mapbox://fcc.ao2kqazm'
    },
    type: 'line',
    'source-layer': 'nbm2_county2016geojson',
    layout: {
      visibility: 'visible'
    },
    paint: {
      'line-color': '#dd1ee4',
      'line-width': 4
    },
    'filter': ['in', 'geoid', '']
  },
  {
    id: 'state',
    source: {
      type: 'vector',
      url: 'mapbox://fcc.1r5um5ls'
    },
    type: 'line',
    'source-layer': 'nbm2_state2016geojson',
    layout: {
      visibility: 'visible'
    },
    paint: {
      'line-color': '#a9b55c'
    },
    maxzoom: 9
  },
  {
    id: 'state-highlighted',
    source: {
      type: 'vector',
      url: 'mapbox://fcc.1r5um5ls'
    },
    type: 'line',
    'source-layer': 'nbm2_state2016geojson',
    layout: {
      visibility: 'visible'
    },
    paint: {
      'line-color': '#dd1ee4',
      'line-width': 4
    },
    'filter': ['in', 'geoid', '']
  }
]
