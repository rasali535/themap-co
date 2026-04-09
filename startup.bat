@echo off
cd /d "%~dp0"
echo Starting Themap Co Application...
pm2 start ecosystem.config.cjs
pm2 save
echo Application started in PM2.
pause
