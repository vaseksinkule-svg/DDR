"use strict";
/* ============================================================
   Kytara — zvuk

   Struna se nepřehrává z nahrávky, ale počítá se. Krátký šum
   se pouští dokola smyčkou, která ho při každém průchodu
   trochu ztlumí a zaoblí — z šumu se tím stane tón, který
   dozní jako drnknutá struna. (Karplus–Strong.)

   Díky tomu má aplikace zvuk všech tónů a přitom neváží nic
   navíc a funguje i bez připojení.

   Prohlížeč pustí zvuk až po prvním doteku uživatele, proto
   se zvuková část zapíná v `probud()` při prvním kliknutí.
   ============================================================ */

const Zvuk = {
  ctx: null,
  master: null,
  pamet: new Map(),      // vyrobené struny podle tónu
  hlasitost: 0.9,

  probud() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();

      /* Tělo kytary: ubere ostré výšky a podrží hlasitost na uzdě,
         aby šestistrunný akord nepraskal. */
      const filtr = this.ctx.createBiquadFilter();
      filtr.type = "lowpass";
      filtr.frequency.value = 5200;

      const stlac = this.ctx.createDynamicsCompressor();
      stlac.threshold.value = -18;
      stlac.ratio.value = 4;

      this.master = this.ctx.createGain();
      this.master.gain.value = this.hlasitost;

      this.master.connect(filtr);
      filtr.connect(stlac);
      stlac.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  },

  nastavHlasitost(v) {
    this.hlasitost = v;
    if (this.master) this.master.gain.value = v;
  },

  ted() { return this.ctx ? this.ctx.currentTime : 0; },

  /* ---------- výroba struny ---------- */
  struna(midi) {
    if (this.pamet.has(midi)) return this.pamet.get(midi);
    const ctx = this.ctx;
    const sr = ctx.sampleRate;
    const hz = midiNaHz(midi);
    const delka = Math.min(3.4, 1.4 + 140 / hz);      // basy dozní déle
    const N = Math.max(2, Math.round(sr / hz));
    const buf = ctx.createBuffer(1, Math.ceil(sr * delka), sr);
    const ven = buf.getChannelData(0);

    /* Rozkmit: šum lehce vyhlazený, aby drnknutí nebylo skřípavé. */
    const smycka = new Float32Array(N);
    let predchozi = 0;
    for (let i = 0; i < N; i++) {
      const sum = Math.random() * 2 - 1;
      predchozi = (sum + predchozi * 2) / 3;
      smycka[i] = predchozi;
    }

    /* Vyšší tóny doznívají rychleji — stejně jako na nástroji. */
    const utlum = Math.max(0.986, 0.9995 - hz / 90000);
    let idx = 0, minule = 0;
    for (let n = 0; n < ven.length; n++) {
      const v = smycka[idx];
      ven[n] = v;
      smycka[idx] = (v + minule) * 0.5 * utlum;
      minule = v;
      idx = (idx + 1) % N;
    }

    /* Konec se zatáhne do ztracena, ať to nelupne. */
    const dozniv = Math.floor(sr * 0.25);
    for (let n = ven.length - dozniv; n < ven.length; n++) {
      ven[n] *= (ven.length - n) / dozniv;
    }

    this.pamet.set(midi, buf);
    return buf;
  },

  /* ---------- jednotlivý tón ---------- */
  brnkni(midi, kdy, hlasitost) {
    const ctx = this.probud();
    if (!ctx) return;
    if (midi < 28 || midi > 96) return;
    const zdroj = ctx.createBufferSource();
    zdroj.buffer = this.struna(Math.round(midi));
    const g = ctx.createGain();
    g.gain.value = (hlasitost == null ? 1 : hlasitost) * 0.5;
    zdroj.connect(g);
    g.connect(this.master);
    zdroj.start(kdy == null ? ctx.currentTime : kdy);
    return zdroj;
  },

  /* ---------- akord ----------
     Struny se nerozezní naráz: trsátko po nich sjede, a právě
     to malé zpoždění dělá zvuk kytarou. */
  akord(tony, moznosti) {
    const ctx = this.probud();
    if (!ctx || !tony.length) return;
    const m = moznosti || {};
    const kdy = m.kdy == null ? ctx.currentTime : m.kdy;
    const rozjezd = m.rozjezd == null ? 0.022 : m.rozjezd;
    const nahoru = m.smer === "nahoru";          // od vysokých strun zpět
    const razeno = nahoru ? tony.slice().reverse() : tony.slice();
    razeno.forEach((t, i) => {
      const hl = (m.hlasitost == null ? 1 : m.hlasitost) * (nahoru ? 0.75 : 1);
      this.brnkni(t, kdy + i * rozjezd, hl);
    });
  },

  /* ---------- hmat rovnou z diagramu ---------- */
  hmat(hmat, moznosti) {
    this.akord(hmatNaTony(hmat), moznosti);
  },

  /* ---------- čistý referenční tón (ladění po sluchu) ---------- */
  ton(midi, delka) {
    const ctx = this.probud();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = midiNaHz(midi);
    const t = ctx.currentTime;
    const d = delka || 1.6;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.28, t + 0.03);
    g.gain.setValueAtTime(0.28, t + d - 0.25);
    g.gain.linearRampToValueAtTime(0, t + d);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + d + 0.05);
  },

  /* ---------- klapnutí metronomu ---------- */
  klik(kdy, silny) {
    const ctx = this.probud();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.value = silny ? 1600 : 1000;
    const t = kdy == null ? ctx.currentTime : kdy;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(silny ? 0.5 : 0.26, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + 0.08);
  }
};

/* ============================================================
   METRONOM

   Časovače v prohlížeči se zdržují — o desítky milisekund,
   což je u rytmu slyšet. Proto se doby dopředu objednávají
   ve zvukové kartě a časovač jen dohlíží, aby byla objednávka
   pořád o kousek napřed.
   ============================================================ */
const Metronom = {
  bezi: false,
  tempo: 90,
  doby: 4,
  deleni: 1,          // 1 = na doby, 2 = osminy, 3 = triola, 4 = šestnáctiny
  doba: 0,
  _dalsi: 0,
  _casovac: null,
  _naDobu: null,

  start(nastaveni) {
    Object.assign(this, nastaveni || {});
    const ctx = Zvuk.probud();
    if (!ctx || this.bezi) return;
    this.bezi = true;
    this.doba = 0;
    this._dalsi = ctx.currentTime + 0.08;
    this._casovac = setInterval(() => this._objednej(), 25);
    this._objednej();
  },

  stop() {
    this.bezi = false;
    clearInterval(this._casovac);
    this._casovac = null;
  },

  prepni(nastaveni) {
    const bezelo = this.bezi;
    this.stop();
    Object.assign(this, nastaveni || {});
    if (bezelo) this.start();
  },

  /* Kolik sekund trvá jeden krok. */
  krok() { return 60 / this.tempo / this.deleni; },

  _objednej() {
    const ctx = Zvuk.ctx;
    if (!ctx || !this.bezi) return;
    while (this._dalsi < ctx.currentTime + 0.12) {
      const naDobe = this.doba % this.deleni === 0;
      const cislo = Math.floor(this.doba / this.deleni) % this.doby;
      if (naDobe || this.deleni > 1) {
        Zvuk.klik(this._dalsi, naDobe && cislo === 0);
      }
      if (this._naDobu) this._naDobu(cislo, naDobe, this._dalsi);
      this._dalsi += this.krok();
      this.doba++;
    }
  }
};

/* ============================================================
   LADIČKA

   Z mikrofonu přijde tvar vlny. Autokorelace hledá, po kolika
   vzorcích se tvar nejvíc podobá sám sobě — z toho vyjde
   perioda a z periody výška tónu.
   ============================================================ */
const Ladicka = {
  bezi: false,
  _proud: null,
  _analyza: null,
  _data: null,
  _smycka: null,

  async start(naVzorek) {
    const ctx = Zvuk.probud();
    if (!ctx) throw new Error("Prohlížeč neumí zvuk.");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Prohlížeč nepouští mikrofon.");
    }
    this._proud = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
    });
    const vstup = ctx.createMediaStreamSource(this._proud);
    this._analyza = ctx.createAnalyser();
    this._analyza.fftSize = 4096;
    vstup.connect(this._analyza);
    this._data = new Float32Array(this._analyza.fftSize);
    this.bezi = true;

    let snimek = 0;
    const tik = () => {
      if (!this.bezi) return;
      if (snimek++ % 3 === 0) {
        this._analyza.getFloatTimeDomainData(this._data);
        naVzorek(this.zmer(this._data, ctx.sampleRate));
      }
      this._smycka = requestAnimationFrame(tik);
    };
    tik();
  },

  stop() {
    this.bezi = false;
    if (this._smycka) cancelAnimationFrame(this._smycka);
    if (this._proud) this._proud.getTracks().forEach(t => t.stop());
    this._proud = null;
    this._analyza = null;
  },

  /* Vrátí { hz, hlasitost } nebo { hz: null } když nic nehraje. */
  zmer(vzorky, sr) {
    const n = vzorky.length;
    let energie = 0;
    for (let i = 0; i < n; i++) energie += vzorky[i] * vzorky[i];
    const hlasitost = Math.sqrt(energie / n);
    if (hlasitost < 0.006) return { hz: null, hlasitost };

    /* Rozsah kytary s rezervou: od 60 Hz po 1300 Hz. */
    const maxP = Math.min(Math.floor(sr / 60), n >> 1);
    const minP = Math.max(2, Math.floor(sr / 1300));
    const okno = n - maxP;
    if (okno < 256) return { hz: null, hlasitost };

    let normA = 0;
    for (let i = 0; i < okno; i++) normA += vzorky[i] * vzorky[i];

    const shody = new Float32Array(maxP + 1);
    let nejvic = 0;
    for (let p = minP; p <= maxP; p++) {
      let soucet = 0, normB = 0;
      for (let i = 0; i < okno; i++) {
        const b = vzorky[i + p];
        soucet += vzorky[i] * b;
        normB += b * b;
      }
      const shoda = soucet / (Math.sqrt(normA * normB) + 1e-12);
      shody[p] = shoda;
      if (shoda > nejvic) nejvic = shoda;
    }
    if (nejvic < 0.55) return { hz: null, hlasitost };

    /* Nejsilnější shoda bývá i na dvojnásobku periody, což by
       hlásilo tón o oktávu níž. Proto se bere první vrchol,
       který se tomu nejsilnějšímu aspoň blíží. */
    const prah = nejvic * 0.86;
    let perioda = -1;
    for (let p = minP + 1; p < maxP; p++) {
      if (shody[p] >= prah && shody[p] >= shody[p - 1] && shody[p] >= shody[p + 1]) { perioda = p; break; }
    }
    if (perioda < 0) return { hz: null, hlasitost };

    /* Vrchol leží obvykle mezi vzorky — parabola ho najde přesněji. */
    const a = shody[perioda - 1], b = shody[perioda], c = shody[perioda + 1];
    const posun = (2 * b - a - c) === 0 ? 0 : (0.5 * (a - c)) / (a - 2 * b + c);
    return { hz: sr / (perioda + posun), hlasitost, jistota: b };
  }
};
