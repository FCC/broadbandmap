// This file is used by the Location Summary page
import { LayersCartographic } from './layers-cartographic.js'

let [...layersCarto] = LayersCartographic

export const LayersLocation = [
  ...layersCarto,
  {
    id: 'xlarge-blocks-highlighted',
    source: {
      type: 'vector',
      url: 'mapbox://fcc.v1_xl_blocks'
    },
    type: 'line',
    'source-layer': 'xl_blocks_2010',
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
      url: 'mapbox://fcc.v1_block'
    },
    type: 'line',
    'source-layer': 'block_2010',
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
