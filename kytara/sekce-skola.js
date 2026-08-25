"use strict";
/* ============================================================
   Sekce Škola

   Lekce, cvičební plán a slovníček. Co je přečtené, si
   aplikace pamatuje — ne kvůli známkování, ale aby bylo
   po měsíci vidět, kudy jste prošli.
   ============================================================ */

const KLIC_SKOLA = "kytara.skola";

registrujSekci({
  id: "skola",
  nazev: "Škola",
  popis: "Lekce, plán a slovníček",

  lekce: null,
  zalozka: "lekce",

  stav() { return nactiStav(KLIC_SKOLA, { hotovo: {} }); },

  oznac(id, hotovo) {
    const s = this.stav();
    if (hotovo) s.hotovo[id] = new Date().toISOString().slice(0, 10);
    else delete s.hotovo[id];
    ulozStav(KLIC_SKOLA, s);
  },

  vykresli(kam) {
    this.korenEl = kam;
    if (this.lekce) return this.vykresliLekci(kam);

    const hotovo = this.stav().hotovo;
    const urovne = ["Začátek", "Dál", "Tvoření", "Péče"];

    kam.innerHTML = `
      <div class="hlava">
        <p class="spec">Od držení nástroje po vlastní písničku</p>
        <h1>Škola</h1>
        <p class="uvod">Lekce jdou po sobě, ale nemusíte je číst v jednom kuse — každá je na deset
           minut a končí něčím, co si můžete hned zkusit.</p>
      </div>

      <div class="zalozky noprint">
        ${[["lekce", "Lekce"], ["plan", "Cvičební plán"], ["slovnik", "Slovníček"]].map(([id, n]) =>
          `<button class="btn maly${this.zalozka === id ? " aktivni" : ""}" type="button" data-zalozka="${id}">${n}</button>`).join("")}
      </div>

      <div id="skolaObsah"></div>`;

    naKlik(kam, "[data-zalozka]", b => { this.zalozka = b.dataset.zalozka; this.vykresli(kam); });

    const obsah = q("#skolaObsah", kam);
    if (this.zalozka === "plan") return this.vykresliPlan(obsah);
    if (this.zalozka === "slovnik") return this.vykresliSlovnik(obsah);

    const hotovych = Object.keys(hotovo).length;
    obsah.innerHTML = `
      <p class="drobne">Přečteno ${hotovych} z ${LEKCE.length} lekcí.</p>
      ${urovne.map(u => {
        const skupina = LEKCE.filter(l => l.uroven === u);
        if (!skupina.length) return "";
        return `<h2 class="nadpisSekce">${esc(u)}</h2>
          <div class="seznamKaret">
            ${skupina.map(l => `
              <button class="karta klikaci${hotovo[l.id] ? " hotova" : ""}" type="button" data-lekce="${esc(l.id)}">
                <span class="spec">${l.minut} minut${hotovo[l.id] ? " · přečteno" : ""}</span>
                <b>${esc(l.nazev)}</b>
                <span class="drobne">${esc(l.shrnuti)}</span>
              </button>`).join("")}
          </div>`;
      }).join("")}`;

    naKlik(obsah, "[data-lekce]", b => {
      this.lekce = LEKCE.find(l => l.id === b.dataset.lekce);
      this.vykresli(kam);
    });
  },

  vykresliLekci(kam) {
    const l = this.lekce;
    const i = LEKCE.indexOf(l);
    const hotovo = !!this.stav().hotovo[l.id];

    kam.innerHTML = `
      <div class="hlava pisenHlava">
        <button class="btn tise" id="zpetSkola" type="button">← Škola</button>
        <div>
          <p class="spec">${esc(l.uroven)} · ${l.minut} minut</p>
          <h1>${esc(l.nazev)}</h1>
        </div>
      </div>

      <article class="lekce">
        ${l.text.map(kus => this.kusTextu(kus)).join("")}
      </article>

      ${l.zkuste ? `<div class="zkuste">
        <p class="spec">Zkuste si hned</p>
        <p>${esc(l.zkuste)}</p>
        ${l.odkaz ? `<button class="btn hlavni" id="odkazSekce" type="button" data-cil="${esc(l.odkaz.sekce)}">${esc(l.odkaz.popis)}</button>` : ""}
      </div>` : ""}

      <div class="ovladani noprint">
        <button class="btn${hotovo ? " aktivni" : " hlavni"}" id="hotovaLekce" type="button">
          ${hotovo ? "Přečteno ✓" : "Označit jako přečtené"}
        </button>
        <span class="grow"></span>
        ${i > 0 ? `<button class="btn tise" data-skok="${i - 1}" type="button">← ${esc(LEKCE[i - 1].nazev)}</button>` : ""}
        ${i < LEKCE.length - 1 ? `<button class="btn" data-skok="${i + 1}" type="button">${esc(LEKCE[i + 1].nazev)} →</button>` : ""}
      </div>`;

    q("#zpetSkola", kam).onclick = () => { this.lekce = null; this.vykresli(kam); };
    q("#hotovaLekce", kam).onclick = () => { this.oznac(l.id, !this.stav().hotovo[l.id]); this.vykresli(kam); };
    naKlik(kam, "[data-skok]", b => { this.lekce = LEKCE[Number(b.dataset.skok)]; this.vykresli(kam); q("#stage").scrollTop = 0; });
    const odkaz = q("#odkazSekce", kam);
    if (odkaz) odkaz.onclick = () => prejdi(odkaz.dataset.cil);
  },

  kusTextu(kus) {
    if (typeof kus === "string") return `<p>${esc(kus)}</p>`;
    if (kus.nadpis) return `<h2>${esc(kus.nadpis)}</h2>`;
    if (kus.seznam) return `<ul>${kus.seznam.map(p => `<li>${esc(p)}</li>`).join("")}</ul>`;
    if (kus.tip) return `<div class="poznamka">${esc(kus.tip)}</div>`;
    if (kus.hmat) {
      const a = parseAkord(kus.hmat);
      const t = a ? tvaryAkordu(a)[0] : null;
      return t ? `<div class="akordy male">${kartaAkordu(a, t, { nadpis: kus.hmat, tony: Stav.nazvyTonu })}</div>` : "";
    }
    return "";
  },

  vykresliPlan(kam) {
    kam.innerHTML = `
      <p class="uvod">Osm týdnů po dvaceti minutách denně. Není to závod — když některý týden
         nevyjde, zopakujte ho. Ruka se učí opakováním, ne délkou jednoho sezení.</p>
      <div class="planMrizka">
        ${PLAN.map(t => `
          <div class="planKarta">
            <span class="spec">${t.tyden}. týden</span>
            <b>${esc(t.cil)}</b>
            <ul>${t.body.map(b => `<li>${esc(b)}</li>`).join("")}</ul>
          </div>`).join("")}
      </div>
      <div class="poznamka">
        <b>Jak poznat, že je čas dál.</b> Když dané cvičení zvládnete třikrát za sebou bez zaváhání
        v tempu, které jste si nastavili, přidejte deset úderů za minutu. Když to nejde ani po týdnu,
        zpomalte — chyba je skoro vždycky v tom, že se cvičí moc rychle.
      </div>`;
  },

  vykresliSlovnik(kam) {
    kam.innerHTML = `
      <div class="pole">
        <label>Hledat<input id="slovnikHledani" type="text" placeholder="například barré" /></label>
      </div>
      <div class="slovnik" id="slovnikSeznam"></div>`;

    const vypis = (filtr) => {
      const f = (filtr || "").toLowerCase();
      const nalezeno = SLOVNIK.filter(s =>
        !f || s.pojem.toLowerCase().includes(f) || s.vyklad.toLowerCase().includes(f));
      q("#slovnikSeznam", kam).innerHTML = nalezeno.length
        ? nalezeno.map(s => `<div class="pojem"><b>${esc(s.pojem)}</b><span>${esc(s.vyklad)}</span></div>`).join("")
        : `<p class="uvod">Nic takového tu není. Zkuste hledat kratší slovo.</p>`;
    };
    q("#slovnikHledani", kam).oninput = e => vypis(e.target.value);
    vypis("");
  }
});
