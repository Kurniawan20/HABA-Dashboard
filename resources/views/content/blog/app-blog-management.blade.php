@extends('layouts/layoutMaster')

@section('title', 'Manajemen Blog & Berita')

<!-- Vendor Styles -->
@section('vendor-style')
@vite([
  'resources/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.scss',
  'resources/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.scss',
  'resources/assets/vendor/libs/sweetalert2/sweetalert2.scss',
  'resources/assets/vendor/libs/quill/typography.scss',
  'resources/assets/vendor/libs/quill/katex.scss',
  'resources/assets/vendor/libs/quill/editor.scss'
])
@endsection

@section('vendor-script')
@vite([
  'resources/assets/vendor/libs/moment/moment.js',
  'resources/assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
  'resources/assets/vendor/libs/sweetalert2/sweetalert2.js',
  'resources/assets/vendor/libs/quill/katex.js',
  'resources/assets/vendor/libs/quill/quill.js'
])
@endsection

@section('page-script')
@vite(['resources/assets/js/app-blog-management.js'])
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
              <i class="ri-file-list-3-line ri-24px"></i>
            </div>
          </div>
          <div class="card-info">
            <h5 class="mb-0 me-2" id="stat-total">0</h5>
            <p class="mb-0">Total Blog</p>
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
              <i class="ri-check-line ri-24px"></i>
            </div>
          </div>
          <div class="card-info">
            <h5 class="mb-0 me-2" id="stat-published">0</h5>
            <p class="mb-0">Published</p>
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
              <i class="ri-draft-line ri-24px"></i>
            </div>
          </div>
          <div class="card-info">
            <h5 class="mb-0 me-2" id="stat-draft">0</h5>
            <p class="mb-0">Draft</p>
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
              <i class="ri-star-line ri-24px"></i>
            </div>
          </div>
          <div class="card-info">
            <h5 class="mb-0 me-2" id="stat-featured">0</h5>
            <p class="mb-0">Featured</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<!--/ Statistics Cards -->

<!-- Blog List Table -->
<div class="card">
  <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
    <h5 class="mb-0">Daftar Blog & Berita</h5>
    <div class="d-flex align-items-center gap-2 flex-nowrap">
      <div class="form-floating form-floating-outline" style="width: 150px;">
        <select class="form-select" id="filter-status">
          <option value="">Semua</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <label>Status</label>
      </div>
      <div class="form-floating form-floating-outline" style="width: 150px;">
        <select class="form-select" id="filter-category">
          <option value="">Semua</option>
          <option value="announcement">Pengumuman</option>
          <option value="news">Berita</option>
          <option value="event">Event</option>
          <option value="info">Info</option>
          <option value="other">Lainnya</option>
        </select>
        <label>Kategori</label>
      </div>
      <div class="input-group input-group-merge" style="width: 200px;">
        <span class="input-group-text"><i class="ri-search-line"></i></span>
        <input type="text" class="form-control" id="searchBlog" placeholder="Cari judul...">
      </div>
      <button type="button" class="btn btn-primary" id="btnAddBlog">
        <i class="ri-add-line me-1"></i>Tambah Blog
      </button>
    </div>
  </div>
  <div class="card-datatable table-responsive">
    <table class="datatables-blog table table-hover">
      <thead>
        <tr>
          <th></th>
          <th>Judul</th>
          <th>Kategori</th>
          <th>Status</th>
          <th>Penulis</th>
          <th>Tanggal Publish</th>
          <th>Views</th>
          <th>Aksi</th>
        </tr>
      </thead>
    </table>
  </div>
</div>
<!--/ Blog List Table -->

<!-- Add/Edit Blog Modal -->
<div class="modal fade" id="blogModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="blogModalTitle">Tambah Blog</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <form id="blogForm">
        <div class="modal-body">
          <input type="hidden" id="blog-id">
          <div class="row g-4">
            <div class="col-12">
              <div class="form-floating form-floating-outline">
                <input type="text" class="form-control" id="blog-title" placeholder="Judul Blog" required>
                <label>Judul <span class="text-danger">*</span></label>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-floating form-floating-outline">
                <select class="form-select" id="blog-category" required>
                  <option value="">Pilih Kategori</option>
                  <option value="announcement">Pengumuman</option>
                  <option value="news">Berita</option>
                  <option value="event">Event</option>
                  <option value="info">Info</option>
                  <option value="other">Lainnya</option>
                </select>
                <label>Kategori <span class="text-danger">*</span></label>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-floating form-floating-outline">
                <select class="form-select" id="blog-status">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
                <label>Status</label>
              </div>
            </div>
            <div class="col-12">
              <div class="form-floating form-floating-outline">
                <textarea class="form-control" id="blog-excerpt" rows="2" placeholder="Ringkasan singkat" style="height: 80px;"></textarea>
                <label>Ringkasan (Excerpt)</label>
              </div>
            </div>
            <div class="col-12">
              <label class="form-label">Konten <span class="text-danger">*</span></label>
              <div id="blog-content-editor" style="height: 300px;"></div>
              <input type="hidden" id="blog-content">
            </div>
            <div class="col-md-6">
              <label class="form-label">Gambar</label>
              <input type="file" class="form-control" id="blog-image" accept="image/*">
              <small class="text-muted">Max 2MB. Format: JPG, PNG</small>
            </div>
            <div class="col-md-6">
              <div class="form-check mt-4">
                <input class="form-check-input" type="checkbox" id="blog-featured">
                <label class="form-check-label" for="blog-featured">
                  <i class="ri-star-line me-1"></i>Featured (Tampil di carousel)
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="blog-pinned">
                <label class="form-check-label" for="blog-pinned">
                  <i class="ri-pushpin-line me-1"></i>Pinned (Selalu di atas)
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
          <button type="submit" class="btn btn-primary" id="btnSaveBlog">
            <i class="ri-save-line me-1"></i>Simpan
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
<!--/ Add/Edit Blog Modal -->
@endsection
