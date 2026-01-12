@extends('layouts/layoutMaster')

@section('title', 'Pengaturan Jam Absensi')

<!-- Vendor Styles -->
@section('vendor-style')
@vite([
  'resources/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.scss',
  'resources/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.scss',
  'resources/assets/vendor/libs/sweetalert2/sweetalert2.scss',
  'resources/assets/vendor/libs/flatpickr/flatpickr.scss'
])
@endsection

<!-- Vendor Scripts -->
@section('vendor-script')
@vite([
  'resources/assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
  'resources/assets/vendor/libs/sweetalert2/sweetalert2.js',
  'resources/assets/vendor/libs/flatpickr/flatpickr.js'
])
@endsection

<!-- Page Scripts -->
@section('page-script')
@vite(['resources/assets/js/app-attendance-time-settings.js'])
@endsection

@section('content')
<!-- Info Card -->
<div class="row mb-6">
  <div class="col-12">
    <div class="alert alert-primary d-flex align-items-center mb-0" role="alert">
      <i class="ri-information-line ri-22px me-3"></i>
      <div>
        <strong>Pengaturan Jam Absensi</strong> - Tentukan rentang waktu untuk absen masuk dan pulang. 
        Hanya satu pengaturan yang dapat aktif pada satu waktu. Pengaturan aktif akan digunakan sebagai acuan validasi absensi.
      </div>
    </div>
  </div>
</div>
<!--/ Info Card -->

<!-- Active Setting Card -->
<div class="row mb-6">
  <div class="col-12">
    <div class="card border border-2 border-primary">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <span class="badge bg-label-primary mb-2">Pengaturan Aktif</span>
            <h4 class="mb-1" id="active-setting-name">Default</h4>
          </div>
          <div class="text-end">
            <span class="badge bg-primary fs-6" id="active-setting-badge">
              <i class="ri-check-line me-1"></i>Aktif
            </span>
          </div>
        </div>
        <div class="row mt-4">
          <div class="col-md-6">
            <div class="d-flex align-items-center mb-3">
              <div class="avatar me-3">
                <div class="avatar-initial bg-label-primary rounded-3">
                  <i class="ri-login-box-line ri-22px"></i>
                </div>
              </div>
              <div>
                <h6 class="mb-0">Jam Masuk</h6>
                <span class="text-heading fw-medium" id="active-jam-masuk">07:30 - 09:00</span>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="d-flex align-items-center mb-3">
              <div class="avatar me-3">
                <div class="avatar-initial bg-label-info rounded-3">
                  <i class="ri-logout-box-line ri-22px"></i>
                </div>
              </div>
              <div>
                <h6 class="mb-0">Jam Pulang</h6>
                <span class="text-heading fw-medium" id="active-jam-pulang">13:00 - 18:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<!--/ Active Setting Card -->

<!-- Settings Table -->
<div class="card">
  <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
    <h5 class="mb-0">Daftar Pengaturan Jam</h5>
    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addSettingModal">
      <i class="ri-add-line me-1"></i>Tambah Pengaturan
    </button>
  </div>
  <div class="card-datatable table-responsive">
    <table class="datatables-time-settings table table-hover">
      <thead>
        <tr>
          <th></th>
          <th>Nama</th>
          <th>Jam Masuk</th>
          <th>Jam Pulang</th>
          <th>Status</th>
          <th>Aksi</th>
        </tr>
      </thead>
    </table>
  </div>
</div>
<!--/ Settings Table -->

<!-- Add Setting Modal -->
<div class="modal fade" id="addSettingModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Tambah Pengaturan Jam</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="formAddSetting" class="row g-4">
          <div class="col-12">
            <div class="form-floating form-floating-outline">
              <input type="text" class="form-control" id="add-nama" name="nama" placeholder="Contoh: Shift Pagi" required>
              <label for="add-nama">Nama Pengaturan <span class="text-danger">*</span></label>
            </div>
          </div>
          <div class="col-12">
            <label class="form-label fw-medium">Jam Masuk</label>
            <div class="row g-3">
              <div class="col-6">
                <div class="form-floating form-floating-outline">
                  <input type="text" class="form-control time-picker" id="add-start-masuk" name="start_jam_masuk" placeholder="07:30" required>
                  <label for="add-start-masuk">Mulai <span class="text-danger">*</span></label>
                </div>
              </div>
              <div class="col-6">
                <div class="form-floating form-floating-outline">
                  <input type="text" class="form-control time-picker" id="add-end-masuk" name="end_jam_masuk" placeholder="09:00">
                  <label for="add-end-masuk">Selesai</label>
                </div>
              </div>
            </div>
            <small class="text-muted">Karyawan dianggap terlambat jika absen setelah jam "Selesai"</small>
          </div>
          <div class="col-12">
            <label class="form-label fw-medium">Jam Pulang</label>
            <div class="row g-3">
              <div class="col-6">
                <div class="form-floating form-floating-outline">
                  <input type="text" class="form-control time-picker" id="add-start-pulang" name="start_jam_pulang" placeholder="13:00" required>
                  <label for="add-start-pulang">Mulai <span class="text-danger">*</span></label>
                </div>
              </div>
              <div class="col-6">
                <div class="form-floating form-floating-outline">
                  <input type="text" class="form-control time-picker" id="add-end-pulang" name="end_jam_pulang" placeholder="18:00">
                  <label for="add-end-pulang">Selesai</label>
                </div>
              </div>
            </div>
            <small class="text-muted">Karyawan dapat melakukan absen pulang mulai dari jam "Mulai"</small>
          </div>
          <div class="col-12">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="add-is-active" name="is_active">
              <label class="form-check-label" for="add-is-active">Aktifkan pengaturan ini</label>
            </div>
            <small class="text-muted">Jika diaktifkan, pengaturan lain akan dinonaktifkan otomatis</small>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
        <button type="button" class="btn btn-primary" id="btnSaveAddSetting">
          <i class="ri-save-line me-1"></i>Simpan
        </button>
      </div>
    </div>
  </div>
</div>
<!--/ Add Setting Modal -->

<!-- Edit Setting Modal -->
<div class="modal fade" id="editSettingModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Edit Pengaturan Jam</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="formEditSetting" class="row g-4">
          <input type="hidden" id="edit-id" name="id">
          <div class="col-12">
            <div class="form-floating form-floating-outline">
              <input type="text" class="form-control" id="edit-nama" name="nama" required>
              <label for="edit-nama">Nama Pengaturan <span class="text-danger">*</span></label>
            </div>
          </div>
          <div class="col-12">
            <label class="form-label fw-medium">Jam Masuk</label>
            <div class="row g-3">
              <div class="col-6">
                <div class="form-floating form-floating-outline">
                  <input type="text" class="form-control time-picker-edit" id="edit-start-masuk" name="start_jam_masuk" required>
                  <label for="edit-start-masuk">Mulai <span class="text-danger">*</span></label>
                </div>
              </div>
              <div class="col-6">
                <div class="form-floating form-floating-outline">
                  <input type="text" class="form-control time-picker-edit" id="edit-end-masuk" name="end_jam_masuk">
                  <label for="edit-end-masuk">Selesai</label>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12">
            <label class="form-label fw-medium">Jam Pulang</label>
            <div class="row g-3">
              <div class="col-6">
                <div class="form-floating form-floating-outline">
                  <input type="text" class="form-control time-picker-edit" id="edit-start-pulang" name="start_jam_pulang" required>
                  <label for="edit-start-pulang">Mulai <span class="text-danger">*</span></label>
                </div>
              </div>
              <div class="col-6">
                <div class="form-floating form-floating-outline">
                  <input type="text" class="form-control time-picker-edit" id="edit-end-pulang" name="end_jam_pulang">
                  <label for="edit-end-pulang">Selesai</label>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
        <button type="button" class="btn btn-primary" id="btnSaveEditSetting">
          <i class="ri-save-line me-1"></i>Simpan Perubahan
        </button>
      </div>
    </div>
  </div>
</div>
<!--/ Edit Setting Modal -->
@endsection
