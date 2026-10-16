#requires -Version 5.1
# Ferramenta temporaria para testes locais. Nao e importada pelo jogo web.
[CmdletBinding()]
param(
  [ValidateSet('Check', 'Update')][string]$Mode = 'Check',
  [string]$Root = (Join-Path $PSScriptRoot '..\..'),
  [switch]$LibraryOnly
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$script:RepoApi = 'https://api.github.com/repos/SamuelGdA/fut'
$script:OwnedItems = @('.claude', '.gitignore', 'AGENTS.md', 'CLAUDE.md', 'README.md', 'package.json', 'iniciar.bat', 'instalacao.bat', 'atualizar.bat', 'v2')

function Get-RepoJson([string]$Url) {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Invoke-RestMethod -Uri $Url -Headers @{ 'User-Agent' = 'Futeiros-Testes'; Accept = 'application/vnd.github+json'; 'Cache-Control' = 'no-cache' } -TimeoutSec 6
}

function Get-LatestRevision {
  $sha = (Get-RepoJson "$script:RepoApi/commits/main").sha
  if ($sha -notmatch '^[a-f0-9]{40}$') { throw 'O GitHub retornou uma versao invalida.' }
  return $sha
}

function Get-ProjectRoot([string]$Path) {
  $resolved = (Resolve-Path -LiteralPath $Path).Path.TrimEnd('\', '/')
  if (-not (Test-Path -LiteralPath (Join-Path $resolved 'v2\package.json'))) {
    throw 'Nao encontrei v2\package.json. Extraia o projeto inteiro antes de atualizar.'
  }
  return $resolved
}

function Get-GitRevision([string]$ProjectRoot) {
  if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot '.git'))) { return $null }
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Esta copia usa Git. Instale Git em https://git-scm.com/download/win ou use uma copia baixada por ZIP.' }
  $head = & git -C $ProjectRoot rev-parse HEAD 2>$null
  if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel ler a versao do repositorio Git.' }
  return "$head".Trim()
}

function Get-BlobHash([string]$Path) {
  $bytes = [IO.File]::ReadAllBytes($Path)
  $prefix = [Text.Encoding]::UTF8.GetBytes("blob $($bytes.Length)`0")
  $sha1 = [Security.Cryptography.SHA1]::Create()
  try { return ([BitConverter]::ToString($sha1.ComputeHash($prefix + $bytes))).Replace('-', '').ToLowerInvariant() }
  finally { $sha1.Dispose() }
}

function Resolve-ChildPath([string]$Parent, [string]$Relative) {
  $base = [IO.Path]::GetFullPath($Parent).TrimEnd('\', '/') + [IO.Path]::DirectorySeparatorChar
  $full = [IO.Path]::GetFullPath((Join-Path $Parent $Relative))
  if (-not $full.StartsWith($base, [StringComparison]::OrdinalIgnoreCase)) { throw 'Um caminho saiu da pasta prevista. Atualizacao cancelada.' }
  return $full
}

function Test-CurrentRevision([string]$ProjectRoot, [string]$Latest) {
  $head = Get-GitRevision $ProjectRoot
  if ($head) { return $head -eq $Latest }
  $stamp = Join-Path $ProjectRoot '.futeiros-teste.json'
  if (Test-Path -LiteralPath $stamp) {
    try { return (Get-Content -Raw -LiteralPath $stamp | ConvertFrom-Json).revision -eq $Latest }
    catch { return $false }
  }
  # O ZIP inicial nao traz .git. Compara os arquivos com a arvore do GitHub,
  # sem exigir Git nem marcar uma copia antiga como se fosse a ultima.
  $tree = Get-RepoJson "$script:RepoApi/git/trees/${Latest}?recursive=1"
  if ($tree.truncated -or -not $tree.tree) { throw 'Nao foi possivel conferir a lista completa de arquivos.' }
  foreach ($entry in $tree.tree) {
    if ($entry.type -ne 'blob') { continue }
    $file = Resolve-ChildPath $ProjectRoot $entry.path
    if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { return $false }
    if ((Get-BlobHash $file) -ne $entry.sha) { return $false }
  }
  Write-Revision $ProjectRoot $Latest
  return $true
}

function Write-Revision([string]$ProjectRoot, [string]$Revision) {
  @{ revision = $Revision } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $ProjectRoot '.futeiros-teste.json') -Encoding UTF8
}

function Test-GameRunning([string]$ProjectRoot) {
  $nodes = Get-CimInstance Win32_Process -Filter "name='node.exe'" -ErrorAction SilentlyContinue
  return @($nodes | Where-Object { $_.CommandLine -and ($_.CommandLine.IndexOf($ProjectRoot, [StringComparison]::OrdinalIgnoreCase) -ge 0) }).Count -gt 0
}

function Get-RepoArchive([string]$Revision, [string]$Destination) {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Invoke-WebRequest -UseBasicParsing -Uri "https://codeload.github.com/SamuelGdA/fut/zip/$Revision" -OutFile $Destination -TimeoutSec 180
}

function Expand-RepoArchive([string]$Zip, [string]$Destination) {
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $archive = [IO.Compression.ZipFile]::OpenRead($Zip)
  try {
    foreach ($entry in $archive.Entries) {
      if ($entry.FullName -match '(^[/\\]|:|(^|[/\\])\.\.([/\\]|$))') { throw 'O ZIP contem um caminho invalido.' }
      if ((($entry.ExternalAttributes -shr 16) -band 61440) -eq 40960) { throw 'O ZIP contem um link simbolico inesperado.' }
      $null = Resolve-ChildPath $Destination $entry.FullName
    }
  } finally { $archive.Dispose() }
  Expand-Archive -LiteralPath $Zip -DestinationPath $Destination
  $folders = @(Get-ChildItem -LiteralPath $Destination -Directory)
  if ($folders.Count -ne 1) { throw 'O ZIP nao tem a estrutura esperada do Futeiros.' }
  $candidate = $folders[0].FullName
  foreach ($required in @('v2\package.json', 'v2\pnpm-lock.yaml', 'v2\pnpm-workspace.yaml', 'v2\instalacao.bat', 'iniciar.bat')) {
    if (-not (Test-Path -LiteralPath (Join-Path $candidate $required) -PathType Leaf)) { throw "O pacote esta incompleto: falta $required." }
  }
  foreach ($item in Get-ChildItem -LiteralPath $candidate -Force) {
    if ($script:OwnedItems -notcontains $item.Name) { throw "O pacote inclui uma pasta ou arquivo inesperado: $($item.Name)." }
  }
  return $candidate
}

function Install-ProjectDependencies([string]$ProjectRoot) {
  $installer = Join-Path $ProjectRoot 'v2\instalacao.bat'
  & $installer --sem-pausa | Out-Host
  if ($LASTEXITCODE -ne 0) { throw 'A instalacao das dependencias falhou. Confira sua conexao.' }
}

function Update-GitProject([string]$ProjectRoot, [string]$Latest) {
  $remote = & git -C $ProjectRoot remote get-url origin 2>$null
  if ("$remote".Trim() -notmatch '^(https://github\.com/|git@github\.com:)SamuelGdA/fut(\.git)?/?$') { throw 'O Git desta pasta aponta para outro repositorio. Nada foi alterado.' }
  $branch = & git -C $ProjectRoot branch --show-current
  if ("$branch".Trim() -ne 'main') { throw 'Esta copia usa outra branch. Atualize pelo Git para preservar seu trabalho.' }
  $dirty = & git -C $ProjectRoot status --porcelain
  if ($dirty) { throw 'Ha arquivos locais modificados. Nada foi sobrescrito. Guarde suas alteracoes antes de atualizar.' }
  & git -C $ProjectRoot fetch --quiet origin main | Out-Host
  if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel baixar a atualizacao pelo Git.' }
  & git -C $ProjectRoot merge --quiet --ff-only $Latest | Out-Host
  if ($LASTEXITCODE -ne 0 -or (Get-GitRevision $ProjectRoot) -ne $Latest) { throw 'O historico local e diferente. Nada foi forcado; atualize pelo Git.' }
  Install-ProjectDependencies $ProjectRoot
}

function Update-ZipProject([string]$ProjectRoot, [string]$Latest) {
  $id = [Guid]::NewGuid().ToString('N')
  $stage = Resolve-ChildPath $ProjectRoot ".futeiros-atualizacao-$id"
  $backup = Resolve-ChildPath $ProjectRoot ('.futeiros-backups\' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + $id.Substring(0, 6))
  $installed = [Collections.Generic.List[string]]::new()
  $saved = [Collections.Generic.List[string]]::new()
  $keepStage = $false
  $dependenciesStarted = $false
  $null = New-Item -ItemType Directory -Path $stage
  try {
    Write-Host 'Baixando a ultima versao do repositorio...'
    $zip = Join-Path $stage 'projeto.zip'
    Get-RepoArchive $Latest $zip
    $candidate = Expand-RepoArchive $zip (Join-Path $stage 'extraido')
    $null = New-Item -ItemType Directory -Path $backup -Force
    # Move somente itens conhecidos deste projeto. Pastas pessoais, .git e
    # os backups nao entram; v2 e trocada inteira, sem sobrar codigo antigo.
    foreach ($name in $script:OwnedItems) {
      $source = Resolve-ChildPath $candidate $name
      if (-not (Test-Path -LiteralPath $source)) { continue }
      $target = Resolve-ChildPath $ProjectRoot $name
      if (Test-Path -LiteralPath $target) {
        Move-Item -LiteralPath $target -Destination (Resolve-ChildPath $backup $name)
        $saved.Add($name)
      }
      Move-Item -LiteralPath $source -Destination $target
      $installed.Add($name)
    }
    # Instala no caminho definitivo: links de dependencias do Windows podem
    # apontar para caminhos absolutos e nao devem ser movidos depois.
    $dependenciesStarted = $true
    Install-ProjectDependencies $ProjectRoot
    Write-Revision $ProjectRoot $Latest
    Write-Host "Copia anterior preservada em: $backup"
  } catch {
    $cause = $_
    try {
      foreach ($name in $installed) { Move-Item -LiteralPath (Resolve-ChildPath $ProjectRoot $name) -Destination (Resolve-ChildPath $stage "novo-$name") }
      foreach ($name in $saved) { Move-Item -LiteralPath (Resolve-ChildPath $backup $name) -Destination (Resolve-ChildPath $ProjectRoot $name) }
    } catch {
      $keepStage = $true
      throw "A restauracao precisa de ajuda. Preserve $stage e $backup. $($_.Exception.Message)"
    }
    # A instalacao pode criar junctions para caminhos absolutos. Depois de
    # restaurar, nao percorremos essa nova arvore com exclusao recursiva.
    if ($dependenciesStarted) {
      $keepStage = $true
      Write-Host "Arquivos da tentativa preservados para diagnostico em: $stage"
    }
    throw "A copia anterior foi mantida/restaurada. $($cause.Exception.Message)"
  } finally {
    # Exclusao recursiva restrita a pasta temporaria criada nesta chamada.
    $checked = Resolve-ChildPath $ProjectRoot ".futeiros-atualizacao-$id"
    if (-not $keepStage -and $checked -eq $stage -and (Test-Path -LiteralPath $checked)) {
      try { Remove-Item -LiteralPath $checked -Recurse -Force }
      catch { Write-Host "A pasta temporaria ficou preservada em: $checked" }
    }
  }
}

function Invoke-TestUpdate([string]$Action, [string]$Path) {
  try {
    $projectRoot = Get-ProjectRoot $Path
    $latest = Get-LatestRevision
    if (Test-CurrentRevision $projectRoot $latest) {
      Write-Host 'Futeiros: esta copia ja esta atualizada.'
      return 0
    }
    if ($Action -eq 'Check') {
      Write-Host ''
      Write-Host 'NOVA ATUALIZACAO DO FUTEIROS DISPONIVEL!'
      Write-Host 'Feche o jogo e execute atualizar.bat para atualizar automaticamente.'
      Write-Host ''
      return 10
    }
    if (Test-GameRunning $projectRoot) { throw 'Feche a janela do iniciar.bat antes de atualizar. O jogo ainda esta aberto.' }
    Set-Location -LiteralPath ([IO.Path]::GetTempPath())
    if (Get-GitRevision $projectRoot) { Update-GitProject $projectRoot $latest }
    else { Update-ZipProject $projectRoot $latest }
    Write-Host ''
    Write-Host 'Atualizacao concluida! Execute iniciar.bat para jogar.'
    return 0
  } catch {
    if ($Action -eq 'Check') {
      Write-Host 'Nao foi possivel verificar atualizacoes agora. O jogo pode iniciar normalmente.'
      return 0
    }
    Write-Host "Nao foi possivel atualizar: $($_.Exception.Message)"
    return 1
  }
}

if (-not $LibraryOnly) { exit (Invoke-TestUpdate $Mode $Root) }
