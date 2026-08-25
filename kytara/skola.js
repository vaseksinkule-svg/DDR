"use strict";
/* ============================================================
   Kytara — škola

   Texty lekcí, cvičební plán a slovníček. Všechno je tady
   jako data, takže se dá dopisovat a přeskládávat bez zásahu
   do kódu.

   Odstavec je řetězec. Objekt umí:
     { nadpis: "…" }         mezititulek
     { seznam: ["…", "…"] }  odrážky
     { tip: "…" }            rámeček s poznámkou
     { hmat: "Em" }          diagram akordu rovnou v textu
   ============================================================ */

const LEKCE = [
  /* ---------------- ZAČÁTEK ---------------- */
  {
    id: "drzeni", uroven: "Začátek", minut: 10,
    nazev: "Jak sedět a držet kytaru",
    shrnuti: "Než začnete cvičit hmaty, vyplatí se pět minut na to, jak vůbec sedíte.",
    text: [
      "Sedněte si na přední půlku židle, obě chodidla na zemi. Kytara leží na pravém stehně (u klasické kytary na levém), tělo nástroje se lehce opírá o hruď a pravé předloktí ho drží na místě. Krk kytary míří šikmo nahoru, zhruba do třiceti stupňů — ne vodorovně.",
      "Levá ruka nesmí kytaru držet. Když pustíte levou ruku úplně, nástroj se nesmí pohnout. Dokud ho ruka podpírá, nemůže volně přebíhat po hmatníku.",
      { nadpis: "Levá ruka" },
      "Palec leží vzadu na krku, zhruba naproti prostředníčku, a je narovnaný — netiskne, jen se opírá. Prsty přicházejí na struny shora, kolmo, a tisknou špičkou, ne bříškem. Zápěstí je mírně vysunuté dopředu, ne zalomené.",
      "Prst patří těsně za pražec, ne doprostřed pole. Tam potřebuje nejmíň síly a nedrnčí to.",
      { nadpis: "Pravá ruka" },
      "Trsátko držte mezi palcem a ohnutým ukazovákem, ven kouká jen kousek špičky. Ruka se hýbe ze zápěstí, ne z lokte. Když hrajete prsty, opřete malíček zlehka o krycí desku, ale netlačte.",
      { tip: "Bolí-li po pěti minutách zápěstí nebo rameno, sedíte špatně. Únava v prstech je normální, bolest v kloubu ne." }
    ],
    zkuste: "Zahrajte prázdné struny odshora dolů, jednu po druhé, a poslouchejte, jestli všechny zní čistě.",
    odkaz: { sekce: "ladicka", popis: "Naladit kytaru" }
  },
  {
    id: "ladeni", uroven: "Začátek", minut: 8,
    nazev: "Naladit se — a proč pokaždé",
    shrnuti: "Rozladěná kytara zní falešně i tomu, kdo hraje správně. Ladí se před každým hraním.",
    text: [
      "Struny se jmenují odspodu (od nejtlustší) E — A — D — G — H — e. Nejtlustší E je basová a leží nahoře, když sedíte; nejtenčí e je dole, blízko kolen.",
      "V ladičce v této aplikaci si vyberte strunu, brnkněte ji naprázdno a otáčejte kolíkem, dokud ručička nestojí uprostřed. Ladí se vždy nahoru: když je struna vysoko, povolte ji pod cíl a doťahujte zespodu. Struna pak drží líp.",
      { nadpis: "Bez mikrofonu" },
      "Klasický způsob: pátý pražec šesté struny zní stejně jako prázdná pátá. Totéž platí mezi pátou a čtvrtou i mezi čtvrtou a třetí. Mezi třetí a druhou se ale bere pražec čtvrtý — je to jediná výjimka — a mezi druhou a první zase pátý.",
      "Nová sada strun se protahuje. Prvních pár dní ji budete ladit každých deset minut a je to v pořádku; pomůže struny opatrně povytáhnout prsty od hmatníku a doladit.",
      { tip: "Když jde kolík ztuha nebo struna praská u kobylky, není to vaše chyba — nechte kytaru prohlédnout." }
    ],
    zkuste: "Nalaďte kytaru ladičkou a pak zkuste totéž po sluchu podle pátých pražců. Porovnejte, jak blízko jste byli.",
    odkaz: { sekce: "ladicka", popis: "Otevřít ladičku" }
  },
  {
    id: "casti", uroven: "Začátek", minut: 6,
    nazev: "Co je co na kytaře",
    shrnuti: "Pár názvů, které se pak pořád opakují.",
    text: [
      { seznam: [
        "Hmatník — tmavá deska, po které chodí levá ruka.",
        "Pražce — kovové drátky napříč hmatníkem. Číslují se od hlavy: první pražec je nejblíž ladicím kolíkům.",
        "Nultý pražec (nazývaný kobylka u hlavy) — vede struny na začátku hmatníku.",
        "Kobylka — místo, kde jsou struny ukotvené v těle.",
        "Ozvučnice a rezonanční otvor — tělo akustické kytary, které zvuk zesiluje.",
        "Ladicí mechaniky (kolíky) — jimi se napíná struna.",
        "Menzura — délka kmitající struny; čím delší, tím větší tah a plnější zvuk."
      ] },
      "Pražce jsou důležitější, než vypadají: každý znamená přesně jeden půltón. Posun o dvanáct pražců je oktáva — tentýž tón o patro výš. Proto je dvanáctý pražec obvykle označený dvěma tečkami.",
      "Tečky na hmatníku (3, 5, 7, 9, 12) nejsou ozdoba, jsou to orientační body. Naučte se je používat dřív než cokoli jiného — bez nich se v pátém a sedmém pražci ztratíte."
    ],
    zkuste: "Najděte na svém nástroji dvanáctý pražec a zahrajte tam šestou strunu. Porovnejte ji s prázdnou šestou strunou — je to stejný tón, jen o oktávu výš.",
    odkaz: { sekce: "hmatnik", popis: "Prohlédnout hmatník" }
  },
  {
    id: "prvni-akordy", uroven: "Začátek", minut: 20,
    nazev: "První akordy: Em, Am, D, G, C",
    shrnuti: "S těmito pěti zahrajete stovky písní. Berte je v tomto pořadí.",
    text: [
      "Diagram akordu je kytara postavená na zem: svislé čáry jsou struny, vodorovné pražce. Kolečko nad diagramem znamená prázdnou strunu, křížek strunu, která se nehraje. Číslo v puntíku říká, který prst (1 = ukazovák, 4 = malíček).",
      { nadpis: "Em — nejsnazší" },
      "Dva prsty, všech šest strun zní. Začněte tady.",
      { hmat: "Em" },
      { nadpis: "Am a D — rodina" },
      "Am je Em posunutý o strunu, takže tvar už znáte. D se hraje jen na čtyřech strunách a špičky prstů tvoří trojúhelník.",
      { hmat: "Am" },
      { hmat: "D" },
      { nadpis: "G a C — táborák" },
      "G a C jsou roztaženější, chvíli to trvá. Za to se s nimi otevře většina písniček.",
      { hmat: "G" },
      { hmat: "C" },
      "Každý akord si ověřte po strunách: brnkněte je jednu po druhé odshora dolů. Když některá drnčí, prst je moc daleko od pražce, nebo se dotýká sousední struny. Opravte jeden prst, ne celou ruku.",
      { tip: "Prsty jsou zpočátku slabé a bolí konečky. Za dva týdny pravidelného hraní tvrdne kůže a bolest zmizí. Kratší a častější cvičení zabírá líp než jedna dlouhá seance." }
    ],
    zkuste: "Postavte Em, zahrajte, pusťte ruku úplně, a postavte ho znovu. Desetkrát. Pak totéž s Am.",
    odkaz: { sekce: "akordy", popis: "Otevřít akordy" }
  },
  {
    id: "prechody", uroven: "Začátek", minut: 15,
    nazev: "Přechody — kde se to opravdu láme",
    shrnuti: "Akordy nejsou problém. Problém je dostat se z jednoho do druhého včas.",
    text: [
      "Postavit akord umí každý za dva dny. Přejít mezi dvěma akordy tak, aby rytmus nezakolísal, je práce na týdny — a je to celé řemeslo.",
      { nadpis: "Kotvicí prst" },
      "Podívejte se, jestli mají oba akordy nějaký prst na stejném místě. Mezi C a Am je to ukazovák na první struně druhého pražce; mezi G a Em prsteníček. Ten prst nezvedejte, jen kolem něj otočte zbytek ruky.",
      { nadpis: "Ruka jako celek" },
      "Nestavte akord prst po prstu. Zvedněte ruku a položte všechny prsty najednou — i když to zprvu nesedne. Postupné skládání se zafixuje a pak už se ho nezbavíte.",
      { nadpis: "Minutové změny" },
      "Vyberte dvojici akordů, pusťte stopky na minutu a počítejte, kolikrát se mezi nimi přehodíte s čistým zvukem. Začátečník zvládne osm až dvanáct. Za týden bývá dvacet. V trenažéru v Cvičebně to má aplikace i s počítáním.",
      { tip: "Přehazujte v rytmu, ne co nejrychleji. Radši pomalejší tempo, ve kterém přechod stihnete, než rychlé, ve kterém pokaždé zaváháte." }
    ],
    zkuste: "Minutu přehazujte Em → Am, minutu G → C, minutu C → D. Zapište si počty — za týden se na ně podívejte znovu.",
    odkaz: { sekce: "cvicebna", popis: "Otevřít trenažér změn" }
  },
  {
    id: "rytmus", uroven: "Začátek", minut: 15,
    nazev: "Pravá ruka: rytmus je ta hlavní věc",
    shrnuti: "Špatný akord ve správném rytmu zní líp než správný akord bez rytmu.",
    text: [
      "Takt je opakující se skupinka dob. Většina písní má čtyři doby v taktu — počítá se raz, dva, tři, čtyři, a pak zase raz. Valčík má tři.",
      "Mezi dobami leží osminy, počítá se raz-a-dva-a-tři-a-čtyři-a. Na doby jde ruka dolů, na „a“ nahoru. Tohle je klíč: ruka se hýbe pořád, nahoru dolů, jako kyvadlo. Kde se ve vzoru nehraje, ruka jen mine struny a dál se hýbe.",
      { nadpis: "Nejpoužívanější vzor" },
      "Dolů — (nic) — dolů nahoru — (nic) nahoru — dolů nahoru. Zní ve víc písničkách než kterýkoli jiný. V Cvičebně je i se zvukem a s metronomem.",
      { nadpis: "Přízvuk" },
      "Rytmus nedělá jen to, kdy udeříte, ale i jak silně. První doba je nejsilnější, třetí o něco slabší. Když hrajete všechno stejně, zní to jako stroj.",
      { tip: "Cvičte rytmus na jednom jediném akordu — nebo dokonce na tlumených strunách. Nemusí se to plést s levou rukou." }
    ],
    zkuste: "Na akordu Em zahrajte minutu čtyři doby dolů s metronomem na 70. Pak minutu osminy. Pak zkuste nejpoužívanější vzor.",
    odkaz: { sekce: "cvicebna", popis: "Otevřít rytmy a metronom" }
  },
  {
    id: "prvni-pisen", uroven: "Začátek", minut: 12,
    nazev: "Jak se naučit píseň za odpoledne",
    shrnuti: "Postup, který funguje pokaždé — a nezačíná hraním.",
    text: [
      { seznam: [
        "Poslechněte si píseň a taktujte k ní nohou. Kolik dob má takt? Kde se mění akordy?",
        "Vypište si akordy, které v ní jsou. Umíte je všechny? Když ne, podívejte se, jestli nepomůže kapodastr nebo transpozice.",
        "Zahrajte akordy pomalu bez rytmu, jen ať ruka ví, kudy poleze.",
        "Přidejte rytmus, ale zpomalte na tempo, ve kterém to vyjde bez zaváhání.",
        "Zpívejte nahlas. Zpěv s hraním je třetí dovednost a chce vlastní cvičení — začněte tím, že si během hraní jen mumláte melodii.",
        "Až celá píseň drží pohromadě pomalu, zrychlujte po pěti."
      ] },
      "Nejčastější chyba je začít od začátku a hrát pořád dokola první sloku. Nejtěžší bývá přechod z refrénu zpátky do sloky — cvičte právě ta dvě místa, ne to, co už umíte.",
      { tip: "Ve Zpěvníku si můžete píseň transponovat do tóniny, která vám sedne do hlasu, a nechat si poradit kapodastr." }
    ],
    zkuste: "Vezměte Holka modrooká ze Zpěvníku, pusťte si k ní metronom na 90 a projděte celý postup výše.",
    odkaz: { sekce: "zpevnik", popis: "Otevřít zpěvník" }
  },

  /* ---------------- DÁL ---------------- */
  {
    id: "kapodastr", uroven: "Dál", minut: 8,
    nazev: "Kapodastr — nejlevnější zkratka",
    shrnuti: "Posune celou kytaru výš, aby se těžké tóniny hrály snadnými hmaty.",
    text: [
      "Kapodastr je svorka, která zmáčkne všechny struny na jednom pražci. Tím se ze všech prázdných strun stanou tóny o tolik půltónů vyšší, o kolik pražců jste kapodastr posunuli.",
      "Praktický důsledek: píseň v Es dur (samé barré) se dá zahrát s kapodastrem na třetím pražci hmaty z C dur. Hraje to stejně, zní to stejně, a jde to zahrát.",
      "Druhé využití je zpěv. Když je píseň moc vysoko nebo nízko na váš hlas, nemusíte měnit hmaty — jen posunete kapodastr, dokud vám to nesedne.",
      { nadpis: "Jak ho nasadit" },
      "Těsně za pražec, ne doprostřed pole, a ne silněji, než je nutné — silný kapodastr táhne struny do strany a kytara se rozladí. Po nasazení vždycky zkontrolujte ladění.",
      { tip: "Ve Zpěvníku vám aplikace u každé písně spočítá, který pražec dá nejvíc snadných hmatů." }
    ],
    zkuste: "Dejte kapodastr na druhý pražec a zahrajte hmat G. Zní D. Zkuste to samé se všemi hmaty, které umíte.",
    odkaz: { sekce: "zpevnik", popis: "Zkusit ve zpěvníku" }
  },
  {
    id: "barre", uroven: "Dál", minut: 20,
    nazev: "Barré: F, H a všechno ostatní",
    shrnuti: "Jeden prst přes všechny struny. Vypadá to jako zeď, ale je to nejužitečnější věc, kterou se naučíte.",
    text: [
      "Barré je posunutý nultý pražec: ukazovák nahradí prázdné struny, zbytek ruky drží tvar, který už znáte. Tvar E posunutý o jeden pražec je F, o tři je G, o pět A. Tvar Am posunutý o dva je Hm.",
      "Tím se počet akordů, které umíte, násobí dvanácti. Dva tvary a znalost tónů na šesté a páté struně stačí na jakýkoli durový a mollový akord.",
      { nadpis: "Aby to znělo" },
      { seznam: [
        "Ukazovák leží mírně na boku, ne na měkkém bříšku — kost lépe tlačí.",
        "Prst je co nejblíž pražci, klidně skoro na něm.",
        "Palec je vzadu uprostřed krku, ne přehozený přes hmatník. Tlak dělá protipohyb palce a ruky, ne síla prstů.",
        "Loket blíž k tělu, rameno dolů. Tah paže udělá víc než sevření ruky."
      ] },
      "Cvičte to nejdřív na pátém až sedmém pražci, kde jsou struny nejpoddajnější, a teprve pak u hlavy, kde je barré nejtěžší.",
      { nadpis: "Než to půjde" },
      "Než barré vyjde, existují náhrady: místo F se dá hrát Fmaj7 (bez barré), místo H často zastane H7. Píseň to nezkazí a vy mezitím trénujete.",
      { tip: "Barré nikdy nedrťte silou vsedě půl hodiny — pár minut denně, pravidelně. Bolest v zápěstí znamená stop." }
    ],
    zkuste: "Zahrajte barré na pátém pražci (tvar E = akord A) a projděte struny jednu po druhé. Opravte jen ty, které drnčí.",
    odkaz: { sekce: "akordy", popis: "Prohlédnout tvary" }
  },
  {
    id: "tabulatura", uroven: "Dál", minut: 10,
    nazev: "Jak číst tabulaturu",
    shrnuti: "Šest čar = šest strun, čísla = pražce. To je celé.",
    text: [
      "Tabulatura je obrázek hmatníku. Horní čára je nejtenčí struna e, spodní nejtlustší E — pozor, je to opačně, než jak struny vidíte při hraní shora. Číslo na čáře říká, na kterém pražci strunu chytit; nula znamená prázdnou strunu.",
      "Čísla pod sebou se hrají naráz (akord), čísla za sebou postupně. Svislé čáry oddělují takty.",
      { nadpis: "Značky, které potkáte" },
      { seznam: [
        "h — hammer-on, tón se rozezní přiklepnutím prstu, bez brnknutí",
        "p — pull-off, tón se rozezní stržením prstu dolů",
        "/ nebo \\ — skluz mezi pražci",
        "b — vytažení struny (bend), r — návrat zpět",
        "~ — vibrato, x — tlumená struna, PM — tlumení dlaní"
      ] },
      "Co v tabulatuře není: rytmus. Proto se tabulatura čte spolu s poslechem — čísla řeknou kam, poslech řekne kdy. V sekci Tabulatury si můžete nechat tab přehrát a rovnou vidět, kde jste.",
      { tip: "Tabulaturu z internetu můžete rovnou vložit do aplikace a nechat si ji přehrát tempem, které stíháte." }
    ],
    zkuste: "Otevřete Rozcvičku 1–2–3–4 a pusťte si ji na 60. Pak zkuste hrát s ní.",
    odkaz: { sekce: "tabulatury", popis: "Otevřít tabulatury" }
  },
  {
    id: "prsty", uroven: "Dál", minut: 15,
    nazev: "Hra prsty a rozklady",
    shrnuti: "Palec drží bas, prsty zpívají. Nejrychlejší cesta, jak znít dospěle.",
    text: [
      "Rozdělení rukou je jednoduché: palec obsluhuje tři basové struny (E, A, D), ukazovák strunu G, prostředníček H, prsteníček e. Ruka zůstane na místě a nepřebíhá.",
      "Základní rozklad: bas, G, H, e, H, G. Šest tónů, pořád dokola, akord se mění pod tím. Tak se hraje House of the Rising Sun a půlka folkových písniček.",
      { nadpis: "Střídavý bas" },
      "Palec nehraje pořád tutéž strunu — střídá základní tón akordu a jeho kvintu. U C jde mezi pátou a čtvrtou strunou, u G mezi šestou a čtvrtou. Zní to, jako by hráli dva lidé.",
      "Nehty na pravé ruce pomáhají (ostřejší zvuk), ale nejsou nutné. Levá ruka nehty mít nesmí — s dlouhými nehty se nedá stisknout struna špičkou prstu.",
      { tip: "Cvičte rozklad na jednom akordu tak dlouho, až se na pravou ruku nemusíte dívat. Teprve pak měňte akordy." }
    ],
    zkuste: "Zahrajte rozklad na Am, C, D, F z tabulatury House of the Rising Sun pomalu, na 60.",
    odkaz: { sekce: "tabulatury", popis: "Otevřít rozklad" }
  },
  {
    id: "hmatnik", uroven: "Dál", minut: 12,
    nazev: "Tóny na hmatníku — jak si je zapamatovat",
    shrnuti: "Nemusíte umět všech 132 políček. Stačí dvě struny a pár triků.",
    text: [
      "Tóny jdou po půltónech: C, C#, D, D#, E, F, F#, G, G#, A, B, H a zase C. Pozor na dvě místa bez křížku — mezi E a F a mezi H a C je jen půltón, tedy jeden pražec.",
      { nadpis: "Naučte se šestou a pátou strunu" },
      "Když znáte tóny na šesté a páté struně, umíte pojmenovat každý barré akord: tvar E má základ na šesté, tvar A na páté. Body: třetí pražec šesté struny je G, pátý A, sedmý H, osmý C. Na páté struně: třetí C, pátý D, sedmý E, osmý F.",
      { nadpis: "Oktávové triky" },
      { seznam: [
        "Dva pražce nahoru a dvě struny níž = tentýž tón o oktávu výš (z šesté na čtvrtou, z páté na třetí).",
        "Tři pražce nahoru a dvě struny níž mezi třetí a první strunou (kvůli ladění G–H).",
        "Dvanáctý pražec = prázdná struna o oktávu výš."
      ] },
      "V sekci Hmatník si můžete nechat vypsat názvy tónů, vybrat stupnici a vidět, kde v ní leží základní tóny.",
      { tip: "Nezkoušejte se to nadrtit. Pojmenujte si nahlas jeden tón denně při ladění a za měsíc je to venku." }
    ],
    zkuste: "Najděte všechna C na hmatníku do dvanáctého pražce. Je jich pět.",
    odkaz: { sekce: "hmatnik", popis: "Otevřít hmatník" }
  },
  {
    id: "teorie", uroven: "Dál", minut: 15,
    nazev: "Proč některé akordy patří k sobě",
    shrnuti: "Tónina, stupnice a kvintový kruh — teorie, která se vejde na jednu stránku.",
    text: [
      "Stupnice je sedm vybraných tónů z dvanácti. Durová stupnice má rozestupy celý–celý–půl–celý–celý–celý–půl. V C dur na to vyjdou samé bílé klávesy: C D E F G A H.",
      "Akordy v tónině vzniknou tak, že se ze stupnice berou tóny obden. Z C dur vyjde: C, Dm, Em, F, G, Am a zmenšený Hdim. Proto v písni v C dur potkáte nejčastěji právě tyhle akordy — a proč tam Fis nikdy nehraje.",
      { nadpis: "Tři důležité role" },
      { seznam: [
        "Tónika (I) je domov. Na ní píseň začíná i končí.",
        "Dominanta (V) je napětí. Táhne zpátky domů, obzvlášť jako septakord (G7 → C).",
        "Subdominanta (IV) je nadechnutí, odbočka do strany."
      ] },
      "Šestý stupeň (Am v C dur) je paralelní moll: stejné tóny, jiný domov. Proto se dvojice C dur a A moll pořád potkávají.",
      { nadpis: "Kvintový kruh" },
      "Když jdete od C po kvintách nahoru (C, G, D, A, E, H…), přibývá v tónině vždy jeden křížek. Sousedi v kruhu k sobě sedí — proto postupy jako C–G–Am–F fungují v každé tónině stejně.",
      { tip: "V sekci Skládání kruh vidíte a můžete se v něm proklikat. Akordy tóniny se dopočítají samy." }
    ],
    zkuste: "Zjistěte, které akordy patří do G dur, a zahrajte postup I–V–vi–IV v této tónině.",
    odkaz: { sekce: "skladani", popis: "Otevřít skládání" }
  },
  {
    id: "solo", uroven: "Dál", minut: 15,
    nazev: "První sólo: mollová pentatonika",
    shrnuti: "Pět tónů, jeden tvar, a nad bluesem nešlápnete vedle.",
    text: [
      "Pentatonika je stupnice o pěti tónech. Vznikla tak, že se z mollové stupnice vyhodily dva tóny, které dělají potíže — proto v ní zní všechno dobře.",
      "První poloha v A moll leží mezi pátým a osmým pražcem a vejde se do dvou prstů na strunu. Tvar je jeden a posouvá se: na pátém pražci je A moll, na třetím G moll, na osmém C moll — podle toho, kde leží základní tón na šesté struně.",
      { nadpis: "Jak se to hraje, aby to nebyla gymnastika" },
      { seznam: [
        "Hrajte krátké kousky, tři čtyři tóny, a nechte je doznít. Ticho mezi frázemi dělá sólo.",
        "Vracejte se na základní tón — je to domov i tady.",
        "Zkuste tón vytáhnout (bend) o půltón nahoru a zpátky. Jeden takový tón vydá za deset rychlých.",
        "Přidejte vibrato: drobné kolébání strunou nahoru dolů po zahrání."
      ] },
      "Nad bluesovým doprovodem v E hrajte pentatoniku v E (dvanáctý pražec nebo prázdné struny). V sekci Tabulatury je doprovod i stupnice — pusťte si doprovod a hrajte přes něj.",
      { tip: "Cvičte pentatoniku s metronomem po osminách. Sólo bez rytmu není sólo." }
    ],
    zkuste: "Zahrajte pentatoniku v A nahoru a dolů na 70, pak si vymyslete čtyři vlastní krátké fráze z jejích tónů.",
    odkaz: { sekce: "hmatnik", popis: "Ukázat stupnici" }
  },

  /* ---------------- TVOŘENÍ ---------------- */
  {
    id: "stavba", uroven: "Tvoření", minut: 12,
    nazev: "Z čeho se skládá píseň",
    shrnuti: "Sloka, refrén, most. Když víte, co která část dělá, píše se to samo.",
    text: [
      { seznam: [
        "Předehra — pár taktů, které nastaví náladu a tempo.",
        "Sloka — vypráví. Melodie bývá níž a klidnější, text se v každé sloce mění.",
        "Předrefrén — krátký rozjezd, který zvedne napětí. Nemusí být.",
        "Refrén — hlavní myšlenka, pořád stejný text. Melodie výš, akordy jednodušší.",
        "Most — jednou za píseň, jiné akordy, jiná nálada. Aby to nebylo pořád stejné.",
        "Dohra — konec, často jen opakovaný refrén nebo poslední akord."
      ] },
      "Nejběžnější uspořádání: sloka – refrén – sloka – refrén – most – refrén. Funguje, protože posluchač slyší refrén třikrát a podruhé už ho zná.",
      { nadpis: "Kontrast dělá píseň" },
      "Když je sloka klidná, refrén ať je hlasitý. Když sloka běží po osminách, ať refrén dýchá v celých akordech. Dva stejně silné díly za sebou zní ploše.",
      "Délky držte v mocninách čtyř: čtyři nebo osm taktů na díl. Ucho to čeká a při jiné délce zbystří — což se dá použít schválně."
    ],
    zkuste: "Vezměte píseň, kterou máte rádi, a rozepište si její díly s délkami v taktech.",
    odkaz: { sekce: "skladani", popis: "Poskládat vlastní" }
  },
  {
    id: "postupy", uroven: "Tvoření", minut: 12,
    nazev: "Jak si vymyslet postup akordů",
    shrnuti: "Vyberte tóninu, vezměte akordy, které do ní patří, a hledejte pořadí, které vás baví.",
    text: [
      "Začněte tónikou a skončete na ní. Mezi tím je prostoru dost: v durové tónině máte na výběr I, ii, iii, IV, V, vi. Většina písní vystačí se čtyřmi.",
      { nadpis: "Osvědčené kostry" },
      { seznam: [
        "I–V–vi–IV — bezpečné a přívětivé. Zní jako většina rádia.",
        "vi–IV–I–V — totéž, ale začíná v moll, tedy vážněji.",
        "I–vi–IV–V — staré dobré padesátky.",
        "I–IV–V — lidovka a blues.",
        "ii–V–I — jazzová věta, s akordy m7, 7 a maj7."
      ] },
      { nadpis: "Jak to oživit" },
      { seznam: [
        "Vyměňte akord za jeho septakordovou verzi — G za G7 táhne k C mnohem silněji.",
        "Nechte bas jít po schodech: C, C/H, Am, Am/G. Akordy skoro stejné, pohyb jiný.",
        "Přidejte sus4 před návratem na tóniku — napětí a rozvedení.",
        "Přehoďte pořadí. Stejné čtyři akordy s jiným začátkem jsou jiná píseň."
      ] },
      "Rytmus je součást postupu. Dva takty na akord jsou klidné, akord na každou dobu je hnaný. Zkuste stejné čtyři akordy jednou pomalu, jednou svižně — jsou to dvě různé nálady.",
      { tip: "V sekci Skládání si postup naklikáte, pustíte dokola a rovnou k němu píšete text." }
    ],
    zkuste: "Vyberte tóninu, ve které se vám dobře zpívá, a postavte dva různé čtyřakordové postupy — jeden pro sloku, jeden pro refrén.",
    odkaz: { sekce: "skladani", popis: "Otevřít skládání" }
  },
  {
    id: "text", uroven: "Tvoření", minut: 12,
    nazev: "Melodie a text",
    shrnuti: "Nejdřív ať to jde zpívat. Chytré verše přijdou potom.",
    text: [
      "Melodii hledejte hlasem, ne na kytaře. Pusťte si postup dokola a broukejte přes něj cokoli, klidně nesmysly. To, co se vám vrací samo, bývá to nejlepší.",
      { nadpis: "Slabiky" },
      "Text musí sednout do rytmu. Počítejte slabiky v prvním verši a držte se stejného počtu v ostatních — nebo se od něj odchylte schválně a pravidelně. Přízvučné slabiky patří na doby: v češtině je přízvuk na první slabice slova, takže se to dá spočítat dopředu.",
      { nadpis: "Rýmy" },
      "Nejběžnější schémata jsou střídavé (A-B-A-B) a sdružené (A-A-B-B). Nepřesný rým (den – sen – zem) zní často líp než dokonalý, protože není tak vidět.",
      { nadpis: "O čem" },
      "Konkrétní věci fungují líp než pojmy. Ne „byl jsem smutný“, ale „nechal jsem kávu vystydnout“. Obraz si posluchač dosadí sám a věří mu víc.",
      { tip: "Nahrajte si první nápad hned do telefonu, i falešně a bez textu. Devět z deseti nápadů se do večera ztratí." }
    ],
    zkuste: "Na svůj postup zazpívejte první verš, který vám přijde na jazyk, a spočítejte v něm slabiky. Druhý verš napište na stejný počet.",
    odkaz: { sekce: "skladani", popis: "Psát text" }
  },

  /* ---------------- PÉČE ---------------- */
  {
    id: "udrzba", uroven: "Péče", minut: 10,
    nazev: "Struny, údržba a co si koupit",
    shrnuti: "Nástroj, který drží ladění a nedře prsty, se cvičí o dost líp.",
    text: [
      { nadpis: "Struny" },
      "Struny se mění, když ztratí lesk a zvuk zmatní — při denním hraní zhruba po měsíci nebo dvou. Vyměňte je po jedné, ne všechny naráz; krk pak nezmění tah. Novou strunu naviňte tak, aby závity šly na kolíku úhledně dolů, a konec ustřihněte.",
      "Začátečníkovi se lépe hraje na slabší sadu (na akustiku 011, na elektriku 009). Tvrdší sada zní plněji, ale bolí víc.",
      { nadpis: "Údržba" },
      { seznam: [
        "Po hraní přejeďte struny hadříkem — pot je ničí nejvíc.",
        "Kytaru neskladujte u topení ani na přímém slunci. Dřevo praská při suchém vzduchu, ideál je vlhkost 40–60 %.",
        "Když struny drnčí po celém hmatníku nebo jde hraní ztuha, nechte nastavit krk a výšku strun. Servis stojí pár stovek a udělá s hraním víc než nová kytara."
      ] },
      { nadpis: "Co si pořídit" },
      { seznam: [
        "Trsátka různých tvrdostí — tenká na doprovod, tvrdší na sólo. Stojí korunu, kupujte je po deseti, protože se ztrácejí.",
        "Kapodastr — nejlepší poměr ceny a užitku.",
        "Popruh, aby šlo hrát i vestoje, a stojan, aby kytara byla po ruce. Nástroj schovaný v pouzdře se cvičí míň.",
        "Ladička ne — máte ji tady."
      ] }
    ],
    zkuste: "Zkontrolujte, jestli struny nemají v místě hraní matné otlaky. Když ano, je čas na nové.",
    odkaz: null
  }
];

/* ============================================================
   CVIČEBNÍ PLÁN
   Osm týdnů, dvacet minut denně. Kdo cvičí míň často a déle,
   dojde pomaleji — ruka se učí opakováním, ne délkou.
   ============================================================ */
const PLAN = [
  { tyden: 1, cil: "Držení, ladění, první dva akordy",
    body: ["5 min: ladění a prázdné struny", "10 min: Em a Am, stavět a pouštět", "5 min: čtyři doby dolů na Em"] },
  { tyden: 2, cil: "Přechod Em ↔ Am v rytmu",
    body: ["5 min: rozcvička 1–2–3–4", "10 min: minutové změny Em → Am", "5 min: Kočka leze dírou"] },
  { tyden: 3, cil: "Přidat D a G",
    body: ["5 min: rozcvička", "10 min: G a D, minutové změny G → D", "5 min: Ovčáci, čtveráci"] },
  { tyden: 4, cil: "C a čtyřakordové kolečko",
    body: ["5 min: rozcvička", "10 min: kolečko C–G–Am–F pomalu s metronomem", "5 min: Holka modrooká"] },
  { tyden: 5, cil: "Rytmus pravé ruky",
    body: ["5 min: osminy na jednom akordu", "10 min: nejpoužívanější vzor", "5 min: píseň podle výběru"] },
  { tyden: 6, cil: "Bas a akord, zpěv při hraní",
    body: ["5 min: rozcvička", "10 min: bas–akord na C, G, Am, F", "5 min: zpívat a hrát zároveň"] },
  { tyden: 7, cil: "První barré a kapodastr",
    body: ["5 min: barré na 5. pražci", "10 min: Fmaj7 a F v písni", "5 min: kapodastr a transpozice"] },
  { tyden: 8, cil: "Melodie a vlastní postup",
    body: ["5 min: pentatonika v A", "10 min: Óda na radost nebo rozklad", "5 min: vymyslet vlastní čtyři akordy"] }
];

/* ============================================================
   SLOVNÍČEK
   ============================================================ */
const SLOVNIK = [
  { pojem: "Akord", vyklad: "Tři a víc tónů znějících naráz. Durový zní vesele, mollový posmutněle." },
  { pojem: "Barré", vyklad: "Jeden prst tiskne víc strun najednou a dělá tak posunutý nultý pražec." },
  { pojem: "Bend", vyklad: "Vytažení struny do strany, čímž tón stoupne. Značí se b." },
  { pojem: "Doba", vyklad: "Základní tep písně, to, co ťukáte nohou." },
  { pojem: "Dominanta", vyklad: "Pátý stupeň tóniny. Vytváří napětí a táhne zpátky k tónice." },
  { pojem: "Hammer-on", vyklad: "Rozeznění tónu přiklepnutím prstu bez brnknutí. Značí se h." },
  { pojem: "Interval", vyklad: "Vzdálenost mezi dvěma tóny, měřená v půltónech (pražcích)." },
  { pojem: "Kapodastr", vyklad: "Svorka přes všechny struny; posune celou kytaru o daný počet půltónů výš." },
  { pojem: "Kvinta", vyklad: "Interval sedmi půltónů. Spolu se základním tónem tvoří mocný akord." },
  { pojem: "Menzura", vyklad: "Délka kmitající části struny — od nultého pražce ke kobylce." },
  { pojem: "Oktáva", vyklad: "Dvanáct půltónů. Tentýž tón o patro výš; na kytaře dvanáctý pražec." },
  { pojem: "Palm mute", vyklad: "Tlumení strun hranou dlaně u kobylky. Zvuk je dusný a krátký. Značí se PM." },
  { pojem: "Pentatonika", vyklad: "Pětitónová stupnice. Nejpoužívanější základ sól." },
  { pojem: "Pull-off", vyklad: "Rozeznění nižšího tónu stržením prstu ze struny. Značí se p." },
  { pojem: "Půltón", vyklad: "Nejmenší krok — jeden pražec." },
  { pojem: "Rozklad", vyklad: "Akord hraný po jednotlivých tónech místo naráz." },
  { pojem: "Septakord", vyklad: "Akord se čtvrtým tónem navíc (například G7). Zní neuzavřeně a někam vede." },
  { pojem: "Stupnice", vyklad: "Vybraná řada tónů, ze které vyrůstá melodie i akordy tóniny." },
  { pojem: "Sus", vyklad: "Akord bez tercie: nezní vesele ani smutně, jen visí ve vzduchu." },
  { pojem: "Synkopa", vyklad: "Přízvuk mimo dobu. To, co dělá rytmus zajímavým." },
  { pojem: "Takt", vyklad: "Skupinka dob, která se pravidelně opakuje. Nejčastěji čtyři." },
  { pojem: "Tónika", vyklad: "První stupeň tóniny — domov, kde píseň začíná a končí." },
  { pojem: "Tónina", vyklad: "Sada tónů a akordů, ve které se píseň pohybuje. Určuje ji základní tón a to, jestli je dur nebo moll." },
  { pojem: "Transpozice", vyklad: "Posun celé písně do jiné tóniny — všechny akordy o stejný počet půltónů." },
  { pojem: "Vibrato", vyklad: "Drobné kolébání tónem po zahrání. Dodá mu život." }
];
