"use strict";
/* ============================================================
   Sekce Skládání

   Postavit píseň odzadu: vybrat tóninu, poskládat z jejích
   akordů postup, pustit si ho dokola a psát k němu text.
   Hotové se dá poslat do Zpěvníku a hrát jako každou jinou
   písničku.
   ============================================================ */

const KLIC_SKLADBY = "kytara.skladby";

registrujSekci({
  id: "skladani",
  nazev: "Skládání",
  popis: "Tónina, postup akordů a vlastní text",

  skladba: null,
  castNyni: 0,
  _hraje: false,

  novaSkladba() {
    return {
      id: "sk-" + Date.now().toString(36),
      nazev: "Bez názvu",
      koren: 0, mol: false,
      tempo: 90, rytmus: "nej",
      casti: [{ nazev: "Sloka", akordy: [] }],
      text: ""
    };
  },

  ulozene() { return nactiStav(KLIC_SKLADBY, { seznam: [] }).seznam; },
  ulozSkladby(seznam) { ulozStav(KLIC_SKLADBY, { seznam }); },

  vykresli(kam) {
    this.korenEl = kam;
    if (!this.skladba) this.skladba = this.ulozene()[0] || this.novaSkladba();
    const s = this.skladba;
    const bcka = toninaSBecky(s.koren);
    const stupne = akordyToniny(s.koren, s.mol);

    kam.innerHTML = `
      <div class="hlava">
        <p class="spec">Vlastní písnička</p>
        <h1>Skládání</h1>
        <p class="uvod">Vyberte tóninu — z ní vyjde sedm akordů, které k sobě patří. Klepnutím je
           skládáte za sebe, tlačítkem Přehrát si postup pustíte dokola a mezitím k němu zpíváte.</p>
      </div>

      <div class="panel radaVoleb">
        <label>Název<input id="sNazev" type="text" value="${esc(s.nazev)}" /></label>
        <label>Tónika
          <select id="sKoren">${Array.from({ length: 12 }, (_, i) =>
            `<option value="${i}"${i === s.koren ? " selected" : ""}>${esc(nazevTonu(i))}</option>`).join("")}</select>
        </label>
        <label>Pohlaví tóniny
          <select id="sMol">
            <option value="dur"${!s.mol ? " selected" : ""}>dur (veselejší)</option>
            <option value="mol"${s.mol ? " selected" : ""}>moll (temnější)</option>
          </select>
        </label>
        <label>Tempo<input id="sTempo" type="number" min="40" max="200" value="${s.tempo}" /></label>
        <label>Rytmus
          <select id="sRytmus">${RYTMY.map(r =>
            `<option value="${r.id}"${r.id === s.rytmus ? " selected" : ""}>${esc(r.nazev)}</option>`).join("")}</select>
        </label>
      </div>

      <div class="dvaSloupce">
        <div>
          <h2 class="nadpisSekce">Akordy tóniny</h2>
          <div class="stupneRada" id="stupneRada">
            ${stupne.map((st, i) => `
              <button class="stupenKarta pridat" type="button" data-stupen="${i}">
                <span class="spec">${esc(st.cislo)}</span>
                <b>${esc(akordNaText(st.akord, bcka))}</b>
                <span class="drobne">${esc(st.funkce)}</span>
              </button>`).join("")}
          </div>
          <p class="drobne">Mimo tóninu se dá jít taky — akord napište rukou do pole níž.
             Nejčastěji se půjčuje durová verze pátého stupně nebo septakord.</p>
          <div class="radaVoleb">
            <input id="sRucne" type="text" placeholder="vlastní akord, např. E7" />
            <button class="btn" id="sPridejRucne" type="button">Přidat</button>
          </div>
        </div>
        <div>
          <h2 class="nadpisSekce">Kvintový kruh</h2>
          ${this.kruh(s)}
          <p class="drobne">Sousedi v kruhu k sobě sedí. Uvnitř leží mollové tóniny, které mají
             s tou vnější stejné tóny — proto se dvojice jako C dur a A moll pořád potkávají.</p>
        </div>
      </div>

      <h2 class="nadpisSekce">Postup</h2>
      <div class="panel">
        <div class="castiRada" id="castiRada">
          ${s.casti.map((c, i) => `<button class="btn maly${i === this.castNyni ? " aktivni" : ""}" type="button" data-cast="${i}">${esc(c.nazev)}</button>`).join("")}
          <button class="btn tise" id="sPridejCast" type="button">+ díl</button>
        </div>
        <div class="takty" id="takty"></div>
        <div class="ovladani">
          <button class="btn hlavni" id="sHrat" type="button">Přehrát dokola</button>
          <button class="btn" id="sSmazPostup" type="button">Vymazat díl</button>
          <button class="btn tise" id="sPrejmenuj" type="button">Přejmenovat díl</button>
          <span class="grow"></span>
          <span class="drobne" id="sNapoveda"></span>
        </div>
      </div>

      <h2 class="nadpisSekce">Hotové postupy</h2>
      <div class="seznamKaret uzke">
        ${POSTUPY.filter(p => p.mol === s.mol).map(p => `
          <button class="karta klikaci" type="button" data-postup="${esc(p.id)}">
            <span class="spec">${p.stupne.length} akordů</span>
            <b>${esc(p.nazev)}</b>
            <span class="drobne">${esc(p.popis)}</span>
          </button>`).join("")}
      </div>

      <h2 class="nadpisSekce">Text</h2>
      <div class="panel">
        <textarea id="sText" rows="10" placeholder="Sem si pište, co k tomu zpíváte. Počítejte slabiky — druhý verš ať má stejně jako první.">${esc(s.text)}</textarea>
        <div class="radaTlacitek">
          <button class="btn hlavni" id="sUloz" type="button">Uložit skladbu</button>
          <button class="btn" id="sDoZpevniku" type="button">Poslat do zpěvníku</button>
          <button class="btn tise" id="sNova" type="button">Nová skladba</button>
        </div>
      </div>

      ${this.ulozene().length ? `<h2 class="nadpisSekce">Uložené skladby</h2>
        <div class="seznamKaret uzke">
          ${this.ulozene().map(x => `<button class="karta klikaci" type="button" data-skladba="${esc(x.id)}">
            <span class="spec">${esc(nazevTonu(x.koren))}${x.mol ? " moll" : " dur"} · ${x.tempo}</span>
            <b>${esc(x.nazev)}</b>
            <span class="drobne">${esc((x.casti[0] && x.casti[0].akordy.join(" ")) || "")}</span>
          </button>`).join("")}
        </div>` : ""}`;

    this.napojOvladani(kam, stupne, bcka);
    this.vykresliTakty();
  },

  opust() { Vzor.stop(); this._hraje = false; },

  napojOvladani(kam, stupne, bcka) {
    const s = this.skladba;
    q("#sNazev", kam).oninput = e => { s.nazev = e.target.value; };
    q("#sKoren", kam).onchange = e => { this.zmenToninu(Number(e.target.value), s.mol); };
    q("#sMol", kam).onchange = e => { this.zmenToninu(s.koren, e.target.value === "mol"); };
    q("#sTempo", kam).onchange = e => { s.tempo = Number(e.target.value) || 90; };
    q("#sRytmus", kam).onchange = e => { s.rytmus = e.target.value; };
    q("#sText", kam).oninput = e => { s.text = e.target.value; };

    naKlik(q("#stupneRada", kam), "[data-stupen]", b => {
      const st = stupne[Number(b.dataset.stupen)];
      this.pridej(akordNaText(st.akord, bcka));
    });
    naKlik(kam, "[data-cast]", b => { this.castNyni = Number(b.dataset.cast); this.vykresli(kam); });
    naKlik(kam, "[data-postup]", b => {
      const p = POSTUPY.find(x => x.id === b.dataset.postup);
      this.cast().akordy = p.stupne.map(cislo => {
        const st = akordyToniny(s.koren, s.mol)[cislo - 1];
        const a = { koren: st.akord.koren, druh: p.sedmicky && st.akord.druh === "" ? "7" : st.akord.druh, bas: null };
        return akordNaText(a, bcka);
      });
      this.vykresliTakty();
    });
    naKlik(kam, "[data-skladba]", b => {
      this.skladba = this.ulozene().find(x => x.id === b.dataset.skladba);
      this.castNyni = 0;
      this.vykresli(kam);
    });
    naKlik(kam, "[data-tonina]", b => {
      this.zmenToninu(Number(b.dataset.tonina), b.dataset.mol === "1");
    });

    q("#sPridejRucne", kam).onclick = () => {
      const v = q("#sRucne").value.trim();
      if (parseAkord(v)) { this.pridej(v); q("#sRucne").value = ""; }
    };
    q("#sPridejCast", kam).onclick = () => {
      const jmeno = prompt("Název dílu (Sloka, Refrén, Most…)", "Refrén");
      if (!jmeno) return;
      s.casti.push({ nazev: jmeno, akordy: [] });
      this.castNyni = s.casti.length - 1;
      this.vykresli(kam);
    };
    q("#sPrejmenuj", kam).onclick = () => {
      const jmeno = prompt("Nový název dílu", this.cast().nazev);
      if (!jmeno) return;
      this.cast().nazev = jmeno;
      this.vykresli(kam);
    };
    q("#sSmazPostup", kam).onclick = () => { this.cast().akordy = []; this.vykresliTakty(); };
    q("#sHrat", kam).onclick = e => this.prehraj(e.target);
    q("#sUloz", kam).onclick = () => {
      const seznam = this.ulozene().filter(x => x.id !== s.id);
      seznam.unshift(s);
      this.ulozSkladby(seznam);
      this.vykresli(kam);
    };
    q("#sNova", kam).onclick = () => { this.skladba = this.novaSkladba(); this.castNyni = 0; this.vykresli(kam); };
    q("#sDoZpevniku", kam).onclick = () => this.doZpevniku();
  },

  cast() { return this.skladba.casti[this.castNyni] || this.skladba.casti[0]; },

  zmenToninu(koren, mol) {
    const s = this.skladba;
    const posun = ((koren - s.koren) % 12 + 12) % 12;
    if (posun) {
      for (const c of s.casti) {
        c.akordy = c.akordy.map(t => {
          const a = parseAkord(t);
          return a ? akordNaText(transponujAkord(a, posun), toninaSBecky(koren)) : t;
        });
      }
    }
    s.koren = koren;
    s.mol = mol;
    this.vykresli(this.korenEl);
  },

  pridej(jmeno) {
    this.cast().akordy.push(jmeno);
    this.vykresliTakty();
  },

  vykresliTakty() {
    const box = q("#takty");
    if (!box) return;
    const akordy = this.cast().akordy;
    box.innerHTML = akordy.length
      ? akordy.map((t, i) => {
          const a = parseAkord(t);
          const tvar = a ? tvaryAkordu(a)[0] : null;
          return `<div class="takt${i === this._ted ? " ted" : ""}" data-takt="${i}">
            <span class="cisloTaktu spec">${i + 1}</span>
            <b data-hmat="${tvar ? tvar.hmat.join(",") : ""}">${esc(t)}</b>
            <button class="pryc" type="button" data-pryc="${i}" title="odebrat">×</button>
          </div>`;
        }).join("")
      : `<p class="uvod">Klepněte na akord nahoře a začne se skládat postup. Čtyři nebo osm taktů
         je obvyklá délka dílu.</p>`;

    naKlik(box, "[data-pryc]", b => {
      this.cast().akordy.splice(Number(b.dataset.pryc), 1);
      this.vykresliTakty();
    });

    const napoveda = q("#sNapoveda");
    if (napoveda) napoveda.innerHTML = this.navrh();
  },

  /* Co bývá dál — podle role posledního akordu v tónině. */
  navrh() {
    const akordy = this.cast().akordy;
    if (!akordy.length) return "";
    const s = this.skladba;
    const stupne = akordyToniny(s.koren, s.mol);
    const posledni = parseAkord(akordy[akordy.length - 1]);
    if (!posledni) return "";
    const i = stupne.findIndex(st => st.akord.koren === posledni.koren);
    if (i < 0) return "Tenhle akord je mimo tóninu — o to zajímavěji vyzní návrat na tóniku.";
    const kam = s.mol
      ? { 0: [5, 6, 3], 2: [6, 5], 3: [0, 6], 4: [0, 5], 5: [2, 6, 3], 6: [0, 5] }
      : { 0: [3, 4, 5], 1: [4, 0], 2: [5, 3], 3: [0, 4], 4: [0, 5], 5: [3, 1, 4], 6: [0] };
    const navrhy = (kam[i] || [0]).map(x => akordNaText(stupne[x].akord, toninaSBecky(s.koren)));
    return "Po " + esc(akordy[akordy.length - 1]) + " se nejčastěji jde na <b>" + navrhy.join("</b>, <b>") + "</b>.";
  },

  /* ---------- přehrání postupu ---------- */
  prehraj(tlacitko) {
    if (this._hraje) {
      Vzor.stop(); this._hraje = false;
      tlacitko.textContent = "Přehrát dokola";
      qa(".takt").forEach(t => t.classList.remove("ted"));
      return;
    }
    const akordy = this.cast().akordy;
    if (!akordy.length) return;
    const rytmus = RYTMY.find(r => r.id === this.skladba.rytmus) || RYTMY[0];
    const naTakt = rytmus.vzor.length;

    /* Tóny se berou podle toho, v kolikátém taktu právě jsme. */
    const tonyTaktu = akordy.map(t => {
      const a = parseAkord(t);
      const tvar = a ? tvaryAkordu(a)[0] : null;
      return tvar ? tvar.tony : [];
    });

    this._hraje = true;
    tlacitko.textContent = "Zastavit";
    Vzor.naKrok = (i, kdy) => {
      const takt = Math.floor(Vzor.krok / naTakt) % akordy.length;
      const zpozdeni = Math.max(0, (kdy - Zvuk.ctx.currentTime) * 1000);
      setTimeout(() => qa(".takt").forEach(t => t.classList.toggle("ted", Number(t.dataset.takt) === takt)), zpozdeni);
    };
    Vzor.start({
      tempo: this.skladba.tempo,
      vzor: rytmus.vzor,
      tony: krok => tonyTaktu[Math.floor(krok / naTakt) % akordy.length]
    });
  },

  /* ---------- převod do zpěvníku ---------- */
  doZpevniku() {
    const s = this.skladba;
    const radkyTextu = s.text.split("\n");
    let text = "";
    let iRadku = 0;
    for (const c of s.casti) {
      text += "# " + c.nazev + "\n";
      const akordovyRadek = c.akordy.map(a => "[" + a + "]. . . .").join(" ");
      text += akordovyRadek + "\n";
      /* Ke každému dílu se přidá kus textu, pokud nějaký je. */
      const kus = radkyTextu.slice(iRadku, iRadku + 4).join("\n");
      iRadku += 4;
      if (kus.trim()) text += kus + "\n";
      text += "\n";
    }

    const seznam = nactiStav(KLIC_PISNE, { seznam: [] }).seznam;
    const zaznam = {
      id: "moje-" + s.id,
      nazev: s.nazev,
      autor: "vlastní",
      tempo: s.tempo,
      rytmus: s.rytmus,
      text: text.trim(),
      vlastni: true
    };
    ulozStav(KLIC_PISNE, { seznam: seznam.filter(x => x.id !== zaznam.id).concat([zaznam]) });
    prejdi("zpevnik");
  },

  /* ---------- kvintový kruh ---------- */
  kruh(s) {
    const R = 108, r = 74, stred = 130;
    const casti = [];
    casti.push(`<svg class="kruh" viewBox="0 0 260 260" width="260" height="260" role="img" aria-label="kvintový kruh">`);
    casti.push(`<circle cx="${stred}" cy="${stred}" r="${R + 18}" class="kruhPozadi" />`);
    KVINTOVY_KRUH.forEach((ton, i) => {
      const uhel = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const bcka = toninaSBecky(ton);
      const x = stred + Math.cos(uhel) * R, y = stred + Math.sin(uhel) * R;
      const aktivni = !s.mol && ton === s.koren;
      casti.push(`<g class="kruhPolozka${aktivni ? " aktivni" : ""}" data-tonina="${ton}" data-mol="0">
        <circle cx="${x}" cy="${y}" r="20" />
        <text x="${x}" y="${y + 4.5}" text-anchor="middle">${esc(nazevTonu(ton, bcka))}</text></g>`);

      const molTon = (ton + 9) % 12;
      const mx = stred + Math.cos(uhel) * r, my = stred + Math.sin(uhel) * r;
      const molAktivni = s.mol && molTon === s.koren;
      casti.push(`<g class="kruhPolozka mol${molAktivni ? " aktivni" : ""}" data-tonina="${molTon}" data-mol="1">
        <circle cx="${mx}" cy="${my}" r="15" />
        <text x="${mx}" y="${my + 4}" text-anchor="middle">${esc(nazevTonu(molTon, toninaSBecky(molTon)))}m</text></g>`);
    });
    casti.push(`</svg>`);
    return casti.join("");
  }
});
