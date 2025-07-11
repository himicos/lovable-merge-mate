# Script to remove unused Supabase imports
Write-Host "Removing unused Supabase imports..." -ForegroundColor Yellow

# Files that only import but don't use Supabase
$filesToClean = @(
    "api/src/integrations/messaging/gmail/service.ts",
    "api/src/integrations/ai/voice/api.ts", 
    "api/src/integrations/ai/voice/client.ts",
    "api/src/integrations/ai/claude/api.ts"
)

foreach ($file in $filesToClean) {
    if (Test-Path $file) {
        Write-Host "Cleaning $file" -ForegroundColor Gray
        # Remove Supabase import lines
        (Get-Content $file) | Where-Object { $_ -notmatch "import.*supabase.*client" } | Set-Content $file
    }
}

Write-Host "Supabase imports removed!" -ForegroundColor Green 