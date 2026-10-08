@echo off
setlocal
title CRAQUE v2
cd /d "%~dp0"

echo.
echo  CRAQUE v2
echo  ---------
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  Node.js nao encontrado.
  echo  Instale a versao 22 ou mais nova em https://nodejs.org e rode este arquivo de novo.
  echo.
  pause
  exit /b 1
)

node -e "const [major, minor] = process.versions.node.split('.').map(Number); process.exit(major > 22 || (major === 22 && minor >= 12) ? 0 : 1)"
if errorlevel 1 (
  echo  Seu Node.js e antigo demais para o CRAQUE v2. Instale a versao 22.12 ou mais nova.
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

echo  Conferindo dependencias ^(a primeira vez demora um pouco^)...
call pnpm install
if errorlevel 1 (
  echo.
  echo  Falha ao instalar as dependencias.
  echo.
  pause
  exit /b 1
)

echo.
echo  Abrindo o jogo no navegador, normalmente em http://localhost:5173
echo  Se a aba nao abrir sozinha, use o endereco da linha "Local:" logo abaixo.
echo  (Se a porta 5173 ja estiver em uso, o endereco muda para 5174.)
echo  Para encerrar, feche esta janela.
echo.
call pnpm start

endlocal
