<?php

namespace App\Http\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AbsensiApiService
{
    protected $baseUrl;
    protected $token;

    public function __construct()
    {
        $this->baseUrl = env('ABSENSI_API_URL', 'http://localhost:8080/api');
        $this->token = env('ABSENSI_API_TOKEN', '');
    }

    /**
     * Get HTTP client with authorization header
     */
    protected function client()
    {
        return Http::withToken($this->token)
            ->acceptJson()
            ->timeout(30);
    }

    /**
     * Get list of presences with filters
     */
    public function getPresences(array $filters = [])
    {
        try {
            $response = $this->client()->get("{$this->baseUrl}/presences", $filters);
            return $response->json();
        } catch (\Exception $e) {
            Log::error('AbsensiApiService::getPresences - ' . $e->getMessage());
            return ['rcode' => '99', 'message' => 'Connection error'];
        }
    }

    /**
     * Get single presence by ID
     */
    public function getPresence($id)
    {
        try {
            $response = $this->client()->get("{$this->baseUrl}/presences/{$id}");
            return $response->json();
        } catch (\Exception $e) {
            Log::error('AbsensiApiService::getPresence - ' . $e->getMessage());
            return ['rcode' => '99', 'message' => 'Connection error'];
        }
    }

    /**
     * Create new presence record
     */
    public function createPresence(array $data)
    {
        try {
            $response = $this->client()->post("{$this->baseUrl}/presences", $data);
            return $response->json();
        } catch (\Exception $e) {
            Log::error('AbsensiApiService::createPresence - ' . $e->getMessage());
            return ['rcode' => '99', 'message' => 'Connection error'];
        }
    }

    /**
     * Update presence record
     */
    public function updatePresence($id, array $data)
    {
        try {
            $response = $this->client()->put("{$this->baseUrl}/presences/{$id}", $data);
            return $response->json();
        } catch (\Exception $e) {
            Log::error('AbsensiApiService::updatePresence - ' . $e->getMessage());
            return ['rcode' => '99', 'message' => 'Connection error'];
        }
    }

    /**
     * Delete presence record
     */
    public function deletePresence($id)
    {
        try {
            $response = $this->client()->delete("{$this->baseUrl}/presences/{$id}");
            return $response->json();
        } catch (\Exception $e) {
            Log::error('AbsensiApiService::deletePresence - ' . $e->getMessage());
            return ['rcode' => '99', 'message' => 'Connection error'];
        }
    }

    /**
     * Get presence statistics
     */
    public function getStatistics($startDate = null, $endDate = null)
    {
        try {
            $params = [];
            if ($startDate) $params['start_date'] = $startDate;
            if ($endDate) $params['end_date'] = $endDate;

            $response = $this->client()->get("{$this->baseUrl}/presences/statistics", $params);
            return $response->json();
        } catch (\Exception $e) {
            Log::error('AbsensiApiService::getStatistics - ' . $e->getMessage());
            return ['rcode' => '99', 'message' => 'Connection error'];
        }
    }

    /**
     * Get absensi table data (read-only)
     */
    public function getAbsensiTable(array $filters = [])
    {
        try {
            $response = $this->client()->get("{$this->baseUrl}/absensi-table", $filters);
            return $response->json();
        } catch (\Exception $e) {
            Log::error('AbsensiApiService::getAbsensiTable - ' . $e->getMessage());
            return ['rcode' => '99', 'message' => 'Connection error'];
        }
    }

    /**
     * Get absensi table statistics
     */
    public function getAbsensiStatistics(array $filters = [])
    {
        try {
            $response = $this->client()->get("{$this->baseUrl}/absensi-table/statistics", $filters);
            return $response->json();
        } catch (\Exception $e) {
            Log::error('AbsensiApiService::getAbsensiStatistics - ' . $e->getMessage());
            return ['rcode' => '99', 'message' => 'Connection error'];
        }
    }
}
