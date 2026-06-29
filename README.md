# TA Management – Website

Offizielle Website der **TA Management GmbH**, einem spezialisierten Recruiting-Partner für Fach- und Führungskräfte im Bauwesen, Ingenieurwesen und der Technischen Gebäudeausrüstung (TGA).

**Live:** [https://ta-management.de](https://ta-management.de)

---

## Inhaltsverzeichnis

- [Über das Projekt](#über-das-projekt)
- [Tech-Stack](#tech-stack)
- [Projektstruktur](#projektstruktur)
- [Seiten & Funktionen](#seiten--funktionen)
- [Backend & Integrationen](#backend--integrationen)
- [Design-System](#design-system)
- [SEO & Structured Data](#seo--structured-data)
- [Deployment](#deployment)
- [Setup Google Apps Script](#setup-google-apps-script)
- [Kontakt](#kontakt)

---

## Über das Projekt

`ta-management-reboot` ist ein statisches, mehrsprachiges HTML/CSS/JS-Webprojekt ohne Build-Tool. Es verbindet eine klassische Multi-Page-Architektur mit einer dynamischen Job-Verwaltung über Supabase und einem serverlosen Bewerbungsformular via Google Apps Script.

**Unternehmen:**
- TA Management GmbH
- Geibelstraße 46b, 22303 Hamburg
- Tel: +49 40 22866983
- E-Mail: info@ta-management.de
- Gegründet: 2023
- Bewertung: 4,9 / 5 (45 Bewertungen)

---

## Tech-Stack

| Bereich | Technologie |
|---|---|
| Markup | HTML5 |
| Styling | [Tailwind CSS](https://tailwindcss.com) (CDN, mit `forms` & `container-queries` Plugins) |
| Fonts | Google Fonts – Space Grotesk, Inter, Material Symbols |
| Datenbank | [Supabase](https://supabase.com) (PostgreSQL, REST API) |
| Bewerbungsformular | Google Apps Script (Webhook + Google Drive) |
| Benachrichtigungen | Google Chat Webhook |
| Hosting | [Netlify](https://netlify.com) |
| Icons | Material Symbols (Google) |

---

## Projektstruktur

```
ta-management-reboot/
├── index.html              # Startseite / Landing Page
├── jobs.html               # Stellenangebote (dynamisch via Supabase)
├── disziplinen.html        # Recruiting-Disziplinen (Hochbau, TGA, Tiefbau)
├── unternehmen.html        # B2B-Seite für Unternehmen
├── ueberuns.html           # Team & interne Stellen
├── datenschutz.html        # Datenschutzerklärung
├── dsgvo.html              # DSGVO-Informationen
├── impressum.html          # Impressum (§ 5 TMG)
├── _redirects              # Netlify Routing-Regeln
├── robots.txt              # Crawler-Direktiven
├── sitemap.xml             # XML-Sitemap
├── google-apps-script/
│   └── Code.gs             # Google Apps Script für Bewerbungs-Backend
├── jobAd/
│   └── index.html          # Dynamische Stellenanzeige (URL-Parameter-gesteuert)
└── images/
    ├── logo_correct.png    # Firmenlogo
    ├── favicon.ico         # Favicon
    ├── Cities/             # Stadtbilder (gesperrt via robots.txt)
    ├── impressions/        # Impressionsbilder (gesperrt via robots.txt)
    └── *.jpg / *.png       # Team-Profilbilder
```

---

## Seiten & Funktionen

### `index.html` – Startseite
Hauptlandingpage mit Hero-Bereich, Leistungsübersicht, Social Proof und CTAs für Kandidaten und Unternehmen. Enthält vollständiges Schema.org `Organization`- und `WebSite`-Markup.

### `jobs.html` – Stellenangebote
Dynamisch geladene Stellenliste aus der Supabase-Datenbank (`public_job_ads`-Tabelle). Enthält Filter, Suchfunktion und Skeleton-Loader-Animation. Beim Seitenaufruf wird ein dynamisches `JobPosting`-Schema via JavaScript eingefügt.

### `jobAd/index.html` – Einzelne Stellenanzeige
Wird über URL-Parameter mit Job-ID aufgerufen (`/jobAd/?id=XYZ`). Lädt die Stelle aus Supabase, rendert alle Details und enthält das Bewerbungsformular mit:
- Pflichtfelder: Name, E-Mail
- Optionale Felder: Telefon, Gehaltswunsch, Freitext
- **Lebenslauf-Upload** (Base64-Encoding, wird via Google Apps Script in Google Drive gespeichert)
- Klick-Tracking in der `public_job_ad_clicks`-Tabelle (Supabase)

Die Netlify-Redirect-Regel (`_redirects`) sorgt dafür, dass alle `/jobAd/*`-Pfade auf `jobAd/index.html` zeigen (SPA-ähnliches Routing).

### `disziplinen.html` – Recruiting-Disziplinen
Präsentation der vier Kernbereiche:
- **Hochbau** – Bauleiter, Projektleiter, Oberbauleiter, Kalkulator
- **Ingenieurbau** – Brücken-, Tunnel- und konstruktiver Ingenieurbau
- **TGA (Technische Gebäudeausrüstung)** – HLSK, Elektrotechnik, Gebäudeautomation
- **Tiefbau** – Spezialtiefbau, Erdarbeiten, Infrastruktur

### `unternehmen.html` – Für Unternehmen
B2B-Seite mit Leistungsbeschreibung, Prozessdarstellung, Preismodell und Kontaktformular für Auftraggeber.

### `ueberuns.html` – Über Uns
Teampräsentation mit Profilbildern der Mitarbeiter, Unternehmenskultur, Google Maps Einbettung (Standort Hamburg) sowie Auflistung interner Stellenangebote (ebenfalls dynamisch aus Supabase, gefiltert nach `is_intern=true`).

### Rechtliche Seiten
`datenschutz.html`, `dsgvo.html` und `impressum.html` sind als `noindex` markiert und beinhalten alle gesetzlich vorgeschriebenen Angaben nach DSGVO und TMG.

---

## Backend & Integrationen

### Supabase (Datenbank)
- **Projekt-URL:** `https://vccbpwvprepehqxatnuo.supabase.co`
- **Tabellen:**
  - `public_job_ads` – Stellenanzeigen (Felder: `id`, `jobTitle`, `jobLocation`, `is_public`, `is_intern`, u.a.)
  - `public_job_ad_clicks` – Klick-Tracking pro Stelle

Die Kommunikation erfolgt ausschließlich über die Supabase REST API mit API-Key im Request-Header.

### Google Apps Script (`google-apps-script/Code.gs`)
Serverless-Backend für das Bewerbungsformular. Bei einer `POST`-Anfrage:
1. Dekodiert den Base64-kodierten Lebenslauf und speichert ihn in einem Google Drive Ordner.
2. Sendet eine formatierte Benachrichtigung an einen Google Chat Space via Webhook.
3. Gibt eine JSON-Antwort zurück (`{ success: true, fileUrl: "..." }`).

Konfigurierbare Konstanten in `Code.gs`:
```javascript
const GOOGLE_CHAT_WEBHOOK_URL = "..."; // Google Chat Webhook URL
const DRIVE_FOLDER_ID = "...";         // Google Drive Ordner-ID für Lebensläufe
```

---

## Design-System

Das Design basiert auf einem **Material Design 3** Farbtoken-System, ausschließlich im **Dark Mode**:

| Token | Farbe | Verwendung |
|---|---|---|
| `background` | `#121416` | Seitenhintergrund |
| `surface` | `#121416` | Karten-Hintergrund |
| `primary` | `#ffb693` | Akzentfarbe (hell) |
| `primary-container` | `#ff6b00` | CTA-Buttons, Highlights |
| `tertiary` | `#e9c400` | Sekundärer Akzent (Gold) |
| `on-surface` | `#e2e2e5` | Fließtext |

**Typografie:**
- Headlines: `Space Grotesk` (Google Fonts)
- Body & Labels: `Inter` (Google Fonts)

**Border Radius:** `0px` überall (scharfe, kantige Ästhetik)

**Glassmorphism:** `.glass-card` – `backdrop-filter: blur(20px)` mit halbtransparentem Hintergrund für Karten.

---

## SEO & Structured Data

Jede Seite enthält:
- `<meta name="description">` und `<meta name="keywords">`
- Canonical URL (`<link rel="canonical">`)
- Open Graph Tags (Facebook/LinkedIn)
- Twitter Card Tags
- `hreflang` Sprachattribut (`lang="de"`)

**Schema.org JSON-LD:**
- `index.html`: `Organization` + `WebSite` (inkl. `SearchAction`, Adresse, Telefon, Social Links, `aggregateRating`)
- `jobs.html`: Dynamische `JobPosting`-Liste (via JavaScript generiert)
- `jobAd/index.html`: Einzelnes `JobPosting`-Schema (via JavaScript generiert)

**robots.txt:**
```
User-agent: *
Allow: /
Disallow: /images/Cities/
Disallow: /images/impressions/
Sitemap: https://www.ta-management.de/sitemap.xml
```

---

## Deployment

Das Projekt wird auf **Netlify** gehostet. Die Datei `_redirects` im Root-Verzeichnis definiert folgende Routing-Regel:

```
/jobAd/* /jobAd/index.html 200
```

Dies ermöglicht URL-Parameter-basiertes Routing für die Einzelstellenanzeige (z.B. `/jobAd/?id=123`).

Deployment erfolgt durch Push auf den verbundenen Git-Branch (automatisches CI/CD via Netlify).

---

## Setup Google Apps Script

Um das Bewerbungsformular vollständig einzurichten:

1. Gehe zu [https://script.google.com](https://script.google.com) und erstelle ein neues Projekt.
2. Kopiere den Inhalt von `google-apps-script/Code.gs` in die `Code.gs`-Datei.
3. Ersetze `GOOGLE_CHAT_WEBHOOK_URL` mit der Webhook-URL eures Google Chat Spaces.
4. Erstelle einen Google Drive Ordner für Lebensläufe und ersetze `DRIVE_FOLDER_ID` mit der Ordner-ID aus der Drive-URL.
5. Klicke auf **Bereitstellen → Neue Bereitstellung**.
   - Typ: `Web-App`
   - Ausführen als: `Ich` (dein Google-Konto)
   - Zugriff: `Jeder`
6. Kopiere die generierte Deployment-URL und trage sie in `jobAd/index.html` als `APPS_SCRIPT_URL` ein.

---

## Kontakt

**TA Management GmbH**
Geibelstraße 46b · 22303 Hamburg
[info@ta-management.de](mailto:info@ta-management.de) · +49 40 22866983

Social Media:
- [YouTube](https://www.youtube.com/@TAManagementGmbH)
- [Instagram](https://www.instagram.com/ta_management_/)
- [TikTok](https://www.tiktok.com/@ta_management)
