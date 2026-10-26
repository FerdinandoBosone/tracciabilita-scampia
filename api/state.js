const { configured, readState, writeState } = require("./_db");
const { checkPin } = require("./_auth");
const SEED = require("./_seed");

function valid(d) {
  return d && typeof d === "object" && Array.isArray(d.lotti) && d.lotti.length < 5000 &&
    d.lotti.every((l) => l && /^A[1-4]-C\d{2}-[A-Z]{2}-(\d{2}\.\d{2}\.\d{2}\*?-)?\d{4}$/.test(l.code) && Array.isArray(l.ev));
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!configured()) return res.status(500).json({ error: "Database non collegato al progetto." });
  try {
    if (req.method === "GET") {
      const s = await readState();
      return res.status(200).json({ rev: s.rev, data: s.data || SEED });
    }
    if (req.method === "POST") {
      const a = await checkPin(req);
      if (!a.ok) return res.status(a.status).json({ error: a.error });
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      if (!valid(body.data)) return res.status(400).json({ error: "Dati non validi: il salvataggio è stato rifiutato." });
      if (JSON.stringify(body.data).length > 900000) return res.status(413).json({ error: "Archivio troppo grande." });
      const rev = await writeState(Number(body.rev || 0), body.data);
      if (rev === -1) {
        const s = await readState();
        return res.status(409).json({ rev: s.rev, data: s.data || SEED });
      }
      return res.status(200).json({ rev, data: body.data });
    }
    return res.status(405).json({ error: "Metodo non consentito" });
  } catch (e) {
    return res.status(500).json({ error: "Errore del server: riprova tra poco." });
  }
};
