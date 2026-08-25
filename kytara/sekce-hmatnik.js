"use strict";
/* ============================================================
   Sekce Hmatník

   Krk kytary naležato. Ukáže, kde na něm leží tóny vybrané
   stupnice — a které akordy z ní vyrostou.
   ============================================================ */
registrujSekci({
  id: "hmatnik",
  nazev: "Hmatník",
  popis: "Tóny, stupnice a tóniny na krku",

  vyber: { koren: 9, stupnice: "pent_mol", popisky: "tony", prazcu: 15 },

  vykresli(kam) {
    kam.innerHTML = `
      <div class="hlava">
        <p class="spec">Orientace na krku</p>
        <h1>Hmatník</h1>
        <p class="uvod">Vyberte základní tón a stupnici. Zvýrazněné puntíky jsou tóny, které do ní patří;
           tmavé jsou základní tóny — od nich se všechno počítá. Klepnutím tón uslyšíte.</p>
      </div>

      <div class="panel radaVoleb">
        <label>Základní tón
          <select id="hKoren">${Array.from({ length: 12 }, (_, i) =>
            `<option value="${i}">${esc(nazevTonu(i))}</option>`).join("")}</select>
        </label>
        <label>Stupnice
          <select id="hStupnice">${Object.keys(STUPNICE).map(k =>
            `<option value="${k}">${esc(STUPNICE[k].nazev)}</option>`).join("")}</select>
        </label>
        <label>Popisky
          <select id="hPopisky">
            <option value="tony">názvy tónů</option>
            <option value="stupne">stupně (1, 2, 3…)</option>
            <option value="zadne">žádné</option>
          </select>
        </label>
        <button class="btn" id="hPrehrat" type="button">Přehrát stupnici</button>
      </div>

      <div class="panel svitek" id="hmatnikBox"></div>
      <div id="hPopis"></div>`;

    q("#hKoren", kam).value = this.vyber.koren;
    q("#hStupnice", kam).value = this.vyber.stupnice;
    q("#hPopisky", kam).value = this.vyber.popisky;

    q("#hKoren", kam).onchange = e => { this.vyber.koren = Number(e.target.value); this.ukaz(); };
    q("#hStupnice", kam).onchange = e => { this.vyber.stupnice = e.target.value; this.ukaz(); };
    q("#hPopisky", kam).onchange = e => { this.vyber.popisky = e.target.value; this.ukaz(); };
    q("#hPrehrat", kam).onclick = () => this.prehraj();

    this.ukaz();
  },

  ukaz() {
    const koren = this.vyber.koren;
    const klic = this.vyber.stupnice;
    const stupnice = STUPNICE[klic];
    const tony = tonyStupnice(koren, klic);
    const bcka = toninaSBecky(koren);

    const znacky = [];
    const s = struny();
    for (let struna = 0; struna < 6; struna++) {
      for (let prazec = 0; prazec <= this.vyber.prazcu; prazec++) {
        const t = midiNaTon(s[struna] + prazec);
        const poradi = tony.indexOf(t);
        if (poradi < 0) continue;
        const popisek = this.vyber.popisky === "tony" ? nazevTonu(t, bcka)
          : this.vyber.popisky === "stupne" ? String(poradi + 1) : "";
        znacky.push({ struna, prazec, popisek, typ: t === koren ? "koren" : "" });
      }
    }

    const box = q("#hmatnikBox");
    box.innerHTML = diagramHmatniku({ znacky, prazcu: this.vyber.prazcu });
    naKlik(box, ".znackaG", g => {
      Zvuk.brnkni(struny()[Number(g.dataset.struna)] + Number(g.dataset.prazec));
    });

    const molovka = klic === "mol" || klic === "pent_mol" || klic === "harmonicka" || klic === "dorska" || klic === "frygicka";
    const akordy = akordyToniny(koren, molovka);

    q("#hPopis").innerHTML = `
      <h2 class="nadpisSekce">${esc(stupnice.nazev)} od ${esc(nazevTonu(koren, bcka))}</h2>
      <p class="uvod">${esc(stupnice.popis)}</p>
      <p class="uvod">Tóny: ${tony.map(t => `<b>${esc(nazevTonu(t, bcka))}</b>`).join(" – ")}</p>

      <h3 class="nadpisSekce">Akordy, které z ní vyrostou</h3>
      <p class="uvod">Když se ze stupnice berou tóny obden, vzniknou právě tyhle akordy.
         Píseň v této tónině s nimi vystačí.</p>
      <div class="stupneRada">
        ${akordy.map(st => {
          const t = tvaryAkordu(st.akord)[0];
          return `<button class="stupenKarta" type="button" data-hmat="${t ? t.hmat.join(",") : ""}">
            <span class="spec">${esc(st.cislo)}</span>
            <b>${esc(akordNaText(st.akord, bcka))}</b>
            <span class="drobne">${esc(st.funkce)}</span>
          </button>`;
        }).join("")}
      </div>

      <div class="poznamka">
        <b>Jak to použít.</b> Pusťte si v Cvičebně nebo ve Skládání postup akordů z téhle tóniny
        a přes něj hrajte tóny, které tu svítí. Nešlápnete vedle — a to je celý začátek improvizace.
      </div>`;
  },

  prehraj() {
    const tony = tonyStupnice(this.vyber.koren, this.vyber.stupnice);
    const ctx = Zvuk.probud();
    if (!ctx) return;
    /* Stupnice se hraje od základního tónu nahoru přes oktávu. */
    const zaklad = 52 + this.vyber.koren % 12;      // někde kolem třetí struny
    const rada = tony.map(t => zaklad + ((t - this.vyber.koren) % 12 + 12) % 12).sort((a, b) => a - b);
    rada.push(zaklad + 12);
    const kdy = ctx.currentTime + 0.05;
    rada.forEach((m, i) => Zvuk.brnkni(m, kdy + i * 0.28));
  }
});
