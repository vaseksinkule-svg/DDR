/* ============================================================
   Sloučení aplikace do jednoho souboru

   Aplikace se vyvíjí rozdělená na soubory, ale sdílet se dá líp
   jedním souborem — pošle se e-mailem, otevře se dvojklikem
   i bez zbytku projektu.

   Použití:
     node nastroje/sestavit.mjs pruvodce
     node nastroje/sestavit.mjs pruvodce  vystup/pruvodce.html

   Vloží dovnitř všechny odkazované <link rel="stylesheet"> a
   <script src>, které vedou na soubory v projektu. Odkazy na web
   nechá být.
   ============================================================ */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const koren = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const aplikace = process.argv[2];

if (!aplikace) {
  console.error("Chybí název aplikace. Například: node nastroje/sestavit.mjs pruvodce");
  process.exit(1);
}

const vstup = join(koren, aplikace, "index.html");
const vystup = process.argv[3]
  ? resolve(process.argv[3])
  : join(koren, "vystup", aplikace + ".html");

let html;
try {
  html = readFileSync(vstup, "utf8");
} catch (e) {
  console.error(`Nenašel jsem ${vstup} — je název aplikace správně?`);
  process.exit(1);
}

const zaklad = dirname(vstup);
let vlozeno = 0;

function nacti(cesta) {
  return readFileSync(resolve(zaklad, cesta), "utf8").trimEnd();
}
const jeMistni = c => !/^(https?:)?\/\//.test(c);

html = html.replace(/[ \t]*<link[^>]*rel=["']stylesheet["'][^>]*>/g, znacka => {
  const c = (znacka.match(/href=["']([^"']+)["']/) || [])[1];
  if (!c || !jeMistni(c)) return znacka;
  vlozeno++;
  return `<style>\n/* ← ${c} */\n${nacti(c)}\n</style>`;
});

html = html.replace(/[ \t]*<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/g, (znacka, c) => {
  if (!jeMistni(c)) return znacka;
  vlozeno++;
  return `<script>\n/* ← ${c} */\n${nacti(c)}\n</script>`;
});

mkdirSync(dirname(vystup), { recursive: true });
writeFileSync(vystup, html, "utf8");

const kb = n => (n / 1024).toFixed(0) + " kB";
console.log(`Sloučeno ${vlozeno} souborů → ${vystup} (${kb(html.length)})`);
