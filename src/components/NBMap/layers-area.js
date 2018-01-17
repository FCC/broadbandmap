// This file is used by the Area Summary page

import { LayersCartographic } from './layers-cartographic.js'

export const LayersArea = [
  ...LayersCartographic,

  {
    id: 'place-highlighted',
    source: {
      type: 'vector',
      url: 'mapbox://fcc.v1_place'
    },
    type: 'line',
    'source-layer': 'place_2016geojson',
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
    id: 'cd-highlighted',
    source: {
      type: 'vector',
      url: 'mapbox://fcc.v1_cd115'
    },
    type: 'line',
    'source-layer': 'cd115_2016geojson',
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
    id: 'tribal-highlighted',
    source: {
      type: 'vector',
      url: 'mapbox://fcc.v1_tribal'
    },
    type: 'line',
    'source-layer': 'tribal_2016geojson',
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
      url: 'mapbox://fcc.v1_cbsa'
    },
    type: 'line',
    'source-layer': 'cbsa_2016geojson',
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
