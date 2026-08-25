"use strict";
/* ============================================================
   Kytara — kostra aplikace

   Drží nastavení, přepíná sekce a kreslí to, co potřebuje
   víc sekcí naráz: diagram akordu a hmatník. Vlastní obsah
   sekcí je v souborech sekce-*.js; každá se sem sama
   přihlásí přes registrujSekci().
   ============================================================ */

const KLIC = "kytara.nastaveni";

const Stav = nactiStav(KLIC, {
  sekce: "ladicka",
  znaceni: "cz",
  ladeni: "standardni",
  hlasitost: 0.9,
  motiv: "auto",
  nazvyTonu: true
});

const Sekce = [];
function registrujSekci(s) { Sekce.push(s); }

function uloz() { ulozStav(KLIC, Stav); }

/* ---------- drobné pomůcky ---------- */
function q(s, kde) { return (kde || document).querySelector(s); }
function qa(s, kde) { return Array.from((kde || document).querySelectorAll(s)); }

function prvek(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/* Čeština počítá na tři způsoby: jedna minuta, dvě minuty,
   pět minut. Tvary se předávají v tomto pořadí. */
function mnozne(n, jeden, dva, pet) {
  const a = Math.abs(n);
  if (a === 1) return jeden;
  if (a >= 2 && a <= 4) return dva;
  return pet;
}

/* Klikání se odbavuje na jednom místě — sekce se překreslují
   celé a jednotlivé posluchače by to nepřežily. */
function naKlik(koren, vyber, fn) {
  koren.addEventListener("click", e => {
    const cil = e.target.closest(vyber);
    if (cil && koren.contains(cil)) fn(cil, e);
  });
}

/* ============================================================
   DIAGRAM AKORDU
   Kytara postavená na zem: svisle struny, vodorovně pražce.
   ============================================================ */
function diagramAkordu(tvar, moznosti) {
  const m = moznosti || {};
  const velikost = m.velikost || 1;
  const hmat = tvar.hmat;
  const prsty = tvar.prsty || [0, 0, 0, 0, 0, 0];

  const hmatane = hmat.filter(f => f > 0);
  const nej = hmatane.length ? Math.max(...hmatane) : 0;
  const nejniz = hmatane.length ? Math.min(...hmatane) : 0;
  const poli = 5;
  const zaklad = nej > poli ? nejniz : 1;
  const nulty = zaklad === 1;

  const kx = 18, ky = 26;                       // levý horní roh mřížky
  const dx = 16 * velikost, dy = 21 * velikost; // rozestup strun a pražců
  const sirka = kx * 2 + dx * 5;
  const vyska = ky + dy * poli + (m.tony ? 34 : 14);

  const s = [];
  s.push(`<svg class="diagram" viewBox="0 0 ${sirka} ${vyska}" width="${sirka}" height="${vyska}" role="img" aria-label="${esc(m.popis || "diagram akordu")}">`);

  /* pražce */
  for (let i = 0; i <= poli; i++) {
    const y = ky + i * dy;
    const tluste = i === 0 && nulty;
    s.push(`<line x1="${kx}" y1="${y}" x2="${kx + dx * 5}" y2="${y}" class="${tluste ? "nulty" : "prazec"}" />`);
  }
  /* struny */
  for (let i = 0; i < 6; i++) {
    const x = kx + i * dx;
    s.push(`<line x1="${x}" y1="${ky}" x2="${x}" y2="${ky + dy * poli}" class="strunaC" />`);
  }
  /* číslo pražce, když okno nezačíná u hlavy */
  if (!nulty) {
    s.push(`<text x="${kx - 7}" y="${ky + dy * 0.72}" class="cisloPrazce" text-anchor="end">${zaklad}</text>`);
  }

  /* barré */
  if (tvar.barre && tvar.barre.prazec >= zaklad && tvar.barre.prazec < zaklad + poli) {
    const y = ky + (tvar.barre.prazec - zaklad + 0.5) * dy;
    const x1 = kx + tvar.barre.od * dx, x2 = kx + tvar.barre.do * dx;
    s.push(`<rect x="${x1 - 6}" y="${y - 6}" width="${x2 - x1 + 12}" height="12" rx="6" class="barre" />`);
  }

  /* prsty, prázdné a umlčené struny */
  for (let i = 0; i < 6; i++) {
    const x = kx + i * dx;
    const f = hmat[i];
    if (f < 0) {
      s.push(`<text x="${x}" y="${ky - 7}" class="znacka" text-anchor="middle">×</text>`);
    } else if (f === 0) {
      s.push(`<circle cx="${x}" cy="${ky - 11}" r="4.5" class="prazdna" />`);
    } else if (f >= zaklad && f < zaklad + poli) {
      const y = ky + (f - zaklad + 0.5) * dy;
      const jeBarre = tvar.barre && f === tvar.barre.prazec && i >= tvar.barre.od && i <= tvar.barre.do;
      if (!jeBarre) s.push(`<circle cx="${x}" cy="${y}" r="${6.5 * velikost}" class="puntik" />`);
      if (prsty[i] && (!jeBarre || i === tvar.barre.od)) {
        s.push(`<text x="${x}" y="${y + 3.6}" class="prst" text-anchor="middle">${prsty[i]}</text>`);
      }
    }
  }

  /* názvy znějících tónů pod diagramem */
  if (m.tony) {
    for (let i = 0; i < 6; i++) {
      const x = kx + i * dx;
      const y = ky + dy * poli + 15;
      if (hmat[i] < 0) continue;
      s.push(`<text x="${x}" y="${y}" class="tonPod" text-anchor="middle">${esc(nazevTonu(midiNaTon(struny()[i] + hmat[i])))}</text>`);
    }
  }

  s.push(`</svg>`);
  return s.join("");
}

/* Kartička akordu i s popiskem a možností přehrát. */
function kartaAkordu(akord, tvar, moznosti) {
  const m = moznosti || {};
  const jmeno = akordNaText(akord, toninaSBecky(akord.koren));
  return `<figure class="akordKarta" data-hmat="${tvar.hmat.join(",")}">
    <figcaption>
      <b>${esc(m.nadpis || jmeno)}</b>
      <span class="spec">${esc(tvar.nazev)}</span>
    </figcaption>
    ${diagramAkordu(tvar, { tony: m.tony, popis: jmeno })}
    <button class="btn tise zahrat" type="button" data-hmat="${tvar.hmat.join(",")}">Přehrát</button>
  </figure>`;
}

/* ============================================================
   HMATNÍK
   Krk kytary naležato: nahoře nejtenčí struna, jak se to
   kreslí v tabulaturách.
   ============================================================ */
function diagramHmatniku(moznosti) {
  const m = moznosti || {};
  const prazcu = m.prazcu || 15;
  const znacky = m.znacky || [];      // { struna, prazec, popisek, typ }
  const kx = 52, ky = 22;      // vlevo je místo na názvy strun a prázdné struny
  const dx = m.dx || 42, dy = m.dy || 26;
  const sirka = kx + dx * (prazcu + 0.6);
  const vyska = ky + dy * 5 + 30;
  const s = [];
  s.push(`<svg class="hmatnik" viewBox="0 0 ${sirka} ${vyska}" width="${sirka}" height="${vyska}" role="img" aria-label="hmatník">`);

  /* orientační tečky */
  for (const p of [3, 5, 7, 9, 15, 17, 19, 21]) {
    if (p > prazcu) continue;
    s.push(`<circle cx="${kx + (p - 0.5) * dx}" cy="${ky + dy * 2.5}" r="6" class="tecka" />`);
  }
  for (const p of [12, 24]) {
    if (p > prazcu) continue;
    s.push(`<circle cx="${kx + (p - 0.5) * dx}" cy="${ky + dy * 1.5}" r="6" class="tecka" />`);
    s.push(`<circle cx="${kx + (p - 0.5) * dx}" cy="${ky + dy * 3.5}" r="6" class="tecka" />`);
  }

  /* pražce a jejich čísla */
  for (let p = 0; p <= prazcu; p++) {
    const x = kx + p * dx;
    s.push(`<line x1="${x}" y1="${ky}" x2="${x}" y2="${ky + dy * 5}" class="${p === 0 ? "nulty" : "prazec"}" />`);
    if (p > 0) s.push(`<text x="${x - dx / 2}" y="${ky + dy * 5 + 20}" class="cisloPrazce" text-anchor="middle">${p}</text>`);
  }

  /* struny — nahoře nejtenčí */
  const jmena = ["E", "A", "D", "G", "H", "e"];
  for (let i = 0; i < 6; i++) {
    const y = ky + (5 - i) * dy;
    s.push(`<line x1="${kx}" y1="${y}" x2="${kx + dx * prazcu}" y2="${y}" class="strunaC" style="stroke-width:${0.8 + i * 0.22}" />`);
    s.push(`<text x="14" y="${y + 4}" class="strunaJmeno" text-anchor="middle">${jmena[i]}</text>`);
  }

  /* značky */
  for (const z of znacky) {
    const y = ky + (5 - z.struna) * dy;
    /* Prázdná struna se kreslí před nultý pražec, ne na něj. */
    const x = z.prazec === 0 ? kx - 16 : kx + (z.prazec - 0.5) * dx;
    const r = z.typ === "koren" ? 12 : 10.5;
    s.push(`<g class="znackaG ${z.typ || ""}" data-struna="${z.struna}" data-prazec="${z.prazec}">`);
    s.push(`<circle cx="${x}" cy="${y}" r="${r}" />`);
    if (z.popisek) s.push(`<text x="${x}" y="${y + 3.8}" text-anchor="middle">${esc(z.popisek)}</text>`);
    s.push(`</g>`);
  }

  s.push(`</svg>`);
  return s.join("");
}

/* ============================================================
   ROZVRŽENÍ A PŘEPÍNÁNÍ SEKCÍ
   ============================================================ */
let sekceNyni = null;

function prejdi(id) {
  const nova = Sekce.find(s => s.id === id) || Sekce[0];
  if (sekceNyni && sekceNyni.opust) sekceNyni.opust();
  sekceNyni = nova;
  Stav.sekce = nova.id;
  uloz();

  qa(".railBtn").forEach(b => b.classList.toggle("aktivni", b.dataset.sekce === nova.id));
  /* Na úzkém displeji leží nabídka přes obsah — po výběru zmizí. */
  document.body.classList.remove("railOtevren");
  const stage = q("#stage");
  stage.innerHTML = "";
  stage.scrollTop = 0;
  nova.vykresli(stage);
  document.title = nova.nazev + " — Kytara";
}

function postavRail() {
  const rail = q("#rail");
  rail.innerHTML = `<h2 class="spec">Kytara</h2>` + Sekce.map(s => `
    <button class="railBtn" type="button" data-sekce="${s.id}">
      <span class="railNazev">${esc(s.nazev)}</span>
      <span class="railPopis">${esc(s.popis)}</span>
    </button>`).join("");
  naKlik(rail, ".railBtn", b => prejdi(b.dataset.sekce));
}

function postavNastaveni() {
  const box = q("#nastaveni");
  box.innerHTML = `
    <label>Ladění
      <select id="volbaLadeni">
        ${Object.keys(LADENI).map(k => `<option value="${k}">${esc(LADENI[k].nazev)}</option>`).join("")}
      </select>
    </label>
    <label>Značení
      <select id="volbaZnaceni">
        <option value="cz">České (H, B)</option>
        <option value="int">Mezinárodní (B, Bb)</option>
      </select>
    </label>
    <label>Hlasitost
      <input id="volbaHlasitost" type="range" min="0" max="1" step="0.05" />
    </label>
    <label class="prepinac">
      <input id="volbaTony" type="checkbox" /> Názvy tónů v diagramech
    </label>
    <label>Vzhled
      <select id="volbaMotiv">
        <option value="auto">Podle systému</option>
        <option value="light">Světlý</option>
        <option value="dark">Tmavý</option>
      </select>
    </label>`;

  q("#volbaLadeni").value = Stav.ladeni;
  q("#volbaZnaceni").value = Stav.znaceni;
  q("#volbaHlasitost").value = Stav.hlasitost;
  q("#volbaTony").checked = Stav.nazvyTonu;
  q("#volbaMotiv").value = Stav.motiv;

  q("#volbaLadeni").onchange = e => {
    Stav.ladeni = LADENI_NYNI.klic = e.target.value;
    uloz(); prejdi(Stav.sekce);
  };
  q("#volbaZnaceni").onchange = e => {
    Stav.znaceni = ZNACENI.rezim = e.target.value;
    uloz(); prejdi(Stav.sekce);
  };
  q("#volbaHlasitost").oninput = e => {
    Stav.hlasitost = Number(e.target.value);
    Zvuk.nastavHlasitost(Stav.hlasitost);
    uloz();
  };
  q("#volbaTony").onchange = e => {
    Stav.nazvyTonu = e.target.checked; uloz(); prejdi(Stav.sekce);
  };
  q("#volbaMotiv").onchange = e => {
    Stav.motiv = e.target.value; uloz(); nastavMotiv();
  };
}

function nastavMotiv() {
  if (Stav.motiv === "auto") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", Stav.motiv);
}

/* ---------- start ---------- */
function start() {
  ZNACENI.rezim = Stav.znaceni;
  LADENI_NYNI.klic = LADENI[Stav.ladeni] ? Stav.ladeni : "standardni";
  Zvuk.hlasitost = Stav.hlasitost;
  nastavMotiv();
  postavRail();
  postavNastaveni();

  /* Cokoli s data-hmat se dá kliknutím přehrát — funguje to
     ve všech sekcích stejně. */
  naKlik(document.body, "[data-hmat]", el => {
    const hmat = el.dataset.hmat.split(",").map(Number);
    Zvuk.hmat(hmat, { smer: "dolu" });
  });
  naKlik(document.body, "[data-ton]", el => {
    Zvuk.brnkni(Number(el.dataset.ton));
  });

  /* Na úzkém displeji se nabídka i nastavení vysouvají, aby
     nezabíraly půl obrazovky. */
  const prepinac = q("#btnMenu");
  if (prepinac) prepinac.onclick = () => document.body.classList.toggle("railOtevren");
  const ozubene = q("#btnNastaveni");
  if (ozubene) ozubene.onclick = () => document.body.classList.toggle("nastaveniOtevrena");

  prejdi(Stav.sekce);
}

document.addEventListener("DOMContentLoaded", start);
