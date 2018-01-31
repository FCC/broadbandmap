export const sourcesTechSpeed = [
  {
    id: '200',
    url: 'mapbox://fcc.d16_v1_200',
    type: 'vector'
  },
  {
    id: '4_1',
    url: 'mapbox://fcc.d16_v1_4',
    type: 'vector'
  },
  {
    id: '10_1',
    url: 'mapbox://fcc.d16_v1_10',
    type: 'vector'
  },
  {
    id: '25_3',
    url: 'mapbox://fcc.d16_v1_25',
    type: 'vector'
  },

  {
    id: '100_10',
    url: 'mapbox://fcc.d16_v1_100',
    type: 'vector'
  },
  {
    id: '250_25',
    url: 'mapbox://fcc.d16_v1_250',
    type: 'vector'
  },
  {
    id: '1000_100',
    url: 'mapbox://fcc.d16_v1_1000',
    type: 'vector'
  }
]

export const layersTechSpeed = {
  '200': {
    id: 'dec2016_7nov17_200',
    source: '200',
    beforeLayer: 'county'
  },
  '4': {
    id: 'dec2016_7nov17_4',
    source: '4_1',
    beforeLayer: 'county'
  },
  '10': {
    id: 'dec2016_7nov17_10',
    source: '10_1',
    beforeLayer: 'county'
  },
  '25': {
    id: 'dec2016_7nov17_25',
    source: '25_3',
    beforeLayer: 'county'
  },

  '100': {
    id: 'dec2016_7nov17_100',
    source: '100_10',
    beforeLayer: 'county'
  },
  '250': {
    id: 'dec2016_7nov17_250',
    source: '250_25',
    beforeLayer: 'county'
  },
  '1000': {
    id: 'dec2016_7nov17_1000',
    source: '1000_100',
    beforeLayer: 'county'
  }
}
