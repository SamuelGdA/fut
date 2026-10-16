param([string]$Scenario, [string]$TestDirectory)
$ErrorActionPreference = 'Stop'
try {
  . (Join-Path $PSScriptRoot 'update.ps1') -LibraryOnly
  function Assert($Condition, [string]$Message) { if (-not $Condition) { throw $Message } }
  $project = Join-Path $TestDirectory 'jogo com espacos'
  $null = New-Item -ItemType Directory -Path (Join-Path $project 'v2\scripts') -Force
  [IO.File]::WriteAllText((Join-Path $project 'v2\package.json'), '{"name":"craque-v2"}')
  [IO.File]::WriteAllText((Join-Path $project 'v2\antigo.txt'), 'original')
  [IO.File]::WriteAllText((Join-Path $project 'anotacao-pessoal.txt'), 'preservar')
  $latest = 'a' * 40
  $old = 'b' * 40
  Write-Revision $project $old
  $script:installed = $false
  $script:downloaded = $false
  function Get-LatestRevision { return $latest }
  function Test-GameRunning { return $Scenario -eq 'game-running' }
  function Install-ProjectDependencies {
    $script:installed = $true
    if ($Scenario -eq 'install-fails') { throw 'falha simulada de dependencias' }
  }

  if ($Scenario -like 'initial-*') {
    Remove-Item -LiteralPath (Join-Path $project '.futeiros-teste.json')
    $expected = Get-BlobHash (Join-Path $project 'v2\package.json')
    if ($Scenario -eq 'initial-old') { $expected = 'c' * 40 }
    function Get-RepoJson { return @{ truncated = $false; tree = @(@{ type = 'blob'; path = 'v2/package.json'; sha = $expected }) } }
    $code = Invoke-TestUpdate Check $project
    Assert ($code -eq $(if ($Scenario -eq 'initial-current') { 0 } else { 10 })) 'Comparacao do ZIP inicial incorreta.'
  } elseif ($Scenario -like 'check-*') {
    if ($Scenario -eq 'check-current') { Write-Revision $project $latest }
    if ($Scenario -eq 'check-offline') { function Get-LatestRevision { throw 'sem internet' } }
    $code = Invoke-TestUpdate Check $project
    Assert ($code -eq $(if ($Scenario -eq 'check-available') { 10 } else { 0 })) 'Conferencia nao respeitou atualizacao/offline.'
    Assert (-not $script:installed) 'A conferencia instalou dependencias.'
  } elseif ($Scenario -like 'git-*') {
    $null = New-Item -ItemType Directory -Path (Join-Path $project '.git')
    $script:fakeHead = $old
    function git {
      $global:LASTEXITCODE = 0
      $command = $args -join ' '
      if ($command -match 'rev-parse HEAD') { return $script:fakeHead }
      if ($command -match 'remote get-url') { if ($Scenario -eq 'git-other-remote') { return 'https://github.com/outro/projeto.git' }; return 'https://github.com/SamuelGdA/fut.git' }
      if ($command -match 'branch --show-current') { return 'main' }
      if ($command -match 'status --porcelain') { if ($Scenario -eq 'git-dirty') { return ' M v2/package.json' }; return }
      if ($command -match 'merge --quiet --ff-only') { if ($Scenario -eq 'git-diverged') { $global:LASTEXITCODE = 1 } else { $script:fakeHead = $latest } }
    }
    $code = Invoke-TestUpdate Update $project
    Assert ($code -eq $(if ($Scenario -eq 'git-update') { 0 } else { 1 })) 'Atualizacao Git nao protegeu as alteracoes/historico.'
    Assert ($script:installed -eq ($Scenario -eq 'git-update')) 'Instalador executado na situacao errada.'
  } else {
    $payload = Join-Path $TestDirectory 'pacote\fut-revisao'
    $null = New-Item -ItemType Directory -Path (Join-Path $payload 'v2') -Force
    foreach ($name in @('v2\package.json', 'v2\pnpm-lock.yaml', 'v2\pnpm-workspace.yaml', 'v2\instalacao.bat', 'iniciar.bat')) {
      [IO.File]::WriteAllText((Join-Path $payload $name), 'novo')
    }
    if ($Scenario -eq 'bad-zip') { Remove-Item -LiteralPath (Join-Path $payload 'v2\pnpm-lock.yaml') }
    $fixture = Join-Path $TestDirectory 'fixture.zip'
    Compress-Archive -LiteralPath $payload -DestinationPath $fixture
    function Get-RepoArchive([string]$Revision, [string]$Destination) {
      $script:downloaded = $true
      if ($Scenario -eq 'download-fails') { throw 'falha simulada de download' }
      Copy-Item -LiteralPath $fixture -Destination $Destination
    }
    $code = Invoke-TestUpdate Update $project
    $success = $Scenario -eq 'zip-update'
    Assert ($code -eq $(if ($success) { 0 } else { 1 })) 'Resultado ZIP incorreto.'
    Assert ((Get-Content -Raw -LiteralPath (Join-Path $project 'anotacao-pessoal.txt')) -eq 'preservar') 'Arquivo pessoal foi alterado.'
    if ($success) {
      Assert (-not (Test-Path -LiteralPath (Join-Path $project 'v2\antigo.txt'))) 'Sobrou codigo antigo na v2.'
      Assert ((Get-Content -Raw -LiteralPath (Join-Path $project 'v2\package.json')) -eq 'novo') 'Fonte nova nao instalada.'
      Assert ((Get-ChildItem -LiteralPath (Join-Path $project '.futeiros-backups') -Recurse -Filter antigo.txt).Count -eq 1) 'Copia anterior nao preservada.'
      Assert ($script:installed) 'Dependencias nao conferidas.'
      Assert ((Get-Content -Raw -LiteralPath (Join-Path $project '.futeiros-teste.json') | ConvertFrom-Json).revision -eq $latest) 'Versao nao gravada.'
    } else {
      Assert ((Get-Content -Raw -LiteralPath (Join-Path $project 'v2\antigo.txt')) -eq 'original') 'A copia anterior nao foi restaurada.'
      Assert ((Get-Content -Raw -LiteralPath (Join-Path $project '.futeiros-teste.json') | ConvertFrom-Json).revision -eq $old) 'Uma falha marcou a versao como atualizada.'
    }
    Assert (@(Get-ChildItem -LiteralPath $project -Directory -Filter '.futeiros-atualizacao-*').Count -eq $(if ($Scenario -eq 'install-fails') { 1 } else { 0 })) 'Limpeza ou preservacao de diagnostico incorreta.'
    if ($Scenario -eq 'game-running') { Assert (-not $script:downloaded) 'Baixou com o jogo aberto.' }
  }
  Write-Host "OK: $Scenario"
  exit 0
} catch {
  Write-Host $_.Exception.Message
  Write-Host $_.ScriptStackTrace
  exit 1
}
