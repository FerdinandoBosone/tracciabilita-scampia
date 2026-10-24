// Collegamento al database Upstash Redis creato dal pannello di Vercel (Storage).
// Vercel imposta da solo le variabili KV_REST_API_URL e KV_REST_API_TOKEN.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const K = { state: "scampia:state", rev: "scampia:rev", backup: "scampia:backup" };

function configured() { return Boolean(URL_ && TOKEN); }

async function cmd(args) {
  const r = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: "Bearer " + TOKEN, "content-type": "application/json" },
    body: JSON.stringify(args),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

// Salva solo se nessun altro ha salvato nel frattempo (stessa revisione): restituisce la nuova revisione o -1.
const CAS = "local r = tonumber(redis.call('GET', KEYS[2]) or '0') " +
  "if r ~= tonumber(ARGV[1]) then return -1 end " +
  "redis.call('SET', KEYS[1], ARGV[2]) " +
  "return redis.call('INCR', KEYS[2])";

async function readState() {
  const [s, rev] = await cmd(["MGET", K.state, K.rev]);
  return { data: s ? JSON.parse(s) : null, rev: Number(rev || 0) };
}

async function writeState(expectedRev, data) {
  const body = JSON.stringify(data);
  const res = await cmd(["EVAL", CAS, "2", K.state, K.rev, String(expectedRev), body]);
  if (Number(res) === -1) return -1;
  // copia di sicurezza: ultime 100 versioni
  await cmd(["LPUSH", K.backup, JSON.stringify({ t: new Date().toISOString(), rev: Number(res), data })]);
  await cmd(["LTRIM", K.backup, "0", "99"]);
  return Number(res);
}

module.exports = { cmd, configured, readState, writeState };
