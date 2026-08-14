# Interall — nástroje

Sada webových nástrojů pro práci se zákazníkem. Každý běží samostatně,
bez serveru a bez připojení — stačí otevřít soubor v prohlížeči.

Rozdělaná práce se ukládá do prohlížeče daného zařízení. Nic se nikam
neodesílá.

## Co je hotové

| Nástroj | Kde | K čemu je |
|---|---|---|
| Průvodce rekonstrukcí | `pruvodce/` | První schůzka se zákazníkem — osm etap rekonstrukce bytu, výběr stupně výbavy a průběžný rozpočet |

## Jak to otevřít

Dvojklik na `index.html` v kořeni otevře rozcestník, odkud se dá přejít
do jednotlivých nástrojů. Nebo rovnou `pruvodce/index.html`.

Nic se neinstaluje a nic se nekompiluje — jsou to obyčejné soubory.

## Jak to je poskládané

```
index.html            rozcestník mezi nástroji
spolecne/
  design.css          barvy, písmo, tlačítka, pole — vzhled všech nástrojů
  zaklad.js           formátování částek a čísel, ukládání rozdělané práce
pruvodce/
  index.html          stránka průvodce
  pruvodce.css        rozvržení obrazovky průvodce
  cenik.js            VŠECHNY ceny a nabídka — jediné místo, kde se mění
  pruvodce.js         logika a vykreslení
nastroje/
  sestavit.mjs        sloučí nástroj do jednoho souboru ke sdílení
```

Dělení má jeden důvod: **ceny a nabídku lze měnit, aniž se sáhne na kód.**
Všechno, co se bude upravovat nejčastěji, je v `pruvodce/cenik.js`.

## Změna cen a nabídky

Otevři `pruvodce/cenik.js`. Nahoře jsou tři sazby:

```js
const DPH = 0.12;          // snížená sazba pro stavební práce na bydlení
const PROJEKT = 0.04;      // projekt a inženýring, % z prací
const KOORDINACE = 0.08;   // vedení stavby a koordinace řemesel
```

Pod nimi je seznam etap. Každá má volby a u každé volby tři stupně:

```js
{
  id: "linka", nazev: "Kuchyňská linka", jednotka: "bm",
  mnozstvi: { zdroj: "rucne", vychozi: 4, krok: 0.5, min: 1, max: 14, popisek: "Délka linky" },
  stupne: [
    { id: "std", nazev: "Standard", material: "Lamino", barva: "#c9b596",
      popis: "Laminátová dvířka, kování s tlumením, korpus z dřevotřísky.", cena: 9500 }
  ]
}
```

- `cena` je vždy **za jednotku bez DPH**
- `barva` je zástupná plocha za budoucí fotografii vzorku
- `mnozstvi.zdroj` může být `plocha` (spočítá se z plochy bytu × `koef`),
  `rucne` (zadává pracovník) nebo `volba` (převezme se z jiné volby —
  pracovní deska takhle sleduje délku linky)
- volba bez `mnozstvi` se počítá jako jeden celek

Doplňky jsou jednodušší — `cena` a případně `pocitatelny: true`, když se
zadává počet.

**Zástupné ceny jsou jen řádově realistické.** Slouží k tomu, aby bylo vidět,
jak se rozpočet chová při výběru mezi stupni. Než se nástroj použije
u zákazníka, je potřeba je nahradit skutečnými.

## Sdílení jedním souborem

Pro poslání e-mailem nebo nahrání jinam se nástroj sloučí do jediného souboru:

```bash
node nastroje/sestavit.mjs pruvodce
```

Vznikne `vystup/pruvodce.html` se vším uvnitř. Chová se stejně jako
rozdělená verze, jen se dá přenášet samostatně.

## Přidání dalšího nástroje

1. Založ složku, například `kalkulace/`.
2. V `kalkulace/index.html` odkaž společný základ a vlastní soubory:

   ```html
   <link rel="stylesheet" href="../spolecne/design.css" />
   <link rel="stylesheet" href="kalkulace.css" />
   ...
   <script src="../spolecne/zaklad.js"></script>
   <script src="kalkulace.js"></script>
   ```

3. Přidej dlaždici do rozcestníku v kořenovém `index.html`.

Společný vzhled i pomocné funkce se převezmou samy, takže nový nástroj
vypadá a chová se jako ten stávající.

Pořadí skriptů je závazné — `zaklad.js` musí být první, protože z něj
ostatní soubory berou formátování a ukládání.
