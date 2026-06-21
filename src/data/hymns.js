// Datos del Repertorio Universal del Coro — ORFEONES 2025
// Títulos y páginas del índice impreso. Autores/arreglos son datos de muestra.

const RAW = [
  ["A Él Oíd y Recibid",          1,   "Elección"],
  ["A La Diestra De Dios",         3,   "Adoración"],
  ["A Los Pies Del Salvador",      4,   "Consagración"],
  ["A Solas Al Huerto",            8,   "Oración"],
  ["A Veces Me Pregunto",          9,   "Consuelo"],
  ["Al Amparo De La Roca",         11,  "Consuelo"],
  ["Al Despertar Por La Mañana",   13,  "Adoración"],
  ["Al Divino Salvador",           14,  "Adoración"],
  ["Al Sonar De La Trompeta",      16,  "Segunda Venida"],
  ["Alabad Aleluya",               19,  "Júbilo"],
  ["Alabo Tu Voluntad",            24,  "Consagración"],
  ["Alcance Salvación",            26,  "Júbilo"],
  ["Aleluya",                      27,  "Adoración"],
  ["Aleluya Al Cordero De Dios",   35,  "Adoración"],
  ["Aleluya Al Rey",               37,  "Adoración"],
  ["Aleluya Oh Creador",           46,  "Adoración"],
  ["Alzaré Mis Ojos A Los Montes", 49,  "Oración"],
  ["Ante Tu Altar",                53,  "Oración"],
  ["Apocalipsis 14:6",             54,  "Segunda Venida"],
  ["Ayúdame A Amarle",             62,  "Consagración"],
  ["Barro En Tus Manos",           66,  "Consagración"],
  ["Bendita Elección",             68,  "Elección"],
  ["Bendito Amor",                 70,  "Adoración"],
  ["Bendito Dios",                 71,  "Adoración"],
  ["Bendito El Que Viene",         74,  "Segunda Venida"],
  ["Cada Paso",                    76,  "Consagración"],
  ["Cada Paso Al Caminar",         77,  "Consagración"],
  ["Cantad A Jehová Nuestro Dios", 82,  "Júbilo"],
  ["Cantemos Con Alegría",         83,  "Júbilo"],
  ["Cantemos Su Victoria",         85,  "Júbilo"],
  ["Casa De Dios",                 87,  "Adoración"],
  ["Celestial Ciudad",             89,  "Segunda Venida"],
  ["Cerca De Ti",                  90,  "Oración"],
  ["Ciertamente Casa De Dios",     91,  "Adoración"],
  ["Con Gran Gozo Y Placer",       97,  "Júbilo"],
  ["Con Más Fuerza",               98,  "Consagración"],
  ["Con Mis Manos Hacia El Cielo", 102, "Adoración"],
  ["Con Reverencia",               104, "Adoración"],
  ["Con Todo Mi Ser",              105, "Consagración"],
  ["Contigo Estoy Tan Feliz",      107, "Júbilo"],
  ["Coros Celestiales",            109, "Segunda Venida"],
  ["Creed En Jehová",              111, "Consagración"],
  ["Creo En Ti",                   113, "Consagración"],
  ["Cuando Estemos En El Cielo",   115, "Segunda Venida"],
  ["Cuando Oí Su Voz",             116, "Elección"],
  ["Cuerdas De Amor",              119, "Consagración"],
  ["De Lo Profundo",               124, "Oración"],
  ["De Su Mano",                   125, "Consuelo"],
  ["Del Celeste País",             127, "Segunda Venida"],
  ["Dile",                         129, "Consuelo"],
  ["Dios Os Guarde",               131, "Despedida"],
  ["Dios Proveerá",                132, "Consuelo"],
  ["Divino Jesús",                 135, "Adoración"],
  ["Doy Gracias Al Señor",         140, "Júbilo"],
  ["Dulce Oración",                142, "Oración"],
  ["El Aliento De Mi Ser",         143, "Consagración"],
  ["El Amor De Mi Cristo",         146, "Adoración"],
  ["El Amor Del Señor Es Infinito",149, "Adoración"],
  ["El Año Que Se Va",             151, "Despedida"],
  ["El Apóstol De La Consolación", 152, "Elección"],
  ["El Canto Triunfal",            158, "Segunda Venida"],
  ["El Consuelo De Mi Alma",       160, "Consuelo"],
  ["El Dios De Mi Padre",          166, "Adoración"],
  ["El Lema De La Iglesia",        168, "Elección"],
  ["El León De Judá",              172, "Adoración"],
  ["El Llamamiento",               178, "Elección"],
  ["El Llamamiento De Dios",       184, "Elección"],
  ["El Manto De La Elección",      192, "Elección"],
  ["El Nombre Del Señor",          195, "Adoración"],
  ["El Nuevo Israel",              197, "Elección"],
  ["El Pacto Con Dios",            200, "Elección"],
  ["El Pueblo Feliz",              202, "Júbilo"],
  ["El Que Habita Al Abrigo",      204, "Consuelo"],
  ["El Regalo Más Grande",         205, "Navidad"],
  ["El Rey Ya Viene",              207, "Segunda Venida"],
  ["Elección",                     211, "Elección"],
  ["Elección Apostólica",          213, "Elección"],
  ["En Belén Nació",               219, "Navidad"],
  ["En El Firmamento",             222, "Adoración"],
  ["En Las Alas De Su Amor",       224, "Consuelo"],
  ["En Las Mañanas De Bendición",  225, "Adoración"],
  ["En Memoria Tuya Es Hecho",     226, "Comunión"],
  ["En Mi Alma Hay Una Bendición", 229, "Júbilo"],
  ["En Mi Camino",                 231, "Consagración"],
  ["En Su Corazón",                232, "Consagración"],
  ["En Tu Amor, Señor",            234, "Adoración"],
];

const ARREGLOS = [
  "Gerson & Fabián Linares",
  "Mardoqueo Castellanos",
  "Equipo de Arreglos Orfeones",
  "Fabián Linares",
  "Daniel Aguilar",
];

const AUTORES = [
  "Abel Aguilar Palacios",
  "Coro Universal del Coro",
  "Tradicional",
  "Rubén Pérez",
  "Samuel Mendoza",
];

const COMPASES = ["4/4", "3/4", "6/8", "2/4"];

export const CATEGORIES = [
  { name: "Adoración",      color: "#9a7a2e" },
  { name: "Elección",       color: "#1d2a5c" },
  { name: "Consagración",   color: "#7a3b4c" },
  { name: "Oración",        color: "#2f6f6a" },
  { name: "Júbilo",         color: "#b06a1f" },
  { name: "Segunda Venida", color: "#3a4a8c" },
  { name: "Consuelo",       color: "#566072" },
  { name: "Navidad",        color: "#3a6b4a" },
  { name: "Comunión",       color: "#7d5a8c" },
  { name: "Despedida",      color: "#8a6a3a" },
];

export const CAT_COLOR = Object.fromEntries(CATEGORIES.map(c => [c.name, c.color]));

// IDs de himnos que tienen partitura PDF disponible en assets/himnos/{id}/partitura.pdf
const HAS_PDF = new Set([1]);

// IDs de himnos que tienen audios por voz en assets/himnos/{id}/{voz}.mp3
const HAS_AUDIO = new Set([1]);

const VOICES = ["soprano", "contralto", "tenor", "bajo", "ensamble"];

export const HYMNS = RAW.map((r, i) => {
  const id = i + 1;
  return {
    id,
    title:    r[0],
    page:     r[1],
    category: r[2],
    pdf:      HAS_PDF.has(id) ? `assets/himnos/${id}/partitura.pdf` : null,
    color:    CAT_COLOR[r[2]] || "#1d2a5c",
    arreglos: ARREGLOS[i % ARREGLOS.length],
    autor:    AUTORES[(i * 3) % AUTORES.length],
    tempo:    60 + ((i * 11) % 72),
    compas:   COMPASES[i % COMPASES.length],
    voces:    ["Soprano", "Contralto", "Tenor", "Bajo", "Ensamble"],
    youtube:  null,
    audios:   HAS_AUDIO.has(id)
                ? VOICES.map(v => ({ voice: v, url: `assets/himnos/${id}/${v}.mp3` }))
                : [],
  };
});

/** Normaliza texto para búsqueda: minúsculas sin acentos */
export function norm(s) {
  return (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
