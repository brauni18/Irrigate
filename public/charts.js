// Only declare if not already declared
if (typeof IrrigationCharts === 'undefined') {
  // Charts and Data Visualization
  class IrrigationCharts {
    constructor() {
      this.charts = {};
      this.initializeCharts();
      this.loadData();
    }

    initializeCharts() {
      // Set Chart.js defaults for dark theme
      Chart.defaults.color = '#ffffff';
      Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
      Chart.defaults.backgroundColor = 'rgba(102, 194, 255, 0.1)';

      this.createWaterUsageChart();
      this.createPerformanceChart();
      this.createWeatherChart();
    }

    createWaterUsageChart() {
      const ctx = document.getElementById('waterUsageChart').getContext('2d');
      
      this.charts.waterUsage = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Water Usage (L)',
            data: [45, 52, 38, 61, 48, 55, 42],
            borderColor: 'rgba(102, 194, 255, 1)',
            backgroundColor: 'rgba(102, 194, 255, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgba(102, 194, 255, 1)',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                callback: function(value) {
                  return value + 'L';
                }
              }
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          },
          elements: {
            point: {
              hoverBackgroundColor: 'rgba(102, 194, 255, 1)'
            }
          }
        }
      });
    }

    createPerformanceChart() {
      const ctx = document.getElementById('performanceChart').getContext('2d');
      
      this.charts.performance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Line 1', 'Line 2', 'Line 3', 'Line 4'],
          datasets: [{
            data: [25, 35, 20, 30],
            backgroundColor: [
              'rgba(102, 194, 255, 0.8)',
              'rgba(40, 167, 69, 0.8)',
              'rgba(255, 193, 7, 0.8)',
              'rgba(220, 53, 69, 0.8)'
            ],
            borderColor: [
              'rgba(102, 194, 255, 1)',
              'rgba(40, 167, 69, 1)',
              'rgba(255, 193, 7, 1)',
              'rgba(220, 53, 69, 1)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true
              }
            }
          }
        }
      });
    }

    createWeatherChart() {
      const ctx = document.getElementById('weatherChart').getContext('2d');
      
      this.charts.weather = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Rainfall (mm)',
            data: [0, 2, 0, 15, 8, 0, 3],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          }, {
            label: 'Temperature (°C)',
            data: [22, 24, 26, 20, 23, 25, 24],
            type: 'line',
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            yAxisID: 'y1'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                callback: function(value) {
                  return value + 'mm';
                }
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              grid: {
                drawOnChartArea: false,
              },
              ticks: {
                callback: function(value) {
                  return value + '°C';
                }
              }
            }
          }
        }
      });
    }

    loadData() {
      // Update quick stats
      this.updateQuickStats();
      
      // Set up period buttons for water usage chart
      this.setupPeriodButtons();
    }

    updateQuickStats() {
      // Sample data - replace with actual API calls
      document.getElementById('totalWaterToday').textContent = '127L';
      document.getElementById('totalTimeToday').textContent = '85min';
      document.getElementById('completedSessions').textContent = '6';
      document.getElementById('avgTemperature').textContent = '24°C';
    }

    setupPeriodButtons() {
      const buttons = document.querySelectorAll('[data-period]');
      buttons.forEach(button => {
        button.addEventListener('click', (e) => {
          // Remove active class from all buttons
          buttons.forEach(btn => btn.classList.remove('active'));
          // Add active class to clicked button
          e.target.classList.add('active');
          
          // Update chart data based on period
          const period = e.target.dataset.period;
          this.updateWaterUsageChart(period);
        });
      });
    }

    updateWaterUsageChart(period) {
      let newData, newLabels;
      
      if (period === '30d') {
        newLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        newData = [280, 310, 275, 295];
      } else {
        newLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        newData = [45, 52, 38, 61, 48, 55, 42];
      }
      
      this.charts.waterUsage.data.labels = newLabels;
      this.charts.waterUsage.data.datasets[0].data = newData;
      this.charts.waterUsage.update();
    }
  }

  window.IrrigationCharts = IrrigationCharts;
}

// Only initialize if not already done
if (!window.chartsInitialized) {
  // Initialize charts when page loads
  document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for components to load
    setTimeout(() => {
      new IrrigationCharts();
    }, 500);
  });
  
  window.chartsInitialized = true;
}