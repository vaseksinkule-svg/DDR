"use strict";
/* ============================================================
   Sekce Tabulatury

   Tabulaturu ve formátu, jaký visí po celém internetu,
   aplikace rozebere na sloupce a přehraje. Kurzor jede po
   textu, takže je vidět, kde zrovna jste.

   Co v tabulatuře nikdy není, je rytmus — proto se tempo
   nastavuje ručně a všechny tóny mají stejnou délku.
   ============================================================ */

const KLIC_TABY = "kytara.taby";

/* Řádek tabulatury: začíná názvem struny a pak samé -, čísla a svislítka. */
function jeRadekTabu(r) {
  if (!/^\s*[eEBbHhGgDdAa]?\s*[|:-]/.test(r)) return false;
  const telo = r.replace(/^\s*[eEBbHhGgDdAa]?\s*[|:]?/, "");
  if ((telo.match(/-/g) || []).length < 3) return false;
  return !/[a-zA-Z]{2,}/.test(telo);        // v tabu jsou nanejvýš jednotlivé značky h, p, b, x
}

/* Rozbor na bloky po šesti řádcích a z nich na sloupce. */
function parsujTab(text) {
  const radky = String(text || "").split("\n");
  const bloky = [];
  let sbirka = [];
  for (const r of radky) {
    if (jeRadekTabu(r)) {
      sbirka.push(r);
      if (sbirka.length === 6) { bloky.push(sbirka); sbirka = []; }
    } else if (sbirka.length) {
      sbirka = [];
    }
  }

  return bloky.map(blok => {
    /* Bývá to psané odshora od nejtenčí struny, ale ne vždy.
       Rozhodne popisek na začátku řádků. */
    const popisky = blok.map(r => (r.trim()[0] || "").toLowerCase());
    const obracene = popisky[0] === "e" && popisky[5] === "e"
      ? blok[0].trim()[0] === "E" && blok[5].trim()[0] === "e"
      : popisky[0] === "e" && popisky[1] === "a";

    const sloupce = [];
    const delka = Math.max(...blok.map(r => r.length));
    const preskoc = blok.map(() => -1);

    for (let i = 0; i < delka; i++) {
      const tony = [];
      for (let r = 0; r < 6; r++) {
        if (i <= preskoc[r]) continue;
        const znak = blok[r][i];
        if (!znak || !/[0-9]/.test(znak)) continue;
        let cislo = znak, j = i + 1;
        while (blok[r][j] && /[0-9]/.test(blok[r][j])) { cislo += blok[r][j]; j++; }
        preskoc[r] = j - 1;
        const struna = obracene ? r : 5 - r;
        tony.push({ struna, prazec: Number(cislo) });
      }
      if (tony.length) sloupce.push({ pozice: i, tony });
    }
    return { radky: blok, sloupce };
  });
}

registrujSekci({
  id: "tabulatury",
  nazev: "Tabulatury",
  popis: "Číst, přehrát a zpomalit",

  otevrena: null,
  tempo: 80,
  smycka: false,
  _hraje: false,
  _casovac: null,

  vlastni() { return nactiStav(KLIC_TABY, { seznam: [] }).seznam; },
  ulozVlastni(seznam) { ulozStav(KLIC_TABY, { seznam }); },
  vsechny() { return TABY.concat(this.vlastni()); },

  vykresli(kam) {
    this.korenEl = kam;
    if (this.otevrena) this.vykresliTab(kam);
    else this.vykresliSeznam(kam);
  },

  opust() { this.zastav(); },

  vykresliSeznam(kam) {
    const vlastni = this.vlastni();
    kam.innerHTML = `
      <div class="hlava">
        <p class="spec">Šest čar, šest strun</p>
        <h1>Tabulatury</h1>
        <p class="uvod">Horní čára je nejtenčí struna, čísla jsou pražce. Aplikace tab přehraje
           tempem, které si nastavíte — a kurzor ukáže, kde v něm zrovna jste. Vlastní tabulaturu
           stačí vložit odkudkoli.</p>
      </div>

      <div class="radaTlacitek">
        <button class="btn hlavni" id="novyTab" type="button">Vložit tabulaturu</button>
      </div>

      ${["začátek", "pokročilejší"].map(uroven => `
        <h2 class="nadpisSekce">${uroven === "začátek" ? "Na začátek" : "O kus dál"}</h2>
        <div class="seznamKaret">
          ${TABY.filter(t => t.uroven === uroven).map(t => `
            <button class="karta klikaci" type="button" data-tab="${esc(t.id)}">
              <span class="spec">tempo ${t.tempo}</span>
              <b>${esc(t.nazev)}</b>
              <span class="drobne">${esc(t.popis)}</span>
            </button>`).join("")}
        </div>`).join("")}

      <h2 class="nadpisSekce">Moje tabulatury <span class="drobne">${vlastni.length ? vlastni.length + " uloženo" : "zatím žádné"}</span></h2>
      <div class="seznamKaret">
        ${vlastni.length ? vlastni.map(t => `
          <button class="karta klikaci" type="button" data-tab="${esc(t.id)}">
            <span class="spec">tempo ${t.tempo}</span>
            <b>${esc(t.nazev)}</b>
            <span class="drobne">${esc(t.popis || "")}</span>
          </button>`).join("")
          : `<p class="uvod">Zkopírujte tabulaturu odkudkoli z internetu a vložte ji sem.
             Musí mít šest řádků pod sebou — aplikace si v nich najde čísla sama.</p>`}
      </div>`;

    naKlik(kam, "[data-tab]", el => { this.otevri(el.dataset.tab); });
    q("#novyTab", kam).onclick = () => this.uprav(null);
  },

  otevri(id) {
    this.otevrena = this.vsechny().find(t => t.id === id) || null;
    if (this.otevrena) this.tempo = this.otevrena.tempo || 80;
    this.zastav();
    this.vykresli(this.korenEl);
  },

  vykresliTab(kam) {
    const t = this.otevrena;
    const bloky = parsujTab(t.tab);
    const kroku = bloky.reduce((s, b) => s + b.sloupce.length, 0);

    kam.innerHTML = `
      <div class="hlava pisenHlava">
        <button class="btn tise" id="zpetTaby" type="button">← Tabulatury</button>
        <div>
          <p class="spec">${esc(t.uroven || "vlastní")} · ${kroku} ${mnozne(kroku, "tón", "tóny", "tónů")}</p>
          <h1>${esc(t.nazev)}</h1>
        </div>
      </div>

      ${t.popis ? `<p class="uvod">${esc(t.popis)}</p>` : ""}

      <div class="panel ovladani noprint">
        <button class="btn hlavni" id="btnHrat" type="button">Přehrát</button>
        <div class="ovlSkupina">
          <span class="spec">Tempo</span>
          <input id="tabTempo" type="range" min="30" max="200" step="5" value="${this.tempo}" />
          <span class="hodnota fig" id="tabTempoPopis">${this.tempo}</span>
        </div>
        <label class="prepinac"><input id="tabSmycka" type="checkbox"${this.smycka ? " checked" : ""} /> Dokola</label>
        <span class="grow"></span>
        <button class="btn tise" id="upravTab" type="button">Upravit</button>
      </div>

      <div class="tabBloky" id="tabBloky">
        ${bloky.map((b, i) => `
          <div class="tabBlok" data-blok="${i}">
            <pre>${esc(b.radky.join("\n"))}</pre>
            <div class="tabKurzor" hidden></div>
          </div>`).join("")}
      </div>

      ${bloky.length ? "" : `<div class="poznamka"><b>Tady se nic přehrát nedá.</b>
        Text nevypadá jako tabulatura — potřebuje šest řádků pod sebou, každý začínající názvem struny.</div>`}`;

    this._bloky = bloky;
    q("#zpetTaby", kam).onclick = () => { this.otevrena = null; this.zastav(); this.vykresli(kam); };
    q("#upravTab", kam).onclick = () => this.uprav(t);
    q("#btnHrat", kam).onclick = () => (this._hraje ? this.zastav() : this.hraj());
    q("#tabTempo", kam).oninput = e => {
      this.tempo = Number(e.target.value);
      q("#tabTempoPopis", kam).textContent = this.tempo;
      if (this._hraje) { this.zastav(); this.hraj(); }
    };
    q("#tabSmycka", kam).onchange = e => { this.smycka = e.target.checked; };
  },

  /* ---------- přehrávání ----------
     Tóny se objednají dopředu do zvukové karty, kurzor se pak
     jen veze podle času, který uběhl. */
  hraj() {
    const ctx = Zvuk.probud();
    if (!ctx || !this._bloky || !this._bloky.length) return;

    const kroky = [];
    this._bloky.forEach((b, iBloku) => b.sloupce.forEach(s => kroky.push({ blok: iBloku, ...s })));
    if (!kroky.length) return;

    this._hraje = true;
    q("#btnHrat").textContent = "Zastavit";
    const delka = 60 / this.tempo;
    const start = ctx.currentTime + 0.15;
    const s = struny();

    kroky.forEach((k, i) => {
      const kdy = start + i * delka;
      const tony = k.tony.map(x => s[x.struna] + x.prazec);
      if (tony.length > 1) Zvuk.akord(tony, { kdy, rozjezd: 0.012 });
      else Zvuk.brnkni(tony[0], kdy);
    });

    const posun = () => {
      if (!this._hraje) return;
      const ted = Zvuk.ctx.currentTime;
      const i = Math.floor((ted - start) / delka);
      if (i >= kroky.length) {
        if (this.smycka) { this.zastav(); this.hraj(); }
        else this.zastav();
        return;
      }
      if (i >= 0) this.ukazKurzor(kroky[i]);
      this._casovac = requestAnimationFrame(posun);
    };
    this._casovac = requestAnimationFrame(posun);
  },

  ukazKurzor(krok) {
    qa(".tabKurzor").forEach((k, i) => {
      if (i === krok.blok) {
        k.hidden = false;
        k.style.left = `calc(${krok.pozice}ch + 0.5ch)`;
      } else {
        k.hidden = true;
      }
    });
  },

  zastav() {
    this._hraje = false;
    if (this._casovac) cancelAnimationFrame(this._casovac);
    this._casovac = null;
    const b = q("#btnHrat");
    if (b) b.textContent = "Přehrát";
    qa(".tabKurzor").forEach(k => { k.hidden = true; });
  },

  uprav(t) {
    const kam = this.korenEl;
    const nova = !t;
    const vlastniTab = t && this.vlastni().some(x => x.id === t.id);
    const predloha = t || { id: "", nazev: "", popis: "", tempo: 80, tab: "e|-----------------|\nH|-----------------|\nG|-----------------|\nD|-----------------|\nA|-----------------|\nE|-----------------|" };

    this.zastav();
    kam.innerHTML = `
      <div class="hlava">
        <button class="btn tise" id="zpetTab" type="button">← Zpět</button>
        <h1>${nova ? "Nová tabulatura" : "Upravit"}</h1>
        <p class="uvod">Vložte šest řádků pod sebou. Aplikace pozná i tabulatury psané obráceně
           (nejtlustší strunou nahoře) podle popisků na začátku řádků.</p>
      </div>
      <div class="panel">
        <div class="pole">
          <label>Název<input id="tNazev" type="text" value="${esc(predloha.nazev)}" /></label>
          <label>Tempo<input id="tTempo" type="number" min="30" max="200" value="${predloha.tempo}" /></label>
        </div>
        <label class="siroke">Poznámka<input id="tPopis" type="text" value="${esc(predloha.popis || "")}" /></label>
        <label class="siroke">Tabulatura
          <textarea id="tTab" rows="14" spellcheck="false" class="fig">${esc(predloha.tab)}</textarea>
        </label>
        <div class="radaTlacitek">
          <button class="btn hlavni" id="tUloz" type="button">Uložit</button>
          ${vlastniTab ? `<button class="btn" id="tSmaz" type="button">Smazat</button>` : ""}
        </div>
      </div>`;

    q("#zpetTab", kam).onclick = () => this.vykresli(kam);
    q("#tUloz", kam).onclick = () => {
      const zaznam = {
        id: vlastniTab ? predloha.id : "tab-" + Date.now().toString(36),
        nazev: q("#tNazev").value.trim() || "Bez názvu",
        popis: q("#tPopis").value.trim(),
        tempo: Number(q("#tTempo").value) || 80,
        tab: q("#tTab").value,
        uroven: "vlastní",
        vlastni: true
      };
      const seznam = this.vlastni().filter(x => x.id !== zaznam.id);
      seznam.push(zaznam);
      this.ulozVlastni(seznam);
      this.otevrena = zaznam;
      this.vykresli(kam);
    };
    const smaz = q("#tSmaz", kam);
    if (smaz) smaz.onclick = () => {
      if (!confirm("Opravdu smazat „" + predloha.nazev + "“?")) return;
      this.ulozVlastni(this.vlastni().filter(x => x.id !== predloha.id));
      this.otevrena = null;
      this.vykresli(kam);
    };
  }
});
