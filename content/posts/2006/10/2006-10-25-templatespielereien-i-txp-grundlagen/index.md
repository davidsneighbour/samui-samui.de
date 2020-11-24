---
title: 'Templatespielereien I: TXP-Grundlagen'
author: Patrick Kollitsch
type: post
date: 2006-10-25T01:04:00+00:00
url: /2006/10/templatespielereien-i-txp-grundlagen/




---
Textpattern besteht aus Templatesicht aus <span class="marker">vier Komponenten: Sektionen (sections), Seiten (pages), Bausteinen (forms) und den Stylesheets</span>. Ich persönlich bevorzuge es die Stylesheets nicht über <span class="caps">TXP</span> zu verwalten sondern habe sie als Dateien abgelegt. Damit kann der Server zum einen schneller darauf zugreifen (minimal, ich weiß), zum anderen kann ich per Skript bestimmte Pfade anpassen oder mit <span class="caps">PHP</span> und Variablen arbeiten. Das Stylesheetsystem von <span class="caps">TXP</span> parst weder TXP-Tags, noch ist es per Plugins erweiterbar. 

**Sektionen**

Sektionen kann man am besten mit Website-Bereichen vergleichen. Ein ein einfaches Blog kann bspw. in <span class="caps">TXP</span> aus den Sektionen weblog, archiv und kontakt bestehen. Jede Sektion kann durch ein eigenes Template (eine Seite) individuell angepasst werden. Ebenso kann separat je Sektion festgelegt werden, ob die Inhalte dieser Sektion in den Feeds verfügbar sein sollen und durchsuchbar sein sollen. 

Man könnte mit dem Sektionsprinzip theoretisch eine eigene Website pro Sektion erstellen. Ich habe mal für eine Unternehmensseite die internationalisierten Versionen per Sektion realisiert. Re(De)Signation ist so eine Sektion, die unabhängig von den anderen Bereichen der [die schreiBBloga.de][1] läuft und ein kleines bisschen anders aussieht. 

Die Sektionen gehören auch zum Inhaltssystem von Textpattern. Man kann einzelne Artikel jeweils einer Sektion zuordnen. Da jeder Artikel auch noch zwei Kategorien zugewiesen werden kann ergibt sich so die Möglichkeit zu einem zweidimensionalen Systematisierungsprinzip der Inhalte. Das allerdings wäre ein Web1.0-Prinzip. Heutzutage taggt man. Dazu später mehr.

**Seiten**

Seiten sind die Templates für die jeweiligen Sektionen. Es gibt ein default-Template mit dem man unter Zuhilfenahme [konditioneller Tags][2] die ganze Website gestalten könnte. Ich bevorzuge hier eine Seite pro Sektion. Das ist übersichtlicher.

**Bausteine**

Die Bausteine sind die kleinsten Einheiten des Templatesystems. Unter anderem kann man das Aussehen der Artikel individuell bestimmen, die funktionalen Bereiche wie bspw. Kommentarsystem und Darstellung anpassen und häufig verwendete Elemente wiederverwertbar ablegen.

**Tags**

Die Tags sind die Steinchen, die Textpattern am Laufen halten. Man kann [die systeminternen Tags][3] per Plugin um eigene Tags erweitern. 

Damit wäre auch schon alles gesagt zu den Möglichkeiten Textpatterns in Bezug auf die Templates. Ich finde das System sehr flexibel und bin noch nie in meinen Bedürfnissen an seine Grenzen gestossen. Aber genug der Basics. Nachher gehts ans Eingemachte: Das Grundlayout.

**in der die schreiBBloga.de**

Hier in der [die schreiBBloga.de][1] habe ich wie gesagt pro Sektion ein Seitentemplate. Header (inklusive Titel) und Footer (inklusive Seitenspalte) der Seite werden per Baustein in jedem Template erzeugt. Aktuell habe ich _einen_ Baustein für Artikel, in der alten Version war es so, dass ich einen Artikelbaustein pro Sektion hatte (was auch nicht viel mehr war). Die Inhalte der Seitenleiste waren plugingeneriert. Ich habe eine Menge eigener Tags durch Plugins inplementiert, was ich auch in der neuen Version weitgehend beibehalten will.

 [1]: http://die.schreibbloga.de/
 [2]: http://textpattern.net/wiki/index.php?title=Alphabetical_Tag_Listing#I
 [3]: http://textpattern.net/wiki/index.php?title=Alphabetical_Tag_Listing
