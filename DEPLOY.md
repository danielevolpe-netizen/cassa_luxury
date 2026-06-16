# Deploy su Vercel

L'app è pronta per il deploy. Il database Neon (`cassa-luxury`) è già creato,
migrato e con l'utente admin: in produzione si usa lo **stesso** database, quindi
basta configurare le variabili d'ambiente.

## 1. Variabili d'ambiente da impostare su Vercel

| Variabile | Valore |
| --- | --- |
| `DATABASE_URL` | La connection string **pooled** di Neon (la stessa del file `.env` locale). |
| `AUTH_SECRET` | Un segreto robusto. Generalo con `npx auth secret` oppure `openssl rand -base64 32`. |

> `AUTH_URL` **non** serve in produzione: `trustHost` è attivo e Vercel rileva l'host automaticamente.
> Imposta le variabili per gli ambienti **Production** (e Preview se vuoi le anteprime).

## 2. Deploy dalla dashboard Vercel (consigliato)

1. Vai su https://vercel.com/new e importa il repo GitHub `danielevolpe-netizen/cassa_luxury`.
2. Framework: **Next.js** (rilevato in automatico). Lascia i comandi di default.
3. In **Environment Variables** aggiungi `DATABASE_URL` e `AUTH_SECRET` (vedi sopra).
4. **Deploy**.

## 3. Deploy da CLI (alternativa)

```bash
npm i -g vercel
vercel login            # esegui in un terminale interattivo (es. con ! nel prompt)
vercel link             # collega il progetto
vercel env add DATABASE_URL production
vercel env add AUTH_SECRET production
vercel --prod
```

## 4. Primo accesso

- URL: quello assegnato da Vercel (es. `https://cassa-luxury.vercel.app`).
- Credenziali admin: `daniele@numbersgroup.it` / `CassaLuxury2026!` → **cambia la password**.

## Migrazioni future

Quando modifichi lo schema (`src/db/schema.ts`):

```bash
npm run db:generate     # crea la migrazione in drizzle/
npm run db:migrate      # applica al database (DATABASE_URL del .env)
```

Le migrazioni vanno applicate al database Neon (lo stesso usato in produzione).
Versiona sempre i file in `drizzle/`.
