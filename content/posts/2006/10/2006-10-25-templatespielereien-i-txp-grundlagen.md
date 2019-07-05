---
title: 'Templatespielereien I: TXP-Grundlagen'
author: Patrick Kollitsch
type: post
date: 2006-10-25T01:04:00+00:00
url: /2006/10/templatespielereien-i-txp-grundlagen/




---
Textpattern besteht aus Templatesicht aus <span class="marker">vier Komponenten: Sektionen (sections), Seiten (pages), Bausteinen (forms) und den Stylesheets</span>. Ich pers&ouml;nlich bevorzuge es die Stylesheets nicht &uuml;ber <span class="caps">TXP</span> zu verwalten sondern habe sie als Dateien abgelegt. Damit kann der Server zum einen schneller darauf zugreifen (minimal, ich wei&szlig;), zum anderen kann ich per Skript bestimmte Pfade anpassen oder mit <span class="caps">PHP</span> und Variablen arbeiten. Das Stylesheetsystem von <span class="caps">TXP</span> parst weder TXP-Tags, noch ist es per Plugins erweiterbar. 

**Sektionen**

Sektionen kann man am besten mit Website-Bereichen vergleichen. Ein ein einfaches Blog kann bspw. in <span class="caps">TXP</span> aus den Sektionen weblog, archiv und kontakt bestehen. Jede Sektion kann durch ein eigenes Template (eine Seite) individuell angepasst werden. Ebenso kann separat je Sektion festgelegt werden, ob die Inhalte dieser Sektion in den Feeds verf&uuml;gbar sein sollen und durchsuchbar sein sollen. 

Man k&ouml;nnte mit dem Sektionsprinzip theoretisch eine eigene Website pro Sektion erstellen. Ich habe mal f&uuml;r eine Unternehmensseite die internationalisierten Versionen per Sektion realisiert. Re(De)Signation ist so eine Sektion, die unabh&auml;ngig von den anderen Bereichen der [die schreiBBloga.de][1] l&auml;uft und ein kleines bisschen anders aussieht. 

Die Sektionen geh&ouml;ren auch zum Inhaltssystem von Textpattern. Man kann einzelne Artikel jeweils einer Sektion zuordnen. Da jeder Artikel auch noch zwei Kategorien zugewiesen werden kann ergibt sich so die M&ouml;glichkeit zu einem zweidimensionalen Systematisierungsprinzip der Inhalte. Das allerdings w&auml;re ein Web1.0-Prinzip. Heutzutage taggt man. Dazu sp&auml;ter mehr.

**Seiten**

Seiten sind die Templates f&uuml;r die jeweiligen Sektionen. Es gibt ein default-Template mit dem man unter Zuhilfenahme [konditioneller Tags][2] die ganze Website gestalten k&ouml;nnte. Ich bevorzuge hier eine Seite pro Sektion. Das ist &uuml;bersichtlicher.

**Bausteine**

Die Bausteine sind die kleinsten Einheiten des Templatesystems. Unter anderem kann man das Aussehen der Artikel individuell bestimmen, die funktionalen Bereiche wie bspw. Kommentarsystem und Darstellung anpassen und h&auml;ufig verwendete Elemente wiederverwertbar ablegen.

**Tags**

Die Tags sind die Steinchen, die Textpattern am Laufen halten. Man kann [die systeminternen Tags][3] per Plugin um eigene Tags erweitern. 

Damit w&auml;re auch schon alles gesagt zu den M&ouml;glichkeiten Textpatterns in Bezug auf die Templates. Ich finde das System sehr flexibel und bin noch nie in meinen Bed&uuml;rfnissen an seine Grenzen gestossen. Aber genug der Basics. Nachher gehts ans Eingemachte: Das Grundlayout.

**in der die schreiBBloga.de**

Hier in der [die schreiBBloga.de][1] habe ich wie gesagt pro Sektion ein Seitentemplate. Header (inklusive Titel) und Footer (inklusive Seitenspalte) der Seite werden per Baustein in jedem Template erzeugt. Aktuell habe ich _einen_ Baustein f&uuml;r Artikel, in der alten Version war es so, dass ich einen Artikelbaustein pro Sektion hatte (was auch nicht viel mehr war). Die Inhalte der Seitenleiste waren plugingeneriert. Ich habe eine Menge eigener Tags durch Plugins inplementiert, was ich auch in der neuen Version weitgehend beibehalten will.

 [1]: http://die.schreibbloga.de/
 [2]: http://textpattern.net/wiki/index.php?title=Alphabetical_Tag_Listing#I
 [3]: http://textpattern.net/wiki/index.php?title=Alphabetical_Tag_Listing