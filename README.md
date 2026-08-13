# Lehrer-App — ausgelieferter Stand

Dieses Repository enthält **ausschließlich die gebauten Programmdateien** der
Lehrer-App, damit sie über GitHub Pages als `https://`-Adresse erreichbar sind.
Erst dadurch stellt der Browser auf dem iPad die Verschlüsselungsfunktionen
bereit — ohne `https://` verweigert die App bewusst den Start.

## Hier liegen keine Daten

Noten, Namen, Kursbucheinträge und Sitzpläne liegen **verschlüsselt auf dem
iPad** und verlassen es zu keinem Zeitpunkt. Vom Server geladen werden nur die
Programmdateien. Die App baut technisch keine Verbindungen nach außen auf; die
Content-Security-Policy in `index.html` unterbindet das.

Deshalb ist dieses Repository unbedenklich öffentlich.

## Nicht von Hand bearbeiten

Der Inhalt wird erzeugt. Änderungen gehören in den Quelltext des Projekts und
werden mit `bash skripte/veroeffentlichen.sh` hierher übertragen — von Hand
Geändertes wird beim nächsten Lauf überschrieben.
