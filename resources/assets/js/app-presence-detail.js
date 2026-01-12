/**
 * Page Detail Kehadiran (Presence Detail)
 * With Real API Integration
 */

'use strict';

$(function () {
  var dt_presence_detail = $('.datatables-presence-detail');
  var map = null;
  var markers = [];
  var dt_detail = null;

  // API Base URL - Read from meta tag (configured in .env)
  var API_BASE_URL = $('meta[name="api-base-url"]').attr('content') || 'http://localhost:8080/api';
  var API_TOKEN = localStorage.getItem('api_token') || '';

  // Get NPP from URL query string
  var urlParams = new URLSearchParams(window.location.search);
  var currentNpp = urlParams.get('npp');

  // Current filter state
  var currentFilters = {
    start_date: moment().subtract(30, 'days').format('YYYY-MM-DD'),
    end_date: moment().format('YYYY-MM-DD')
  };

  // Store attendance data
  var attendanceData = [];

  // Status badge classes (Label Default style)
  var statusObj = {
    'ontime': { title: 'Tepat Waktu', class: 'bg-label-primary' },
    'late': { title: 'Terlambat', class: 'bg-label-warning' },
    'early': { title: 'Pulang Awal', class: 'bg-label-danger' },
    'absent': { title: 'Tidak Hadir', class: 'bg-label-secondary' },
    'complete': { title: 'Lengkap', class: 'bg-label-primary' },
    'checkin_only': { title: 'Masuk Saja', class: 'bg-label-warning' }
  };

  // Helper function to make API calls
  function apiCall(endpoint, method, data) {
    return $.ajax({
      url: API_BASE_URL + endpoint,
      method: method || 'GET',
      data: data,
      headers: {
        'Authorization': 'Bearer ' + API_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      beforeSend: function() {
        $('.datatables-presence-detail').addClass('opacity-50');
      },
      complete: function() {
        $('.datatables-presence-detail').removeClass('opacity-50');
      }
    });
  }

  // Fetch employee info
  function fetchEmployeeInfo() {
    if (!currentNpp) {
      showError('NPP tidak ditemukan di URL');
      return;
    }

    // Update page header with NPP
    $('#employee-npp').text(currentNpp);

    // Fetch employee details from users API
    apiCall('/users', 'GET', { npp: currentNpp })
      .done(function(response) {
        if (response.rcode === '00' && response.data && response.data.length > 0) {
          var employee = response.data[0];
          updateEmployeeInfo(employee);
        }
      })
      .fail(function() {
        // Use NPP as fallback
        $('#employee-name').text('Karyawan ' + currentNpp);
      });
  }

  // Update employee info display
  function updateEmployeeInfo(employee) {
    if (employee.nama) {
      $('#employee-name').text(employee.nama);
      var initials = employee.nama.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
      $('#employee-avatar').text(initials);
    }
    if (employee.email) {
      $('#employee-email').text(employee.email);
    }
    if (employee.kode_kantor || employee.nama_kantor) {
      $('#employee-branch').text(employee.nama_kantor || employee.kode_kantor);
    }
  }

  // Fetch attendance history
  function fetchAttendanceHistory() {
    if (!currentNpp) return;

    var queryParams = {
      npp: currentNpp,
      start_date: currentFilters.start_date,
      end_date: currentFilters.end_date,
      per_page: 100
    };

    apiCall('/presences', 'GET', queryParams)
      .done(function(response) {
        if (response.rcode === '00' && response.data) {
          var data = response.data.data || response.data;
          
          // Transform API data to match DataTable format
          attendanceData = data.map(function(item) {
            // Determine status
            var status = 'complete';
            var isLate = false;
            var isEarly = false;

            if (item.jam_masuk) {
              var checkinTime = formatTime(item.jam_masuk);
              isLate = checkinTime > '08:00';
            }
            if (item.jam_pulang) {
              var checkoutTime = formatTime(item.jam_pulang);
              isEarly = checkoutTime < '17:00';
            }

            if (item.jam_masuk && !item.jam_pulang) status = 'checkin_only';
            if (!item.jam_masuk && !item.jam_pulang) status = 'absent';
            if (isLate && item.jam_masuk) status = 'late';
            if (isEarly && item.jam_pulang && !isLate) status = 'early';
            if (!isLate && !isEarly && item.jam_masuk && item.jam_pulang) status = 'ontime';

            return {
              id: item.id,
              date: formatDate(item.tgl_absensi),
              checkin: item.jam_masuk ? formatTimeFromDatetime(item.jam_masuk) : null,
              checkout: item.jam_pulang ? formatTimeFromDatetime(item.jam_pulang) : null,
              duration: item.duration || calculateDuration(item.jam_masuk, item.jam_pulang),
              status: status,
              location: item.branch_id || item.nama_kantor || '-',
              checkin_lat: parseFloat(item.latitude) || null,
              checkin_lng: parseFloat(item.longitude) || null,
              checkout_lat: parseFloat(item.latitude) || null,
              checkout_lng: parseFloat(item.longitude) || null
            };
          });

          // Update DataTable
          dt_detail.clear().rows.add(attendanceData).draw();

          // Update summary statistics
          updateSummaryStats();

          // Auto-select first row
          setTimeout(function() {
            var firstRow = dt_presence_detail.find('tbody tr').first();
            if (firstRow.length) {
              firstRow.click();
            }
          }, 300);
        } else {
          loadSampleData();
        }
      })
      .fail(function() {
        console.log('API unavailable, loading sample data');
        loadSampleData();
      });
  }

  // Format date from API response
  function formatDate(dateStr) {
    if (!dateStr) return '-';
    if (dateStr.length === 8 && !dateStr.includes('-')) {
      return dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6) + '-' + dateStr.substring(6, 8);
    }
    if (dateStr.includes(' ')) {
      return dateStr.split(' ')[0];
    }
    return dateStr;
  }

  // Format time from datetime string
  function formatTimeFromDatetime(datetimeStr) {
    if (!datetimeStr) return null;
    if (datetimeStr.includes(' ')) {
      return datetimeStr.split(' ')[1];
    }
    return datetimeStr;
  }

  // Format time HH:mm
  function formatTime(datetimeStr) {
    if (!datetimeStr) return null;
    var time = formatTimeFromDatetime(datetimeStr);
    if (time) {
      return time.substring(0, 5);
    }
    return null;
  }

  // Calculate duration between check-in and check-out
  function calculateDuration(checkin, checkout) {
    if (!checkin || !checkout) return '-';
    var start = moment(checkin);
    var end = moment(checkout);
    var duration = moment.duration(end.diff(start));
    var hours = Math.floor(duration.asHours());
    var minutes = duration.minutes();
    return hours + 'h ' + (minutes < 10 ? '0' : '') + minutes + 'm';
  }

  // Update summary statistics
  function updateSummaryStats() {
    var total = attendanceData.length;
    var ontime = attendanceData.filter(function(d) { return d.status === 'ontime' || d.status === 'complete'; }).length;
    var late = attendanceData.filter(function(d) { return d.status === 'late'; }).length;
    var absent = attendanceData.filter(function(d) { return d.status === 'absent'; }).length;

    $('#stat-total-days').text(total);
    $('#stat-ontime').text(ontime);
    $('#stat-late').text(late);
    $('#stat-absent').text(absent);

    // Calculate average check-in time
    var checkinTimes = attendanceData.filter(function(d) { return d.checkin; }).map(function(d) {
      return moment(d.checkin, 'HH:mm:ss');
    });
    if (checkinTimes.length > 0) {
      var avgMinutes = checkinTimes.reduce(function(sum, t) {
        return sum + t.hours() * 60 + t.minutes();
      }, 0) / checkinTimes.length;
      var avgHours = Math.floor(avgMinutes / 60);
      var avgMins = Math.round(avgMinutes % 60);
      $('#stat-avg-checkin').text(avgHours + ':' + (avgMins < 10 ? '0' : '') + avgMins);
    }
  }

  // Load sample data as fallback
  function loadSampleData() {
    attendanceData = [
      { id: 1, date: '2024-01-15', checkin: '07:55:00', checkout: '17:05:00', duration: '9h 10m', status: 'ontime', location: 'Kantor Pusat', checkin_lat: -6.2088, checkin_lng: 106.8456, checkout_lat: -6.2088, checkout_lng: 106.8456 },
      { id: 2, date: '2024-01-14', checkin: '08:10:00', checkout: '17:00:00', duration: '8h 50m', status: 'late', location: 'Kantor Pusat', checkin_lat: -6.2090, checkin_lng: 106.8460, checkout_lat: -6.2088, checkout_lng: 106.8456 },
      { id: 3, date: '2024-01-13', checkin: '07:50:00', checkout: '17:15:00', duration: '9h 25m', status: 'ontime', location: 'Kantor Pusat', checkin_lat: -6.2085, checkin_lng: 106.8450, checkout_lat: -6.2088, checkout_lng: 106.8456 },
      { id: 4, date: '2024-01-12', checkin: '07:45:00', checkout: '16:30:00', duration: '8h 45m', status: 'early', location: 'Kantor Pusat', checkin_lat: -6.2088, checkin_lng: 106.8456, checkout_lat: -6.2100, checkout_lng: 106.8470 },
      { id: 5, date: '2024-01-11', checkin: '08:00:00', checkout: '17:00:00', duration: '9h 00m', status: 'ontime', location: 'Kantor Pusat', checkin_lat: -6.2088, checkin_lng: 106.8456, checkout_lat: -6.2088, checkout_lng: 106.8456 }
    ];
    dt_detail.clear().rows.add(attendanceData).draw();
    updateSummaryStats();
  }

  // Show error message
  function showError(message) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        customClass: { confirmButton: 'btn btn-primary' },
        buttonsStyling: false
      });
    }
  }

  // Initialize Leaflet map
  if ($('#locationMap').length && typeof L !== 'undefined') {
    map = L.map('locationMap').setView([-6.2088, 106.8456], 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  }

  // Function to update map with location
  function updateMap(data) {
    if (!map) return;
    
    // Clear existing markers
    markers.forEach(function(marker) {
      map.removeLayer(marker);
    });
    markers = [];

    if (!data.checkin_lat || !data.checkin_lng) {
      $('#map-selected-date').text('Tidak ada data lokasi');
      $('#map-checkin-info').text('-');
      $('#map-checkout-info').text('-');
      return;
    }

    // Update header
    $('#map-selected-date').text(moment(data.date).format('DD MMM YYYY'));

    // Add check-in marker (green)
    var checkinIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background-color: #28a745; color: white; padding: 5px 10px; border-radius: 20px; font-size: 12px; white-space: nowrap;"><i class="ri-login-box-line"></i> Check-in ' + moment(data.checkin, 'HH:mm:ss').format('HH:mm') + '</div>',
      iconSize: [100, 30],
      iconAnchor: [50, 30]
    });
    
    var checkinMarker = L.marker([data.checkin_lat, data.checkin_lng], { icon: checkinIcon }).addTo(map);
    checkinMarker.bindPopup('<b>Check-in</b><br>Waktu: ' + moment(data.checkin, 'HH:mm:ss').format('HH:mm') + '<br>Lokasi: ' + data.location);
    markers.push(checkinMarker);
    
    $('#map-checkin-info').text(data.checkin_lat.toFixed(6) + ', ' + data.checkin_lng.toFixed(6));

    // Add check-out marker (blue) if exists
    if (data.checkout_lat && data.checkout_lng && data.checkout) {
      var checkoutIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color: #17a2b8; color: white; padding: 5px 10px; border-radius: 20px; font-size: 12px; white-space: nowrap;"><i class="ri-logout-box-line"></i> Check-out ' + moment(data.checkout, 'HH:mm:ss').format('HH:mm') + '</div>',
        iconSize: [100, 30],
        iconAnchor: [50, 30]
      });
      
      var checkoutMarker = L.marker([data.checkout_lat, data.checkout_lng], { icon: checkoutIcon }).addTo(map);
      checkoutMarker.bindPopup('<b>Check-out</b><br>Waktu: ' + moment(data.checkout, 'HH:mm:ss').format('HH:mm') + '<br>Lokasi: ' + data.location);
      markers.push(checkoutMarker);
      
      $('#map-checkout-info').text(data.checkout_lat.toFixed(6) + ', ' + data.checkout_lng.toFixed(6));
    } else {
      $('#map-checkout-info').text('-');
    }

    // Fit map to show all markers
    if (markers.length > 0) {
      var group = new L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.5));
    }
  }

  // Initialize date range picker
  if ($('.flatpickr-range').length) {
    $('.flatpickr-range').flatpickr({
      mode: 'range',
      dateFormat: 'Y-m-d',
      defaultDate: [currentFilters.start_date, currentFilters.end_date],
      locale: {
        rangeSeparator: ' s/d '
      },
      onClose: function (selectedDates) {
        if (selectedDates[0]) {
          currentFilters.start_date = moment(selectedDates[0]).format('YYYY-MM-DD');
        }
        if (selectedDates[1]) {
          currentFilters.end_date = moment(selectedDates[1]).format('YYYY-MM-DD');
        }
        fetchAttendanceHistory();
      }
    });
  }

  // Initialize DataTable
  if (dt_presence_detail.length) {
    dt_detail = dt_presence_detail.DataTable({
      data: [],
      columns: [
        { data: '' },
        { data: 'date' },
        { data: 'checkin' },
        { data: 'checkout' },
        { data: 'duration' },
        { data: 'status' },
        { data: 'location' }
      ],
      columnDefs: [
        {
          className: 'control',
          orderable: false,
          targets: 0,
          render: function () { return ''; }
        },
        {
          targets: 1,
          render: function (data) {
            return '<span class="fw-medium">' + moment(data).format('ddd, DD MMM YYYY') + '</span>';
          }
        },
        {
          targets: 2,
          render: function (data) {
            if (!data) return '<span class="text-muted">-</span>';
            var time = moment(data, 'HH:mm:ss').format('HH:mm');
            var isLate = moment(data, 'HH:mm:ss').isAfter(moment('08:00:00', 'HH:mm:ss'));
            var colorClass = isLate ? 'text-warning' : 'text-success';
            return '<span class="' + colorClass + '"><i class="ri-login-box-line me-1"></i>' + time + '</span>';
          }
        },
        {
          targets: 3,
          render: function (data) {
            if (!data) return '<span class="text-muted">-</span>';
            var time = moment(data, 'HH:mm:ss').format('HH:mm');
            var isEarly = moment(data, 'HH:mm:ss').isBefore(moment('17:00:00', 'HH:mm:ss'));
            var colorClass = isEarly ? 'text-danger' : 'text-info';
            return '<span class="' + colorClass + '"><i class="ri-logout-box-line me-1"></i>' + time + '</span>';
          }
        },
        {
          targets: 4,
          render: function (data) {
            if (data === '-') return '<span class="text-muted">-</span>';
            return '<span class="text-heading">' + data + '</span>';
          }
        },
        {
          targets: 5,
          render: function (data) {
            var status = statusObj[data] || { title: data, class: 'bg-label-secondary' };
            return '<span class="badge ' + status.class + '">' + status.title + '</span>';
          }
        },
        {
          targets: 6,
          render: function (data) {
            if (data === '-') return '<span class="text-muted">-</span>';
            return '<span><i class="ri-map-pin-line me-1"></i>' + data + '</span>';
          }
        }
      ],
      order: [[1, 'desc']],
      dom: "<'row'<'col-sm-12'tr>><'row'<'col-sm-12 col-md-6'i><'col-sm-12 col-md-6 dataTables_pager'p>>",
      language: {
        sLengthMenu: 'Tampilkan _MENU_',
        search: '',
        searchPlaceholder: 'Cari...',
        info: 'Menampilkan _START_ sampai _END_ dari _TOTAL_ data',
        infoEmpty: 'Tidak ada data',
        paginate: {
          next: '<i class="ri-arrow-right-s-line"></i>',
          previous: '<i class="ri-arrow-left-s-line"></i>'
        },
        emptyTable: 'Tidak ada data kehadiran',
        zeroRecords: 'Tidak ditemukan data yang cocok'
      },
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              return 'Detail Kehadiran - ' + moment(row.data().date).format('DD MMM YYYY');
            }
          }),
          type: 'column',
          renderer: function (api, rowIdx, columns) {
            var data = $.map(columns, function (col) {
              return col.title !== '' ? '<tr><td>' + col.title + ':</td><td>' + col.data + '</td></tr>' : '';
            }).join('');
            return data ? $('<table class="table"/><tbody />').append(data) : false;
          }
        }
      }
    });

    // Row click handler to update map
    dt_presence_detail.on('click', 'tbody tr', function () {
      var rowData = dt_detail.row(this).data();
      if (rowData) {
        dt_presence_detail.find('tbody tr').removeClass('table-primary');
        $(this).addClass('table-primary');
        updateMap(rowData);
      }
    });
  }

  // Tab switching
  $('#presenceDetailTabs .nav-link').on('click', function() {
    var tabId = $(this).data('tab');
    
    $('#presenceDetailTabs .nav-link').removeClass('active');
    $(this).addClass('active');
    
    $('.tab-content').removeClass('active').hide();
    $('#' + tabId).addClass('active').show();

    // Initialize charts when switching to statistics tab
    if (tabId === 'tab-stats') {
      initCharts();
    }
  });

  // Initialize charts
  var chartsInitialized = false;
  function initCharts() {
    if (chartsInitialized) return;
    chartsInitialized = true;

    // Colors
    var primaryColor = '#026443';
    var warningColor = '#ff9f43';
    var dangerColor = '#ea5455';
    var secondaryColor = '#6c757d';
    var infoColor = '#00cfe8';

    // Get data for charts from attendanceData
    var ontime = attendanceData.filter(function(d) { return d.status === 'ontime' || d.status === 'complete'; }).length;
    var late = attendanceData.filter(function(d) { return d.status === 'late'; }).length;
    var early = attendanceData.filter(function(d) { return d.status === 'early'; }).length;
    var absent = attendanceData.filter(function(d) { return d.status === 'absent'; }).length;

    // 1. Status Distribution Chart (Donut) - from attendanceData
    var statusChartEl = document.querySelector('#statusDistributionChart');
    if (statusChartEl && typeof ApexCharts !== 'undefined') {
      var statusOptions = {
        series: [ontime, late, early, absent],
        chart: { type: 'donut', height: 280 },
        labels: ['Tepat Waktu', 'Terlambat', 'Pulang Awal', 'Tidak Hadir'],
        colors: [primaryColor, warningColor, dangerColor, secondaryColor],
        legend: { position: 'bottom' },
        plotOptions: {
          pie: {
            donut: {
              size: '70%',
              labels: {
                show: true,
                total: {
                  show: true,
                  label: 'Total',
                  fontSize: '14px'
                }
              }
            }
          }
        }
      };
      statusChartEl.innerHTML = '';
      new ApexCharts(statusChartEl, statusOptions).render();
    }

    // 2. Check-in Time Distribution Chart (Bar) - from attendanceData
    var checkinChartEl = document.querySelector('#checkinTimeChart');
    if (checkinChartEl && typeof ApexCharts !== 'undefined') {
      var before8 = attendanceData.filter(function(d) { return d.checkin && moment(d.checkin, 'HH:mm:ss').isBefore(moment('08:00:00', 'HH:mm:ss')); }).length;
      var between8and830 = attendanceData.filter(function(d) { 
        if (!d.checkin) return false;
        var t = moment(d.checkin, 'HH:mm:ss');
        return t.isSameOrAfter(moment('08:00:00', 'HH:mm:ss')) && t.isBefore(moment('08:30:00', 'HH:mm:ss'));
      }).length;
      var after830 = attendanceData.filter(function(d) { return d.checkin && moment(d.checkin, 'HH:mm:ss').isSameOrAfter(moment('08:30:00', 'HH:mm:ss')); }).length;

      var checkinOptions = {
        series: [{
          name: 'Jumlah Hari',
          data: [before8, between8and830, after830]
        }],
        chart: { type: 'bar', height: 280, toolbar: { show: false } },
        colors: [primaryColor, warningColor, dangerColor],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '50%',
            distributed: true
          }
        },
        dataLabels: { enabled: true },
        xaxis: {
          categories: ['< 08:00', '08:00 - 08:30', '> 08:30']
        },
        legend: { show: false }
      };
      checkinChartEl.innerHTML = '';
      new ApexCharts(checkinChartEl, checkinOptions).render();
    }

    // 3. Monthly Trend Chart (Area) - from API
    fetchMonthlyTrend();

    // 4. Weekly Pattern Chart (Bar) - from API
    fetchWeeklyPattern();
  }

  // Fetch Monthly Trend from API
  function fetchMonthlyTrend() {
    var monthlyChartEl = document.querySelector('#monthlyTrendChart');
    if (!monthlyChartEl || typeof ApexCharts === 'undefined') return;

    var primaryColor = '#026443';
    var warningColor = '#ff9f43';

    var queryParams = { npp: currentNpp };

    apiCall('/dashboard/monthly-trend', 'GET', queryParams)
      .done(function(response) {
        if (response.rcode === '00' && response.data) {
          var months = response.data.map(function(d) { return d.month; });
          var totalData = response.data.map(function(d) { return d.total || d.on_time || 0; });
          var lateData = response.data.map(function(d) { return d.late || 0; });

          renderMonthlyChart(monthlyChartEl, months, totalData, lateData, primaryColor, warningColor);
        } else {
          renderMonthlyChartFallback(monthlyChartEl, primaryColor, warningColor);
        }
      })
      .fail(function() {
        renderMonthlyChartFallback(monthlyChartEl, primaryColor, warningColor);
      });
  }

  function renderMonthlyChart(el, months, totalData, lateData, primaryColor, warningColor) {
    var monthlyOptions = {
      series: [{
        name: 'Hadir',
        data: totalData
      }, {
        name: 'Terlambat',
        data: lateData
      }],
      chart: { type: 'area', height: 280, toolbar: { show: false } },
      colors: [primaryColor, warningColor],
      stroke: { curve: 'smooth', width: 2 },
      fill: {
        type: 'gradient',
        gradient: { opacityFrom: 0.5, opacityTo: 0.1 }
      },
      xaxis: { categories: months },
      legend: { position: 'top' }
    };
    el.innerHTML = '';
    new ApexCharts(el, monthlyOptions).render();
  }

  function renderMonthlyChartFallback(el, primaryColor, warningColor) {
    var monthlyOptions = {
      series: [{
        name: 'Hadir',
        data: [20, 21, 19, 22, 20, 21, 20, 22, 21, 20, 22, 21]
      }, {
        name: 'Terlambat',
        data: [2, 3, 4, 1, 2, 3, 2, 1, 2, 3, 1, 2]
      }],
      chart: { type: 'area', height: 280, toolbar: { show: false } },
      colors: [primaryColor, warningColor],
      stroke: { curve: 'smooth', width: 2 },
      fill: {
        type: 'gradient',
        gradient: { opacityFrom: 0.5, opacityTo: 0.1 }
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
      },
      legend: { position: 'top' }
    };
    el.innerHTML = '';
    new ApexCharts(el, monthlyOptions).render();
  }

  // Fetch Weekly Pattern from API
  function fetchWeeklyPattern() {
    var weeklyChartEl = document.querySelector('#weeklyPatternChart');
    if (!weeklyChartEl || typeof ApexCharts === 'undefined') return;

    var primaryColor = '#026443';
    var infoColor = '#00cfe8';

    var queryParams = { npp: currentNpp };

    apiCall('/dashboard/weekly-pattern', 'GET', queryParams)
      .done(function(response) {
        if (response.rcode === '00' && response.data) {
          // Filter out weekends (day_num 0 and 6) if no data
          var weekdays = response.data.filter(function(d) { 
            return d.day_num >= 1 && d.day_num <= 5; 
          });
          
          var days = weekdays.map(function(d) { return d.day; });
          var checkinData = weekdays.map(function(d) { 
            if (!d.avg_checkin) return 8;
            var parts = d.avg_checkin.split(':');
            return parseInt(parts[0]) + parseInt(parts[1]) / 60;
          });
          var checkoutData = weekdays.map(function(d) { 
            if (!d.avg_checkout) return 17;
            var parts = d.avg_checkout.split(':');
            return parseInt(parts[0]) + parseInt(parts[1]) / 60;
          });

          renderWeeklyChart(weeklyChartEl, days, checkinData, checkoutData, primaryColor, infoColor);
        } else {
          renderWeeklyChartFallback(weeklyChartEl, primaryColor, infoColor);
        }
      })
      .fail(function() {
        renderWeeklyChartFallback(weeklyChartEl, primaryColor, infoColor);
      });
  }

  function renderWeeklyChart(el, days, checkinData, checkoutData, primaryColor, infoColor) {
    var weeklyOptions = {
      series: [{
        name: 'Rata-rata Jam Masuk',
        data: checkinData
      }, {
        name: 'Rata-rata Jam Pulang',
        data: checkoutData
      }],
      chart: { type: 'bar', height: 280, toolbar: { show: false } },
      colors: [primaryColor, infoColor],
      plotOptions: {
        bar: { horizontal: false, columnWidth: '40%' }
      },
      dataLabels: {
        enabled: true,
        formatter: function(val) {
          var hours = Math.floor(val);
          var mins = Math.round((val - hours) * 60);
          return hours + ':' + (mins < 10 ? '0' : '') + mins;
        }
      },
      xaxis: { categories: days },
      yaxis: {
        min: 7,
        max: 18,
        labels: {
          formatter: function(val) {
            return Math.floor(val) + ':00';
          }
        }
      },
      legend: { position: 'top' }
    };
    el.innerHTML = '';
    new ApexCharts(el, weeklyOptions).render();
  }

  function renderWeeklyChartFallback(el, primaryColor, infoColor) {
    var weeklyOptions = {
      series: [{
        name: 'Rata-rata Jam Masuk',
        data: [7.9, 7.85, 8.1, 7.95, 8.0]
      }, {
        name: 'Rata-rata Jam Pulang',
        data: [17.1, 17.0, 17.25, 17.15, 16.9]
      }],
      chart: { type: 'bar', height: 280, toolbar: { show: false } },
      colors: [primaryColor, infoColor],
      plotOptions: {
        bar: { horizontal: false, columnWidth: '40%' }
      },
      dataLabels: {
        enabled: true,
        formatter: function(val) {
          var hours = Math.floor(val);
          var mins = Math.round((val - hours) * 60);
          return hours + ':' + (mins < 10 ? '0' : '') + mins;
        }
      },
      xaxis: {
        categories: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
      },
      yaxis: {
        min: 7,
        max: 18,
        labels: {
          formatter: function(val) {
            return Math.floor(val) + ':00';
          }
        }
      },
      legend: { position: 'top' }
    };
    el.innerHTML = '';
    new ApexCharts(el, weeklyOptions).render();
  }

  // Initial data load
  if (currentNpp) {
    fetchEmployeeInfo();
    fetchAttendanceHistory();
  }
});
