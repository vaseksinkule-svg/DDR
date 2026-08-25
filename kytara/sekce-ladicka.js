"use strict";
/* ============================================================
   Sekce Ladička

   Dvě cesty ke stejnému cíli: mikrofon změří, co hrajete,
   nebo si necháte znít vzorový tón a doladíte podle sluchu.
   Mikrofon prohlížeč pustí až po povolení a jen na stránce,
   kterou uživatel sám otevřel.
   ============================================================ */
registrujSekci({
  id: "ladicka",
  nazev: "Ladička",
  popis: "Naladit podle mikrofonu nebo po sluchu",

  vykresli(kam) {
    const s = struny();
    kam.innerHTML = `
      <div class="hlava">
        <p class="spec">Před každým hraním</p>
        <h1>Ladička</h1>
        <p class="uvod">Brnkněte prázdnou strunu. Ručička ukáže, jestli je struna nízko, nebo vysoko —
           doprostřed a zeleně znamená naladěno. Ladí se vždycky nahoru: když jste nad cílem,
           povolte pod něj a doťahujte zespodu.</p>
      </div>

      <div class="panel ladBox">
        <div class="ladDisplej">
          <div class="ladTon" id="ladTon">—</div>
          <div class="ladHz" id="ladHz">čeká na zvuk</div>
          <div class="ladSkala">
            <div class="ladStred"></div>
            <div class="ladRucicka" id="ladRucicka"></div>
            <span class="ladPopis vlevo">nízko</span>
            <span class="ladPopis vpravo">vysoko</span>
          </div>
          <div class="ladStav" id="ladStav"></div>
        </div>
        <div class="radaTlacitek">
          <button class="btn hlavni" id="btnMikrofon" type="button">Zapnout mikrofon</button>
        </div>
        <p class="drobne" id="ladChyba"></p>
      </div>

      <h2 class="nadpisSekce">Podle sluchu</h2>
      <p class="uvod">Klepnutím se ozve vzorový tón. Nechte ho znít, brnkněte strunu a poslouchejte
         vlnění — čím pomalejší, tím blíž jste.</p>
      <div class="strunyRada">
        ${s.map((midi, i) => `
          <button class="btn strunaBtn" type="button" data-ton="${midi}">
            <b>${["E", "A", "D", "G", "H", "e"][i]}</b>
            <span class="spec">${i + 1}. struna · ${midiNaHz(midi).toFixed(1)} Hz</span>
          </button>`).reverse().join("")}
      </div>

      <div class="poznamka">
        <b>Bez ladičky i bez mikrofonu.</b> Pátý pražec šesté struny zní stejně jako prázdná pátá,
        totéž mezi pátou a čtvrtou i mezi čtvrtou a třetí. Mezi třetí a druhou se bere pražec
        <b>čtvrtý</b> — jediná výjimka — a mezi druhou a první zase pátý.
      </div>`;

    const btn = q("#btnMikrofon", kam);
    btn.onclick = () => (Ladicka.bezi ? this.vypni() : this.zapni());
  },

  zapni() {
    const chyba = q("#ladChyba");
    chyba.textContent = "";
    Ladicka.start(v => this.ukaz(v)).then(() => {
      q("#btnMikrofon").textContent = "Vypnout mikrofon";
      q("#btnMikrofon").classList.remove("hlavni");
    }).catch(e => {
      chyba.textContent = "Mikrofon se nepodařilo zapnout (" + (e && e.name ? e.name : "chyba") +
        "). Zkontrolujte povolení v prohlížeči, nebo lze ladit podle vzorových tónů níž.";
    });
  },

  vypni() {
    Ladicka.stop();
    const b = q("#btnMikrofon");
    if (b) { b.textContent = "Zapnout mikrofon"; b.classList.add("hlavni"); }
    const t = q("#ladTon"), h = q("#ladHz");
    if (t) t.textContent = "—";
    if (h) h.textContent = "čeká na zvuk";
    this.ukazRucicku(null);
  },

  opust() { this.vypni(); },

  /* Z frekvence se udělá název tónu a odchylka v centech.
     Sto centů je jeden pražec; do pěti se odchylka nepozná. */
  ukaz(v) {
    const ton = q("#ladTon"), hz = q("#ladHz"), stav = q("#ladStav");
    if (!ton) return;
    if (!v.hz) {
      hz.textContent = "čeká na zvuk";
      stav.textContent = "";
      this.ukazRucicku(null);
      return;
    }
    const presne = hzNaMidi(v.hz);
    const nejbliz = Math.round(presne);
    const centy = Math.round((presne - nejbliz) * 100);

    /* Ke které struně to má nejblíž? */
    const s = struny();
    let struna = 0, rozdil = 99;
    s.forEach((m, i) => { if (Math.abs(m - nejbliz) < rozdil) { rozdil = Math.abs(m - nejbliz); struna = i; } });

    ton.textContent = nazevTonu(midiNaTon(nejbliz));
    hz.textContent = v.hz.toFixed(1) + " Hz";
    stav.innerHTML = rozdil === 0
      ? `<span class="spec">${struna + 1}. struna (${["E", "A", "D", "G", "H", "e"][struna]})</span>`
      : `<span class="spec">nejblíž ${["E", "A", "D", "G", "H", "e"][struna]} — o ${rozdil} půltón${rozdil > 4 ? "ů" : rozdil > 1 ? "y" : ""} ${nejbliz > s[struna] ? "výš" : "níž"}</span>`;
    this.ukazRucicku(centy);
  },

  ukazRucicku(centy) {
    const r = q("#ladRucicka");
    if (!r) return;
    if (centy == null) {
      r.style.left = "50%";
      r.className = "ladRucicka spi";
      return;
    }
    const omezene = Math.max(-50, Math.min(50, centy));
    r.style.left = (50 + omezene) + "%";
    r.className = "ladRucicka" + (Math.abs(centy) <= 5 ? " sedi" : "");
  }
});
