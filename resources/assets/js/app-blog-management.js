/**
 * Blog Management - CRUD Operations
 */

'use strict';

$(function () {
  var dt_blog = $('.datatables-blog');
  var blogModal = document.getElementById('blogModal');
  var quillEditor;
  
  // API Configuration
  var API_BASE_URL = $('meta[name="api-base-url"]').attr('content') || 'http://localhost:8080/api';
  var API_TOKEN = localStorage.getItem('api_token') || '';
  
  var blogsData = [];
  
  // API Helper
  function apiCall(endpoint, method, data, isFormData) {
    var ajaxConfig = {
      url: API_BASE_URL + endpoint,
      method: method || 'GET',
      headers: {
        'Authorization': 'Bearer ' + API_TOKEN,
        'Accept': 'application/json'
      }
    };
    
    if (isFormData) {
      ajaxConfig.data = data;
      ajaxConfig.processData = false;
      ajaxConfig.contentType = false;
    } else if (method === 'GET' || method === 'DELETE') {
      ajaxConfig.data = data;
    } else {
      ajaxConfig.contentType = 'application/json';
      ajaxConfig.data = typeof data === 'string' ? data : JSON.stringify(data);
    }
    
    return $.ajax(ajaxConfig);
  }
  
  // Fetch blogs
  function fetchBlogs() {
    var params = {
      per_page: 100
    };
    
    var status = $('#filter-status').val();
    var category = $('#filter-category').val();
    var search = $('#searchBlog').val();
    
    if (status) params.status = status;
    if (category) params.category = category;
    if (search) params.search = search;
    
    apiCall('/blogs', 'GET', params)
      .done(function(response) {
        if (response.rcode === '00' && response.data) {
          var data = Array.isArray(response.data) ? response.data : (response.data.data || []);
          blogsData = data;
          updateDataTable();
          updateStats();
        }
      })
      .fail(function() {
        loadSampleData();
      });
  }
  
  // Load sample data
  function loadSampleData() {
    blogsData = [
      {
        id: 1,
        title: 'Pengumuman: Jadwal Cuti Bersama 2026',
        slug: 'pengumuman-jadwal-cuti-bersama-2026',
        category: 'announcement',
        status: 'published',
        author_name: 'Admin HR',
        published_at: '2026-01-10T04:00:00Z',
        view_count: 150,
        is_featured: true,
        is_pinned: true
      },
      {
        id: 2,
        title: 'Info: Pelatihan Keselamatan Kerja',
        slug: 'info-pelatihan-keselamatan-kerja',
        category: 'info',
        status: 'published',
        author_name: 'Admin',
        published_at: '2026-01-09T02:00:00Z',
        view_count: 85,
        is_featured: false,
        is_pinned: false
      }
    ];
    updateDataTable();
    updateStats();
  }
  
  // Update statistics
  function updateStats() {
    var total = blogsData.length;
    var published = blogsData.filter(function(b) { return b.status === 'published'; }).length;
    var draft = blogsData.filter(function(b) { return b.status === 'draft'; }).length;
    var featured = blogsData.filter(function(b) { return b.is_featured; }).length;
    
    $('#stat-total').text(total);
    $('#stat-published').text(published);
    $('#stat-draft').text(draft);
    $('#stat-featured').text(featured);
  }
  
  // Category labels
  var categoryObj = {
    'announcement': { title: 'Pengumuman', class: 'bg-label-danger' },
    'news': { title: 'Berita', class: 'bg-label-primary' },
    'event': { title: 'Event', class: 'bg-label-success' },
    'info': { title: 'Info', class: 'bg-label-info' },
    'other': { title: 'Lainnya', class: 'bg-label-secondary' }
  };
  
  // Status labels
  var statusObj = {
    'published': { title: 'Published', class: 'bg-label-success' },
    'draft': { title: 'Draft', class: 'bg-label-warning' },
    'archived': { title: 'Archived', class: 'bg-label-secondary' }
  };
  
  // Initialize Quill Editor
  if (document.getElementById('blog-content-editor')) {
    quillEditor = new Quill('#blog-content-editor', {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link', 'image'],
          ['clean']
        ]
      }
    });
  }
  
  // Initialize DataTable
  var dt = null;
  function updateDataTable() {
    if (dt) {
      dt.clear().rows.add(blogsData).draw();
    }
  }
  
  if (dt_blog.length) {
    dt = dt_blog.DataTable({
      data: [],
      columns: [
        { data: '' },
        { data: 'title' },
        { data: 'category' },
        { data: 'status' },
        { data: 'author_name' },
        { data: 'published_at' },
        { data: 'view_count' },
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
            var badges = '';
            if (full.is_featured) badges += '<i class="ri-star-fill text-warning me-1"></i>';
            if (full.is_pinned) badges += '<i class="ri-pushpin-fill text-danger me-1"></i>';
            return badges + '<span class="fw-medium">' + data + '</span>';
          }
        },
        {
          targets: 2,
          render: function (data) {
            var cat = categoryObj[data] || { title: data, class: 'bg-label-secondary' };
            return '<span class="badge ' + cat.class + '">' + cat.title + '</span>';
          }
        },
        {
          targets: 3,
          render: function (data) {
            var status = statusObj[data] || { title: data, class: 'bg-label-secondary' };
            return '<span class="badge ' + status.class + '">' + status.title + '</span>';
          }
        },
        {
          targets: 5,
          render: function (data) {
            if (!data) return '-';
            return moment(data).format('DD MMM YYYY');
          }
        },
        {
          targets: 6,
          render: function (data) {
            return '<span class="badge bg-label-info">' + (data || 0) + '</span>';
          }
        },
        {
          targets: -1,
          orderable: false,
          render: function (data, type, full) {
            var actions = '<div class="d-inline-block">' +
              '<a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ri-more-2-line"></i></a>' +
              '<ul class="dropdown-menu dropdown-menu-end m-0">' +
              '<li><a href="javascript:;" class="dropdown-item edit-blog" data-id="' + full.id + '"><i class="ri-edit-line me-2"></i>Edit</a></li>';
            
            if (full.status === 'draft') {
              actions += '<li><a href="javascript:;" class="dropdown-item publish-blog" data-id="' + full.id + '"><i class="ri-check-line me-2"></i>Publish</a></li>';
            }
            
            if (full.status === 'published') {
              actions += '<li><a href="javascript:;" class="dropdown-item archive-blog" data-id="' + full.id + '"><i class="ri-archive-line me-2"></i>Archive</a></li>';
            }
            
            actions += '<li><div class="dropdown-divider"></div></li>' +
              '<li><a href="javascript:;" class="dropdown-item text-danger delete-blog" data-id="' + full.id + '"><i class="ri-delete-bin-line me-2"></i>Hapus</a></li>' +
              '</ul></div>';
            
            return actions;
          }
        }
      ],
      order: [[5, 'desc']],
      dom: "<'row'<'col-sm-12'tr>><'row'<'col-sm-12 col-md-6'i><'col-sm-12 col-md-6 dataTables_pager'p>>",
      language: {
        info: 'Menampilkan _START_ sampai _END_ dari _TOTAL_ blog',
        infoEmpty: 'Tidak ada data',
        paginate: {
          next: '<i class="ri-arrow-right-s-line"></i>',
          previous: '<i class="ri-arrow-left-s-line"></i>'
        },
        emptyTable: 'Tidak ada blog',
        zeroRecords: 'Tidak ditemukan blog yang cocok'
      },
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) { return 'Detail: ' + row.data().title; }
          }),
          type: 'column'
        }
      }
    });
    
    // Search
    $('#searchBlog').on('keyup', function () {
      dt.search($(this).val()).draw();
    });
    
    // Filter status
    $('#filter-status').on('change', function () {
      fetchBlogs();
    });
    
    // Filter category
    $('#filter-category').on('change', function () {
      fetchBlogs();
    });
    
    // Initial load
    fetchBlogs();
  }
  
  // Add Blog
  $('#btnAddBlog').on('click', function () {
    $('#blogModalTitle').text('Tambah Blog');
    $('#blogForm')[0].reset();
    $('#blog-id').val('');
    if (quillEditor) quillEditor.setContents([]);
    var modal = new bootstrap.Modal(blogModal);
    modal.show();
  });
  
  // Edit Blog
  $(document).on('click', '.edit-blog', function () {
    var id = $(this).data('id');
    var blog = blogsData.find(function(b) { return b.id === id; });
    
    if (blog) {
      $('#blogModalTitle').text('Edit Blog');
      $('#blog-id').val(blog.id);
      $('#blog-title').val(blog.title);
      $('#blog-category').val(blog.category);
      $('#blog-status').val(blog.status);
      $('#blog-excerpt').val(blog.excerpt || '');
      $('#blog-featured').prop('checked', blog.is_featured);
      $('#blog-pinned').prop('checked', blog.is_pinned);
      
      if (quillEditor && blog.content) {
        quillEditor.root.innerHTML = blog.content;
      }
      
      var modal = new bootstrap.Modal(blogModal);
      modal.show();
    }
  });
  
  // Save Blog
  $('#blogForm').on('submit', function (e) {
    e.preventDefault();
    
    var id = $('#blog-id').val();
    var formData = new FormData();
    
    formData.append('title', $('#blog-title').val());
    formData.append('category', $('#blog-category').val());
    formData.append('status', $('#blog-status').val());
    formData.append('excerpt', $('#blog-excerpt').val());
    formData.append('content', quillEditor.root.innerHTML);
    formData.append('is_featured', $('#blog-featured').is(':checked') ? 1 : 0);
    formData.append('is_pinned', $('#blog-pinned').is(':checked') ? 1 : 0);
    formData.append('author_npp', 'admin');
    formData.append('author_name', 'Admin');
    
    var imageFile = $('#blog-image')[0].files[0];
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    var endpoint = id ? '/blogs/' + id : '/blogs';
    var method = id ? 'PUT' : 'POST';
    
    apiCall(endpoint, method, formData, true)
      .done(function(response) {
        if (response.rcode === '00') {
          bootstrap.Modal.getInstance(blogModal).hide();
          fetchBlogs();
          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: id ? 'Blog berhasil diupdate' : 'Blog berhasil ditambahkan',
            customClass: { confirmButton: 'btn btn-primary' },
            buttonsStyling: false
          });
        }
      })
      .fail(function() {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Terjadi kesalahan saat menyimpan blog',
          customClass: { confirmButton: 'btn btn-primary' },
          buttonsStyling: false
        });
      });
  });
  
  // Publish Blog
  $(document).on('click', '.publish-blog', function () {
    var id = $(this).data('id');
    
    Swal.fire({
      title: 'Publish Blog?',
      text: 'Blog akan dipublikasikan dan dapat dilihat di mobile app',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Publish',
      cancelButtonText: 'Batal',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-secondary ms-2'
      },
      buttonsStyling: false
    }).then(function (result) {
      if (result.isConfirmed) {
        apiCall('/blogs/' + id + '/publish', 'POST')
          .done(function(response) {
            if (response.rcode === '00') {
              fetchBlogs();
              Swal.fire({
                icon: 'success',
                title: 'Published!',
                text: 'Blog berhasil dipublikasikan',
                customClass: { confirmButton: 'btn btn-primary' },
                buttonsStyling: false
              });
            }
          });
      }
    });
  });
  
  // Archive Blog
  $(document).on('click', '.archive-blog', function () {
    var id = $(this).data('id');
    
    apiCall('/blogs/' + id + '/archive', 'POST')
      .done(function(response) {
        if (response.rcode === '00') {
          fetchBlogs();
          Swal.fire({
            icon: 'success',
            title: 'Diarsipkan',
            text: 'Blog berhasil diarsipkan',
            timer: 1500,
            showConfirmButton: false
          });
        }
      });
  });
  
  // Delete Blog
  $(document).on('click', '.delete-blog', function () {
    var id = $(this).data('id');
    
    Swal.fire({
      title: 'Hapus Blog?',
      text: 'Data yang dihapus tidak dapat dikembalikan',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-outline-secondary ms-2'
      },
      buttonsStyling: false
    }).then(function (result) {
      if (result.isConfirmed) {
        apiCall('/blogs/' + id, 'DELETE')
          .done(function(response) {
            if (response.rcode === '00') {
              fetchBlogs();
              Swal.fire({
                icon: 'success',
                title: 'Terhapus!',
                text: 'Blog berhasil dihapus',
                customClass: { confirmButton: 'btn btn-primary' },
                buttonsStyling: false
              });
            }
          });
      }
    });
  });
});
