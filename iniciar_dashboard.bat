@echo off
cd /d "%~dp0"
echo Iniciando servidor do dashboard Nicholas...
start "" "http://localhost:8080/Nicholas_Dashboard_Sheets.html"
python -m http.server 8080
