# PowerShell script to fix secret scanning push block and push to Git
Set-Location "c:\Users\Ganeshnayak\OneDrive\Ganesh files\mood_aware_final\Mood-Aware"

Write-Host "1. Staging updated files (secrets removed)..." -ForegroundColor Cyan
git add .

Write-Host "2. Amending last commit to strip hardcoded API keys..." -ForegroundColor Yellow
git commit --amend -m "feat: implement Master AI Goal Studio & MoodAware Domain LLM fine-tuning pipeline"

Write-Host "3. Pushing updated clean commit to remote GitHub repository..." -ForegroundColor Green
git push --force-with-lease

Write-Host "Git push completed successfully!" -ForegroundColor Green
