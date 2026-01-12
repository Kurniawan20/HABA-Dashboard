@extends('layouts/layoutMaster')

@section('title', 'Reset Perangkat - Absensi')

<!-- Vendor Styles -->
@section('vendor-style')
@vite([
  'resources/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.scss',
  'resources/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.scss',
  'resources/assets/vendor/libs/sweetalert2/sweetalert2.scss',
  'resources/assets/vendor/libs/flatpickr/flatpickr.scss'
])
@endsection

@section('vendor-script')
@vite([
  'resources/assets/vendor/libs/moment/moment.js',
  'resources/assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
  'resources/assets/vendor/libs/sweetalert2/sweetalert2.js',
  'resources/assets/vendor/libs/flatpickr/flatpickr.js'
])
@endsection

@section('page-script')
@vite(['resources/assets/js/app-device-reset.js'])
@endsection

@section('content')
<!-- Info Banner -->
<div class="row mb-6">
  <div class="col-12">
    <div class="alert alert-primary d-flex align-items-start mb-0" role="alert">
      <i class="ri-smartphone-line ri-22px me-3 mt-1"></i>
      <div>
        <strong>Permintaan Reset Perangkat</strong><br>
        <small>User mobile dapat mengajukan permintaan reset device melalui aplikasi. Admin dapat menyetujui atau menolak permintaan tersebut. 
        Setelah disetujui, user dapat login dengan perangkat baru.</small>
      </div>
    </div>
  </div>
</div>
<!--/ Info Banner -->

<!-- Statistics Cards -->
<div class="row gy-6 mb-6">
  <div class="col-lg-3 col-sm-6">
    <div class="card h-100">
      <div class="card-body">
        <div class="d-flex align-items-center flex-wrap">
          <div class="avatar me-4">
            <div class="avatar-initial bg-label-warning rounded-3">
              <i class="ri-time-line ri-24px"></i>
            </div>
          </div>
          <div class="card-info">
            <div class="d-flex align-items-center">
              <h5 class="mb-0 me-2" id="stat-pending">3</h5>
            </div>
            <p class="mb-0">Menunggu Approval</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="col-lg-3 col-sm-6">
    <div class="card h-100">
      <div class="card-body">
        <div class="d-flex align-items-center flex-wrap">
          <div class="avatar me-4">
            <div class="avatar-initial bg-label-primary rounded-3">
              <i class="ri-check-double-line ri-24px"></i>
            </div>
          </div>
          <div class="card-info">
            <div class="d-flex align-items-center">
              <h5 class="mb-0 me-2" id="stat-approved">12</h5>
            </div>
            <p class="mb-0">Disetujui</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="col-lg-3 col-sm-6">
    <div class="card h-100">
      <div class="card-body">
        <div class="d-flex align-items-center flex-wrap">
          <div class="avatar me-4">
            <div class="avatar-initial bg-label-danger rounded-3">
              <i class="ri-close-circle-line ri-24px"></i>
            </div>
          </div>
          <div class="card-info">
            <div class="d-flex align-items-center">
              <h5 class="mb-0 me-2" id="stat-rejected">2</h5>
            </div>
            <p class="mb-0">Ditolak</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="col-lg-3 col-sm-6">
    <div class="card h-100">
      <div class="card-body">
        <div class="d-flex align-items-center flex-wrap">
          <div class="avatar me-4">
            <div class="avatar-initial bg-label-info rounded-3">
              <i class="ri-file-list-3-line ri-24px"></i>
            </div>
          </div>
          <div class="card-info">
            <div class="d-flex align-items-center">
              <h5 class="mb-0 me-2" id="stat-total">17</h5>
            </div>
            <p class="mb-0">Total Request</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<!--/ Statistics Cards -->


<!-- Requests Table -->
<div class="card">
  <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
    <h5 class="mb-0">Permintaan Reset Perangkat</h5>
    <div class="d-flex align-items-center gap-2 flex-nowrap">
      <div class="form-floating form-floating-outline" style="width: 150px;">
        <select class="form-select" id="filter-status">
          <option value="">Semua</option>
          <option value="pending" selected>Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <label>Status</label>
      </div>
      <div class="form-floating form-floating-outline" style="width: 200px;">
        <input type="text" class="form-control flatpickr-range" id="filter-date" placeholder="Pilih Tanggal">
        <label>Rentang Tanggal</label>
      </div>
      <div class="input-group input-group-merge" style="width: 200px;">
        <span class="input-group-text"><i class="ri-search-line"></i></span>
        <input type="text" class="form-control" id="searchRequest" placeholder="Cari NPP/Nama...">
      </div>
      <button type="button" class="btn btn-outline-secondary" id="btnRefreshRequests">
        <i class="ri-refresh-line me-1"></i>Refresh
      </button>
      <div class="btn-group">
        <button type="button" class="btn btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="ri-download-line me-1"></i>Ekspor
        </button>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="javascript:void(0);" id="exportExcel"><i class="ri-file-excel-line me-2"></i>Excel</a></li>
          <li><a class="dropdown-item" href="javascript:void(0);" id="exportPDF"><i class="ri-file-pdf-line me-2"></i>PDF</a></li>
        </ul>
      </div>
    </div>
  </div>
  <div class="card-datatable table-responsive">
    <table class="datatables-device-reset table table-hover">
      <thead>
        <tr>
          <th></th>
          <th>Tanggal Request</th>
          <th>Karyawan</th>
          <th>Device ID Lama</th>
          <th>Alasan</th>
          <th>Status</th>
          <th>Diproses Oleh</th>
          <th>Aksi</th>
        </tr>
      </thead>
    </table>
  </div>
</div>
<!--/ Requests Table -->

<!-- Manual Reset User Table -->
<div class="card mt-6">
  <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
    <div>
      <h5 class="mb-0"><i class="ri-refresh-line me-2"></i>Reset Device Manual</h5>
      <small class="text-muted">Pilih karyawan untuk reset device secara manual tanpa menunggu request</small>
    </div>
    <div class="d-flex align-items-center gap-3 flex-wrap">
      <div class="form-floating form-floating-outline" style="width: 180px;">
        <select class="form-select" id="filter-branch-manual">
          <option value="">Semua Cabang</option>
        </select>
        <label>Cabang</label>
      </div>
      <div class="input-group input-group-merge" style="width: 220px;">
        <span class="input-group-text"><i class="ri-search-line"></i></span>
        <input type="text" class="form-control" id="searchUserManual" placeholder="Cari NPP/Nama...">
      </div>
    </div>
  </div>
  <div class="card-datatable table-responsive">
    <table class="datatables-manual-reset table table-hover">
      <thead>
        <tr>
          <th></th>
          <th>NPP</th>
          <th>Nama Karyawan</th>
          <th>Cabang</th>
          <th>Device ID</th>
          <th>Status Device</th>
          <th>Aksi</th>
        </tr>
      </thead>
    </table>
  </div>
</div>
<!--/ Manual Reset User Table -->

<!-- View Request Modal -->
<div class="modal fade" id="viewRequestModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Detail Permintaan</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="d-flex align-items-center mb-4">
          <div class="avatar avatar-lg me-3">
            <span class="avatar-initial rounded-3 bg-label-primary" id="view-avatar">JD</span>
          </div>
          <div>
            <h5 class="mb-0" id="view-nama">John Doe</h5>
            <small class="text-muted" id="view-npp">NPP: 12345</small>
          </div>
        </div>
        <table class="table table-borderless">
          <tr>
            <td class="fw-medium" style="width: 40%;">Email</td>
            <td id="view-email">john@email.com</td>
          </tr>
          <tr>
            <td class="fw-medium">Tanggal Request</td>
            <td id="view-tanggal">15 Jan 2024, 08:00</td>
          </tr>
          <tr>
            <td class="fw-medium">Device ID Lama</td>
            <td><code id="view-device-id">abc123xyz...</code></td>
          </tr>
          <tr>
            <td class="fw-medium">Alasan</td>
            <td id="view-reason">HP hilang dan sudah beli baru</td>
          </tr>
          <tr>
            <td class="fw-medium">Status</td>
            <td id="view-status"><span class="badge bg-label-warning">Pending</span></td>
          </tr>
          <tr id="view-processed-row" style="display: none;">
            <td class="fw-medium">Diproses Oleh</td>
            <td id="view-processed-by">-</td>
          </tr>
          <tr id="view-processed-at-row" style="display: none;">
            <td class="fw-medium">Waktu Diproses</td>
            <td id="view-processed-at">-</td>
          </tr>
          <tr id="view-admin-notes-row" style="display: none;">
            <td class="fw-medium">Catatan Admin</td>
            <td id="view-admin-notes">-</td>
          </tr>
        </table>
      </div>
      <div class="modal-footer" id="view-actions">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Tutup</button>
        <button type="button" class="btn btn-danger" id="btnRejectFromView">
          <i class="ri-close-line me-1"></i>Tolak
        </button>
        <button type="button" class="btn btn-primary" id="btnApproveFromView">
          <i class="ri-check-line me-1"></i>Setujui
        </button>
      </div>
    </div>
  </div>
</div>
<!--/ View Request Modal -->

<!-- Reject Modal -->
<div class="modal fade" id="rejectModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header bg-danger">
        <h5 class="modal-title text-white"><i class="ri-close-circle-line me-2"></i>Tolak Permintaan</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="reject-id">
        <div class="text-center mb-4">
          <p>Anda akan menolak permintaan reset device dari:</p>
          <h5 id="reject-nama">John Doe</h5>
          <small class="text-muted" id="reject-npp">NPP: 12345</small>
        </div>
        <div class="form-floating form-floating-outline">
          <textarea class="form-control" id="reject-reason" rows="3" placeholder="Masukkan alasan penolakan..." required style="height: 100px;"></textarea>
          <label for="reject-reason">Alasan Penolakan <span class="text-danger">*</span></label>
        </div>
        <small class="text-muted">Minimal 10 karakter. Alasan ini akan dikirim ke email karyawan.</small>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
        <button type="button" class="btn btn-danger" id="btnConfirmReject">
          <i class="ri-close-line me-1"></i>Tolak Permintaan
        </button>
      </div>
    </div>
  </div>
</div>
<!--/ Reject Modal -->


<!-- Confirm Manual Reset Modal -->
<div class="modal fade" id="confirmManualResetModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header bg-warning">
        <h5 class="modal-title text-white"><i class="ri-smartphone-line me-2"></i>Reset Device Manual</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="manual-reset-npp">
        <div class="text-center mb-4">
          <div class="avatar avatar-lg mb-3">
            <span class="avatar-initial rounded-3 bg-label-primary" id="manual-reset-avatar">JD</span>
          </div>
          <h5 id="manual-reset-nama">John Doe</h5>
          <small class="text-muted" id="manual-reset-npp-display">NPP: 12345</small>
        </div>
        <div class="alert alert-secondary d-flex align-items-start mb-4" role="alert">
          <i class="ri-information-line ri-20px me-2 mt-1"></i>
          <div>
            <small><strong>Device saat ini:</strong><br><code id="manual-reset-device-id">abc123xyz...</code></small>
          </div>
        </div>
        <div class="form-floating form-floating-outline mb-3">
          <textarea class="form-control" id="manual-reset-reason" rows="2" placeholder="Alasan reset..." style="height: 80px;"></textarea>
          <label for="manual-reset-reason">Alasan Reset (opsional)</label>
        </div>
        <p class="text-center text-muted mb-0">
          <small>Dengan menekan tombol reset, device lama akan dihapus dan karyawan dapat login dengan device baru.</small>
        </p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
        <button type="button" class="btn btn-warning" id="btnConfirmManualReset">
          <i class="ri-refresh-line me-1"></i>Reset Device
        </button>
      </div>
    </div>
  </div>
</div>
<!--/ Confirm Manual Reset Modal -->
@endsection
