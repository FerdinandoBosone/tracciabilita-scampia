const { configured } = require("./_db");
const { checkPin } = require("./_auth");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo non consentito" });
  if (!configured()) return res.status(500).json({ error: "Database non collegato al progetto." });
  try {
    const a = await checkPin(req);
    if (!a.ok) return res.status(a.status).json({ error: a.error });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Errore del server" });
  }
};
