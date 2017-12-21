// This file is used by the Area Summary page

import { LayersCartographic } from './layers-cartographic.js'

export const LayersArea = [
  ...LayersCartographic,
  {
    id: 'place',
    source: {
      type: 'vector',
      url: 'mapbox://fcc.6pgpraox'
    },
    type: 'line',
    'source-layer': 'nbm2_place2016geojson',
    layout: {
      visibility: 'visible'
    },
    paint: {
      'line-color': '#8c9651'
    }
  },
  {
    id: 'place-highlighted',
    source: {
      type: 'vector',
      url: 'mapbox://fcc.6pgpraox'
    },
    type: 'line',
    'source-layer': 'nbm2_place2016geojson',
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
    id: 'cd',
    source: {
      type: 'vector',
      url: 'mapbox://fcc.dpum4fkf'
    },
    type: 'line',
    'source-layer': 'nbm2_cd115_2016geojson',
    layout: {
      visibility: 'visible'
    },
    paint: {
      'line-color': '#8c9651'
    }
  },
  {
    id: 'cd-highlighted',
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
    id: 'tribal',
    source: {
      type: 'vector',
      url: 'mapbox://fcc.26rqlqpa'
    },
    type: 'line',
    'source-layer': 'nbm2_tribe2016geojson',
    layout: {
      visibility: 'visible'
    },
    paint: {
      'line-color': '#8c9651'
    }
  },
  {
    id: 'tribal-highlighted',
    source: {
      type: 'vector',
      url: 'mapbox://fcc.26rqlqpa'
    },
    type: 'line',
    'source-layer': 'nbm2_tribe2016geojson',
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
    id: 'cbsa-highlighted',
    source: {
      type: 'vector',
      url: 'mapbox://fcc.a7r386t6'
    },
    type: 'line',
    'source-layer': 'nbm2_cbsa2016geojson',
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
