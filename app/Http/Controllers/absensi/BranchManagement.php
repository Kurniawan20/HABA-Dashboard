<?php

namespace App\Http\Controllers\absensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BranchManagement extends Controller
{
    public function index()
    {
        return view('content.absensi.app-branch-management');
    }
}
