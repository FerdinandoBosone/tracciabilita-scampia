const { configured, readState, writeState } = require("./_db");
const { checkPin } = require("./_auth");
const SEED = require("./_seed");

// Ripristina i dati dimostrativi iniziali (richiede il codice addetti).
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo non consentito" });
  if (!configured()) return res.status(500).json({ error: "Database non collegato al progetto." });
  try {
    const a = await checkPin(req);
    if (!a.ok) return res.status(a.status).json({ error: a.error });
    const data = JSON.parse(JSON.stringify(SEED));
    data.aggiornato = new Date().toISOString().slice(0, 16) + ":00";
    for (let i = 0; i < 3; i++) {
      const cur = await readState();
      const rev = await writeState(cur.rev, data);
      if (rev !== -1) return res.status(200).json({ rev, data });
    }
    return res.status(409).json({ error: "Dati in aggiornamento: riprova tra un istante." });
  } catch (e) {
    return res.status(500).json({ error: "Errore del server: riprova tra poco." });
  }
};
