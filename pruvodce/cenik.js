"use strict";
/* ============================================================
   CENÍK
   Všechny částky jsou ZÁSTUPNÉ a slouží jen k ukázce chování.
   Skutečné ceny se doplní sem — struktura zůstane stejná.
   Ceny jsou bez DPH, v korunách.
   ============================================================ */

const DPH = 0.12;          // snížená sazba pro stavební práce na bydlení
const PROJEKT = 0.04;      // projekt a inženýring, % z prací
const KOORDINACE = 0.08;   // vedení stavby a koordinace řemesel

/* barva vzorku — zástupná plocha za budoucí fotografii materiálu */
const KROKY = [
  {
    id: "bourani",
    nazev: "Bourání a příprava",
    perex: "Než se začne stavět, musí se vyklidit. Rozsah bouracích prací určuje, kolik z původního bytu zůstane.",
    volby: [
      {
        id: "rozsah_bourani", nazev: "Rozsah bouracích prací", jednotka: "m²",
        mnozstvi: { zdroj: "plocha", koef: 1, popisek: "Plocha bytu" },
        stupne: [
          { id: "dilci",  nazev: "Dílčí úpravy",        material: "Vybrané místnosti", barva: "#8d8579", popis: "Vybourání jen tam, kde se mění dispozice. Zbytek bytu zůstává.", cena: 850 },
          { id: "komplet", nazev: "Kompletní vyklizení", material: "Celý byt",         barva: "#6f6a5f", popis: "Podlahy, obklady, zařizovací předměty a rozvody dolů až na nosné konstrukce.", cena: 1350 },
          { id: "jadro",  nazev: "Včetně bytového jádra", material: "S jádrem",        barva: "#544f45", popis: "Kompletní vyklizení a odstranění umakartového nebo zděného jádra.", cena: 1950 }
        ]
      }
    ],
    doplnky: [
      { id: "pricka",    nazev: "Nová dělicí příčka",  popis: "Sádrokarton nebo zdivo", cena: 3200, jednotka: "bm", pocitatelny: true, vychozi: 4 },
      { id: "kontejner", nazev: "Odvoz a likvidace suti", popis: "Kontejner včetně poplatku", cena: 8900, jednotka: "ks", pocitatelny: true, vychozi: 2 },
      { id: "vymera",    nazev: "Zaměření a pasport bytu", popis: "Podklad pro projekt", cena: 12000 }
    ]
  },

  {
    id: "elektro",
    nazev: "Elektroinstalace",
    perex: "Rozvody se schovají do stěn na dalších třicet let. Tady se rozhoduje, kolik zásuvek a jaké vypínače zákazník bude mít.",
    volby: [
      {
        id: "rozvody_el", nazev: "Rozsah rozvodů", jednotka: "m²",
        mnozstvi: { zdroj: "plocha", koef: 1, popisek: "Plocha bytu" },
        stupne: [
          { id: "castecna", nazev: "Částečná výměna",  material: "Doplnění", barva: "#a8894b", popis: "Zachování páteřních rozvodů, výměna jen v dotčených místnostech.", cena: 1100 },
          { id: "komplet",  nazev: "Kompletní rozvody", material: "Vše nové", barva: "#8a6b2f", popis: "Nové vedení v celém bytě včetně nového rozvaděče a revize.", cena: 1850 },
          { id: "chytra",   nazev: "S přípravou pro chytrou domácnost", material: "Vše nové + sběrnice", barva: "#6d5220", popis: "Nové rozvody a navíc kabeláž pro ovládání osvětlení, žaluzií a topení.", cena: 2600 }
        ]
      },
      {
        id: "vypinace", nazev: "Vypínače a zásuvky", jednotka: "ks",
        mnozstvi: { zdroj: "plocha", koef: 0.7, popisek: "Počet vývodů" },
        stupne: [
          { id: "std",  nazev: "Standard",        material: "Bílý plast",   barva: "#d7d2c6", popis: "Osvědčená řada v bílé, běžná v nové výstavbě.", cena: 190 },
          { id: "desig", nazev: "Designová řada", material: "Barevné rámečky", barva: "#9aa39b", popis: "Rámečky v barvě podle interiéru, plochý design.", cena: 420 },
          { id: "kov",  nazev: "Kov nebo sklo",   material: "Broušený kov", barva: "#6a6f6c", popis: "Kovové nebo skleněné rámečky, bezšroubové provedení.", cena: 890 }
        ]
      }
    ],
    doplnky: [
      { id: "rozvadec", nazev: "Nový rozvaděč včetně revize", popis: "Jističe, proudové chrániče, protokol", cena: 18900 },
      { id: "svetla",   nazev: "Návrh osvětlení",             popis: "Rozmístění světel a scén po místnostech", cena: 9500 }
    ]
  },

  {
    id: "voda",
    nazev: "Voda a topení",
    perex: "Rozvody vody, odpadů a způsob vytápění. Podlahové topení se musí rozhodnout teď — potom už se do podlahy nedostaneme.",
    volby: [
      {
        id: "rozvody_voda", nazev: "Rozvody vody a odpadů", jednotka: "m²",
        mnozstvi: { zdroj: "plocha", koef: 1, popisek: "Plocha bytu" },
        stupne: [
          { id: "napojeni", nazev: "Napojení na stávající", material: "Minimální zásah", barva: "#7f95a1", popis: "Původní stoupačky i rozvody zůstávají, mění se jen koncové body.", cena: 480 },
          { id: "nove",     nazev: "Kompletní nové rozvody", material: "Vše nové",       barva: "#5c7684", popis: "Nové rozvody vody i odpadů v celém bytě, včetně tlakové zkoušky.", cena: 980 },
          { id: "nove_izo", nazev: "Nové rozvody s izolací a filtrací", material: "Vše nové + úprava vody", barva: "#415b6a", popis: "Navíc odhlučnění odpadů a filtrace nebo změkčení vody.", cena: 1450 }
        ]
      },
      {
        id: "topeni", nazev: "Vytápění", jednotka: "kompl.",
        stupne: [
          { id: "stavajici", nazev: "Ponechat stávající", material: "Bez zásahu", barva: "#9d9689", popis: "Radiátory zůstávají, případně se jen očistí a natřou.", cena: 0, nic: true },
          { id: "radiatory", nazev: "Nové radiátory",     material: "Deskové",    barva: "#a8613f", popis: "Výměna všech těles včetně termostatických hlavic.", cena: 46000 },
          { id: "podlahove", nazev: "Podlahové vytápění", material: "Teplovodní", barva: "#8c4726", popis: "Rozvody v podlaze po celém bytě, regulace po místnostech.", cena: 128000 }
        ]
      }
    ],
    doplnky: [
      { id: "zebrik",  nazev: "Topný žebřík do koupelny", popis: "Včetně elektrické patrony", cena: 12500 },
      { id: "ohrivac", nazev: "Nový ohřívač vody",        popis: "Zásobník nebo průtokový",   cena: 22000 }
    ]
  },

  {
    id: "koupelna",
    nazev: "Koupelna a WC",
    perex: "Nejdražší metr čtvereční v bytě. Rozdíl mezi stupni je tu vidět na první pohled a zákazník ho denně používá.",
    volby: [
      {
        id: "obklady", nazev: "Obklady a dlažba", jednotka: "m²",
        mnozstvi: { zdroj: "rucne", vychozi: 28, krok: 1, min: 4, max: 90, popisek: "Plocha obkladů" },
        stupne: [
          { id: "std", nazev: "Standard",  material: "Keramika 30×60",     barva: "#cfc7b8", popis: "Běžný formát ze skladových sérií, spárování v odstínu obkladu.", cena: 690 },
          { id: "kom", nazev: "Komfort",   material: "Velkoformát 60×120", barva: "#a8a094", popis: "Větší formát, méně spár, kombinace matné a lesklé plochy.", cena: 1250 },
          { id: "pre", nazev: "Prémium",   material: "Spékaná keramika",   barva: "#4f4d49", popis: "Velkoformátové desky s kresbou kamene, minimum spár, řezané na míru.", cena: 2400 }
        ]
      },
      {
        id: "sanita", nazev: "Sanita a baterie", jednotka: "kompl.",
        stupne: [
          { id: "std", nazev: "Standard", material: "Sériová sanita", barva: "#c3cbcd", popis: "Umyvadlo, WC, baterie z běžné řady. Spolehlivé, bez ambicí.", cena: 38000 },
          { id: "kom", nazev: "Komfort",  material: "Značková řada",  barva: "#94a3a7", popis: "Značková sanita, podomítkové baterie, kvalitnější kování.", cena: 72000 },
          { id: "pre", nazev: "Prémium",  material: "Designová řada", barva: "#5f6f73", popis: "Designová sanita, umyvadlo na desce, baterie v černé nebo mosazi.", cena: 145000 }
        ]
      },
      {
        id: "sprcha", nazev: "Sprcha a vana", jednotka: "kompl.",
        stupne: [
          { id: "kout",   nazev: "Sprchový kout",   material: "Vanička + zástěna", barva: "#b9c2c4", popis: "Akrylátová vanička a skleněná zástěna.", cena: 24000 },
          { id: "walkin", nazev: "Walk-in sprcha",  material: "Zapuštěná",         barva: "#8b989b", popis: "Sprcha v úrovni podlahy s liniovým žlabem, pevná skleněná stěna.", cena: 48000 },
          { id: "obe",    nazev: "Vana i sprcha",   material: "Obojí",             barva: "#5d6c70", popis: "Volně stojící nebo zapuštěná vana a samostatný sprchový kout.", cena: 76000 }
        ]
      }
    ],
    doplnky: [
      { id: "zavesne", nazev: "Závěsné WC s podomítkovou nádržkou", popis: "Včetně ovládacího tlačítka", cena: 19500 },
      { id: "zrcadlo", nazev: "Zrcadlo s podsvícením",             popis: "Na míru, s odmlžováním",     cena: 9800 },
      { id: "nabytek", nazev: "Koupelnový nábytek na míru",        popis: "Skříňka pod umyvadlo a vysoká skříň", cena: 34000 }
    ]
  },

  {
    id: "kuchyne",
    nazev: "Kuchyně",
    perex: "Linka, deska a spotřebiče se počítají zvlášť — zákazník tak vidí, kde se dá ubrat a kde se vyplatí přidat.",
    volby: [
      {
        id: "linka", nazev: "Kuchyňská linka", jednotka: "bm",
        mnozstvi: { zdroj: "rucne", vychozi: 4, krok: 0.5, min: 1, max: 14, popisek: "Délka linky" },
        stupne: [
          { id: "std", nazev: "Standard", material: "Lamino",        barva: "#c9b596", popis: "Laminátová dvířka, kování s tlumením, korpus z dřevotřísky.", cena: 9500 },
          { id: "kom", nazev: "Komfort",  material: "Lakované MDF",  barva: "#9d8460", popis: "Lakovaná dvířka v matu, plnovýsuvy, vnitřní organizace zásuvek.", cena: 16500 },
          { id: "pre", nazev: "Prémium",  material: "Dýha nebo dub", barva: "#6f5636", popis: "Dýhovaná nebo masivní čela, bezúchytkové otevírání, vše na míru.", cena: 28000 }
        ]
      },
      {
        id: "deska", nazev: "Pracovní deska", jednotka: "bm",
        mnozstvi: { zdroj: "volba", volba: "linka", popisek: "Podle délky linky" },
        stupne: [
          { id: "lam", nazev: "Laminát",   material: "Postforming",   barva: "#bdb2a2", popis: "Odolná a levná, široký výběr dekorů.", cena: 1900 },
          { id: "kom", nazev: "Kompakt",   material: "Kompaktní deska", barva: "#7d7a74", popis: "Tenká deska bez viditelné hrany, odolná vodě i teplu.", cena: 4800 },
          { id: "kam", nazev: "Kámen",     material: "Spékaná keramika", barva: "#4b4a48", popis: "Kámen nebo spékaná keramika, dřez zapuštěný pod desku.", cena: 9500 }
        ]
      },
      {
        id: "spotrebice", nazev: "Spotřebiče", jednotka: "sada",
        stupne: [
          { id: "std", nazev: "Základní sada", material: "4 spotřebiče",  barva: "#b6bcbe", popis: "Deska, trouba, digestoř a myčka z výhodné řady.", cena: 46000 },
          { id: "kom", nazev: "Značková sada", material: "6 spotřebičů",  barva: "#868e91", popis: "Indukce, horkovzdušná trouba, tichá myčka, vestavná lednice.", cena: 92000 },
          { id: "pre", nazev: "Prémiová sada", material: "Vestavné plně", barva: "#4e5457", popis: "Indukce s odsáváním, parní trouba, vinotéka, plně integrovaná myčka.", cena: 185000 }
        ]
      }
    ],
    doplnky: [
      { id: "ostruvek", nazev: "Kuchyňský ostrůvek", popis: "Včetně napojení vody nebo odsávání", cena: 42000 },
      { id: "obklad_k", nazev: "Obklad za linkou",   popis: "Sklo nebo keramika na míru",         cena: 14500 },
      { id: "drez",     nazev: "Kompozitový dřez a baterie", popis: "Podstavný dřez, vytahovací baterie", cena: 12000 }
    ]
  },

  {
    id: "podlahy",
    nazev: "Podlahy a dveře",
    perex: "Podlaha je největší souvislá plocha v bytě — proto se na ní rozdíl v ceně projeví nejvíc.",
    volby: [
      {
        id: "krytina", nazev: "Podlahová krytina", jednotka: "m²",
        mnozstvi: { zdroj: "plocha", koef: 0.85, popisek: "Plocha krytiny" },
        stupne: [
          { id: "vinyl", nazev: "Vinyl nebo laminát", material: "Vinyl click",   barva: "#c2ab8c", popis: "Odolné proti vodě i škrábancům, rychlá pokládka.", cena: 890 },
          { id: "drevo", nazev: "Vícevrstvá dřevěná", material: "Dub třívrstvý", barva: "#a37f52", popis: "Pravá dřevěná nášlapná vrstva, lze přebrousit.", cena: 1750 },
          { id: "masiv", nazev: "Masiv nebo velkoformát", material: "Masiv / dlažba", barva: "#75542f", popis: "Masivní dřevo nebo velkoformátová dlažba s kresbou kamene.", cena: 2900 }
        ]
      },
      {
        id: "dvere", nazev: "Interiérové dveře", jednotka: "ks",
        mnozstvi: { zdroj: "rucne", vychozi: 5, krok: 1, min: 0, max: 15, popisek: "Počet dveří" },
        stupne: [
          { id: "std", nazev: "Standard", material: "Fólie, obložka",  barva: "#cdc3b3", popis: "Fóliované dveře s obložkovou zárubní, plná nebo prosklená.", cena: 6500 },
          { id: "kom", nazev: "Komfort",  material: "CPL, plné",       barva: "#a2988a", popis: "Odolný povrch CPL, tlumený dojezd, kvalitnější kování.", cena: 11500 },
          { id: "pre", nazev: "Prémium",  material: "Skryté zárubně",  barva: "#6b645a", popis: "Dveře v líci stěny se skrytou zárubní, na výšku místnosti.", cena: 24000 }
        ]
      }
    ],
    doplnky: [
      { id: "vstupni", nazev: "Vstupní bezpečnostní dveře", popis: "Bezpečnostní třída 3, včetně kování", cena: 32000 },
      { id: "listy",   nazev: "Hliníkové soklové lišty",    popis: "Místo dřevěných, po obvodu bytu",     cena: 14200 }
    ]
  },

  {
    id: "povrchy",
    nazev: "Povrchy a malby",
    perex: "Poslední vrstva, kterou zákazník vidí každý den. Rozdíl mezi stupni je v tom, jak rovná stěna nakonec bude.",
    volby: [
      {
        id: "steny", nazev: "Stěny a stropy", jednotka: "m²",
        mnozstvi: { zdroj: "plocha", koef: 2.6, popisek: "Plocha stěn a stropů" },
        stupne: [
          { id: "malba", nazev: "Vyrovnání a malba", material: "Bílá malba",   barva: "#e0dcd3", popis: "Oprava prasklin, přebroušení a dvojnásobný nátěr.", cena: 320 },
          { id: "perl",  nazev: "Perlinka a malba",  material: "Armovaná",     barva: "#c6c0b3", popis: "Celoplošná výztužná tkanina proti praskání, potom malba.", cena: 520 },
          { id: "sterka", nazev: "Štuk nebo stěrka", material: "Benátský štuk", barva: "#9c9384", popis: "Jemná stěrka nebo štuk, hladká plocha bez struktury.", cena: 1150 }
        ]
      }
    ],
    doplnky: [
      { id: "podhled", nazev: "Sádrokartonový podhled", popis: "Se zabudovaným osvětlením", cena: 1250, jednotka: "m²", pocitatelny: true, vychozi: 18 },
      { id: "dekor",   nazev: "Dekorativní stěna",      popis: "Obklad, lamely nebo tapeta", cena: 18000 }
    ]
  },

  {
    id: "technika",
    nazev: "Technika a doplňky",
    perex: "Věci, které se dají doplnit i později — ale výrazně levněji, když se na ně myslí teď.",
    volby: [
      {
        id: "klima", nazev: "Klimatizace", jednotka: "kompl.",
        stupne: [
          { id: "ne",    nazev: "Bez klimatizace", material: "Neřešíme",     barva: "#9d9689", popis: "Ponecháno na později, rozvody se nepřipravují.", cena: 0, nic: true },
          { id: "jedna", nazev: "Jedna jednotka",  material: "Split",        barva: "#7d97a8", popis: "Vnitřní jednotka do obývacího pokoje nebo ložnice.", cena: 48000 },
          { id: "multi", nazev: "Multisplit",      material: "Tři jednotky", barva: "#547288", popis: "Jedna venkovní a tři vnitřní jednotky s tichým chodem.", cena: 118000 }
        ]
      },
      {
        id: "stineni", nazev: "Stínění oken", jednotka: "okno",
        mnozstvi: { zdroj: "rucne", vychozi: 5, krok: 1, min: 0, max: 20, popisek: "Počet oken" },
        stupne: [
          { id: "zaluz", nazev: "Žaluzie",         material: "Hliník",   barva: "#c5c8c4", popis: "Vnitřní žaluzie do rámu okna, ovládané řetízkem.", cena: 3200 },
          { id: "rolet", nazev: "Látkové rolety",  material: "Textil",   barva: "#a5a49a", popis: "Zatemňovací nebo poloprůsvitná látka, možnost motoru.", cena: 4800 },
          { id: "screen", nazev: "Venkovní screeny", material: "Venkovní", barva: "#6e6f68", popis: "Stíní dřív, než se teplo dostane dovnitř. Na dálkové ovládání.", cena: 12500 }
        ]
      }
    ],
    doplnky: [
      { id: "skrine", nazev: "Vestavěné skříně", popis: "Na míru, včetně vnitřního uspořádání", cena: 8900, jednotka: "bm", pocitatelny: true, vychozi: 3 },
      { id: "smart",  nazev: "Chytrá domácnost — základ", popis: "Ovládání světel, topení a zásuvek", cena: 34000 },
      { id: "alarm",  nazev: "Zabezpečovací systém",      popis: "Čidla, siréna, napojení na telefon", cena: 26000 }
    ]
  }
];
