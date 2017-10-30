// This file is used by the Location Summary page

// Include the base layers
import {baseSources, baseLayers} from './layers-base.js'

export default {
  version: 8,
  name: 'Basic',
  metadata: {
    'mapbox:autocomposite': true
  },
  sources: {
    ...baseSources,
    block: {
      type: 'vector',
      url: 'mapbox://fcc.9tcqhtt6'
    },
    tract: {
      type: 'vector',
      url: 'mapbox://fcc.1oj9ffcg'
    },
    county: {
      type: 'vector',
      url: 'mapbox://fcc.ao2kqazm'
    },
    state: {
      type: 'vector',
      url: 'mapbox://fcc.1r5um5ls'
    },
    place: {
      type: 'vector',
      url: 'mapbox://fcc.6pgpraox'
    }
  },
  sprite: 'mapbox://sprites/mapbox/basic-v8',
  glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
  layers: [
    ...baseLayers,
    {
      id: 'block',
      type: 'fill',
      source: 'block',
      'source-layer': 'nbm2_block2010geojson',
      layout: {
        visibility: 'visible'
      },
      paint: {
        'fill-outline-color': '#484896',
        'fill-color': '#ffffff',
        'fill-opacity': 0.5
      }
    },
    {
      id: 'block-highlighted',
      type: 'fill',
      source: 'block',
      'source-layer': 'nbm2_block2010geojson',
      paint: {
        'fill-outline-color': '#484896',
        'fill-color': '#6e599f',
        'fill-opacity': 0.75
      },
      'filter': ['in', 'bbox_arr', '']
    },
    {
      id: 'tract',
      type: 'line',
      source: 'tract',
      'source-layer': 'nbm2_tract2016geojson',
      layout: {
        visibility: 'visible'
      },
      paint: {
        'line-color': '#2a3463'
      }
    },
    {
      id: 'county',
      type: 'line',
      source: 'county',
      'source-layer': 'nbm2_county2016geojson',
      layout: {
        visibility: 'visible'
      },
      paint: {
        'line-color': '#74994e'
      }
    },
    {
      id: 'state',
      type: 'line',
      source: 'state',
      'source-layer': 'nbm2_state2016geojson',
      layout: {
        visibility: 'visible'
      },
      paint: {
        'line-color': '#a9b55c'
      }
    },
    {
      id: 'place',
      type: 'line',
      source: 'place',
      'source-layer': 'nbm2_place2016geojson',
      layout: {
        visibility: 'visible'
      },
      paint: {
        'line-color': '#8c9651'
      }
    }
  ]
}
