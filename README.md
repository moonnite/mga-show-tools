# MGA Show Tools

Browserbasiertes Netzwerk-Steuerungstool für Stream-Overlays und Laser-Szenen für die Liveproduktion "MatriX Gegen Alle" der Jugendfreizeitstätte MatriX Königsbrunn.

## Funktionen

- Stream Overlay Management: Anzeige des Punkteverhältnisses eines Spiels, Anzeige von Informationstexten, Anzeige des Spielnamens, Anzeige des Gesamtpunktestandes mit Videoanimation im Hintergrund
- Laser Scene Management: Steuerung von Laserszenen zur Positionsanzeige auf der Spielfläche

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

## Einbindung in OBS

Einindung in OBS als Browserquelle mit Benutzerdefiniertem CSS
Verwendung der URL: `http://localhost:8080` or `http://<host-ip>:8080`

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

Die Spielernamen können in der Datei `backend/storage/save.json` oder in der Spalte Gesamtpunktzahl im Manage-Overlay geändert werden.

Laser Szenennamen werden unabhängig davon in `backend/storage/laser_save.json` gespeichert und können direkt im Laser-Panel editiert werden.

## Verwendung

- Manage-Overlay: Die Benutzeroberfläche steht unter `http://<host-ip>:8080/manage` zur Verfügung.

- Laser Control Panel: Das Laser Control Panel ist unter `http://<host-ip>:8080/laser` erreichbar.

## Hinweis:

Für die Laser-MIDI-Anbindung wird ein installiertes LoopMIDI-Device benötigt, das folgenden Namen hat: `MGA-Webtool-Laser`. Dieses muss im Laser Control Panel ausgewählt werden, um die MIDI-Kommunikation zu ermöglichen. Außerdem muss am Laser ein entsprechendes MIDI Config File geladen werden.
