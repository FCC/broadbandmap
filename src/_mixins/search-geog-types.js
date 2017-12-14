export default {
  data () {
    return {
      searchLabel: '',
      placeholderText: '',
      searchOptsList: {},
      searchType: '',
      searchTypes: {
        location: {
          'Address': {
            'label': 'Address',
            'placeholderText': 'Enter address'
          },
          'Coordinates': {
            'label': 'Coordinates',
            'tooltipText': 'Enter latitude, longitude (in degrees decimal format)',
            'placeholderText': 'Enter coordinates'
          }
        },
        comparison: {
          'State': {
            'label': 'State',
            'placeholderText': 'Enter state'
          },
          'County': {
            'label': 'County',
            'placeholderText': 'Enter county'
          },
          'Congressional District': {
            'label': 'District',
            'placeholderText': 'Enter congressional district'
          },
          'Census Place': {
            'label': 'Census Place',
            'placeholderText': 'Enter town or city'
          },
          'Tribal Area': {
            'label': 'Tribal Area',
            'placeholderText': 'Enter tribal area'
          },
          'CBSA (MSA)': {
            'label': 'CBSA',
            'placeholderText': 'Enter CBSA (MSA)'
          }
        }
      }
    }
  }
}
