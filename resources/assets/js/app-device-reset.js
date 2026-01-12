/**
 * Page Reset Perangkat - Request & Approval (Device Reset)
 */

'use strict';

$(function () {
  var dt_device_reset = $('.datatables-device-reset');
  var currentViewId = null;
  var requestsData = [];

  // API Base URL for requests table
  var API_BASE_URL_REQ = $('meta[name="api-base-url"]').attr('content') || 'http://localhost:8080/api';
  var API_TOKEN_REQ = localStorage.getItem('api_token') || '';

  // API Helper for requests
  function apiCallReq(endpoint, method, data) {
    var ajaxConfig = {
      url: API_BASE_URL_REQ + endpoint,
      method: method || 'GET',
      headers: {
        'Authorization': 'Bearer ' + API_TOKEN_REQ,
        'Accept': 'application/json'
      }
    };
    if (method === 'GET' || method === 'DELETE') {
      ajaxConfig.data = data;
    } else {
      ajaxConfig.contentType = 'application/json';
      ajaxConfig.data = typeof data === 'string' ? data : JSON.stringify(data);
    }
    return $.ajax(ajaxConfig);
  }

  // Fetch device reset requests from API
  function fetchDeviceResetRequests() {
    apiCallReq('/device-reset', 'GET', { per_page: 100 })
      .done(function(response) {
        if (response.rcode === '00' && response.data) {
          var data = Array.isArray(response.data) ? response.data : (response.data.data || []);
          requestsData = data.map(function(r) {
            return {
              id: r.id,
              npp: r.npp,
              nama: r.user ? r.user.nama || r.user.fullname : 'User ' + r.npp,
              email: r.user ? r.user.email : '-',
              old_device_id: r.old_device_id || '-',
              reason: r.reason,
              status: r.status,
              processed_by: r.processed_by,
              processed_at: r.processed_at,
              admin_notes: r.admin_notes,
              created_at: r.created_at
            };
          });
          updateDataTable();
          updateStats();
        }
      })
      .fail(function() {
        console.log('API unavailable, loading sample data');
        loadSampleRequestsData();
      });
  }

  // Load sample data as fallback
  function loadSampleRequestsData() {
    requestsData = [
      { id: 1, npp: '12345', nama: 'Ahmad Rizki', email: 'ahmad@email.com', old_device_id: 'a1b2c3d4e5f6g7h8', reason: 'HP hilang', status: 'pending', processed_by: null, processed_at: null, admin_notes: null, created_at: '2024-01-15 08:30:00' },
      { id: 2, npp: '12346', nama: 'Budi Santoso', email: 'budi@email.com', old_device_id: 'x9y8z7w6v5u4t3s2', reason: 'Perangkat rusak', status: 'pending', processed_by: null, processed_at: null, admin_notes: null, created_at: '2024-01-15 09:15:00' },
      { id: 3, npp: '12347', nama: 'Citra Dewi', email: 'citra@email.com', old_device_id: 'm1n2o3p4q5r6s7t8', reason: 'Ganti HP baru', status: 'approved', processed_by: 'Admin1', processed_at: '2024-01-14 16:00:00', admin_notes: 'Approved', created_at: '2024-01-14 10:00:00' }
    ];
    updateDataTable();
    updateStats();
  }

  // Status badge config
  var statusObj = {
    'pending': { title: 'Menunggu', class: 'bg-label-warning' },
    'approved': { title: 'Disetujui', class: 'bg-label-primary' },
    'rejected': { title: 'Ditolak', class: 'bg-label-danger' }
  };

  // Update statistics
  function updateStats() {
    var pending = requestsData.filter(function (d) { return d.status === 'pending'; }).length;
    var approved = requestsData.filter(function (d) { return d.status === 'approved'; }).length;
    var rejected = requestsData.filter(function (d) { return d.status === 'rejected'; }).length;

    $('#stat-pending').text(pending);
    $('#stat-approved').text(approved);
    $('#stat-rejected').text(rejected);
    $('#stat-total').text(requestsData.length);
  }

  // Initialize date picker
  if ($('.flatpickr-range').length) {
    $('.flatpickr-range').flatpickr({
      mode: 'range',
      dateFormat: 'Y-m-d',
      locale: {
        rangeSeparator: ' s/d '
      }
    });
  }

  // Initialize DataTable
  var dt = null;
  function updateDataTable() {
    var currentStatus = $('#filter-status').val() || '';
    var filtered = currentStatus ? requestsData.filter(function (d) { return d.status === currentStatus; }) : requestsData;
    if (dt) {
      dt.clear().rows.add(filtered).draw();
    }
  }

  if (dt_device_reset.length) {
    dt = dt_device_reset.DataTable({
      data: [],
      columns: [
        { data: '' },
        { data: 'created_at' },
        { data: '' },
        { data: 'old_device_id' },
        { data: 'reason' },
        { data: 'status' },
        { data: 'processed_by' },
        { data: '' }
      ],
      columnDefs: [
        {
          className: 'control',
          orderable: false,
          targets: 0,
          render: function () {
            return '';
          }
        },
        {
          targets: 1,
          render: function (data) {
            return '<span class="text-nowrap">' + moment(data).format('DD MMM YYYY') + '</span><br>' +
                   '<small class="text-muted">' + moment(data).format('HH:mm') + '</small>';
          }
        },
        {
          targets: 2,
          render: function (data, type, full) {
            var initials = full.nama.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
            return '<div class="d-flex align-items-center">' +
                   '<div class="avatar avatar-sm me-2"><span class="avatar-initial rounded-3 bg-label-primary">' + initials + '</span></div>' +
                   '<div><span class="fw-medium">' + full.nama + '</span><br><small class="text-muted">NPP: ' + full.npp + '</small></div>' +
                   '</div>';
          }
        },
        {
          targets: 3,
          render: function (data) {
            var shortId = data.substring(0, 12) + '...';
            return '<code title="' + data + '">' + shortId + '</code>';
          }
        },
        {
          targets: 4,
          render: function (data) {
            var shortReason = data.length > 30 ? data.substring(0, 30) + '...' : data;
            return '<span title="' + data + '">' + shortReason + '</span>';
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
          render: function (data, type, full) {
            if (!data) return '<span class="text-muted">-</span>';
            return '<span>' + data + '</span><br><small class="text-muted">' + moment(full.processed_at).format('DD/MM/YY HH:mm') + '</small>';
          }
        },
        {
          targets: -1,
          title: 'Aksi',
          orderable: false,
          render: function (data, type, full) {
            var actions = '<li><a href="javascript:;" class="dropdown-item view-request" data-id="' + full.id + '"><i class="ri-eye-line me-2"></i>Lihat Detail</a></li>';
            
            if (full.status === 'pending') {
              actions += '<li><div class="dropdown-divider"></div></li>';
              actions += '<li><a href="javascript:;" class="dropdown-item text-primary approve-request" data-id="' + full.id + '"><i class="ri-check-line me-2"></i>Setujui</a></li>';
              actions += '<li><a href="javascript:;" class="dropdown-item text-danger reject-request" data-id="' + full.id + '"><i class="ri-close-line me-2"></i>Tolak</a></li>';
            }

            return (
              '<div class="d-inline-block">' +
              '<a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-line"></i></a>' +
              '<ul class="dropdown-menu dropdown-menu-end m-0">' +
              actions +
              '</ul>' +
              '</div>'
            );
          }
        }
      ],
      order: [[1, 'desc']],
      dom: "<'row'<'col-sm-12'tr>><'row'<'col-sm-12 col-md-6'i><'col-sm-12 col-md-6 dataTables_pager'p>>",
      language: {
        sLengthMenu: 'Tampilkan _MENU_',
        search: '',
        searchPlaceholder: 'Cari...',
        info: 'Menampilkan _START_ sampai _END_ dari _TOTAL_ permintaan',
        infoEmpty: 'Tidak ada data',
        paginate: {
          next: '<i class="ri-arrow-right-s-line"></i>',
          previous: '<i class="ri-arrow-left-s-line"></i>'
        },
        emptyTable: 'Tidak ada permintaan reset perangkat',
        zeroRecords: 'Tidak ditemukan permintaan yang cocok'
      },
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return 'Permintaan dari ' + data.nama;
            }
          }),
          type: 'column',
          renderer: function (api, rowIdx, columns) {
            var data = $.map(columns, function (col) {
              return col.title !== ''
                ? '<tr><td>' + col.title + ':</td><td>' + col.data + '</td></tr>'
                : '';
            }).join('');
            return data ? $('<table class="table"/><tbody />').append(data) : false;
          }
        }
      }
    });

    // Search
    $('#searchRequest').on('keyup', function () {
      dt.search($(this).val()).draw();
    });

    // Filter by status
    $('#filter-status').on('change', function () {
      updateDataTable();
    });

    // Initial load
    fetchDeviceResetRequests();
  }

  // =============================================
  // SECOND TABLE: Manual Reset User List
  // =============================================
  var dt_manual_reset = $('.datatables-manual-reset');
  var manualResetData = [];

  // API Base URL
  var API_BASE_URL = $('meta[name="api-base-url"]').attr('content') || 'http://localhost:8080/api';
  var API_TOKEN = localStorage.getItem('api_token') || '';

  // API Helper
  function apiCall(endpoint, method, data) {
    var ajaxConfig = {
      url: API_BASE_URL + endpoint,
      method: method || 'GET',
      headers: {
        'Authorization': 'Bearer ' + API_TOKEN,
        'Accept': 'application/json'
      }
    };
    if (method === 'GET' || method === 'DELETE') {
      ajaxConfig.data = data;
    } else {
      ajaxConfig.contentType = 'application/json';
      ajaxConfig.data = typeof data === 'string' ? data : JSON.stringify(data);
    }
    return $.ajax(ajaxConfig);
  }

  // Fetch users for manual reset table
  function fetchUsersForManualReset() {
    apiCall('/users', 'GET', { per_page: 100 })
      .done(function(response) {
        if (response.rcode === '00' && response.data) {
          var data = Array.isArray(response.data) ? response.data : (response.data.data || []);
          manualResetData = data.map(function(u) {
            return {
              npp: u.npp,
              nama: u.fullname || u.nama || 'User ' + u.npp,
              email: u.email || '-',
              branch: u.branch_id || u.kode_kantor || '-',
              device_id: u.device_id || null,
              has_device: !!u.device_id
            };
          });
          dtManual.clear().rows.add(manualResetData).draw();
          populateBranchFilter();
        }
      })
      .fail(function() {
        loadSampleManualResetData();
      });
  }

  // Load sample data as fallback
  function loadSampleManualResetData() {
    manualResetData = [
      { npp: '12345', nama: 'Ahmad Rizki', email: 'ahmad@email.com', branch: 'HO001', device_id: 'dev123abc456', has_device: true },
      { npp: '12346', nama: 'Budi Santoso', email: 'budi@email.com', branch: 'JKT001', device_id: 'dev789xyz012', has_device: true },
      { npp: '12347', nama: 'Citra Dewi', email: 'citra@email.com', branch: 'HO001', device_id: null, has_device: false },
      { npp: '12348', nama: 'Dewi Lestari', email: 'dewi@email.com', branch: 'BDG001', device_id: 'dev456def789', has_device: true },
      { npp: '12349', nama: 'Eko Prasetyo', email: 'eko@email.com', branch: 'SBY001', device_id: 'dev012ghi345', has_device: true },
      { npp: '12350', nama: 'Fajar Hidayat', email: 'fajar@email.com', branch: 'JKT001', device_id: null, has_device: false }
    ];
    dtManual.clear().rows.add(manualResetData).draw();
    populateBranchFilter();
  }

  // Populate branch filter dropdown
  function populateBranchFilter() {
    var branches = [...new Set(manualResetData.map(function(u) { return u.branch; }))].filter(Boolean);
    var select = $('#filter-branch-manual');
    select.find('option:not(:first)').remove();
    branches.forEach(function(b) {
      select.append('<option value="' + b + '">' + b + '</option>');
    });
  }

  // Initialize Manual Reset DataTable
  var dtManual = null;
  if (dt_manual_reset.length) {
    dtManual = dt_manual_reset.DataTable({
      data: [],
      columns: [
        { data: '' },
        { data: 'npp' },
        { data: 'nama' },
        { data: 'branch' },
        { data: 'device_id' },
        { data: 'has_device' },
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
            return '<span class="badge bg-label-primary">' + data + '</span>';
          }
        },
        {
          targets: 2,
          render: function (data, type, full) {
            var initials = data.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
            return '<div class="d-flex align-items-center">' +
                   '<div class="avatar avatar-sm me-2"><span class="avatar-initial rounded-3 bg-label-info">' + initials + '</span></div>' +
                   '<span class="fw-medium">' + data + '</span>' +
                   '</div>';
          }
        },
        {
          targets: 3,
          render: function (data) {
            return '<span class="badge bg-label-secondary">' + (data || '-') + '</span>';
          }
        },
        {
          targets: 4,
          render: function (data) {
            if (!data) return '<span class="text-muted">Tidak ada device</span>';
            var shortId = data.length > 12 ? data.substring(0, 12) + '...' : data;
            return '<code title="' + data + '">' + shortId + '</code>';
          }
        },
        {
          targets: 5,
          render: function (data) {
            if (data) {
              return '<span class="badge bg-label-success"><i class="ri-smartphone-line me-1"></i>Terdaftar</span>';
            }
            return '<span class="badge bg-label-secondary"><i class="ri-smartphone-line me-1"></i>Tidak Ada</span>';
          }
        },
        {
          targets: -1,
          title: 'Aksi',
          orderable: false,
          render: function (data, type, full) {
            if (!full.has_device) {
              return '<span class="text-muted">-</span>';
            }
            return '<button type="button" class="btn btn-warning btn-sm reset-device-manual" data-npp="' + full.npp + '">' +
                   '<i class="ri-refresh-line me-1"></i>Reset' +
                   '</button>';
          }
        }
      ],
      order: [[1, 'asc']],
      dom: "<'row'<'col-sm-12'tr>><'row'<'col-sm-12 col-md-6'i><'col-sm-12 col-md-6 dataTables_pager'p>>",
      language: {
        info: 'Menampilkan _START_ sampai _END_ dari _TOTAL_ karyawan',
        infoEmpty: 'Tidak ada data',
        paginate: {
          next: '<i class="ri-arrow-right-s-line"></i>',
          previous: '<i class="ri-arrow-left-s-line"></i>'
        },
        emptyTable: 'Tidak ada data karyawan',
        zeroRecords: 'Tidak ditemukan karyawan yang cocok'
      },
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) { return 'Detail: ' + row.data().nama; }
          }),
          type: 'column'
        }
      }
    });

    // Search for manual reset table
    $('#searchUserManual').on('keyup', function () {
      dtManual.search($(this).val()).draw();
    });

    // Filter by branch
    $('#filter-branch-manual').on('change', function () {
      var branch = $(this).val();
      var filtered = branch ? manualResetData.filter(function (u) { return u.branch === branch; }) : manualResetData;
      dtManual.clear().rows.add(filtered).draw();
    });

    // Initial load
    fetchUsersForManualReset();
  }

  // Reset device from manual table
  $(document).on('click', '.reset-device-manual', function () {
    var npp = $(this).data('npp');
    var user = manualResetData.find(function (u) { return u.npp === npp; });
    
    if (user) {
      var initials = user.nama.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
      $('#manual-reset-avatar').text(initials);
      $('#manual-reset-nama').text(user.nama);
      $('#manual-reset-npp').val(user.npp);
      $('#manual-reset-npp-display').text('NPP: ' + user.npp);
      $('#manual-reset-device-id').text(user.device_id || 'N/A');
      $('#manual-reset-reason').val('');

      currentManualResetUser = user;
      var modal = new bootstrap.Modal(document.getElementById('confirmManualResetModal'));
      modal.show();
    }
  });

  // View Request
  $(document).on('click', '.view-request', function () {
    var id = $(this).data('id');
    var request = sampleData.find(function (r) { return r.id === id; });
    currentViewId = id;

    if (request) {
      var initials = request.nama.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
      $('#view-avatar').text(initials);
      $('#view-nama').text(request.nama);
      $('#view-npp').text('NPP: ' + request.npp);
      $('#view-email').text(request.email);
      $('#view-tanggal').text(moment(request.created_at).format('DD MMM YYYY, HH:mm'));
      $('#view-device-id').text(request.old_device_id);
      $('#view-reason').text(request.reason);

      var status = statusObj[request.status] || { title: request.status, class: 'bg-label-secondary' };
      $('#view-status').html('<span class="badge ' + status.class + '">' + status.title + '</span>');

      // Show/hide processed info
      if (request.processed_by) {
        $('#view-processed-row').show().find('#view-processed-by').text(request.processed_by);
        $('#view-processed-at-row').show().find('#view-processed-at').text(moment(request.processed_at).format('DD MMM YYYY, HH:mm'));
      } else {
        $('#view-processed-row, #view-processed-at-row').hide();
      }

      if (request.admin_notes && request.status === 'rejected') {
        $('#view-admin-notes-row').show().find('#view-admin-notes').text(request.admin_notes);
      } else {
        $('#view-admin-notes-row').hide();
      }

      // Show/hide action buttons
      if (request.status === 'pending') {
        $('#view-actions #btnApproveFromView, #view-actions #btnRejectFromView').show();
      } else {
        $('#view-actions #btnApproveFromView, #view-actions #btnRejectFromView').hide();
      }

      var modal = new bootstrap.Modal(document.getElementById('viewRequestModal'));
      modal.show();
    }
  });

  // Approve from View Modal
  $('#btnApproveFromView').on('click', function () {
    bootstrap.Modal.getInstance(document.getElementById('viewRequestModal')).hide();
    approveRequest(currentViewId);
  });

  // Reject from View Modal
  $('#btnRejectFromView').on('click', function () {
    bootstrap.Modal.getInstance(document.getElementById('viewRequestModal')).hide();
    openRejectModal(currentViewId);
  });

  // Approve Request
  $(document).on('click', '.approve-request', function () {
    var id = $(this).data('id');
    approveRequest(id);
  });

  function approveRequest(id) {
    var request = requestsData.find(function (r) { return r.id === id; });
    if (!request) return;

    Swal.fire({
      title: 'Setujui Permintaan?',
      html: 'Anda yakin ingin menyetujui permintaan reset device dari <strong>' + request.nama + '</strong>?<br><br>' +
            '<small class="text-muted">Device lama akan dihapus dan email notifikasi akan dikirim ke ' + request.email + '</small>',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '<i class="ri-check-line me-1"></i>Ya, Setujui',
      cancelButtonText: 'Batal',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-secondary ms-2'
      },
      buttonsStyling: false
    }).then(function (result) {
      if (result.isConfirmed) {
        // Call API to approve
        apiCallReq('/device-reset/' + id + '/approve', 'POST', {
          admin_npp: 'dashboard_admin',
          notes: 'Approved from dashboard'
        })
          .done(function(response) {
            if (response.rcode === '00') {
              // Refresh data from server
              fetchDeviceResetRequests();
              
              Swal.fire({
                icon: 'success',
                title: 'Disetujui!',
                html: 'Permintaan reset device untuk <strong>' + request.nama + '</strong> telah disetujui.<br>' +
                      '<small class="text-muted">Email notifikasi telah dikirim.</small>',
                customClass: { confirmButton: 'btn btn-primary' },
                buttonsStyling: false
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: response.message || 'Gagal menyetujui permintaan',
                customClass: { confirmButton: 'btn btn-primary' },
                buttonsStyling: false
              });
            }
          })
          .fail(function() {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Terjadi kesalahan saat menghubungi server',
              customClass: { confirmButton: 'btn btn-primary' },
              buttonsStyling: false
            });
          });
      }
    });
  }

  // Reject Request - Open Modal
  $(document).on('click', '.reject-request', function () {
    var id = $(this).data('id');
    openRejectModal(id);
  });

  function openRejectModal(id) {
    var request = requestsData.find(function (r) { return r.id === id; });
    if (!request) return;

    $('#reject-id').val(id);
    $('#reject-nama').text(request.nama);
    $('#reject-npp').text('NPP: ' + request.npp);
    $('#reject-reason').val('');

    var modal = new bootstrap.Modal(document.getElementById('rejectModal'));
    modal.show();
  }

  // Confirm Reject
  $('#btnConfirmReject').on('click', function () {
    var id = parseInt($('#reject-id').val());
    var reason = $('#reject-reason').val();

    if (!reason || reason.length < 10) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Alasan penolakan harus minimal 10 karakter!',
        customClass: { confirmButton: 'btn btn-primary' },
        buttonsStyling: false
      });
      return;
    }

    var request = requestsData.find(function (r) { return r.id === id; });
    if (!request) return;

    // Call API to reject
    apiCallReq('/device-reset/' + id + '/reject', 'POST', {
      admin_npp: 'dashboard_admin',
      reason: reason
    })
      .done(function(response) {
        if (response.rcode === '00') {
          // Close modal
          bootstrap.Modal.getInstance(document.getElementById('rejectModal')).hide();
          
          // Refresh data from server
          fetchDeviceResetRequests();
          
          Swal.fire({
            icon: 'success',
            title: 'Ditolak',
            html: 'Permintaan reset device untuk <strong>' + request.nama + '</strong> telah ditolak.<br>' +
                  '<small class="text-muted">Email notifikasi telah dikirim.</small>',
            customClass: { confirmButton: 'btn btn-primary' },
            buttonsStyling: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: response.message || 'Gagal menolak permintaan',
            customClass: { confirmButton: 'btn btn-primary' },
            buttonsStyling: false
          });
        }
      })
      .fail(function() {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Terjadi kesalahan saat menghubungi server',
          customClass: { confirmButton: 'btn btn-primary' },
          buttonsStyling: false
        });
      });
  });

  // ============================================
  // MANUAL RESET FUNCTIONALITY
  // ============================================

  // Sample user list data (for manual reset)
  var userListData = [
    { npp: '12351', nama: 'Gita Permata', email: 'gita.permata@email.com', device_id: 'dev123456789abc', has_device: true },
    { npp: '12352', nama: 'Hendra Wijaya', email: 'hendra.wijaya@email.com', device_id: 'dev234567890bcd', has_device: true },
    { npp: '12353', nama: 'Indah Sari', email: 'indah.sari@email.com', device_id: 'dev345678901cde', has_device: true },
    { npp: '12354', nama: 'Joko Susanto', email: 'joko.susanto@email.com', device_id: 'dev456789012def', has_device: true },
    { npp: '12355', nama: 'Kartika Dewi', email: 'kartika.dewi@email.com', device_id: null, has_device: false },
    { npp: '12356', nama: 'Lukman Hakim', email: 'lukman.hakim@email.com', device_id: 'dev567890123efg', has_device: true },
    { npp: '12357', nama: 'Mega Putri', email: 'mega.putri@email.com', device_id: 'dev678901234fgh', has_device: true },
    { npp: '12358', nama: 'Nugroho Adi', email: 'nugroho.adi@email.com', device_id: null, has_device: false },
    { npp: '12359', nama: 'Oki Pratama', email: 'oki.pratama@email.com', device_id: 'dev789012345ghi', has_device: true },
    { npp: '12360', nama: 'Putri Ayu', email: 'putri.ayu@email.com', device_id: 'dev890123456hij', has_device: true }
  ];

  var currentManualResetUser = null;

  // Render user list
  function renderUserList(filter) {
    var filtered = userListData;
    if (filter) {
      var lowerFilter = filter.toLowerCase();
      filtered = userListData.filter(function (u) {
        return u.nama.toLowerCase().includes(lowerFilter) || u.npp.includes(lowerFilter);
      });
    }

    var html = '';
    if (filtered.length === 0) {
      html = '<div class="text-center text-muted py-4"><i class="ri-user-search-line ri-3x mb-2"></i><p>Tidak ditemukan karyawan</p></div>';
    } else {
      filtered.forEach(function (user) {
        var initials = user.nama.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
        var deviceBadge = user.has_device 
          ? '<span class="badge bg-label-primary">Device Aktif</span>' 
          : '<span class="badge bg-label-secondary">Belum Ada Device</span>';
        var resetBtn = user.has_device 
          ? '<button class="btn btn-sm btn-outline-warning select-user-reset" data-npp="' + user.npp + '"><i class="ri-refresh-line me-1"></i>Reset</button>'
          : '<button class="btn btn-sm btn-outline-secondary" disabled>-</button>';

        html += '<div class="d-flex align-items-center justify-content-between p-3 border rounded mb-2">' +
                '<div class="d-flex align-items-center">' +
                '<div class="avatar avatar-sm me-3"><span class="avatar-initial rounded-3 bg-label-primary">' + initials + '</span></div>' +
                '<div>' +
                '<span class="fw-medium">' + user.nama + '</span><br>' +
                '<small class="text-muted">NPP: ' + user.npp + '</small> ' + deviceBadge +
                '</div>' +
                '</div>' +
                resetBtn +
                '</div>';
      });
    }
    $('#userListForReset').html(html);
  }

  // Populate user list when offcanvas opens
  var offcanvasManualReset = document.getElementById('offcanvasManualReset');
  if (offcanvasManualReset) {
    offcanvasManualReset.addEventListener('shown.bs.offcanvas', function () {
      $('#searchUserForReset').val('');
      renderUserList('');
    });
  }

  // Search user for reset
  $('#searchUserForReset').on('keyup', function () {
    renderUserList($(this).val());
  });

  // Select user for manual reset
  $(document).on('click', '.select-user-reset', function () {
    var npp = $(this).data('npp');
    var user = userListData.find(function (u) { return u.npp === npp; });
    currentManualResetUser = user;

    if (user) {
      var initials = user.nama.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
      $('#manual-reset-avatar').text(initials);
      $('#manual-reset-nama').text(user.nama);
      $('#manual-reset-npp').val(user.npp);
      $('#manual-reset-npp-display').text('NPP: ' + user.npp);
      $('#manual-reset-device-id').text(user.device_id);
      $('#manual-reset-reason').val('');

      // Close offcanvas and open modal
      bootstrap.Offcanvas.getInstance(offcanvasManualReset).hide();
      
      setTimeout(function() {
        var modal = new bootstrap.Modal(document.getElementById('confirmManualResetModal'));
        modal.show();
      }, 300);
    }
  });

  // Confirm Manual Reset
  $('#btnConfirmManualReset').on('click', function () {
    if (!currentManualResetUser) return;

    var reason = $('#manual-reset-reason').val() || 'Reset manual oleh admin';

    // Simulate API call - In real implementation, call POST /deletedevice
    // Update user list (remove device)
    var idx = userListData.findIndex(function (u) { return u.npp === currentManualResetUser.npp; });
    if (idx !== -1) {
      userListData[idx].device_id = null;
      userListData[idx].has_device = false;
    }

    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('confirmManualResetModal')).hide();

    Swal.fire({
      icon: 'success',
      title: 'Device Berhasil Direset!',
      html: 'Device untuk <strong>' + currentManualResetUser.nama + '</strong> telah dihapus.<br>' +
            '<small class="text-muted">Karyawan dapat login dengan device baru.</small>',
      customClass: { confirmButton: 'btn btn-primary' },
      buttonsStyling: false
    });

    currentManualResetUser = null;
  });

  // ============================================
  // ACTION BUTTONS
  // ============================================
  
  // Refresh button handler
  $('#btnRefreshRequests').on('click', function() {
    fetchDeviceResetRequests();
    Swal.fire({
      icon: 'success',
      title: 'Data Diperbarui',
      text: 'Data permintaan reset device berhasil dimuat ulang',
      timer: 1500,
      showConfirmButton: false
    });
  });

  // Export Excel handler
  $('#exportExcel').on('click', function() {
    Swal.fire({
      icon: 'info',
      title: 'Ekspor Excel',
      text: 'Fitur ekspor ke Excel akan segera tersedia',
      customClass: { confirmButton: 'btn btn-primary' },
      buttonsStyling: false
    });
  });

  // Export PDF handler
  $('#exportPDF').on('click', function() {
    Swal.fire({
      icon: 'info',
      title: 'Ekspor PDF',
      text: 'Fitur ekspor ke PDF akan segera tersedia',
      customClass: { confirmButton: 'btn btn-primary' },
      buttonsStyling: false
    });
  });

  // ============================================
  // POLLING FOR NEW REQUESTS
  // ============================================
  var lastPendingCount = 0;
  
  function updateSidebarBadge(count) {
    var badgeElement = $('#device-reset-badge');
    if (badgeElement.length) {
      badgeElement.text(count);
      if (count === 0) {
        badgeElement.hide();
      } else {
        badgeElement.show();
      }
    }
  }
  
  function checkNewRequests() {
    apiCallReq('/device-reset/pending', 'GET')
      .done(function(response) {
        if (response.rcode === '00' && response.data) {
          var currentPending = response.total_pending || response.data.length;
          
          // Update sidebar badge
          updateSidebarBadge(currentPending);
          
          if (lastPendingCount > 0 && currentPending > lastPendingCount) {
            var newCount = currentPending - lastPendingCount;
            Swal.fire({
              icon: 'info',
              title: 'Request Baru!',
              html: 'Ada <strong>' + newCount + '</strong> permintaan reset device baru',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 5000,
              timerProgressBar: true
            });
            fetchDeviceResetRequests();
          }
          lastPendingCount = currentPending;
        }
      });
  }
  
  setInterval(checkNewRequests, 30000);
  setTimeout(function() { 
    checkNewRequests(); 
    lastPendingCount = requestsData.filter(function(r) { return r.status === 'pending'; }).length;
  }, 2000);
});
