---
title: 'Templatespielereien II: Genereller Templateaufbau'
date: 2006-10-25T06:42:23+00:00
url: /2006/10/templatespielereien-ii-genereller-templateaufbau/




---
Ich benutze zur Realisierung meiner Layouts seit einiger Zeit die [Layout-Gala][1] von [<span class="given-name">Alessandro</span> <span class="family-name">Fulciniti</span>][2]{.vcard.n.url} (wünscht ihr euch nicht auch manchmal, ihr wäret Italiener?). Mit einem einzigen XHTML-Gerüst kann man laut Layout-Gala 40 verschiedene Layouts realisieren. Ich bin mir ziemlich sicher, dass es damit weitaus mehr sein könnten, die vorgestellten reichen aber vollkommen aus.

**Genereller Seitenaufbau**

Das nachfolgende Schaubildchen zeigt den generellen Aufbau der Seite.

<img src="/images/redesign/layout.gif"  style="width:285px;margin:0 auto;height:341px;" />

Da wird sich im Vergleich zur Ur-Version nicht viel ändern. Neu ist der Inhaltsbereich am Fuß der Seite. Durch die Einbindung der Bilder von flickr.com bin ich gezwungen, eine fixe Breite für die Inhaltsspalte zu verwenden. Womit die Sache auch schon auf [Nummer 37 aus der Layoutgala][3] festgelegt ist. Das ist wie bei der Auswahl eines Nummern-Girls.

Damit sieht das Template folgendermaßen aus:

<pre>&#60;div id=&#34;container&#34;&#62;
  &#60;div id=&#34;header&#34;&#62;Titel&#60;/div&#62;
  &#60;div id=&#34;wrapper&#34;&#62;
    &#60;div id=&#34;content&#34;&#62;Hauptinhalte&#60;/div&#62;
  &#60;/div&#62;
  &#60;div id=&#34;navigation&#34;&#62;Seitenleiste&#60;/div&#62;
  &#60;div id=&#34;extra&#34;&#62;Fuss-Inhalte&#60;/div&#62;
  &#60;div id=&#34;footer&#34;&#62;Seitenfuss&#60;/div&#62;
&#60;/div&#62;</pre>

Nebenbemerkung: Es gab ja mal Zeiten, da man für Bildschirmauflösungen um die 800&#215;600 Pixel gepixelt hat. Die Zeit dürfte vorbei sein, wie man an folgendem Diagramm leicht erkennen kann, weshalb ich mit 900 Pixeln Breite arbeite. Damit kann man einerseits größere Schriften benutzen ohne gedrückt auszusehen und andererseits bekommt die Seitenspalte mehr Platz eingeräumt.

<img src="/images/redesign/resolutions.jpg" style="width:500px;height:227px;" />

 [1]: http://blog.html.it/layoutgala/index.html
 [2]: http://blog.html.it/
 [3]: http://blog.html.it/layoutgala/LayoutGala37.html
