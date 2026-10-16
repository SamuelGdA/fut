@echo off
setlocal
title Futeiros
cd /d "%~dp0.."
echo.
echo  FUTEIROS - Preparando o jogo
echo  ---------------------------
echo.

if /i "%~1"=="iniciar" call :verificarAtualizacao

call :nodePronto
if not errorlevel 1 goto dependencias
echo  O jogo precisa do Node.js 22.12 ou mais novo.
where winget >nul 2>nul
if errorlevel 1 goto ajudaNode
echo  Instalando o Node.js LTS pelo gerenciador oficial do Windows...
echo  Se o Windows pedir autorizacao para instalar, confirme para continuar.
call winget install --id OpenJS.NodeJS.LTS --exact --source winget --accept-package-agreements --accept-source-agreements
if errorlevel 1 goto ajudaNode
set "PATH=%ProgramFiles%\nodejs;%LocalAppData%\Programs\nodejs;%PATH%"
call :nodePronto
if errorlevel 1 goto ajudaNode

:dependencias
echo  Conferindo as dependencias. A primeira instalacao precisa de internet.
echo  O pnpm 10.34.5 sera usado apenas para este comando, sem instalacao global.
call npm exec --yes --package=pnpm@10.34.5 -- pnpm install --frozen-lockfile
if errorlevel 1 goto erroDependencias
if /i "%~1"=="iniciar" goto iniciar
echo.
echo  Instalacao concluida!
echo  Agora execute iniciar.bat para comecar a jogar.
if /i not "%~2"=="--sem-pausa" pause
exit /b 0

:iniciar
echo.
echo  Abrindo o jogo no navegador, normalmente em http://localhost:5173
echo  Se a aba nao abrir, use o endereco da linha Local logo abaixo.
echo  Se a porta estiver ocupada, sera usada a proxima porta disponivel.
echo  Mantenha esta janela aberta enquanto joga. Feche-a para encerrar.
echo.
call npm exec --yes --package=pnpm@10.34.5 -- pnpm start
if errorlevel 1 goto erroInicio
exit /b 0

:nodePronto
where node >nul 2>nul
if errorlevel 1 exit /b 1
call node -e "const [a,b]=process.versions.node.split('.').map(Number); process.exit(a>22 || (a===22 && b>=12) ? 0 : 1)" >nul 2>nul
if errorlevel 1 exit /b 1
where npm >nul 2>nul
if errorlevel 1 exit /b 1
exit /b 0

:verificarAtualizacao
where powershell >nul 2>nul
if errorlevel 1 (
  echo  Nao foi possivel verificar atualizacoes: Windows PowerShell indisponivel.
  exit /b 0
)
call powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0update.ps1" -Mode Check -Root "%~dp0..\.."
if "%errorlevel%"=="10" title Futeiros - Atualizacao disponivel: execute atualizar.bat
exit /b 0

:ajudaNode
echo.
echo  Nao foi possivel preparar o Node.js automaticamente.
echo  Instale o Node.js LTS em https://nodejs.org e rode instalacao.bat novamente.
echo  Se acabou de instalar, feche esta janela e abra instalacao.bat de novo.
goto falha

:erroDependencias
echo.
echo  Nao foi possivel instalar as dependencias.
echo  Confira a conexao e se extraiu TODOS os arquivos do ZIP antes de executar.
echo  Depois rode instalacao.bat novamente.
goto falha

:erroInicio
echo.
echo  Nao foi possivel iniciar o jogo. Confira o erro acima e rode instalacao.bat.

:falha
if /i not "%~2"=="--sem-pausa" pause
exit /b 1
