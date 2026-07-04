@echo off
setlocal
cd /d "%~dp0"

set "NODE_EXE=node"
where node >nul 2>nul
if errorlevel 1 (
  set "NODE_EXE=C:\Users\PC Startklar\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
)

if not exist "%NODE_EXE%" if "%NODE_EXE%" neq "node" (
  echo Node.js wurde nicht gefunden.
  echo Bitte die App ueber Codex starten oder Node.js installieren.
  pause
  exit /b 1
)

start "" "http://127.0.0.1:5173/"
"%NODE_EXE%" serve-dist.mjs
