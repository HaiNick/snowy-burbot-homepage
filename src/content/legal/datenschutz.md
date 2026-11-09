---
title: Datenschutzerklärung
linkText: datenschutz
updated: "2026-11-09"
# The retention times below must match the server configuration
# (Caddy roll_keep_for, fail2ban bantime.maxtime and dbpurgeage).
draft: false
---

# Datenschutzerklärung

## Kurzfassung

Diese Website setzt keine Cookies, nutzt kein Tracking und keine Analysewerkzeuge und lädt keine Inhalte von fremden Servern. Schriften, Skripte und Bilder liegen auf diesem Server. Verarbeitet werden nur die Daten, die für den Betrieb und die Absicherung der Website nötig sind.

## Verantwortlicher

Diese Website ist ein privates Angebot ohne kommerziellen Zweck. Verantwortlich für die Verarbeitung personenbezogener Daten ist:

Nicklas Jähnert\
E-Mail: nicklas@snowy-burbot.com

## Hosting

Die Website läuft auf einem virtuellen Server der Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, in einem Rechenzentrum in Nürnberg. Mit Hetzner besteht ein Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO.

## Cloudflare

Alle Anfragen an diese Website laufen über das Netzwerk der Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA. Cloudflare leitet die Anfragen an meinen Server weiter, schützt ihn vor Angriffen und blockiert gesperrte IP-Adressen. Dabei verarbeitet Cloudflare technische Daten der Anfrage, insbesondere Ihre IP-Adresse, die aufgerufene Adresse, Zeitpunkt, Browserkennung und Sicherheitsereignisse.

Rechtsgrundlage ist mein berechtigtes Interesse an einer sicheren und erreichbaren Website (Art. 6 Abs. 1 lit. f DSGVO). Mit Cloudflare besteht ein Vertrag zur Auftragsverarbeitung. Cloudflare ist unter dem EU-US Data Privacy Framework zertifiziert. Für Übermittlungen in die USA gelten zusätzlich die Standardvertragsklauseln der EU-Kommission.

## Server-Logfiles

Bei jedem Aufruf speichert mein Server ein Protokoll mit:

- IP-Adresse
- Datum und Uhrzeit
- aufgerufene Adresse und Antwortstatus
- Browserkennung (User-Agent)

Die Protokolle dienen dem Betrieb, der Fehlersuche und dem Erkennen von Angriffen (Art. 6 Abs. 1 lit. f DSGVO). Sie werden nach spätestens 14 Tagen gelöscht.

## Automatische Abwehr von Angriffen

Ein Programm (fail2ban) wertet die Protokolle automatisch aus. Ruft eine IP-Adresse typische Angriffsziele auf, zum Beispiel `/.env` oder `/wp-login.php`, oder erzeugt sie in kurzer Zeit sehr viele Fehler oder Anfragen, wird sie gesperrt. Die Sperre wird bei Cloudflare in einer Liste gesetzt und gilt nur für diese Website. Bei wiederholten Angriffen von derselben Adresse wird die Sperre länger: 1 Tag, dann 30 Tage, dann bis zu 1 Jahr.

Gespeichert werden die IP-Adresse, der Zeitpunkt und der Grund der Sperre. Diese Einträge werden nach spätestens 13 Monaten gelöscht. Rechtsgrundlage ist mein berechtigtes Interesse am Schutz der Website vor Angriffen (Art. 6 Abs. 1 lit. f DSGVO). Wenn Sie glauben, zu Unrecht gesperrt worden zu sein, schreiben Sie mir eine E-Mail.

## Speicherung im Browser

Wenn Sie über den Schalter in der Leiste zwischen hellem und dunklem Design wechseln, speichert Ihr Browser diese Auswahl lokal (`localStorage`, Schlüssel `theme`). Der Wert verlässt Ihr Gerät nicht. Diese Speicherung ist für die von Ihnen ausdrücklich gewünschte Funktion unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). Sie können den Eintrag jederzeit über die Einstellungen Ihres Browsers löschen.

## Kontakt per E-Mail

Wenn Sie mir eine E-Mail schreiben, verarbeite ich Ihre Adresse und Ihre Nachricht, um zu antworten (Art. 6 Abs. 1 lit. f DSGVO). E-Mails an diese Adresse nimmt Cloudflare Email Routing entgegen und leitet sie an mein privates E-Mail-Postfach weiter. Ich lösche die Nachrichten, wenn sie nicht mehr gebraucht werden.

## Ihre Rechte

Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18) und Datenübertragbarkeit (Art. 20). Gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO können Sie Widerspruch einlegen (Art. 21). Schreiben Sie dazu an die oben genannte E-Mail-Adresse.

Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren. Für mich zuständig ist der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg, Lautenschlagerstraße 20, 70173 Stuttgart.
