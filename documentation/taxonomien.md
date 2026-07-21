# Taxonomien fuer inhalte

Diese Website verwendet vier getrennte Taxonomien. Die oeffentlichen Namen und
URLs sind deutsch:

| Erwaehnung | Richtiges Feld |
| --- | --- |
| Thaksin Shinawatra | `leute` |
| Koh Samui | `orte` |
| Militaerputsch 2006 | `ereignisse` |
| Politik | `themen` |
| Tourismus | `themen` |
| Tsunami 2004 | `ereignisse` |
| Lamai Beach | `orte` |

> Personen, Orte und Ereignisse sind registrierte Entitaeten. Jeder verwendete
> Wert benoetigt einen Eintrag in der jeweiligen Content Collection. Themen sind
> eine offene redaktionelle Taxonomie und koennen ohne eigenen Collection-Eintrag
> verwendet werden.

## Felder

`leute` beschreibt konkrete, identifizierbare Personen. `orte` beschreibt
konkrete geografische Orte, Sehenswuerdigkeiten, Gebaeude, Straende,
Veranstaltungsorte oder Verwaltungsgebiete. `ereignisse` beschreibt konkrete
benannte historische, politische, kulturelle, natuerliche oder wiederkehrende
Ereignisse. `themen` beschreibt allgemeine redaktionelle Themen, Begriffe und
Schlagwoerter.

Eine Person, ein Ort oder ein Ereignis wird nicht zusaetzlich als Thema
eingetragen. Stattdessen bekommt der Beitrag die passende registrierte
Entitaetsreferenz und nur echte allgemeine Themen:

```yaml
leute:
  - thaksin-shinawatra
themen:
  - politik
  - exil
```

Falsch ist:

```yaml
leute:
  - thaksin-shinawatra
themen:
  - thaksin-shinawatra
```

## Eintraege und seiten

Ein Collection-Eintrag ist der kanonische Datensatz. Eine oeffentliche Seite ist
nur die Darstellung dieses Datensatzes. Ein Eintrag darf minimal sein und
trotzdem als registrierte Referenz verwendet werden. Details koennen spaeter
ergaenzt werden.

Minimaler Personeneintrag:

```yaml
---
title: Vollstaendiger Name
---
```

Vollstaendigerer Personeneintrag:

```yaml
---
title: Vollstaendiger Name
description: Kurze sachliche Beschreibung.
aliases:
  - Alternative Schreibweise
born: 1949-07-26
---
```

Minimaler Ort:

```yaml
---
title: Ortsname
---
```

Vollstaendigerer Ort:

```yaml
---
title: Lamai
description: Ort an der Ostkueste von Koh Samui.
type: dorf
parent: koh-samui
coordinates:
  latitude: 9.4726
  longitude: 100.0454
---
```

Minimaler Ereigniseintrag:

```yaml
---
title: Name des Ereignisses
---
```

Vollstaendigerer Ereigniseintrag:

```yaml
---
title: Militaerputsch in Thailand 2006
description: Militaerputsch gegen die Regierung von Thaksin Shinawatra.
type: militaerputsch
startDate: 2006-09-19
orte:
  - thailand
  - bangkok
leute:
  - thaksin-shinawatra
---
```

Kuratierter Themeneintrag:

```yaml
---
title: Politik
description: Beitraege ueber Politik in Thailand.
---
```

Die Beispiele zeigen die Struktur. Faktenwerte werden nur uebernommen, wenn sie
aus vorhandenen Inhalten oder verlaesslichen Quellen geprueft wurden.

## IDs und dateinamen

Alle registrierten Entitaeten verwenden `_index.md` in einem Ordner. Der
Ordnername ist die kanonische ID:

```text
src/content/leute/thaksin-shinawatra/_index.md
```

Die Referenz im Beitrag lautet:

```yaml
leute:
  - thaksin-shinawatra
```

Nicht verwenden:

```yaml
leute:
  - Thaksin Shinawatra
  - thaksin-shinawatra/_index
```

Themen verwenden ebenfalls kurze Werte im Beitrag. Ein Eintrag in
`src/content/themen/` ist optional und dient nur als kuratierte Metadatenquelle.

## Aliase

`aliases` sind Metadaten fuer Suche, Dublettenpruefung und redaktionelle
Migration. Sie sind keine alternativen IDs. Beitraege verwenden immer die
kanonische ID.

## Orte

`parent` kann auf einen anderen Ort verweisen, zum Beispiel `lamai` auf
`koh-samui`. Diese Beziehung ist Metadaten, keine URL-Hierarchie. Die
oeffentliche URL bleibt flach:

```text
/orte/lamai/
```

## Ereignisse

Ereignisse sind wiederverwendbare benannte Entitaeten. Sie sind sinnvoll, wenn
mehrere Beitraege auf dasselbe Ereignis verweisen koennen. `recurring: true`
kennzeichnet wiederkehrende Ereignisse. `endDate` darf nicht vor `startDate`
liegen.

Nicht fuer jede beilaufige Erwaehnung im Fliesstext wird ein Ereignis angelegt.

## Sichtbarkeit

`draft: true` unterdrueckt die oeffentliche Seite und den Eintrag in
Indexseiten. Die Entitaet bleibt als interner Datensatz vorhanden.

`noindex: true` erzeugt weiterhin eine Seite, setzt aber `robots:
noindex,follow` und entfernt die Seite aus der Sitemap.

## URLs

Die aktuellen oeffentlichen URLs lauten:

```text
/leute/
/leute/[id]/
/orte/
/orte/[id]/
/ereignisse/
/ereignisse/[id]/
/themen/
/themen/[slug]/
```

Die alten `/tags/`-URLs bleiben als permanente Weiterleitungen erhalten:

```text
/tags/       -> /themen/
/tags/abc/   -> /themen/abc/
```

## Validierung

Nach Content-Aenderungen mit Taxonomiebezug laufen:

```bash
npm run validate:taxonomies
npm run validate
```

`validate:taxonomies` prueft:

* alle `leute`, `orte` und `ereignisse` in Beitraegen;
* `parent` in Orten;
* `leute` und `orte` in Ereignissen;
* Ereignis-Datumsbereiche;
* doppelte Alias-Konflikte.

Themen ohne Collection-Eintrag sind erlaubt. Personen, Orte und Ereignisse ohne
Collection-Eintrag sind Fehler.

## Haeufige fehler

Falsch: Anzeigenamen als Referenz.

```yaml
leute:
  - Thaksin Shinawatra
```

Richtig:

```yaml
leute:
  - thaksin-shinawatra
```

Falsch: Person zusaetzlich als Thema.

```yaml
leute:
  - thaksin-shinawatra
themen:
  - thaksin-shinawatra
```

Richtig:

```yaml
leute:
  - thaksin-shinawatra
themen:
  - politik
```

## Migrationsstrategie

Die alten `tags` wurden technisch zu `themen` migriert. Die neue Trennung von
Personen, Orten, Ereignissen und Themen wird danach schrittweise waehrend der
redaktionellen Durchsicht angewendet. Bestehende Beitraege ohne `orte` oder
`ereignisse` bleiben gueltig. Orte und Ereignisse werden nicht automatisch aus
Prosa abgeleitet.
