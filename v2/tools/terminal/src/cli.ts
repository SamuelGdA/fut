import { readFileSync, writeFileSync } from "node:fs";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline";
import { styleText } from "node:util";
import type { Locale } from "@craque/content";
import { type Career, CareerError, choose, createCareer, parseSave, policyChoice, replay, saveOf } from "@craque/engine";
import { ArgsError, HELP, parseArgs, type TerminalArgs } from "./args";
import { decisionBlock, header, historyLines, type Paint, PLAIN, stepLines, summaryLines, ui } from "./render";

/**
 * pnpm carreira [opções]
 *
 * Uma carreira inteira no terminal, com o motor e os textos de verdade: cada
 * decisão aparece com as opções numeradas, e a escolha simula o período.
 * Com --auto, uma política escolhe sozinha. No fim, o save é refeito por
 * replay e conferido contra a carreira jogada.
 */

const paint: Paint =
  stdout.isTTY && !process.env.NO_COLOR
    ? {
        bold: (text) => styleText("bold", text),
        dim: (text) => styleText("dim", text),
        good: (text) => styleText("green", text),
        bad: (text) => styleText("red", text),
        accent: (text) => styleText("cyan", text),
      }
    : PLAIN;

function print(lines: readonly string[]): void {
  for (const line of lines) console.log(line);
}

function writeSave(path: string, career: Career): void {
  writeFileSync(path, `${JSON.stringify(saveOf(career), null, 2)}\n`, "utf8");
}

function loadCareer(path: string): Career {
  return replay(parseSave(JSON.parse(readFileSync(path, "utf8"))));
}

/** A carreira que o save refaz é a mesma que foi jogada (invariante 5)? */
function replayMatches(career: Career): boolean {
  const again = replay(saveOf(career));
  return JSON.stringify([again.history, again.end]) === JSON.stringify([career.history, career.end]);
}

/** Lê linhas do teclado (ou de um arquivo redirecionado). `null` quando a entrada acaba. */
function lineReader(): { next: (prompt: string) => Promise<string | null>; close: () => void } {
  const reader = createInterface({ input: stdin, crlfDelay: Number.POSITIVE_INFINITY });
  const lines = reader[Symbol.asyncIterator]();
  return {
    next: async (prompt) => {
      stdout.write(prompt);
      const result = await lines.next();
      return result.done ? null : String(result.value);
    },
    close: () => reader.close(),
  };
}

type Answer = number | "quit";

async function askChoice(career: Career, args: TerminalArgs, savePath: string | null, read: ReturnType<typeof lineReader>): Promise<Answer> {
  const locale: Locale = args.locale;
  const max = career.decision?.options.length ?? 0;
  for (;;) {
    const raw = await read.next(ui(locale, "choose", { max }));
    if (raw === null) return "quit";
    const answer = raw.trim().toLowerCase();
    if (answer === "q") return "quit";
    if (answer === "h") {
      print(historyLines(career, locale, paint));
      continue;
    }
    if (answer === "s") {
      if (savePath) {
        writeSave(savePath, career);
        print([paint.good(ui(locale, "saved", { path: savePath }))]);
      } else {
        print([ui(locale, "noSavePath")]);
      }
      continue;
    }
    const number = Number(answer);
    if (Number.isInteger(number) && number >= 1 && number <= max) return number - 1;
    print([paint.bad(ui(locale, "invalid"))]);
  }
}

async function play(args: TerminalArgs): Promise<void> {
  const { locale } = args;
  // Carregou de um arquivo e não disse onde salvar: continua salvando no mesmo.
  const savePath = args.savePath ?? args.loadPath;
  let career = args.loadPath ? loadCareer(args.loadPath) : createCareer(args.setup);
  if (args.loadPath) print([paint.good(ui(locale, "loaded", { count: career.choices.length }))]);
  print([paint.dim(`seed: ${career.setup.seed}`)]);

  const quiet = args.auto !== null && args.summaryOnly;
  const read = args.auto === null ? lineReader() : null;
  try {
    while (career.decision) {
      const decision = career.decision;
      if (!quiet) print(["", ...header(career, locale, paint), ...decisionBlock(career, locale, paint)]);

      let index: number;
      if (args.auto !== null) {
        const choice = policyChoice(career, args.auto);
        index = choice ? decision.options.findIndex((option) => option.id === choice.option) : -1;
        if (index < 0) throw new Error("a política não achou opção");
        if (!quiet) print([paint.dim(`  > ${index + 1}`)]);
      } else {
        if (!read) throw new Error("sem leitor de teclado");
        const answer = await askChoice(career, args, savePath, read);
        if (answer === "quit") {
          if (savePath) {
            writeSave(savePath, career);
            print([paint.good(ui(locale, "saved", { path: savePath }))]);
          }
          print(["", ui(locale, "bye")]);
          return;
        }
        index = answer;
      }

      const option = decision.options[index];
      if (!option) throw new Error(`opção ${index} fora da decisão`);
      const before = career;
      const step = choose(career, { decision: decision.id, option: option.id });
      career = step.career;
      if (!quiet) print(stepLines(before, decision, option, step, locale, paint));
      if (savePath) writeSave(savePath, career);
    }

    print(["", ...summaryLines(career, locale, paint), ""]);
    if (replayMatches(career)) {
      print([paint.good(ui(locale, "replayOk"))]);
    } else {
      print([paint.bad(ui(locale, "replayFail"))]);
      process.exitCode = 2;
    }
  } finally {
    read?.close();
  }
}

async function main(): Promise<void> {
  let args: TerminalArgs;
  try {
    args = parseArgs(process.argv.slice(2), `craque-${Date.now().toString(36)}`);
  } catch (error) {
    if (error instanceof ArgsError) {
      console.error(error.message);
      console.error("Use --ajuda para ver as opções.");
      process.exitCode = 1;
      return;
    }
    throw error;
  }
  if (args.help) {
    console.log(HELP);
    return;
  }
  try {
    await play(args);
  } catch (error) {
    if (error instanceof CareerError) {
      console.error(`Carreira: ${error.message}`);
      process.exitCode = 1;
      return;
    }
    throw error;
  }
}

await main();
