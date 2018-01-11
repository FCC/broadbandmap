export const sourcesTechSpeed = [
  {
    id: '200',
    url: 'mapbox://fcc.3mn2ckcc',
    type: 'vector'
  },
  {
    id: '4_1',
    url: 'mapbox://fcc.5p7gp0op',
    type: 'vector'
  },
  {
    id: '10_1',
    url: 'mapbox://fcc.97d0gam3',
    type: 'vector'
  },
  {
    id: '25_3',
    url: 'mapbox://fcc.4ai93o1d',
    type: 'vector'
  },

  {
    id: '100_10',
    url: 'mapbox://fcc.btj2xg09',
    type: 'vector'
  },
  {
    id: '250_25',
    url: 'mapbox://fcc.7vjqng1m',
    type: 'vector'
  },
  {
    id: '1000_100',
    url: 'mapbox://fcc.4tg286y5',
    type: 'vector'
  }
]

export const layersTechSpeed = {
  '200': {
    id: 'jun16_10feb17_200',
    source: '200',
    beforeLayer: 'county'
  },
  '4': {
    id: 'jun16_10feb17_4',
    source: '4_1',
    beforeLayer: 'county'
  },
  '10': {
    id: 'jun16_10feb17_10',
    source: '10_1',
    beforeLayer: 'county'
  },
  '25': {
    id: 'jun16_10feb17_25',
    source: '25_3',
    beforeLayer: 'county'
  },

  '100': {
    id: 'jun16_10feb17_100',
    source: '100_10',
    beforeLayer: 'county'
  },
  '250': {
    id: 'jun16_10feb17_250',
    source: '250_25',
    beforeLayer: 'county'
  },
  '1000': {
    id: 'jun16_10feb17_1000',
    source: '1000_100',
    beforeLayer: 'county'
  }
}
