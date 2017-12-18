// This file is used by the Location Summary page
import { LayersCartographic } from './layers-cartographic.js'

let [blockLayer, ...layersCarto] = LayersCartographic

export const LayersLocation = [
  blockLayer,
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
      'line-color': '#6e599f',
      'line-width': 7
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
      'line-color': '#6e599f',
      'line-width': 7
    },
    'filter': ['in', 'bbox_arr', '']
  },
  ...layersCarto
]
