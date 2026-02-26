"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";

// Usar el endpoint de AppSheet directamente
const APP_SHEET_URL = "https://api.appsheet.com/api/v2/apps/a6401217-8537-47b2-bd5c-bbef3d515087/tables/Table%201/Action";

// Lista de usuarios autorizados de Vivanto (nombre / usuario)
const USUARIOS_VIVANTO: { nombre: string; usuario: string }[] = [
  { "nombre": "SANDRA GALVIS MEDINA", "usuario": "sgalvism" },
  { "nombre": "JOHAN ALEJANDRO MENESES VILLAMIZAR", "usuario": "jmeneses" },
  { "nombre": "ANGIE VIVIANA ROCHA LOPEZ", "usuario": "avrochal" },
  { "nombre": "YULY CONSTANZA ROMERO TELLEZ", "usuario": "YCROMEROT" },
  { "nombre": "MARCY ANYELA SAAVEDRA AVILA", "usuario": "masaavedraa" },
  { "nombre": "LIZDEY JOHANA CASTILLO TELLEZ", "usuario": "Ljcastillot" },
  { "nombre": "MARIA FERNANDA RAMIREZ GIRALDO", "usuario": "mframiezg" },
  { "nombre": "VIVIAN GIRALDO", "usuario": "Vgiraldo" },
  { "nombre": "SYNDY PATRICIA LEON RODRIGUEZ", "usuario": "Sleon" },
  { "nombre": "SEBASTIAN ALEJANDRO ROMERO", "usuario": "saromero" },
  { "nombre": "LISBETH MILDRETH PERTUZ CERVANTES", "usuario": "lmpertuzc" },
  { "nombre": "JESSICA MARQUEZ MARQUEZ ZAMORA", "usuario": "jmmarquezz" },
  { "nombre": "MARTINA CORDOBA GUEVARA", "usuario": "mcordobag" },
  { "nombre": "YESSICA MARIA GONGORA CASTRO", "usuario": "ymgongorac" },
  { "nombre": "LAURA JUDITH LOPEZ ESCOBAR", "usuario": "ljlopeze" },
  { "nombre": "KATHERINE CELIS", "usuario": "KCELIS" },
  { "nombre": "JUAN JOSE BASTO GONZALEZ", "usuario": "jjbastog" },
  { "nombre": "MILADIS ACOSTA ASIS", "usuario": "macostaa" },
  { "nombre": "TATIANA TORRES SANCHEZ", "usuario": "Ttorress" },
  { "nombre": "ANGELA RODRIGUEZ", "usuario": "arodriguez" },
  { "nombre": "WENDI DAYANA TAMARA FLOREZ", "usuario": "wdtamaraf" },
  { "nombre": "OLGA YICETH GOMEZ", "usuario": "oygomez" },
  { "nombre": "DIEGO ARMANDO VERNAZA DURAN", "usuario": "davernazad" },
  { "nombre": "SANTIAGO ALBEIRO VARGAS ARIAS", "usuario": "savargasa" },
  { "nombre": "ANGELICA MARIA GONZALEZ MEJIA", "usuario": "amgonzalezm" },
  { "nombre": "ELIZA PAREJA SALAS", "usuario": "epsalas" },
  { "nombre": "NELCY YASMIN DAVILA VILLAMIZAR", "usuario": "nydavilav" },
  { "nombre": "MONICA OROZTEGUI MUNOZ", "usuario": "morozteguim" },
  { "nombre": "MEYRAM DEL MAR GONZALEZ LIZCANO", "usuario": "mdgonzalezl" },
  { "nombre": "YUSNEIDIS VANEGAS CORTECERO", "usuario": "yvanegasc" }
]
  ;


interface RegistroRow {
  "USUARIO-VIVANTO": string;
  "CODIGO-HOGAR": string;
  "USUARIO": string;
  "CEDULA": string;
  "TIPIFICACION": string;
  "FECHA": string;
  "RESPONSABLE": string;
  "TELEFONO-CELULAR": string;
  "URL": string;
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

  // ========== FUNCIÓN PARA LLAMAR A APPSHEET ==========
  async function callAppSheet(payload: any) {
    const APPLICATION_ACCESS_KEY = "V2-u5e7d-LdN4H-ttZEx-A6ea4-BRY8z-6orsP-YHqgI-wCgK4";

    try {
      const response = await fetch(APP_SHEET_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "applicationAccessKey": APPLICATION_ACCESS_KEY,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AppSheet API error:", response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error calling AppSheet:", error);
      throw error;
    }
  }

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
  async function searchHogar(e: FormEvent) {
    e.preventDefault();
    setSearchLoading(true);

    const rows = form.codigoHogarSearch.trim()
      ? [{ "CODIGO-HOGAR": form.codigoHogarSearch.trim() }]
      : [];

    const payload = {
      Action: "Find",
      Properties: {
        Locale: "es-CO",
        Timezone: "America/Bogota",
      },
      Rows: rows,
    };

    try {
      console.log("[v0] Search payload:", payload);
      const data = await callAppSheet(payload);

      const results: RegistroRow[] = Array.isArray(data)
        ? data
        : data.Rows || [];
      console.log("[v0] Parsed results:", results.length, "rows");
      setSearchResults(results);
      setEditingRow(null);
      setEditingIndex(null);
      setModalOpen(true);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
      setModalOpen(true);
      alert("Error al buscar registros. Verifica la conexión.");
    } finally {
      setSearchLoading(false);
    }
  }

  // ========== EDIT ==========
  function handleEditRow(row: RegistroRow, idx: number) {
    setEditingRow({ ...row });
    setEditingIndex(idx);
  }

  function handleEditFieldChange(field: keyof RegistroRow, value: string) {
    if (!editingRow) return;
    setEditingRow({ ...editingRow, [field]: value });
  }

  async function saveEditedRow() {
    if (!editingRow || !editingRow["CODIGO-HOGAR"]) {
      alert("No se puede editar: falta el código de hogar");
      return;
    }

    setEditLoading(true);

    // Crear el objeto con TODOS los campos requeridos por AppSheet
    const rowToUpdate: RegistroRow = {
      "USUARIO-VIVANTO": String(editingRow["USUARIO-VIVANTO"] || usuarioData?.usuario || ""),
      "CODIGO-HOGAR": String(editingRow["CODIGO-HOGAR"] || ""),
      "USUARIO": String(editingRow["USUARIO"] || ""),
      "CEDULA": String(editingRow["CEDULA"] || ""),
      "TIPIFICACION": String(editingRow["TIPIFICACION"] || "EXITOSA"),
      "FECHA": String(editingRow["FECHA"] || ""),
      "RESPONSABLE": String(editingRow["RESPONSABLE"] || usuarioData?.nombre || ""),
      "TELEFONO-CELULAR": String(editingRow["TELEFONO-CELULAR"] || ""),
      "URL": String(editingRow["URL"] || "")
    };

    const payload = {
      Action: "Edit",
      Properties: {
        Locale: "es-CO",
        Timezone: "America/Bogota"
      },
      Rows: [rowToUpdate]
    };

    try {
      console.log("[v0] Edit payload:", payload);
      await callAppSheet(payload);

      // Actualizar la fila local con los datos editados
      setSearchResults((prev) =>
        prev.map((r, i) =>
          i === editingIndex ? { ...rowToUpdate } : r
        )
      );
      setEditingRow(null);
      setEditingIndex(null);
      alert("✅ Registro actualizado correctamente");
    } catch (err) {
      console.error("Error al editar:", err);
      alert("❌ Error al actualizar el registro");
    } finally {
      setEditLoading(false);
    }
  }

  // ========== DELETE ==========
  async function deleteRow(row: RegistroRow, idx: number) {
    if (!confirm("¿Estás seguro de que deseas eliminar este registro?")) return;

    if (!row["CODIGO-HOGAR"]) {
      alert("No se puede eliminar: falta el código de hogar");
      return;
    }

    setDeleteLoading(idx);

    const payload = {
      Action: "Delete",
      Properties: {
        Locale: "es-CO",
        Timezone: "America/Bogota"
      },
      Rows: [{
        "CODIGO-HOGAR": String(row["CODIGO-HOGAR"] || "")
      }]
    };

    try {
      console.log("[v0] Delete payload:", payload);
      await callAppSheet(payload);

      setSearchResults((prev) => prev.filter((_, i) => i !== idx));
      if (editingIndex === idx) {
        setEditingRow(null);
        setEditingIndex(null);
      }
      alert("✅ Registro eliminado correctamente");
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("❌ Error al eliminar el registro");
    } finally {
      setDeleteLoading(null);
    }
  }

  // ========== ADD ==========
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Validación
    if (!form.codigoHogar.trim()) {
      alert("El código de hogar es requerido");
      return;
    }

    if (!form.nombreVictima.trim()) {
      alert("El nombre de la víctima es requerido");
      return;
    }

    // Validar que el usuario esté logueado
    if (!usuarioData) {
      alert("Error: No hay usuario logueado");
      return;
    }

    setLoading(true);

    // Formato de fecha como en el segundo código
    const date = new Date().toLocaleDateString('es-CO', {
      timeZone: 'America/Bogota',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Crear objeto exactamente como en el segundo código con RESPONSABLE
    const objeto = {
      "USUARIO-VIVANTO": usuarioData.usuario,
      "CODIGO-HOGAR": form.codigoHogar.trim(),
      "USUARIO": form.nombreVictima.trim(),
      "CEDULA": form.cedula.trim(),
      "TIPIFICACION": form.tipificacion,
      "FECHA": date,
      "RESPONSABLE": usuarioData.nombre, // NOMBRE DEL USUARIO LOGEADO
      "TELEFONO-CELULAR": form.telefono.trim(),
      "URL": ""
    };

    // Crear payload exactamente como en el segundo código
    const data = {
      Action: "Add",
      Properties: {
        Locale: "es-CO",
        Timezone: "America/Bogota"
      },
      Rows: [objeto]
    };

    // Guardar respaldo (opcional)
    localStorage.setItem("data", JSON.stringify(data));

    console.log("Datos enviados:", data);

    try {
      // Llamar directamente a la API como en el segundo código
      const response = await fetch(APP_SHEET_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'applicationAccessKey': 'V2-u5e7d-LdN4H-ttZEx-A6ea4-BRY8z-6orsP-YHqgI-wCgK4'
        },
        body: JSON.stringify(data)
      });

      const text = await response.text();
      console.log("Respuesta AppSheet:", text);

      if (response.ok) {
        alert("✅ Registro enviado correctamente");
        // Limpiar formulario
        setForm({
          codigoHogar: "",
          codigoHogarSearch: "",
          nombreVictima: "",
          cedula: "",
          tipificacion: "EXITOSA",
          telefono: "",
        });
      } else {
        alert("❌ Error al enviar los datos");
      }
    } catch (error) {
      console.error("Error al enviar:", error);
      alert("❌ Error de conexión al enviar los datos");
    } finally {
      setLoading(false);
    }
  }

  const EDITABLE_FIELDS: { key: keyof RegistroRow; label: string }[] = [
    { key: "CODIGO-HOGAR", label: "Código Hogar" },
    { key: "USUARIO", label: "Nombre" },
    { key: "CEDULA", label: "Cédula" },
    { key: "TIPIFICACION", label: "Tipificación" },
    { key: "TELEFONO-CELULAR", label: "Teléfono" },
    { key: "FECHA", label: "Fecha" },
    { key: "URL", label: "URL" },
    { key: "RESPONSABLE", label: "Responsable" },
    { key: "USUARIO-VIVANTO", label: "Usuario Vivanto" },
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
              placeholder="Buscar por código de hogar..."
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
                Código Hogar
              </label>
              <input
                className="epic-input"
                id="codigoHogar"
                name="codigoHogar"
                value={form.codigoHogar}
                onChange={handleChange}
                placeholder="Ej: 249025-S5T6U"
                required
              />
            </div>

            <div className="epic-field">
              <label className="epic-label" htmlFor="nombreVictima">
                Nombre Víctima
              </label>
              <input
                className="epic-input"
                id="nombreVictima"
                name="nombreVictima"
                value={form.nombreVictima}
                onChange={handleChange}
                placeholder="Nombre completo"
                required
              />
            </div>

            <div className="epic-row">
              <div className="epic-field">
                <label className="epic-label" htmlFor="cedula">
                  Cédula
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
                  Teléfono
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
                Tipificación
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
                <option value="EXITOSA TIPI. MANUAL">
                  TIPIFICADA MANUAL
                </option>
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
              <h2 className="epic-modal-title">Resultados de Búsqueda</h2>
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
                          {EDITABLE_FIELDS.map((f) => (
                            <div key={f.key} className="epic-edit-field">
                              <label className="epic-label">{f.label}</label>
                              {f.key === "TIPIFICACION" ? (
                                <select
                                  className="epic-input epic-select"
                                  value={String(editingRow[f.key] || "EXITOSA")}
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
                                  value={String(editingRow[f.key] || "")}
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
                              <span className="epic-result-label">Cédula</span>
                              <span className="epic-result-value">
                                {row.CEDULA || "---"}
                              </span>
                            </div>
                            <div className="epic-result-item">
                              <span className="epic-result-label">
                                Tipificación
                              </span>
                              <span className="epic-result-value">
                                {row.TIPIFICACION || "---"}
                              </span>
                            </div>
                            <div className="epic-result-item">
                              <span className="epic-result-label">
                                Teléfono
                              </span>
                              <span className="epic-result-value">
                                {row["TELEFONO-CELULAR"] || "---"}
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
                                {row["USUARIO-VIVANTO"] || "---"}
                              </span>
                            </div>
                            <div className="epic-result-item">
                              <span className="epic-result-label">
                                Responsable
                              </span>
                              <span className="epic-result-value">
                                {row.RESPONSABLE || "---"}
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
