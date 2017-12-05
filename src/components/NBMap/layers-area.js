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
    id: 'tribe',
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
    id: 'cbsa',
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
      'line-color': '#ffffff'
    }
  }
]
