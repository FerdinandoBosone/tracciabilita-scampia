const crypto = require("crypto");
const { cmd } = require("./_db");

function same(a, b) {
  const x = Buffer.from(String(a || "")), y = Buffer.from(String(b || ""));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

// Verifica il codice degli addetti (variabile ADMIN_PIN) con un limite di 10 tentativi errati al minuto.
async function checkPin(req) {
  const pin = req.headers["x-pin"];
  const expected = process.env.ADMIN_PIN;
  if (!expected) return { ok: false, status: 500, error: "Codice addetti non impostato: aggiungi ADMIN_PIN nelle variabili di Vercel." };
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "na";
  const key = "scampia:fail:" + ip;
  const fails = Number((await cmd(["GET", key])) || 0);
  if (fails >= 10) return { ok: false, status: 429, error: "Troppi tentativi: riprova tra un minuto." };
  if (same(pin, expected)) return { ok: true };
  await cmd(["INCR", key]);
  await cmd(["EXPIRE", key, "60"]);
  return { ok: false, status: 401, error: "Codice non corretto." };
}

module.exports = { checkPin };
