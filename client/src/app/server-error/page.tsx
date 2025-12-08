export default function Custom500() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", fontFamily: "Segoe UI" }}>
      <h1 style={{ fontSize: "2.25rem", fontWeight: "bold" }}>500 - Виникла помилка на сервері</h1>
      <p style={{ marginTop: "1rem", fontSize: "1.125rem" }}>Щось пішло не так. Будь ласка, спробуйте пізніше.</p>
    </div>
  );
}
