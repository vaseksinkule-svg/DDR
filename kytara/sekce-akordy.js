"use strict";
/* ============================================================
   Sekce Akordy

   Slovník hmatů. Otevřené hmaty se berou z připraveného
   seznamu, zbytek se dopočítá posunutím tvarů — proto tu
   najdete i akordy, které v žádné tabulce nejsou.
   ============================================================ */
/* Od nejběžnějšího po nejvzácnější — ne tak, jak to vyjde
   z pořadí klíčů v seznamu druhů. */
const PORADI_DRUHU = ["", "m", "7", "m7", "maj7", "sus4", "sus2", "6", "m6",
                      "add9", "9", "7sus4", "dim", "dim7", "m7b5", "aug", "5"];

registrujSekci({
  id: "akordy",
  nazev: "Akordy",
  popis: "Hmaty, tóny a čím je nahradit",

  vyber: { koren: 0, druh: "", kapodastr: 0 },

  vykresli(kam) {
    kam.innerHTML = `
      <div class="hlava">
        <p class="spec">Slovník hmatů</p>
        <h1>Akordy</h1>
        <p class="uvod">Vyberte akord, nebo ho rovnou napište — třeba <code>F#m7</code> nebo <code>Cmaj7</code>.
           U každého hmatu je vidět, kterým prstem co chytit; klepnutím na diagram si ho poslechnete.</p>
      </div>

      <div class="panel">
        <div class="hledaniAkordu">
          <input id="akordVstup" type="text" placeholder="napište akord, např. Am7" autocomplete="off" spellcheck="false" />
        </div>
        <div class="dlazdice" id="koreny"></div>
        <div class="dlazdice druhy" id="druhy"></div>
      </div>

      <div id="vysledek"></div>`;

    const koreny = q("#koreny", kam);
    koreny.innerHTML = Array.from({ length: 12 }, (_, i) =>
      `<button class="dl" type="button" data-koren="${i}">${esc(nazevTonu(i))}</button>`).join("");
    const druhy = q("#druhy", kam);
    druhy.innerHTML = PORADI_DRUHU.map(d =>
      `<button class="dl" type="button" data-druh="${d}">${esc(d === "" ? "dur" : d)}</button>`).join("");

    naKlik(koreny, "[data-koren]", b => { this.vyber.koren = Number(b.dataset.koren); this.ukaz(); });
    naKlik(druhy, "[data-druh]", b => { this.vyber.druh = b.dataset.druh; this.ukaz(); });

    const vstup = q("#akordVstup", kam);
    vstup.oninput = () => {
      const a = parseAkord(vstup.value);
      if (a) { this.vyber.koren = a.koren; this.vyber.druh = a.druh; this.ukaz(); }
    };

    this.ukaz();
  },

  ukaz() {
    const akord = { koren: this.vyber.koren, druh: this.vyber.druh, bas: null };
    const bcka = toninaSBecky(akord.koren);
    const jmeno = akordNaText(akord, bcka);
    const tvary = tvaryAkordu(akord);
    const druh = DRUHY[akord.druh] || DRUHY[""];
    const tony = tonyAkordu(akord);

    qa("[data-koren]").forEach(b => b.classList.toggle("aktivni", Number(b.dataset.koren) === akord.koren));
    qa("[data-druh]").forEach(b => b.classList.toggle("aktivni", b.dataset.druh === akord.druh));

    const nahrada = NAHRADY[jmeno] || NAHRADY[nazevTonu(akord.koren) + akord.druh];
    const kapo = this.vyber.kapodastr;
    const hmatany = hmatanyAkord(akord, kapo);

    q("#vysledek").innerHTML = `
      <div class="akordHlava">
        <div>
          <h2>${esc(jmeno)}</h2>
          <p class="uvod">${esc(druh.popis)} · zní v něm
            ${tony.map(t => `<b>${esc(nazevTonu(t, bcka))}</b>`).join(", ")}
            (${druh.intervaly.map(popisIntervalu).join(", ")})</p>
        </div>
        <button class="btn hlavni" type="button" data-hmat="${tvary.length ? tvary[0].hmat.join(",") : ""}">Přehrát</button>
      </div>

      ${nahrada ? `<div class="poznamka"><b>Než na to bude ruka:</b> místo ${esc(jmeno)} zkuste
        <b>${esc(nahrada.misto)}</b>. ${esc(nahrada.proc)}</div>` : ""}

      <h3 class="nadpisSekce">Hmaty <span class="drobne">${tvary.length} ${mnozne(tvary.length, "způsob", "způsoby", "způsobů")}, jak ho chytit</span></h3>
      <div class="akordy">
        ${tvary.map(t => kartaAkordu(akord, t, { tony: Stav.nazvyTonu })).join("")}
      </div>

      <h3 class="nadpisSekce">S kapodastrem</h3>
      <div class="panel kapoBox">
        <label>Kapodastr na pražci
          <select id="volbaKapo">${Array.from({ length: 8 }, (_, i) =>
            `<option value="${i}"${i === kapo ? " selected" : ""}>${i === 0 ? "bez kapodastru" : i}</option>`).join("")}
          </select>
        </label>
        <p class="uvod">${kapo === 0
          ? "Kapodastr posune celou kytaru výš. Vyberte pražec a spočítá se, který hmat pak dá tenhle akord."
          : `Aby s kapodastrem na ${kapo}. pražci zněl <b>${esc(jmeno)}</b>, hmatáte
             <b>${esc(akordNaText(hmatany, toninaSBecky(hmatany.koren)))}</b>.`}</p>
        ${kapo === 0 ? "" : `<div class="akordy">${
          tvaryAkordu(hmatany).slice(0, 2).map(t => kartaAkordu(hmatany, t, { tony: Stav.nazvyTonu })).join("")
        }</div>`}
      </div>

      <h3 class="nadpisSekce">Kde tenhle akord doma bývá</h3>
      <p class="uvod">${this.toniny(akord)}</p>`;

    const kapoVolba = q("#volbaKapo");
    if (kapoVolba) kapoVolba.onchange = e => { this.vyber.kapodastr = Number(e.target.value); this.ukaz(); };
  },

  /* Ve kterých tóninách akord vzniká přirozeně ze stupnice. */
  toniny(akord) {
    const zaklad = akord.druh === "m" || akord.druh === "m7" ? "m"
      : akord.druh === "dim" || akord.druh === "m7b5" ? "dim" : "";
    const kde = [];
    for (let k = 0; k < 12; k++) {
      for (const mol of [false, true]) {
        const patri = akordyToniny(k, mol).some(s => s.akord.koren === akord.koren && s.akord.druh === zaklad);
        if (patri) kde.push(nazevTonu(k, toninaSBecky(k)) + (mol ? " moll" : " dur"));
      }
    }
    if (!kde.length) return "Tenhle akord do žádné běžné tóniny přirozeně nepatří — a právě proto zaujme, když ho někam přidáte.";
    return "Přirozeně patří do tónin: <b>" + kde.join("</b>, <b>") + "</b>. V nich ho potkáte nejčastěji.";
  }
});

/* Popis intervalu pro výpis „z čeho je akord složený". */
function popisIntervalu(p) {
  const jmena = {
    0: "základ", 2: "sekunda", 3: "malá tercie", 4: "velká tercie", 5: "kvarta",
    6: "zmenšená kvinta", 7: "kvinta", 8: "zvětšená kvinta", 9: "sexta",
    10: "malá septima", 11: "velká septima", 14: "nóna"
  };
  return jmena[p] || (p + " půltónů");
}
