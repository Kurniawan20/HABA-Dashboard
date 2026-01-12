/**
 * Page Daftar Kehadiran (Presence List)
 * With Real API Integration
 */

'use strict';

$(function () {
  var dt_adv_filter_table = $('.dt-advanced-search'),
    startDateEle = $('.start_date'),
    endDateEle = $('.end_date'),
    dt_adv_filter;

  // API Base URL - Read from meta tag (configured in .env)
  var API_BASE_URL = $('meta[name="api-base-url"]').attr('content') || 'http://localhost:8080/api';
  var API_TOKEN = localStorage.getItem('api_token') || ''; // Get token from localStorage

  // Status object for badges (Label Default style)
  var statusObj = {
    'complete': { title: 'Lengkap', class: 'bg-label-primary' },
    'checkin_only': { title: 'Masuk Saja', class: 'bg-label-warning' },
    'checkout_only': { title: 'Pulang Saja', class: 'bg-label-info' },
    'no_checkin': { title: 'Tidak Hadir', class: 'bg-label-danger' }
  };

  // Current filter state
  var currentFilters = {
    start_date: moment().startOf('month').format('YYYY-MM-DD'),
    end_date: moment().endOf('month').format('YYYY-MM-DD'),
    npp: '',
    branch_id: '',
    status: ''
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
        // Show loading indicator
        $('.dt-advanced-search').addClass('opacity-50');
      },
      complete: function() {
        // Hide loading indicator
        $('.dt-advanced-search').removeClass('opacity-50');
      }
    });
  }

  // Function to fetch presence data from API
  function fetchPresenceData() {
    var queryParams = {
      start_date: currentFilters.start_date,
      end_date: currentFilters.end_date,
      per_page: 100
    };

    if (currentFilters.npp) queryParams.npp = currentFilters.npp;
    if (currentFilters.branch_id) queryParams.branch_id = currentFilters.branch_id;
    if (currentFilters.status) queryParams.status = currentFilters.status;

    apiCall('/presences', 'GET', queryParams)
      .done(function(response) {
        if (response.rcode === '00' && response.data) {
          var data = response.data.data || response.data;
          
          // Transform API data to match DataTable format
          var transformedData = data.map(function(item) {
            // Determine status
            var status = 'complete';
            if (item.jam_masuk && !item.jam_pulang) status = 'checkin_only';
            if (!item.jam_masuk && item.jam_pulang) status = 'checkout_only';
            if (!item.jam_masuk && !item.jam_pulang) status = 'no_checkin';

            return {
              id: item.id,
              npp: item.npp,
              tgl_absensi: item.tgl_absensi ? formatDate(item.tgl_absensi) : '-',
              jam_masuk: item.jam_masuk ? formatTime(item.jam_masuk) : null,
              jam_pulang: item.jam_pulang ? formatTime(item.jam_pulang) : null,
              duration: item.duration || calculateDuration(item.jam_masuk, item.jam_pulang),
              branch_name: item.branch_id || item.nama_kantor || '-',
              is_late: item.is_late || isLate(item.jam_masuk),
              is_early_checkout: item.is_early_checkout || isEarlyCheckout(item.jam_pulang),
              status: status,
              latitude: item.latitude,
              longitude: item.longitude
            };
          });

          // Update DataTable with new data
          dt_adv_filter.clear().rows.add(transformedData).draw();

          // Update statistics if available
          if (response.summary) {
            updateStatistics(response.summary);
          }
        } else {
          console.error('API Error:', response.message);
          showError('Gagal memuat data: ' + (response.message || 'Unknown error'));
        }
      })
      .fail(function(xhr, status, error) {
        console.error('API Request Failed:', error);
        showError('Gagal terhubung ke server. Pastikan API berjalan dan token valid.');
        
        // Load sample data as fallback for development
        loadSampleData();
      });
  }

  // Format date from API response
  function formatDate(dateStr) {
    if (!dateStr) return '-';
    // Handle YYYYMMDD format
    if (dateStr.length === 8 && !dateStr.includes('-')) {
      return dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6) + '-' + dateStr.substring(6, 8);
    }
    // Handle datetime format
    if (dateStr.includes(' ')) {
      return dateStr.split(' ')[0];
    }
    return dateStr;
  }

  // Format time from API response
  function formatTime(datetimeStr) {
    if (!datetimeStr) return null;
    if (datetimeStr.includes(' ')) {
      return datetimeStr.split(' ')[1].substring(0, 5);
    }
    if (datetimeStr.includes(':')) {
      return datetimeStr.substring(0, 5);
    }
    return datetimeStr;
  }

  // Calculate duration between check-in and check-out
  function calculateDuration(checkin, checkout) {
    if (!checkin || !checkout) return '-';
    var start = moment(checkin);
    var end = moment(checkout);
    var duration = moment.duration(end.diff(start));
    var hours = Math.floor(duration.asHours());
    var minutes = duration.minutes();
    return hours + ' jam ' + (minutes < 10 ? '0' : '') + minutes + ' menit';
  }

  // Check if check-in is late (after 08:00)
  function isLate(checkinTime) {
    if (!checkinTime) return false;
    var time = formatTime(checkinTime);
    if (!time) return false;
    return time > '08:00';
  }

  // Check if checkout is early (before 17:00)
  function isEarlyCheckout(checkoutTime) {
    if (!checkoutTime) return false;
    var time = formatTime(checkoutTime);
    if (!time) return false;
    return time < '17:00';
  }

  // Update statistics display
  function updateStatistics(summary) {
    if (summary.total_records) {
      $('#stat-total').text(summary.total_records);
    }
  }

  // Show error message
  function showError(message) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      customClass: { confirmButton: 'btn btn-primary' },
      buttonsStyling: false
    });
  }

  // Load sample data as fallback
  function loadSampleData() {
    var sampleData = [
      { id: 1, npp: '12345', tgl_absensi: '2024-01-15', jam_masuk: '08:00', jam_pulang: '17:00', duration: '9 jam 00 menit', branch_name: 'Kantor Pusat', is_late: false, is_early_checkout: false, status: 'complete' },
      { id: 2, npp: '12346', tgl_absensi: '2024-01-15', jam_masuk: '08:35', jam_pulang: '17:00', duration: '8 jam 25 menit', branch_name: 'Cabang Jakarta', is_late: true, is_early_checkout: false, status: 'complete' },
      { id: 3, npp: '12347', tgl_absensi: '2024-01-15', jam_masuk: '07:55', jam_pulang: '16:30', duration: '8 jam 35 menit', branch_name: 'Cabang Surabaya', is_late: false, is_early_checkout: true, status: 'complete' },
      { id: 4, npp: '12348', tgl_absensi: '2024-01-15', jam_masuk: '08:10', jam_pulang: null, duration: '-', branch_name: 'Kantor Pusat', is_late: true, is_early_checkout: false, status: 'checkin_only' },
      { id: 5, npp: '12349', tgl_absensi: '2024-01-15', jam_masuk: '07:45', jam_pulang: '17:15', duration: '9 jam 30 menit', branch_name: 'Cabang Bandung', is_late: false, is_early_checkout: false, status: 'complete' }
    ];
    dt_adv_filter.clear().rows.add(sampleData).draw();
  }

  // Advanced Search Functions
  // --------------------------------------------------------------------

  // Datepicker for advanced filter
  var rangePickr = $('.flatpickr-range'),
    dateFormat = 'YYYY-MM-DD';

  if (rangePickr.length) {
    rangePickr.flatpickr({
      mode: 'range',
      dateFormat: 'Y-m-d',
      defaultDate: [currentFilters.start_date, currentFilters.end_date],
      locale: {
        rangeSeparator: ' s/d '
      },
      onClose: function (selectedDates, dateStr, instance) {
        if (selectedDates[0]) {
          currentFilters.start_date = moment(selectedDates[0]).format('YYYY-MM-DD');
          startDateEle.val(currentFilters.start_date);
        }
        if (selectedDates[1]) {
          currentFilters.end_date = moment(selectedDates[1]).format('YYYY-MM-DD');
          endDateEle.val(currentFilters.end_date);
        }
        // Fetch new data with updated date range
        fetchPresenceData();
      }
    });
  }

  // Flatpickr for date inputs
  $('.flatpickr-date').flatpickr({
    dateFormat: 'Y-m-d'
  });

  // Flatpickr for time inputs
  $('.flatpickr-time').flatpickr({
    enableTime: true,
    noCalendar: true,
    dateFormat: 'H:i',
    time_24hr: true
  });

  // Advanced Filter table initialization
  if (dt_adv_filter_table.length) {
    dt_adv_filter = dt_adv_filter_table.DataTable({
      data: [], // Start empty, will be populated via API
      processing: true,
      dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end'<'dt-action-buttons'B>>>" +
           "<'row'<'col-sm-12'tr>>" +
           "<'row'<'col-sm-12 col-md-6'i><'col-sm-12 col-md-6 dataTables_pager'p>>",
      buttons: [
        {
          extend: 'collection',
          className: 'btn btn-label-primary dropdown-toggle me-4 waves-effect waves-light',
          text: '<i class="ri-external-link-line me-sm-1"></i> <span class="d-none d-sm-inline-block">Ekspor</span>',
          buttons: [
            {
              extend: 'print',
              text: '<i class="ri-printer-line me-1"></i>Cetak',
              className: 'dropdown-item',
              exportOptions: { columns: [1, 2, 3, 4, 5, 6, 7] }
            },
            {
              extend: 'csv',
              text: '<i class="ri-file-text-line me-1"></i>CSV',
              className: 'dropdown-item',
              exportOptions: { columns: [1, 2, 3, 4, 5, 6, 7] }
            },
            {
              extend: 'excel',
              text: '<i class="ri-file-excel-line me-1"></i>Excel',
              className: 'dropdown-item',
              exportOptions: { columns: [1, 2, 3, 4, 5, 6, 7] }
            },
            {
              extend: 'pdf',
              text: '<i class="ri-file-pdf-line me-1"></i>PDF',
              className: 'dropdown-item',
              exportOptions: { columns: [1, 2, 3, 4, 5, 6, 7] }
            }
          ]
        },
        {
          text: '<i class="ri-refresh-line ri-16px me-sm-2"></i> <span class="d-none d-sm-inline-block">Refresh</span>',
          className: 'btn btn-outline-secondary waves-effect waves-light me-4',
          action: function (e, dt, node, config) {
            fetchPresenceData();
          }
        },
        {
          text: '<i class="ri-add-line ri-16px me-sm-2"></i> <span class="d-none d-sm-inline-block">Tambah Absensi</span>',
          className: 'btn btn-primary waves-effect waves-light',
          attr: {
            'data-bs-toggle': 'offcanvas',
            'data-bs-target': '#offcanvasAddPresence'
          }
        }
      ],
      columns: [
        { data: '' },
        { data: 'npp' },
        { data: 'tgl_absensi' },
        { data: 'jam_masuk' },
        { data: 'jam_pulang' },
        { data: 'duration' },
        { data: 'branch_name' },
        { data: 'status' },
        { data: '' }
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
            return '<span class="fw-medium">' + data + '</span>';
          }
        },
        {
          targets: 2,
          render: function (data) {
            return moment(data).format('DD MMM YYYY');
          }
        },
        {
          targets: 3,
          render: function (data, type, full) {
            if (!data) return '<span class="text-muted">-</span>';
            var badge = full.is_late ? ' <span class="badge bg-label-warning rounded-pill">Terlambat</span>' : '';
            return '<span>' + data + '</span>' + badge;
          }
        },
        {
          targets: 4,
          render: function (data, type, full) {
            if (!data) return '<span class="text-muted">-</span>';
            var badge = full.is_early_checkout ? ' <span class="badge bg-label-danger rounded-pill">Awal</span>' : '';
            return '<span>' + data + '</span>' + badge;
          }
        },
        {
          targets: 5,
          render: function (data) {
            if (!data || data === '-') return '<span class="text-muted">-</span>';
            return '<span class="text-heading">' + data + '</span>';
          }
        },
        {
          targets: 6,
          render: function (data) {
            return '<span class="text-heading">' + data + '</span>';
          }
        },
        {
          targets: 7,
          render: function (data) {
            var status = statusObj[data] || { title: data, class: 'bg-label-secondary' };
            return '<span class="badge ' + status.class + '">' + status.title + '</span>';
          }
        },
        {
          targets: -1,
          title: 'Aksi',
          orderable: false,
          searchable: false,
          render: function (data, type, full) {
            return (
              '<div class="d-inline-block">' +
              '<a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-line"></i></a>' +
              '<ul class="dropdown-menu dropdown-menu-end m-0">' +
              '<li><a href="' + baseUrl + 'app/absensi/detail?npp=' + full.npp + '" class="dropdown-item"><i class="ri-eye-line me-2"></i>Lihat Detail</a></li>' +
              '<li><a href="javascript:;" class="dropdown-item edit-record" data-id="' + full.id + '"><i class="ri-edit-box-line me-2"></i>Edit</a></li>' +
              '<div class="dropdown-divider"></div>' +
              '<li><a href="javascript:;" class="dropdown-item text-danger delete-record" data-id="' + full.id + '" data-npp="' + full.npp + '" data-date="' + full.tgl_absensi + '"><i class="ri-delete-bin-7-line me-2"></i>Hapus</a></li>' +
              '</ul>' +
              '</div>'
            );
          }
        }
      ],
      language: {
        sLengthMenu: 'Tampilkan _MENU_',
        search: '',
        searchPlaceholder: 'Cari...',
        info: 'Menampilkan _START_ sampai _END_ dari _TOTAL_ data',
        infoEmpty: 'Tidak ada data',
        infoFiltered: '(difilter dari _MAX_ total data)',
        paginate: {
          next: '<i class="ri-arrow-right-s-line"></i>',
          previous: '<i class="ri-arrow-left-s-line"></i>'
        },
        emptyTable: 'Tidak ada data kehadiran',
        zeroRecords: 'Tidak ditemukan data yang cocok',
        processing: '<div class="d-flex justify-content-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>'
      },
      orderCellsTop: true,
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              return 'Detail Kehadiran NPP ' + row.data()['npp'];
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

    // Initial data load
    fetchPresenceData();
  }

  // Filter by NPP
  $('input[data-column="1"]').on('keyup', function () {
    currentFilters.npp = $(this).val();
    dt_adv_filter.column(1).search($(this).val()).draw();
  });

  // Filter by Branch
  $('select[data-column="6"]').on('change', function () {
    currentFilters.branch_id = $(this).val();
    fetchPresenceData();
  });

  // Filter by Status
  $('select[data-column="7"]').on('change', function () {
    currentFilters.status = $(this).val();
    fetchPresenceData();
  });

  // Delete Record with API
  $('.dt-advanced-search tbody').on('click', '.delete-record', function () {
    var id = $(this).data('id');
    var npp = $(this).data('npp');
    var date = $(this).data('date');

    Swal.fire({
      title: 'Hapus Data Kehadiran?',
      html: 'Anda yakin ingin menghapus data kehadiran <strong>NPP ' + npp + '</strong> tanggal <strong>' + date + '</strong>?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '<i class="ri-delete-bin-line me-1"></i>Ya, Hapus',
      cancelButtonText: 'Batal',
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-outline-secondary ms-2'
      },
      buttonsStyling: false
    }).then(function (result) {
      if (result.isConfirmed) {
        // Call DELETE API
        apiCall('/presences/' + id, 'DELETE')
          .done(function(response) {
            if (response.rcode === '00') {
              Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Data kehadiran berhasil dihapus.',
                customClass: { confirmButton: 'btn btn-primary' },
                buttonsStyling: false
              });
              fetchPresenceData(); // Refresh data
            } else {
              showError('Gagal menghapus: ' + response.message);
            }
          })
          .fail(function() {
            showError('Gagal menghapus data. Silakan coba lagi.');
          });
      }
    });
  });

  // Edit Record
  $('.dt-advanced-search tbody').on('click', '.edit-record', function () {
    var id = $(this).data('id');
    
    // Get current row data from DataTable
    var rowData = dt_adv_filter.row($(this).closest('tr')).data();
    
    if (rowData) {
      $('#edit-presence-id').val(id);
      $('#edit-presence-npp').val(rowData.npp);
      $('#edit-presence-date').val(rowData.tgl_absensi);
      $('#edit-presence-checkin').val(rowData.jam_masuk || '');
      $('#edit-presence-checkout').val(rowData.jam_pulang || '');
      $('#edit-presence-reason').val('');
      
      $('#editPresenceModal').modal('show');
    }
  });

  // Edit form submit with API
  $('#editPresenceForm').on('submit', function(e) {
    e.preventDefault();
    
    var id = $('#edit-presence-id').val();
    var reason = $('#edit-presence-reason').val();
    
    if (!reason) {
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: 'Alasan koreksi wajib diisi.',
        customClass: { confirmButton: 'btn btn-primary' },
        buttonsStyling: false
      });
      return;
    }
    
    var updateData = {
      jam_masuk: $('#edit-presence-date').val() + ' ' + $('#edit-presence-checkin').val() + ':00',
      jam_pulang: $('#edit-presence-checkout').val() ? $('#edit-presence-date').val() + ' ' + $('#edit-presence-checkout').val() + ':00' : null,
      correction_reason: reason
    };
    
    apiCall('/presences/' + id, 'PUT', JSON.stringify(updateData))
      .done(function(response) {
        if (response.rcode === '00') {
          $('#editPresenceModal').modal('hide');
          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Data kehadiran berhasil diperbarui.',
            customClass: { confirmButton: 'btn btn-primary' },
            buttonsStyling: false
          });
          fetchPresenceData(); // Refresh data
        } else {
          showError('Gagal memperbarui: ' + response.message);
        }
      })
      .fail(function() {
        showError('Gagal memperbarui data. Silakan coba lagi.');
      });
  });

  // Add new presence form submit with API
  $('#addNewPresenceForm').on('submit', function(e) {
    e.preventDefault();
    
    var formData = {
      npp: $('#add-presence-npp').val(),
      tgl_absensi: $('#add-presence-date').val(),
      jam_masuk: $('#add-presence-checkin').val() ? $('#add-presence-date').val() + ' ' + $('#add-presence-checkin').val() + ':00' : null,
      jam_pulang: $('#add-presence-checkout').val() ? $('#add-presence-date').val() + ' ' + $('#add-presence-checkout').val() + ':00' : null,
      latitude: '-6.2088',
      longitude: '106.8456',
      branch_id: $('#add-presence-branch').val() || 'HO001',
      device_info: 'Admin Dashboard'
    };
    
    if (!formData.npp || !formData.tgl_absensi) {
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: 'NPP dan Tanggal wajib diisi.',
        customClass: { confirmButton: 'btn btn-primary' },
        buttonsStyling: false
      });
      return;
    }
    
    apiCall('/presences', 'POST', JSON.stringify(formData))
      .done(function(response) {
        if (response.rcode === '00') {
          var offcanvasEl = document.querySelector('#offcanvasAddPresence');
          var offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
          if (offcanvas) offcanvas.hide();
          
          $('#addNewPresenceForm')[0].reset();
          
          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Data kehadiran berhasil ditambahkan.',
            customClass: { confirmButton: 'btn btn-primary' },
            buttonsStyling: false
          });
          fetchPresenceData(); // Refresh data
        } else {
          showError('Gagal menambahkan: ' + response.message);
        }
      })
      .fail(function() {
        showError('Gagal menambahkan data. Silakan coba lagi.');
      });
  });

  // ============================================
  // POPULATE BRANCH FILTER FROM API
  // ============================================
  function populateBranchFilter() {
    apiCall('/branches', 'GET', { per_page: 100 })
      .done(function(response) {
        if (response.rcode === '00' && response.data) {
          var data = Array.isArray(response.data) ? response.data : (response.data.data || []);
          var branchSelect = $('.dt-input[data-column="6"]');
          
          // Clear existing options except "Semua Cabang"
          branchSelect.find('option:not(:first)').remove();
          
          // Add branches from API
          data.forEach(function(branch) {
            var optionText = branch.nama_kantor || branch.name || branch.kode_kantor;
            var optionValue = branch.nama_kantor || branch.name || branch.kode_kantor;
            branchSelect.append('<option value="' + optionValue + '">' + optionText + '</option>');
          });
        }
      })
      .fail(function() {
        console.log('Failed to load branches, using default options');
      });
  }
  
  // Load branches on page load
  populateBranchFilter();
});
