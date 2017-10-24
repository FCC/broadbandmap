import {baseSources, baseLayers} from './layers-base.js'

export default {
  version: 8,
  name: 'Basic',
  metadata: {
    'mapbox:autocomposite': true
  },
  sources: {
    ...baseSources,
    state: {
      type: 'vector',
      url: 'mapbox://fcc.1r5um5ls'
    },
    county: {
      type: 'vector',
      url: 'mapbox://fcc.ao2kqazm'
    },
    block: {
      type: 'vector',
      url: 'mapbox://fcc.9tcqhtt6'
    },
    tract: {
      type: 'vector',
      url: 'mapbox://fcc.1oj9ffcg'
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
      id: 'block',
      type: 'line',
      source: 'block',
      'source-layer': 'block2010geojson',
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
