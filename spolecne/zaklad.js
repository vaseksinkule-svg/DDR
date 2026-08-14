"use strict";
/* ============================================================
   Interall — sdílený základ
   Pomocné funkce, které používá každá aplikace: formátování
   částek a čísel v češtině, ošetření textu a trvalé uložení
   rozdělané práce do prohlížeče.
   ============================================================ */

/* ---------- text ---------- */
function esc(s) {
  return String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

/* ---------- čísla a částky ---------- */
function kc(n) {
  return Math.round(n).toLocaleString("cs-CZ").replace(/ /g, " ") + " Kč";
}

/* Částka bez měny — do úzkých sloupců, kde se „Kč" nevejde. */
function kcKratce(n) { return Math.round(n).toLocaleString("cs-CZ"); }

function cislo(n) {
  const s = Number(n).toLocaleString("cs-CZ", { maximumFractionDigits: 1 });
  return s.replace(/ /g, " ");
}

/* ---------- barvy ---------- */
/* Relativní jas vzorku — podle něj se volí barva popisku. */
function jeSvetla(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 150;
}

/* ---------- uložení rozdělané práce ----------
   Tablet uspí obrazovku, prohlížeč spadne, někdo omylem zavře
   panel — rozdělaná schůzka se tím nesmí ztratit. */
function ulozStav(klic, data) {
  try { localStorage.setItem(klic, JSON.stringify(data)); } catch (e) {}
}

function nactiStav(klic, vychozi) {
  try {
    const r = localStorage.getItem(klic);
    if (r) return Object.assign(vychozi, JSON.parse(r));
  } catch (e) {}
  return vychozi;
}
