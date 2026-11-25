import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "Five stars. Great communicator. Says 'it worked on my machine', which is impressive, since I am the machine.";

function fail(message: string): never {
  process.stderr.write(`entry-writer: ${message}\n`);
  process.exit(1);
}

const characters = Array.from(LINE).length;
const bytes = Buffer.byteLength(LINE, "utf8");

if (characters < 1 || characters > 200) {
  fail(`line must be 1..200 characters, got ${characters}`);
}
if (bytes < 1 || bytes > 200) {
  fail(`line must be 1..200 UTF-8 bytes, got ${bytes}`);
}
if (LINE.trim().length === 0) {
  fail("line must not be empty after trim");
}
if (/[\r\n\u2028\u2029]/.test(LINE)) {
  fail("line must not contain a newline");
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outputPath = join(outputDir, "entry.txt");
const payload = `${LINE}\n`;

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, payload, { encoding: "utf8" });

const written = readFileSync(outputPath);
const expected = Buffer.from(payload, "utf8");
if (!written.equals(expected)) {
  fail(
    `read-back mismatch: expected ${expected.length} bytes of "${payload.replace(/\n/g, "\\n")}", got ${written.length} bytes of "${written.toString("utf8").replace(/\n/g, "\\n")}"`,
  );
}
if (written.length !== bytes + 1) {
  fail(`file must be exactly ${bytes + 1} bytes, got ${written.length}`);
}
if (written[written.length - 1] !== 0x0a) {
  fail("file must end with exactly one trailing newline");
}
if (written.length >= 2 && written[written.length - 2] === 0x0a) {
  fail("file must not end with a blank line");
}

process.stdout.write(
  `wrote ${outputPath} (${characters} chars, ${bytes + 1} bytes)\n`,
);
