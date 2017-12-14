import VueCharts from 'vue-chartjs'
import { Bar } from 'vue-chartjs'

export default {
  name: 'StackedBarChart',
  components: { },
  props: ['data', 'xaxis'],
  extends: Bar,
  mounted () {
    let chartData = [{
      label: '0 providers',
      backgroundColor: '#e6eecf'
    },
    {
      label: '1 provider',
      backgroundColor: '#9bc4c1'
    },
    {
      label: '2 providers',
      backgroundColor: '#68a8b7'
    },
    {
      label: '3 or more providers',
      backgroundColor: '#2e557a'
    }]

    // Merge props 'data' with chartData labels and datasets
    chartData.forEach((chData, index) => {
      this.data.datasets[index].label = chData.label
      this.data.datasets[index].backgroundColor = chData.backgroundColor
    })

    if (this.xaxis) {
      this.options.scales.xAxes[0].scaleLabel.labelString = this.xaxis
    }

    this.renderChart(this.data, this.options)
  },
  data () {
    return {
      options: {
        legend: {
          display: false
        },
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          xAxes: [{
            barThickness: 50,
            stacked: true,
            scaleLabel: {
              display: true,
              labelString: 'Speed (Mbps downstream\\upstream)'
            }
          }],
          yAxes: [{
            stacked: true,
            scaleLabel: {
              display: true,
              labelString: 'Population Percentage'
            },
            gridLines: {
              display: true
            },
            ticks: {
              beginAtZero: true,
              max: 100
            }
          }]
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItems, data) {
              return data.datasets[tooltipItems.datasetIndex].label + ': ' + tooltipItems.yLabel + '%'
            }
          }
        }
      }
    }
  }
}
