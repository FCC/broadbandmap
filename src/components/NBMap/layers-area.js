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
    },
    state: {
      type: 'vector',
      url: 'mapbox://fcc.1r5um5ls'
    },
    place: {
      type: 'vector',
      url: 'mapbox://fcc.6pgpraox'
    },
    cd: {
      type: 'vector',
      url: 'mapbox://fcc.dpum4fkf'
    },
    tribe: {
      type: 'vector',
      url: 'mapbox://fcc.26rqlqpa'
    },
    cbsa: {
      type: 'vector',
      url: 'mapbox://fcc.a7r386t6'
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
      'source-layer': 'nbm2_tract2010geojson',
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
        visibility: 'none'
      },
      paint: {
        'line-color': '#8c9651'
      }
    },
    {
      id: 'cd',
      type: 'line',
      source: 'cd',
      'source-layer': 'nbm2_cd115_2016geojson',
      layout: {
        visibility: 'none'
      },
      paint: {
        'line-color': '#8c9651'
      }
    },
    {
      id: 'tribe',
      type: 'line',
      source: 'tribe',
      'source-layer': 'nbm2_tribe2016geojson',
      layout: {
        visibility: 'none'
      },
      paint: {
        'line-color': '#8c9651'
      }
    },
    {
      id: 'cbsa',
      type: 'line',
      source: 'cbsa',
      'source-layer': 'nbm2_cbsa2016geojson',
      layout: {
        visibility: 'none'
      },
      paint: {
        'line-color': '#ffffff'
      }
    }
  ]
}
