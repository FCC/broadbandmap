// This file is used by the Location Summary page
import { LayersCartographic } from './layers-cartographic.js'

let [...layersCarto] = LayersCartographic

export const LayersLocation = [
  ...layersCarto,
  {
    id: 'xlarge-blocks-highlighted',
    source: {
      type: 'vector',
      url: 'mapbox://fcc.xlarge_blocks'
    },
    type: 'line',
    'source-layer': 'xlarge_blocks',
    layout: {
      visibility: 'visible'
    },
    paint: {
      'line-color': '#dd1ee4',
      'line-width': 4
    },
    'filter': ['in', 'geoid10', '']
  },
  {
    id: 'block-highlighted',
    source: {
      type: 'vector',
      url: 'mapbox://fcc.9tcqhtt6'
    },
    type: 'line',
    'source-layer': 'nbm2_block2010geojson',
    layout: {
      visibility: 'visible'
    },
    paint: {
      'line-color': '#dd1ee4',
      'line-width': 4
    },
    'filter': ['in', 'block_fips', '']
  }
]
