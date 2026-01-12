@extends('layouts/layoutMaster')

@section('title', 'Detail Kehadiran - Absensi')

@section('vendor-style')
@vite([
  'resources/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.scss',
  'resources/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.scss',
  'resources/assets/vendor/libs/flatpickr/flatpickr.scss',
  'resources/assets/vendor/libs/sweetalert2/sweetalert2.scss',
  'resources/assets/vendor/libs/leaflet/leaflet.scss',
  'resources/assets/vendor/libs/apex-charts/apex-charts.scss'
])
@endsection

@section('page-style')
@vite([
  'resources/assets/vendor/scss/pages/page-user-view.scss'
])
<style>
  #locationMap { height: 300px; border-radius: 0.5rem; }
  .tab-content { display: none; }
  .tab-content.active { display: block; }
</style>
@endsection

@section('vendor-script')
@vite([
  'resources/assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
  'resources/assets/vendor/libs/moment/moment.js',
  'resources/assets/vendor/libs/flatpickr/flatpickr.js',
  'resources/assets/vendor/libs/sweetalert2/sweetalert2.js',
  'resources/assets/vendor/libs/leaflet/leaflet.js',
  'resources/assets/vendor/libs/apex-charts/apexcharts.js'
])
@endsection

@section('page-script')
@vite(['resources/assets/js/app-presence-detail.js'])
@endsection

@section('content')
<div class="row gy-6 gy-md-0">
  <!-- Employee Sidebar -->
  <div class="col-xl-4 col-lg-5 col-md-5 order-1 order-md-0">
    <!-- Employee Card -->
    <div class="card mb-6">
      <div class="card-body pt-12">
        <div class="user-avatar-section">
          <div class="d-flex align-items-center flex-column">
            <div class="avatar avatar-xl mb-4">
              <span class="avatar-initial rounded-3 bg-label-primary" id="employee-avatar" style="font-size: 2rem;">AR</span>
            </div>
            <div class="user-info text-center">
              <h5 class="mb-0" id="employee-name">Ahmad Rizki</h5>
              <span class="badge bg-label-secondary mt-2" id="employee-npp">NPP: 12345</span>
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-around flex-wrap my-6 gap-0 gap-md-3 gap-lg-4">
          <div class="d-flex align-items-center me-5 gap-4">
            <div class="avatar">
              <div class="avatar-initial bg-label-primary rounded-3">
                <i class="ri-calendar-check-line ri-24px"></i>
              </div>
            </div>
            <div>
              <h5 class="mb-0" id="stat-present-days">20</h5>
              <span>Hari Hadir</span>
            </div>
          </div>
          <div class="d-flex align-items-center gap-4">
            <div class="avatar">
              <div class="avatar-initial bg-label-warning rounded-3">
                <i class="ri-time-line ri-24px"></i>
              </div>
            </div>
            <div>
              <h5 class="mb-0" id="stat-late-days">2</h5>
              <span>Terlambat</span>
            </div>
          </div>
        </div>
        <h5 class="pb-4 border-bottom mb-4">Detail Karyawan</h5>
        <div class="info-container">
          <ul class="list-unstyled mb-6">
            <li class="mb-2">
              <span class="fw-medium text-heading me-2">Cabang:</span>
              <span id="employee-branch">Kantor Pusat</span>
            </li>
            <li class="mb-2">
              <span class="fw-medium text-heading me-2">Departemen:</span>
              <span id="employee-dept">IT Development</span>
            </li>
            <li class="mb-2">
              <span class="fw-medium text-heading me-2">Jabatan:</span>
              <span id="employee-position">Software Engineer</span>
            </li>
            <li class="mb-2">
              <span class="fw-medium text-heading me-2">Status:</span>
              <span class="badge bg-label-primary">Aktif</span>
            </li>
            <li class="mb-2">
              <span class="fw-medium text-heading me-2">Perangkat:</span>
              <span id="employee-device">Samsung Galaxy A54</span>
            </li>
            <li class="mb-2">
              <span class="fw-medium text-heading me-2">Device ID:</span>
              <code id="employee-device-id">a1b2c3d4...</code>
            </li>
          </ul>
          <div class="d-flex justify-content-center gap-2">
            <a href="javascript:;" class="btn btn-primary" id="btnExportEmployee">
              <i class="ri-download-2-line me-1"></i>Ekspor
            </a>
            <a href="{{url('app/absensi/list')}}" class="btn btn-outline-secondary">
              <i class="ri-arrow-left-line me-1"></i>Kembali
            </a>
          </div>
        </div>
      </div>
    </div>
    <!-- /Employee Card -->

    <!-- Summary Card -->
    <div class="card mb-6 border border-2 border-primary">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <span class="badge bg-label-primary">Ringkasan Bulan Ini</span>
          <div class="d-flex justify-content-center">
            <h1 class="mb-0 text-primary" id="stat-attendance-rate">91%</h1>
          </div>
        </div>
        <ul class="list-unstyled g-2 my-6">
          <li class="mb-2 d-flex align-items-center"><i class="ri-checkbox-circle-line text-primary ri-18px me-2"></i><span>Tepat Waktu: <strong id="stat-ontime">18</strong> hari</span></li>
          <li class="mb-2 d-flex align-items-center"><i class="ri-time-line text-warning ri-18px me-2"></i><span>Terlambat: <strong id="stat-late">2</strong> hari</span></li>
          <li class="mb-2 d-flex align-items-center"><i class="ri-logout-box-line text-danger ri-18px me-2"></i><span>Pulang Awal: <strong id="stat-early">1</strong> hari</span></li>
          <li class="mb-2 d-flex align-items-center"><i class="ri-close-circle-line text-secondary ri-18px me-2"></i><span>Tidak Hadir: <strong id="stat-absent">2</strong> hari</span></li>
        </ul>
        <div class="d-flex justify-content-between align-items-center mb-1 fw-medium text-heading">
          <span>Kehadiran</span>
          <span>20 dari 22 Hari Kerja</span>
        </div>
        <div class="progress mb-1 rounded">
          <div class="progress-bar rounded" role="progressbar" style="width: 91%;" aria-valuenow="91" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <small>2 hari tidak hadir</small>
      </div>
    </div>
    <!-- /Summary Card -->
  </div>
  <!--/ Employee Sidebar -->

  <!-- User Content -->
  <div class="col-xl-8 col-lg-7 col-md-7 order-0 order-md-1">
    <!-- Tabs -->
    <div class="nav-align-top">
      <ul class="nav nav-pills flex-column flex-md-row mb-6 row-gap-2" id="presenceDetailTabs">
        <li class="nav-item"><a class="nav-link active" href="javascript:void(0);" data-tab="tab-history"><i class="ri-calendar-check-line me-2"></i>Riwayat Kehadiran</a></li>
        <li class="nav-item"><a class="nav-link" href="javascript:void(0);" data-tab="tab-stats"><i class="ri-bar-chart-line me-2"></i>Statistik</a></li>
      </ul>
    </div>
    <!--/ Tabs -->

    <!-- Tab Content: History -->
    <div class="tab-content active" id="tab-history">
      <!-- Location Map Card -->
      <div class="card mb-6">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><i class="ri-map-pin-line me-2"></i>Lokasi Absensi</h5>
          <span class="badge bg-label-secondary" id="map-selected-date">Pilih tanggal dari tabel</span>
        </div>
        <div class="card-body">
          <div id="locationMap"></div>
          <div class="mt-3">
            <div class="d-flex flex-wrap gap-3">
              <div>
                <small class="text-muted">Lokasi Check-in:</small>
                <p class="mb-0 fw-medium" id="map-checkin-info">-</p>
              </div>
              <div>
                <small class="text-muted">Lokasi Check-out:</small>
                <p class="mb-0 fw-medium" id="map-checkout-info">-</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- /Location Map Card -->

      <!-- Attendance History Table -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h5 class="mb-0">Riwayat Kehadiran</h5>
          <div class="d-flex align-items-center gap-3">
            <small class="text-muted">Klik baris untuk melihat lokasi di peta</small>
            <div class="form-floating form-floating-outline" style="width: 200px;">
              <input type="text" class="form-control flatpickr-range" id="filter-date-range" placeholder="Pilih Rentang">
              <label>Rentang Tanggal</label>
            </div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="datatables-presence-detail table table-hover">
            <thead>
              <tr>
                <th></th>
                <th>Tanggal</th>
                <th>Jam Masuk</th>
                <th>Jam Pulang</th>
                <th>Durasi</th>
                <th>Status</th>
                <th>Lokasi</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
      <!-- /Attendance History Table -->
    </div>
    <!--/ Tab Content: History -->

    <!-- Tab Content: Statistics -->
    <div class="tab-content" id="tab-stats">
      <!-- Status Distribution Chart -->
      <div class="row mb-6">
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="mb-0">Distribusi Status</h5>
              <small class="text-muted">Breakdown status kehadiran bulan ini</small>
            </div>
            <div class="card-body">
              <div id="statusDistributionChart"></div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="mb-0">Jam Masuk Rata-rata</h5>
              <small class="text-muted">Distribusi jam masuk per minggu</small>
            </div>
            <div class="card-body">
              <div id="checkinTimeChart"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Trend Chart -->
      <div class="card mb-6">
        <div class="card-header">
          <h5 class="mb-0">Tren Kehadiran Bulanan</h5>
          <small class="text-muted">Perbandingan kehadiran per bulan dalam setahun</small>
        </div>
        <div class="card-body">
          <div id="monthlyTrendChart"></div>
        </div>
      </div>

      <!-- Weekly Attendance Pattern -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">Pola Kehadiran Mingguan</h5>
          <small class="text-muted">Rata-rata jam masuk dan pulang per hari</small>
        </div>
        <div class="card-body">
          <div id="weeklyPatternChart"></div>
        </div>
      </div>
    </div>
    <!--/ Tab Content: Statistics -->
  </div>
  <!--/ User Content -->
</div>
@endsection
