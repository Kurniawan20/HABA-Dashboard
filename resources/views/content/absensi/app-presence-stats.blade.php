@extends('layouts/layoutMaster')

@section('title', 'Statistik Kehadiran - Absensi')

@section('vendor-style')
@vite([
  'resources/assets/vendor/libs/apex-charts/apex-charts.scss',
  'resources/assets/vendor/libs/flatpickr/flatpickr.scss'
])
@endsection

@section('page-style')
@vite([
  'resources/assets/vendor/scss/pages/cards-statistics.scss',
  'resources/assets/vendor/scss/pages/cards-analytics.scss'
])
@endsection

@section('vendor-script')
@vite([
  'resources/assets/vendor/libs/apex-charts/apexcharts.js',
  'resources/assets/vendor/libs/flatpickr/flatpickr.js'
])
@endsection

@section('page-script')
@vite(['resources/assets/js/app-presence-stats.js'])
@endsection

@section('content')
<div class="row g-6">
  <!-- Filter Tanggal -->
  <div class="col-12">
    <div class="card">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-4">
            <h5 class="mb-0">Statistik Kehadiran</h5>
            <p class="text-muted mb-0">Analisis data kehadiran karyawan</p>
          </div>
          <div class="col-md-4 offset-md-4">
            <label class="form-label" for="stats-date-range">Rentang Tanggal</label>
            <input type="text" id="stats-date-range" class="form-control" placeholder="Pilih rentang tanggal" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Statistik Cards -->
  <div class="col-sm-6 col-xl-3">
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between">
          <div class="me-1">
            <p class="text-heading mb-1">Total Kehadiran</p>
            <div class="d-flex align-items-center">
              <h4 class="mb-1 me-2" id="stat-total-presences">500</h4>
            </div>
            <small class="mb-0">Record absensi</small>
          </div>
          <div class="avatar">
            <div class="avatar-initial bg-label-primary rounded-3">
              <div class="ri-calendar-check-line ri-26px"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="col-sm-6 col-xl-3">
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between">
          <div class="me-1">
            <p class="text-heading mb-1">Karyawan Aktif</p>
            <div class="d-flex align-items-center">
              <h4 class="mb-1 me-1" id="stat-unique-employees">50</h4>
            </div>
            <small class="mb-0">Karyawan unik</small>
          </div>
          <div class="avatar">
            <div class="avatar-initial bg-label-success rounded-3">
              <div class="ri-user-line ri-26px"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="col-sm-6 col-xl-3">
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between">
          <div class="me-1">
            <p class="text-heading mb-1">Tingkat Kehadiran</p>
            <div class="d-flex align-items-center">
              <h4 class="mb-1 me-1" id="stat-completion-rate">96%</h4>
              <p class="text-success mb-1">Lengkap</p>
            </div>
            <small class="mb-0">Masuk & Pulang</small>
          </div>
          <div class="avatar">
            <div class="avatar-initial bg-label-info rounded-3">
              <div class="ri-pie-chart-line ri-26px"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="col-sm-6 col-xl-3">
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between">
          <div class="me-1">
            <p class="text-heading mb-1">Tingkat Keterlambatan</p>
            <div class="d-flex align-items-center">
              <h4 class="mb-1 me-1" id="stat-late-rate">5%</h4>
              <p class="text-danger mb-1">Terlambat</p>
            </div>
            <small class="mb-0">Masuk > 08:00</small>
          </div>
          <div class="avatar">
            <div class="avatar-initial bg-label-warning rounded-3">
              <div class="ri-time-line ri-26px"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Grafik Kehadiran Harian -->
  <div class="col-12 col-xxl-8">
    <div class="card h-100">
      <div class="card-header">
        <div class="d-flex justify-content-between">
          <h5 class="mb-1">Tren Kehadiran Harian</h5>
          <div class="dropdown">
            <button class="btn btn-text-secondary rounded-pill text-muted border-0 p-1" type="button" data-bs-toggle="dropdown">
              <i class="ri-more-2-line ri-20px"></i>
            </button>
            <div class="dropdown-menu dropdown-menu-end">
              <a class="dropdown-item" href="javascript:void(0);">Refresh</a>
              <a class="dropdown-item" href="javascript:void(0);">Ekspor</a>
            </div>
          </div>
        </div>
        <p class="mb-0 card-subtitle">Jumlah kehadiran per hari</p>
      </div>
      <div class="card-body">
        <div id="dailyPresenceChart"></div>
      </div>
    </div>
  </div>

  <!-- Distribusi Status -->
  <div class="col-12 col-xxl-4">
    <div class="card h-100">
      <div class="card-header">
        <h5 class="mb-1">Distribusi Status</h5>
        <p class="mb-0 card-subtitle">Breakdown status kehadiran</p>
      </div>
      <div class="card-body">
        <div id="statusDistributionChart"></div>
        <div class="mt-4">
          <ul class="p-0 m-0">
            <li class="d-flex align-items-center mb-3">
              <span class="badge badge-dot bg-success me-3"></span>
              <span class="text-heading">Lengkap</span>
              <span class="ms-auto fw-medium" id="status-complete">480</span>
            </li>
            <li class="d-flex align-items-center mb-3">
              <span class="badge badge-dot bg-warning me-3"></span>
              <span class="text-heading">Masuk Saja</span>
              <span class="ms-auto fw-medium" id="status-checkin-only">10</span>
            </li>
            <li class="d-flex align-items-center mb-3">
              <span class="badge badge-dot bg-danger me-3"></span>
              <span class="text-heading">Pulang Awal</span>
              <span class="ms-auto fw-medium" id="status-early-checkout">10</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- Kehadiran per Cabang -->
  <div class="col-12 col-md-6">
    <div class="card h-100">
      <div class="card-header">
        <h5 class="mb-1">Kehadiran per Cabang</h5>
        <p class="mb-0 card-subtitle">Total kehadiran berdasarkan lokasi</p>
      </div>
      <div class="card-body">
        <div id="branchPresenceChart"></div>
      </div>
    </div>
  </div>

  <!-- Keterlambatan per Hari -->
  <div class="col-12 col-md-6">
    <div class="card h-100">
      <div class="card-header">
        <h5 class="mb-1">Tren Keterlambatan</h5>
        <p class="mb-0 card-subtitle">Jumlah keterlambatan per hari dalam seminggu</p>
      </div>
      <div class="card-body">
        <div id="lateByDayChart"></div>
      </div>
    </div>
  </div>

  <!-- Top Terlambat -->
  <div class="col-12 col-md-6">
    <div class="card h-100">
      <div class="card-header d-flex justify-content-between">
        <div>
          <h5 class="card-title mb-1">Karyawan Sering Terlambat</h5>
          <p class="card-subtitle mb-0">Top 5 bulan ini</p>
        </div>
      </div>
      <div class="card-body">
        <ul class="p-0 m-0">
          <li class="d-flex align-items-center mb-4">
            <div class="avatar avatar-sm flex-shrink-0 me-3">
              <span class="avatar-initial rounded-circle bg-label-danger">JD</span>
            </div>
            <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
              <div class="me-2">
                <h6 class="mb-0">NPP 12346</h6>
                <small>Cabang Jakarta</small>
              </div>
              <div class="badge bg-label-danger rounded-pill">8x</div>
            </div>
          </li>
          <li class="d-flex align-items-center mb-4">
            <div class="avatar avatar-sm flex-shrink-0 me-3">
              <span class="avatar-initial rounded-circle bg-label-warning">AS</span>
            </div>
            <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
              <div class="me-2">
                <h6 class="mb-0">NPP 12350</h6>
                <small>Kantor Pusat</small>
              </div>
              <div class="badge bg-label-warning rounded-pill">6x</div>
            </div>
          </li>
          <li class="d-flex align-items-center mb-4">
            <div class="avatar avatar-sm flex-shrink-0 me-3">
              <span class="avatar-initial rounded-circle bg-label-warning">BK</span>
            </div>
            <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
              <div class="me-2">
                <h6 class="mb-0">NPP 12355</h6>
                <small>Cabang Surabaya</small>
              </div>
              <div class="badge bg-label-warning rounded-pill">5x</div>
            </div>
          </li>
          <li class="d-flex align-items-center mb-4">
            <div class="avatar avatar-sm flex-shrink-0 me-3">
              <span class="avatar-initial rounded-circle bg-label-info">CD</span>
            </div>
            <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
              <div class="me-2">
                <h6 class="mb-0">NPP 12360</h6>
                <small>Cabang Bandung</small>
              </div>
              <div class="badge bg-label-info rounded-pill">4x</div>
            </div>
          </li>
          <li class="d-flex align-items-center">
            <div class="avatar avatar-sm flex-shrink-0 me-3">
              <span class="avatar-initial rounded-circle bg-label-secondary">EF</span>
            </div>
            <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
              <div class="me-2">
                <h6 class="mb-0">NPP 12365</h6>
                <small>Kantor Pusat</small>
              </div>
              <div class="badge bg-label-secondary rounded-pill">3x</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Ringkasan Mingguan -->
  <div class="col-12 col-md-6">
    <div class="card h-100">
      <div class="card-header">
        <h5 class="mb-1">Ringkasan Mingguan</h5>
        <p class="mb-0 card-subtitle">Perbandingan minggu ini vs minggu lalu</p>
      </div>
      <div class="card-body">
        <div class="row mb-4">
          <div class="col-6 border-end">
            <div class="d-flex flex-column align-items-center">
              <div class="avatar">
                <div class="avatar-initial bg-label-success rounded-3">
                  <i class="ri-arrow-up-line ri-24px"></i>
                </div>
              </div>
              <p class="mt-3 mb-1">Minggu Ini</p>
              <h5 class="mb-0" id="weekly-current">125</h5>
            </div>
          </div>
          <div class="col-6">
            <div class="d-flex flex-column align-items-center">
              <div class="avatar">
                <div class="avatar-initial bg-label-secondary rounded-3">
                  <i class="ri-history-line ri-24px"></i>
                </div>
              </div>
              <p class="mt-3 mb-1">Minggu Lalu</p>
              <h5 class="mb-0" id="weekly-previous">118</h5>
            </div>
          </div>
        </div>
        <hr>
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <p class="mb-1">Perubahan</p>
            <h5 class="mb-0 text-success" id="weekly-change">+5.9%</h5>
          </div>
          <div class="avatar">
            <div class="avatar-initial bg-label-success rounded">
              <i class="ri-arrow-right-up-line ri-24px"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
@endsection
