# NairaPay Backend - cPanel Deployment Preparation Script
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  NairaPay Backend - cPanel Deployment Prep" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = $PSScriptRoot
$deploymentFolder = Join-Path $backendPath "cpanel-deployment"

Write-Host "Creating deployment folder..." -ForegroundColor Yellow
if (Test-Path $deploymentFolder) {
    Remove-Item -Recurse -Force $deploymentFolder
}
New-Item -ItemType Directory -Path $deploymentFolder | Out-Null

$foldersToCopy = @("api", "config", "controllers", "middleware", "models", "public", "routes", "scripts", "services", "utils", "validators", "views")
$filesToCopy = @("server.js", "package.json", "package-lock.json", ".env.example", ".gitignore")

Write-Host ""
Write-Host "Copying production files..." -ForegroundColor Yellow

foreach ($folder in $foldersToCopy) {
    $sourcePath = Join-Path $backendPath $folder
    if (Test-Path $sourcePath) {
        $destPath = Join-Path $deploymentFolder $folder
        Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force
        Write-Host "  OK Copied: $folder/" -ForegroundColor Green
    }
}

foreach ($file in $filesToCopy) {
    $sourcePath = Join-Path $backendPath $file
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $deploymentFolder -Force
        Write-Host "  OK Copied: $file" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Creating .htaccess template..." -ForegroundColor Yellow

$htaccessContent = @"
PassengerAppRoot "/home/username/public_html/api"
PassengerBaseURI "/"
PassengerNodejs "/home/username/nodevenv/api/18/bin/node"
PassengerEnabled on
Options -Indexes

<Files .env>
    Order allow,deny
    Deny from all
</Files>
"@

Set-Content -Path (Join-Path $deploymentFolder ".htaccess") -Value $htaccessContent
Write-Host "  OK Created: .htaccess" -ForegroundColor Green

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Deployment files prepared successfully!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files location: $deploymentFolder" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Review files in cpanel-deployment folder" -ForegroundColor White
Write-Host "  2. Update .htaccess with your cPanel username" -ForegroundColor White
Write-Host "  3. Create ZIP of all contents" -ForegroundColor White
Write-Host "  4. Follow CPANEL_DEPLOYMENT_GUIDE.md" -ForegroundColor White
Write-Host ""

Start-Process $deploymentFolder
