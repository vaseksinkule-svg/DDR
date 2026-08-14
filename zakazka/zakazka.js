"use strict";
/* ============================================================
   Zakázka — sestavení a řízení celé zakázky

   Tři pohledy na tatáž data:
     Přehled — kde zakázka stojí a co hoří
     Nákup   — co se musí objednat, co dorazilo, co stálo
     Práce   — co se dělá na stavbě a jestli je na to materiál

   Klíčové propojení: úkol si drží seznam položek, které
   potřebuje. Z jejich stavu se odvodí, jestli se na něj dá
   vůbec nastoupit. Tím se nezapomene objednat.
   ============================================================ */

const KLIC = "interall-zakazka";

let Z = nactiStav(KLIC, ukazkovaZakazka());
let pohled = "prehled";
let filtr = { kategorie: "", mistnost: "", stav: "" };
let otevreny = null;              // rozbalený úkol

const uloz = () => ulozStav(KLIC, Z);

/* ============================================================
   DOTAZY NAD DATY
   ============================================================ */
const polozka = id => Z.polozky.find(p => p.id === id);
const ukol = id => Z.ukoly.find(u => u.id === id);
const aktivni = p => p.stav !== "zruseno";
const poradiStavu = s => POSTUP_STAVU.indexOf(s);
const jeObjednano = p => poradiStavu(p.stav) >= poradiStavu("objednano");
const jeNaSklade = p => poradiStavu(p.stav) >= poradiStavu("dodano");
const fakturovano = p => (p.faktury || []).reduce((a, f) => a + Number(f.castka || 0), 0);

function penize() {
  const zive = Z.polozky.filter(aktivni);
  const plan = zive.reduce((a, p) => a + Number(p.cenaPlan || 0), 0);
  const fakt = zive.reduce((a, p) => a + fakturovano(p), 0);
  const sFakturou = zive.filter(p => fakturovano(p) > 0);
  const planFakturovanych = sFakturou.reduce((a, p) => a + Number(p.cenaPlan || 0), 0);
  const fakturovanych = sFakturou.reduce((a, p) => a + fakturovano(p), 0);
  return {
    plan, fakt,
    odchylka: fakturovanych - planFakturovanych,
    planNeobjednanych: zive.filter(p => !jeObjednano(p)).reduce((a, p) => a + Number(p.cenaPlan || 0), 0)
  };
}

/* Postup skupiny položek — průměr toho, jak daleko na cestě jsou. */
function postup(polozky) {
  const zive = polozky.filter(aktivni);
  if (!zive.length) return { podil: 0, objednano: 0, sklad: 0, celkem: 0, plan: 0 };
  const max = POSTUP_STAVU.length - 1;
  return {
    podil: zive.reduce((a, p) => a + poradiStavu(p.stav) / max, 0) / zive.length,
    objednano: zive.filter(jeObjednano).length,
    sklad: zive.filter(jeNaSklade).length,
    celkem: zive.length,
    plan: zive.reduce((a, p) => a + Number(p.cenaPlan || 0), 0)
  };
}

/* Jádro nástroje: dá se na úkol nastoupit, nebo něco chybí? */
function pripravenost(u) {
  const potreba = (u.potrebuje || []).map(polozka).filter(Boolean).filter(aktivni);
  if (!potreba.length) return { tr: "ok", text: "Bez dodávek", chybi: [] };
  const neobjednano = potreba.filter(p => !jeObjednano(p));
  if (neobjednano.length) {
    return { tr: "zle", text: `Chybí objednat — ${neobjednano.length} ${tvar(neobjednano.length, "položka", "položky", "položek")}`, chybi: neobjednano };
  }
  const naCeste = potreba.filter(p => !jeNaSklade(p));
  if (naCeste.length) {
    return { tr: "pozor", text: `Čeká na dodání — ${naCeste.length} ${tvar(naCeste.length, "položka", "položky", "položek")}`, chybi: naCeste };
  }
  return { tr: "ok", text: "Materiál připraven", chybi: [] };
}

function poTerminu(u) { return u.stav !== "hotovo" && u.do && dniDo(u.do) < 0; }

function trvani(u) {
  if (!u.zahajeno || !u.dokonceno) return null;
  const dnu = Math.max(1, Math.round((Date.parse(u.dokonceno) - Date.parse(u.zahajeno)) / 86400000) + 1);
  const planDnu = u.od && u.do ? Math.max(1, Math.round((Date.parse(u.do) - Date.parse(u.od)) / 86400000) + 1) : null;
  return { dnu, planDnu, hodin: u.odpracovanoHodin || null, odhad: u.odhadHodin || null };
}

/* ============================================================
   VYKRESLENÍ
   ============================================================ */
const obsah = document.getElementById("obsah");

function vykresli() {
  document.querySelectorAll("[data-pohled]").forEach(b =>
    b.classList.toggle("tady", b.dataset.pohled === pohled));
  document.getElementById("hlavicka").innerHTML = viewHlavicka();
  obsah.innerHTML = pohled === "prehled" ? viewPrehled()
                  : pohled === "nakup" ? viewNakup()
                  : viewPrace();
  napojPolePohledu();
}

function viewHlavicka() {
  const doPredani = dniDo(Z.predani);
  return `<span class="zak">
      <b>${esc(Z.nazev)}</b>
      <span>${esc(Z.zakaznik)} · ${esc(Z.adresa)}</span>
    </span>
    <span class="grow"></span>
    <span class="termin">
      <span class="spec">Předání</span>
      <b class="fig">${datumCesky(Z.predani)}</b>
      <span class="${doPredani < 0 ? "zbyva pozde" : "zbyva"}">${doPredani < 0
        ? `${Math.abs(doPredani)} ${tvar(Math.abs(doPredani), "den", "dny", "dní")} po termínu`
        : `zbývá ${doPredani} ${tvar(doPredani, "den", "dny", "dní")}`}</span>
    </span>`;
}

/* ---------- PŘEHLED ---------- */
function viewPrehled() {
  const p = penize();
  const zive = Z.polozky.filter(aktivni);

  const naObjednani = zive.filter(x => !jeObjednano(x));
  const zpozdene = zive.filter(x => x.stav === "objednano" && x.terminDodani && dniDo(x.terminDodani) < 0);
  const ukolyPoTerminu = Z.ukoly.filter(poTerminu);
  const blokovane = Z.ukoly.filter(u => u.stav !== "hotovo" && pripravenost(u).tr === "zle");

  const vystrahy = [
    { n: blokovane.length, tr: "zle", kam: "prace",
      t: n => tvar(n, "úkol nemá objednaný materiál", "úkoly nemají objednaný materiál", "úkolů nemá objednaný materiál") },
    { n: ukolyPoTerminu.length, tr: "zle", kam: "prace",
      t: n => tvar(n, "úkol je po termínu", "úkoly jsou po termínu", "úkolů je po termínu") },
    { n: zpozdene.length, tr: "pozor", kam: "nakup",
      t: n => tvar(n, "dodávka je po slíbeném termínu", "dodávky jsou po slíbeném termínu", "dodávek je po slíbeném termínu") },
    { n: naObjednani.length, tr: "pozor", kam: "nakup",
      t: n => tvar(n, "položka zatím není objednaná", "položky zatím nejsou objednané", "položek zatím není objednaných") }
  ].filter(v => v.n > 0);

  const skupina = (nadpis, seznam, klic, cis) => `
    <section class="blok">
      <h2 class="spec">${nadpis}</h2>
      <div class="radky">${cis.map(c => {
        const pol = zive.filter(x => x[klic] === c.id);
        if (!pol.length) return "";
        const s = postup(pol);
        const tr = s.sklad === s.celkem ? "ok" : (s.objednano === s.celkem ? "" : "pozor");
        return `<div class="radek">
          <span class="jm">${esc(c.nazev)}</span>
          <span class="mala">${s.objednano}/${s.celkem} objednáno · ${s.sklad}/${s.celkem} na skladě</span>
          <span class="pruh"><span class="${tr}" style="width:${Math.round(s.podil * 100)}%"></span></span>
          <span class="c fig">${kcKratce(s.plan)}</span>
        </div>`;
      }).join("")}</div>
    </section>`;

  const dalsi = Z.ukoly.filter(u => u.stav !== "hotovo").sort((a, b) => a.poradi - b.poradi).slice(0, 4);

  return `<div class="stranka">
    <div class="cisla">
      ${dlazdice("Rozpočet zakázky", kc(p.plan), zive.length + " " + tvar(zive.length, "položka", "položky", "položek"))}
      ${dlazdice("Vyfakturováno", kc(p.fakt), Math.round(p.plan ? p.fakt / p.plan * 100 : 0) + " % rozpočtu")}
      ${dlazdice("Odchylka od plánu", (p.odchylka >= 0 ? "+" : "−") + kc(Math.abs(p.odchylka)),
                 "na vyfakturovaných položkách", p.odchylka > 0 ? "zle" : "ok")}
      ${dlazdice("Zbývá objednat", kc(p.planNeobjednanych), naObjednani.length + " " + tvar(naObjednani.length, "položka", "položky", "položek"))}
    </div>

    ${vystrahy.length ? `<div class="vystrahy">${vystrahy.map(v => `
      <button class="vystraha ${v.tr}" data-jdi="${v.kam}" type="button">
        <b class="fig">${v.n}</b><span>${esc(v.t(v.n))}</span></button>`).join("")}</div>`
      : `<div class="vklidu"><b>Nic nehoří.</b> Všechno potřebné je objednané a v termínu.</div>`}

    ${skupina("Podle toho, kdo to shání", zive, "kategorie", KATEGORIE)}
    ${skupina("Podle místa v bytě", zive, "mistnost", MISTNOSTI)}

    <section class="blok">
      <h2 class="spec">Co přijde na řadu</h2>
      <div class="dalsi">${dalsi.map(u => {
        const pr = pripravenost(u);
        return `<button class="ukolmini" data-ukol-jdi="${u.id}" type="button">
          <span class="poradi fig">${u.poradi}</span>
          <span class="tx">
            <b>${esc(u.nazev)}</b>
            <span class="mala">${esc(MIST[u.mistnost] ? MIST[u.mistnost].nazev : "")} · ${datumCesky(u.od)} – ${datumCesky(u.do)}</span>
          </span>
          <span class="odznak ${pr.tr === "ok" ? "ok" : pr.tr}"><span class="tecka"></span>${esc(pr.text)}</span>
        </button>`;
      }).join("")}</div>
    </section>
  </div>`;
}

function dlazdice(popisek, hodnota, pod, tr) {
  return `<div class="dlazdice">
    <span class="spec">${esc(popisek)}</span>
    <b class="fig ${tr || ""}">${esc(hodnota)}</b>
    <span class="mala">${esc(pod)}</span>
  </div>`;
}

/* ---------- NÁKUP ---------- */
function viewNakup() {
  let pol = Z.polozky.slice();
  if (filtr.kategorie) pol = pol.filter(p => p.kategorie === filtr.kategorie);
  if (filtr.mistnost) pol = pol.filter(p => p.mistnost === filtr.mistnost);
  if (filtr.stav) pol = pol.filter(p => p.stav === filtr.stav);
  pol.sort((a, b) => poradiStavu(a.stav) - poradiStavu(b.stav) || a.nazev.localeCompare(b.nazev, "cs"));

  const vyber = (id, prazdno, cis, hodnota) => `<select data-filtr="${id}">
    <option value="">${prazdno}</option>
    ${cis.map(c => `<option value="${c.id}"${hodnota === c.id ? " selected" : ""}>${esc(c.nazev)}</option>`).join("")}
  </select>`;

  const radky = pol.map(p => {
    const f = fakturovano(p);
    const rozdil = f > 0 ? f - Number(p.cenaPlan || 0) : 0;
    const zpozdeno = p.stav === "objednano" && p.terminDodani && dniDo(p.terminDodani) < 0;
    return `<tr data-polozka="${p.id}">
      <td class="wrap">
        <b>${esc(p.nazev)}</b>
        <span class="mala">${esc(MIST[p.mistnost] ? MIST[p.mistnost].nazev : "")} · ${esc(KAT[p.kategorie] ? KAT[p.kategorie].nazev : "")}${p.pozn ? " · " + esc(p.pozn) : ""}</span>
      </td>
      <td class="c fig">${cislo(p.mnozstvi)} ${esc(p.jednotka)}</td>
      <td class="c fig">${kcKratce(p.cenaPlan)}</td>
      <td class="c fig">${f ? kcKratce(f) : "<span class='tise'>—</span>"}
        ${rozdil ? `<span class="mala ${rozdil > 0 ? "zle" : "ok"}">${rozdil > 0 ? "+" : "−"}${kcKratce(Math.abs(rozdil))}</span>` : ""}</td>
      <td>${odznakStavu(p)}</td>
      <td class="wrap">${p.dodavatel ? `${esc(p.dodavatel)}<span class="mala">${p.objednavka ? esc(p.objednavka) : ""}${p.terminDodani ? " · " + datumCesky(p.terminDodani) : ""}</span>` : "<span class='tise'>—</span>"}
        ${zpozdeno ? '<span class="odznak zle"><span class="tecka"></span>Po termínu</span>' : ""}</td>
      <td class="akce"><button class="btn maly" data-upravit="${p.id}" type="button">Otevřít</button></td>
    </tr>`;
  }).join("");

  const p = penize();
  return `<div class="stranka siroka">
    <div class="nastroje">
      ${vyber("kategorie", "Všechny kategorie", KATEGORIE, filtr.kategorie)}
      ${vyber("mistnost", "Celý byt i místnosti", MISTNOSTI, filtr.mistnost)}
      ${vyber("stav", "Všechny stavy", STAVY, filtr.stav)}
      ${(filtr.kategorie || filtr.mistnost || filtr.stav) ? '<button class="btn tise" data-filtr-zrus="1" type="button">Zrušit filtry</button>' : ""}
      <span class="grow"></span>
      <button class="btn hlavni" data-nova-polozka="1" type="button">Přidat položku</button>
    </div>

    <div class="tabulka">
      <table>
        <thead><tr>
          <th>Položka</th><th class="c">Množství</th><th class="c">Plán</th><th class="c">Fakturováno</th>
          <th>Stav</th><th>Dodavatel</th><th></th>
        </tr></thead>
        <tbody>${radky || `<tr><td colspan="7"><div class="nic">V tomto filtru nic není.</div></td></tr>`}</tbody>
        <tfoot><tr>
          <td colspan="2">${pol.length} ${tvar(pol.length, "položka", "položky", "položek")}</td>
          <td class="c fig">${kcKratce(pol.filter(aktivni).reduce((a, x) => a + Number(x.cenaPlan || 0), 0))}</td>
          <td class="c fig">${kcKratce(pol.reduce((a, x) => a + fakturovano(x), 0))}</td>
          <td colspan="3"></td>
        </tr></tfoot>
      </table>
    </div>
    <p class="mala pod">Celá zakázka: rozpočet ${kc(p.plan)}, vyfakturováno ${kc(p.fakt)}.</p>
  </div>`;
}

function odznakStavu(p) {
  const s = STAV[p.stav] || STAVY[0];
  return `<span class="odznak ${s.odznak}" title="${esc(s.popis)}"><span class="tecka"></span>${esc(s.nazev)}</span>`;
}

/* ---------- PRÁCE ---------- */
function viewPrace() {
  const ukoly = Z.ukoly.slice().sort((a, b) => a.poradi - b.poradi);
  const hotovo = ukoly.filter(u => u.stav === "hotovo").length;

  return `<div class="stranka">
    <div class="nastroje">
      <span class="mala">Hotovo ${hotovo} z ${ukoly.length} · pořadí určuje, co se řeší dřív</span>
      <span class="grow"></span>
      <button class="btn hlavni" data-novy-ukol="1" type="button">Přidat úkol</button>
    </div>

    <div class="ukoly">${ukoly.map(u => {
      const pr = pripravenost(u);
      const st = STAV_UKOLU[u.stav] || STAVY_UKOLU[0];
      const t = trvani(u);
      const rozbaleno = otevreny === u.id;
      const pozde = poTerminu(u);

      const potreba = (u.potrebuje || []).map(polozka).filter(Boolean);

      return `<article class="ukol ${u.stav}${pozde ? " pozde" : ""}">
        <button class="ukol-h" data-rozbal="${u.id}" type="button" aria-expanded="${rozbaleno}">
          <span class="poradi fig">${u.poradi}</span>
          <span class="tx">
            <b>${esc(u.nazev)}</b>
            <span class="mala">${esc(MIST[u.mistnost] ? MIST[u.mistnost].nazev : "")} · ${datumCesky(u.od)} – ${datumCesky(u.do)}${
              pozde ? ` · <span class="zle">${Math.abs(dniDo(u.do))} ${tvar(Math.abs(dniDo(u.do)), "den", "dny", "dní")} po termínu</span>` : ""}</span>
          </span>
          <span class="odznaky">
            ${u.stav !== "hotovo" ? `<span class="odznak ${pr.tr === "ok" ? "ok" : pr.tr}"><span class="tecka"></span>${esc(pr.text)}</span>` : ""}
            <span class="odznak ${st.odznak}"><span class="tecka"></span>${esc(st.nazev)}</span>
          </span>
          <span class="sipka">${rozbaleno ? "▴" : "▾"}</span>
        </button>

        ${rozbaleno ? `<div class="ukol-t">
          ${u.postup ? `<div class="postup"><span class="spec">Postup</span><p>${esc(u.postup)}</p></div>` : ""}

          <div class="potreba">
            <span class="spec">Co je na to potřeba</span>
            ${potreba.length ? `<ul>${potreba.map(x => `<li>
                <span>${esc(x.nazev)}</span>
                ${odznakStavu(x)}
                ${x.terminDodani && !jeNaSklade(x) ? `<span class="mala">dodání ${datumCesky(x.terminDodani)}</span>` : ""}
              </li>`).join("")}</ul>`
              : `<p class="mala">K tomuto úkolu se neváže žádná dodávka.</p>`}
          </div>

          ${t ? `<div class="mereni">
            <span class="spec">Skutečnost</span>
            <p>Trvalo ${t.dnu} ${tvar(t.dnu, "den", "dny", "dní")}${t.planDnu ? `, plán byl ${t.planDnu}` : ""}.
            ${t.hodin ? `Odpracováno ${cislo(t.hodin)} h${t.odhad ? ` proti odhadu ${cislo(t.odhad)} h` : ""}.` : ""}</p>
          </div>` : ""}

          <div class="ukol-akce">
            ${u.stav === "ceka" ? `<button class="btn hlavni" data-zacit="${u.id}" type="button">Začít</button>` : ""}
            ${u.stav === "probiha" ? `<button class="btn hlavni" data-hotovo="${u.id}" type="button">Hotovo</button>` : ""}
            ${u.stav === "hotovo" ? `<button class="btn" data-vratit="${u.id}" type="button">Vrátit rozpracované</button>` : ""}
            <button class="btn" data-upravit-ukol="${u.id}" type="button">Upravit</button>
          </div>
        </div>` : ""}
      </article>`;
    }).join("")}</div>
  </div>`;
}

/* ============================================================
   DIALOGY
   ============================================================ */
const dlg = document.getElementById("dlg");
const zavri = () => { dlg.close(); dlg.innerHTML = ""; };

function otevriDialog(nadpis, telo, patka) {
  dlg.innerHTML = `<div class="dlg-h">${esc(nadpis)}</div>
    <div class="dlg-t">${telo}</div>
    <div class="dlg-p">${patka}</div>`;
  dlg.showModal();
}

function poleText(k, l, v, typ) {
  return `<label class="pole1"><span class="spec">${esc(l)}</span>
    <input name="${k}" type="${typ || "text"}" value="${esc(v ?? "")}" autocomplete="off" /></label>`;
}
function poleVyber(k, l, cis, v) {
  return `<label class="pole1"><span class="spec">${esc(l)}</span>
    <select name="${k}">${cis.map(c => `<option value="${c.id}"${c.id === v ? " selected" : ""}>${esc(c.nazev)}</option>`).join("")}</select></label>`;
}
const hodnoty = () => {
  const o = {};
  dlg.querySelectorAll("[name]").forEach(e => { o[e.name] = e.value; });
  return o;
};

function dialogPolozka(id) {
  const nova = !id;
  const p = nova
    ? { id: "p" + Date.now().toString(36), nazev: "", mistnost: "cely", kategorie: "ostatni", role: "Vedení stavby",
        mnozstvi: 1, jednotka: "ks", cenaPlan: 0, stav: "navrh", dodavatel: "", objednavka: "", terminDodani: "", faktury: [], pozn: "" }
    : polozka(id);

  const faktury = (p.faktury || []).map((f, i) => `<li>
      <span><b>${esc(f.cislo)}</b>${f.popis ? ` <span class="mala">${esc(f.popis)}</span>` : ""}
        <span class="mala">${datumCesky(f.datum)}</span></span>
      <b class="fig">${kc(f.castka)}</b>
      <button class="btn tise maly" data-smaz-fakturu="${i}" type="button">Odebrat</button>
    </li>`).join("");

  otevriDialog(nova ? "Nová položka" : p.nazev, `
    <div class="mrizka2">
      ${poleText("nazev", "Název položky", p.nazev)}
      ${poleVyber("mistnost", "Místnost", MISTNOSTI, p.mistnost)}
      ${poleVyber("kategorie", "Kategorie", KATEGORIE, p.kategorie)}
      ${poleVyber("stav", "Stav", STAVY, p.stav)}
      ${poleText("mnozstvi", "Množství", p.mnozstvi, "number")}
      ${poleText("jednotka", "Jednotka", p.jednotka)}
      ${poleText("cenaPlan", "Plánovaná cena bez DPH", p.cenaPlan, "number")}
      ${poleText("dodavatel", "Dodavatel", p.dodavatel)}
      ${poleText("objednavka", "Číslo objednávky", p.objednavka)}
      ${poleText("terminDodani", "Slíbený termín dodání", p.terminDodani, "date")}
      ${poleText("pozn", "Poznámka", p.pozn)}
    </div>
    ${nova ? "" : `<div class="faktury">
      <span class="spec">Faktury</span>
      ${faktury ? `<ul>${faktury}</ul>` : `<p class="mala">Zatím žádná faktura. Skutečná cena se počítá z toho, co se sem přidá.</p>`}
      <button class="btn maly" data-nova-faktura="1" type="button">Přidat fakturu</button>
    </div>`}`,
    `${nova ? "" : `<button class="btn tise" data-smaz-polozku="${p.id}" type="button">Smazat položku</button>`}
     <span class="grow"></span>
     <button class="btn" data-zavri="1" type="button">Zrušit</button>
     <button class="btn hlavni" data-uloz-polozku="${p.id}" data-nova="${nova ? 1 : 0}" type="button">Uložit</button>`);

  dlg.dataset.polozka = p.id;
  if (nova) dlg._nova = p;
}

function dialogFaktura(idPolozky) {
  otevriDialog("Přidat fakturu", `
    <div class="mrizka2">
      ${poleText("cislo", "Číslo faktury", "")}
      ${poleText("castka", "Částka bez DPH", "", "number")}
      ${poleText("datum", "Datum vystavení", dnesISO(), "date")}
      ${poleText("popis", "Popis (nepovinné)", "")}
    </div>
    <p class="mala">Soubor faktury se sem zatím nedá nahrát — nástroj běží jen v prohlížeči.
       Zapisuje se číslo a částka, podle nich se počítá skutečná cena zakázky.</p>`,
    `<span class="grow"></span>
     <button class="btn" data-zpet-polozka="${idPolozky}" type="button">Zpět</button>
     <button class="btn hlavni" data-uloz-fakturu="${idPolozky}" type="button">Přidat</button>`);
}

function dialogUkol(id) {
  const novy = !id;
  const u = novy
    ? { id: "u" + Date.now().toString(36), nazev: "", mistnost: "cely",
        poradi: (Z.ukoly.reduce((a, x) => Math.max(a, x.poradi), 0) + 1),
        postup: "", od: dnesISO(), do: dnesISO(), potrebuje: [], stav: "ceka",
        zahajeno: "", dokonceno: "", odhadHodin: 8 }
    : ukol(id);

  const nabidka = Z.polozky.filter(aktivni).map(p => `<label class="zaskrt">
      <input type="checkbox" name="pot_${p.id}" ${(u.potrebuje || []).includes(p.id) ? "checked" : ""} />
      <span>${esc(p.nazev)} <span class="mala">${esc(MIST[p.mistnost] ? MIST[p.mistnost].nazev : "")}</span></span>
    </label>`).join("");

  otevriDialog(novy ? "Nový úkol" : u.nazev, `
    <div class="mrizka2">
      ${poleText("nazev", "Název úkolu", u.nazev)}
      ${poleVyber("mistnost", "Místnost", MISTNOSTI, u.mistnost)}
      ${poleText("poradi", "Pořadí (co dřív)", u.poradi, "number")}
      ${poleText("odhadHodin", "Odhad hodin", u.odhadHodin, "number")}
      ${poleText("od", "Plán od", u.od, "date")}
      ${poleText("do", "Plán do", u.do, "date")}
    </div>
    <label class="pole1"><span class="spec">Postup pro mistra</span>
      <textarea name="postup" rows="4">${esc(u.postup)}</textarea></label>
    <div class="vazby">
      <span class="spec">Co je na to potřeba</span>
      <p class="mala">Zaškrtnuté položky rozhodují, jestli se dá na úkol nastoupit.</p>
      <div class="zaskrty">${nabidka || '<p class="mala">Zatím nejsou žádné položky.</p>'}</div>
    </div>`,
    `${novy ? "" : `<button class="btn tise" data-smaz-ukol="${u.id}" type="button">Smazat úkol</button>`}
     <span class="grow"></span>
     <button class="btn" data-zavri="1" type="button">Zrušit</button>
     <button class="btn hlavni" data-uloz-ukol="${u.id}" data-novy="${novy ? 1 : 0}" type="button">Uložit</button>`);

  if (novy) dlg._novyUkol = u;
}

function dialogHotovo(id) {
  const u = ukol(id);
  otevriDialog("Dokončení úkolu", `
    <p>Úkol <b>${esc(u.nazev)}</b> se uzavře k dnešnímu dni.</p>
    <div class="mrizka2">
      ${poleText("odpracovanoHodin", "Kolik hodin se na tom odpracovalo", u.odhadHodin || "", "number")}
    </div>
    <p class="mala">Odhad byl ${cislo(u.odhadHodin || 0)} h. Skutečné hodiny se sbírají proto,
       aby se příště dal odhad opřít o čísla z minulých zakázek.</p>`,
    `<span class="grow"></span>
     <button class="btn" data-zavri="1" type="button">Zrušit</button>
     <button class="btn hlavni" data-potvrd-hotovo="${id}" type="button">Označit hotovo</button>`);
}

function dialogPredani() {
  const json = JSON.stringify(Z, null, 1);
  otevriDialog("Předat zakázku kolegovi", `
    <p class="mala">Nástroj zatím běží jen v prohlížeči, takže si data nepředává sám.
       Zkopíruj text níže a pošli ho kolegovi — on ho vloží do spodního pole a uvidí
       přesně to co ty.</p>
    <label class="pole1"><span class="spec">Tahle zakázka</span>
      <textarea id="ven" rows="6" readonly>${esc(json)}</textarea></label>
    <label class="pole1"><span class="spec">Načíst zakázku od kolegy</span>
      <textarea id="dovnitr" rows="4" placeholder="Sem vlož text, který ti přišel…"></textarea></label>
    <p class="mala">Načtením se přepíše to, co máš rozdělané teď.</p>`,
    `<span class="grow"></span>
     <button class="btn" data-zavri="1" type="button">Zavřít</button>
     <button class="btn hlavni" data-nacti-zakazku="1" type="button">Načíst</button>`);
  const v = document.getElementById("ven");
  v.focus(); v.select();
}

/* ============================================================
   UDÁLOSTI
   ============================================================ */
function napojPolePohledu() {
  obsah.querySelectorAll("[data-filtr]").forEach(s =>
    s.addEventListener("change", () => { filtr[s.dataset.filtr] = s.value; vykresli(); }));
}

document.addEventListener("click", e => {
  const el = e.target.closest("[data-pohled],[data-jdi],[data-ukol-jdi],[data-rozbal],[data-upravit],[data-nova-polozka],"
    + "[data-nova-faktura],[data-uloz-fakturu],[data-zpet-polozka],[data-smaz-fakturu],[data-uloz-polozku],[data-smaz-polozku],"
    + "[data-novy-ukol],[data-upravit-ukol],[data-uloz-ukol],[data-smaz-ukol],[data-zacit],[data-hotovo],[data-potvrd-hotovo],"
    + "[data-vratit],[data-zavri],[data-filtr-zrus],[data-predani],[data-nacti-zakazku],[data-reset]");
  if (!el) return;
  const d = el.dataset;

  /* --- navigace --- */
  if (d.pohled) { pohled = d.pohled; vykresli(); return; }
  if (d.jdi) { pohled = d.jdi; vykresli(); return; }
  if (d.ukolJdi) { pohled = "prace"; otevreny = d.ukolJdi; vykresli(); return; }
  if (d.rozbal) { otevreny = otevreny === d.rozbal ? null : d.rozbal; vykresli(); return; }
  if (d.filtrZrus) { filtr = { kategorie: "", mistnost: "", stav: "" }; vykresli(); return; }
  if (d.zavri !== undefined) { zavri(); return; }

  /* --- položky --- */
  if (d.novaPolozka) { dialogPolozka(null); return; }
  if (d.upravit) { dialogPolozka(d.upravit); return; }

  if (d.ulozPolozku) {
    const v = hodnoty();
    const nova = d.nova === "1";
    const cil = nova ? dlg._nova : polozka(d.ulozPolozku);
    if (!v.nazev.trim()) { alert("Položka potřebuje název."); return; }
    Object.assign(cil, {
      nazev: v.nazev.trim(), mistnost: v.mistnost, kategorie: v.kategorie, stav: v.stav,
      role: (KAT[v.kategorie] || {}).role || cil.role,
      mnozstvi: Number(v.mnozstvi) || 0, jednotka: v.jednotka || "ks",
      cenaPlan: Number(v.cenaPlan) || 0, dodavatel: v.dodavatel.trim(),
      objednavka: v.objednavka.trim(), terminDodani: v.terminDodani, pozn: v.pozn.trim()
    });
    if (nova) Z.polozky.push(cil);
    uloz(); zavri(); vykresli(); return;
  }

  if (d.smazPolozku) {
    if (!confirm("Opravdu smazat položku? Odebere se i z úkolů, které ji potřebovaly.")) return;
    Z.polozky = Z.polozky.filter(p => p.id !== d.smazPolozku);
    Z.ukoly.forEach(u => { u.potrebuje = (u.potrebuje || []).filter(x => x !== d.smazPolozku); });
    uloz(); zavri(); vykresli(); return;
  }

  /* --- faktury --- */
  if (d.novaFaktura) { dialogFaktura(dlg.dataset.polozka); return; }
  if (d.zpetPolozka) { dialogPolozka(d.zpetPolozka); return; }
  if (d.ulozFakturu) {
    const v = hodnoty();
    if (!v.cislo.trim() || !Number(v.castka)) { alert("Faktura potřebuje číslo a částku."); return; }
    const p = polozka(d.ulozFakturu);
    p.faktury = p.faktury || [];
    p.faktury.push({ cislo: v.cislo.trim(), castka: Number(v.castka), datum: v.datum || dnesISO(), popis: v.popis.trim() });
    uloz(); dialogPolozka(p.id); vykresli(); return;
  }
  if (d.smazFakturu) {
    const p = polozka(dlg.dataset.polozka);
    p.faktury.splice(Number(d.smazFakturu), 1);
    uloz(); dialogPolozka(p.id); vykresli(); return;
  }

  /* --- úkoly --- */
  if (d.novyUkol) { dialogUkol(null); return; }
  if (d.upravitUkol) { dialogUkol(d.upravitUkol); return; }

  if (d.ulozUkol) {
    const v = hodnoty();
    const novy = d.novy === "1";
    const cil = novy ? dlg._novyUkol : ukol(d.ulozUkol);
    if (!v.nazev.trim()) { alert("Úkol potřebuje název."); return; }
    const potrebuje = [];
    dlg.querySelectorAll('[name^="pot_"]').forEach(ch => { if (ch.checked) potrebuje.push(ch.name.slice(4)); });
    Object.assign(cil, {
      nazev: v.nazev.trim(), mistnost: v.mistnost, poradi: Number(v.poradi) || 1,
      odhadHodin: Number(v.odhadHodin) || 0, od: v.od, do: v.do,
      postup: (dlg.querySelector('[name="postup"]').value || "").trim(), potrebuje: potrebuje
    });
    if (novy) Z.ukoly.push(cil);
    uloz(); zavri(); vykresli(); return;
  }

  if (d.smazUkol) {
    if (!confirm("Opravdu smazat úkol?")) return;
    Z.ukoly = Z.ukoly.filter(u => u.id !== d.smazUkol);
    uloz(); zavri(); vykresli(); return;
  }

  if (d.zacit) {
    const u = ukol(d.zacit);
    const pr = pripravenost(u);
    if (pr.tr === "zle" && !confirm(`${pr.text}. Opravdu začít?`)) return;
    u.stav = "probiha"; u.zahajeno = new Date().toISOString().slice(0, 16);
    uloz(); vykresli(); return;
  }
  if (d.hotovo) { dialogHotovo(d.hotovo); return; }
  if (d.potvrdHotovo) {
    const u = ukol(d.potvrdHotovo);
    u.odpracovanoHodin = Number(hodnoty().odpracovanoHodin) || 0;
    u.stav = "hotovo"; u.dokonceno = new Date().toISOString().slice(0, 16);
    if (!u.zahajeno) u.zahajeno = u.od + "T07:00";
    uloz(); zavri(); vykresli(); return;
  }
  if (d.vratit) {
    const u = ukol(d.vratit);
    u.stav = "probiha"; u.dokonceno = "";
    uloz(); vykresli(); return;
  }

  /* --- předání a reset --- */
  if (d.predani) { dialogPredani(); return; }
  if (d.nactiZakazku) {
    const t = document.getElementById("dovnitr").value.trim();
    if (!t) { alert("Vlož text zakázky do spodního pole."); return; }
    try {
      const nova = JSON.parse(t);
      if (!nova.polozky || !nova.ukoly) throw new Error("chybí položky nebo úkoly");
      Z = nova; uloz(); zavri(); vykresli();
    } catch (err) {
      alert("Text se nepodařilo přečíst — nevypadá jako zakázka z tohoto nástroje.");
    }
    return;
  }
  if (d.reset) {
    if (!confirm("Načíst znovu ukázkovou zakázku? Současná data se smažou.")) return;
    Z = ukazkovaZakazka(); uloz(); vykresli(); return;
  }
});

dlg.addEventListener("click", e => { if (e.target === dlg) zavri(); });

/* ============================================================
   START
   ============================================================ */
vykresli();
