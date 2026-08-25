"use strict";
/* ============================================================
   Sekce Zpěvník

   Text s akordy v hranatých závorkách. Aplikace ho rozebere
   na kousky, akordy postaví nad slabiky a umí je posunout
   do jiné tóniny nebo přepočítat na hmaty s kapodastrem.

   Vlastní písničky se ukládají do prohlížeče. Vestavěné
   jsou lidové, takže se s nimi nic nemůže stát.
   ============================================================ */

const KLIC_PISNE = "kytara.pisne";

/* Rozbor textu: nadpisy, prázdné řádky a řádky s akordy. */
function parsujPisen(text) {
  return String(text || "").split("\n").map(radek => {
    if (!radek.trim()) return { typ: "mezera" };
    if (radek.trim().startsWith("#")) return { typ: "nadpis", text: radek.replace(/^\s*#+\s*/, "") };

    const casti = [];
    const re = /\[([^\]]*)\]/g;
    let pozice = 0, m;
    while ((m = re.exec(radek))) {
      if (m.index > pozice) casti.push({ akord: null, text: radek.slice(pozice, m.index) });
      casti.push({ akord: m[1].trim(), text: "" });
      pozice = m.index + m[0].length;
    }
    if (pozice < radek.length) casti.push({ akord: null, text: radek.slice(pozice) });

    /* Text patřící k akordu je to, co po něm následuje. */
    const slozene = [];
    for (const c of casti) {
      if (c.akord != null) slozene.push({ akord: c.akord, text: "" });
      else if (slozene.length && slozene[slozene.length - 1].text === "") slozene[slozene.length - 1].text = c.text;
      else slozene.push({ akord: null, text: c.text });
    }
    return { typ: "radek", casti: slozene.length ? slozene : [{ akord: null, text: radek }] };
  });
}

/* Všechny akordy písně v pořadí prvního výskytu. */
function akordyPisne(rozbor) {
  const videno = new Map();
  for (const r of rozbor) {
    if (r.typ !== "radek") continue;
    for (const c of r.casti) {
      if (!c.akord) continue;
      const a = parseAkord(c.akord);
      if (a) {
        const klic = a.koren + "|" + a.druh;
        if (!videno.has(klic)) videno.set(klic, a);
      }
    }
  }
  return Array.from(videno.values());
}

registrujSekci({
  id: "zpevnik",
  nazev: "Zpěvník",
  popis: "Hrát podle textu s akordy",

  otevrena: null,
  posun: 0,
  kapodastr: 0,
  pismo: 1,
  rolovani: 0,
  _rolovac: null,
  _zbytek: 0,

  vlastni() { return nactiStav(KLIC_PISNE, { seznam: [] }).seznam; },
  ulozVlastni(seznam) { ulozStav(KLIC_PISNE, { seznam }); },
  vsechny() { return PISNE.concat(this.vlastni()); },

  vykresli(kam) {
    this.korenEl = kam;
    if (this.otevrena) this.vykresliPisen(kam);
    else this.vykresliSeznam(kam);
  },

  opust() { this.zastavRolovani(); Metronom.stop(); },

  /* ---------- seznam ---------- */
  vykresliSeznam(kam) {
    const vlastni = this.vlastni();
    kam.innerHTML = `
      <div class="hlava">
        <p class="spec">Text a akordy</p>
        <h1>Zpěvník</h1>
        <p class="uvod">Vestavěné písničky jsou lidové — dobré na cvičení, protože jsou krátké a známé.
           Vlastní si přidáte tlačítkem níž; ukládají se do tohoto prohlížeče a nikam se neodesílají.</p>
      </div>

      <div class="radaTlacitek">
        <button class="btn hlavni" id="novaPisen" type="button">Přidat písničku</button>
      </div>

      <h2 class="nadpisSekce">Vestavěné</h2>
      <div class="seznamKaret">
        ${PISNE.map(p => this.karta(p)).join("")}
      </div>

      <h2 class="nadpisSekce">Moje písničky <span class="drobne">${vlastni.length ? vlastni.length + " uloženo" : "zatím žádné"}</span></h2>
      <div class="seznamKaret">
        ${vlastni.length ? vlastni.map(p => this.karta(p)).join("")
          : `<p class="uvod">Tady se objeví, co si sem vložíte. Text z internetu stačí zkopírovat —
             akordy v hranatých závorkách aplikace pozná sama.</p>`}
      </div>`;

    naKlik(kam, "[data-pisen]", el => { this.otevri(el.dataset.pisen); });
    q("#novaPisen", kam).onclick = () => this.uprav(null);
  },

  karta(p) {
    const akordy = akordyPisne(parsujPisen(p.text)).map(a => akordNaText(a)).slice(0, 6);
    return `<button class="karta klikaci" type="button" data-pisen="${esc(p.id)}">
      <span class="spec">${esc(p.autor)}${p.tonina ? " · " + esc(p.tonina) : ""}</span>
      <b>${esc(p.nazev)}</b>
      <span class="drobne">${esc(akordy.join("  "))}</span>
    </button>`;
  },

  otevri(id) {
    this.otevrena = this.vsechny().find(p => p.id === id) || null;
    this.posun = 0;
    this.kapodastr = 0;
    this.zastavRolovani();
    this.vykresli(this.korenEl);
  },

  /* ---------- otevřená píseň ---------- */
  vykresliPisen(kam) {
    const p = this.otevrena;
    const rozbor = parsujPisen(p.text);
    const znejici = akordyPisne(rozbor).map(a => transponujAkord(a, this.posun));
    const hmatane = znejici.map(a => hmatanyAkord(a, this.kapodastr));
    const navrhy = doporucKapodastr(znejici);
    const nejlepsi = navrhy[0];
    const rytmus = RYTMY.find(r => r.id === p.rytmus);

    kam.innerHTML = `
      <div class="hlava pisenHlava">
        <button class="btn tise" id="zpetSeznam" type="button">← Zpěvník</button>
        <div>
          <p class="spec">${esc(p.autor)}</p>
          <h1>${esc(p.nazev)}</h1>
        </div>
      </div>

      <div class="panel ovladani noprint">
        <div class="ovlSkupina">
          <span class="spec">Tónina</span>
          <button class="btn maly" data-posun="-1" type="button">−</button>
          <span class="hodnota fig" id="posunPopis">${this.posun > 0 ? "+" : ""}${this.posun}</span>
          <button class="btn maly" data-posun="1" type="button">+</button>
        </div>
        <div class="ovlSkupina">
          <span class="spec">Kapodastr</span>
          <select id="volbaKapo">${Array.from({ length: 8 }, (_, i) =>
            `<option value="${i}"${i === this.kapodastr ? " selected" : ""}>${i === 0 ? "bez" : i + ". pražec"}</option>`).join("")}</select>
        </div>
        <div class="ovlSkupina">
          <span class="spec">Rolování</span>
          <input id="rychlostRolovani" type="range" min="0" max="10" step="1" value="${this.rolovani}" />
        </div>
        <div class="ovlSkupina">
          <span class="spec">Písmo</span>
          <button class="btn maly" data-pismo="-1" type="button">A−</button>
          <button class="btn maly" data-pismo="1" type="button">A+</button>
        </div>
        <span class="grow"></span>
        <button class="btn" id="btnMetronom" type="button">Metronom ${p.tempo || 100}</button>
        <button class="btn tise" id="upravPisen" type="button">Upravit</button>
      </div>

      <div class="panel akordyPasu">
        <div class="akordy male">
          ${hmatane.map(a => {
            const t = tvaryAkordu(a)[0];
            return t ? kartaAkordu(a, t, { nadpis: akordNaText(a, toninaSBecky(a.koren)) }) : "";
          }).join("")}
        </div>
        <p class="drobne">
          ${this.kapodastr > 0
            ? `Hmaty platí pro kapodastr na <b>${this.kapodastr}. pražci</b>. Zní to jako
               ${znejici.map(a => esc(akordNaText(a))).join(", ")}.`
            : (nejlepsi && nejlepsi.prazec > 0 && nejlepsi.snadnych > ohodnotKapodastr(znejici, 0)
              ? `Tip: s kapodastrem na <b>${nejlepsi.prazec}. pražci</b> vyjde ${nejlepsi.snadnych} z ${nejlepsi.celkem} akordů na otevřený hmat.`
              : "Všechny akordy jdou zahrát bez kapodastru.")}
        </p>
      </div>

      ${rytmus ? `<p class="uvod rytmusTip"><b>Rytmus:</b> ${esc(rytmus.nazev)} —
        <span class="vzorec">${rytmus.vzor.map(v => vzorZnak(v)).join(" ")}</span>. ${esc(rytmus.popis)}</p>` : ""}

      ${p.poznamka ? `<div class="poznamka">${esc(p.poznamka)}</div>` : ""}

      <article class="pisen" id="pisenText" style="font-size:${this.pismo}rem">
        ${rozbor.map(r => this.radek(r)).join("")}
      </article>`;

    q("#zpetSeznam", kam).onclick = () => { this.otevrena = null; this.zastavRolovani(); this.vykresli(kam); };
    q("#upravPisen", kam).onclick = () => this.uprav(p);
    q("#volbaKapo", kam).onchange = e => { this.kapodastr = Number(e.target.value); this.vykresli(kam); };
    q("#rychlostRolovani", kam).oninput = e => this.nastavRolovani(Number(e.target.value));
    naKlik(kam, "[data-posun]", b => { this.posun += Number(b.dataset.posun); this.vykresli(kam); });
    naKlik(kam, "[data-pismo]", b => {
      this.pismo = Math.max(0.75, Math.min(2, this.pismo + Number(b.dataset.pismo) * 0.1));
      q("#pisenText", kam).style.fontSize = this.pismo + "rem";
    });
    q("#btnMetronom", kam).onclick = e => {
      if (Metronom.bezi) { Metronom.stop(); e.target.classList.remove("aktivni"); }
      else { Metronom.start({ tempo: p.tempo || 100, doby: rytmus ? rytmus.takt : 4, deleni: 1 }); e.target.classList.add("aktivni"); }
    };
  },

  radek(r) {
    if (r.typ === "mezera") return `<div class="mezera"></div>`;
    if (r.typ === "nadpis") return `<h3 class="castPisne">${esc(r.text)}</h3>`;

    let ven = `<div class="radek">`;
    let otevrenaSkupina = false;
    for (const c of r.casti) {
      const a = c.akord ? parseAkord(c.akord) : null;
      const znejici = a ? transponujAkord(a, this.posun) : null;
      const hmatany = znejici ? hmatanyAkord(znejici, this.kapodastr) : null;
      const jmeno = hmatany ? akordNaText(hmatany, toninaSBecky(hmatany.koren)) : (c.akord || "");
      const tvar = hmatany ? tvaryAkordu(hmatany)[0] : null;

      /* Mezera na konci úseku se z něj vyjme a napíše se až za
         skupinu — jinak by se sečetla s odsazením akordu. */
      const konciMezerou = /\s$/.test(c.text);
      const textUseku = konciMezerou ? c.text.replace(/\s$/, "") : c.text;

      if (!otevrenaSkupina) { ven += `<span class="slovo">`; otevrenaSkupina = true; }
      ven += `<span class="usek">`;
      if (c.akord) {
        ven += tvar
          ? `<button class="akordNad" type="button" data-hmat="${tvar.hmat.join(",")}">${esc(jmeno)}</button>`
          : `<span class="akordNad neznamy">${esc(c.akord)}</span>`;
      } else {
        ven += `<span class="akordNad prazdny"></span>`;
      }
      ven += `<span class="slabika">${esc(textUseku) || "&nbsp;"}</span></span>`;

      /* Zalomit se smí jen tam, kde je v textu mezera. */
      if (konciMezerou) { ven += `</span> `; otevrenaSkupina = false; }
    }
    if (otevrenaSkupina) ven += `</span>`;
    return ven + `</div>`;
  },

  /* ---------- automatické rolování ---------- */
  nastavRolovani(rychlost) {
    this.rolovani = rychlost;
    this.zastavRolovani();
    if (!rychlost) return;
    const stage = q("#stage");
    const krok = () => {
      /* Pixely se sčítají po zlomcích, jinak by pomalé rolování stálo. */
      this._zbytek += rychlost * 0.28;
      const cele = Math.floor(this._zbytek);
      if (cele) { stage.scrollTop += cele; this._zbytek -= cele; }
      this._rolovac = requestAnimationFrame(krok);
    };
    this._rolovac = requestAnimationFrame(krok);
  },

  zastavRolovani() {
    if (this._rolovac) cancelAnimationFrame(this._rolovac);
    this._rolovac = null;
    this._zbytek = 0;
  },

  /* ---------- úpravy ---------- */
  uprav(p) {
    const kam = this.korenEl;
    const nova = !p;
    const vlastniPisen = p && this.vlastni().some(x => x.id === p.id);
    const predloha = p || { id: "", nazev: "", autor: "vlastní", tonina: "", tempo: 100, rytmus: "nej", text: "# Sloka\n[C]Sem přijde text s [G]akordy\n" };

    this.zastavRolovani();
    kam.innerHTML = `
      <div class="hlava">
        <button class="btn tise" id="zpetPisen" type="button">← Zpět</button>
        <h1>${nova ? "Nová písnička" : "Upravit"}</h1>
        <p class="uvod">Akordy se píší do hranatých závorek přímo do textu, těsně před slabiku,
           na které se mění. Řádek začínající <code>#</code> je název části.</p>
      </div>

      <div class="panel">
        <div class="pole">
          <label>Název<input id="eNazev" type="text" value="${esc(predloha.nazev)}" /></label>
          <label>Autor<input id="eAutor" type="text" value="${esc(predloha.autor)}" /></label>
          <label>Tempo<input id="eTempo" type="number" min="40" max="220" value="${predloha.tempo || 100}" /></label>
          <label>Rytmus
            <select id="eRytmus">${RYTMY.map(r =>
              `<option value="${r.id}"${r.id === predloha.rytmus ? " selected" : ""}>${esc(r.nazev)}</option>`).join("")}</select>
          </label>
        </div>
        <label class="siroke">Text s akordy
          <textarea id="eText" rows="16" spellcheck="false">${esc(predloha.text)}</textarea>
        </label>
        <div class="radaTlacitek">
          <button class="btn hlavni" id="eUloz" type="button">Uložit</button>
          ${vlastniPisen ? `<button class="btn" id="eSmaz" type="button">Smazat</button>` : ""}
          ${!nova && !vlastniPisen ? `<p class="drobne">Vestavěná písnička se neztratí — uložením vznikne vaše vlastní kopie.</p>` : ""}
        </div>
      </div>`;

    q("#zpetPisen", kam).onclick = () => this.vykresli(kam);
    q("#eUloz", kam).onclick = () => {
      const nazev = q("#eNazev").value.trim() || "Bez názvu";
      const zaznam = {
        id: vlastniPisen ? predloha.id : "moje-" + Date.now().toString(36),
        nazev,
        autor: q("#eAutor").value.trim() || "vlastní",
        tempo: Number(q("#eTempo").value) || 100,
        rytmus: q("#eRytmus").value,
        text: q("#eText").value,
        vlastni: true
      };
      const seznam = this.vlastni().filter(x => x.id !== zaznam.id);
      seznam.push(zaznam);
      this.ulozVlastni(seznam);
      this.otevrena = zaznam;
      this.vykresli(kam);
    };
    const smaz = q("#eSmaz", kam);
    if (smaz) smaz.onclick = () => {
      if (!confirm("Opravdu smazat „" + predloha.nazev + "“?")) return;
      this.ulozVlastni(this.vlastni().filter(x => x.id !== predloha.id));
      this.otevrena = null;
      this.vykresli(kam);
    };
  }
});

/* Šipky rytmu pro nápovědu u písně. */
function vzorZnak(v) {
  return v === "D" ? "↓" : v === "U" ? "↑" : v === "B" ? "•" : v === "P" ? "≈" : "·";
}
