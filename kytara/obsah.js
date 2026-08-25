"use strict";
/* ============================================================
   Kytara — obsah

   Písničky, rytmy, tabulatury a postupy akordů. Tohle je
   soubor, do kterého se sahá nejčastěji: přidat písničku
   znamená dopsat jednu položku do seznamu, ne měnit kód.

   Zápis písničky:
     řádek začínající #  = název části (Sloka, Refrén…)
     [C] uvnitř textu    = akord nad následující slabikou
     prázdný řádek       = mezera mezi slokami

   Písničky v základní výbavě jsou lidové, tedy volné dílo.
   Vlastní se přidávají rovnou v aplikaci a ukládají se
   do prohlížeče.
   ============================================================ */

const PISNE = [
  {
    id: "holka-modrooka",
    nazev: "Holka modrooká",
    autor: "lidová",
    tonina: "C",
    tempo: 104,
    rytmus: "lidovka",
    poznamka: "Tři akordy, které umí každý. Dobrá první píseň k táboráku.",
    text: `# Sloka
[C]Holka modrooká, nesedávej u po[G7]toka,
holka modrooká, nesedávej [C]tam.

[C]Holka modrooká, nesedávej u po[G7]toka,
holka modrooká, nesedávej [C]tam.

# Sloka
[C]V potoce je hastr[F]mánek,
[C]zatahá tě za sve[G7]dánek,
[C]holka modrooká, nesedávej [G7]tam, nesedávej [C]tam.`
  },
  {
    id: "kocka-leze-dirou",
    nazev: "Kočka leze dírou",
    autor: "lidová",
    tonina: "C",
    tempo: 112,
    rytmus: "doby",
    poznamka: "Dva akordy a hotovo. Ideální na první přechody C → G7.",
    text: `# Sloka
[C]Kočka leze dírou, [G7]pes oknem, pes [C]oknem,
[C]nebude-li pršet, [G7]nezmokneme, nezmok[C]neme.`
  },
  {
    id: "pec-nam-spadla",
    nazev: "Pec nám spadla",
    autor: "lidová",
    tonina: "C",
    tempo: 108,
    rytmus: "doby",
    poznamka: "Také jen dva akordy — dobré na počítání dob nahlas.",
    text: `# Sloka
[C]Pec nám spadla, [G7]pec nám spadla,
kdopak nám ji po[C]staví?
[C]Starý pecař [G7]není doma
a mladý to ne[C]umí.`
  },
  {
    id: "ovcaci-ctveraci",
    nazev: "Ovčáci, čtveráci",
    autor: "lidová",
    tonina: "G",
    tempo: 120,
    rytmus: "doby",
    poznamka: "V G dur, aby si ruka zvykla i na jinou dvojici akordů.",
    text: `# Sloka
[G]Ovčáci, čtveráci, [D7]co jste to zdě[G]lali,
[G]že jste nám ovečku [D7]v lese ztra[G]tili.`
  },
  {
    id: "ach-synku",
    nazev: "Ach synku, synku",
    autor: "lidová",
    tonina: "C",
    tempo: 96,
    rytmus: "lidovka",
    poznamka: "Čtyři akordy včetně F — dobrý důvod naučit se Fmaj7 jako náhradu.",
    text: `# Sloka
[C]Ach synku, [G7]synku, [C]doma-li jsi,
[C]tatíček se [G7]ptá, oral-li [C]jsi.

[F]Oral jsem, [C]oral, ale [G7]málo,
[C]kolečko se mi po[G7]lá[C]malo.`
  },
  {
    id: "tancuj-tancuj",
    nazev: "Tancuj, tancuj, vykrúcaj",
    autor: "lidová (slovenská)",
    tonina: "D",
    tempo: 132,
    rytmus: "pochod",
    poznamka: "Rychlá — dobrý test, jestli přechody drží i ve tempu.",
    text: `# Sloka
[D]Tancuj, tancuj, vykrú[A7]caj, vykrú[D]caj,
[D]len mi piecku nezrú[A7]caj, nezrú[D]caj.

[G]Dobrá piecka na [D]zimu,
[G]nemá dievča pe[A7]ri[D]nu.`
  },
  {
    id: "rising-sun",
    nazev: "House of the Rising Sun",
    autor: "tradicionál",
    tonina: "Am",
    tempo: 76,
    rytmus: "rozklad68",
    poznamka: "Klasika na rozklad v šestiosminovém taktu. Hraje se prsty, ne trsátkem.",
    text: `# Sloka
[Am]There is a [C]house in [D]New Or[F]leans
[Am]They call the [C]Rising [E7]Sun
[Am]And it's been the [C]ruin of [D]many a poor [F]boy
[Am]And [E7]God, I know I'm [Am]one`
  },
  {
    id: "amazing-grace",
    nazev: "Amazing Grace",
    autor: "tradicionál (J. Newton, 1779)",
    tonina: "G",
    tempo: 72,
    rytmus: "valcik",
    poznamka: "Tříčtvrťový takt. Krásně se na ní cvičí klidná pravá ruka.",
    text: `# Sloka
A[G]mazing grace, how [C]sweet the [G]sound
that saved a wretch like [D]me.
I [G]once was lost, but [C]now am [G]found,
was [G]blind but [D]now I [G]see.`
  },
  {
    id: "cviceni-ctyri-akordy",
    nazev: "Cvičení: čtyři akordy dokola",
    autor: "cvičení",
    tonina: "C",
    tempo: 80,
    rytmus: "nej",
    poznamka: "Není to píseň, je to rozcvička. Pusťte metronom a jeďte kolečko, dokud to nejde bez přemýšlení.",
    text: `# Kolečko
[C]. . . . [G]. . . . [Am]. . . . [F]. . . .
[C]. . . . [G]. . . . [Am]. . . . [F]. . . .

# Totéž o stupeň jinak
[G]. . . . [D]. . . . [Em]. . . . [C]. . . .
[G]. . . . [D]. . . . [Em]. . . . [C]. . . .`
  }
];

/* ============================================================
   RYTMY PRAVÉ RUKY

   Vzor má osm políček = osm osmin (u tříčtvrťového taktu šest).
   D = dolů, U = nahoru, B = jen basová struna, prázdné = nic.
   Ruka se přitom hýbe pořád dolů–nahoru; tam, kde je prázdno,
   jen mine struny.
   ============================================================ */
const RYTMY = [
  {
    id: "doby", nazev: "Na doby", takt: 4,
    vzor: ["D", "", "D", "", "D", "", "D", ""],
    popis: "Čtyři rány dolů, nic víc. První rytmus, který má smysl umět pořádně.",
    kdy: "Lidovky, dětské písničky, cokoli, kde se učíte přechody."
  },
  {
    id: "osminy", nazev: "Osminy", takt: 4,
    vzor: ["D", "U", "D", "U", "D", "U", "D", "U"],
    popis: "Ruka jede pořád nahoru dolů a nezastaví se. Základ všech dalších rytmů.",
    kdy: "Rychlejší písničky, punk, cokoli hnané dopředu."
  },
  {
    id: "nej", nazev: "Ten nejpoužívanější", takt: 4,
    vzor: ["D", "", "D", "U", "", "U", "D", "U"],
    popis: "Ruka se hýbe celou dobu, jen na dvou místech mine struny. Když ho umíte, zahrajete polovinu rádia.",
    kdy: "Pop, folk, táborák — nejuniverzálnější vzor vůbec."
  },
  {
    id: "lidovka", nazev: "Bas a akord", takt: 4,
    vzor: ["B", "", "D", "", "B", "", "D", ""],
    popis: "Palec vezme basovou strunu, pak přijde akord. Zní to, jako by hráli dva.",
    kdy: "Lidovky, country, trampské písně."
  },
  {
    id: "pochod", nazev: "Pochod", takt: 2,
    vzor: ["D", "U", "D", "U"],
    popis: "Krátký dvoudobý vzor. Drží tempo a nedá se v něm zamotat.",
    kdy: "Rychlé lidovky, polky."
  },
  {
    id: "valcik", nazev: "Valčík", takt: 3,
    vzor: ["B", "", "D", "", "D", ""],
    popis: "Raz–dva–tři. Bas na jedničku, dva akordy za ním.",
    kdy: "Tříčtvrťové písně — valčíky, ukolébavky, Amazing Grace."
  },
  {
    id: "balada", nazev: "Balada", takt: 4,
    vzor: ["D", "", "", "U", "D", "", "D", "U"],
    popis: "Pomalý, prodýchaný vzor s dírami. Nechte znít, nespěchejte.",
    kdy: "Pomalé písně, kde se má víc slyšet zpěv než kytara."
  },
  {
    id: "rozklad68", nazev: "Rozklad 6/8", takt: 3,
    vzor: ["P", "P", "P", "P", "P", "P"],
    popis: "Nehraje se trsátkem: palec vezme bas, prsty rozeberou zbytek akordu shora dolů a zpět.",
    kdy: "House of the Rising Sun a všechno pomalé v šestiosminovém taktu."
  },
  {
    id: "offbeat", nazev: "Odsazený (reggae)", takt: 4,
    vzor: ["", "U", "", "U", "", "U", "", "U"],
    popis: "Akord zní jen mezi dobami. Metronom klape na doby, vy do nich netrefujete schválně.",
    kdy: "Reggae, ska — a jako cvičení na cit pro rytmus."
  }
];

/* ============================================================
   POSTUPY AKORDŮ
   Stupně se počítají od tóniky: 1 = tónika, 5 = dominanta…
   Aplikace je přepočítá do libovolné tóniny.
   ============================================================ */
const POSTUPY = [
  { id: "ctyri", nazev: "Čtyři akordy", stupne: [1, 5, 6, 4], mol: false,
    popis: "Postup, na kterém stojí desítky hitů. Zní domácky a nikdy neurazí." },
  { id: "smutny-pop", nazev: "Smutnější varianta", stupne: [6, 4, 1, 5], mol: false,
    popis: "Stejné akordy, jiný začátek — a najednou je z toho balada." },
  { id: "padesatky", nazev: "Padesátky", stupne: [1, 6, 4, 5], mol: false,
    popis: "Doo-wop. Zní jako první láska na plese." },
  { id: "lidovka", nazev: "Lidovka", stupne: [1, 4, 5, 1], mol: false,
    popis: "Tři akordy, které stačí na většinu lidových písní." },
  { id: "kanon", nazev: "Kánon", stupne: [1, 5, 6, 3, 4, 1, 4, 5], mol: false,
    popis: "Pachelbelův postup. Osm akordů, které se točí a nikdy nekončí." },
  { id: "blues", nazev: "Dvanáctitaktové blues", stupne: [1, 1, 1, 1, 4, 4, 1, 1, 5, 4, 1, 5], mol: false,
    sedmicky: true,
    popis: "Dvanáct taktů, tři akordy, sto let muziky. Všechny jako septakordy." },
  { id: "mollovy-pop", nazev: "Mollový pop", stupne: [1, 6, 3, 7], mol: true,
    popis: "V moll: tónika, měkké odbočení a návrat. Zní dnešně." },
  { id: "andaluska", nazev: "Andaluská kadence", stupne: [1, 7, 6, 5], mol: true,
    popis: "Sestup po schodech dolů. Španělsko, flamenco, drama." },
  { id: "rock-moll", nazev: "Rock v moll", stupne: [1, 7, 4, 1], mol: true,
    popis: "Tvrdý a přímý. Hraje se s mocnými akordy (5)." },
  { id: "jazz", nazev: "Dvojka–pětka–jednička", stupne: [2, 5, 1], mol: false,
    popis: "Nejčastější věta jazzu. Zkuste ji s akordy m7, 7 a maj7." }
];

/* ============================================================
   TABULATURY
   Text je přesně to, co aplikace umí přehrát — a zároveň to,
   co najdete na internetu. Vlastní se vkládají v aplikaci.
   ============================================================ */
const TABY = [
  {
    id: "chromaticke", nazev: "Rozcvička 1–2–3–4", uroven: "začátek", tempo: 70,
    popis: "Čtyři prsty, čtyři pražce, všechny struny tam a zpět. Nejlepší rozcvička, jaká je. Každý prst zůstane ležet, dokud nemusí pryč.",
    tab: `
e|------------------------|
H|------------------------|
G|------------------------|
D|----------------1-2-3-4-|
A|--------1-2-3-4---------|
E|1-2-3-4-----------------|

e|----------------1-2-3-4-|
H|--------1-2-3-4---------|
G|1-2-3-4-----------------|
D|------------------------|
A|------------------------|
E|------------------------|

e|4-3-2-1-----------------|
H|--------4-3-2-1---------|
G|----------------4-3-2-1-|
D|------------------------|
A|------------------------|
E|------------------------|

e|------------------------|
H|------------------------|
G|------------------------|
D|4-3-2-1-----------------|
A|--------4-3-2-1---------|
E|----------------4-3-2-1-|
`
  },
  {
    id: "pavouk", nazev: "Pavouk", uroven: "začátek", tempo: 60,
    popis: "Prsty přeskakují mezi sousedními strunami. Učí ruku přesnost a nezávislost prstů.",
    tab: `
e|--------------------|
H|--------------------|
G|------------------2-|
D|----------2---4-1---|
A|--2---4-1---3-------|
E|1---3---------------|

e|--------------2---4-|
H|------2---4-1---3---|
G|--4-1---3-----------|
D|3-------------------|
A|--------------------|
E|--------------------|
`
  },
  {
    id: "oda", nazev: "Óda na radost", uroven: "začátek", tempo: 90,
    popis: "První melodie, kterou zvládnete zahrát celou. Beethoven, dvě struny, žádné akordy.",
    tab: `
e|0-0-1-3-3-1-0---------0-0-----|
H|--------------3-1-1-3-----3-3-|
G|------------------------------|
D|------------------------------|
A|------------------------------|
E|------------------------------|

e|0-0-1-3-3-1-0---------0-------|
H|--------------3-1-1-3---3-1-1-|
G|------------------------------|
D|------------------------------|
A|------------------------------|
E|------------------------------|
`
  },
  {
    id: "shuffle", nazev: "Bluesový doprovod v E", uroven: "pokročilejší", tempo: 100,
    popis: "Dva prsty a čtyři takty. Přidejte k tomu zpěv a máte večer vystaráno.",
    tab: `
e|--------------------------------|
H|--------------------------------|
G|--------------------------------|
D|--------------------------------|
A|2-2-4-4-5-5-4-4-2-2-4-4-5-5-4-4-|
E|0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-|

e|--------------------------------|
H|--------------------------------|
G|--------------------------------|
D|2-2-4-4-5-5-4-4-----------------|
A|0-0-0-0-0-0-0-0-2-2-4-4-5-5-4-4-|
E|----------------0-0-0-0-0-0-0-0-|
`
  },
  {
    id: "rising", nazev: "Rozklad — House of the Rising Sun", uroven: "pokročilejší", tempo: 80,
    popis: "Palec bere bas, tři prsty rozebírají akord. Am, C, D, F pořád dokola.",
    tab: `
e|------0-----------0-----|
H|----1---1-------1---1---|
G|--2-------2---0-------0-|
D|------------------------|
A|0-----------3-----------|
E|------------------------|

e|------2-----------1-----|
H|----3---3-------1---1---|
G|--2-------2---2-------2-|
D|0-----------------------|
A|------------------------|
E|------------1-----------|
`
  },
  {
    id: "pentatonika", nazev: "Mollová pentatonika v A", uroven: "pokročilejší", tempo: 80,
    popis: "První poloha na pátém pražci, nahoru a dolů. Odsud se dá improvizovat nad bluesovým doprovodem výš.",
    tab: `
e|--------------------5-8-|
H|----------------5-8-----|
G|------------5-7---------|
D|--------5-7-------------|
A|----5-7-----------------|
E|5-8---------------------|

e|5---------------------|
H|--8-5-----------------|
G|------7-5-------------|
D|----------7-5---------|
A|--------------7-5-----|
E|------------------8-5-|
`
  }
];
