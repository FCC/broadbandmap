// Common layer styles (geography outline) for block, tract, county, and state
// Used by Location and Area Summary maps

export const LayersCartographic = [
  {
    id: 'county',
    source: {
      type: 'vector',
      url: 'mapbox://fcc.v1_county_carto'
    },
    type: 'line',
    'source-layer': 'county_carto_2016',
    layout: {
      visibility: 'visible'
    },
    paint: {
      'line-color': '#74994e'
    },
    maxzoom: 9,
    minzoom: 6
  },
  {
    id: 'county-highlighted',
    source: {
      type: 'vector',
      url: 'mapbox://fcc.v1_county_carto'
    },
    type: 'line',
    'source-layer': 'county_carto_2016',
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
      url: 'mapbox://fcc.v1_state'
    },
    type: 'line',
    'source-layer': 'state_2016geojson',
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
      url: 'mapbox://fcc.v1_state'
    },
    type: 'line',
    'source-layer': 'state_2016geojson',
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
