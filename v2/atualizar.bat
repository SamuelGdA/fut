@echo off
setlocal
title Futeiros - Atualizacao de testes
pushd "%TEMP%"
rem O bloco inteiro e lido antes de atualizar os proprios atalhos.
(
  where powershell >nul 2>nul
  if errorlevel 1 (
    echo Nao foi possivel encontrar o Windows PowerShell.
    echo Este atualizador de testes precisa do Windows PowerShell 5.1 ou mais novo.
    popd
    if /i not "%~1"=="--sem-pausa" pause
    exit /b 1
  )
  call powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\update.ps1" -Mode Update -Root "%~dp0.."
  if errorlevel 1 (
    echo.
    echo A atualizacao nao foi concluida. Confira a orientacao acima.
    popd
    if /i not "%~1"=="--sem-pausa" pause
    exit /b 1
  )
  popd
  if /i not "%~1"=="--sem-pausa" pause
  exit /b 0
)
