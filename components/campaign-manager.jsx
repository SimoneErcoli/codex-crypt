"use client";

import { useRef, useState } from "react";
import {
  EMPTY_CAMPAIGN,
  MAP_HINT_TEXT,
  DEMO_CAMPAIGN,
  buildEntityBundle,
  cleanText,
  clone,
  compareEntriesByDate,
  createUniqueId,
  decryptCampaignEnvelope,
  downloadText,
  encryptCampaignText,
  formatDate,
  formatDateTime,
  generateFantasyName,
  generateLootResult,
  getLastSessionEntry,
  isEncryptedEnvelope,
  markerToPercent,
  normalizeCampaign,
  parseRefList,
  readFileAsDataUrl,
  readFileAsText,
  readImageDimensions,
  removeEntityReferences,
  renderRichText,
  sanitizeFilename,
  serializeCampaign,
  stripExtension,
  todayISO,
} from "../lib/campaign";

const INITIAL_CAMPAIGN = normalizeCampaign(clone(EMPTY_CAMPAIGN));

const EMPTY_LOCATION_FORM = {
  name: "",
  type: "",
  description: "",
};

const EMPTY_NPC_FORM = {
  name: "",
  race: "",
  role: "",
  location_ref: "",
  description: "",
};

const EMPTY_EVENT_FORM = {
  title: "",
  date: "",
  related_refs: "",
  description: "",
};

const EMPTY_SESSION_FORM = {
  title: "",
  played_on: "",
  body: "",
};

const EMPTY_MARKER_FORM = {
  label: "",
  note: "",
  related_ref: "",
};

function RichMarkup({ value, bundle, onEntityAction, className = "text-block" }) {
  return (
    <div
      className={className}
      onClick={onEntityAction}
      dangerouslySetInnerHTML={{ __html: renderRichText(value, bundle) }}
    />
  );
}

export default function CampaignManager() {
  const mapSurfaceRef = useRef(null);
  const [campaign, setCampaign] = useState(INITIAL_CAMPAIGN);
  const [fileBaseName, setFileBaseName] = useState("");
  const [activeEntityId, setActiveEntityId] = useState(
    INITIAL_CAMPAIGN.npcs[0]?.id || INITIAL_CAMPAIGN.locations[0]?.id || null,
  );
  const [activeMarkerId, setActiveMarkerId] = useState(INITIAL_CAMPAIGN.map.markers[0]?.id || null);
  const [generator, setGenerator] = useState({ name: "", loot: "" });
  const [mapPlacementArmed, setMapPlacementArmed] = useState(false);
  const [archivePassword, setArchivePassword] = useState("");
  const [status, setStatus] = useState({
    tone: "warning",
    text: "Nessuna campagna caricata. Importa un file oppure inizia da zero.",
  });
  const [locationForm, setLocationForm] = useState(EMPTY_LOCATION_FORM);
  const [npcForm, setNpcForm] = useState(EMPTY_NPC_FORM);
  const [eventForm, setEventForm] = useState(EMPTY_EVENT_FORM);
  const [sessionForm, setSessionForm] = useState(EMPTY_SESSION_FORM);
  const [markerForm, setMarkerForm] = useState(EMPTY_MARKER_FORM);

  const entityBundle = buildEntityBundle(campaign);
  const activeEntity = activeEntityId ? entityBundle.byId.get(activeEntityId) : null;
  const activeMarker = activeMarkerId
    ? campaign.map.markers.find((entry) => entry.id === activeMarkerId) || null
    : null;
  const orderedEvents = [...campaign.events].sort(compareEntriesByDate);
  const orderedSessions = [...campaign.session_log.entries].sort(compareEntriesByDate).reverse();
  const sortedMarkers = [...campaign.map.markers].sort((left, right) =>
    left.label.localeCompare(right.label, "it"),
  );
  const lastSession = getLastSessionEntry(campaign);

  function resetEditorForms() {
    setLocationForm(EMPTY_LOCATION_FORM);
    setNpcForm(EMPTY_NPC_FORM);
    setEventForm(EMPTY_EVENT_FORM);
    setSessionForm(EMPTY_SESSION_FORM);
    setMarkerForm(EMPTY_MARKER_FORM);
  }

  function applyCampaign(rawCampaign, { fileBaseNameOverride, statusText, tone = "success" } = {}) {
    const normalized = normalizeCampaign(rawCampaign);
    setCampaign(normalized);
    setFileBaseName(sanitizeFilename(fileBaseNameOverride || normalized.world_name || "campaign"));
    setActiveEntityId(normalized.npcs[0]?.id || normalized.locations[0]?.id || null);
    setActiveMarkerId(normalized.map.markers[0]?.id || null);
    setMapPlacementArmed(false);
    setGenerator({ name: "", loot: "" });
    setStatus({
      tone,
      text: statusText || "Campagna pronta.",
    });
    resetEditorForms();
  }

  function commitCampaign(
    nextCampaign,
    {
      message,
      tone = "success",
      nextEntityId = activeEntityId,
      nextMarkerId = activeMarkerId,
      fileBaseNameOverride,
      nextMapPlacementArmed = mapPlacementArmed,
    } = {},
  ) {
    const touchedCampaign = clone(nextCampaign);
    touchedCampaign.metadata = {
      ...(touchedCampaign.metadata || {}),
      updated_at: new Date().toISOString(),
    };

    const normalized = normalizeCampaign(touchedCampaign);
    const nextBundle = buildEntityBundle(normalized);
    const resolvedEntityId =
      nextEntityId && nextBundle.byId.has(nextEntityId)
        ? nextEntityId
        : normalized.npcs[0]?.id || normalized.locations[0]?.id || null;
    const markerExists = normalized.map.markers.some((entry) => entry.id === nextMarkerId);
    const resolvedMarkerId = markerExists ? nextMarkerId : normalized.map.markers[0]?.id || null;

    setCampaign(normalized);
    setFileBaseName(
      sanitizeFilename(fileBaseNameOverride || fileBaseName || normalized.world_name || "campaign"),
    );
    setActiveEntityId(resolvedEntityId);
    setActiveMarkerId(resolvedMarkerId);
    setMapPlacementArmed(nextMapPlacementArmed);
    setStatus({
      tone,
      text: message,
    });
  }

  function handleEntityAction(event) {
    const button = event.target.closest("[data-action='focus-entity']");
    if (!button) {
      return;
    }

    const entityId = button.dataset.entityId;
    if (!entityId || !entityBundle.byId.has(entityId)) {
      return;
    }

    setActiveEntityId(entityId);
    setActiveMarkerId(null);
  }

  function handleLoadDemo() {
    applyCampaign(DEMO_CAMPAIGN, {
      fileBaseNameOverride: "terre-alte",
      statusText: "Demo caricata. Il file è pronto per essere modificato o esportato.",
    });
  }

  async function handleCampaignImport(event) {
    const [file] = event.target.files || [];
    if (!file) {
      return;
    }

    try {
      const rawText = await readFileAsText(file);
      const parsed = JSON.parse(rawText);
      let campaignData = parsed;
      let statusText = `Campagna "${file.name}" caricata.`;

      if (isEncryptedEnvelope(parsed)) {
        if (!archivePassword) {
          throw new Error("Inserisci la password archivio prima di aprire un file cifrato.");
        }

        const decryptedText = await decryptCampaignEnvelope(parsed, archivePassword);
        campaignData = JSON.parse(decryptedText);
        statusText = `Archivio cifrato "${file.name}" decriptato correttamente.`;
      }

      applyCampaign(campaignData, {
        fileBaseNameOverride: stripExtension(file.name),
        statusText,
      });
    } catch (error) {
      setStatus({
        tone: "error",
        text: error.message || "Impossibile caricare il file selezionato.",
      });
    } finally {
      event.target.value = "";
    }
  }

  function handlePlainExport() {
    const payload = serializeCampaign(normalizeCampaign(clone(campaign)));
    downloadText(payload, `${fileBaseName || "campaign"}.json`, "application/json");
    setStatus({
      tone: "success",
      text: "JSON esportato. Il file contiene l'intero stato corrente della campagna.",
    });
  }

  async function handleEncryptedExport() {
    try {
      if (!archivePassword) {
        throw new Error("Inserisci una password per esportare l'archivio cifrato.");
      }

      if (!globalThis.crypto?.subtle) {
        throw new Error("Web Crypto non disponibile in questo browser.");
      }

      const plaintext = serializeCampaign(normalizeCampaign(clone(campaign)));
      const envelope = await encryptCampaignText(plaintext, archivePassword);
      downloadText(
        JSON.stringify(envelope, null, 2),
        `${fileBaseName || "campaign"}.enc`,
        "application/json",
      );
      setStatus({
        tone: "success",
        text: "Archivio cifrato esportato. Serve la stessa password per riaprire il file.",
      });
    } catch (error) {
      setStatus({
        tone: "error",
        text: error.message || "Esportazione cifrata non riuscita.",
      });
    }
  }

  function handleWorldNameChange(event) {
    setCampaign({
      ...campaign,
      world_name: event.target.value,
    });
  }

  function handleWorldNameBlur() {
    commitCampaign(
      {
        ...campaign,
        world_name: cleanText(campaign.world_name),
      },
      {
        message: "Nome del mondo aggiornato.",
      },
    );
  }

  function handleWorldSummaryChange(event) {
    setCampaign({
      ...campaign,
      summary: event.target.value,
    });
  }

  function handleWorldSummaryBlur() {
    commitCampaign(
      {
        ...campaign,
        summary: cleanText(campaign.summary),
      },
      {
        message: "Sintesi campagna aggiornata.",
      },
    );
  }

  function handleLocationSubmit(event) {
    event.preventDefault();
    const name = cleanText(locationForm.name);

    if (!name) {
      setStatus({
        tone: "warning",
        text: "Il luogo richiede almeno un nome.",
      });
      return;
    }

    const nextCampaign = clone(campaign);
    const newLocation = {
      id: createUniqueId(nextCampaign, "loc", name),
      name,
      type: cleanText(locationForm.type) || "Punto d'interesse",
      description: cleanText(locationForm.description),
    };

    nextCampaign.locations.unshift(newLocation);
    setLocationForm(EMPTY_LOCATION_FORM);
    commitCampaign(nextCampaign, {
      message: `Luogo "${name}" aggiunto.`,
      nextEntityId: newLocation.id,
      nextMarkerId: null,
    });
  }

  function handleNpcSubmit(event) {
    event.preventDefault();
    const name = cleanText(npcForm.name);

    if (!name) {
      setStatus({
        tone: "warning",
        text: "L'NPC richiede almeno un nome.",
      });
      return;
    }

    const nextCampaign = clone(campaign);
    const newNpc = {
      id: createUniqueId(nextCampaign, "npc", name),
      name,
      race: cleanText(npcForm.race) || "Sconosciuta",
      role: cleanText(npcForm.role) || "Bozza",
      location_ref: cleanText(npcForm.location_ref),
      description: cleanText(npcForm.description),
    };

    nextCampaign.npcs.unshift(newNpc);
    setNpcForm(EMPTY_NPC_FORM);
    commitCampaign(nextCampaign, {
      message: `NPC "${name}" aggiunto.`,
      nextEntityId: newNpc.id,
      nextMarkerId: null,
    });
  }

  function handleEventSubmit(event) {
    event.preventDefault();
    const title = cleanText(eventForm.title);

    if (!title) {
      setStatus({
        tone: "warning",
        text: "L'evento richiede un titolo.",
      });
      return;
    }

    const nextCampaign = clone(campaign);
    nextCampaign.events.push({
      id: createUniqueId(nextCampaign, "evt", title),
      title,
      date: cleanText(eventForm.date) || todayISO(),
      description: cleanText(eventForm.description),
      related_refs: parseRefList(cleanText(eventForm.related_refs)),
    });

    setEventForm({
      ...EMPTY_EVENT_FORM,
    });
    commitCampaign(nextCampaign, {
      message: `Evento "${title}" aggiunto alla timeline.`,
    });
  }

  function handleSessionSubmit(event) {
    event.preventDefault();
    const title = cleanText(sessionForm.title);

    if (!title) {
      setStatus({
        tone: "warning",
        text: "La sessione richiede un titolo.",
      });
      return;
    }

    const nextCampaign = clone(campaign);
    nextCampaign.session_log.entries.unshift({
      id: createUniqueId(nextCampaign, "session", title),
      title,
      played_on: cleanText(sessionForm.played_on) || todayISO(),
      body: cleanText(sessionForm.body),
    });

    setSessionForm({
      ...EMPTY_SESSION_FORM,
    });
    commitCampaign(nextCampaign, {
      message: `Sessione "${title}" registrata nel diario.`,
    });
  }

  function handleGenerateName() {
    setGenerator({
      ...generator,
      name: generateFantasyName(),
    });
    setStatus({
      tone: "success",
      text: "Nome generato. Puoi aggiungerlo subito come NPC bozza.",
    });
  }

  function handleSaveGeneratedName() {
    if (!generator.name) {
      setStatus({
        tone: "warning",
        text: "Genera prima un nome.",
      });
      return;
    }

    const nextCampaign = clone(campaign);
    const generatedNpc = {
      id: createUniqueId(nextCampaign, "npc", generator.name),
      name: generator.name,
      race: "Sconosciuta",
      role: "Bozza generata",
      location_ref: "",
      description: "Creato dal generatore rapido di Codex Crypt.",
    };

    nextCampaign.npcs.unshift(generatedNpc);
    commitCampaign(nextCampaign, {
      message: `NPC "${generator.name}" aggiunto dal generatore.`,
      nextEntityId: generatedNpc.id,
      nextMarkerId: null,
    });
  }

  function handleGenerateLoot() {
    setGenerator({
      ...generator,
      loot: generateLootResult(),
    });
    setStatus({
      tone: "success",
      text: "Loot generato. Puoi salvarlo nel diario dell'ultima sessione.",
    });
  }

  function handleSaveGeneratedLoot() {
    if (!generator.loot) {
      setStatus({
        tone: "warning",
        text: "Genera prima un loot.",
      });
      return;
    }

    const nextCampaign = clone(campaign);
    nextCampaign.session_log.entries.unshift({
      id: createUniqueId(nextCampaign, "session", "loot"),
      title: "Nota rapida - Loot generato",
      played_on: todayISO(),
      body: generator.loot,
    });

    commitCampaign(nextCampaign, {
      message: "Loot salvato nel diario campagna.",
    });
  }

  async function handleMapUpload(event) {
    const [file] = event.target.files || [];
    if (!file) {
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const dimensions = await readImageDimensions(dataUrl);
      const nextCampaign = clone(campaign);
      nextCampaign.map.image_data = dataUrl;
      nextCampaign.map.image_width = dimensions.width;
      nextCampaign.map.image_height = dimensions.height;

      commitCampaign(nextCampaign, {
        message: `Mappa "${file.name}" caricata nel JSON della campagna.`,
      });
    } catch (error) {
      setStatus({
        tone: "error",
        text: error.message || "Impossibile leggere l'immagine selezionata.",
      });
    } finally {
      event.target.value = "";
    }
  }

  function handleToggleMarkerPlacement() {
    if (!campaign.map.image_data) {
      setStatus({
        tone: "warning",
        text: "Carica prima un'immagine mappa.",
      });
      return;
    }

    const nextValue = !mapPlacementArmed;
    setMapPlacementArmed(nextValue);
    setStatus({
      tone: nextValue ? "warning" : "success",
      text: nextValue
        ? "Piazzamento attivo: clicca sulla mappa per fissare il prossimo marker."
        : "Piazzamento marker disattivato.",
    });
  }

  function handleMapSurfaceClick(event) {
    if (!mapPlacementArmed || !campaign.map.image_data || !mapSurfaceRef.current) {
      return;
    }

    const rect = mapSurfaceRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }

    const label =
      cleanText(markerForm.label) || `Marker ${campaign.map.markers.length + 1}`;
    const note = cleanText(markerForm.note);
    const relatedRef = cleanText(markerForm.related_ref);
    const ratioX = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const ratioY = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    const imageWidth = campaign.map.image_width || rect.width;
    const imageHeight = campaign.map.image_height || rect.height;
    const nextCampaign = clone(campaign);
    const marker = {
      id: createUniqueId(nextCampaign, "marker", label),
      label,
      note,
      related_ref: relatedRef,
      x_ratio: Number(ratioX.toFixed(4)),
      y_ratio: Number(ratioY.toFixed(4)),
      x: Math.round(ratioX * imageWidth),
      y: Math.round(ratioY * imageHeight),
    };

    nextCampaign.map.markers.push(marker);
    setMarkerForm(EMPTY_MARKER_FORM);
    commitCampaign(nextCampaign, {
      message: `Marker "${label}" aggiunto sulla mappa.`,
      nextEntityId: relatedRef || activeEntityId,
      nextMarkerId: marker.id,
      nextMapPlacementArmed: false,
    });
  }

  function handleFocusMarker(marker) {
    setActiveMarkerId(marker.id);
    if (marker.related_ref && entityBundle.byId.has(marker.related_ref)) {
      setActiveEntityId(marker.related_ref);
    }
  }

  function handleDeleteLocation(location) {
    const nextCampaign = clone(campaign);
    nextCampaign.locations = nextCampaign.locations.filter((entry) => entry.id !== location.id);
    removeEntityReferences(nextCampaign, location.id);

    commitCampaign(nextCampaign, {
      message: `Luogo "${location.name}" rimosso.`,
      nextEntityId: activeEntityId === location.id ? null : activeEntityId,
      nextMarkerId: null,
    });
  }

  function handleDeleteNpc(npc) {
    const nextCampaign = clone(campaign);
    nextCampaign.npcs = nextCampaign.npcs.filter((entry) => entry.id !== npc.id);
    removeEntityReferences(nextCampaign, npc.id);

    commitCampaign(nextCampaign, {
      message: `NPC "${npc.name}" rimosso.`,
      nextEntityId: activeEntityId === npc.id ? null : activeEntityId,
      nextMarkerId: null,
    });
  }

  function handleDeleteEvent(eventEntry) {
    const nextCampaign = clone(campaign);
    nextCampaign.events = nextCampaign.events.filter((entry) => entry.id !== eventEntry.id);
    commitCampaign(nextCampaign, {
      message: `Evento "${eventEntry.title}" rimosso.`,
    });
  }

  function handleDeleteSession(entry) {
    const nextCampaign = clone(campaign);
    nextCampaign.session_log.entries = nextCampaign.session_log.entries.filter(
      (item) => item.id !== entry.id,
    );
    commitCampaign(nextCampaign, {
      message: `Sessione "${entry.title}" rimossa.`,
    });
  }

  function handleDeleteMarker(marker) {
    const nextCampaign = clone(campaign);
    nextCampaign.map.markers = nextCampaign.map.markers.filter((entry) => entry.id !== marker.id);
    commitCampaign(nextCampaign, {
      message: `Marker "${marker.label}" rimosso.`,
      nextMarkerId: activeMarkerId === marker.id ? null : activeMarkerId,
    });
  }

  const locationOptions = [{ value: "", label: "Nessun luogo associato" }].concat(
    campaign.locations.map((entry) => ({
      value: entry.id,
      label: entry.name,
    })),
  );

  const markerEntityOptions = [{ value: "", label: "Nessuna entità collegata" }].concat(
    [...campaign.locations, ...campaign.npcs].map((entry) => ({
      value: entry.id,
      label: entry.name,
    })),
  );

  return (
    <>
      <div className="backdrop" aria-hidden="true" />
      <div className="app-shell">
        <header className="hero panel">
          <div className="hero__copy">
            <p className="eyebrow">Campaign Manager Offline</p>
            <h1>{campaign.world_name || "Codex Crypt"}</h1>
            <RichMarkup
              value={campaign.summary}
              bundle={entityBundle}
              onEntityAction={handleEntityAction}
              className="hero__lede"
            />
          </div>
          <div className="hero__stats">
            <article className="stat-card">
              <span className="section-label">Enciclopedia</span>
              <strong>{campaign.locations.length + campaign.npcs.length}</strong>
              <span className="muted">schede tra luoghi e NPC</span>
            </article>
            <article className="stat-card">
              <span className="section-label">Timeline</span>
              <strong>{campaign.events.length}</strong>
              <span className="muted">eventi già registrati</span>
            </article>
            <article className="stat-card">
              <span className="section-label">Ultima sessione</span>
              <strong>{lastSession?.title || "Nessuna"}</strong>
              <span className="muted">
                {lastSession?.played_on
                  ? formatDate(lastSession.played_on)
                  : "Aggiungi il primo resoconto"}
              </span>
            </article>
          </div>
        </header>

        <main className="workspace">
          <section className="panel control-panel">
            <div className="panel__header">
              <div>
                <p className="section-label">Archivio</p>
                <h2>Importa, modifica, esporta</h2>
              </div>
              <p className="panel__hint">
                Tutto resta nel browser: nessun server, nessuna sincronizzazione remota.
              </p>
            </div>

            <div className="field-grid">
              <label className="field">
                <span>Nome del mondo</span>
                <input
                  type="text"
                  placeholder="Terre Alte"
                  value={campaign.world_name}
                  onChange={handleWorldNameChange}
                  onBlur={handleWorldNameBlur}
                />
              </label>

              <label className="field field--full">
                <span>Sintesi campagna</span>
                <textarea
                  rows="4"
                  placeholder="Panoramica della campagna, tono e conflitti principali."
                  value={campaign.summary}
                  onChange={handleWorldSummaryChange}
                  onBlur={handleWorldSummaryBlur}
                />
              </label>

              <div className="button-row field--full">
                <button type="button" onClick={handleLoadDemo}>
                  Carica demo
                </button>
                <label className="button button--secondary file-button" htmlFor="campaign-file-input">
                  Importa JSON o ENC
                </label>
                <input
                  id="campaign-file-input"
                  className="visually-hidden"
                  type="file"
                  accept=".json,.enc,.ccrypt"
                  onChange={handleCampaignImport}
                />
              </div>

              <label className="field">
                <span>Password archivio</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Usata per aprire o cifrare"
                  value={archivePassword}
                  onChange={(event) => setArchivePassword(event.target.value)}
                />
              </label>

              <div className="button-row">
                <button type="button" onClick={handlePlainExport}>
                  Scarica JSON
                </button>
                <button className="button--accent" type="button" onClick={handleEncryptedExport}>
                  Scarica cifrato
                </button>
              </div>

              <div className="status-banner field--full" data-tone={status.tone} role="status">
                {status.text}
              </div>

              <div className="meta-grid field--full">
                <article className="meta-card">
                  <span>File base</span>
                  <strong>{fileBaseName || "campaign"}</strong>
                </article>
                <article className="meta-card">
                  <span>Mappa</span>
                  <strong>
                    {campaign.map.image_data
                      ? `${campaign.map.markers.length} marker attivi`
                      : "non caricata"}
                  </strong>
                </article>
                <article className="meta-card">
                  <span>Aggiornato</span>
                  <strong>{formatDateTime(campaign.metadata?.updated_at) || "ora"}</strong>
                </article>
              </div>
            </div>
          </section>

          <section className="panel inspector-panel">
            <div className="panel__header">
              <div>
                <p className="section-label">Scheda attiva</p>
                <h2>Dettagli e riferimenti</h2>
              </div>
              <p className="panel__hint">
                I nomi trovati nel testo diventano link verso altre schede.
              </p>
            </div>

            {!activeEntity ? (
              <article className="inspector-card">
                <div className="inspector-head">
                  <div>
                    <p className="section-label">Panoramica</p>
                    <h3>{campaign.world_name || "Archivio vuoto"}</h3>
                  </div>
                  <div className="chip-row">
                    <span className="chip">{campaign.locations.length} luoghi</span>
                    <span className="chip">{campaign.npcs.length} NPC</span>
                  </div>
                </div>
                <RichMarkup
                  value={
                    campaign.summary ||
                    "Aggiungi una sintesi per descrivere il tono della campagna."
                  }
                  bundle={entityBundle}
                  onEntityAction={handleEntityAction}
                />
                {lastSession ? (
                  <div className="marker-card">
                    <p className="section-label">Ultima sessione</p>
                    <h3>{lastSession.title}</h3>
                    <p className="muted">{formatDate(lastSession.played_on)}</p>
                    <RichMarkup
                      value={lastSession.body}
                      bundle={entityBundle}
                      onEntityAction={handleEntityAction}
                    />
                  </div>
                ) : null}
              </article>
            ) : (
              <article className="inspector-card">
                <div className="inspector-head">
                  <div>
                    <p className="section-label">
                      {activeEntity.type === "location" ? "Luogo" : "NPC"}
                    </p>
                    <h3>{activeEntity.name}</h3>
                  </div>
                  <div className="chip-row">
                    {activeEntity.type === "location" ? (
                      <span className="chip">{activeEntity.typeLabel || activeEntity.typeValue}</span>
                    ) : (
                      <>
                        <span className="chip">{activeEntity.race || "Sconosciuta"}</span>
                        <span className="chip">{activeEntity.role || "Bozza"}</span>
                      </>
                    )}
                  </div>
                </div>

                {activeEntity.type === "npc" && activeEntity.location_ref ? (
                  <p className="muted">
                    Base nota:{" "}
                    <button
                      className="entity-link"
                      type="button"
                      onClick={() => {
                        setActiveEntityId(activeEntity.location_ref);
                        setActiveMarkerId(null);
                      }}
                    >
                      {entityBundle.byId.get(activeEntity.location_ref)?.name || "Sconosciuta"}
                    </button>
                  </p>
                ) : null}

                <RichMarkup
                  value={activeEntity.description || "Nessuna descrizione dettagliata."}
                  bundle={entityBundle}
                  onEntityAction={handleEntityAction}
                />

                <div className="chip-row">
                  <span className="chip">
                    {campaign.events.filter((entry) => entry.related_refs.includes(activeEntity.id)).length}{" "}
                    eventi collegati
                  </span>
                  <span className="chip">
                    {campaign.map.markers.filter((entry) => entry.related_ref === activeEntity.id).length}{" "}
                    marker in mappa
                  </span>
                  {activeEntity.type === "location" ? (
                    <span className="chip">
                      {
                        campaign.npcs.filter((entry) => entry.location_ref === activeEntity.id)
                          .length
                      }{" "}
                      NPC presenti qui
                    </span>
                  ) : null}
                </div>

                {activeEntity.type === "location" &&
                campaign.npcs.some((entry) => entry.location_ref === activeEntity.id) ? (
                  <div className="stack">
                    {campaign.npcs
                      .filter((entry) => entry.location_ref === activeEntity.id)
                      .map((entry) => (
                        <div className="marker-card" key={entry.id}>
                          <strong>
                            <button
                              className="entity-link"
                              type="button"
                              onClick={() => {
                                setActiveEntityId(entry.id);
                                setActiveMarkerId(null);
                              }}
                            >
                              {entry.name}
                            </button>
                          </strong>
                          <p className="muted">{entry.role || "NPC"}</p>
                        </div>
                      ))}
                  </div>
                ) : null}

                {activeMarker ? (
                  <div className="marker-card marker-card--active">
                    <p className="section-label">Marker evidenziato</p>
                    <h3>{activeMarker.label}</h3>
                    <RichMarkup
                      value={activeMarker.note || "Nessuna nota aggiuntiva."}
                      bundle={entityBundle}
                      onEntityAction={handleEntityAction}
                    />
                  </div>
                ) : null}
              </article>
            )}
          </section>

          <section className="panel directory-panel">
            <div className="panel__header">
              <div>
                <p className="section-label">Luoghi</p>
                <h2>Atlante del mondo</h2>
              </div>
            </div>

            <div className="stack">
              {campaign.locations.length ? (
                campaign.locations.map((location) => {
                  const residents = campaign.npcs.filter(
                    (entry) => entry.location_ref === location.id,
                  ).length;
                  return (
                    <article
                      className={`entity-card ${
                        location.id === activeEntityId ? "entity-card--active" : ""
                      }`}
                      key={location.id}
                    >
                      <div className="entity-card__head">
                        <div>
                          <h3>
                            <button
                              className="entity-link"
                              type="button"
                              onClick={() => {
                                setActiveEntityId(location.id);
                                setActiveMarkerId(null);
                              }}
                            >
                              {location.name}
                            </button>
                          </h3>
                          <p className="muted">
                            {location.type || "Punto d'interesse"} · {residents} NPC collegati
                          </p>
                        </div>
                        <button
                          className="chip chip--danger"
                          type="button"
                          onClick={() => handleDeleteLocation(location)}
                        >
                          Elimina
                        </button>
                      </div>
                      <RichMarkup
                        value={location.description || "Nessuna descrizione."}
                        bundle={entityBundle}
                        onEntityAction={handleEntityAction}
                      />
                    </article>
                  );
                })
              ) : (
                <div className="empty-state">Nessun luogo registrato.</div>
              )}
            </div>

            <form className="form-stack" onSubmit={handleLocationSubmit}>
              <label className="field">
                <span>Nuovo luogo</span>
                <input
                  name="name"
                  type="text"
                  placeholder="Locanda del Drago"
                  required
                  value={locationForm.name}
                  onChange={(event) =>
                    setLocationForm({ ...locationForm, name: event.target.value })
                  }
                />
              </label>
              <label className="field">
                <span>Tipo</span>
                <input
                  name="type"
                  type="text"
                  placeholder="Locanda, città, rovina..."
                  value={locationForm.type}
                  onChange={(event) =>
                    setLocationForm({ ...locationForm, type: event.target.value })
                  }
                />
              </label>
              <label className="field">
                <span>Descrizione</span>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Dettagli, voci, storia. Supporta riferimenti come [[Cripta di Cenere]]."
                  value={locationForm.description}
                  onChange={(event) =>
                    setLocationForm({ ...locationForm, description: event.target.value })
                  }
                />
              </label>
              <button type="submit">Aggiungi luogo</button>
            </form>
          </section>

          <section className="panel directory-panel">
            <div className="panel__header">
              <div>
                <p className="section-label">Personaggi</p>
                <h2>NPC e fazioni</h2>
              </div>
            </div>

            <div className="stack">
              {campaign.npcs.length ? (
                campaign.npcs.map((npc) => {
                  const location = npc.location_ref ? entityBundle.byId.get(npc.location_ref) : null;
                  return (
                    <article
                      className={`entity-card ${
                        npc.id === activeEntityId ? "entity-card--active" : ""
                      }`}
                      key={npc.id}
                    >
                      <div className="entity-card__head">
                        <div>
                          <h3>
                            <button
                              className="entity-link"
                              type="button"
                              onClick={() => {
                                setActiveEntityId(npc.id);
                                setActiveMarkerId(null);
                              }}
                            >
                              {npc.name}
                            </button>
                          </h3>
                          <p className="muted">
                            {npc.race || "Sconosciuta"} · {npc.role || "Bozza"}
                          </p>
                        </div>
                        <button
                          className="chip chip--danger"
                          type="button"
                          onClick={() => handleDeleteNpc(npc)}
                        >
                          Elimina
                        </button>
                      </div>
                      {location ? (
                        <p className="muted">
                          Presenza nota:{" "}
                          <button
                            className="entity-link"
                            type="button"
                            onClick={() => {
                              setActiveEntityId(location.id);
                              setActiveMarkerId(null);
                            }}
                          >
                            {location.name}
                          </button>
                        </p>
                      ) : null}
                      <RichMarkup
                        value={npc.description || "Nessuna descrizione."}
                        bundle={entityBundle}
                        onEntityAction={handleEntityAction}
                      />
                    </article>
                  );
                })
              ) : (
                <div className="empty-state">Nessun NPC registrato.</div>
              )}
            </div>

            <form className="form-stack" onSubmit={handleNpcSubmit}>
              <label className="field">
                <span>Nome NPC</span>
                <input
                  name="name"
                  type="text"
                  placeholder="Grog"
                  required
                  value={npcForm.name}
                  onChange={(event) => setNpcForm({ ...npcForm, name: event.target.value })}
                />
              </label>
              <div className="field-grid">
                <label className="field">
                  <span>Razza</span>
                  <input
                    name="race"
                    type="text"
                    placeholder="Orco"
                    value={npcForm.race}
                    onChange={(event) => setNpcForm({ ...npcForm, race: event.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Ruolo</span>
                  <input
                    name="role"
                    type="text"
                    placeholder="Mercenario, oste..."
                    value={npcForm.role}
                    onChange={(event) => setNpcForm({ ...npcForm, role: event.target.value })}
                  />
                </label>
              </div>
              <label className="field">
                <span>Luogo associato</span>
                <select
                  name="location_ref"
                  value={npcForm.location_ref}
                  onChange={(event) =>
                    setNpcForm({ ...npcForm, location_ref: event.target.value })
                  }
                >
                  {locationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Descrizione</span>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Motivazioni, segreti, obiettivi."
                  value={npcForm.description}
                  onChange={(event) =>
                    setNpcForm({ ...npcForm, description: event.target.value })
                  }
                />
              </label>
              <button type="submit">Aggiungi NPC</button>
            </form>
          </section>

          <section className="panel timeline-panel">
            <div className="panel__header">
              <div>
                <p className="section-label">Timeline</p>
                <h2>Cronologia interattiva</h2>
              </div>
            </div>

            <div className="timeline">
              {orderedEvents.length ? (
                orderedEvents.map((entry) => (
                  <article
                    className={`timeline-item ${
                      activeEntityId && entry.related_refs.includes(activeEntityId)
                        ? "timeline-item--active"
                        : ""
                    }`}
                    key={entry.id}
                  >
                    <div className="entry-head">
                      <div>
                        <p className="section-label">{formatDate(entry.date) || "Data libera"}</p>
                        <h3>{entry.title}</h3>
                      </div>
                      <button
                        className="chip chip--danger"
                        type="button"
                        onClick={() => handleDeleteEvent(entry)}
                      >
                        Elimina
                      </button>
                    </div>
                    <RichMarkup
                      value={entry.description}
                      bundle={entityBundle}
                      onEntityAction={handleEntityAction}
                    />
                    <div className="chip-row">
                      {entry.related_refs.map((ref) => {
                        const related = entityBundle.byId.get(ref);
                        if (!related) {
                          return null;
                        }

                        return (
                          <button
                            className="chip"
                            type="button"
                            key={ref}
                            onClick={() => {
                              setActiveEntityId(ref);
                              setActiveMarkerId(null);
                            }}
                          >
                            {related.name}
                          </button>
                        );
                      })}
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state">La timeline è vuota.</div>
              )}
            </div>

            <form className="form-stack" onSubmit={handleEventSubmit}>
              <label className="field">
                <span>Titolo evento</span>
                <input
                  name="title"
                  type="text"
                  placeholder="Incendio alla torre di guardia"
                  required
                  value={eventForm.title}
                  onChange={(event) => setEventForm({ ...eventForm, title: event.target.value })}
                />
              </label>
              <div className="field-grid">
                <label className="field">
                  <span>Data</span>
                  <input
                    name="date"
                    type="date"
                    value={eventForm.date}
                    onChange={(event) => setEventForm({ ...eventForm, date: event.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Riferimenti</span>
                  <input
                    name="related_refs"
                    type="text"
                    placeholder="ID separati da virgola oppure lascia vuoto"
                    value={eventForm.related_refs}
                    onChange={(event) =>
                      setEventForm({ ...eventForm, related_refs: event.target.value })
                    }
                  />
                </label>
              </div>
              <label className="field">
                <span>Dettagli</span>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Conseguenze e legami con luoghi e personaggi."
                  value={eventForm.description}
                  onChange={(event) =>
                    setEventForm({ ...eventForm, description: event.target.value })
                  }
                />
              </label>
              <button type="submit">Aggiungi evento</button>
            </form>
          </section>

          <section className="panel journal-panel">
            <div className="panel__header">
              <div>
                <p className="section-label">Diario</p>
                <h2>Registro sessioni</h2>
              </div>
            </div>

            <div className="stack">
              {orderedSessions.length ? (
                orderedSessions.map((entry) => (
                  <article className="journal-entry" key={entry.id}>
                    <div className="entry-head">
                      <div>
                        <p className="section-label">
                          {formatDate(entry.played_on) || "Senza data"}
                        </p>
                        <h3>{entry.title}</h3>
                      </div>
                      <button
                        className="chip chip--danger"
                        type="button"
                        onClick={() => handleDeleteSession(entry)}
                      >
                        Elimina
                      </button>
                    </div>
                    <RichMarkup
                      value={entry.body || "Nessun appunto."}
                      bundle={entityBundle}
                      onEntityAction={handleEntityAction}
                    />
                  </article>
                ))
              ) : (
                <div className="empty-state">Nessuna sessione registrata.</div>
              )}
            </div>

            <form className="form-stack" onSubmit={handleSessionSubmit}>
              <label className="field">
                <span>Titolo sessione</span>
                <input
                  name="title"
                  type="text"
                  placeholder="Sessione 07 - La cripta si apre"
                  required
                  value={sessionForm.title}
                  onChange={(event) =>
                    setSessionForm({ ...sessionForm, title: event.target.value })
                  }
                />
              </label>
              <label className="field">
                <span>Data sessione</span>
                <input
                  name="played_on"
                  type="date"
                  value={sessionForm.played_on}
                  onChange={(event) =>
                    setSessionForm({ ...sessionForm, played_on: event.target.value })
                  }
                />
              </label>
              <label className="field">
                <span>Appunti</span>
                <textarea
                  name="body"
                  rows="4"
                  placeholder="Riassunto, loot ottenuto, domande aperte."
                  value={sessionForm.body}
                  onChange={(event) =>
                    setSessionForm({ ...sessionForm, body: event.target.value })
                  }
                />
              </label>
              <button type="submit">Aggiungi sessione</button>
            </form>
          </section>

          <section className="panel generator-panel">
            <div className="panel__header">
              <div>
                <p className="section-label">Generatori</p>
                <h2>Nomi e loot</h2>
              </div>
              <p className="panel__hint">
                I risultati sono effimeri finché non li aggiungi al file campagna.
              </p>
            </div>

            <div className="generator-grid">
              <article className="generator-card">
                <h3>Nome</h3>
                <p className="generator-output">
                  {generator.name || "Premi per generare un nome."}
                </p>
                <div className="button-row">
                  <button type="button" onClick={handleGenerateName}>
                    Genera nome
                  </button>
                  <button className="button--secondary" type="button" onClick={handleSaveGeneratedName}>
                    Aggiungi come NPC
                  </button>
                </div>
              </article>

              <article className="generator-card">
                <h3>Loot</h3>
                <p className="generator-output">
                  {generator.loot || "Premi per generare un bottino."}
                </p>
                <div className="button-row">
                  <button type="button" onClick={handleGenerateLoot}>
                    Genera loot
                  </button>
                  <button className="button--secondary" type="button" onClick={handleSaveGeneratedLoot}>
                    Salva nel diario
                  </button>
                </div>
              </article>
            </div>
          </section>

          <section className="panel map-panel panel--wide">
            <div className="panel__header">
              <div>
                <p className="section-label">Fog of War</p>
                <h2>Mappa e marker</h2>
              </div>
              <p className="panel__hint">
                Carica un&apos;immagine, prepara nota e poi clicca sulla mappa per fissare il marker.
              </p>
            </div>

            <div className="map-layout">
              <div className="map-stack">
                <div className="button-row">
                  <label className="button button--secondary file-button" htmlFor="map-image-input">
                    Carica immagine mappa
                  </label>
                  <input
                    id="map-image-input"
                    className="visually-hidden"
                    type="file"
                    accept="image/*"
                    onChange={handleMapUpload}
                  />
                  <button type="button" onClick={handleToggleMarkerPlacement}>
                    {mapPlacementArmed ? "Annulla piazzamento" : "Piazzamento marker"}
                  </button>
                </div>

                <div className={`map-stage ${campaign.map.image_data ? "" : "map-stage--empty"}`}>
                  {campaign.map.image_data ? (
                    <div
                      className={`map-stage__surface ${
                        mapPlacementArmed ? "map-stage__surface--armed" : ""
                      }`}
                      ref={mapSurfaceRef}
                      onClick={handleMapSurfaceClick}
                    >
                      <img src={campaign.map.image_data} alt="Mappa della campagna" />
                      {campaign.map.markers.map((marker) => {
                        const position = markerToPercent(marker, campaign.map);
                        return (
                          <button
                            className={`map-marker ${
                              marker.related_ref ? "map-marker--linked" : ""
                            }`}
                            type="button"
                            key={marker.id}
                            title={marker.label}
                            style={{ left: `${position.left}%`, top: `${position.top}%` }}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleFocusMarker(marker);
                            }}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div>{MAP_HINT_TEXT}</div>
                  )}
                </div>

                <div className="map-footnote">
                  {campaign.map.image_data
                    ? mapPlacementArmed
                      ? "Marker pronto: usa i campi laterali, poi clicca sulla mappa."
                      : `${campaign.map.markers.length} marker salvati nel JSON corrente.`
                    : MAP_HINT_TEXT}
                </div>
              </div>

              <div className="map-sidebar">
                <form className="form-stack" onSubmit={(event) => event.preventDefault()}>
                  <label className="field">
                    <span>Etichetta marker</span>
                    <input
                      name="label"
                      type="text"
                      placeholder="Ingresso segreto"
                      value={markerForm.label}
                      onChange={(event) =>
                        setMarkerForm({ ...markerForm, label: event.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Nota</span>
                    <textarea
                      name="note"
                      rows="4"
                      placeholder="Dettagli sulla stanza, nemici, trappole o agganci."
                      value={markerForm.note}
                      onChange={(event) =>
                        setMarkerForm({ ...markerForm, note: event.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Entità collegata</span>
                    <select
                      name="related_ref"
                      value={markerForm.related_ref}
                      onChange={(event) =>
                        setMarkerForm({ ...markerForm, related_ref: event.target.value })
                      }
                    >
                      {markerEntityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </form>

                <div className="stack">
                  {sortedMarkers.length ? (
                    sortedMarkers.map((marker) => {
                      const linkedEntity = marker.related_ref
                        ? entityBundle.byId.get(marker.related_ref)
                        : null;
                      return (
                        <article
                          className={`marker-card ${
                            marker.id === activeMarkerId ? "marker-card--active" : ""
                          }`}
                          key={marker.id}
                        >
                          <div className="entry-head">
                            <div>
                              <p className="section-label">Marker</p>
                              <h3>{marker.label}</h3>
                            </div>
                            <div className="chip-row">
                              <button
                                className="chip"
                                type="button"
                                onClick={() => handleFocusMarker(marker)}
                              >
                                Vai
                              </button>
                              <button
                                className="chip chip--danger"
                                type="button"
                                onClick={() => handleDeleteMarker(marker)}
                              >
                                Elimina
                              </button>
                            </div>
                          </div>
                          <RichMarkup
                            value={marker.note || "Nessuna nota aggiuntiva."}
                            bundle={entityBundle}
                            onEntityAction={handleEntityAction}
                          />
                          {linkedEntity ? (
                            <p className="muted">
                              Collegato a{" "}
                              <button
                                className="entity-link"
                                type="button"
                                onClick={() => {
                                  setActiveEntityId(linkedEntity.id);
                                  setActiveMarkerId(marker.id);
                                }}
                              >
                                {linkedEntity.name}
                              </button>
                            </p>
                          ) : null}
                        </article>
                      );
                    })
                  ) : (
                    <div className="empty-state">Nessun marker registrato.</div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
