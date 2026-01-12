<?php

namespace App\Http\Controllers\blog;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BlogManagement extends Controller
{
    public function index()
    {
        return view('content.blog.app-blog-management');
    }
}
