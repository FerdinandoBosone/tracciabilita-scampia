# Tracciabilità Cantiere Scampia – sito per Vercel

Sito pubblico di avanzamento lavori e tracciabilità dei rifiuti (cumuli, prelievi, codici EER, FIR, conferimenti),
con area riservata agli addetti protetta da codice.

## Contenuto della cartella
- `index.html` – il sito (pagine pubbliche e gestione addetti)
- `api/state.js` – legge e salva i dati del cantiere
- `api/auth.js` – verifica il codice degli addetti
- `api/_db.js`, `api/_auth.js` – collegamento al database e controllo del codice
- `api/_seed.js` – dati dimostrativi mostrati finché non si salva il primo dato
- `vercel.json`, `package.json` – configurazione

## Impostazioni richieste su Vercel
1. Database **Upstash for Redis** collegato al progetto (scheda Storage): crea da solo le variabili `KV_REST_API_URL` e `KV_REST_API_TOKEN`.
2. Variabile **ADMIN_PIN**: il codice di accesso degli addetti (almeno 8 caratteri).

## Note
- Ogni salvataggio conserva una copia di sicurezza: nel database restano le ultime 100 versioni (chiave `scampia:backup`).
- Se due addetti salvano nello stesso istante, il secondo riceve un avviso e ripete l'operazione: nessun dato viene sovrascritto.
- Dopo 10 codici errati in un minuto, l'accesso da quel dispositivo si blocca per un minuto.
- Tutto ciò che è nel sito è pubblico: non inserire dati riservati.
