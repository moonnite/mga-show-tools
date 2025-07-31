# MGA - Overlay

Matrix gegen Alle - Stream Overlay

## Funktionen

- Anzeige des Punkteverhältnisses eines Spiels
- Anzeige von Informationstexten
- Anzeige des Spielnamens
- Anzeige des Gesamtpunktestandes mit Videoanimation im Hintergrund

## Installation

```bash
cd backend
npm install
cd ../frontend
npm install
npm run build
cd ../backend
npm run build
npm run start
```

## Einbindung

Einindung in OBS mit Benutzerdefiniertem CSS
Verwendung der URL: http://localhost:8080

```css
body {
  background-color: rgba(0, 0, 0, 0);
  margin: 0px auto;
  overflow: hidden;
}
```

## Konfiguration

Die Konfiguration der Maximalpunktzahlen in den Dropdowns erfolgt in der Datei `backend/storage/save.json`.
Bei einer Änderung muss nur das Manage Overlay neu geladen werden.
Da die Daten immer vom Server an das Stream Overlay gesendet werden, ist es nicht notwendig, das Stream Overlay neu zu laden.

Sie Spielernamen können in der Datei `backend/storage/save.json` oder in der Spalte Gesamtpunktzahl im Manage-Overlay geändert werden.

## Verwendung

Die Benutzeroberfläche steht unter http://localhost:8080/manage zur Verfügung.
