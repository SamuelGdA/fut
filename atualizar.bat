@echo off
(
  call "%~dp0v2\atualizar.bat" %*
  if errorlevel 1 exit /b 1
  exit /b 0
)
