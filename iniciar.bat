@echo off
title Copero - Simulador de Carreira
cd /d "%~dp0"

if not exist node_modules (
    echo.
    echo Instalando dependencias pela primeira vez, aguarde...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo Falha ao instalar dependencias. Verifique se o Node.js esta instalado.
        pause
        exit /b 1
    )
)

echo.
echo Iniciando o servidor em http://localhost:3000 ...
echo (Feche esta janela para encerrar o jogo)
echo.

start "" cmd /k "npm run dev"

timeout /t 6 /nobreak >nul
start "" http://localhost:3000
