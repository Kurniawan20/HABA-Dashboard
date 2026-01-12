# API Absensi Mobile V2 - Documentation

> **Base URL**: `http://your-server/api`  
> **Authentication**: JWT Bearer Token (required for protected endpoints)

---

## Table of Contents
1. [Authentication](#1-authentication)
2. [Attendance (Mobile)](#2-attendance-mobile)
3. [Presence Management (Admin)](#3-presence-management-admin)
4. [Absensi Table Data (Read-only)](#4-absensi-table-data-read-only)
5. [Branch Management](#5-branch-management)
6. [Jam Absensi (Attendance Time Settings)](#6-jam-absensi-attendance-time-settings)
7. [Device Reset](#7-device-reset)
8. [Dashboard Statistics (Charts)](#8-dashboard-statistics-charts)
9. [Blog/News](#9-blognews)
10. [Users & Employees](#10-users--employees)

---

## 1. Authentication

### POST `/login`
Authenticate user and get JWT token.

**Request Body:**
```json
{
    "npp": "string",        // Employee ID (required)
    "password": "string",   // Password (required)
    "device_id": "string"   // Unique device identifier (required)
}
```

**Success Response (200):**
```json
{
    "rcode": "00",
    "nama": "John Doe",
    "kode_kantor": "HO001",
    "nama_kantor": "Head Office",
    "group": "Admin",
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "Bearer",
    "message": "authenticated"
}
```

**Error Responses:**
| rcode | message | Description |
|-------|---------|-------------|
| `81` | `Device Telah Terdaftar` | Device already registered to another user |
| `81` | `Device Tidak Sesuai` | Device mismatch |
| `81` | `User Tidak Terdaftar` | User not registered |
| - | `NRK atau Password Salah` | Invalid credentials |

---

### POST `/checksession`
Check if device session is valid.

**Request Body:**
```json
{
    "npp": "string",
    "deviceId": "string"
}
```

**Response:**
```json
{
    "rcode": "00",          // "00" = valid, "01" = invalid
    "message": "Device sesuai"
}
```

---

### POST `/deletedevice`
Remove device registration.

**Request Body:**
```json
{
    "npp": "string"
}
```

**Response:**
```json
"berhasil dihapus device user dengan npp 12345"
```

---

## 2. Attendance (Mobile)

> All endpoints require: `Authorization: Bearer {token}`

### POST `/absenmasuk`
Employee check-in.

**Request Body:**
```json
{
    "npp": "string",         // Employee ID (required)
    "latitude": "string",    // GPS latitude (required)
    "longitude": "string",   // GPS longitude (required)
    "cdate": "string",       // Client date (optional)
    "branch_id": "string"    // Branch ID (optional)
}
```

**Responses:**
| rcode | message | Description |
|-------|---------|-------------|
| `00` | `Absen masuk berhasil` | Success |
| `01` | `Belum bisa melakuan absen masuk...` | Too early |
| `02` | `Anda telah melakukan absen masuk` | Already checked in |

---

### POST `/absenpulang`
Employee check-out.

**Request Body:**
```json
{
    "npp": "string",
    "latitude": "string",
    "longitude": "string",
    "cdate": "string",
    "branch_id": "string"
}
```

**Response:**
```json
{
    "rcode": "00",
    "message": "Absen pulang berhasil"
}
```

---

### POST `/getabsen`
Get attendance history by month.

**Request Body:**
```json
{
    "npp": "string",
    "year": "2024",
    "month": "01"
}
```

**Response:**
```json
[
    {
        "tanggal": "2024-01-15",
        "jam_masuk": "08:00",
        "jam_keluar": "17:00",
        "ket_absensi": "-"
    }
]
```

---

### POST `/kantor`
Get office location and radius.

**Request Body:**
```json
{
    "kode_kantor": "string",
    "npp": "string"
}
```

**Response:**
```json
{
    "kode_kantor": "HO001",
    "latitude": "-6.2088",
    "longitude": "106.8456",
    "radius": "50"
}
```

---

## 3. Presence Management (Admin)

> All endpoints require: `Authorization: Bearer {token}`

### GET `/presences`
List all presence records with filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | date | Filter start date (YYYY-MM-DD) |
| `end_date` | date | Filter end date (YYYY-MM-DD) |
| `npp` | string/array | Filter by employee ID(s) |
| `branch_id` | string/array | Filter by branch ID(s) |
| `status` | string | `checkin_only`, `complete`, `checkout_only` |
| `per_page` | int | Records per page (default: 50) |
| `export` | bool | Return all without pagination |

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "npp": "12345",
                "latitude": "-6.2088",
                "longitude": "106.8456",
                "tgl_absensi": "20240115",
                "jam_masuk": "2024-01-15 08:00:00",
                "jam_pulang": "2024-01-15 17:00:00",
                "no_absensi": 1,
                "branch_id": "HO001",
                "device_info": "Mobile App",
                "cdate": "2024-01-15 08:00:00"
            }
        ],
        "per_page": 50,
        "total": 100
    },
    "filters": {
        "start_date": "2024-01-01",
        "end_date": "2024-01-31"
    }
}
```

---

### POST `/presences`
Create new presence record.

**Request Body:**
```json
{
    "npp": "12345",                          // required
    "latitude": "-6.2088",                   // required
    "longitude": "106.8456",                 // required
    "tgl_absensi": "2024-01-15",             // required (YYYY-MM-DD)
    "jam_masuk": "2024-01-15 08:00:00",      // optional
    "jam_pulang": "2024-01-15 17:00:00",     // optional
    "branch_id": "HO001",                    // required
    "device_info": "Admin Entry",            // optional
    "notes": "Manual entry",                 // optional
    "override_duplicate": false              // optional - override if exists
}
```

**Success Response (201):**
```json
{
    "rcode": "00",
    "message": "Presence created successfully in both systems",
    "data": { /* presence object */ },
    "sql_server_employee_id": "EMP001",
    "systems_updated": ["MySQL", "SQL Server"]
}
```

**Error Responses:**
| rcode | HTTP | Description |
|-------|------|-------------|
| `81` | 404 | Employee not found in HR system |
| `82` | 409 | Duplicate record exists |
| `99` | 500 | Server error |

---

### GET `/presences/{id}`
Get specific presence record.

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": { /* presence object */ }
}
```

---

### PUT `/presences/{id}`
Update presence record.

**Request Body:**
```json
{
    "jam_masuk": "2024-01-15 08:15:00",
    "jam_pulang": "2024-01-15 17:15:00",
    "latitude": "-6.2088",
    "longitude": "106.8456",
    "branch_id": "HO001",
    "correction_reason": "Time correction"    // required
}
```

**Response:**
```json
{
    "rcode": "00",
    "message": "Presence updated successfully in both systems",
    "data": { /* updated presence object */ },
    "correction_reason": "Time correction",
    "systems_updated": ["MySQL", "SQL Server"]
}
```

---

### DELETE `/presences/{id}`
Delete presence record.

**Response:**
```json
{
    "rcode": "00",
    "message": "Presence deleted successfully from both systems",
    "systems_updated": ["MySQL", "SQL Server"],
    "sql_server_records_deleted": 1
}
```

---

### GET `/presences/statistics`
Get presence statistics.

**Query Parameters:**
| Parameter | Type | Default |
|-----------|------|---------|
| `start_date` | date | First day of month |
| `end_date` | date | Last day of month |

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": {
        "total_presences": 500,
        "unique_employees": 50,
        "checkin_only": 10,
        "complete_presences": 480,
        "by_branch": [
            { "branch_id": "HO001", "total": 300 },
            { "branch_id": "BR002", "total": 200 }
        ]
    }
}
```

---

### POST `/presences/bulk-update`
Bulk update multiple presence records.

**Request Body:**
```json
{
    "ids": [1, 2, 3, 4, 5],
    "update_data": {
        "branch_id": "HO002"
    }
}
```

**Response:**
```json
{
    "rcode": "00",
    "message": "Bulk update completed",
    "updated_count": 5
}
```

---

## 4. Absensi Table Data (Read-only)

> All endpoints require: `Authorization: Bearer {token}`

### GET `/absensi-table`
List absensi records with comprehensive filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | date | Filter start date |
| `end_date` | date | Filter end date |
| `date` | date | Filter single date |
| `npp` | string/array | Filter by employee ID(s) |
| `branch_id` | string/array | Filter by branch ID(s) |
| `status` | string | `checkin_only`, `complete`, `checkout_only`, `no_checkin` |
| `late_only` | bool | Only late check-ins (after 08:00) |
| `early_checkout_only` | bool | Only early checkouts (before 17:00) |
| `checkin_start` | time | Check-in time range start |
| `checkin_end` | time | Check-in time range end |
| `per_page` | int | Records per page (default: 50) |
| `page` | int | Page number |
| `export` | bool | Return all without pagination |

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "npp": "12345",
                "tgl_absensi": "20240115",
                "jam_masuk": "2024-01-15 08:00:00",
                "jam_pulang": "2024-01-15 17:00:00",
                "latitude": "-6.2088",
                "longitude": "106.8456",
                "branch_id": "HO001",
                "duration": "9 jam 00 menit",
                "is_late": false,
                "is_early_checkout": false
            }
        ],
        "per_page": 50,
        "total": 100,
        "last_page": 2
    },
    "filters_applied": {
        "start_date": "2024-01-01",
        "end_date": "2024-01-31"
    },
    "summary": {
        "total_records": 100,
        "current_page": 1,
        "per_page": 50,
        "last_page": 2
    }
}
```

---

### GET `/absensi-table/{id}`
Get specific absensi record.

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": {
        "id": 1,
        "npp": "12345",
        "tgl_absensi": "20240115",
        "jam_masuk": "2024-01-15 08:00:00",
        "jam_pulang": "2024-01-15 17:00:00",
        "duration": "9 jam 00 menit",
        "is_late": false,
        "is_early_checkout": false
    }
}
```

---

### GET `/absensi-table/statistics`
Get absensi statistics.

**Query Parameters:**
| Parameter | Type | Default |
|-----------|------|---------|
| `start_date` | date | First day of month |
| `end_date` | date | Last day of month |
| `npp` | string/array | Filter by employee(s) |
| `branch_id` | string/array | Filter by branch(es) |

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": {
        "total_records": 500,
        "unique_employees": 50,
        "checkin_only": 10,
        "complete_attendance": 480,
        "late_checkin": 25,
        "early_checkout": 15,
        "completion_rate": 96.0,
        "late_rate": 5.0,
        "date_range": {
            "start_date": "2024-01-01",
            "end_date": "2024-01-31"
        }
    }
}
```

---

## 5. Branch Management

> All endpoints require: `Authorization: Bearer {token}`

### GET `/branches`
List all branches with pagination.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by kode_kantor or nama_kantor |
| `per_page` | int | Records per page (default: 50) |
| `export` | bool | Return all without pagination |

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "kode_kantor": "HO001",
                "nama_kantor": "Head Office Jakarta",
                "latitude": "-6.2088",
                "longitude": "106.8456",
                "radius": 50,
                "created_at": "2024-01-01T00:00:00.000000Z",
                "updated_at": "2024-01-01T00:00:00.000000Z"
            }
        ],
        "per_page": 50,
        "total": 10
    }
}
```

---

### POST `/branches`
Create new branch.

**Request Body:**
```json
{
    "kode_kantor": "JKT002",        // required, unique
    "nama_kantor": "Jakarta Branch 2",  // optional
    "latitude": "-6.2088",          // required
    "longitude": "106.8456",        // required
    "radius": 100                   // optional, default: 50 (meters)
}
```

**Success Response (201):**
```json
{
    "rcode": "00",
    "message": "Branch created successfully",
    "data": {
        "id": 2,
        "kode_kantor": "JKT002",
        "nama_kantor": "Jakarta Branch 2",
        "latitude": "-6.2088",
        "longitude": "106.8456",
        "radius": 100,
        "created_at": "2024-01-15T08:00:00.000000Z",
        "updated_at": "2024-01-15T08:00:00.000000Z"
    }
}
```

**Error Responses:**
| rcode | HTTP | Description |
|-------|------|-------------|
| `01` | 422 | Validation error |
| `82` | 409 | Kode kantor sudah terdaftar |
| `99` | 500 | Server error |

---

### GET `/branches/{id}`
Get specific branch by ID.

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": {
        "id": 1,
        "kode_kantor": "HO001",
        "nama_kantor": "Head Office Jakarta",
        "latitude": "-6.2088",
        "longitude": "106.8456",
        "radius": 50
    }
}
```

---

### PUT `/branches/{id}`
Update branch.

**Request Body:**
```json
{
    "kode_kantor": "HO001",         // optional
    "nama_kantor": "Head Office",   // optional
    "latitude": "-6.2100",          // optional
    "longitude": "106.8500",        // optional
    "radius": 75                    // optional
}
```

**Response:**
```json
{
    "rcode": "00",
    "message": "Branch updated successfully",
    "data": {
        "id": 1,
        "kode_kantor": "HO001",
        "nama_kantor": "Head Office",
        "latitude": "-6.2100",
        "longitude": "106.8500",
        "radius": 75
    }
}
```

---

### DELETE `/branches/{id}`
Delete branch.

**Response:**
```json
{
    "rcode": "00",
    "message": "Branch deleted successfully",
    "deleted_kode_kantor": "JKT002"
}
```

---

### POST `/branches/by-kode`
Get branch by kode_kantor (for mobile app compatibility).

**Request Body:**
```json
{
    "kode_kantor": "HO001"
}
```

**Response:**
```json
{
    "rcode": "00",
    "kode_kantor": "HO001",
    "nama_kantor": "Head Office Jakarta",
    "latitude": "-6.2088",
    "longitude": "106.8456",
    "radius": 50
}
```

---

## 6. Jam Absensi (Attendance Time Settings)

> All endpoints require: `Authorization: Bearer {token}`

### GET `/jam-absensi`
List all attendance time settings.

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": [
        {
            "id": 1,
            "nama": "Default",
            "start_jam_masuk": "07:30:00",
            "end_jam_masuk": "09:00:00",
            "start_jam_pulang": "13:00:00",
            "end_jam_pulang": "18:00:00",
            "is_active": true,
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z"
        }
    ]
}
```

---

### GET `/jam-absensi/active`
Get the currently active attendance time setting.

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": {
        "id": 1,
        "nama": "Default",
        "start_jam_masuk": "07:30:00",
        "end_jam_masuk": "09:00:00",
        "start_jam_pulang": "13:00:00",
        "end_jam_pulang": "18:00:00",
        "is_active": true
    }
}
```

---

### POST `/jam-absensi`
Create new attendance time setting.

**Request Body:**
```json
{
    "nama": "Shift Pagi",                 // required
    "start_jam_masuk": "06:00:00",        // required (HH:mm:ss)
    "end_jam_masuk": "08:00:00",          // optional
    "start_jam_pulang": "14:00:00",       // required (HH:mm:ss)
    "end_jam_pulang": "16:00:00",         // optional
    "is_active": false                    // optional, default: false
}
```

**Success Response (201):**
```json
{
    "rcode": "00",
    "message": "Attendance time setting created successfully",
    "data": {
        "id": 2,
        "nama": "Shift Pagi",
        "start_jam_masuk": "06:00:00",
        "end_jam_masuk": "08:00:00",
        "start_jam_pulang": "14:00:00",
        "end_jam_pulang": "16:00:00",
        "is_active": false
    }
}
```

---

### GET `/jam-absensi/{id}`
Get specific attendance time setting.

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": {
        "id": 1,
        "nama": "Default",
        "start_jam_masuk": "07:30:00",
        "end_jam_masuk": "09:00:00",
        "start_jam_pulang": "13:00:00",
        "end_jam_pulang": "18:00:00",
        "is_active": true
    }
}
```

---

### PUT `/jam-absensi/{id}`
Update attendance time setting.

**Request Body:**
```json
{
    "nama": "Default Updated",            // optional
    "start_jam_masuk": "08:00:00",        // optional
    "end_jam_masuk": "09:30:00",          // optional
    "start_jam_pulang": "17:00:00",       // optional
    "end_jam_pulang": "18:30:00",         // optional
    "is_active": true                     // optional
}
```

**Response:**
```json
{
    "rcode": "00",
    "message": "Attendance time setting updated successfully",
    "data": { /* updated object */ }
}
```

---

### DELETE `/jam-absensi/{id}`
Delete attendance time setting.

> **Note:** Cannot delete the last remaining setting.

**Response:**
```json
{
    "rcode": "00",
    "message": "Attendance time setting deleted successfully",
    "deleted_nama": "Shift Pagi"
}
```

**Error Response (400):**
```json
{
    "rcode": "82",
    "message": "Cannot delete the last attendance time setting"
}
```

---

### POST `/jam-absensi/{id}/set-active`
Set a specific attendance time setting as active.

> **Note:** This will automatically deactivate all other settings.

**Response:**
```json
{
    "rcode": "00",
    "message": "Attendance time setting activated successfully",
    "data": {
        "id": 2,
        "nama": "Shift Pagi",
        "is_active": true
    }
}
```

---

## 7. Device Reset

API untuk mengelola permintaan reset device dari mobile app dengan approval dari dashboard admin dan notifikasi email.

### Flow
```
Mobile Request → Pending → Admin Approve/Reject → Email Notification → User Login (new device)
```

---

### For Mobile App

#### POST `/device-reset/request`
Request reset device baru.

**Request Body:**
```json
{
    "npp": "12345",                          // required
    "reason": "HP hilang dan sudah beli baru"  // required, min 10 chars
}
```

**Success Response (201):**
```json
{
    "rcode": "00",
    "message": "Permintaan reset device berhasil diajukan. Mohon tunggu approval dari admin.",
    "data": {
        "id": 1,
        "npp": "12345",
        "old_device_id": "abc123xyz",
        "reason": "HP hilang dan sudah beli baru",
        "status": "pending",
        "created_at": "2024-01-15T08:00:00.000000Z"
    }
}
```

**Error Responses:**
| rcode | Description |
|-------|-------------|
| `81` | User tidak ditemukan |
| `82` | Sudah ada permintaan pending |

---

#### POST `/device-reset/my-request`
Cek status permintaan reset device.

**Request Body:**
```json
{
    "npp": "12345"
}
```

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": [
        {
            "id": 1,
            "npp": "12345",
            "status": "pending",
            "reason": "HP hilang",
            "created_at": "2024-01-15T08:00:00.000000Z"
        }
    ]
}
```

---

### For Dashboard Admin

#### GET `/device-reset`
List semua device reset requests.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | `pending`, `approved`, `rejected` |
| `npp` | string | Filter by employee |
| `start_date` | date | Filter start date |
| `end_date` | date | Filter end date |
| `per_page` | int | Records per page |

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "npp": "12345",
                "old_device_id": "abc123xyz",
                "reason": "HP hilang",
                "status": "pending",
                "processed_by": null,
                "processed_at": null,
                "user": {
                    "nama": "John Doe",
                    "email": "john@email.com"
                }
            }
        ]
    }
}
```

---

#### GET `/device-reset/pending`
List pending requests only.

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": [ /* array of pending requests */ ],
    "total_pending": 5
}
```

---

#### GET `/device-reset/{id}`
Get specific request detail.

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": {
        "id": 1,
        "npp": "12345",
        "old_device_id": "abc123xyz",
        "reason": "HP hilang dan sudah beli baru",
        "status": "pending",
        "user": { "nama": "John Doe", "email": "john@email.com" }
    }
}
```

---

#### POST `/device-reset/{id}/approve`
Approve reset device request. Akan menghapus device lama dan kirim email.

**Request Body:**
```json
{
    "admin_npp": "admin123",    // optional
    "notes": "Approved"         // optional
}
```

**Response:**
```json
{
    "rcode": "00",
    "message": "Device reset berhasil disetujui. User dapat login dengan device baru.",
    "data": {
        "id": 1,
        "status": "approved",
        "processed_by": "admin123",
        "processed_at": "2024-01-15T10:00:00.000000Z"
    },
    "email_sent": true
}
```

---

#### POST `/device-reset/{id}/reject`
Reject reset device request dengan alasan.

**Request Body:**
```json
{
    "admin_npp": "admin123",                    // optional
    "reason": "Alasan tidak valid, silakan hubungi HRD"  // required, min 10 chars
}
```

**Response:**
```json
{
    "rcode": "00",
    "message": "Device reset ditolak.",
    "data": {
        "id": 1,
        "status": "rejected",
        "processed_by": "admin123",
        "admin_notes": "Alasan tidak valid..."
    },
    "email_sent": true
}
```

---

## 8. Dashboard Statistics (Charts)

API untuk data chart dan statistik dashboard.

> All endpoints require: `Authorization: Bearer {token}`

---

### GET `/dashboard/summary`
Get today and monthly summary statistics.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `date` | date | today | Date to get summary for |
| `npp` | string | - | Filter by employee NPP |
| `branch_id` | string | - | Filter by branch |

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "date": "2023-10-15",
    "data": {
        "today": {
            "total": 45,
            "on_time": 40,
            "late": 5,
            "complete": 30,
            "checkin_only": 15
        },
        "month": {
            "period": "October 2023",
            "total_records": 850,
            "unique_employees": 50,
            "late_count": 45,
            "early_checkout_count": 20,
            "late_rate": 5.29
        },
        "top_branches": [
            { "branch_id": "HO001", "total": 300 },
            { "branch_id": "BR002", "total": 200 }
        ]
    }
}
```

---

### GET `/dashboard/monthly-trend`
Get 12-month attendance trend for line/bar chart.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `year` | int | current year | Year to get trend |
| `npp` | string | - | Filter by employee NPP |
| `branch_id` | string | - | Filter by branch |

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "year": "2023",
    "data": [
        { "month": "Jan", "month_num": "01", "total": 20, "on_time": 18, "late": 2, "absent": 0 },
        { "month": "Feb", "month_num": "02", "total": 21, "on_time": 19, "late": 2, "absent": 0 },
        { "month": "Mar", "month_num": "03", "total": 22, "on_time": 20, "late": 2, "absent": 0 }
    ]
}
```

---

### GET `/dashboard/weekly-pattern`
Get average check-in/check-out time per day of week.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `start_date` | date | Jan 1 | Start date |
| `end_date` | date | Dec 31 | End date |
| `npp` | string | - | Filter by employee |
| `branch_id` | string | - | Filter by branch |

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": [
        { "day": "Minggu", "day_num": 0, "avg_checkin": null, "avg_checkout": null, "total_records": 0 },
        { "day": "Senin", "day_num": 1, "avg_checkin": "07:55", "avg_checkout": "17:10", "total_records": 50 },
        { "day": "Selasa", "day_num": 2, "avg_checkin": "08:02", "avg_checkout": "17:05", "total_records": 48 },
        { "day": "Rabu", "day_num": 3, "avg_checkin": "07:58", "avg_checkout": "17:08", "total_records": 52 },
        { "day": "Kamis", "day_num": 4, "avg_checkin": "08:00", "avg_checkout": "17:00", "total_records": 50 },
        { "day": "Jumat", "day_num": 5, "avg_checkin": "08:05", "avg_checkout": "16:30", "total_records": 45 },
        { "day": "Sabtu", "day_num": 6, "avg_checkin": null, "avg_checkout": null, "total_records": 0 }
    ]
}
```

---

### GET `/dashboard/hourly-distribution`
Get check-in distribution per hour for histogram chart.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `start_date` | date | 1st of month | Start date |
| `end_date` | date | end of month | End date |
| `npp` | string | - | Filter by employee NPP |
| `branch_id` | string | - | Filter by branch |

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": [
        { "hour": "06:00", "count": 5 },
        { "hour": "07:00", "count": 150 },
        { "hour": "08:00", "count": 280 },
        { "hour": "09:00", "count": 45 },
        { "hour": "10:00", "count": 10 }
    ]
}
```

---

### GET `/dashboard/branch-comparison`
Get attendance comparison between branches.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `start_date` | date | 1st of month | Start date |
| `end_date` | date | end of month | End date |

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": [
        { "branch_id": "HO001", "total": 300, "on_time": 280, "late": 20, "late_rate": 6.67 },
        { "branch_id": "BR002", "total": 200, "on_time": 190, "late": 10, "late_rate": 5.0 },
        { "branch_id": "BR003", "total": 150, "on_time": 145, "late": 5, "late_rate": 3.33 }
    ]
}
```

---

## 9. Blog/News

API untuk blog dan berita yang ditampilkan di mobile app dashboard.

> All endpoints require: `Authorization: Bearer {token}`

---

### GET `/blogs/published` (Mobile)
Get published blogs for mobile app dashboard.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | string | - | Filter by category (announcement, news, event, info, other) |
| `limit` | int | 10 | Number of blogs to return |

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": [
        {
            "id": 1,
            "title": "Pengumuman: Jadwal Cuti Bersama 2026",
            "slug": "pengumuman-jadwal-cuti-bersama-2026-1",
            "excerpt": "Kepada seluruh karyawan, berikut jadwal cuti bersama...",
            "image_thumbnail": null,
            "category": "announcement",
            "is_featured": true,
            "is_pinned": true,
            "published_at": "2026-01-10T04:00:00.000000Z",
            "view_count": 150
        }
    ]
}
```

---

### GET `/blogs/featured` (Mobile)
Get featured blogs for carousel/banner.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | int | 5 | Number of featured blogs |

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": [
        {
            "id": 1,
            "title": "Pengumuman: Jadwal Cuti Bersama 2026",
            "slug": "pengumuman-jadwal-cuti-bersama-2026-1",
            "excerpt": "Kepada seluruh karyawan...",
            "image": "blogs/image.jpg",
            "image_thumbnail": "blogs/thumb.jpg",
            "category": "announcement",
            "published_at": "2026-01-10T04:00:00.000000Z"
        }
    ]
}
```

---

### GET `/blogs/slug/{slug}` (Mobile)
Get blog detail by slug (for deep linking).

**Response:**
```json
{
    "rcode": "00",
    "message": "Success",
    "data": {
        "id": 1,
        "title": "Pengumuman: Jadwal Cuti Bersama 2026",
        "slug": "pengumuman-jadwal-cuti-bersama-2026-1",
        "excerpt": "Kepada seluruh karyawan...",
        "content": "<p>Full HTML content...</p>",
        "image": "blogs/image.jpg",
        "category": "announcement",
        "status": "published",
        "is_featured": true,
        "author_name": "Admin HR",
        "view_count": 151,
        "published_at": "2026-01-10T04:00:00.000000Z"
    }
}
```

---

### GET `/blogs` (Admin)
List all blogs with filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter: draft, published, archived |
| `category` | string | Filter by category |
| `is_featured` | boolean | Filter featured only |
| `search` | string | Search in title/content |
| `per_page` | int | Items per page (default: 20) |

---

### POST `/blogs` (Admin)
Create new blog.

**Request Body (form-data):**
```json
{
    "title": "Judul Blog",
    "content": "<p>Konten HTML...</p>",
    "excerpt": "Ringkasan singkat (opsional)",
    "category": "news",
    "status": "draft",
    "is_featured": false,
    "is_pinned": false,
    "author_npp": "admin001",
    "author_name": "Admin HR",
    "image": "(file upload)"
}
```

---

### GET `/blogs/{id}` (Admin)
Get blog by ID.

---

### PUT `/blogs/{id}` (Admin)
Update blog.

---

### DELETE `/blogs/{id}` (Admin)
Delete blog.

---

### POST `/blogs/{id}/publish` (Admin)
Publish a draft blog.

**Response:**
```json
{
    "rcode": "00",
    "message": "Blog published successfully",
    "data": { ... }
}
```

---

### POST `/blogs/{id}/archive` (Admin)
Archive a blog.

---

## 10. Users & Employees

> All endpoints require: `Authorization: Bearer {token}`

### GET `/users/{npp}`
Get user by NPP.

**Response:**
```json
{
    "id": 1,
    "npp": "12345",
    "nama": "John Doe",
    "id_group_menu": 1,
    "radius": 50,
    "kd_unit": "813"
}
```

---

### POST `/users`
Create new user.

**Request Body:**
```json
{
    "npp": "12345",           // Employee ID from HRIS
    "id_group_menu": "1",     // Group menu ID
    "radius": "50",           // Attendance radius (meters)
    "kd_unit": "813"          // Unit code
}
```

**Response:**
```json
{
    "message": "success"
}
```

---

### PUT `/users/{id}`
Update user.

**Request Body:**
```json
{
    "npp": "12345",
    "radius": "100"
}
```

**Response:**
```json
{
    "id": 1,
    "npp": "12345",
    "nama": "John Doe",
    "radius": "100"
}
```

---

### GET `/pegawai`
List all employees (DataTables format).

**Response:** DataTables JSON format with columns: `npp`, `kd_unit`, `nama_pegawai`

---

## Error Codes Reference

| rcode | Description |
|-------|-------------|
| `00` | Success |
| `01` | Validation/timing error |
| `02` | Duplicate/already exists |
| `81` | Not found / Invalid |
| `82` | Conflict (duplicate) |
| `99` | Server error |

---

## Authentication Headers

For all protected endpoints:
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json
```

---

## Dashboard Integration Examples

### JavaScript/Fetch Example
```javascript
// Login
const login = async (npp, password, deviceId) => {
    const response = await fetch('http://your-server/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npp, password, device_id: deviceId })
    });
    return response.json();
};

// Get Presences with Token
const getPresences = async (token, filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`http://your-server/api/presences?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
};

// Get Statistics
const getStatistics = async (token, startDate, endDate) => {
    const response = await fetch(
        `http://your-server/api/absensi-table/statistics?start_date=${startDate}&end_date=${endDate}`,
        { headers: { 'Authorization': `Bearer ${token}` }}
    );
    return response.json();
};
```

### Axios Example
```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://your-server/api',
    headers: { 'Content-Type': 'application/json' }
});

// Set token after login
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// API calls
const presences = await api.get('/presences', { params: { per_page: 50 } });
const stats = await api.get('/absensi-table/statistics');
```
