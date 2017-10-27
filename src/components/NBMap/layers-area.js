// This file is used by the Area Summary page

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
    }
  },
  sprite: 'mapbox://sprites/mapbox/basic-v8',
  glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
  layers: [
    ...baseLayers,
    {
      id: 'block',
      type: 'line',
      source: 'block',
      'source-layer': 'nbm2_block2010geojson',
      layout: {
        visibility: 'visible'
      },
      paint: {
        'line-color': '#48517c'
      }
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
    }
  ]
}
