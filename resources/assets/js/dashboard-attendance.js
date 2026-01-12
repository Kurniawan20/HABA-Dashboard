/**
 * Dashboard Attendance - Charts and Data
 */

'use strict';

$(function () {
  // Chart colors
  let primaryColor = '#026443';
  let successColor = '#28a745';
  let warningColor = '#ff9f43';
  let dangerColor = '#ea5455';
  let infoColor = '#00cfe8';
  let labelColor = '#666';
  let borderColor = '#e7e7e8';

  // Update current date/time
  function updateDateTime() {
    var now = moment();
    $('#current-date').text(now.format('dddd, DD MMMM YYYY'));
    $('#current-time').text(now.format('HH:mm') + ' WIB');
  }
  updateDateTime();
  setInterval(updateDateTime, 60000);

  // ============================================
  // WEEKLY ATTENDANCE CHART (Line Chart)
  // ============================================
  var weeklyChartEl = document.querySelector('#weeklyAttendanceChart');
  if (weeklyChartEl) {
    var weeklyOptions = {
      series: [
        {
          name: 'Hadir',
          data: [140, 145, 138, 142, 148, 143, 145]
        },
        {
          name: 'Terlambat',
          data: [8, 5, 12, 7, 6, 8, 10]
        },
        {
          name: 'Tidak Hadir',
          data: [8, 6, 6, 7, 2, 5, 1]
        }
      ],
      chart: {
        height: 300,
        type: 'area',
        toolbar: { show: false },
        fontFamily: 'inherit'
      },
      colors: [primaryColor, warningColor, dangerColor],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 0.8,
          opacityFrom: 0.5,
          opacityTo: 0.1
        }
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      xaxis: {
        categories: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: labelColor }
        }
      },
      yaxis: {
        labels: {
          style: { colors: labelColor }
        }
      },
      grid: {
        borderColor: borderColor,
        strokeDashArray: 3
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        labels: { colors: labelColor }
      },
      tooltip: {
        shared: true,
        intersect: false
      }
    };
    var weeklyChart = new ApexCharts(weeklyChartEl, weeklyOptions);
    weeklyChart.render();
  }

  // ============================================
  // STATUS DISTRIBUTION CHART (Donut)
  // ============================================
  var statusChartEl = document.querySelector('#statusDistributionChart');
  if (statusChartEl) {
    var statusOptions = {
      series: [135, 8, 5],
      chart: {
        height: 250,
        type: 'donut'
      },
      colors: [primaryColor, warningColor, dangerColor],
      labels: ['Tepat Waktu', 'Terlambat', 'Tidak Hadir'],
      stroke: { width: 0 },
      dataLabels: { enabled: false },
      legend: { show: false },
      plotOptions: {
        pie: {
          donut: {
            size: '75%',
            labels: {
              show: true,
              name: {
                fontSize: '14px',
                fontFamily: 'inherit'
              },
              value: {
                fontSize: '24px',
                fontWeight: 600,
                fontFamily: 'inherit',
                formatter: function (val) {
                  return parseInt(val);
                }
              },
              total: {
                show: true,
                label: 'Total Hadir',
                fontSize: '12px',
                fontFamily: 'inherit',
                formatter: function (w) {
                  return w.globals.seriesTotals.reduce(function (a, b) { return a + b; }, 0);
                }
              }
            }
          }
        }
      }
    };
    var statusChart = new ApexCharts(statusChartEl, statusOptions);
    statusChart.render();
  }

  // ============================================
  // BRANCH ATTENDANCE CHART (Bar Chart)
  // ============================================
  var branchChartEl = document.querySelector('#branchAttendanceChart');
  if (branchChartEl) {
    var branchOptions = {
      series: [{
        name: 'Hadir',
        data: [45, 38, 32, 28]
      }],
      chart: {
        height: 300,
        type: 'bar',
        toolbar: { show: false },
        fontFamily: 'inherit'
      },
      colors: [primaryColor],
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
          barHeight: '60%',
          distributed: true
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val + ' orang';
        },
        style: {
          fontSize: '12px',
          colors: ['#fff']
        }
      },
      xaxis: {
        categories: ['Kantor Pusat', 'Cabang Jakarta', 'Cabang Surabaya', 'Cabang Bandung'],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: labelColor }
        }
      },
      yaxis: {
        labels: {
          style: { colors: labelColor }
        }
      },
      grid: {
        borderColor: borderColor,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } }
      },
      legend: { show: false },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + ' karyawan hadir';
          }
        }
      }
    };
    var branchChart = new ApexCharts(branchChartEl, branchOptions);
    branchChart.render();
  }

  // ============================================
  // RECENT ACTIVITY TIMELINE
  // ============================================
  var recentActivity = [
    { time: '08:45', name: 'Budi Santoso', action: 'Check-in', status: 'late', location: 'Cabang Jakarta' },
    { time: '08:30', name: 'Dewi Lestari', action: 'Check-in', status: 'ontime', location: 'Kantor Pusat' },
    { time: '08:25', name: 'Ahmad Rizki', action: 'Check-in', status: 'ontime', location: 'Cabang Surabaya' },
    { time: '08:15', name: 'Citra Dewi', action: 'Check-in', status: 'ontime', location: 'Kantor Pusat' },
    { time: '08:10', name: 'Eko Prasetyo', action: 'Check-in', status: 'ontime', location: 'Cabang Bandung' },
    { time: '17:30', name: 'Fajar Hidayat', action: 'Check-out', status: 'checkout', location: 'Kantor Pusat' }
  ];

  function renderTimeline() {
    var html = '';
    recentActivity.forEach(function (item, idx) {
      var iconClass = item.action === 'Check-out' ? 'ri-logout-box-line' : 'ri-login-box-line';
      var bgClass = item.status === 'late' ? 'bg-label-warning' : (item.action === 'Check-out' ? 'bg-label-info' : 'bg-label-primary');
      var timelineClass = idx % 2 === 0 ? 'timeline-item-left' : '';

      html += '<li class="timeline-item ' + timelineClass + '">' +
              '<span class="timeline-indicator ' + bgClass + '">' +
              '<i class="' + iconClass + '"></i>' +
              '</span>' +
              '<div class="timeline-event">' +
              '<div class="timeline-header">' +
              '<small class="text-primary fw-medium">' + item.time + '</small>' +
              '</div>' +
              '<h6 class="mb-1">' + item.name + '</h6>' +
              '<p class="mb-0"><small class="text-muted">' + item.action + ' - ' + item.location + '</small></p>' +
              '</div>' +
              '</li>';
    });
    $('#recentActivityTimeline').html(html);
  }
  renderTimeline();
});
