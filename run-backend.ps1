# Start DevTrack Django API (port 8000)
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$venvPython = Join-Path $root "backend\.venv\Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "Virtual env not found. Create it first:"
    Write-Host "  python -m venv backend\.venv"
    Write-Host "  .\backend\.venv\Scripts\Activate.ps1"
    Write-Host "  pip install -r backend\requirements.txt"
    exit 1
}

Set-Location (Join-Path $root "backend")
& $venvPython manage.py runserver
