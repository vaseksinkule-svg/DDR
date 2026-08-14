"use strict";
/* ============================================================
   STAV
   ============================================================ */
const KLIC = "interall-pruvodce-rekonstrukce";

const vychoziStav = () => ({
  krok: -1,                       // -1 = zadání, KROKY.length = souhrn
  zadani: { klient: "", adresa: "", plocha: 68, dispozice: "3+kk" },
  vyber: {},                      // volbaId -> {stupen, mnozstvi}
  dopl: {},                       // doplnekId -> pocet (0 = nevybráno)
  vynechano: {}                   // krokId -> true
});
let S = nactiStav(KLIC, vychoziStav());
const uloz = () => ulozStav(KLIC, S);

/* ============================================================
   VÝPOČET
   ============================================================ */
/* Kolik jednotek se u volby počítá. */
function mnozstviVolby(volba) {
  const ulozene = S.vyber[volba.id] && S.vyber[volba.id].mnozstvi;
  if (ulozene !== undefined && ulozene !== null) return ulozene;
  const m = volba.mnozstvi;
  if (!m) return 1;
  if (m.zdroj === "plocha") return Math.round(S.zadani.plocha * m.koef);
  if (m.zdroj === "volba") return mnozstviVolby(najdiVolbu(m.volba));
  return m.vychozi;
}
function najdiVolbu(id) {
  for (const k of KROKY) for (const v of k.volby) if (v.id === id) return v;
  return null;
}
function stupenVolby(volba) {
  const s = S.vyber[volba.id];
  if (!s || !s.stupen) return null;
  return volba.stupne.find(x => x.id === s.stupen) || null;
}
function cenaVolby(volba) {
  const st = stupenVolby(volba);
  if (!st) return 0;
  return st.cena * (volba.mnozstvi ? mnozstviVolby(volba) : 1);
}
function cenaDoplnku(d) {
  const p = S.dopl[d.id] || 0;
  return p > 0 ? d.cena * (d.pocitatelny ? p : 1) : 0;
}
function cenaKroku(krok) {
  if (S.vynechano[krok.id]) return 0;
  let c = 0;
  krok.volby.forEach(v => { c += cenaVolby(v); });
  krok.doplnky.forEach(d => { c += cenaDoplnku(d); });
  return c;
}
function cenaPraci() { return KROKY.reduce((a, k) => a + cenaKroku(k), 0); }
function rozpocet() {
  const prace = cenaPraci();
  const projekt = prace * PROJEKT;
  const koord = prace * KOORDINACE;
  const bezDph = prace + projekt + koord;
  const dph = bezDph * DPH;
  return { prace, projekt, koord, bezDph, dph, celkem: bezDph + dph };
}

/* ============================================================
   VYKRESLENÍ
   ============================================================ */
const rail = document.getElementById("rail");
const stage = document.getElementById("stage");

/* Po volbě se překresluje celá etapa. Odrolování i rozdělaný ovládací
   prvek proto musí zůstat tam, kde byly — jinak ťuknutí na dlaždici dole
   odskočí na začátek. Na začátek se roluje jen při přechodu na jinou etapu. */
let poslednKrok = null;

function selektorPrvku(el) {
  if (!el || !el.getAttribute) return null;
  for (const a of ["data-mn", "data-dm", "data-plocha", "data-stupen", "data-dopl", "data-vynech"]) {
    const v = el.getAttribute(a);
    if (v !== null) return `[${a}="${CSS.escape(v)}"]`;
  }
  return null;
}

function vykresli() {
  const scroll = stage.scrollTop;
  const zamereno = selektorPrvku(document.activeElement);
  const stejnaEtapa = S.krok === poslednKrok;

  vykresliRail();
  vykresliKlienta();
  stage.innerHTML = S.krok === -1 ? viewZadani()
                  : S.krok >= KROKY.length ? viewSouhrn()
                  : viewKrok(KROKY[S.krok]);
  napojUdalosti();
  vykresliDole();

  if (stejnaEtapa) {
    /* Fokus se vrací dřív než odrolování — zaostření prvku umí obsahem samo
       posunout a to by nastavenou pozici přebilo. */
    if (zamereno) {
      const znovu = stage.querySelector(zamereno);
      if (znovu) znovu.focus({ preventScroll: true });
    }
    stage.scrollTop = scroll;
  } else {
    stage.scrollTop = 0;
  }
  poslednKrok = S.krok;
}

function vykresliKlienta() {
  const z = S.zadani;
  document.getElementById("klientBox").innerHTML = z.klient
    ? `<b>${esc(z.klient)}</b><span>${esc(z.dispozice)} · ${cislo(z.plocha)} m²${z.adresa ? " · " + esc(z.adresa) : ""}</span>`
    : "";
}

function vykresliRail() {
  const polozky = [{ id: "__z", nazev: "Zadání", i: -1 }]
    .concat(KROKY.map((k, i) => ({ id: k.id, nazev: k.nazev, i: i })))
    .concat([{ id: "__s", nazev: "Souhrn", i: KROKY.length }]);

  rail.innerHTML = '<h2 class="spec">Etapy rekonstrukce</h2>' + polozky.map(p => {
    const krok = p.i >= 0 && p.i < KROKY.length ? KROKY[p.i] : null;
    const pryc = krok && S.vynechano[krok.id];
    const cena = krok ? cenaKroku(krok) : 0;   /* souhrn nemá vlastní cenu — tu nese spodní lišta */
    const tady = p.i === S.krok;
    const hotovo = p.i < S.krok && p.i >= 0;
    const znak = pryc ? "–" : hotovo ? "✓" : (p.i >= 0 && p.i < KROKY.length ? String(p.i + 1) : "·");
    return `<button class="krok${tady ? " tady" : ""}${hotovo ? " hotovo" : ""}${pryc ? " pryc" : ""}" data-krok="${p.i}" type="button">
      <span class="kbod">${znak}</span>
      <span class="kn">${esc(p.nazev)}</span>
      <span class="kc">${krok ? (pryc ? "—" : kcKratce(cena)) : ""}</span>
    </button>`;
  }).join("");
}

/* ---------- zadání ---------- */
function viewZadani() {
  const z = S.zadani;
  return `<div class="list">
    <div class="hlava"><div class="grow">
      <p class="spec">Krok před etapami</p>
      <h1>S kým a o jakém bytě se bavíme</h1>
    </div></div>
    <p class="perex">Plocha bytu se propíše do etap, které se počítají na metry — bourání, rozvody, podlahy a malby. Kdykoli ji lze změnit a ceny se přepočítají.</p>

    <div class="pole">
      <label><span class="spec">Zákazník</span>
        <input type="text" id="z_klient" value="${esc(z.klient)}" placeholder="Jméno a příjmení" autocomplete="off"></label>
      <label><span class="spec">Adresa bytu</span>
        <input type="text" id="z_adresa" value="${esc(z.adresa)}" placeholder="Ulice, město" autocomplete="off"></label>
      <label><span class="spec">Dispozice</span>
        <select id="z_dispozice">${["1+kk", "2+kk", "2+1", "3+kk", "3+1", "4+kk", "4+1", "5+kk"]
          .map(d => `<option${d === z.dispozice ? " selected" : ""}>${d}</option>`).join("")}</select></label>
    </div>

    <div class="volba">
      <div class="vh"><h3>Podlahová plocha</h3></div>
      <div class="mnoz">
        <span class="lbl">Celková plocha bytu</span>
        <span class="krok-mn">
          <button type="button" data-plocha="-5" aria-label="Ubrat pět metrů">−</button>
          <span class="val">${cislo(z.plocha)} m²</span>
          <button type="button" data-plocha="5" aria-label="Přidat pět metrů">+</button>
        </span>
      </div>
    </div>

    <div class="poznamka">
      <b>Ceny v nástroji jsou zatím zástupné.</b> Slouží k tomu, aby bylo vidět, jak se rozpočet chová,
      když zákazník volí mezi stupni. Skutečný ceník se doplní na jedno místo v kódu a struktura zůstane stejná.
    </div>
  </div>`;
}

/* ---------- etapa ---------- */
function viewKrok(krok) {
  const pryc = !!S.vynechano[krok.id];
  const cena = cenaKroku(krok);

  const telo = pryc
    ? `<div class="prazdno"><b>Tuto etapu nerekonstruujeme</b>
         Nic se z ní nepočítá do rozpočtu. Zapnout ji můžete kdykoli zpět.</div>`
    : krok.volby.map(v => viewVolba(v)).join("") + viewDoplnky(krok);

  return `<div class="list">
    <div class="hlava">
      <div class="grow">
        <p class="spec">Etapa ${S.krok + 1} z ${KROKY.length}</p>
        <h1>${esc(krok.nazev)}</h1>
      </div>
      <button class="vynech${pryc ? " on" : ""}" data-vynech="${krok.id}" type="button">
        ${pryc ? "Zařadit zpět do rozpočtu" : "Nerekonstruujeme"}
      </button>
    </div>
    <p class="perex">${esc(krok.perex)}</p>
    ${telo}
    ${pryc ? "" : `<div class="rekap"><div class="rr total">
        <span class="n">${esc(krok.nazev)} celkem</span>
        <span class="c">${kc(cena)}</span></div></div>`}
  </div>`;
}

function viewVolba(v) {
  const vybrany = S.vyber[v.id] && S.vyber[v.id].stupen;
  const dlazdice = v.stupne.map(st => `
    <button class="stupen${vybrany === st.id ? " on" : ""}${st.nic ? " nic" : ""}" data-stupen="${v.id}|${st.id}" type="button">
      <span class="vzorek${jeSvetla(st.barva) ? " svetly" : ""}" style="background-color:${st.barva}"><i>${esc(st.material)}</i></span>
      <span class="telo">
        <span class="nazev">${esc(st.nazev)}</span>
        <span class="popis">${esc(st.popis)}</span>
        <span class="cena">${st.cena === 0 ? "bez nákladu" : kc(st.cena)}${st.cena === 0 ? "" : `<small>/ ${esc(v.jednotka)}</small>`}</span>
      </span>
    </button>`).join("");

  let mnoz = "";
  if (v.mnozstvi && vybrany) {
    const m = v.mnozstvi;
    const q = mnozstviVolby(v);
    const odvozene = m.zdroj === "volba";
    mnoz = `<div class="mnoz">
      <span class="lbl">${esc(m.popisek)}</span>
      ${odvozene
        ? `<span class="krok-mn"><span class="val" style="border-left:0">${cislo(q)} ${esc(v.jednotka)}</span></span>`
        : `<span class="krok-mn">
            <button type="button" data-mn="${v.id}|-1" aria-label="Ubrat">−</button>
            <span class="val">${cislo(q)} ${esc(v.jednotka)}</span>
            <button type="button" data-mn="${v.id}|1" aria-label="Přidat">+</button>
          </span>`}
      <span class="mezisoucet">${kc(cenaVolby(v))}</span>
    </div>`;
  } else if (vybrany) {
    mnoz = `<div class="mnoz"><span class="mezisoucet">${kc(cenaVolby(v))}</span></div>`;
  }

  return `<section class="volba">
    <div class="vh"><h3>${esc(v.nazev)}</h3><span class="grow"></span>
      ${vybrany ? "" : '<span class="spec">Zatím nevybráno</span>'}</div>
    <div class="stupne">${dlazdice}</div>
    ${mnoz}
  </section>`;
}

function viewDoplnky(krok) {
  if (!krok.doplnky.length) return "";
  return `<section class="volba">
    <div class="vh"><h3>Doplňky</h3><span class="grow"></span><span class="spec">Volitelné</span></div>
    <div class="doplnky">${krok.doplnky.map(d => {
      const p = S.dopl[d.id] || 0;
      const on = p > 0;
      return `<button class="dopl${on ? " on" : ""}" data-dopl="${d.id}" type="button">
        <span class="box">✓</span>
        <span class="t"><b>${esc(d.nazev)}</b><span>${esc(d.popis)}${d.pocitatelny && on ? ` · ${cislo(p)} ${esc(d.jednotka)}` : ""}</span></span>
        <span class="c">${kc(on ? cenaDoplnku(d) : d.cena)}${d.pocitatelny ? `<small></small>` : ""}</span>
      </button>`;
    }).join("")}</div>
    ${krok.doplnky.filter(d => d.pocitatelny && (S.dopl[d.id] || 0) > 0).map(d => `
      <div class="mnoz">
        <span class="lbl">${esc(d.nazev)}</span>
        <span class="krok-mn">
          <button type="button" data-dm="${d.id}|-1" aria-label="Ubrat">−</button>
          <span class="val">${cislo(S.dopl[d.id])} ${esc(d.jednotka)}</span>
          <button type="button" data-dm="${d.id}|1" aria-label="Přidat">+</button>
        </span>
        <span class="mezisoucet">${kc(cenaDoplnku(d))}</span>
      </div>`).join("")}
  </section>`;
}

/* ---------- souhrn ---------- */
function viewSouhrn() {
  const r = rozpocet();
  const z = S.zadani;

  const radky = KROKY.map(k => {
    const pryc = !!S.vynechano[k.id];
    const hlava = `<div class="sr etapa${pryc ? " pryc" : ""}">
      <span class="n">${esc(k.nazev)}</span>
      <span class="c">${pryc ? "nerekonstruuje se" : kc(cenaKroku(k))}</span></div>`;
    if (pryc) return hlava;

    const polozky = [];
    k.volby.forEach(v => {
      const st = stupenVolby(v);
      if (!st) { polozky.push(`<div class="sr polozka pryc"><span class="n">${esc(v.nazev)} <em>— nevybráno</em></span><span class="c">—</span></div>`); return; }
      const q = v.mnozstvi ? mnozstviVolby(v) : null;
      polozky.push(`<div class="sr polozka">
        <span class="n">${esc(v.nazev)}: ${esc(st.nazev)}${q !== null ? ` <em>${cislo(q)} ${esc(v.jednotka)} × ${kc(st.cena)}</em>` : ""}</span>
        <span class="c">${kc(cenaVolby(v))}</span></div>`);
    });
    k.doplnky.forEach(d => {
      if (!(S.dopl[d.id] > 0)) return;
      polozky.push(`<div class="sr polozka">
        <span class="n">${esc(d.nazev)}${d.pocitatelny ? ` <em>${cislo(S.dopl[d.id])} ${esc(d.jednotka)}</em>` : ""}</span>
        <span class="c">${kc(cenaDoplnku(d))}</span></div>`);
    });
    return hlava + polozky.join("");
  }).join("");

  return `<div class="list">
    <div class="hlava"><div class="grow">
      <p class="spec">Souhrn schůzky</p>
      <h1>${z.klient ? esc(z.klient) : "Odhad rekonstrukce"}</h1>
    </div>
    <button class="btn noprint" id="btnTisk" type="button">Vytisknout</button></div>
    <p class="perex">${esc(z.dispozice)}, ${cislo(z.plocha)} m²${z.adresa ? ", " + esc(z.adresa) : ""}. Níže je rozpis podle etap tak, jak jsme je spolu prošli.</p>

    <div class="souhrn">${radky}</div>

    <div class="rekap">
      <div class="rr"><span class="n">Stavební práce a dodávky</span><span class="c">${kc(r.prace)}</span></div>
      <div class="rr"><span class="n">Projekt a inženýring <em class="spec">${Math.round(PROJEKT * 100)} %</em></span><span class="c">${kc(r.projekt)}</span></div>
      <div class="rr"><span class="n">Vedení stavby a koordinace <em class="spec">${Math.round(KOORDINACE * 100)} %</em></span><span class="c">${kc(r.koord)}</span></div>
      <div class="rr"><span class="n">Celkem bez DPH</span><span class="c">${kc(r.bezDph)}</span></div>
      <div class="rr"><span class="n">DPH ${Math.round(DPH * 100)} %</span><span class="c">${kc(r.dph)}</span></div>
      <div class="rr total"><span class="n">Odhad celkem s DPH</span><span class="c">${kc(r.celkem)}</span></div>
    </div>

    <div class="poznamka">
      <b>Tohle není cenová nabídka.</b> Jde o orientační odhad z prvního setkání, spočítaný ze zástupných
      jednotkových cen. Závazná nabídka vzniká až po zaměření bytu a upřesnění materiálů —
      výsledná částka se od tohoto odhadu může lišit oběma směry.
    </div>
  </div>`;
}

/* ---------- spodní lišta ---------- */
function vykresliDole() {
  const r = rozpocet();
  const konec = S.krok >= KROKY.length;
  document.getElementById("celkemC").textContent = kc(r.celkem);
  document.getElementById("celkemPopis").textContent = konec ? "Odhad celkem s DPH" : "Průběžně s DPH";
  document.getElementById("btnZpet").disabled = S.krok === -1;
  const dal = document.getElementById("btnDal");
  dal.disabled = konec;
  dal.textContent = S.krok === KROKY.length - 1 ? "Zobrazit souhrn" : "Pokračovat";
}

/* ============================================================
   UDÁLOSTI
   ============================================================ */
function napojUdalosti() {
  const t = document.getElementById("btnTisk");
  if (t) t.addEventListener("click", () => window.print());

  ["klient", "adresa"].forEach(k => {
    const el = document.getElementById("z_" + k);
    if (el) el.addEventListener("input", () => { S.zadani[k] = el.value; uloz(); vykresliKlienta(); });
  });
  const disp = document.getElementById("z_dispozice");
  if (disp) disp.addEventListener("change", () => { S.zadani.dispozice = disp.value; uloz(); vykresliKlienta(); });
}

document.addEventListener("click", e => {
  const el = e.target.closest("[data-krok],[data-stupen],[data-mn],[data-dopl],[data-dm],[data-vynech],[data-plocha]");
  if (!el) return;

  if (el.dataset.krok !== undefined) {
    S.krok = Number(el.dataset.krok);
  }
  else if (el.dataset.plocha) {
    const p = Math.max(15, Math.min(400, S.zadani.plocha + Number(el.dataset.plocha)));
    S.zadani.plocha = p;
    /* Ruční úpravy množství u odvozených položek se zahodí, ať se plocha propíše. */
    KROKY.forEach(k => k.volby.forEach(v => {
      if (v.mnozstvi && v.mnozstvi.zdroj === "plocha" && S.vyber[v.id]) S.vyber[v.id].mnozstvi = null;
    }));
  }
  else if (el.dataset.stupen) {
    const [vid, sid] = el.dataset.stupen.split("|");
    const soucasny = S.vyber[vid] || {};
    S.vyber[vid] = { stupen: soucasny.stupen === sid ? null : sid, mnozstvi: soucasny.mnozstvi ?? null };
  }
  else if (el.dataset.mn) {
    const [vid, smer] = el.dataset.mn.split("|");
    const v = najdiVolbu(vid), m = v.mnozstvi;
    const krok = m.krok || 1;
    const min = m.min !== undefined ? m.min : 0;
    const max = m.max !== undefined ? m.max : 999;
    const nova = Math.max(min, Math.min(max, Math.round((mnozstviVolby(v) + Number(smer) * krok) * 10) / 10));
    S.vyber[vid] = Object.assign({}, S.vyber[vid], { mnozstvi: nova });
  }
  else if (el.dataset.dopl) {
    const d = najdiDoplnek(el.dataset.dopl);
    const p = S.dopl[d.id] || 0;
    S.dopl[d.id] = p > 0 ? 0 : (d.pocitatelny ? (d.vychozi || 1) : 1);
  }
  else if (el.dataset.dm) {
    const [did, smer] = el.dataset.dm.split("|");
    S.dopl[did] = Math.max(1, Math.min(200, (S.dopl[did] || 1) + Number(smer)));
  }
  else if (el.dataset.vynech) {
    const id = el.dataset.vynech;
    if (S.vynechano[id]) delete S.vynechano[id]; else S.vynechano[id] = true;
  }

  uloz();
  vykresli();
});

function najdiDoplnek(id) {
  for (const k of KROKY) for (const d of k.doplnky) if (d.id === id) return d;
  return null;
}

document.getElementById("btnDal").addEventListener("click", () => {
  if (S.krok < KROKY.length) { S.krok++; uloz(); vykresli(); }
});
document.getElementById("btnZpet").addEventListener("click", () => {
  if (S.krok > -1) { S.krok--; uloz(); vykresli(); }
});
document.getElementById("btnReset").addEventListener("click", () => {
  if (!confirm("Začít novou schůzku? Rozpracovaný rozpočet se smaže.")) return;
  S = vychoziStav();
  uloz();
  vykresli();
});

/* ============================================================
   START
   ============================================================ */
vykresli();
