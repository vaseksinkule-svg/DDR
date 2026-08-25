"use strict";
/* ============================================================
   Sekce Cvičebna

   Čtyři věci, které dělají pokrok: přesný čas (metronom),
   pravá ruka (rytmy), levá ruka (přechody mezi akordy)
   a poctivost (deník).
   ============================================================ */

const KLIC_DENIK = "kytara.denik";
const KLIC_ZMENY = "kytara.zmeny";

/* ---------- přehrávač rytmického vzoru ----------
   Stejný princip jako metronom: kroky se objednávají dopředu,
   časovač jen hlídá, aby byla objednávka napřed. */
const Vzor = {
  bezi: false, tempo: 80, vzor: [], tony: [], krok: 0,
  _dalsi: 0, _casovac: null, naKrok: null,

  start(nastaveni) {
    Object.assign(this, nastaveni || {});
    const ctx = Zvuk.probud();
    if (!ctx || this.bezi) return;
    this.bezi = true;
    this.krok = 0;
    this._dalsi = ctx.currentTime + 0.1;
    this._casovac = setInterval(() => this._objednej(), 25);
    this._objednej();
  },

  stop() {
    this.bezi = false;
    clearInterval(this._casovac);
    this._casovac = null;
  },

  delkaKroku() { return 30 / this.tempo; },     // jedno políčko = osmina

  _objednej() {
    const ctx = Zvuk.ctx;
    if (!ctx || !this.bezi) return;
    while (this._dalsi < ctx.currentTime + 0.15) {
      const i = this.krok % this.vzor.length;
      this._zahraj(this.vzor[i], this._dalsi, i);
      if (this.naKrok) this.naKrok(i, this._dalsi);
      this._dalsi += this.delkaKroku();
      this.krok++;
    }
  },

  /* Tóny můžou být pevné pole, nebo funkce — to když se akord
     mění v průběhu, jako v postupu ve Skládání. */
  _zahraj(znak, kdy, i) {
    const t = typeof this.tony === "function" ? this.tony(this.krok) : this.tony;
    if (!t || !t.length) return;
    if (znak === "D") Zvuk.akord(t, { kdy, smer: "dolu", hlasitost: i % 4 === 0 ? 1 : 0.82 });
    else if (znak === "U") Zvuk.akord(t.slice(-4), { kdy, smer: "nahoru", hlasitost: 0.6 });
    else if (znak === "B") Zvuk.brnkni(t[0], kdy, 1);
    else if (znak === "P") {
      /* Rozklad: nejdřív bas, pak tři vrchní struny tam a zpět. */
      const rada = [t[0]].concat(t.slice(-3), t.slice(-3).slice(0, 2).reverse());
      Zvuk.brnkni(rada[i % rada.length], kdy, i % 6 === 0 ? 1 : 0.75);
    }
  }
};

registrujSekci({
  id: "cvicebna",
  nazev: "Cvičebna",
  popis: "Metronom, rytmy, přechody a deník",

  tempo: 80,
  doby: 4,
  deleni: 1,
  rytmus: "nej",
  rytmusAkord: "G",
  zmenyA: "Em",
  zmenyB: "Am",
  _klepy: [],
  _test: null,

  vykresli(kam) {
    kam.innerHTML = `
      <div class="hlava">
        <p class="spec">Dvacet minut denně stačí</p>
        <h1>Cvičebna</h1>
        <p class="uvod">Krátké a časté cvičení posune ruku dál než jedno dlouhé o víkendu.
           Tady je všechno, co k tomu potřebujete.</p>
      </div>

      <h2 class="nadpisSekce">Metronom</h2>
      <div class="panel metronomBox">
        <div class="doby" id="dobyUkazatel"></div>
        <div class="ovladani">
          <button class="btn hlavni" id="mStart" type="button">Spustit</button>
          <div class="ovlSkupina siroka">
            <span class="spec">Tempo</span>
            <input id="mTempo" type="range" min="40" max="208" step="1" value="${this.tempo}" />
            <span class="hodnota fig" id="mTempoPopis">${this.tempo}</span>
          </div>
          <button class="btn" id="mKlep" type="button">Ťukat tempo</button>
          <div class="ovlSkupina">
            <span class="spec">Doby</span>
            <select id="mDoby">${[2, 3, 4, 5, 6].map(d => `<option value="${d}"${d === this.doby ? " selected" : ""}>${d}</option>`).join("")}</select>
          </div>
          <div class="ovlSkupina">
            <span class="spec">Dělení</span>
            <select id="mDeleni">
              <option value="1">na doby</option>
              <option value="2">osminy</option>
              <option value="3">triola</option>
              <option value="4">šestnáctiny</option>
            </select>
          </div>
        </div>
        <p class="drobne">Pomalé tempo není trest, je to zkratka. Co jde na 60 bez zaváhání,
           jde za týden na 100.</p>
      </div>

      <h2 class="nadpisSekce">Rytmy pravé ruky</h2>
      <div class="panel">
        <div class="radaVoleb">
          <label>Vzor
            <select id="rVzor">${RYTMY.map(r => `<option value="${r.id}"${r.id === this.rytmus ? " selected" : ""}>${esc(r.nazev)}</option>`).join("")}</select>
          </label>
          <label>Akord
            <select id="rAkord">${["G", "C", "D", "Em", "Am", "A", "E", "Dm", "F"].map(a =>
              `<option value="${a}"${a === this.rytmusAkord ? " selected" : ""}>${a}</option>`).join("")}</select>
          </label>
          <label>Tempo
            <input id="rTempo" type="range" min="40" max="160" step="2" value="${this.tempo}" />
          </label>
          <button class="btn hlavni" id="rHrat" type="button">Přehrát vzor</button>
        </div>
        <div id="rVzorec"></div>
      </div>

      <h2 class="nadpisSekce">Trenažér přechodů</h2>
      <div class="panel">
        <p class="uvod">Minuta na dvojici akordů. Za každý čistý přehmat klepněte na velké tlačítko.
           Začátečník zvládne osm až dvanáct, po týdnu cvičení bývá dvacet.</p>
        <div class="radaVoleb">
          <label>Z akordu <select id="zA"></select></label>
          <label>Do akordu <select id="zB"></select></label>
          <button class="btn hlavni" id="zStart" type="button">Spustit minutu</button>
        </div>
        <div class="zmenyBox">
          <div class="akordy male" id="zDiagramy"></div>
          <button class="btn velky pocitadlo" id="zPocitadlo" type="button" disabled>
            <span class="cislo fig" id="zCislo">0</span>
            <span class="spec">klepněte při každé změně</span>
          </button>
          <div class="odpocet fig" id="zCas">60</div>
        </div>
        <div id="zHistorie"></div>
      </div>

      <h2 class="nadpisSekce">Deník cvičení</h2>
      <div class="panel" id="denikBox"></div>`;

    /* metronom */
    const ukaz = () => { q("#mTempoPopis", kam).textContent = this.tempo; };
    q("#mTempo", kam).oninput = e => {
      this.tempo = Number(e.target.value); ukaz();
      if (Metronom.bezi) Metronom.prepni({ tempo: this.tempo });
      q("#rTempo", kam).value = this.tempo;
    };
    q("#mDoby", kam).onchange = e => { this.doby = Number(e.target.value); this.dobyUkazatel(); Metronom.prepni({ doby: this.doby }); };
    q("#mDeleni", kam).onchange = e => { this.deleni = Number(e.target.value); Metronom.prepni({ deleni: this.deleni }); };
    q("#mDeleni", kam).value = this.deleni;
    q("#mStart", kam).onclick = e => {
      if (Metronom.bezi) { Metronom.stop(); e.target.textContent = "Spustit"; this.dobyUkazatel(); }
      else {
        Metronom.start({ tempo: this.tempo, doby: this.doby, deleni: this.deleni });
        Metronom._naDobu = (cislo, naDobe) => { if (naDobe) this.dobyUkazatel(cislo); };
        e.target.textContent = "Zastavit";
      }
    };
    q("#mKlep", kam).onclick = () => this.klep();
    this.dobyUkazatel();

    /* rytmy */
    const prekresliVzor = () => {
      const r = RYTMY.find(x => x.id === this.rytmus);
      q("#rVzorec", kam).innerHTML = `
        <div class="vzorec velky" id="vzorecPole">
          ${r.vzor.map((v, i) => `<span class="pole${i % 2 ? " slaba" : ""}" data-i="${i}">
            <b>${vzorZnak(v)}</b><span class="spec">${i % 2 ? "a" : Math.floor(i / 2) + 1}</span></span>`).join("")}
        </div>
        <p class="uvod">${esc(r.popis)}</p>
        <p class="drobne"><b>Kde se hodí:</b> ${esc(r.kdy)}</p>`;
    };
    q("#rVzor", kam).onchange = e => {
      this.rytmus = e.target.value; prekresliVzor();
      if (Vzor.bezi) { Vzor.stop(); q("#rHrat", kam).textContent = "Přehrát vzor"; }
    };
    q("#rAkord", kam).onchange = e => { this.rytmusAkord = e.target.value; if (Vzor.bezi) Vzor.tony = this.tonyAkordu(); };
    q("#rTempo", kam).oninput = e => { this.tempo = Number(e.target.value); ukaz(); q("#mTempo", kam).value = this.tempo; Vzor.tempo = this.tempo; };
    q("#rHrat", kam).onclick = e => {
      if (Vzor.bezi) { Vzor.stop(); e.target.textContent = "Přehrát vzor"; qa(".pole").forEach(p => p.classList.remove("ted")); return; }
      const r = RYTMY.find(x => x.id === this.rytmus);
      Vzor.naKrok = (i, kdy) => {
        const zpozdeni = Math.max(0, (kdy - Zvuk.ctx.currentTime) * 1000);
        setTimeout(() => {
          qa(".pole").forEach(p => p.classList.toggle("ted", Number(p.dataset.i) === i));
        }, zpozdeni);
      };
      Vzor.start({ tempo: this.tempo, vzor: r.vzor, tony: this.tonyAkordu() });
      e.target.textContent = "Zastavit";
    };
    prekresliVzor();

    /* trenažér */
    const nabidka = ["Em", "Am", "C", "G", "D", "A", "E", "Dm", "F", "Fmaj7", "G7", "D7", "A7", "Hm7"];
    q("#zA", kam).innerHTML = nabidka.map(a => `<option${a === this.zmenyA ? " selected" : ""}>${a}</option>`).join("");
    q("#zB", kam).innerHTML = nabidka.map(a => `<option${a === this.zmenyB ? " selected" : ""}>${a}</option>`).join("");
    q("#zA", kam).onchange = e => { this.zmenyA = e.target.value; this.zmenyDiagramy(); };
    q("#zB", kam).onchange = e => { this.zmenyB = e.target.value; this.zmenyDiagramy(); };
    q("#zStart", kam).onclick = () => this.spustTest();
    q("#zPocitadlo", kam).onclick = () => {
      if (!this._test) return;
      this._test.pocet++;
      q("#zCislo").textContent = this._test.pocet;
    };
    this.zmenyDiagramy();
    this.historieZmen();
    this.denik();
  },

  opust() { Metronom.stop(); Vzor.stop(); this.ukoncitTest(true); },

  tonyAkordu() {
    const a = parseAkord(this.rytmusAkord);
    const t = a ? tvaryAkordu(a)[0] : null;
    return t ? t.tony : [];
  },

  dobyUkazatel(ted) {
    const el = q("#dobyUkazatel");
    if (!el) return;
    el.innerHTML = Array.from({ length: this.doby }, (_, i) =>
      `<span class="doba${i === ted ? " ted" : ""}${i === 0 ? " prvni" : ""}"></span>`).join("");
  },

  /* Tempo podle klepání: průměr z posledních intervalů. */
  klep() {
    const ted = performance.now();
    this._klepy = this._klepy.filter(t => ted - t < 3000);
    this._klepy.push(ted);
    if (this._klepy.length < 2) return;
    const rozdily = [];
    for (let i = 1; i < this._klepy.length; i++) rozdily.push(this._klepy[i] - this._klepy[i - 1]);
    const prumer = rozdily.reduce((a, b) => a + b, 0) / rozdily.length;
    this.tempo = Math.max(40, Math.min(208, Math.round(60000 / prumer)));
    q("#mTempo").value = this.tempo;
    q("#rTempo").value = this.tempo;
    q("#mTempoPopis").textContent = this.tempo;
    if (Metronom.bezi) Metronom.prepni({ tempo: this.tempo });
  },

  zmenyDiagramy() {
    const box = q("#zDiagramy");
    if (!box) return;
    box.innerHTML = [this.zmenyA, this.zmenyB].map(jmeno => {
      const a = parseAkord(jmeno);
      const t = a ? tvaryAkordu(a)[0] : null;
      return t ? kartaAkordu(a, t, { nadpis: jmeno }) : "";
    }).join("");
  },

  spustTest() {
    this.ukoncitTest(true);
    const pocitadlo = q("#zPocitadlo");
    pocitadlo.disabled = false;
    pocitadlo.classList.add("aktivni");
    q("#zCislo").textContent = "0";
    q("#zStart").textContent = "Zastavit";
    q("#zStart").onclick = () => this.ukoncitTest(false);

    this._test = { pocet: 0, zbyva: 60 };
    Metronom.start({ tempo: this.tempo, doby: this.doby, deleni: 1 });
    this._test.tik = setInterval(() => {
      this._test.zbyva--;
      q("#zCas").textContent = this._test.zbyva;
      if (this._test.zbyva <= 0) this.ukoncitTest(false);
    }, 1000);
  },

  ukoncitTest(tise) {
    if (!this._test) return;
    clearInterval(this._test.tik);
    const pocet = this._test.pocet;
    this._test = null;
    Metronom.stop();

    const pocitadlo = q("#zPocitadlo");
    if (pocitadlo) { pocitadlo.disabled = true; pocitadlo.classList.remove("aktivni"); }
    const start = q("#zStart");
    if (start) { start.textContent = "Spustit minutu"; start.onclick = () => this.spustTest(); }
    const cas = q("#zCas");
    if (cas) cas.textContent = "60";

    if (tise || !pocet) return;
    const data = nactiStav(KLIC_ZMENY, { zaznamy: [] });
    data.zaznamy.push({ kdy: new Date().toISOString().slice(0, 10), dvojice: this.zmenyA + " → " + this.zmenyB, pocet });
    data.zaznamy = data.zaznamy.slice(-40);
    ulozStav(KLIC_ZMENY, data);
    this.historieZmen();
  },

  historieZmen() {
    const box = q("#zHistorie");
    if (!box) return;
    const zaznamy = nactiStav(KLIC_ZMENY, { zaznamy: [] }).zaznamy.slice().reverse().slice(0, 8);
    if (!zaznamy.length) { box.innerHTML = ""; return; }
    const nej = Math.max(...zaznamy.map(z => z.pocet));
    box.innerHTML = `<h3 class="nadpisSekce">Poslední pokusy</h3>
      <div class="sloupce">
        ${zaznamy.map(z => `<div class="radekVysledku">
          <span class="fig">${z.pocet}</span>
          <span class="pruh"><i style="width:${Math.round(z.pocet / nej * 100)}%"></i></span>
          <span class="drobne">${esc(z.dvojice)} · ${esc(z.kdy)}</span>
        </div>`).join("")}
      </div>`;
  },

  /* ---------- deník ---------- */
  denik() {
    const box = q("#denikBox");
    if (!box) return;
    const data = nactiStav(KLIC_DENIK, { zaznamy: [] });
    const dnes = new Date().toISOString().slice(0, 10);
    const dnesni = data.zaznamy.filter(z => z.den === dnes).reduce((s, z) => s + z.minut, 0);

    /* Kolik dní v řadě se cvičilo — počítá se odedneška zpět. */
    const dny = new Set(data.zaznamy.map(z => z.den));
    let serie = 0;
    for (let i = 0; i < 400; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      if (dny.has(d)) serie++;
      else if (i > 0) break;
    }

    box.innerHTML = `
      <div class="denikShrnuti">
        <div><span class="cislo fig">${dnesni}</span><span class="spec">${mnozne(dnesni, "minuta", "minuty", "minut")} dnes</span></div>
        <div><span class="cislo fig">${serie}</span><span class="spec">${mnozne(serie, "den", "dny", "dní")} v řadě</span></div>
        <div><span class="cislo fig">${data.zaznamy.reduce((s, z) => s + z.minut, 0)}</span><span class="spec">minut celkem</span></div>
      </div>
      <div class="pole">
        <label>Minut<input id="dMinut" type="number" min="1" max="600" value="20" /></label>
        <label>Co jste cvičili<input id="dCo" type="text" placeholder="například přechody G → C" /></label>
      </div>
      <div class="radaTlacitek">
        <button class="btn hlavni" id="dPridej" type="button">Zapsat</button>
      </div>
      ${data.zaznamy.length ? `<div class="sloupce denikSeznam">
        ${data.zaznamy.slice().reverse().slice(0, 10).map(z =>
          `<div class="radekVysledku"><span class="fig">${z.minut} min</span>
           <span class="drobne">${esc(z.den)}${z.co ? " · " + esc(z.co) : ""}</span></div>`).join("")}
      </div>` : `<p class="drobne">Zápisy zůstávají v tomto prohlížeči. Nejde o výkaz — jde o to,
        aby bylo po měsíci vidět, že se něco dělo.</p>`}`;

    q("#dPridej", box).onclick = () => {
      const minut = Number(q("#dMinut").value) || 0;
      if (!minut) return;
      data.zaznamy.push({ den: dnes, minut, co: q("#dCo").value.trim() });
      ulozStav(KLIC_DENIK, data);
      this.denik();
    };
  }
});
