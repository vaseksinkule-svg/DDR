"use strict";
/* ============================================================
   Kytara — hudební základ

   Jediné místo, kde se počítá teorie: názvy tónů, rozbor
   a transpozice akordů, hmaty na hmatníku, stupnice a
   akordy patřící do tóniny. Ostatní soubory se ptají odsud
   a samy nic nepočítají.

   České značení: mezi A a H leží B (mezinárodně Bb),
   a české H je mezinárodní B. Přepínač je v nastavení
   aplikace, protože v tabulaturách z internetu se potkáte
   s obojím.
   ============================================================ */

/* ---------- značení tónů ---------- */
const ZNACENI = { rezim: "cz" };          // "cz" = C D E F G A B H, "int" = C D E F G A Bb B

const KRIZKY_CZ  = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "B",  "H"];
const BECKA_CZ   = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "B",  "H"];
const KRIZKY_INT = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const BECKA_INT  = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

/* Tóniny, ve kterých se tradičně píší béčka místo křížků. */
const BECKOVE_TONINY = [10, 3, 8, 1, 5];  // B, Es, As, Des, F

function nazevTonu(i, bcka) {
  i = ((i % 12) + 12) % 12;
  const cz = ZNACENI.rezim === "cz";
  if (bcka) return (cz ? BECKA_CZ : BECKA_INT)[i];
  return (cz ? KRIZKY_CZ : KRIZKY_INT)[i];
}

function tonNaIndex(t) {
  const m = /^([A-Ha-h])(#|b)?/.exec(String(t).trim());
  if (!m) return null;
  const pismeno = m[1].toUpperCase(), posuv = m[2];
  const zaklad = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, H: 11 };
  let i;
  if (pismeno === "B") {
    /* Samotné B je v českém značení Bb. Zapsané „Bb“ míní každý stejně. */
    if (posuv === "b") return 10;
    i = ZNACENI.rezim === "cz" ? 10 : 11;
  } else {
    i = zaklad[pismeno];
  }
  if (i == null) return null;
  if (posuv === "#") i += 1;
  if (posuv === "b") i -= 1;
  return ((i % 12) + 12) % 12;
}

/* ============================================================
   DRUHY AKORDŮ
   Intervaly se počítají v půltónech od základního tónu.
   ============================================================ */
const DRUHY = {
  "":      { popis: "dur — otevřený, jasný",              intervaly: [0, 4, 7] },
  "m":     { popis: "moll — měkký, posmutnělý",           intervaly: [0, 3, 7] },
  "7":     { popis: "septakord — táhne to dál, blues",    intervaly: [0, 4, 7, 10] },
  "maj7":  { popis: "velký septakord — snivý, jemný",     intervaly: [0, 4, 7, 11] },
  "m7":    { popis: "mollový septakord — klidný",         intervaly: [0, 3, 7, 10] },
  "6":     { popis: "sexta — svižný, staré písničky",     intervaly: [0, 4, 7, 9] },
  "m6":    { popis: "mollová sexta — tajemná",            intervaly: [0, 3, 7, 9] },
  "sus2":  { popis: "bez tercie — otevřený, vzdušný",     intervaly: [0, 2, 7] },
  "sus4":  { popis: "bez tercie — napjatý, chce se vrátit", intervaly: [0, 5, 7] },
  "7sus4": { popis: "septakord bez tercie — visí ve vzduchu", intervaly: [0, 5, 7, 10] },
  "add9":  { popis: "s přidanou nónou — zvonivý",         intervaly: [0, 4, 7, 14] },
  "9":     { popis: "nóna — funky, soulový",              intervaly: [0, 4, 7, 10, 14] },
  "dim":   { popis: "zmenšený — neklidný",                intervaly: [0, 3, 6] },
  "dim7":  { popis: "zmenšený septakord — filmové napětí", intervaly: [0, 3, 6, 9] },
  "m7b5":  { popis: "poloviční zmenšený — jazzový",       intervaly: [0, 3, 6, 10] },
  "aug":   { popis: "zvětšený — rozostřený, stoupá",      intervaly: [0, 4, 8] },
  "5":     { popis: "mocný akord — jen základ a kvinta",  intervaly: [0, 7] }
};

/* Zápisů téhož akordu je v písničkách plno. Tady se srovnají. */
const PREPIS_DRUHU = {
  "": "", "dur": "", "maj": "", "M": "",
  "m": "m", "mi": "m", "min": "m", "moll": "m", "-": "m",
  "7": "7", "dom7": "7",
  "maj7": "maj7", "M7": "maj7", "7M": "maj7", "Δ": "maj7", "Δ7": "maj7", "j7": "maj7",
  "m7": "m7", "mi7": "m7", "min7": "m7", "-7": "m7",
  "6": "6", "m6": "m6", "mi6": "m6",
  "sus": "sus4", "sus4": "sus4", "4": "sus4", "sus2": "sus2", "2": "sus2",
  "7sus4": "7sus4", "7sus": "7sus4",
  "add9": "add9", "add2": "add9",
  "9": "9",
  "dim": "dim", "o": "dim", "°": "dim",
  "dim7": "dim7", "o7": "dim7", "°7": "dim7",
  "m7b5": "m7b5", "mi7b5": "m7b5", "ø": "m7b5", "m7-5": "m7b5", "half-dim": "m7b5",
  "aug": "aug", "+": "aug", "#5": "aug", "+5": "aug",
  "5": "5"
};

/* ============================================================
   AKORD
   { koren: 0..11, druh: "m7", bas: 0..11 | null }
   ============================================================ */
function parseAkord(text) {
  if (text == null) return null;
  let s = String(text).trim();
  if (!s) return null;

  let bas = null;
  const lom = s.indexOf("/");
  if (lom > 0) {
    bas = tonNaIndex(s.slice(lom + 1));
    s = s.slice(0, lom);
  }

  const m = /^([A-Ha-h](?:#|b)?)(.*)$/.exec(s);
  if (!m) return null;
  const koren = tonNaIndex(m[1]);
  if (koren == null) return null;

  const druh = PREPIS_DRUHU[m[2].trim()];
  if (druh === undefined) return null;

  return { koren, druh, bas };
}

function akordNaText(a, bcka) {
  if (!a) return "";
  let s = nazevTonu(a.koren, bcka) + a.druh;
  if (a.bas != null && a.bas !== a.koren) s += "/" + nazevTonu(a.bas, bcka);
  return s;
}

function transponujAkord(a, o) {
  if (!a) return null;
  return {
    koren: ((a.koren + o) % 12 + 12) % 12,
    druh: a.druh,
    bas: a.bas == null ? null : ((a.bas + o) % 12 + 12) % 12
  };
}

/* Tóny, ze kterých se akord skládá — pro popis „co v něm zní“. */
function tonyAkordu(a) {
  const d = DRUHY[a.druh] || DRUHY[""];
  return d.intervaly.map(i => (a.koren + i) % 12);
}

/* ============================================================
   HMATNÍK
   Struny jdou v polích vždy od nejnižší (E) po nejvyšší (e),
   tedy tak, jak leží na diagramu shora dolů.
   ============================================================ */
const LADENI = {
  standardni: { nazev: "Standardní (E A D G H e)", struny: [40, 45, 50, 55, 59, 64] },
  pulton:     { nazev: "O půltón níž (Es As Des Ges B es)", struny: [39, 44, 49, 54, 58, 63] },
  drop_d:     { nazev: "Drop D (D A D G H e)", struny: [38, 45, 50, 55, 59, 64] },
  dadgad:     { nazev: "DADGAD (D A D G A d)", struny: [38, 45, 50, 55, 57, 62] },
  otevrene_g: { nazev: "Otevřené G (D G D G H d)", struny: [38, 43, 50, 55, 59, 62] },
  otevrene_d: { nazev: "Otevřené D (D A D F# A d)", struny: [38, 45, 50, 54, 57, 62] }
};

const LADENI_NYNI = { klic: "standardni" };
function struny() { return (LADENI[LADENI_NYNI.klic] || LADENI.standardni).struny; }

/* MIDI číslo → index tónu a oktáva. Komorní a1 = 69 = 440 Hz. */
function midiNaTon(m) { return ((m % 12) + 12) % 12; }
function midiNaHz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
function hzNaMidi(f) { return 69 + 12 * Math.log2(f / 440); }

/* MIDI tón na daném pražci dané struny (0 = nejnižší struna). */
function tonNaPrazci(struna, prazec) { return struny()[struna] + prazec; }

/* ============================================================
   TVARY AKORDŮ

   Většina hmatů se dá odvodit z několika posuvných tvarů:
   E-tvar má základní tón na šesté struně, A-tvar na páté,
   D-tvar na čtvrté. Posunou se o tolik pražců, kolik je
   potřeba — a tím vzniknou všechny tóniny.

   Pole hmatu má šest čísel od šesté struny po první:
   číslo = pražec, 0 = prázdná struna, -1 = struna se nehraje.
   ============================================================ */
const POSUVNE_TVARY = {
  "":      [{ struna: 0, hmat: [0, 2, 2, 1, 0, 0], nazev: "E-tvar" },
            { struna: 1, hmat: [-1, 0, 2, 2, 2, 0], nazev: "A-tvar" },
            { struna: 2, hmat: [-1, -1, 0, 2, 3, 2], nazev: "D-tvar" }],
  "m":     [{ struna: 0, hmat: [0, 2, 2, 0, 0, 0], nazev: "Em-tvar" },
            { struna: 1, hmat: [-1, 0, 2, 2, 1, 0], nazev: "Am-tvar" },
            { struna: 2, hmat: [-1, -1, 0, 2, 3, 1], nazev: "Dm-tvar" }],
  "7":     [{ struna: 0, hmat: [0, 2, 0, 1, 0, 0], nazev: "E7-tvar" },
            { struna: 1, hmat: [-1, 0, 2, 0, 2, 0], nazev: "A7-tvar" },
            { struna: 2, hmat: [-1, -1, 0, 2, 1, 2], nazev: "D7-tvar" }],
  "m7":    [{ struna: 0, hmat: [0, 2, 0, 0, 0, 0], nazev: "Em7-tvar" },
            { struna: 1, hmat: [-1, 0, 2, 0, 1, 0], nazev: "Am7-tvar" },
            { struna: 2, hmat: [-1, -1, 0, 2, 1, 1], nazev: "Dm7-tvar" }],
  "maj7":  [{ struna: 0, hmat: [0, 2, 1, 1, 0, 0], nazev: "Emaj7-tvar" },
            { struna: 1, hmat: [-1, 0, 2, 1, 2, 0], nazev: "Amaj7-tvar" },
            { struna: 2, hmat: [-1, -1, 0, 2, 2, 2], nazev: "Dmaj7-tvar" }],
  "6":     [{ struna: 0, hmat: [0, 2, 2, 1, 2, 0], nazev: "E6-tvar" },
            { struna: 1, hmat: [-1, 0, 2, 2, 2, 2], nazev: "A6-tvar" }],
  "m6":    [{ struna: 0, hmat: [0, 2, 2, 0, 2, 0], nazev: "Em6-tvar" },
            { struna: 1, hmat: [-1, 0, 2, 2, 1, 2], nazev: "Am6-tvar" }],
  "sus2":  [{ struna: 1, hmat: [-1, 0, 2, 2, 0, 0], nazev: "Asus2-tvar" },
            { struna: 2, hmat: [-1, -1, 0, 2, 3, 0], nazev: "Dsus2-tvar" }],
  "sus4":  [{ struna: 0, hmat: [0, 2, 2, 2, 0, 0], nazev: "Esus4-tvar" },
            { struna: 1, hmat: [-1, 0, 2, 2, 3, 0], nazev: "Asus4-tvar" },
            { struna: 2, hmat: [-1, -1, 0, 2, 3, 3], nazev: "Dsus4-tvar" }],
  "7sus4": [{ struna: 0, hmat: [0, 2, 0, 2, 0, 0], nazev: "E7sus4-tvar" },
            { struna: 1, hmat: [-1, 0, 2, 0, 3, 0], nazev: "A7sus4-tvar" }],
  "add9":  [{ struna: 0, hmat: [0, 2, 2, 1, 0, 2], nazev: "Eadd9-tvar" },
            { struna: 1, hmat: [-1, 0, 2, 4, 2, 0], nazev: "Aadd9-tvar" }],
  "9":     [{ struna: 0, hmat: [0, 2, 0, 1, 0, 2], nazev: "E9-tvar" },
            { struna: 1, hmat: [-1, 0, 2, 4, 2, 3], nazev: "A9-tvar" }],
  "dim":   [{ struna: 1, hmat: [-1, 0, 1, 2, 1, -1], nazev: "Adim-tvar" }],
  "dim7":  [{ struna: 2, hmat: [-1, -1, 0, 1, 0, 1], nazev: "Ddim7-tvar" },
            { struna: 1, hmat: [-1, 0, 1, 2, 1, 2], nazev: "Adim7-tvar" }],
  "m7b5":  [{ struna: 1, hmat: [-1, 0, 1, 0, 1, -1], nazev: "Am7b5-tvar" },
            { struna: 2, hmat: [-1, -1, 0, 1, 1, 1], nazev: "Dm7b5-tvar" }],
  "aug":   [{ struna: 1, hmat: [-1, 0, 3, 2, 2, 1], nazev: "Aaug-tvar" },
            { struna: 0, hmat: [0, 3, 2, 1, 1, 0], nazev: "Eaug-tvar" }],
  "5":     [{ struna: 0, hmat: [0, 2, 2, -1, -1, -1], nazev: "E5-tvar" },
            { struna: 1, hmat: [-1, 0, 2, 2, -1, -1], nazev: "A5-tvar" }]
};

/* ============================================================
   OTEVŘENÉ HMATY
   Co jde zahrát s prázdnými strunami, zní na kytaře líp než
   posunutý tvar — a začátečník to zahraje dřív. Proto mají
   tyhle hmaty přednost před vypočítanými.
   ============================================================ */
const OTEVRENE = {
  "C":     [-1, 3, 2, 0, 1, 0],   "C7":    [-1, 3, 2, 3, 1, 0],
  "Cmaj7": [-1, 3, 2, 0, 0, 0],   "Cadd9": [-1, 3, 2, 0, 3, 3],
  "A":     [-1, 0, 2, 2, 2, 0],   "Am":    [-1, 0, 2, 2, 1, 0],
  "A7":    [-1, 0, 2, 0, 2, 0],   "Am7":   [-1, 0, 2, 0, 1, 0],
  "Amaj7": [-1, 0, 2, 1, 2, 0],   "Asus4": [-1, 0, 2, 2, 3, 0],
  "Asus2": [-1, 0, 2, 2, 0, 0],
  "G":     [3, 2, 0, 0, 0, 3],    "G7":    [3, 2, 0, 0, 0, 1],
  "Gmaj7": [3, 2, 0, 0, 0, 2],    "G6":    [3, 2, 0, 0, 0, 0],
  "E":     [0, 2, 2, 1, 0, 0],    "Em":    [0, 2, 2, 0, 0, 0],
  "E7":    [0, 2, 0, 1, 0, 0],    "Em7":   [0, 2, 0, 0, 0, 0],
  "D":     [-1, -1, 0, 2, 3, 2],  "Dm":    [-1, -1, 0, 2, 3, 1],
  "D7":    [-1, -1, 0, 2, 1, 2],  "Dm7":   [-1, -1, 0, 2, 1, 1],
  "Dmaj7": [-1, -1, 0, 2, 2, 2],  "Dsus4": [-1, -1, 0, 2, 3, 3],
  "Dsus2": [-1, -1, 0, 2, 3, 0],
  "F":     [1, 3, 3, 2, 1, 1],    "Fmaj7": [-1, -1, 3, 2, 1, 0],
  "H7":    [-1, 2, 1, 2, 0, 2]
};

/* Náhrady pro začátečníka: co zahrát, než přijde barré na řadu. */
const NAHRADY = {
  "F":  { misto: "Fmaj7", proc: "Fmaj7 zní v písničce skoro stejně a hraje se třemi prsty." },
  "H":  { misto: "H7",    proc: "H7 se hraje bez barré a v lidovkách zastane totéž." },
  "B":  { misto: "F",     proc: "Bez barré to nejde — zkuste kapodastr, nebo si píseň transponujte." },
  "Hm": { misto: "Hm7",   proc: "Hm7 se hraje s menším barré přes čtyři struny." }
};

/* ---------- odvození hmatů ---------- */
function hmatNaTony(hmat) {
  const s = struny();
  const t = [];
  for (let i = 0; i < 6; i++) if (hmat[i] >= 0) t.push(s[i] + hmat[i]);
  return t;
}

function nejnizsiPrazec(hmat) {
  const h = hmat.filter(f => f > 0);
  return h.length ? Math.min(...h) : 0;
}

/* Barré = jeden prst přes celou šířku hmatu.
   Nestačí, že dvě struny leží na stejném pražci — u otevřeného
   D to tak vypadá taky, a přitom se hraje třemi prsty. Skutečné
   barré poznáme podle toho, že nejnižší pražec drží zároveň
   krajní hranou strunu z obou stran a mezi nimi není nic
   prázdného ani umlčeného. */
function najdiBarre(hmat) {
  const p = nejnizsiPrazec(hmat);
  if (!p) return null;

  const hrane = [];
  for (let i = 0; i < 6; i++) if (hmat[i] >= 0) hrane.push(i);
  if (hrane.length < 4) return null;
  const prvni = hrane[0], posledni = hrane[hrane.length - 1];

  const na = [];
  for (let i = 0; i < 6; i++) if (hmat[i] === p) na.push(i);
  if (na.length < 2) return null;
  if (na[0] !== prvni || na[na.length - 1] !== posledni) return null;

  /* Uvnitř nesmí ležet prázdná ani umlčená struna. */
  for (let i = prvni; i <= posledni; i++) if (hmat[i] < p) return null;
  return { prazec: p, od: prvni, do: posledni };
}

/* Sedí hmat do dlaně? Rozpětí přes pět pražců už ne. */
function jeHratelny(hmat) {
  const h = hmat.filter(f => f > 0);
  if (!h.length) return true;
  return Math.max(...h) - Math.min(...h) <= 4 && Math.max(...h) <= 15;
}

/* ---------- prstoklad ----------
   Odhad, kterým prstem co chytit: barré vezme ukazovák,
   zbytek se rozdá odspodu nahoru. Sedí to na drtivou většinu
   běžných hmatů; u exotických je to nápověda, ne dogma. */
function prstoklad(hmat) {
  const barre = najdiBarre(hmat);
  const prsty = [0, 0, 0, 0, 0, 0];
  const zbytek = [];
  for (let i = 0; i < 6; i++) {
    if (hmat[i] <= 0) continue;
    if (barre && hmat[i] === barre.prazec && i >= barre.od && i <= barre.do) { prsty[i] = 1; continue; }
    zbytek.push(i);
  }
  /* Nižší pražec = nižší prst; na stejném pražci se jde od basů. */
  zbytek.sort((a, b) => (hmat[a] - hmat[b]) || (a - b));
  let dalsi = barre ? 2 : 1;
  const podlePrazce = new Map();
  for (const i of zbytek) {
    if (podlePrazce.has(hmat[i]) && !barre) {
      /* Dva tóny na stejném pražci potřebují dva prsty. */
    }
    prsty[i] = Math.min(dalsi, 4);
    dalsi++;
    podlePrazce.set(hmat[i], true);
  }
  return prsty;
}

function tvaryAkordu(akord) {
  const vysledek = [];
  const videno = new Set();

  function pridej(hmat, nazev, typ) {
    const klic = hmat.join(",");
    if (videno.has(klic)) return;
    if (!jeHratelny(hmat)) return;
    videno.add(klic);
    vysledek.push({
      hmat, nazev, typ,
      barre: najdiBarre(hmat),
      tony: hmatNaTony(hmat),
      prsty: prstoklad(hmat)
    });
  }

  /* Otevřený hmat má přednost — ale jen ve standardním ladění. */
  if (LADENI_NYNI.klic === "standardni") {
    const jmeno = nazevTonu(akord.koren) + akord.druh;
    const jmenoB = nazevTonu(akord.koren, true) + akord.druh;
    const o = OTEVRENE[jmeno] || OTEVRENE[jmenoB];
    if (o) pridej(o.slice(), "otevřený hmat", "otevreny");
  }

  const tvary = POSUVNE_TVARY[akord.druh] || [];
  const s = struny();
  for (const t of tvary) {
    const otevrenyTon = midiNaTon(s[t.struna] + t.hmat[t.struna]);
    let posun = ((akord.koren - otevrenyTon) % 12 + 12) % 12;
    for (const p of [posun, posun + 12]) {
      if (p > 12) continue;
      const hmat = t.hmat.map(f => (f < 0 ? -1 : f + p));
      if (Math.max(...hmat) > 15) continue;
      const barre = najdiBarre(hmat);
      pridej(hmat, t.nazev, barre ? "barre" : "posuvny");
    }
  }
  return vysledek;
}

/* ============================================================
   STUPNICE
   ============================================================ */
const STUPNICE = {
  dur:         { nazev: "Dur (jónská)", kroky: [0, 2, 4, 5, 7, 9, 11], popis: "Základní veselá stupnice. Do–re–mi." },
  mol:         { nazev: "Přirozená moll (ejolská)", kroky: [0, 2, 3, 5, 7, 8, 10], popis: "Smutnější sestra dur. Stejné tóny, jiný začátek." },
  pent_dur:    { nazev: "Durová pentatonika", kroky: [0, 2, 4, 7, 9], popis: "Pět tónů, co spolu vždycky ladí. Dobrý první výlet do sól." },
  pent_mol:    { nazev: "Mollová pentatonika", kroky: [0, 3, 5, 7, 10], popis: "Nejpoužívanější stupnice rockových sól." },
  blues:       { nazev: "Bluesová", kroky: [0, 3, 5, 6, 7, 10], popis: "Mollová pentatonika s přidaným „blue“ tónem." },
  dorska:      { nazev: "Dórská", kroky: [0, 2, 3, 5, 7, 9, 10], popis: "Moll se světlejší sextou. Santana, folk." },
  frygicka:    { nazev: "Frygická", kroky: [0, 1, 3, 5, 7, 8, 10], popis: "Španělská barva, temný začátek." },
  lydicka:     { nazev: "Lydická", kroky: [0, 2, 4, 6, 7, 9, 11], popis: "Dur se zvednutou kvartou. Filmové, snové." },
  mixolydicka: { nazev: "Mixolydická", kroky: [0, 2, 4, 5, 7, 9, 10], popis: "Dur se sníženou septimou. Rock, folk, dudácké písně." },
  harmonicka:  { nazev: "Harmonická moll", kroky: [0, 2, 3, 5, 7, 8, 11], popis: "Moll s velkou septimou — východní nádech." }
};

function tonyStupnice(koren, klic) {
  const s = STUPNICE[klic] || STUPNICE.dur;
  return s.kroky.map(k => (koren + k) % 12);
}

/* ============================================================
   AKORDY V TÓNINĚ
   Z jaké stupnice vyrostou, taková je jejich funkce.
   ============================================================ */
const STUPNE_DUR = [
  { cislo: "I",   druh: "",    funkce: "tónika — domov" },
  { cislo: "ii",  druh: "m",   funkce: "subdominanta — vede k pětce" },
  { cislo: "iii", druh: "m",   funkce: "mezistupeň — zamyšlený" },
  { cislo: "IV",  druh: "",    funkce: "subdominanta — nadechnutí" },
  { cislo: "V",   druh: "",    funkce: "dominanta — chce domů" },
  { cislo: "vi",  druh: "m",   funkce: "paralelní moll — stín tóniky" },
  { cislo: "vii°", druh: "dim", funkce: "napětí, používá se zřídka" }
];

const STUPNE_MOL = [
  { cislo: "i",   druh: "m",   funkce: "tónika — domov" },
  { cislo: "ii°", druh: "dim", funkce: "napětí, používá se zřídka" },
  { cislo: "III", druh: "",    funkce: "paralelní dur — prosvětlení" },
  { cislo: "iv",  druh: "m",   funkce: "subdominanta" },
  { cislo: "v",   druh: "m",   funkce: "dominanta (v písničkách často jako dur nebo sedmička)" },
  { cislo: "VI",  druh: "",    funkce: "měkké odbočení" },
  { cislo: "VII", druh: "",    funkce: "vede zpátky k tónice" }
];

function akordyToniny(koren, mol) {
  const kroky = mol ? STUPNICE.mol.kroky : STUPNICE.dur.kroky;
  const stupne = mol ? STUPNE_MOL : STUPNE_DUR;
  return stupne.map((s, i) => ({
    cislo: s.cislo,
    funkce: s.funkce,
    akord: { koren: (koren + kroky[i]) % 12, druh: s.druh, bas: null }
  }));
}

/* Kvintový kruh — pořadí tónin po kvintách od C. */
const KVINTOVY_KRUH = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];

/* Používají se v téhle tónině béčka? */
function toninaSBecky(koren) { return BECKOVE_TONINY.indexOf(koren) >= 0; }

/* ============================================================
   KAPODASTR
   Kapodastr posune všechno nahoru. Hmat zůstane, zní to výš.
   Chceme-li znějící akord X s kapodastrem na pražci n,
   hmatáme akord o n půltónů níž.
   ============================================================ */
function hmatanyAkord(znejici, kapodastr) { return transponujAkord(znejici, -kapodastr); }

/* Kolik prázdných strun ušetří kapodastr — čím víc otevřených
   hmatů vyjde, tím se píseň hraje snáz. */
function ohodnotKapodastr(akordy, kapodastr) {
  let snadnych = 0;
  for (const a of akordy) {
    const h = hmatanyAkord(a, kapodastr);
    const jmeno = nazevTonu(h.koren) + h.druh;
    const jmenoB = nazevTonu(h.koren, true) + h.druh;
    if (OTEVRENE[jmeno] || OTEVRENE[jmenoB]) snadnych++;
  }
  return snadnych;
}

function doporucKapodastr(akordy) {
  const navrhy = [];
  for (let k = 0; k <= 7; k++) {
    navrhy.push({ prazec: k, snadnych: ohodnotKapodastr(akordy, k), celkem: akordy.length });
  }
  navrhy.sort((a, b) => (b.snadnych - a.snadnych) || (a.prazec - b.prazec));
  return navrhy;
}
