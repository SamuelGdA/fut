import { test } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scenarios = ["check-current", "check-available", "check-offline", "initial-current", "initial-old", "zip-update", "download-fails", "bad-zip", "install-fails", "game-running", "git-update", "git-dirty", "git-diverged", "git-other-remote"];
for (const scenario of scenarios) test(`Atualizador Windows: ${scenario}`, { skip: process.platform !== "win32" }, () => {
  const directory = mkdtempSync(join(tmpdir(), "futeiros-update-"));
  try {
    const script = fileURLToPath(new URL("./update.test.ps1", import.meta.url));
    const powershell = join(process.env.SystemRoot ?? "C:\\Windows", "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
    const result = spawnSync(powershell, ["-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", script, "-Scenario", scenario, "-TestDirectory", directory], { encoding: "utf8", timeout: 40_000 });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}\n${result.error ?? ""}`);
  } finally {
    assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep) && directory.includes("futeiros-update-"));
    rmSync(directory, { recursive: true, force: true });
  }
});

for (const scenario of ["ready", "failure", "no-powershell"]) test(`Atalho atualizar.bat: ${scenario}`, { skip: process.platform !== "win32" }, () => {
  const directory = mkdtempSync(join(tmpdir(), "futeiros-update-"));
  try {
    const root = join(directory, "jogo com espacos"), bin = join(directory, "bin");
    mkdirSync(join(root,"v2","scripts"),{recursive:true}); mkdirSync(bin);
    copyFileSync(fileURLToPath(new URL("../../atualizar.bat",import.meta.url)),join(root,"atualizar.bat"));
    copyFileSync(fileURLToPath(new URL("../atualizar.bat",import.meta.url)),join(root,"v2","atualizar.bat"));
    const log=join(directory,"working-directory.txt");
    if(scenario!=="no-powershell") {
      // Simula a substituicao dos proprios dois atalhos enquanto o bloco roda.
      const body=`@echo off\necho %CD%>"${log}"\necho @echo off>"${join(root,"atualizar.bat")}"\necho exit /b 99>>"${join(root,"atualizar.bat")}"\necho @echo off>"${join(root,"v2","atualizar.bat")}"\necho exit /b 99>>"${join(root,"v2","atualizar.bat")}"\nexit /b ${scenario==="failure"?1:0}\n`;
      writeFileSync(join(bin,"powershell.cmd"),body.replaceAll("\n","\r\n"));
    }
    writeFileSync(join(directory,"run.cmd"),`@echo off\r\ncall "${join(root,"atualizar.bat")}" --sem-pausa\r\nexit /b %errorlevel%\r\n`);
    const result=spawnSync(process.env.ComSpec??"cmd.exe",["/d","/c",join(directory,"run.cmd")],{cwd:join(root,"v2"),encoding:"utf8",timeout:10_000,env:{...Object.fromEntries(Object.entries(process.env).filter(([key])=>key.toLowerCase()!=="path")),PATH:`${bin};${process.env.SystemRoot}\\System32`}});
    assert.equal(result.status,scenario==="ready"?0:1,`${result.stdout}\n${result.stderr}\n${result.error??""}`);
    if(scenario!=="no-powershell") assert.equal(readFileSync(log,"utf8").trim().toLowerCase(),resolve(tmpdir()).toLowerCase());
    else assert.match(result.stdout,/Windows PowerShell/);
  } finally {
    assert.ok(resolve(directory).startsWith(resolve(tmpdir())+sep)&&directory.includes("futeiros-update-"));
    rmSync(directory,{recursive:true,force:true});
  }
});
