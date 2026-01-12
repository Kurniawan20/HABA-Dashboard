<?php

namespace App\Http\Controllers\absensi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PresenceList extends Controller
{
    public function index()
    {
        return view('content.absensi.app-presence-list');
    }
}
