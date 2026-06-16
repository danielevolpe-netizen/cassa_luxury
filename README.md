# Cassa Luxury

Gestionale web per la cassa, la flotta e la contabilità di una società di noleggio/compravendita di auto di lusso.

## Funzionalità (in sviluppo)

- **Registro movimenti** entrate/uscite con IVA (22% automatica + override), Fee, pagamenti parziali e residuo.
- **Conto economico per società** (Costi / Ricavi / Totale, con drill-down per categoria).
- **Flotta & leasing**: anagrafica auto, canoni, debito residuo, scadenze (bolli/assicurazioni) con alert.
- **Crediti & debiti**: da avere/dare, depositi cauzionali, residui.
- **Multi-utente con ruoli** (admin / collaboratore).
- **Export** Excel/CSV.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + TypeScript
- [Neon](https://neon.tech/) Postgres + [Drizzle ORM](https://orm.drizzle.team/)
- [Auth.js](https://authjs.dev/) (autenticazione e ruoli)
- Tailwind CSS

## Setup locale

1. Installa le dipendenze:
   ```bash
   npm install
   ```
2. Copia `.env.example` in `.env` e imposta `DATABASE_URL` (connessione Neon pooled) e `AUTH_SECRET`.
3. Avvia l'ambiente di sviluppo:
   ```bash
   npm run dev
   ```
   App su http://localhost:3000

## Script

| Comando | Descrizione |
| --- | --- |
| `npm run dev` | Avvia il server di sviluppo |
| `npm run build` | Build di produzione |
| `npm run start` | Avvia la build di produzione |
| `npm run lint` | Lint del codice |
| `npm run db:generate` | Genera le migrazioni Drizzle dallo schema |
| `npm run db:migrate` | Applica le migrazioni al database |
| `npm run db:push` | Sincronizza lo schema col database (dev) |
| `npm run db:studio` | Apre Drizzle Studio |

## Struttura

```
src/
  app/        # Pagine e layout (App Router)
  db/
    index.ts  # Client Drizzle + Neon
    schema.ts # Schema del database
drizzle/      # Migrazioni generate
```
