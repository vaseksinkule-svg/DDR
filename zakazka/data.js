"use strict";
/* ============================================================
   Zakázka — číselníky a ukázková data

   Číselníky určují, jak se dá zakázka krájet. Chce-li firma jiné
   kategorie, místnosti nebo role, mění se jen tady.
   ============================================================ */

/* Cesta položky od nápadu k zabudování. Pořadí je závazné —
   podle něj se počítá postup a odvozuje, co komu chybí. */
const STAVY = [
  { id: "navrh",      nazev: "Návrh",       kratce: "Návrh",   odznak: "",      popis: "Někdo to navrhl, zatím to nikdo neschválil." },
  { id: "schvaleno",  nazev: "Schváleno",   kratce: "Schvál.", odznak: "jede",  popis: "Zákazník i vedení to odsouhlasili, může se objednat." },
  { id: "objednano",  nazev: "Objednáno",   kratce: "Objedn.", odznak: "jede",  popis: "Objednávka je u dodavatele, čeká se na dodání." },
  { id: "dodano",     nazev: "Na skladě",   kratce: "Sklad",   odznak: "ok",    popis: "Dorazilo a je připraveno k zabudování." },
  { id: "zabudovano", nazev: "Zabudováno",  kratce: "Hotovo",  odznak: "ok",    popis: "Namontováno na místě, položka je uzavřená." },
  { id: "zruseno",    nazev: "Zrušeno",     kratce: "Zrušeno", odznak: "zle",   popis: "Vyřazeno ze zakázky, nepočítá se do rozpočtu." }
];
const STAV = Object.fromEntries(STAVY.map(s => [s.id, s]));
const POSTUP_STAVU = ["navrh", "schvaleno", "objednano", "dodano", "zabudovano"];

/* Co se nakupuje. Dělení je podle toho, kdo to shání. */
const KATEGORIE = [
  { id: "nabytek",    nazev: "Nábytek",           role: "Nákup nábytku" },
  { id: "spotrebice", nazev: "Spotřebiče",        role: "Nákup nábytku" },
  { id: "sanita",     nazev: "Sanita a baterie",  role: "Design interiéru" },
  { id: "obklady",    nazev: "Obklady a dlažba",  role: "Design interiéru" },
  { id: "podlahy",    nazev: "Podlahy",           role: "Design interiéru" },
  { id: "dvere",      nazev: "Dveře",             role: "Stavební část" },
  { id: "stavebniny", nazev: "Stavebniny",        role: "Stavební část" },
  { id: "elektro",    nazev: "Elektro",           role: "Technika" },
  { id: "voda",       nazev: "Voda a topení",     role: "Technika" },
  { id: "osvetleni",  nazev: "Osvětlení",         role: "Design interiéru" },
  { id: "ostatni",    nazev: "Ostatní",           role: "Vedení stavby" }
];
const KAT = Object.fromEntries(KATEGORIE.map(k => [k.id, k]));

/* Kde se to bude montovat. Druhý pohled na tutéž zakázku. */
const MISTNOSTI = [
  { id: "kuchyne",  nazev: "Kuchyně" },
  { id: "koupelna", nazev: "Koupelna" },
  { id: "wc",       nazev: "WC" },
  { id: "obyvak",   nazev: "Obývací pokoj" },
  { id: "loznice",  nazev: "Ložnice" },
  { id: "predsin",  nazev: "Předsíň" },
  { id: "cely",     nazev: "Celý byt" }
];
const MIST = Object.fromEntries(MISTNOSTI.map(m => [m.id, m]));

const ROLE = ["Nákup nábytku", "Design interiéru", "Stavební část", "Technika", "Vedení stavby"];

/* Stav úkolu na stavbě. */
const STAVY_UKOLU = [
  { id: "ceka",   nazev: "Čeká",     odznak: "" },
  { id: "probiha", nazev: "Probíhá", odznak: "jede" },
  { id: "hotovo", nazev: "Hotovo",   odznak: "ok" }
];
const STAV_UKOLU = Object.fromEntries(STAVY_UKOLU.map(s => [s.id, s]));

/* ============================================================
   UKÁZKOVÁ ZAKÁZKA
   Vymyšlený zákazník, vymyšlení dodavatelé i doklady. Slouží
   k tomu, aby bylo hned vidět, jak nástroj vypadá v provozu.
   ============================================================ */

function denPosun(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function ukazkovaZakazka() {
  return {
    nazev: "Rekonstrukce bytu — Bělohorská",
    zakaznik: "Petra Nováková",
    adresa: "Bělohorská 12, Praha 6",
    zahajeni: denPosun(-24),
    predani: denPosun(46),

    polozky: [
      { id: "p01", nazev: "Kuchyňská linka na míru", mistnost: "kuchyne", kategorie: "nabytek", role: "Nákup nábytku",
        mnozstvi: 4.2, jednotka: "bm", cenaPlan: 69300, stav: "objednano",
        dodavatel: "Truhlářství Kolman", objednavka: "OB-2419", terminDodani: denPosun(9),
        faktury: [{ cislo: "FV-24-0881", castka: 34650, datum: denPosun(-6), popis: "záloha 50 %" }],
        pozn: "Bezúchytkové provedení, dýha dub." },

      { id: "p02", nazev: "Pracovní deska — spékaná keramika", mistnost: "kuchyne", kategorie: "nabytek", role: "Nákup nábytku",
        mnozstvi: 4.2, jednotka: "bm", cenaPlan: 39900, stav: "schvaleno",
        dodavatel: "Kamenictví Sedlák", objednavka: "", terminDodani: "",
        faktury: [], pozn: "Zaměřit až po montáži korpusů." },

      { id: "p03", nazev: "Indukční deska s odsáváním", mistnost: "kuchyne", kategorie: "spotrebice", role: "Nákup nábytku",
        mnozstvi: 1, jednotka: "ks", cenaPlan: 42000, stav: "dodano",
        dodavatel: "Elektro Vrána", objednavka: "OB-2402", terminDodani: denPosun(-3),
        faktury: [{ cislo: "FV-24-0902", castka: 43500, datum: denPosun(-3), popis: "" }],
        pozn: "Dodáno dráž, než byl plán — změna modelu." },

      { id: "p04", nazev: "Vestavná trouba", mistnost: "kuchyne", kategorie: "spotrebice", role: "Nákup nábytku",
        mnozstvi: 1, jednotka: "ks", cenaPlan: 24000, stav: "dodano",
        dodavatel: "Elektro Vrána", objednavka: "OB-2402", terminDodani: denPosun(-3),
        faktury: [{ cislo: "FV-24-0902", castka: 23400, datum: denPosun(-3), popis: "" }], pozn: "" },

      { id: "p05", nazev: "Mikrovlnná trouba vestavná", mistnost: "kuchyne", kategorie: "spotrebice", role: "Nákup nábytku",
        mnozstvi: 1, jednotka: "ks", cenaPlan: 11500, stav: "navrh",
        dodavatel: "", objednavka: "", terminDodani: "", faktury: [],
        pozn: "Doobjednat k lince — musí sedět výška výklenku." },

      { id: "p06", nazev: "Myčka plně integrovaná", mistnost: "kuchyne", kategorie: "spotrebice", role: "Nákup nábytku",
        mnozstvi: 1, jednotka: "ks", cenaPlan: 18500, stav: "objednano",
        dodavatel: "Elektro Vrána", objednavka: "OB-2431", terminDodani: denPosun(4),
        faktury: [], pozn: "" },

      { id: "p07", nazev: "Obklad a dlažba koupelna", mistnost: "koupelna", kategorie: "obklady", role: "Design interiéru",
        mnozstvi: 31, jednotka: "m²", cenaPlan: 38750, stav: "dodano",
        dodavatel: "Keramika Brož", objednavka: "OB-2388", terminDodani: denPosun(-9),
        faktury: [{ cislo: "FV-24-0790", castka: 39980, datum: denPosun(-8), popis: "včetně spárovacích hmot" }],
        pozn: "Dvě krabice navíc jako rezerva." },

      { id: "p08", nazev: "Sanita — umyvadlo, WC, baterie", mistnost: "koupelna", kategorie: "sanita", role: "Design interiéru",
        mnozstvi: 1, jednotka: "sada", cenaPlan: 72000, stav: "objednano",
        dodavatel: "Sanita Pech", objednavka: "OB-2426", terminDodani: denPosun(6),
        faktury: [], pozn: "" },

      { id: "p09", nazev: "Sprchový žlab a zástěna", mistnost: "koupelna", kategorie: "sanita", role: "Design interiéru",
        mnozstvi: 1, jednotka: "sada", cenaPlan: 28000, stav: "objednano",
        dodavatel: "Sanita Pech", objednavka: "OB-2426", terminDodani: denPosun(6),
        faktury: [], pozn: "" },

      { id: "p10", nazev: "Koupelnová skříňka na míru", mistnost: "koupelna", kategorie: "nabytek", role: "Nákup nábytku",
        mnozstvi: 1, jednotka: "ks", cenaPlan: 34000, stav: "navrh",
        dodavatel: "", objednavka: "", terminDodani: "", faktury: [],
        pozn: "Čeká na schválení odstínu u zákaznice." },

      { id: "p11", nazev: "Závěsné WC s podomítkovou nádržkou", mistnost: "wc", kategorie: "sanita", role: "Design interiéru",
        mnozstvi: 1, jednotka: "sada", cenaPlan: 19500, stav: "dodano",
        dodavatel: "Sanita Pech", objednavka: "OB-2391", terminDodani: denPosun(-11),
        faktury: [{ cislo: "FV-24-0805", castka: 19500, datum: denPosun(-10), popis: "" }], pozn: "" },

      { id: "p12", nazev: "Vinylová podlaha", mistnost: "cely", kategorie: "podlahy", role: "Design interiéru",
        mnozstvi: 58, jednotka: "m²", cenaPlan: 101500, stav: "objednano",
        dodavatel: "Podlahy Říha", objednavka: "OB-2433", terminDodani: denPosun(12),
        faktury: [], pozn: "Aklimatizace 48 h před pokládkou." },

      { id: "p13", nazev: "Interiérové dveře se skrytou zárubní", mistnost: "cely", kategorie: "dvere", role: "Stavební část",
        mnozstvi: 5, jednotka: "ks", cenaPlan: 120000, stav: "objednano",
        dodavatel: "Dveře Malý", objednavka: "OB-2410", terminDodani: denPosun(18),
        faktury: [{ cislo: "FV-24-0866", castka: 60000, datum: denPosun(-12), popis: "záloha" }],
        pozn: "Zárubně musí být na stavbě před omítkami." },

      { id: "p14", nazev: "Sádrokarton, profily, spojovací materiál", mistnost: "cely", kategorie: "stavebniny", role: "Stavební část",
        mnozstvi: 1, jednotka: "dodávka", cenaPlan: 46000, stav: "zabudovano",
        dodavatel: "Stavebniny Hruška", objednavka: "OB-2361", terminDodani: denPosun(-19),
        faktury: [{ cislo: "FV-24-0712", castka: 48300, datum: denPosun(-18), popis: "" }], pozn: "" },

      { id: "p15", nazev: "Cement, lepidla, penetrace", mistnost: "cely", kategorie: "stavebniny", role: "Stavební část",
        mnozstvi: 1, jednotka: "dodávka", cenaPlan: 22000, stav: "dodano",
        dodavatel: "Stavebniny Hruška", objednavka: "OB-2404", terminDodani: denPosun(-5),
        faktury: [{ cislo: "FV-24-0851", castka: 21400, datum: denPosun(-5), popis: "" }], pozn: "" },

      { id: "p16", nazev: "Elektroinstalační materiál", mistnost: "cely", kategorie: "elektro", role: "Technika",
        mnozstvi: 1, jednotka: "dodávka", cenaPlan: 68000, stav: "zabudovano",
        dodavatel: "Elektro Vrána", objednavka: "OB-2372", terminDodani: denPosun(-16),
        faktury: [{ cislo: "FV-24-0744", castka: 71200, datum: denPosun(-15), popis: "vícepráce — rozvaděč" }],
        pozn: "Vyšlo dráž o rozvaděč navíc." },

      { id: "p17", nazev: "Vypínače a zásuvky — kovová řada", mistnost: "cely", kategorie: "elektro", role: "Technika",
        mnozstvi: 46, jednotka: "ks", cenaPlan: 40900, stav: "schvaleno",
        dodavatel: "Elektro Vrána", objednavka: "", terminDodani: "", faktury: [],
        pozn: "Objednat až po odsouhlasení rozmístění." },

      { id: "p18", nazev: "Rozvody vody a odpadů", mistnost: "cely", kategorie: "voda", role: "Technika",
        mnozstvi: 1, jednotka: "dodávka", cenaPlan: 54000, stav: "zabudovano",
        dodavatel: "Instalace Kříž", objednavka: "OB-2375", terminDodani: denPosun(-17),
        faktury: [{ cislo: "FV-24-0758", castka: 54000, datum: denPosun(-16), popis: "" }], pozn: "" },

      { id: "p19", nazev: "Svítidla a LED profily", mistnost: "cely", kategorie: "osvetleni", role: "Design interiéru",
        mnozstvi: 1, jednotka: "sada", cenaPlan: 36000, stav: "navrh",
        dodavatel: "", objednavka: "", terminDodani: "", faktury: [],
        pozn: "Návrh osvětlení zatím není odsouhlasený." },

      { id: "p20", nazev: "Vestavěná skříň — předsíň", mistnost: "predsin", kategorie: "nabytek", role: "Nákup nábytku",
        mnozstvi: 3, jednotka: "bm", cenaPlan: 26700, stav: "schvaleno",
        dodavatel: "Truhlářství Kolman", objednavka: "", terminDodani: "", faktury: [], pozn: "" }
    ],

    ukoly: [
      { id: "u01", nazev: "Bourání a vyklizení bytu", mistnost: "cely", poradi: 1,
        postup: "Vybourat bytové jádro, odstranit původní podlahy a obklady. Suť průběžně odvážet, nenechávat na chodbě.",
        od: denPosun(-24), do: denPosun(-20), potrebuje: [], stav: "hotovo",
        zahajeno: denPosun(-24) + "T07:00", dokonceno: denPosun(-20) + "T16:30", odhadHodin: 60 },

      { id: "u02", nazev: "Nové rozvody vody a odpadů", mistnost: "cely", poradi: 2,
        postup: "Rozvody vést podle projektu, po dokončení provést tlakovou zkoušku a nafotit před zakrytím.",
        od: denPosun(-19), do: denPosun(-15), potrebuje: ["p18"], stav: "hotovo",
        zahajeno: denPosun(-19) + "T07:00", dokonceno: denPosun(-15) + "T15:00", odhadHodin: 48 },

      { id: "u03", nazev: "Elektroinstalace — rozvody a rozvaděč", mistnost: "cely", poradi: 3,
        postup: "Drážkování, uložení kabeláže, osazení rozvaděče. Před zakrytím zaměřit polohy a nafotit.",
        od: denPosun(-18), do: denPosun(-13), potrebuje: ["p16"], stav: "hotovo",
        zahajeno: denPosun(-18) + "T07:00", dokonceno: denPosun(-12) + "T14:00", odhadHodin: 56 },

      { id: "u04", nazev: "Sádrokartonové příčky a podhledy", mistnost: "cely", poradi: 4,
        postup: "Příčky podle nové dispozice, podhled v koupelně s revizním otvorem u nádržky.",
        od: denPosun(-12), do: denPosun(-7), potrebuje: ["p14"], stav: "hotovo",
        zahajeno: denPosun(-12) + "T07:00", dokonceno: denPosun(-7) + "T16:00", odhadHodin: 64 },

      { id: "u05", nazev: "Obklady a dlažba v koupelně", mistnost: "koupelna", poradi: 5,
        postup: "Nejdřív hydroizolace, pak dlažba, nakonec obklad. Spárovat po 24 hodinách.",
        od: denPosun(-4), do: denPosun(2), potrebuje: ["p07", "p15"], stav: "probiha",
        zahajeno: denPosun(-4) + "T07:00", dokonceno: "", odhadHodin: 72 },

      { id: "u06", nazev: "Osazení sanity a sprchového koutu", mistnost: "koupelna", poradi: 6,
        postup: "Až po vyzrání spár. Podomítkovou nádržku zkontrolovat proti projektu před zaklopením.",
        od: denPosun(7), do: denPosun(10), potrebuje: ["p08", "p09", "p11"], stav: "ceka",
        zahajeno: "", dokonceno: "", odhadHodin: 32 },

      { id: "u07", nazev: "Pokládka podlah", mistnost: "cely", poradi: 7,
        postup: "Podklad musí být suchý a vyrovnaný. Krytinu nechat 48 h aklimatizovat v bytě.",
        od: denPosun(14), do: denPosun(18), potrebuje: ["p12"], stav: "ceka",
        zahajeno: "", dokonceno: "", odhadHodin: 40 },

      { id: "u08", nazev: "Montáž dveří a zárubní", mistnost: "cely", poradi: 8,
        postup: "Skryté zárubně osadit před finální malbou, dveřní křídla až po ní.",
        od: denPosun(19), do: denPosun(22), potrebuje: ["p13"], stav: "ceka",
        zahajeno: "", dokonceno: "", odhadHodin: 28 },

      { id: "u09", nazev: "Montáž kuchyně a zapojení spotřebičů", mistnost: "kuchyne", poradi: 9,
        postup: "Nejdřív korpusy, pak zaměření desky. Deska se montuje samostatně po výrobě.",
        od: denPosun(24), do: denPosun(28), potrebuje: ["p01", "p02", "p03", "p04", "p05", "p06"], stav: "ceka",
        zahajeno: "", dokonceno: "", odhadHodin: 44 },

      { id: "u10", nazev: "Finální úklid a předání", mistnost: "cely", poradi: 10,
        postup: "Kontrola podle předávacího protokolu, sepsání vad a nedodělků, předání klíčů a dokumentace.",
        od: denPosun(44), do: denPosun(46), potrebuje: [], stav: "ceka",
        zahajeno: "", dokonceno: "", odhadHodin: 16 }
    ]
  };
}
