@echo off
title CRAQUE - Simulador de Carreira
cd /d "%~dp0"

where pnpm >nul 2>nul
if errorlevel 1 (
    echo.
    echo Instalando o pnpm, aguarde...
    echo.
    call npm install -g pnpm
    if errorlevel 1 (
        echo.
        echo Falha ao instalar o pnpm. Verifique se o Node.js esta instalado.
        pause
        exit /b 1
    )
)

if not exist node_modules (
    echo.
    echo Instalando dependencias pela primeira vez, aguarde...
    echo.
    call pnpm install
    if errorlevel 1 (
        echo.
        echo Falha ao instalar dependencias.
        pause
        exit /b 1
    )
)

echo.
echo Iniciando o servidor em http://localhost:3000 ...
echo (Feche esta janela para encerrar o jogo)
echo.

start "" cmd /k "pnpm dev"

timeout /t 8 /nobreak >nul
start "" http://localhost:3000/juegos/simulador-carrera
