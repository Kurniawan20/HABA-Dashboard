/**
 * Page Pengaturan Jam Absensi (Attendance Time Settings)
 * With Real API Integration
 */

'use strict';

$(function () {
  var dt_settings = $('.datatables-time-settings');
  var dt = null;

  // API Base URL - Read from meta tag (configured in .env)
  var API_BASE_URL = $('meta[name="api-base-url"]').attr('content') || 'http://localhost:8080/api';
  var API_TOKEN = localStorage.getItem('api_token') || '';

  // Store settings data
  var settingsData = [];

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
        $('.datatables-time-settings').addClass('opacity-50');
      },
      complete: function() {
        $('.datatables-time-settings').removeClass('opacity-50');
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

  // Format time (remove seconds if present)
  function formatTime(time) {
    if (!time) return '-';
    return time.substring(0, 5);
  }

  // Fetch all settings from API
  function fetchSettings() {
    apiCall('/jam-absensi', 'GET')
      .done(function(response) {
        if (response.rcode === '00' && response.data) {
          settingsData = Array.isArray(response.data) ? response.data : [];
          dt.clear().rows.add(settingsData).draw();
          updateActiveCard();
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

  // Update active setting card
  function updateActiveCard() {
    var active = settingsData.find(function (s) { return s.is_active; });
    if (active) {
      $('#active-setting-name').text(active.nama);
      $('#active-jam-masuk').text(formatTime(active.start_jam_masuk) + ' - ' + formatTime(active.end_jam_masuk));
      $('#active-jam-pulang').text(formatTime(active.start_jam_pulang) + ' - ' + formatTime(active.end_jam_pulang));
    } else {
      $('#active-setting-name').text('Tidak ada');
      $('#active-jam-masuk').text('-');
      $('#active-jam-pulang').text('-');
    }
  }

  // Load sample data as fallback
  function loadSampleData() {
    settingsData = [
      { id: 1, nama: 'Default', start_jam_masuk: '07:30:00', end_jam_masuk: '09:00:00', start_jam_pulang: '13:00:00', end_jam_pulang: '18:00:00', is_active: true },
      { id: 2, nama: 'Shift Pagi', start_jam_masuk: '06:00:00', end_jam_masuk: '08:00:00', start_jam_pulang: '14:00:00', end_jam_pulang: '16:00:00', is_active: false }
    ];
    dt.clear().rows.add(settingsData).draw();
    updateActiveCard();
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

  // Initialize time pickers
  if ($('.time-picker').length && typeof flatpickr !== 'undefined') {
    $('.time-picker').flatpickr({
      enableTime: true,
      noCalendar: true,
      dateFormat: 'H:i',
      time_24hr: true
    });
  }

  // Initialize DataTable
  if (dt_settings.length) {
    dt = dt_settings.DataTable({
      data: [],
      columns: [
        { data: '' },
        { data: 'nama' },
        { data: '' },
        { data: '' },
        { data: 'is_active' },
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
          render: function (data, type, full) {
            var badge = full.is_active ? '<span class="badge bg-primary ms-2">Aktif</span>' : '';
            return '<span class="fw-medium">' + data + '</span>' + badge;
          }
        },
        {
          targets: 2,
          render: function (data, type, full) {
            return '<span class="text-primary"><i class="ri-login-box-line me-1"></i>' + formatTime(full.start_jam_masuk) + '</span> - ' +
                   '<span class="text-warning">' + formatTime(full.end_jam_masuk) + '</span>';
          }
        },
        {
          targets: 3,
          render: function (data, type, full) {
            return '<span class="text-info"><i class="ri-logout-box-line me-1"></i>' + formatTime(full.start_jam_pulang) + '</span> - ' +
                   '<span class="text-secondary">' + formatTime(full.end_jam_pulang) + '</span>';
          }
        },
        {
          targets: 4,
          render: function (data) {
            return data 
              ? '<span class="badge bg-label-primary">Aktif</span>'
              : '<span class="badge bg-label-secondary">Tidak Aktif</span>';
          }
        },
        {
          targets: -1,
          title: 'Aksi',
          orderable: false,
          render: function (data, type, full) {
            var setActiveBtn = full.is_active ? '' : 
              '<li><a href="javascript:;" class="dropdown-item set-active" data-id="' + full.id + '" data-nama="' + full.nama + '"><i class="ri-check-double-line me-2"></i>Set Aktif</a></li>';
            var deleteBtn = settingsData.length > 1 && !full.is_active ? 
              '<li><div class="dropdown-divider"></div></li><li><a href="javascript:;" class="dropdown-item text-danger delete-setting" data-id="' + full.id + '" data-nama="' + full.nama + '"><i class="ri-delete-bin-7-line me-2"></i>Hapus</a></li>' : '';
            
            return (
              '<div class="d-inline-block">' +
              '<a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-line"></i></a>' +
              '<ul class="dropdown-menu dropdown-menu-end m-0">' +
              setActiveBtn +
              '<li><a href="javascript:;" class="dropdown-item edit-setting" data-id="' + full.id + '"><i class="ri-edit-box-line me-2"></i>Edit</a></li>' +
              deleteBtn +
              '</ul>' +
              '</div>'
            );
          }
        }
      ],
      order: [[4, 'desc'], [1, 'asc']],
      dom: "<'row'<'col-sm-12'tr>><'row'<'col-sm-12 col-md-6'i><'col-sm-12 col-md-6 dataTables_pager'p>>",
      language: {
        sLengthMenu: 'Tampilkan _MENU_',
        info: 'Menampilkan _START_ sampai _END_ dari _TOTAL_ pengaturan',
        infoEmpty: 'Tidak ada data',
        paginate: {
          next: '<i class="ri-arrow-right-s-line"></i>',
          previous: '<i class="ri-arrow-left-s-line"></i>'
        },
        emptyTable: 'Tidak ada pengaturan jam',
        zeroRecords: 'Tidak ditemukan pengaturan yang cocok'
      },
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              return 'Detail Pengaturan ' + row.data().nama;
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
    fetchSettings();
  }

  // Add Setting - Save Button
  $('#btnSaveAddSetting').on('click', function () {
    var newSetting = {
      nama: $('#add-nama').val(),
      start_jam_masuk: $('#add-start-masuk').val() + ':00',
      end_jam_masuk: $('#add-end-masuk').val() ? $('#add-end-masuk').val() + ':00' : null,
      start_jam_pulang: $('#add-start-pulang').val() + ':00',
      end_jam_pulang: $('#add-end-pulang').val() ? $('#add-end-pulang').val() + ':00' : null,
      is_active: $('#add-is-active').is(':checked')
    };

    if (!newSetting.nama || !newSetting.start_jam_masuk || !newSetting.start_jam_pulang) {
      showError('Mohon lengkapi field yang wajib diisi!');
      return;
    }

    apiCall('/jam-absensi', 'POST', newSetting)
      .done(function(response) {
        if (response.rcode === '00') {
          bootstrap.Modal.getInstance(document.getElementById('addSettingModal')).hide();
          $('#formAddSetting')[0].reset();
          showSuccess('Berhasil', 'Pengaturan jam baru berhasil ditambahkan!');
          fetchSettings();
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

  // Edit Setting - Initialize time pickers when modal opens
  $('#editSettingModal').on('shown.bs.modal', function () {
    if (typeof flatpickr !== 'undefined' && !$('.time-picker-edit').hasClass('flatpickr-input')) {
      $('.time-picker-edit').flatpickr({
        enableTime: true,
        noCalendar: true,
        dateFormat: 'H:i',
        time_24hr: true
      });
    }
  });

  // Open Edit Modal
  $(document).on('click', '.edit-setting', function () {
    var id = $(this).data('id');
    var setting = settingsData.find(function (s) { return s.id === id; });

    if (setting) {
      $('#edit-id').val(setting.id);
      $('#edit-nama').val(setting.nama);
      $('#edit-start-masuk').val(formatTime(setting.start_jam_masuk));
      $('#edit-end-masuk').val(formatTime(setting.end_jam_masuk));
      $('#edit-start-pulang').val(formatTime(setting.start_jam_pulang));
      $('#edit-end-pulang').val(formatTime(setting.end_jam_pulang));

      var modal = new bootstrap.Modal(document.getElementById('editSettingModal'));
      modal.show();
    }
  });

  // Save Edit - with API
  $('#btnSaveEditSetting').on('click', function () {
    var id = parseInt($('#edit-id').val());

    var updateData = {
      nama: $('#edit-nama').val(),
      start_jam_masuk: $('#edit-start-masuk').val() + ':00',
      end_jam_masuk: $('#edit-end-masuk').val() ? $('#edit-end-masuk').val() + ':00' : null,
      start_jam_pulang: $('#edit-start-pulang').val() + ':00',
      end_jam_pulang: $('#edit-end-pulang').val() ? $('#edit-end-pulang').val() + ':00' : null
    };

    apiCall('/jam-absensi/' + id, 'PUT', updateData)
      .done(function(response) {
        if (response.rcode === '00') {
          bootstrap.Modal.getInstance(document.getElementById('editSettingModal')).hide();
          showSuccess('Berhasil', 'Pengaturan jam berhasil diperbarui!');
          fetchSettings();
        } else {
          showError('Gagal memperbarui: ' + response.message);
        }
      })
      .fail(function() {
        showError('Gagal memperbarui data. Silakan coba lagi.');
      });
  });

  // Set Active - with API
  $(document).on('click', '.set-active', function () {
    var id = $(this).data('id');
    var nama = $(this).data('nama');

    Swal.fire({
      title: 'Aktifkan Pengaturan?',
      html: 'Anda yakin ingin mengaktifkan <strong>' + nama + '</strong>?<br><small class="text-muted">Pengaturan lain akan dinonaktifkan.</small>',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '<i class="ri-check-line me-1"></i>Ya, Aktifkan',
      cancelButtonText: 'Batal',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-secondary ms-2'
      },
      buttonsStyling: false
    }).then(function (result) {
      if (result.isConfirmed) {
        apiCall('/jam-absensi/' + id + '/set-active', 'POST', {})
          .done(function(response) {
            if (response.rcode === '00') {
              showSuccess('Berhasil!', 'Pengaturan ' + nama + ' berhasil diaktifkan.');
              fetchSettings();
            } else {
              showError('Gagal mengaktifkan: ' + response.message);
            }
          })
          .fail(function() {
            showError('Gagal mengaktifkan pengaturan. Silakan coba lagi.');
          });
      }
    });
  });

  // Delete Setting - with API
  $(document).on('click', '.delete-setting', function () {
    var id = $(this).data('id');
    var nama = $(this).data('nama');

    Swal.fire({
      title: 'Hapus Pengaturan?',
      html: 'Anda yakin ingin menghapus <strong>' + nama + '</strong>?<br><small class="text-muted">Tindakan ini tidak dapat dibatalkan.</small>',
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
        apiCall('/jam-absensi/' + id, 'DELETE')
          .done(function(response) {
            if (response.rcode === '00') {
              showSuccess('Terhapus!', 'Pengaturan ' + nama + ' berhasil dihapus.');
              fetchSettings();
            } else {
              showError('Gagal menghapus: ' + response.message);
            }
          })
          .fail(function(xhr) {
            var msg = 'Gagal menghapus data.';
            if (xhr.responseJSON && xhr.responseJSON.message) {
              msg = xhr.responseJSON.message;
            }
            showError(msg);
          });
      }
    });
  });
});
