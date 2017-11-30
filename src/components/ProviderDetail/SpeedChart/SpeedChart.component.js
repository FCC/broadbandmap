import VueCharts from 'vue-chartjs'
import { Bar } from 'vue-chartjs'

export default {
  name: 'PopulationChart',
  components: { },
  props: ['data'],
  extends: Bar,
  mounted () {
    let chartData = {
      labels: ['any', '10', '20', '30', '40', '50', '100'],
      datasets: [{
        backgroundColor: '#ff848b'
      }, {
        backgroundColor: '#838eff'
      }, {
        backgroundColor: '#ffff95'
      }]
    }

    // merge the prop data array with chartData.datasets
    for (let i = 0; i < this.data.length; i++) {
      chartData.datasets[i] = Object.assign(chartData.datasets[i], this.data[i])
    }

    this.renderChart(chartData, this.options)
  },
  data () {
    return {
      options: {
        legend: {
          display: true
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
            }
          }],
          yAxes: [{
            stacked: false,
            scaleLabel: {
              display: true,
              labelString: 'Percentage'
            },
            ticks: {
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
              return data.datasets[tooltipItems.datasetIndex].label + ': ' + tooltipItems.yLabel + '%'
            }
          }
        }
      }
    }
  }
}
