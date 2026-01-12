/**
 * Page Manajemen Kantor/Cabang (Branch Management)
 * With Real API Integration
 */

'use strict';

$(function () {
  var dt_branch = $('.datatables-branch-management');
  var addMap = null;
  var addMarker = null;
  var editMap = null;
  var editMarker = null;
  var viewMap = null;
  var viewMarker = null;
  var dt = null;

  // API Base URL - Read from meta tag (configured in .env)
  var API_BASE_URL = $('meta[name="api-base-url"]').attr('content') || 'http://localhost:8080/api';
  var API_TOKEN = localStorage.getItem('api_token') || '';

  // Store branch data
  var branchData = [];

  // Helper function to make API calls
  function apiCall(endpoint, method, data) {
    var ajaxConfig = {
      url: API_BASE_URL + endpoint,
      method: method || 'GET',
      headers: {
        'Authorization': 'Bearer ' + API_TOKEN,
        'Accept': 'application/json'
      },
      beforeSend: function() {
        $('.datatables-branch-management').addClass('opacity-50');
      },
      complete: function() {
        $('.datatables-branch-management').removeClass('opacity-50');
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

  // Fetch all branches from API (handles pagination)
  function fetchBranches() {
    apiCall('/branches', 'GET', { per_page: 500 }) // Request more items to reduce pages
      .done(function(response) {
        if (response.rcode === '00' && response.data) {
          // Handle paginated response - data is inside response.data.data
          if (Array.isArray(response.data)) {
            branchData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            branchData = response.data.data;
            
            // If there are more pages, show total info
            if (response.data.total) {
              console.log('Loaded ' + branchData.length + ' of ' + response.data.total + ' branches');
            }
          } else {
            branchData = [];
          }
          
          dt.clear().rows.add(branchData).draw();
          updateStatistics(response.data.total || branchData.length);
        } else {
          console.error('API Error:', response.message);
          loadSampleData();
        }
      })
      .fail(function() {
        console.log('API unavailable, loading sample data');
        loadSampleData();
      });
  }

  // Update statistics cards
  function updateStatistics(total) {
    var totalBranches = total || branchData.length;
    $('#stat-total-branches').text(totalBranches);
    // Count displayed data
    var jakartaBranches = branchData.filter(function(b) { return b.kode_kantor && b.kode_kantor.startsWith('JKT'); }).length;
    var otherBranches = branchData.length - jakartaBranches;
    $('#stat-jakarta').text(jakartaBranches || 1);
    $('#stat-other').text(otherBranches || branchData.length - 1);
  }

  // Load sample data as fallback
  function loadSampleData() {
    branchData = [
      { id: 1, kode_kantor: 'HO001', nama_kantor: 'Kantor Pusat Jakarta', latitude: '-6.2088', longitude: '106.8456', radius: 50 },
      { id: 2, kode_kantor: 'JKT001', nama_kantor: 'Cabang Jakarta Selatan', latitude: '-6.2615', longitude: '106.8106', radius: 75 },
      { id: 3, kode_kantor: 'JKT002', nama_kantor: 'Cabang Jakarta Barat', latitude: '-6.1683', longitude: '106.7588', radius: 100 },
      { id: 4, kode_kantor: 'BDG001', nama_kantor: 'Cabang Bandung', latitude: '-6.9175', longitude: '107.6191', radius: 50 },
      { id: 5, kode_kantor: 'SBY001', nama_kantor: 'Cabang Surabaya', latitude: '-7.2575', longitude: '112.7521', radius: 75 }
    ];
    dt.clear().rows.add(branchData).draw();
    updateStatistics();
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

  // Show success message
  function showSuccess(title, message) {
    Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      customClass: { confirmButton: 'btn btn-primary' },
      buttonsStyling: false
    });
  }

  // Initialize DataTable
  if (dt_branch.length) {
    dt = dt_branch.DataTable({
      data: [],
      columns: [
        { data: '' },
        { data: 'kode_kantor' },
        { data: 'nama_kantor' },
        { data: 'latitude' },
        { data: 'longitude' },
        { data: 'radius' },
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
          render: function (data) {
            return '<span class="fw-medium">' + (data || '-') + '</span>';
          }
        },
        {
          targets: 3,
          render: function (data) {
            return '<code>' + data + '</code>';
          }
        },
        {
          targets: 4,
          render: function (data) {
            return '<code>' + data + '</code>';
          }
        },
        {
          targets: 5,
          render: function (data) {
            return '<span class="badge bg-label-info">' + data + 'm</span>';
          }
        },
        {
          targets: -1,
          title: 'Aksi',
          orderable: false,
          render: function (data, type, full) {
            return (
              '<div class="d-inline-block">' +
              '<a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-line"></i></a>' +
              '<ul class="dropdown-menu dropdown-menu-end m-0">' +
              '<li><a href="javascript:;" class="dropdown-item view-branch" data-id="' + full.id + '"><i class="ri-eye-line me-2"></i>Lihat</a></li>' +
              '<li><a href="javascript:;" class="dropdown-item edit-branch" data-id="' + full.id + '"><i class="ri-edit-box-line me-2"></i>Edit</a></li>' +
              '<li><div class="dropdown-divider"></div></li>' +
              '<li><a href="javascript:;" class="dropdown-item text-danger delete-branch" data-id="' + full.id + '" data-kode="' + full.kode_kantor + '"><i class="ri-delete-bin-7-line me-2"></i>Hapus</a></li>' +
              '</ul>' +
              '</div>'
            );
          }
        }
      ],
      order: [[1, 'asc']],
      dom: "<'row'<'col-sm-12'tr>><'row'<'col-sm-12 col-md-6'i><'col-sm-12 col-md-6 dataTables_pager'p>>",
      language: {
        sLengthMenu: 'Tampilkan _MENU_',
        search: '',
        searchPlaceholder: 'Cari...',
        info: 'Menampilkan _START_ sampai _END_ dari _TOTAL_ kantor',
        infoEmpty: 'Tidak ada data',
        paginate: {
          next: '<i class="ri-arrow-right-s-line"></i>',
          previous: '<i class="ri-arrow-left-s-line"></i>'
        },
        emptyTable: 'Tidak ada data kantor',
        zeroRecords: 'Tidak ditemukan kantor yang cocok'
      },
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              return 'Detail Kantor ' + row.data().kode_kantor;
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

    // Search
    $('#searchBranch').on('keyup', function () {
      dt.search($(this).val()).draw();
    });

    // Initial data load
    fetchBranches();
  }

  // Initialize Add Map when offcanvas opens
  var offcanvasAdd = document.getElementById('offcanvasAddBranch');
  if (offcanvasAdd) {
    offcanvasAdd.addEventListener('shown.bs.offcanvas', function () {
      if (!addMap && typeof L !== 'undefined') {
        addMap = L.map('branchLocationMap').setView([-6.2088, 106.8456], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(addMap);

        addMap.on('click', function (e) {
          var lat = e.latlng.lat.toFixed(6);
          var lng = e.latlng.lng.toFixed(6);
          $('#add-latitude').val(lat);
          $('#add-longitude').val(lng);

          if (addMarker) {
            addMap.removeLayer(addMarker);
          }
          addMarker = L.marker([lat, lng]).addTo(addMap);
        });
      } else if (addMap) {
        addMap.invalidateSize();
      }
    });
  }

  // Add Branch Form Submit - with API
  $('#formAddBranch').on('submit', function (e) {
    e.preventDefault();

    var newBranch = {
      kode_kantor: $('#add-kode-kantor').val(),
      nama_kantor: $('#add-nama-kantor').val(),
      latitude: $('#add-latitude').val(),
      longitude: $('#add-longitude').val(),
      radius: parseInt($('#add-radius').val()) || 50
    };

    if (!newBranch.kode_kantor || !newBranch.latitude || !newBranch.longitude) {
      showError('Kode Kantor, Latitude, dan Longitude wajib diisi!');
      return;
    }

    apiCall('/branches', 'POST', newBranch)
      .done(function(response) {
        if (response.rcode === '00') {
          // Close offcanvas and reset form
          bootstrap.Offcanvas.getInstance(offcanvasAdd).hide();
          $('#formAddBranch')[0].reset();
          if (addMarker) {
            addMap.removeLayer(addMarker);
            addMarker = null;
          }

          showSuccess('Berhasil', 'Kantor baru berhasil ditambahkan!');
          fetchBranches(); // Refresh data
        } else {
          showError('Gagal menambahkan: ' + response.message);
        }
      })
      .fail(function(xhr) {
        var msg = 'Gagal menambahkan data.';
        if (xhr.responseJSON && xhr.responseJSON.message) {
          msg = xhr.responseJSON.message;
        }
        showError(msg);
      });
  });

  // View Branch
  $(document).on('click', '.view-branch', function () {
    var id = $(this).data('id');
    var branch = branchData.find(function (b) { return b.id === id; });

    if (branch) {
      $('#view-kode-kantor').text(branch.kode_kantor);
      $('#view-nama-kantor').text(branch.nama_kantor || '-');
      $('#view-latitude').text(branch.latitude);
      $('#view-longitude').text(branch.longitude);
      $('#view-radius').text(branch.radius + ' meter');

      var modal = new bootstrap.Modal(document.getElementById('viewBranchModal'));
      modal.show();

      // Initialize view map
      setTimeout(function () {
        if (viewMap) {
          viewMap.remove();
        }
        viewMap = L.map('viewBranchLocationMap').setView([parseFloat(branch.latitude), parseFloat(branch.longitude)], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(viewMap);

        viewMarker = L.marker([parseFloat(branch.latitude), parseFloat(branch.longitude)]).addTo(viewMap);
        L.circle([parseFloat(branch.latitude), parseFloat(branch.longitude)], {
          radius: branch.radius,
          color: '#026443',
          fillColor: '#026443',
          fillOpacity: 0.2
        }).addTo(viewMap);
      }, 300);
    }
  });

  // Edit Branch
  $(document).on('click', '.edit-branch', function () {
    var id = $(this).data('id');
    var branch = branchData.find(function (b) { return b.id === id; });

    if (branch) {
      $('#edit-branch-id').val(branch.id);
      $('#edit-kode-kantor').val(branch.kode_kantor);
      $('#edit-nama-kantor').val(branch.nama_kantor);
      $('#edit-latitude').val(branch.latitude);
      $('#edit-longitude').val(branch.longitude);
      $('#edit-radius').val(branch.radius);

      var modal = new bootstrap.Modal(document.getElementById('editBranchModal'));
      modal.show();

      setTimeout(function () {
        if (editMap) {
          editMap.remove();
        }
        editMap = L.map('editBranchLocationMap').setView([parseFloat(branch.latitude), parseFloat(branch.longitude)], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(editMap);

        editMarker = L.marker([parseFloat(branch.latitude), parseFloat(branch.longitude)]).addTo(editMap);

        editMap.on('click', function (e) {
          var lat = e.latlng.lat.toFixed(6);
          var lng = e.latlng.lng.toFixed(6);
          $('#edit-latitude').val(lat);
          $('#edit-longitude').val(lng);

          if (editMarker) {
            editMap.removeLayer(editMarker);
          }
          editMarker = L.marker([lat, lng]).addTo(editMap);
        });
      }, 300);
    }
  });

  // Save Edit - with API
  $('#btnSaveEditBranch').on('click', function () {
    var id = parseInt($('#edit-branch-id').val());

    var updateData = {
      kode_kantor: $('#edit-kode-kantor').val(),
      nama_kantor: $('#edit-nama-kantor').val(),
      latitude: $('#edit-latitude').val(),
      longitude: $('#edit-longitude').val(),
      radius: parseInt($('#edit-radius').val()) || 50
    };

    apiCall('/branches/' + id, 'PUT', updateData)
      .done(function(response) {
        if (response.rcode === '00') {
          bootstrap.Modal.getInstance(document.getElementById('editBranchModal')).hide();
          showSuccess('Berhasil', 'Data kantor berhasil diperbarui!');
          fetchBranches(); // Refresh data
        } else {
          showError('Gagal memperbarui: ' + response.message);
        }
      })
      .fail(function() {
        showError('Gagal memperbarui data. Silakan coba lagi.');
      });
  });

  // Delete Branch - with API
  $(document).on('click', '.delete-branch', function () {
    var id = $(this).data('id');
    var kode = $(this).data('kode');

    Swal.fire({
      title: 'Hapus Kantor?',
      html: 'Anda yakin ingin menghapus kantor <strong>' + kode + '</strong>?<br><small class="text-muted">Tindakan ini tidak dapat dibatalkan.</small>',
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
        apiCall('/branches/' + id, 'DELETE')
          .done(function(response) {
            if (response.rcode === '00') {
              showSuccess('Terhapus!', 'Kantor ' + kode + ' berhasil dihapus.');
              fetchBranches(); // Refresh data
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
});
