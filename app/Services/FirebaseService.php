<?php

namespace App\Services;

use Exception;

class FirebaseService
{
    protected string $projectId;

    public function __construct()
    {
        $this->projectId = config('firebase.project_id') ?? '';
    }

    /**
     * Verify if Firebase credentials & configurations are present.
     */
    public function isConfigured(): bool
    {
        return !empty($this->projectId);
    }
}