@echo off
setlocal
title CRAQUE v2 - carreira no terminal
cd /d "%~dp0"
chcp 65001 >nul

echo.
echo  CRAQUE v2 - uma carreira inteira no terminal
echo  --------------------------------------------
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  Node.js nao encontrado.
  echo  Instale a versao 22 ou mais nova em https://nodejs.org e rode este arquivo de novo.
  echo.
  pause
  exit /b 1
)

where pnpm >nul 2>nul
if errorlevel 1 (
  echo  Ativando o pnpm...
  call corepack enable >nul 2>nul
  where pnpm >nul 2>nul
  if errorlevel 1 (
    echo  Instalando o pnpm pelo npm...
    call npm install -g pnpm@10.34.5
    if errorlevel 1 (
      echo  Nao deu para instalar o pnpm. Verifique a conexao e tente de novo.
      echo.
      pause
      exit /b 1
    )
  )
)

echo  Conferindo dependencias...
call pnpm install --silent
if errorlevel 1 (
  echo.
  echo  Falha ao instalar as dependencias.
  echo.
  pause
  exit /b 1
)

rem Sem argumentos, joga no teclado. Exemplos com argumentos:
rem   carreira.bat --posicao cam --pais ARG --ritmo normal
rem   carreira.bat --auto ambitious --resumo
call pnpm carreira %*

echo.
pause
endlocal
