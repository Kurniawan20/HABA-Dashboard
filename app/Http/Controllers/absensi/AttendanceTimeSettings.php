<?php

namespace App\Http\Controllers\absensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AttendanceTimeSettings extends Controller
{
    public function index()
    {
        return view('content.absensi.app-attendance-time-settings');
    }
}
