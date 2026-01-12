@extends('layouts/layoutMaster')

@section('title', 'Daftar Kehadiran - Absensi')

<!-- Vendor Styles -->
@section('vendor-style')
@vite([
  'resources/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.scss',
  'resources/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.scss',
  'resources/assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.scss',
  'resources/assets/vendor/libs/flatpickr/flatpickr.scss',
  'resources/assets/vendor/libs/sweetalert2/sweetalert2.scss'
])
@endsection

<!-- Vendor Scripts -->
@section('vendor-script')
@vite([
  'resources/assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
  'resources/assets/vendor/libs/moment/moment.js',
  'resources/assets/vendor/libs/flatpickr/flatpickr.js',
  'resources/assets/vendor/libs/sweetalert2/sweetalert2.js'
])
@endsection

<!-- Page Scripts -->
@section('page-script')
@vite(['resources/assets/js/app-presence-list.js'])
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
              <i class="ri-user-line ri-24px"></i>
            </div>
          </div>
          <div class="card-info">
            <div class="d-flex align-items-center">
              <h5 class="mb-0 me-2" id="stat-total">5</h5>
            </div>
            <p class="mb-0">Total Kehadiran</p>
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
              <i class="ri-checkbox-circle-line ri-24px"></i>
            </div>
          </div>
          <div class="card-info">
            <div class="d-flex align-items-center">
              <h5 class="mb-0 me-2" id="stat-complete">3</h5>
            </div>
            <p class="mb-0">Lengkap</p>
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
              <i class="ri-time-line ri-24px"></i>
            </div>
          </div>
          <div class="card-info">
            <div class="d-flex align-items-center">
              <h5 class="mb-0 me-2" id="stat-late">2</h5>
            </div>
            <p class="mb-0">Terlambat</p>
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
            <div class="avatar-initial bg-label-danger rounded-3">
              <i class="ri-logout-box-line ri-24px"></i>
            </div>
          </div>
          <div class="card-info">
            <div class="d-flex align-items-center">
              <h5 class="mb-0 me-2" id="stat-early">1</h5>
            </div>
            <p class="mb-0">Pulang Awal</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<!--/ Statistics Cards -->

<!-- Advanced Search -->
<div class="card">
  <h5 class="card-header">Daftar Kehadiran</h5>
  <!--Search Form -->
  <div class="card-body">
    <form class="dt_adv_search" method="POST">
      <div class="row">
        <div class="col-12">
          <div class="row g-5">
            <div class="col-12 col-sm-6 col-lg-4">
              <div class="form-floating form-floating-outline">
                <input type="text" class="form-control dt-input" data-column="1" placeholder="12345" data-column-index="0">
                <label>NPP Karyawan</label>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-lg-4">
              <div class="form-floating form-floating-outline">
                <input type="text" class="form-control dt-date flatpickr-range dt-input" data-column="2" placeholder="Tanggal Mulai s/d Tanggal Akhir" data-column-index="1" id="dt_date" name="dt_date" />
                <label for="dt_date">Rentang Tanggal</label>
              </div>
              <input type="hidden" class="form-control dt-date start_date dt-input" data-column="2" data-column-index="1" name="value_from_start_date" />
              <input type="hidden" class="form-control dt-date end_date dt-input" name="value_from_end_date" data-column="2" data-column-index="1" />
            </div>
            <div class="col-12 col-sm-6 col-lg-4">
              <div class="form-floating form-floating-outline">
                <select class="form-select dt-input" data-column="7" data-column-index="2">
                  <option value="">Semua Status</option>
                  <option value="Lengkap">Lengkap</option>
                  <option value="Masuk Saja">Masuk Saja</option>
                  <option value="Pulang Saja">Pulang Saja</option>
                  <option value="Tidak Hadir">Tidak Hadir</option>
                </select>
                <label>Status</label>
              </div>
            </div>
            <div class="col-12 col-sm-6 col-lg-4">
              <div class="form-floating form-floating-outline">
                <select class="form-select dt-input" data-column="6" data-column-index="3">
                  <option value="">Semua Cabang</option>
                  <option value="Kantor Pusat">Kantor Pusat</option>
                  <option value="Cabang Jakarta">Cabang Jakarta</option>
                  <option value="Cabang Surabaya">Cabang Surabaya</option>
                  <option value="Cabang Bandung">Cabang Bandung</option>
                </select>
                <label>Cabang</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
  <hr class="mt-0">
  <div class="card-datatable table-responsive">
    <table class="dt-advanced-search table table-bordered">
      <thead>
        <tr>
          <th></th>
          <th>NPP</th>
          <th>Tanggal</th>
          <th>Jam Masuk</th>
          <th>Jam Pulang</th>
          <th>Durasi</th>
          <th>Cabang</th>
          <th>Status</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tfoot>
        <tr>
          <th></th>
          <th>NPP</th>
          <th>Tanggal</th>
          <th>Jam Masuk</th>
          <th>Jam Pulang</th>
          <th>Durasi</th>
          <th>Cabang</th>
          <th>Status</th>
          <th>Aksi</th>
        </tr>
      </tfoot>
    </table>
  </div>
</div>
<!--/ Advanced Search -->

<!-- Modal to add new record -->
<div class="offcanvas offcanvas-end" id="offcanvasAddPresence">
  <div class="offcanvas-header border-bottom">
    <h5 class="offcanvas-title" id="offcanvasAddPresenceLabel">Tambah Kehadiran</h5>
    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div class="offcanvas-body flex-grow-1">
    <form class="add-new-presence pt-0 row g-3" id="addNewPresenceForm" onsubmit="return false">
      <div class="col-sm-12">
        <div class="form-floating form-floating-outline">
          <input type="text" id="add-presence-npp" class="form-control" name="npp" placeholder="12345" />
          <label for="add-presence-npp">NPP Karyawan</label>
        </div>
      </div>
      <div class="col-sm-12">
        <div class="form-floating form-floating-outline">
          <input type="text" id="add-presence-date" class="form-control flatpickr-date" name="tgl_absensi" placeholder="YYYY-MM-DD" />
          <label for="add-presence-date">Tanggal</label>
        </div>
      </div>
      <div class="col-sm-12">
        <div class="form-floating form-floating-outline">
          <input type="text" id="add-presence-checkin" class="form-control flatpickr-time" name="jam_masuk" placeholder="08:00" />
          <label for="add-presence-checkin">Jam Masuk</label>
        </div>
      </div>
      <div class="col-sm-12">
        <div class="form-floating form-floating-outline">
          <input type="text" id="add-presence-checkout" class="form-control flatpickr-time" name="jam_pulang" placeholder="17:00" />
          <label for="add-presence-checkout">Jam Pulang</label>
        </div>
      </div>
      <div class="col-sm-12">
        <div class="form-floating form-floating-outline">
          <select id="add-presence-branch" class="form-select" name="branch_id">
            <option value="">Pilih Cabang</option>
            <option value="HO001">Kantor Pusat</option>
            <option value="BR001">Cabang Jakarta</option>
            <option value="BR002">Cabang Surabaya</option>
            <option value="BR003">Cabang Bandung</option>
          </select>
          <label for="add-presence-branch">Cabang</label>
        </div>
      </div>
      <div class="col-sm-12">
        <button type="submit" class="btn btn-primary data-submit me-sm-4 me-1">Simpan</button>
        <button type="reset" class="btn btn-outline-secondary" data-bs-dismiss="offcanvas">Batal</button>
      </div>
    </form>
  </div>
</div>

<!-- Modal Edit Kehadiran -->
<div class="modal fade" id="editPresenceModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Edit Kehadiran</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <form id="editPresenceForm">
        <div class="modal-body">
          <input type="hidden" id="edit-presence-id" name="id" />
          <div class="form-floating form-floating-outline mb-4">
            <input type="text" class="form-control" id="edit-presence-npp" name="npp" readonly />
            <label for="edit-presence-npp">NPP Karyawan</label>
          </div>
          <div class="form-floating form-floating-outline mb-4">
            <input type="text" id="edit-presence-date" class="form-control" name="tgl_absensi" readonly />
            <label for="edit-presence-date">Tanggal</label>
          </div>
          <div class="form-floating form-floating-outline mb-4">
            <input type="text" id="edit-presence-checkin" class="form-control flatpickr-time" name="jam_masuk" />
            <label for="edit-presence-checkin">Jam Masuk</label>
          </div>
          <div class="form-floating form-floating-outline mb-4">
            <input type="text" id="edit-presence-checkout" class="form-control flatpickr-time" name="jam_pulang" />
            <label for="edit-presence-checkout">Jam Pulang</label>
          </div>
          <div class="form-floating form-floating-outline mb-4">
            <textarea class="form-control" id="edit-presence-reason" name="correction_reason" placeholder="Alasan koreksi..." required></textarea>
            <label for="edit-presence-reason">Alasan Koreksi <span class="text-danger">*</span></label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
          <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Modal Konfirmasi Hapus -->
<div class="modal fade" id="deletePresenceModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Konfirmasi Hapus</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>Apakah Anda yakin ingin menghapus data kehadiran ini?</p>
        <p class="text-muted mb-0">NPP: <strong id="delete-presence-npp"></strong></p>
        <p class="text-muted">Tanggal: <strong id="delete-presence-date"></strong></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
        <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Hapus</button>
      </div>
    </div>
  </div>
</div>
@endsection
