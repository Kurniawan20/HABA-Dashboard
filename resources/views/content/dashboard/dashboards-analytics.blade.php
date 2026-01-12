@php
$configData = Helper::appClasses();
@endphp
@extends('layouts/layoutMaster')

@section('title', 'Dashboard - Kehadiran')
@section('vendor-style')
@vite([
  'resources/assets/vendor/libs/apex-charts/apex-charts.scss'
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
  'resources/assets/vendor/libs/moment/moment.js'
])
@endsection

@section('page-script')
@vite(['resources/assets/js/dashboard-attendance.js'])
@endsection

@section('content')
<div class="row g-6">
  <!-- Welcome Card -->
  <div class="col-lg-8">
    <div class="card h-100">
      <div class="d-flex align-items-end row">
        <div class="col-md-7">
          <div class="card-body">
            <h4 class="card-title mb-2">Selamat Datang di <span class="fw-bold">{{config('variables.templateName')}}</span>! 👋</h4>
            <p class="mb-1" id="current-date">Jumat, 10 Januari 2024</p>
            <p class="mb-4 text-muted" id="current-time">08:30 WIB</p>
            <a href="{{url('app/absensi/list')}}" class="btn btn-primary">
              <i class="ri-list-check me-1"></i>Lihat Kehadiran Hari Ini
            </a>
          </div>
        </div>
        <div class="col-md-5 text-center">
          <div class="card-body pb-0 px-0 pt-2">
            <img src="{{asset('assets/img/illustrations/illustration-john-'.$configData['style'].'.png')}}" height="170" alt="Dashboard" data-app-light-img="illustrations/illustration-john-light.png" data-app-dark-img="illustrations/illustration-john-dark.png">
          </div>
        </div>
      </div>
    </div>
  </div>
  <!--/ Welcome Card -->

  <!-- Pending Requests Card -->
  <div class="col-lg-4">
    <div class="card h-100 border-warning border-2">
      <div class="card-body">
        <div class="d-flex align-items-center mb-3">
          <div class="avatar me-3">
            <div class="avatar-initial bg-label-warning rounded-3">
              <i class="ri-smartphone-line ri-24px"></i>
            </div>
          </div>
          <div>
            <h6 class="mb-0">Permintaan Reset Device</h6>
            <small class="text-muted">Menunggu persetujuan</small>
          </div>
        </div>
        <h2 class="mb-3" id="pending-reset-count">3</h2>
        <a href="{{url('app/absensi/device-reset')}}" class="btn btn-warning w-100">
          <i class="ri-arrow-right-line me-1"></i>Proses Sekarang
        </a>
      </div>
    </div>
  </div>
  <!--/ Pending Requests Card -->

  <!-- Statistics Cards -->
  <div class="col-sm-6 col-lg-3">
    <div class="card h-100">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div class="avatar">
            <div class="avatar-initial bg-label-primary rounded-3">
              <i class="ri-group-line ri-24px"></i>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <span class="text-success me-1">100%</span>
            <i class="ri-arrow-up-s-line text-success"></i>
          </div>
        </div>
        <div class="card-info mt-4">
          <h4 class="mb-1" id="stat-total-employees">156</h4>
          <p class="mb-0">Total Karyawan</p>
        </div>
      </div>
    </div>
  </div>

  <div class="col-sm-6 col-lg-3">
    <div class="card h-100">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div class="avatar">
            <div class="avatar-initial bg-label-success rounded-3">
              <i class="ri-user-follow-line ri-24px"></i>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <span class="text-success me-1" id="stat-present-percent">92%</span>
            <i class="ri-arrow-up-s-line text-success"></i>
          </div>
        </div>
        <div class="card-info mt-4">
          <h4 class="mb-1" id="stat-present-today">143</h4>
          <p class="mb-0">Hadir Hari Ini</p>
        </div>
      </div>
    </div>
  </div>

  <div class="col-sm-6 col-lg-3">
    <div class="card h-100">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div class="avatar">
            <div class="avatar-initial bg-label-warning rounded-3">
              <i class="ri-time-line ri-24px"></i>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <span class="text-warning me-1" id="stat-late-percent">5%</span>
          </div>
        </div>
        <div class="card-info mt-4">
          <h4 class="mb-1" id="stat-late-today">8</h4>
          <p class="mb-0">Terlambat Hari Ini</p>
        </div>
      </div>
    </div>
  </div>

  <div class="col-sm-6 col-lg-3">
    <div class="card h-100">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div class="avatar">
            <div class="avatar-initial bg-label-danger rounded-3">
              <i class="ri-user-unfollow-line ri-24px"></i>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <span class="text-danger me-1" id="stat-absent-percent">3%</span>
          </div>
        </div>
        <div class="card-info mt-4">
          <h4 class="mb-1" id="stat-absent-today">5</h4>
          <p class="mb-0">Tidak Hadir</p>
        </div>
      </div>
    </div>
  </div>
  <!--/ Statistics Cards -->

  <!-- Weekly Attendance Chart -->
  <div class="col-lg-8">
    <div class="card h-100">
      <div class="card-header d-flex justify-content-between">
        <div>
          <h5 class="mb-1">Tren Kehadiran Mingguan</h5>
          <p class="card-subtitle mb-0">7 hari terakhir</p>
        </div>
        <div class="dropdown">
          <button class="btn btn-text-secondary rounded-pill text-muted border-0 p-2" type="button" id="weeklyTrendDropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="ri-more-2-line ri-20px"></i>
          </button>
          <div class="dropdown-menu dropdown-menu-end" aria-labelledby="weeklyTrendDropdown">
            <a class="dropdown-item" href="{{url('app/absensi/stats')}}">Lihat Statistik Lengkap</a>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div id="weeklyAttendanceChart" style="min-height: 300px;"></div>
      </div>
    </div>
  </div>
  <!--/ Weekly Attendance Chart -->

  <!-- Status Distribution Chart -->
  <div class="col-lg-4">
    <div class="card h-100">
      <div class="card-header">
        <h5 class="mb-1">Distribusi Status</h5>
        <p class="card-subtitle mb-0">Hari ini</p>
      </div>
      <div class="card-body d-flex flex-column justify-content-center">
        <div id="statusDistributionChart" style="min-height: 250px;"></div>
        <div class="d-flex justify-content-around mt-4">
          <div class="text-center">
            <span class="badge bg-label-success rounded-pill px-3 mb-1">Tepat Waktu</span>
            <h6 class="mb-0" id="dist-ontime">135</h6>
          </div>
          <div class="text-center">
            <span class="badge bg-label-warning rounded-pill px-3 mb-1">Terlambat</span>
            <h6 class="mb-0" id="dist-late">8</h6>
          </div>
          <div class="text-center">
            <span class="badge bg-label-danger rounded-pill px-3 mb-1">Absen</span>
            <h6 class="mb-0" id="dist-absent">5</h6>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!--/ Status Distribution Chart -->

  <!-- Recent Attendance -->
  <div class="col-lg-6">
    <div class="card h-100">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Aktivitas Terbaru</h5>
        <a href="{{url('app/absensi/list')}}" class="btn btn-sm btn-outline-primary">Lihat Semua</a>
      </div>
      <div class="card-body">
        <ul class="timeline timeline-center pb-0 mb-0" id="recentActivityTimeline">
          <!-- Will be populated by JS -->
        </ul>
      </div>
    </div>
  </div>
  <!--/ Recent Attendance -->

  <!-- Branch Attendance -->
  <div class="col-lg-6">
    <div class="card h-100">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Kehadiran per Kantor</h5>
        <a href="{{url('app/absensi/branches')}}" class="btn btn-sm btn-outline-primary">Kelola Kantor</a>
      </div>
      <div class="card-body">
        <div id="branchAttendanceChart" style="min-height: 300px;"></div>
      </div>
    </div>
  </div>
  <!--/ Branch Attendance -->

</div>
@endsection
