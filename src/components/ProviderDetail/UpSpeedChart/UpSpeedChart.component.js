import { Bar } from 'vue-chartjs'

export default {
  name: 'UpSpeedChart',
  components: { },
  props: ['data', 'providers'],
  extends: Bar,
  mounted () {
    const chartColors = {
      0: process.env.CHART_COLOR_01,
      1: process.env.CHART_COLOR_02,
      2: process.env.CHART_COLOR_03
    }

    const providers = this.providers

    let backgroundColors = []
    let hoverBackgroundColor = []

    this.data.forEach(d => {
      let providerIndx = providers.indexOf(d.label)

      backgroundColors.push(chartColors[providerIndx])
      hoverBackgroundColor.push(chartColors[providerIndx])
    })

    let chartData = {
      labels: ['any', '1', '3', '10', '25', '100', '250', '500', '1000'],
      datasets: []
    }

    // merge the prop data array with chartData.datasets
    for (let i = 0; i < this.data.length; i++) {
      chartData.datasets[i] = {}
      chartData.datasets[i]['backgroundColor'] = backgroundColors[i]
      chartData.datasets[i]['hoverBackgroundColor'] = hoverBackgroundColor[i]

      chartData.datasets[i] = Object.assign(chartData.datasets[i], this.data[i])
    }

    this.renderChart(chartData, this.options)
  },
  data () {
    return {
      options: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            boxWidth: 20
          }
        },
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          xAxes: [{
            categoryPercentage: 0.8,
            barPercentage: 0.9,
            stacked: false,
            scaleLabel: {
              display: true,
              labelString: 'Speed'
            },
            ticks: {
              fontStyle: 'bold'
            }
          }],
          yAxes: [{
            stacked: false,
            scaleLabel: {
              display: true,
              labelString: 'Percentage'
            },
            ticks: {
              fontStyle: 'bold',
              beginAtZero: true
            },
            gridLines: {
              display: true
            }
          }]
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItems, data) {
              let decimal2 = (tooltipItems.yLabel).toFixed(2)
              let decimal4 = (tooltipItems.yLabel).toFixed(4)
              let percentage = (parseFloat(decimal2) <= 0.00) ? decimal4 : decimal2

              return data.datasets[tooltipItems.datasetIndex].label + ': ' + percentage + '%'
            }
          }
        }
      }
    }
  }
}
