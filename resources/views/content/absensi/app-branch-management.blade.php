@extends('layouts/layoutMaster')

@section('title', 'Manajemen Kantor - Absensi')

<!-- Vendor Styles -->
@section('vendor-style')
@vite([
  'resources/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.scss',
  'resources/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.scss',
  'resources/assets/vendor/libs/sweetalert2/sweetalert2.scss',
  'resources/assets/vendor/libs/leaflet/leaflet.scss',
  'resources/assets/vendor/libs/@form-validation/form-validation.scss'
])
@endsection

@section('page-style')
<style>
  #branchLocationMap { height: 300px; border-radius: 0.5rem; }
</style>
@endsection

<!-- Vendor Scripts -->
@section('vendor-script')
@vite([
  'resources/assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
  'resources/assets/vendor/libs/sweetalert2/sweetalert2.js',
  'resources/assets/vendor/libs/leaflet/leaflet.js',
  'resources/assets/vendor/libs/@form-validation/popular.js',
  'resources/assets/vendor/libs/@form-validation/bootstrap5.js',
  'resources/assets/vendor/libs/@form-validation/auto-focus.js'
])
@endsection

<!-- Page Scripts -->
@section('page-script')
@vite(['resources/assets/js/app-branch-management.js'])
@endsection

@section('content')
<!-- Statistics Cards -->
<div class="row gy-6 mb-6">
  <div class="col-lg-3 col-sm-6">
    <div class="card">
      <div class="card-body">
        <div class="d-flex align-items-center flex-wrap">
          <div class="avatar me-4">
            <div class="avatar-initial bg-label-primary rounded-3">
              <i class="ri-building-line ri-24px"></i>
            </div>
          </div>
          <div class="card-info">
            <div class="d-flex align-items-center">
              <h5 class="mb-0 me-2" id="stat-total-branches">12</h5>
            </div>
            <p class="mb-0">Total Kantor</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="col-lg-3 col-sm-6">
    <div class="card">
      <div class="card-body">
        <div class="d-flex align-items-center flex-wrap">
          <div class="avatar me-4">
            <div class="avatar-initial bg-label-success rounded-3">
              <i class="ri-home-4-line ri-24px"></i>
            </div>
          </div>
          <div class="card-info">
            <div class="d-flex align-items-center">
              <h5 class="mb-0 me-2" id="stat-head-office">1</h5>
            </div>
            <p class="mb-0">Kantor Pusat</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="col-lg-3 col-sm-6">
    <div class="card">
      <div class="card-body">
        <div class="d-flex align-items-center flex-wrap">
          <div class="avatar me-4">
            <div class="avatar-initial bg-label-info rounded-3">
              <i class="ri-store-2-line ri-24px"></i>
            </div>
          </div>
          <div class="card-info">
            <div class="d-flex align-items-center">
              <h5 class="mb-0 me-2" id="stat-branch-office">11</h5>
            </div>
            <p class="mb-0">Kantor Cabang</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="col-lg-3 col-sm-6">
    <div class="card">
      <div class="card-body">
        <div class="d-flex align-items-center flex-wrap">
          <div class="avatar me-4">
            <div class="avatar-initial bg-label-warning rounded-3">
              <i class="ri-map-pin-range-line ri-24px"></i>
            </div>
          </div>
          <div class="card-info">
            <div class="d-flex align-items-center">
              <h5 class="mb-0 me-2" id="stat-avg-radius">75m</h5>
            </div>
            <p class="mb-0">Rata-rata Radius</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<!--/ Statistics Cards -->

<!-- Branch Management Table -->
<div class="card">
  <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
    <h5 class="mb-0">Daftar Kantor/Cabang</h5>
    <div class="d-flex gap-2">
      <div class="input-group input-group-merge" style="width: 250px;">
        <span class="input-group-text"><i class="ri-search-line"></i></span>
        <input type="text" class="form-control" id="searchBranch" placeholder="Cari kantor...">
      </div>
      <button type="button" class="btn btn-primary" data-bs-toggle="offcanvas" data-bs-target="#offcanvasAddBranch">
        <i class="ri-add-line me-1"></i>Tambah Kantor
      </button>
    </div>
  </div>
  <div class="card-datatable table-responsive">
    <table class="datatables-branch-management table table-hover">
      <thead>
        <tr>
          <th></th>
          <th>Kode Kantor</th>
          <th>Nama Kantor</th>
          <th>Latitude</th>
          <th>Longitude</th>
          <th>Radius</th>
          <th>Aksi</th>
        </tr>
      </thead>
    </table>
  </div>
</div>
<!--/ Branch Management Table -->

<!-- Add Branch Offcanvas -->
<div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasAddBranch" aria-labelledby="offcanvasAddBranchLabel">
  <div class="offcanvas-header border-bottom">
    <h5 id="offcanvasAddBranchLabel" class="offcanvas-title">Tambah Kantor Baru</h5>
    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div class="offcanvas-body">
    <form id="formAddBranch" class="row g-4">
      <div class="col-12">
        <div class="form-floating form-floating-outline">
          <input type="text" class="form-control" id="add-kode-kantor" name="kode_kantor" placeholder="Contoh: JKT001" required>
          <label for="add-kode-kantor">Kode Kantor <span class="text-danger">*</span></label>
        </div>
      </div>
      <div class="col-12">
        <div class="form-floating form-floating-outline">
          <input type="text" class="form-control" id="add-nama-kantor" name="nama_kantor" placeholder="Contoh: Kantor Cabang Jakarta">
          <label for="add-nama-kantor">Nama Kantor</label>
        </div>
      </div>
      <div class="col-md-6">
        <div class="form-floating form-floating-outline">
          <input type="text" class="form-control" id="add-latitude" name="latitude" placeholder="-6.2088" required>
          <label for="add-latitude">Latitude <span class="text-danger">*</span></label>
        </div>
      </div>
      <div class="col-md-6">
        <div class="form-floating form-floating-outline">
          <input type="text" class="form-control" id="add-longitude" name="longitude" placeholder="106.8456" required>
          <label for="add-longitude">Longitude <span class="text-danger">*</span></label>
        </div>
      </div>
      <div class="col-12">
        <div class="form-floating form-floating-outline">
          <input type="number" class="form-control" id="add-radius" name="radius" placeholder="50" value="50">
          <label for="add-radius">Radius (meter)</label>
        </div>
        <small class="text-muted">Radius geofence untuk validasi absensi. Default: 50 meter.</small>
      </div>
      <div class="col-12">
        <label class="form-label">Pilih Lokasi di Peta</label>
        <div id="branchLocationMap"></div>
        <small class="text-muted">Klik pada peta untuk mengisi latitude dan longitude otomatis.</small>
      </div>
      <div class="col-12 d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="offcanvas">Batal</button>
        <button type="submit" class="btn btn-primary">
          <i class="ri-save-line me-1"></i>Simpan
        </button>
      </div>
    </form>
  </div>
</div>
<!--/ Add Branch Offcanvas -->

<!-- Edit Branch Modal -->
<div class="modal fade" id="editBranchModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Edit Kantor</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="formEditBranch" class="row g-4">
          <input type="hidden" id="edit-branch-id" name="id">
          <div class="col-md-6">
            <div class="form-floating form-floating-outline">
              <input type="text" class="form-control" id="edit-kode-kantor" name="kode_kantor" required>
              <label for="edit-kode-kantor">Kode Kantor <span class="text-danger">*</span></label>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-floating form-floating-outline">
              <input type="text" class="form-control" id="edit-nama-kantor" name="nama_kantor">
              <label for="edit-nama-kantor">Nama Kantor</label>
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-floating form-floating-outline">
              <input type="text" class="form-control" id="edit-latitude" name="latitude" required>
              <label for="edit-latitude">Latitude <span class="text-danger">*</span></label>
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-floating form-floating-outline">
              <input type="text" class="form-control" id="edit-longitude" name="longitude" required>
              <label for="edit-longitude">Longitude <span class="text-danger">*</span></label>
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-floating form-floating-outline">
              <input type="number" class="form-control" id="edit-radius" name="radius">
              <label for="edit-radius">Radius (m)</label>
            </div>
          </div>
          <div class="col-12">
            <div id="editBranchLocationMap" style="height: 250px; border-radius: 0.5rem;"></div>
            <small class="text-muted">Klik pada peta untuk mengubah lokasi.</small>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
        <button type="button" class="btn btn-primary" id="btnSaveEditBranch">
          <i class="ri-save-line me-1"></i>Simpan Perubahan
        </button>
      </div>
    </div>
  </div>
</div>
<!--/ Edit Branch Modal -->

<!-- View Branch Modal -->
<div class="modal fade" id="viewBranchModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Detail Kantor</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="row g-4">
          <div class="col-md-6">
            <table class="table table-borderless">
              <tr>
                <td class="fw-medium">Kode Kantor</td>
                <td id="view-kode-kantor">-</td>
              </tr>
              <tr>
                <td class="fw-medium">Nama Kantor</td>
                <td id="view-nama-kantor">-</td>
              </tr>
              <tr>
                <td class="fw-medium">Latitude</td>
                <td id="view-latitude">-</td>
              </tr>
              <tr>
                <td class="fw-medium">Longitude</td>
                <td id="view-longitude">-</td>
              </tr>
              <tr>
                <td class="fw-medium">Radius</td>
                <td id="view-radius">-</td>
              </tr>
            </table>
          </div>
          <div class="col-md-6">
            <div id="viewBranchLocationMap" style="height: 250px; border-radius: 0.5rem;"></div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Tutup</button>
      </div>
    </div>
  </div>
</div>
<!--/ View Branch Modal -->
@endsection
