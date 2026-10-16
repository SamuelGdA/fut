import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cases = [
  ["ready", "instalacao", 0, false], ["ready", "iniciar", 0, true],
  ["install-fails", "iniciar", 1, false], ["start-fails", "iniciar", 1, true],
  ["no-winget", "instalacao", 1, false], ["new-node", "instalacao", 0, false],
  ["old-node", "instalacao", 0, false], ["winget-fails", "instalacao", 1, false],
  ["node-still-old", "instalacao", 1, false],
];
for (const [scenario, entry, exit, starts] of cases) test(`Windows: ${entry}, ${scenario}`, { skip: process.platform !== "win32" }, () => {
  const directory = mkdtempSync(join(tmpdir(), "futeiros-windows-"));
  try {
    const root = join(directory, "jogo com espacos"), bin = join(directory, "commands");
    mkdirSync(join(root, "v2", "scripts"), { recursive: true }); mkdirSync(bin);
    for (const name of ["iniciar", "instalacao"]) {
      copyFileSync(join(project, "..", `${name}.bat`), join(root, `${name}.bat`));
      copyFileSync(join(project, `${name}.bat`), join(root, "v2", `${name}.bat`));
    }
    copyFileSync(join(project, "scripts", "windows.bat"), join(root, "v2", "scripts", "windows.bat"));
    const marker = join(directory, "node-ready"), log = join(directory, "npm-log");
    const batch = (name, body) => writeFileSync(join(bin, `${name}.cmd`), `@echo off\r\n${body.replaceAll("\n", "\r\n")}\r\n`);
    batch("node", `if "${scenario}"=="node-still-old" exit /b 1\nexit /b 0`);
    copyFileSync(join(bin, "node.cmd"), join(bin, "node-after.cmd"));
    if (["new-node", "winget-fails", "no-winget"].includes(scenario)) unlinkSync(join(bin, "node.cmd"));
    // Para versão antiga, where encontra node mas a checagem da versão falha até a instalação.
    if (scenario === "old-node") batch("node", `if not exist "${marker}" exit /b 1\nexit /b 0`);
    if (scenario !== "no-winget") batch("winget", `echo installed>"${marker}"\ncopy /y "${join(bin, "node-after.cmd")}" "${join(bin, "node.cmd")}" >nul\nexit /b ${scenario === "winget-fails" ? 1 : 0}`);
    batch("npm", `echo %*>>"${log}"\necho %* | find.exe "pnpm install" >nul\nif not errorlevel 1 exit /b ${scenario === "install-fails" ? 1 : 0}\necho %* | find.exe "pnpm start" >nul\nif not errorlevel 1 exit /b ${scenario === "start-fails" ? 1 : 0}\nexit /b 2`);
    // cmd redefine ProgramFiles ao iniciar; o isolamento deve ocorrer dentro dele.
    writeFileSync(join(directory, "run.cmd"), `@echo off\r\nset "ProgramFiles=${join(directory, "Program Files")}"\r\ncall "${join(root, `${entry}.bat`)}" --sem-pausa\r\nexit /b %errorlevel%\r\n`);
    const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", "run.cmd"], {
      cwd: directory, encoding: "utf8", timeout: 20_000,
      env: { ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !["path", "programfiles", "localappdata"].includes(key.toLowerCase()))), PATH: `${bin};${process.env.SystemRoot}\\System32`, ProgramFiles: join(directory, "Program Files"), LocalAppData: directory },
    });
    assert.equal(result.status, exit, `${result.stdout}\n${result.stderr}\n${result.error ?? ""}`);
    let calls = ""; try { calls = readFileSync(log, "utf8"); } catch { /* Falha antes de instalar. */ }
    assert.equal(calls.includes("pnpm start"), starts);
    if (exit === 0 || scenario.endsWith("fails") && scenario !== "winget-fails") assert.match(calls, /--package=pnpm@10\.34\.5 -- pnpm install --frozen-lockfile/);
    if (entry === "instalacao" && exit === 0) assert.match(result.stdout, /execute iniciar.bat/);
    if (scenario === "no-winget" || scenario === "winget-fails" || scenario === "node-still-old") assert.match(result.stdout, /https:\/\/nodejs.org/);
  } finally {
    assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep) && directory.includes("futeiros-windows-"));
    rmSync(directory, { recursive: true, force: true });
  }
});
