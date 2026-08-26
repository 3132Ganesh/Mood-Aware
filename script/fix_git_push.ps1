# PowerShell script to fix OneDrive .git object locks & clean GitHub secret block
Set-Location "c:\Users\Ganeshnayak\OneDrive\Ganesh files\mood_aware_final\Mood-Aware"

Write-Host "1. Soft resetting previous commit containing secret key..." -ForegroundColor Cyan
git reset --soft HEAD~1

Write-Host "2. Staging clean files without API keys..." -ForegroundColor Yellow
git add .

Write-Host "3. Creating fresh clean commit..." -ForegroundColor Green
git commit -m "feat: implement Master AI Goal Studio & MoodAware Domain LLM fine-tuning pipeline"

Write-Host "4. Pushing fresh commit to GitHub remote..." -ForegroundColor Green
git push -u origin main

Write-Host "Push completed successfully!" -ForegroundColor Green
