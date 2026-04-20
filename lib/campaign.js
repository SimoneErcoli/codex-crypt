export const ENCRYPTION_FORMAT = "codex-crypt.enc.v1";
export const ENCRYPTION_ITERATIONS = 250000;
export const MAP_HINT_TEXT =
  "Nessuna mappa caricata. Puoi usare la demo o aggiungere una tua immagine.";

const DATE_FORMATTER = new Intl.DateTimeFormat("it-IT", { dateStyle: "medium" });
const DATE_ONLY_FORMATTER_UTC = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "medium",
  timeZone: "UTC",
});
const DATETIME_FORMATTER_UTC = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export const DEMO_MAP_DATA_URL =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201400%20900%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22sky%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23f5ecd2%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23dac59d%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%221400%22%20height%3D%22900%22%20fill%3D%22url(%23sky)%22%2F%3E%3Cpath%20d%3D%22M0%20210%20C220%20140%20360%20320%20520%20240%20S860%20150%201080%20240%20S1280%20320%201400%20230%20L1400%200%20L0%200%20Z%22%20fill%3D%22%238ea48a%22%20opacity%3D%220.7%22%2F%3E%3Cpath%20d%3D%22M130%20700%20C250%20600%20430%20560%20550%20620%20S850%20760%201060%20660%20S1270%20560%201400%20640%20L1400%20900%20L0%20900%20Z%22%20fill%3D%22%239f8558%22%20opacity%3D%220.65%22%2F%3E%3Cpath%20d%3D%22M820%20150%20C920%20190%20970%20290%20960%20360%20C950%20440%201010%20520%201090%20550%22%20stroke%3D%22%23355c7d%22%20stroke-width%3D%2228%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%2F%3E%3Ccircle%20cx%3D%22320%22%20cy%3D%22350%22%20r%3D%22120%22%20fill%3D%22%23c0aa78%22%20opacity%3D%220.45%22%2F%3E%3Ccircle%20cx%3D%221090%22%20cy%3D%22280%22%20r%3D%22150%22%20fill%3D%22%23b7925a%22%20opacity%3D%220.35%22%2F%3E%3Cpath%20d%3D%22M640%20420%20L710%20470%20L690%20560%20L600%20590%20L520%20510%20L550%20430%20Z%22%20fill%3D%22%236d5d47%22%20opacity%3D%220.65%22%2F%3E%3Ctext%20x%3D%22200%22%20y%3D%22190%22%20font-family%3D%22Georgia%2C%20serif%22%20font-size%3D%2242%22%20fill%3D%22%233b2417%22%3EForesta%20di%20Vetra%3C%2Ftext%3E%3Ctext%20x%3D%22790%22%20y%3D%22120%22%20font-family%3D%22Georgia%2C%20serif%22%20font-size%3D%2244%22%20fill%3D%22%232d3b4d%22%3EFiume%20Lungo%3C%2Ftext%3E%3Ctext%20x%3D%22520%22%20y%3D%22660%22%20font-family%3D%22Georgia%2C%20serif%22%20font-size%3D%2248%22%20fill%3D%22%234b2f20%22%3ECripta%20di%20Cenere%3C%2Ftext%3E%3C%2Fsvg%3E";

export const DEMO_CAMPAIGN = {
  world_name: "Terre Alte",
  summary:
    "Un regno a pezzi dove le vecchie cripte parlano ancora. Le carovane spariscono vicino alla [[Cripta di Cenere]] e la [[Locanda del Drago]] è il primo posto dove i segreti cambiano proprietario.",
  locations: [
    {
      id: "loc_drago",
      name: "Locanda del Drago",
      type: "Locanda",
      description:
        "Posto sporco ma economico. Mercanti e tagliagole si incontrano qui prima di entrare nella Foresta di Vetra.",
      aliases: ["Drago"],
    },
    {
      id: "loc_cripta",
      name: "Cripta di Cenere",
      type: "Rovina",
      description:
        "Sepolcro sotterraneo inciso sotto le colline. Le pareti reagiscono al nome di [[Grog]].",
    },
    {
      id: "loc_fiume",
      name: "Fiume Lungo",
      type: "Confine naturale",
      description:
        "Taglia in due le Terre Alte. Chi controlla i traghetti del Fiume Lungo controlla i rifornimenti verso la Locanda del Drago.",
    },
  ],
  npcs: [
    {
      id: "npc_grog",
      name: "Grog",
      race: "Orco",
      role: "Buttafuori",
      location_ref: "loc_drago",
      description:
        "Ex soldato al soldo di una casata decaduta. Beve troppo, ma ha visto chi entra davvero nella Cripta di Cenere.",
    },
    {
      id: "npc_selyra",
      name: "Selyra",
      race: "Elfa",
      role: "Cartografa",
      location_ref: "loc_fiume",
      description:
        "Vende mappe incompiute con note scritte in cifrario. Sospetta che sotto il Fiume Lungo esista un secondo accesso alla cripta.",
    },
  ],
  events: [
    {
      id: "evt_01",
      date: "2026-04-02",
      title: "Le campane tacciono",
      description:
        "L'ultimo villaggio vicino alla Foresta di Vetra smette di inviare offerte al tempio. Si parla di fumo freddo sotto la collina.",
      related_refs: ["loc_cripta"],
    },
    {
      id: "evt_02",
      date: "2026-04-10",
      title: "Selyra torna con una mappa bruciata",
      description:
        "La cartografa vende una pergamena incompleta che indica la posizione di un ingresso segreto verso la [[Cripta di Cenere]].",
      related_refs: ["npc_selyra", "loc_cripta"],
    },
  ],
  session_log: {
    entries: [
      {
        id: "session_01",
        title: "Sessione 06 - Il patto del traghettatore",
        played_on: "2026-04-18",
        body:
          "Il gruppo interroga [[Grog]] alla [[Locanda del Drago]], poi corrompe un traghettatore sul [[Fiume Lungo]]. Trovato un frammento di ossidiana incisa.",
      },
    ],
  },
  map: {
    image_data: DEMO_MAP_DATA_URL,
    image_width: 1400,
    image_height: 900,
    markers: [
      {
        id: "marker_secret",
        x: 600,
        y: 510,
        x_ratio: 0.4286,
        y_ratio: 0.5667,
        label: "Ingresso segreto",
        note: "Parete cedevole dietro le tombe fratturate.",
        related_ref: "loc_cripta",
      },
      {
        id: "marker_watch",
        x: 320,
        y: 350,
        x_ratio: 0.2286,
        y_ratio: 0.3889,
        label: "Ritrovo dei cacciatori",
        note: "Punto dove Grog vede sparire le carovane.",
        related_ref: "npc_grog",
      },
    ],
  },
  metadata: {
    authoring_mode: "offline",
    updated_at: "2026-04-20T00:00:00.000Z",
  },
};

export const EMPTY_CAMPAIGN = {
  world_name: "",
  summary: "",
  locations: [],
  npcs: [],
  events: [],
  session_log: {
    entries: [],
  },
  map: {
    image_data: "",
    image_width: 0,
    image_height: 0,
    markers: [],
  },
  metadata: {
    authoring_mode: "offline",
    updated_at: "",
  },
};

const NAME_FRAGMENTS = {
  start: ["Va", "Gro", "Sel", "Tha", "Mer", "Ild", "Kar", "Dor", "Fen", "Ari", "Bel", "Rhu"],
  middle: ["la", "mo", "ri", "tha", "ven", "gor", "sha", "dun", "elis", "mar", "tor", "vyr"],
  end: ["n", "ra", "gorn", "iel", "os", "ar", "eth", "um", "is", "a", "ok", "or"],
};

const LOOT_TABLE = {
  adjective: ["antico", "inciso", "maledetto", "dorato", "sussurrante", "rituale", "consunto"],
  item: ["medaglione", "tomo", "pugnale", "sigillo", "anello", "reliquia", "fiala"],
  quirk: [
    "che vibra vicino ai morti",
    "coperto di cenere fredda",
    "legato a un casato perduto",
    "che proietta una mappa incompleta",
    "che si illumina accanto all'acqua",
    "marchiato con rune di debito",
  ],
};

export function normalizeCampaign(rawCampaign = {}) {
  const campaign = clone(rawCampaign || {});
  const usedIds = new Set();

  campaign.world_name = cleanText(campaign.world_name);
  campaign.summary = cleanText(campaign.summary);

  const rawLocations = Array.isArray(campaign.locations) ? campaign.locations : [];
  const rawNpcs = Array.isArray(campaign.npcs) ? campaign.npcs : [];
  const rawEvents = Array.isArray(campaign.events)
    ? campaign.events
    : Array.isArray(campaign.timeline)
      ? campaign.timeline
      : [];
  const legacySessionEntries = Array.isArray(campaign.session_notes) ? campaign.session_notes : [];
  const rawSessionLog = normalizeSessionLog(campaign.session_log, legacySessionEntries, usedIds);
  const sourceMap = campaign.map && typeof campaign.map === "object" ? clone(campaign.map) : {};
  const rawMarkers = Array.isArray(sourceMap.markers)
    ? sourceMap.markers
    : Array.isArray(campaign.map_markers)
      ? campaign.map_markers
      : [];

  campaign.locations = rawLocations.map((entry, index) => normalizeLocation(entry, index, usedIds));
  campaign.npcs = rawNpcs.map((entry, index) => normalizeNpc(entry, index, usedIds));
  campaign.events = rawEvents.map((entry, index) => normalizeEvent(entry, index, usedIds));
  campaign.session_log = rawSessionLog;
  campaign.map = {
    ...sourceMap,
    image_data: cleanText(sourceMap.image_data || campaign.map_image),
    image_width: numberOrZero(sourceMap.image_width || campaign.map_width),
    image_height: numberOrZero(sourceMap.image_height || campaign.map_height),
    markers: rawMarkers.map((entry, index) =>
      normalizeMarker(
        entry,
        index,
        usedIds,
        sourceMap.image_width || campaign.map_width,
        sourceMap.image_height || campaign.map_height,
      ),
    ),
  };

  campaign.metadata = {
    ...(campaign.metadata || {}),
    updated_at: campaign.metadata?.updated_at || "",
  };

  delete campaign.timeline;
  delete campaign.session_notes;
  delete campaign.map_markers;
  delete campaign.map_image;
  delete campaign.map_width;
  delete campaign.map_height;

  return campaign;
}

function normalizeLocation(entry, index, usedIds) {
  const location = objectOrEmpty(entry);
  location.id = ensureId(location.id, "loc", location.name, index, usedIds);
  location.name = cleanText(location.name) || `Luogo ${index + 1}`;
  location.type = cleanText(location.type || location.category) || "Punto d'interesse";
  location.description = cleanText(location.description);
  location.aliases = normalizeAliases(location.aliases || location.alias);
  return location;
}

function normalizeNpc(entry, index, usedIds) {
  const npc = objectOrEmpty(entry);
  npc.id = ensureId(npc.id, "npc", npc.name, index, usedIds);
  npc.name = cleanText(npc.name) || `NPC ${index + 1}`;
  npc.race = cleanText(npc.race);
  npc.role = cleanText(npc.role);
  npc.description = cleanText(npc.description);
  npc.location_ref = cleanText(npc.location_ref);
  npc.aliases = normalizeAliases(npc.aliases || npc.alias);
  return npc;
}

function normalizeEvent(entry, index, usedIds) {
  const eventEntry = objectOrEmpty(entry);
  eventEntry.id = ensureId(eventEntry.id, "evt", eventEntry.title, index, usedIds);
  eventEntry.title = cleanText(eventEntry.title) || `Evento ${index + 1}`;
  eventEntry.description = cleanText(eventEntry.description || eventEntry.body);
  eventEntry.date = cleanText(eventEntry.date);
  eventEntry.related_refs = Array.isArray(eventEntry.related_refs)
    ? eventEntry.related_refs.map((ref) => cleanText(ref)).filter(Boolean)
    : parseRefList(cleanText(eventEntry.related_refs));
  return eventEntry;
}

function normalizeSessionLog(rawSessionLog, legacyEntries, usedIds) {
  const source = Array.isArray(rawSessionLog)
    ? { entries: rawSessionLog }
    : objectOrEmpty(rawSessionLog);
  const entries = Array.isArray(source.entries) ? source.entries : legacyEntries;
  return {
    ...source,
    entries: entries.map((entry, index) => normalizeSessionEntry(entry, index, usedIds)),
  };
}

function normalizeSessionEntry(entry, index, usedIds) {
  const sessionEntry = objectOrEmpty(entry);
  sessionEntry.id = ensureId(sessionEntry.id, "session", sessionEntry.title, index, usedIds);
  sessionEntry.title = cleanText(sessionEntry.title) || `Sessione ${index + 1}`;
  sessionEntry.played_on = cleanText(sessionEntry.played_on || sessionEntry.date);
  sessionEntry.body = cleanText(sessionEntry.body || sessionEntry.notes);
  return sessionEntry;
}

function normalizeMarker(entry, index, usedIds, imageWidth, imageHeight) {
  const marker = objectOrEmpty(entry);
  marker.id = ensureId(marker.id, "marker", marker.label, index, usedIds);
  marker.label = cleanText(marker.label) || `Marker ${index + 1}`;
  marker.note = cleanText(marker.note || marker.description);
  marker.related_ref = cleanText(marker.related_ref);
  marker.x = numberOrZero(marker.x);
  marker.y = numberOrZero(marker.y);
  const numericXRatio = Number(marker.x_ratio);
  const numericYRatio = Number(marker.y_ratio);

  if (Number.isFinite(numericXRatio)) {
    marker.x_ratio = clamp(numericXRatio, 0, 1);
  } else if (imageWidth) {
    marker.x_ratio = clamp(marker.x / imageWidth, 0, 1);
  } else if (marker.x <= 100) {
    marker.x_ratio = clamp(marker.x / 100, 0, 1);
  } else {
    marker.x_ratio = 0.5;
  }

  if (Number.isFinite(numericYRatio)) {
    marker.y_ratio = clamp(numericYRatio, 0, 1);
  } else if (imageHeight) {
    marker.y_ratio = clamp(marker.y / imageHeight, 0, 1);
  } else if (marker.y <= 100) {
    marker.y_ratio = clamp(marker.y / 100, 0, 1);
  } else {
    marker.y_ratio = 0.5;
  }

  return marker;
}

export function buildEntityBundle(campaign) {
  const byId = new Map();
  const byName = new Map();
  const patterns = [];

  const register = (item, type) => {
    const entity = {
      ...item,
      type,
      typeValue: type === "location" ? item.type : item.role,
      typeLabel: type === "location" ? item.type : item.role,
    };

    byId.set(item.id, entity);

    const terms = [item.name].concat(item.aliases || []).filter(Boolean);
    for (const term of terms) {
      const normalized = normalizeLookup(term);
      if (normalized && !byName.has(normalized)) {
        byName.set(normalized, entity);
      }

      if (term.length >= 3) {
        patterns.push({ entityId: entity.id, term });
      }
    }
  };

  campaign.locations.forEach((location) => register(location, "location"));
  campaign.npcs.forEach((npc) => register(npc, "npc"));
  patterns.sort((left, right) => right.term.length - left.term.length);

  return { byId, byName, patterns };
}

export function renderRichText(value, bundle) {
  const safeText = escapeHtml(cleanText(value));
  if (!safeText) {
    return '<span class="muted">Nessun contenuto.</span>';
  }

  const placeholders = [];
  let processed = safeText.replace(/\[\[([^[\]]+)\]\]/g, (match, rawLabel) => {
    const entity = bundle.byName.get(normalizeLookup(rawLabel));
    if (!entity) {
      return `[[${rawLabel}]]`;
    }

    return createPlaceholder(placeholders, renderEntityLink(entity.id, rawLabel));
  });

  for (const pattern of bundle.patterns) {
    const regex = new RegExp(
      `(^|[^\\p{L}\\p{N}_])(${escapeRegex(escapeHtml(pattern.term))})(?=$|[^\\p{L}\\p{N}_])`,
      "giu",
    );
    processed = processed.replace(regex, (match, prefix, label) => {
      const placeholder = createPlaceholder(placeholders, renderEntityLink(pattern.entityId, label));
      return `${prefix}${placeholder}`;
    });
  }

  processed = processed.replace(/\n/g, "<br />");
  return restorePlaceholders(processed, placeholders);
}

export function renderEntityLink(entityId, label) {
  return `<button class="entity-link" type="button" data-action="focus-entity" data-entity-id="${escapeAttribute(
    entityId,
  )}">${escapeHtml(label)}</button>`;
}

export function createUniqueId(campaign, prefix, seed) {
  const usedIds = new Set([
    ...campaign.locations.map((entry) => entry.id),
    ...campaign.npcs.map((entry) => entry.id),
    ...campaign.events.map((entry) => entry.id),
    ...campaign.session_log.entries.map((entry) => entry.id),
    ...campaign.map.markers.map((entry) => entry.id),
  ]);
  return ensureId("", prefix, seed, usedIds.size, usedIds);
}

export function serializeCampaign(campaign) {
  return JSON.stringify(clone(campaign), null, 2);
}

export function getLastSessionEntry(campaign) {
  return [...campaign.session_log.entries].sort(compareEntriesByDate).reverse()[0] || null;
}

export function compareEntriesByDate(left, right) {
  const leftTime = parseDateValue(left.date || left.played_on);
  const rightTime = parseDateValue(right.date || right.played_on);
  return leftTime - rightTime;
}

function parseDateValue(value) {
  if (!value) {
    return Number.MIN_SAFE_INTEGER;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? Number.MIN_SAFE_INTEGER : date.getTime();
}

export function formatDate(value) {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return DATE_ONLY_FORMATTER_UTC.format(new Date(Date.UTC(year, month - 1, day)));
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : DATE_FORMATTER.format(date);
}

export function formatDateTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : DATETIME_FORMATTER_UTC.format(date);
}

export function markerToPercent(marker, mapState) {
  let left = typeof marker.x_ratio === "number" ? marker.x_ratio * 100 : 0;
  let top = typeof marker.y_ratio === "number" ? marker.y_ratio * 100 : 0;

  if (!left && marker.x) {
    if (mapState.image_width) {
      left = (marker.x / mapState.image_width) * 100;
    } else if (marker.x <= 100) {
      left = marker.x;
    }
  }

  if (!top && marker.y) {
    if (mapState.image_height) {
      top = (marker.y / mapState.image_height) * 100;
    } else if (marker.y <= 100) {
      top = marker.y;
    }
  }

  return {
    left: clamp(left, 0, 100).toFixed(2),
    top: clamp(top, 0, 100).toFixed(2),
  };
}

export function parseRefList(value) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => cleanText(entry))
    .filter(Boolean);
}

function normalizeAliases(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => cleanText(entry)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => cleanText(entry))
      .filter(Boolean);
  }

  return [];
}

export function normalizeLookup(value) {
  return cleanText(value)
    .toLocaleLowerCase("it")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function generateFantasyName() {
  const start = pick(NAME_FRAGMENTS.start);
  const middle = pick(NAME_FRAGMENTS.middle);
  const end = pick(NAME_FRAGMENTS.end);
  const maybeSecondMiddle = Math.random() > 0.65 ? pick(NAME_FRAGMENTS.middle) : "";
  return `${start}${middle}${maybeSecondMiddle}${end}`;
}

export function generateLootResult() {
  return `Un ${pick(LOOT_TABLE.item)} ${pick(LOOT_TABLE.adjective)} ${pick(LOOT_TABLE.quirk)}.`;
}

export function removeEntityReferences(campaign, entityId) {
  campaign.events = campaign.events.map((entry) => ({
    ...entry,
    related_refs: entry.related_refs.filter((ref) => ref !== entityId),
  }));
  campaign.map.markers = campaign.map.markers.map((entry) =>
    entry.related_ref === entityId ? { ...entry, related_ref: "" } : entry,
  );
  campaign.npcs = campaign.npcs.map((entry) =>
    entry.location_ref === entityId ? { ...entry, location_ref: "" } : entry,
  );
  return campaign;
}

export function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function numberOrZero(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pick(values) {
  return values[Math.floor(Math.random() * values.length)];
}

export function sanitizeFilename(value) {
  return slugify(value) || "campaign";
}

export function stripExtension(filename) {
  return filename.replace(/\.[^.]+$/, "");
}

function slugify(value) {
  return cleanText(value)
    .toLocaleLowerCase("it")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function ensureId(existingId, prefix, seed, index, usedIds) {
  const baseSeed = cleanText(existingId) || `${prefix}_${slugify(seed) || index + 1}`;
  let candidate = baseSeed;
  let suffix = 2;

  while (usedIds.has(candidate)) {
    candidate = `${baseSeed}_${suffix}`;
    suffix += 1;
  }

  usedIds.add(candidate);
  return candidate;
}

function objectOrEmpty(value) {
  return value && typeof value === "object" ? { ...value } : {};
}

export function clone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createPlaceholder(store, html) {
  const token = `@@CC_LINK_${store.length}@@`;
  store.push(html);
  return token;
}

function restorePlaceholders(text, store) {
  return store.reduce(
    (output, html, index) => output.replaceAll(`@@CC_LINK_${index}@@`, html),
    text,
  );
}

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Lettura file non riuscita."));
    reader.readAsText(file);
  });
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Lettura immagine non riuscita."));
    reader.readAsDataURL(file);
  });
}

export function readImageDimensions(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Impossibile leggere le dimensioni della mappa."));
    image.src = dataUrl;
  });
}

export function downloadText(content, filename, type) {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function isEncryptedEnvelope(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      value.format === ENCRYPTION_FORMAT &&
      value.iv &&
      value.ciphertext &&
      value.kdf?.salt,
  );
}

export async function encryptCampaignText(plaintext, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(password, salt, ENCRYPTION_ITERATIONS);
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);

  return {
    format: ENCRYPTION_FORMAT,
    algorithm: "AES-GCM",
    created_at: new Date().toISOString(),
    kdf: {
      name: "PBKDF2",
      hash: "SHA-256",
      iterations: ENCRYPTION_ITERATIONS,
      salt: bytesToBase64(salt),
    },
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

export async function decryptCampaignEnvelope(envelope, password) {
  try {
    const salt = base64ToBytes(envelope.kdf.salt);
    const iv = base64ToBytes(envelope.iv);
    const key = await deriveAesKey(
      password,
      salt,
      Number(envelope.kdf.iterations) || ENCRYPTION_ITERATIONS,
    );
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      base64ToBytes(envelope.ciphertext),
    );

    return new TextDecoder().decode(plaintext);
  } catch {
    throw new Error("Password errata o archivio cifrato non valido.");
  }
}

async function deriveAesKey(password, salt, iterations) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"],
  );
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const slice = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...slice);
  }

  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}
