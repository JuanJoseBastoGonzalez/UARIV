"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";

const API_URL = "/api/appsheet";

// Lista de usuarios autorizados de Vivanto (nombre / usuario)
const USUARIOS_VIVANTO: { nombre: string; usuario: string }[] = [
  { nombre: "Sandra Galvis Medina", usuario: "sgalvism" },
  { nombre: "Johan Alejandro Meneses Villamizar", usuario: "jmeneses" },
  { nombre: "Angie Viviana Rocha Lopez", usuario: "avrochal" },
  { nombre: "Yuly Constanza Romero Tellez", usuario: "YCROMEROT" },
  { nombre: "Marcy Anyela Saavedra Avila", usuario: "masaavedraa" },
  { nombre: "Lizdey Johana Castillo Tellez", usuario: "Ljcastillot" },
  { nombre: "Maria Fernanda Ramirez Giraldo", usuario: "mframiezg" },
  { nombre: "Vivian Giraldo", usuario: "Vgiraldo" },
  { nombre: "Syndy Patricia Leon Rodriguez", usuario: "Sleon" },
  { nombre: "Sebastian Alejandro Romero", usuario: "saromero" },
  { nombre: "Lisbeth Mildreth Pertuz Cervantes", usuario: "lmpertuzc" },
  { nombre: "Jessica Marquez Marquez Zamora", usuario: "jmmarquezz" },
  { nombre: "Martina Cordoba Guevara", usuario: "mcordobag" },
  { nombre: "Yessica Maria Gongora Castro", usuario: "ymgongorac" },
  { nombre: "Laura Judith Lopez Escobar", usuario: "ljlopeze" },
  { nombre: "Katherine Celis", usuario: "KCELIS" },
  { nombre: "Juan Jose Basto Gonzalez", usuario: "jjbastog" },
  { nombre: "Miladis Acosta Asis", usuario: "macostaa" },
  { nombre: "Tatiana Torres Sanchez", usuario: "Ttorress" },
  { nombre: "Angela Rodriguez", usuario: "arodriguez" },
  { nombre: "Wendi Dayana Tamara Florez", usuario: "wdtamaraf" },
  { nombre: "Olga Yiceth Gomez", usuario: "oygomez" },
  { nombre: "Diego Armando Vernaza Duran", usuario: "davernazad" },
  { nombre: "Santiago Albeiro Vargas Arias", usuario: "savargasa" },
  { nombre: "Angelica Maria Gonzalez Mejia", usuario: "amgonzalezm" },
  { nombre: "Eliza Pareja Salas", usuario: "epsalas" },
  { nombre: "Nelcy Yasmin Davila Villamizar", usuario: "nydavilav" },
  { nombre: "Monica Oroztegui Munoz", usuario: "morozteguim" },
  { nombre: "Meyram Del Mar Gonzalez Lizcano", usuario: "mdgonzalezl" },
  { nombre: "Yusneidis Vanegas Cortecero", usuario: "yvanegasc" },
];

interface RegistroRow {
  _RowNumber?: string | number;
  "Row ID"?: string;
  "USUARIO VIVANTO"?: string;
  "CODIGO-HOGAR"?: string;
  USUARIO?: string;
  CEDULA?: string;
  TIPIFICACION?: string;
  FECHA?: string;
  RESPONSABLE?: string;
  "TELEFONO CELULAR"?: string;
  URL?: string;
  [key: string]: string | number | undefined;
}

export default function Page() {
  const [usuarioData, setUsuarioData] = useState<{
    nombre: string;
    usuario: string;
  } | null>(null);
  const [usuarioInput, setUsuarioInput] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [form, setForm] = useState({
    codigoHogarSearch: "",
    codigoHogar: "",
    nombreVictima: "",
    cedula: "",
    tipificacion: "EXITOSA",
    telefono: "",
  });
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<RegistroRow[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingRow, setEditingRow] = useState<RegistroRow | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  // Restore session
  useEffect(() => {
    const saved = localStorage.getItem("vivanto_session");
    if (saved) {
      try {
        setUsuarioData(JSON.parse(saved));
      } catch {
        localStorage.removeItem("vivanto_session");
      }
    }
  }, []);

  // ========== LOGIN ==========
  function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    const input = usuarioInput.trim();
    if (!input) return;

    setLoginLoading(true);

    // Buscar por usuario (case-insensitive)
    const found = USUARIOS_VIVANTO.find(
      (u) => u.usuario.toLowerCase() === input.toLowerCase()
    );

    setTimeout(() => {
      if (found) {
        localStorage.setItem("vivanto_session", JSON.stringify(found));
        setUsuarioData(found);
      } else {
        setLoginError("Usuario no autorizado. Verifica tu usuario de Vivanto.");
      }
      setLoginLoading(false);
    }, 500);
  }

  function handleLogout() {
    localStorage.removeItem("vivanto_session");
    setUsuarioData(null);
    setUsuarioInput("");
    setLoginError("");
  }

  // ========== FORM ==========
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // ========== SEARCH ==========
  function searchHogar(e: FormEvent) {
    e.preventDefault();
    setSearchLoading(true);

    const rows = form.codigoHogarSearch.trim()
      ? [{ "CODIGO-HOGAR": form.codigoHogarSearch.trim() }]
      : [];

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Action: "Find",
        Properties: {
          Locale: "es-CO",
          Timezone: "America/Bogota",
        },
        Rows: rows,
      }),
    })
      .then(async (res) => {
        const text = await res.text();
        console.log("[v0] Search response status:", res.status);
        console.log("[v0] Search response body:", text);
        return JSON.parse(text);
      })
      .then((data) => {
        const results: RegistroRow[] = Array.isArray(data)
          ? data
          : data.Rows || [];
        console.log("[v0] Parsed results:", results.length, "rows");
        setSearchResults(results);
        setEditingRow(null);
        setEditingIndex(null);
        setModalOpen(true);
      })
      .catch((err) => {
        console.error(err);
        setSearchResults([]);
        setModalOpen(true);
      })
      .finally(() => setSearchLoading(false));
  }

  // ========== EDIT ==========
  function handleEditRow(row: RegistroRow, idx: number) {
    setEditingRow({ ...row });
    setEditingIndex(idx);
  }

  function handleEditFieldChange(field: string, value: string) {
    if (!editingRow) return;
    setEditingRow({ ...editingRow, [field]: value });
  }

  function saveEditedRow() {
    if (!editingRow || editingIndex === null) return;
    setEditLoading(true);

    // La PK es CODIGO-HOGAR del registro original (no se puede cambiar)
    const originalRow = searchResults[editingIndex];
    const rowToSend: RegistroRow = {
      "CODIGO-HOGAR": originalRow["CODIGO-HOGAR"],
    };
    // Solo enviar los campos editables que cambiaron
    for (const f of EDITABLE_FIELDS) {
      rowToSend[f.key] = editingRow[f.key] ?? "";
    }
    // Incluir USUARIO VIVANTO
    rowToSend["USUARIO VIVANTO"] = editingRow["USUARIO VIVANTO"] ?? originalRow["USUARIO VIVANTO"] ?? "";

    const payload = {
      Action: "Edit",
      Properties: {
        Locale: "es-CO",
        Timezone: "America/Bogota",
      },
      Rows: [rowToSend],
    };

    console.log("[v0] Edit payload:", JSON.stringify(payload, null, 2));

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const text = await res.text();
        console.log("[v0] Edit response status:", res.status);
        console.log("[v0] Edit response body:", text);
        if (!res.ok) {
          throw new Error(text);
        }
        // Actualizar la fila local con los datos editados
        const updatedRow = { ...originalRow, ...rowToSend };
        setSearchResults((prev) =>
          prev.map((r, i) => (i === editingIndex ? updatedRow : r))
        );
        setEditingRow(null);
        setEditingIndex(null);
      })
      .catch((err) => {
        console.error("[v0] Error al editar:", err);
        alert("Error al actualizar el registro");
      })
      .finally(() => setEditLoading(false));
  }

  // ========== DELETE ==========
  function deleteRow(row: RegistroRow, idx: number) {
    if (!confirm("Estas seguro de que deseas eliminar este registro?")) return;
    setDeleteLoading(idx);

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Action: "Delete",
        Properties: {
          Locale: "es-CO",
          Timezone: "America/Bogota",
        },
        Rows: [{ "CODIGO-HOGAR": row["CODIGO-HOGAR"] }],
      }),
    })
      .then(async (res) => {
        const text = await res.text();
        console.log("[v0] Delete response:", text);
        setSearchResults((prev) => prev.filter((_, i) => i !== idx));
        if (editingIndex === idx) {
          setEditingRow(null);
          setEditingIndex(null);
        }
      })
      .catch((err) => {
        console.error("Error al eliminar:", err);
        alert("Error al eliminar el registro");
      })
      .finally(() => setDeleteLoading(null));
  }

  // ========== ADD ==========
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Bogota" })
    );
    const date = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;

    const objeto: RegistroRow = {
      "USUARIO VIVANTO": usuarioData?.usuario || "",
      "CODIGO-HOGAR": form.codigoHogar,
      USUARIO: form.nombreVictima,
      CEDULA: form.cedula,
      TIPIFICACION: form.tipificacion,
      FECHA: date,
      RESPONSABLE: "",
      "TELEFONO CELULAR": form.telefono,
      URL: "",
    };

    const payload = {
      Action: "Add",
      Properties: {
        Locale: "es-CO",
        Timezone: "America/Bogota",
      },
      Rows: [objeto],
    };

    console.log("[v0] Sending Add payload:", JSON.stringify(payload, null, 2));

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        const text = await response.text();
        console.log("[v0] Add response status:", response.status);
        console.log("[v0] Add response body:", text);
        alert("Registro enviado correctamente");
        setForm({
          codigoHogar: "",
          codigoHogarSearch: "",
          nombreVictima: "",
          cedula: "",
          tipificacion: "EXITOSA",
          telefono: "",
        });
      })
      .catch((error) => {
        console.error("[v0] Add error:", error);
        alert("Error al enviar los datos");
      })
      .finally(() => setLoading(false));
  }

  // CODIGO-HOGAR es la Primary Key, no se edita
  const EDITABLE_FIELDS: { key: string; label: string }[] = [
    { key: "USUARIO", label: "Nombre" },
    { key: "CEDULA", label: "Cedula" },
    { key: "TIPIFICACION", label: "Tipificacion" },
    { key: "TELEFONO CELULAR", label: "Telefono" },
    { key: "FECHA", label: "Fecha" },
    { key: "URL", label: "URL" },
    { key: "RESPONSABLE", label: "Responsable" },
  ];

  // ========== LOGIN SCREEN ==========
  if (!usuarioData) {
    return (
      <div className="epic-page">
        <div className="epic-particle" />
        <div className="epic-particle" />
        <div className="epic-particle" />

        <div className="epic-container">
          <div className="epic-card">
            <div className="epic-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>

            <h1 className="epic-title">
              Iniciar <span>Sesion</span>
            </h1>
            <p className="epic-subtitle">
              Ingresa tu usuario de Vivanto para continuar
            </p>

            <form onSubmit={handleLogin} className="epic-form">
              <div className="epic-field">
                <label className="epic-label" htmlFor="usuarioVivanto">
                  Usuario Vivanto
                </label>
                <input
                  className="epic-input"
                  id="usuarioVivanto"
                  value={usuarioInput}
                  onChange={(e) => {
                    setUsuarioInput(e.target.value);
                    setLoginError("");
                  }}
                  placeholder="Ej: sgalvism"
                  autoFocus
                />
              </div>

              {loginError && (
                <p className="epic-error">{loginError}</p>
              )}

              <button
                type="submit"
                className="epic-btn epic-btn-primary"
                disabled={loginLoading || !usuarioInput.trim()}
              >
                {loginLoading ? "Verificando..." : "Ingresar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ========== MAIN APP ==========
  return (
    <div className="epic-page">
      <div className="epic-particle" />
      <div className="epic-particle" />
      <div className="epic-particle" />

      <div className="epic-container">
        {/* User badge */}
        <div className="epic-user-badge">
          <span className="epic-user-badge-dot" />
          <span className="epic-user-badge-name">
            {usuarioData.nombre}
          </span>
          <span className="epic-user-badge-user">
            @{usuarioData.usuario}
          </span>
          <button
            type="button"
            className="epic-user-badge-logout"
            onClick={handleLogout}
          >
            Salir
          </button>
        </div>

        <div className="epic-card">
          <div className="epic-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
              />
            </svg>
          </div>

          <h1 className="epic-title">
            Registro de <span>Hogar</span>
          </h1>
          <p className="epic-subtitle">
            Sistema de registro y consulta de hogares
          </p>

          {/* Search */}
          <form onSubmit={searchHogar} className="epic-search">
            <input
              className="epic-input"
              name="codigoHogarSearch"
              value={form.codigoHogarSearch}
              onChange={handleChange}
              placeholder="Buscar por codigo de hogar..."
            />
            <button
              type="submit"
              className="epic-btn epic-btn-secondary"
              disabled={searchLoading}
            >
              {searchLoading ? "..." : "Buscar"}
            </button>
          </form>

          <hr className="epic-divider" />

          {/* Main form */}
          <form onSubmit={handleSubmit} className="epic-form">
            <div className="epic-field">
              <label className="epic-label" htmlFor="codigoHogar">
                Codigo Hogar
              </label>
              <input
                className="epic-input"
                id="codigoHogar"
                name="codigoHogar"
                value={form.codigoHogar}
                onChange={handleChange}
                placeholder="Ej: 249025-S5T6U"
              />
            </div>

            <div className="epic-field">
              <label className="epic-label" htmlFor="nombreVictima">
                Nombre Victima
              </label>
              <input
                className="epic-input"
                id="nombreVictima"
                name="nombreVictima"
                value={form.nombreVictima}
                onChange={handleChange}
                placeholder="Nombre completo"
              />
            </div>

            <div className="epic-row">
              <div className="epic-field">
                <label className="epic-label" htmlFor="cedula">
                  Cedula
                </label>
                <input
                  className="epic-input"
                  id="cedula"
                  name="cedula"
                  value={form.cedula}
                  onChange={handleChange}
                  placeholder="0000000000"
                />
              </div>

              <div className="epic-field">
                <label className="epic-label" htmlFor="telefono">
                  Telefono
                </label>
                <input
                  className="epic-input"
                  id="telefono"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="3001234567"
                />
              </div>
            </div>

            <div className="epic-field">
              <label className="epic-label" htmlFor="tipificacion">
                Tipificacion
              </label>
              <select
                className="epic-input epic-select"
                id="tipificacion"
                name="tipificacion"
                value={form.tipificacion}
                onChange={(e) =>
                  setForm({ ...form, tipificacion: e.target.value })
                }
              >
                <option value="EXITOSA">EXITOSA</option>
                <option value="EXITOSA SIN TIPIFICAS">
                  EXITOSA SIN TIPIFICAS
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="epic-btn epic-btn-primary"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar Registro"}
            </button>
          </form>
        </div>
      </div>

      {/* ========== MODAL ========== */}
      {modalOpen && (
        <div
          className="epic-overlay"
          onClick={() => {
            setModalOpen(false);
            setEditingRow(null);
            setEditingIndex(null);
          }}
        >
          <div className="epic-modal" onClick={(e) => e.stopPropagation()}>
            <div className="epic-modal-header">
              <h2 className="epic-modal-title">Resultados de Busqueda</h2>
              <button
                type="button"
                className="epic-modal-close"
                onClick={() => {
                  setModalOpen(false);
                  setEditingRow(null);
                  setEditingIndex(null);
                }}
                aria-label="Cerrar modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  width="20"
                  height="20"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="epic-modal-body">
              {searchResults.length === 0 ? (
                <div className="epic-modal-empty">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    width="40"
                    height="40"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                  <p>No se encontraron resultados</p>
                </div>
              ) : (
                <div className="epic-results-list">
                  {searchResults.map((row, idx) => (
                    <div
                      key={`${row["CODIGO-HOGAR"]}-${idx}`}
                      className="epic-result-card"
                    >
                      {editingIndex === idx && editingRow ? (
                        /* ===== EDITING MODE ===== */
                        <div className="epic-edit-form">
                          <div className="epic-edit-field">
                            <label className="epic-label">Codigo Hogar (PK)</label>
                            <input
                              className="epic-input"
                              value={String(row["CODIGO-HOGAR"] ?? "")}
                              disabled
                              style={{ opacity: 0.5, cursor: "not-allowed" }}
                            />
                          </div>
                          {EDITABLE_FIELDS.map((f) => (
                            <div key={f.key} className="epic-edit-field">
                              <label className="epic-label">{f.label}</label>
                              {f.key === "TIPIFICACION" ? (
                                <select
                                  className="epic-input epic-select"
                                  value={String(editingRow[f.key] ?? "EXITOSA")}
                                  onChange={(e) =>
                                    handleEditFieldChange(
                                      f.key,
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="EXITOSA">EXITOSA</option>
                                  <option value="EXITOSA SIN TIPIFICAS">
                                    EXITOSA SIN TIPIFICAS
                                  </option>
                                </select>
                              ) : (
                                <input
                                  className="epic-input"
                                  value={String(editingRow[f.key] ?? "")}
                                  onChange={(e) =>
                                    handleEditFieldChange(
                                      f.key,
                                      e.target.value
                                    )
                                  }
                                />
                              )}
                            </div>
                          ))}
                          <div className="epic-edit-actions">
                            <button
                              type="button"
                              className="epic-btn epic-btn-primary"
                              onClick={saveEditedRow}
                              disabled={editLoading}
                              style={{ flex: 1 }}
                            >
                              {editLoading ? "Guardando..." : "Guardar"}
                            </button>
                            <button
                              type="button"
                              className="epic-btn epic-btn-secondary"
                              onClick={() => {
                                setEditingRow(null);
                                setEditingIndex(null);
                              }}
                              style={{ flex: 1 }}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ===== VIEW MODE ===== */
                        <>
                          <div className="epic-result-header">
                            <span className="epic-result-code">
                              {row["CODIGO-HOGAR"]}
                            </span>
                            <div className="epic-result-actions">
                              <button
                                type="button"
                                className="epic-btn epic-btn-secondary epic-btn-sm"
                                onClick={() => handleEditRow(row, idx)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="epic-btn epic-btn-danger epic-btn-sm"
                                onClick={() => deleteRow(row, idx)}
                                disabled={deleteLoading === idx}
                              >
                                {deleteLoading === idx
                                  ? "..."
                                  : "Eliminar"}
                              </button>
                            </div>
                          </div>
                          <div className="epic-result-grid">
                            <div className="epic-result-item">
                              <span className="epic-result-label">Nombre</span>
                              <span className="epic-result-value">
                                {row.USUARIO || "---"}
                              </span>
                            </div>
                            <div className="epic-result-item">
                              <span className="epic-result-label">Cedula</span>
                              <span className="epic-result-value">
                                {row.CEDULA || "---"}
                              </span>
                            </div>
                            <div className="epic-result-item">
                              <span className="epic-result-label">
                                Tipificacion
                              </span>
                              <span className="epic-result-value">
                                {row.TIPIFICACION || "---"}
                              </span>
                            </div>
                            <div className="epic-result-item">
                              <span className="epic-result-label">
                                Telefono
                              </span>
                              <span className="epic-result-value">
                                {row["TELEFONO CELULAR"] || "---"}
                              </span>
                            </div>
                            <div className="epic-result-item">
                              <span className="epic-result-label">Fecha</span>
                              <span className="epic-result-value">
                                {row.FECHA || "---"}
                              </span>
                            </div>
                            <div className="epic-result-item">
                              <span className="epic-result-label">
                                Usuario Vivanto
                              </span>
                              <span className="epic-result-value">
                                {row["USUARIO VIVANTO"] || "---"}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
