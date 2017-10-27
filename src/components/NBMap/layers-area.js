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
    deploymentFixed: {
      type: 'raster',
      tiles: [
        'https://geo.fcc.gov/fcc/gwc/service/wms?tiled=true&service=WMS&request=GetMap&layers=bpr_apr2017_county_layer_fixed&styles=bpr_layer_fixed_1&format=image%2Fpng&transparent=true&version=1.1.1&color=%236CBCD5&height=256&width=256&bbox={bbox-epsg-3857}&srs=EPSG%3A3857'
      ],
      tileSize: 256
    },
    deploymentNoFixed: {
      type: 'raster',
      tiles: [
        'https://geo.fcc.gov/fcc/gwc/service/wms?tiled=true&service=WMS&request=GetMap&layers=bpr_apr2017_county_layer_nonfixed&styles=bpr_layer_fixed_0&format=image%2Fpng&transparent=true&version=1.1.1&color=%236CBCD5&height=256&width=256&bbox={bbox-epsg-3857}&srs=EPSG%3A3857'
      ],
      tileSize: 256
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
    },
    {
      id: 'deploymentFixed',
      type: 'raster',
      source: 'deploymentFixed',
      layout: {
        visibility: 'visible'
      },
      paint: {}
    },
    {
      id: 'deploymentNoFixed',
      type: 'raster',
      source: 'deploymentNoFixed',
      layout: {
        visibility: 'visible'
      },
      paint: {}
    }
  ]
}
