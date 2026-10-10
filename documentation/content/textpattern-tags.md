# Textpattern tag migration

This migration addresses [#1234](https://github.com/davidsneighbour/samui-samui.de/issues/1234). The original Textpattern database and export are unavailable. The repository history contains migrated prose, but does not establish a complete mapping from original post or download IDs to current files.

The source inventory found 181 opening tags across 118 posts, plus one post containing only the misspelled closing tag `</txp:permink>`. In total, 119 posts were changed. Escaped underscores in tag names are normalised in this inventory.

## Replacement rules

* Permalinks: preserve their wording as plain text when the original target is unverified. Do not infer a destination from a numeric ID or a similar title. Remove broken wrappers and numeric HTML links in the affected malformed link sequences.
* Footnotes: preserve the full text in named Markdown footnotes. Indent continuation paragraphs so multi-paragraph notes remain one footnote. Preserve nested link wording.
* Thumbnails: use the matching full image under `public/wp-content/old-images/`, with a local URL, German alt text, and lazy loading. Do not retain obsolete inline float styles or introduce third-party requests.
* Downloads: preserve the link wording and add a German note that the original download file is unavailable.
* Currency: write the supplied amount and `Baht` as ordinary text. Do not invent a historical or current conversion rate.
* Contact form: replace the obsolete form and server-information fields with a link to the current `/kontakt/` form.
* Maps: add a short German note that the original map is unavailable. Preserve the explicit coordinates of `smallmap`; do not invent geography for `artikelmap`.
* Thai: preserve the body and supplied phonetic spelling. The damaged title attribute does not establish Thai characters, so do not reconstruct them.
* Skype: preserve the account name and remove the unavailable presence widget.
* Motivator: replace the unrecoverable dynamic widget with a short German availability note.

These fallback choices were explicitly authorised by the repository owner. Removing markup does not mean that missing targets or media were recovered. The inventory below retains the original attributes for future research.

## Sorted inventory

| Tag | Openings | Function |
| --- | --- | --- |
| `artikelmap` | 1 | Article map |
| `baht` | 2 | Currency amount |
| `file_download_link` | 4 | Download |
| `footnote` | 2 | Footnote |
| `gho_baht` | 1 | Currency unit |
| `gho_footnote` | 42 | Footnote |
| `gho_motivator` | 1 | Dynamic widget |
| `gho_permalink` | 97 | Post link |
| `gho_skype` | 1 | Skype presence |
| `permlink` | 10 | Post link |
| `smallmap` | 1 | Coordinate map |
| `thai` | 1 | Thai text and phonetics |
| `thumbnail` | 9 | Image |
| `zem_contact` | 1 | Contact form |
| `zem_contact_email` | 1 | Contact form field |
| `zem_contact_serverinfo` | 3 | Contact form field |
| `zem_contact_submit` | 1 | Contact form field |
| `zem_contact_text` | 2 | Contact form field |
| `zem_contact_textarea` | 1 | Contact form field |

## Original occurrences

Paths and line numbers refer to the source before migration. All unresolved permalink IDs, download IDs, and widget attributes remain recorded here, including malformed markup.

### Artikelmap

* `src/content/posts/2006/11/kriegsrechtsaufhebung-ii/index.md:21` — `<txp:artikelmap w="520" h="400"/>`

### Baht

* `src/content/posts/2007/02/phii-pop/index.md:12` — `<txp:baht value="35000"/>`
* `src/content/posts/2007/03/mord-und-totschlag-thaistyle/index.md:14` — `<txp:baht value="200000"/>`

### File download link

* `src/content/posts/2005/12/jauchzet-frohlocket/index.md:41` — `<txp:file\_download\_link id="5">`
* `src/content/posts/2005/12/jauchzet-frohlocket/index.md:47` — `<txp:file\_download\_link id="4">`
* `src/content/posts/2007/07/sportnews/index.md:14` — `<txp:file\_download\_link id="8">`
* `src/content/posts/2009/11/fettnaepfe/index.md:21` — `<txp:file\_download\_link id="23"Im Newsletter selbst</txp:file\_download\_link>`

### Footnote

* `src/content/posts/2006/11/multipler-sklerose-sex/index.md:18` — `<txp:footnote>`
* `src/content/posts/2007/04/44-sekunden/index.md:15` — `<txp:footnote>`

### Gho baht

* `src/content/posts/2005/11/benzinkosten/index.md:13` — `<txp:gho_baht/>`

### Gho footnote

* `src/content/posts/2005/02/the-shutter/index.md:17` — `<txp:gho_footnote>`
* `src/content/posts/2006/06/aufloesungserscheinungen/index.md:15` — `<txp:gho_footnote>`
* `src/content/posts/2006/07/border-run-formerly-know-as-visa-run/index.md:13` — `<txp:gho_footnote>`
* `src/content/posts/2006/07/border-run-formerly-know-as-visa-run/index.md:15` — `<txp:gho_footnote>`
* `src/content/posts/2006/07/border-run-formerly-know-as-visa-run/index.md:19` — `<txp:gho_footnote>`
* `src/content/posts/2006/07/border-run-formerly-know-as-visa-run/index.md:23` — `<txp:gho_footnote>`
* `src/content/posts/2006/07/kein-erdbeben/index.md:13` — `<txp:gho_footnote>`
* `src/content/posts/2006/07/kein-erdbeben/index.md:13` — `<txp:gho_footnote>`
* `src/content/posts/2006/07/raubbau-ii/index.md:14` — `<txp:gho_footnote>`
* `src/content/posts/2006/07/raubbau-ii/index.md:22` — `<txp:gho_footnote>`
* `src/content/posts/2006/07/raubbau-ii/index.md:26` — `<txp:gho_footnote>`
* `src/content/posts/2006/07/stille-post/index.md:76` — `<txp:gho_footnote>`
* `src/content/posts/2006/07/wie-es-vermutlich-weiter-gehen-wird/index.md:22` — `<txp:gho_footnote>`
* `src/content/posts/2006/07/wie-es-vermutlich-weiter-gehen-wird/index.md:22` — `<txp:gho_footnote>`
* `src/content/posts/2006/08/cool-sein/index.md:12` — `<txp:gho_footnote>`
* `src/content/posts/2006/08/csnsts/index.md:12` — `<txp:gho_footnote>`
* `src/content/posts/2006/08/ja-wo-laufen-sie-denn/index.md:19` — `<txp:gho_footnote>`
* `src/content/posts/2006/08/ja-wo-laufen-sie-denn/index.md:27` — `<txp:gho_footnote>`
* `src/content/posts/2006/08/vorfreude/index.md:12` — `<txp:gho_footnote>`
* `src/content/posts/2006/08/vorfreude/index.md:12` — `<txp:gho_footnote>`
* `src/content/posts/2006/08/vorfreude/index.md:12` — `<txp:gho_footnote>`
* `src/content/posts/2006/09/die-tesko-these/index.md:12` — `<txp:gho_footnote>`
* `src/content/posts/2006/09/finland/index.md:12` — `<txp:gho_footnote>`
* `src/content/posts/2006/09/helmpflicht-2/index.md:16` — `<txp:gho_footnote>`
* `src/content/posts/2006/10/was-ich-nicht-vermisse/index.md:16` — `<txp:gho_footnote>`
* `src/content/posts/2006/10/was-ich-nicht-vermisse/index.md:19` — `<txp:gho_footnote>`
* `src/content/posts/2006/12/engel-und-daemonen/index.md:12` — `<txp:gho_footnote>`
* `src/content/posts/2006/12/gomorrha-light/index.md:24` — `<txp:gho_footnote>`
* `src/content/posts/2006/12/internet-fast-richtig-tot-grund-erdbeben/index.md:20` — `<txp:gho_footnote>`
* `src/content/posts/2006/12/man-hats-im-gebein/index.md:16` — `<txp:gho_footnote>`
* `src/content/posts/2007/01/bombendrohungen-in-bangkok/index.md:14` — `<txp:gho_footnote>`
* `src/content/posts/2007/01/dies-und-das-2/index.md:17` — `<txp:gho_footnote>`
* `src/content/posts/2007/01/laos-passgeschichten/index.md:12` — `<txp:gho_footnote>`
* `src/content/posts/2007/01/laos-passgeschichten/index.md:18` — `<txp:gho_footnote>`
* `src/content/posts/2007/01/risse-im-goldenen-land/index.md:21` — `<txp:gho_footnote>`
* `src/content/posts/2007/01/sex-oder-auch-nicht/index.md:20` — `<txp:gho_footnote>`
* `src/content/posts/2007/02/terminplanung-thaistyle/index.md:12` — `<txp:gho_footnote>`
* `src/content/posts/2007/03/itv-wird-abgeschaltet/index.md:12` — `<txp:gho_footnote>`
* `src/content/posts/2007/05/kein-sex/index.md:18` — `<txp:gho_footnote>`
* `src/content/posts/2007/06/geruechtekueche/index.md:20` — `<txp:gho_footnote>`
* `src/content/posts/2007/07/die-internationale-buddhistische-flagge/index.md:45` — `<txp:gho_footnote>`
* `src/content/posts/2007/08/kommunikationsamputiert/index.md:18` — `<txp:gho_footnote>`

### Gho motivator

* `src/content/posts/2005/12/dezember/index.md:16` — `<txp:gho_motivator />`

### Gho permalink

* `src/content/posts/2005/08/bangkok-v30/index.md:46` — `<txp:gho_permalink id="5">`
* `src/content/posts/2005/08/bangkok-v30/index.md:46` — `<txp:gho_permalink id="242">`
* `src/content/posts/2005/08/bangkok-v30/index.md:46` — `<txp:gho_permalink id="243">`
* `src/content/posts/2005/08/bangkok-v30/index.md:46` — `<txp:gho_permalink id="245">`
* `src/content/posts/2005/08/businesstrip/index.md:20` — `<txp:gho_permalink id="298">`
* `src/content/posts/2005/08/hausbeschau-ii/index.md:14` — `<txp:gho_permalink id="310">`
* `src/content/posts/2005/08/hausbeschau-ii/index.md:20` — `<txp:gho_permalink id="12">`
* `src/content/posts/2005/08/insomnia-the-evil-escapes/index.md:14` — `<txp:gho_permalink id="300">`
* `src/content/posts/2005/08/insomnia-the-evil-escapes/index.md:14` — `<txp:gho_permalink id="96">`
* `src/content/posts/2005/08/insomnia-the-evil-escapes/index.md:14` — `<txp:gho_permalink id="225">`
* `src/content/posts/2005/08/mod-leew/index.md:16` — `<txp:gho_permalink id="345">`
* `src/content/posts/2005/09/donnerstagmorgen-auf-samui/index.md:18` — `<txp:gho_permalink id="218">`
* `src/content/posts/2005/09/in-the-laundry-again/index.md:14` — `<txp:gho_permalink id="370">`
* `src/content/posts/2005/09/may-mii-bumbui/index.md:16` — `<txp:gho_permalink id="319">`
* `src/content/posts/2005/09/postwaehlerische-entscheidungsbeeinflussung/index.md:20` — `<txp:gho_permalink id="369">`
* `src/content/posts/2005/09/schiesserei-im-teeladen/index.md:14` — `<txp:gho_permalink id="394">`
* `src/content/posts/2005/09/zwei/index.md:18` — `<txp:gho_permalink id="353">`
* `src/content/posts/2005/10/der-unbekannte-feiertag-ii/index.md:14` — `<txp:gho_permalink id="411">`
* `src/content/posts/2005/10/die-rueckkehr-des-killer-bricks/index.md:16` — `<txp:gho_permalink id="218">`
* `src/content/posts/2005/10/eine-gute-und-eine-schlechte-nachricht/index.md:14` — `<txp:gho_permalink id="237">`
* `src/content/posts/2005/10/eine-gute-und-eine-schlechte-nachricht/index.md:16` — `<txp:gho_permalink id="423">`
* `src/content/posts/2005/10/ok-phansa/index.md:14` — `<txp:gho_permalink id="424">`
* `src/content/posts/2005/10/update-zum-gestrigen-nachtgeschehen/index.md:14` — `<txp:gho_permalink id="428">`
* `src/content/posts/2005/11/der-grosse-regen/index.md:26` — `<txp:gho_permalink id="517">`
* `src/content/posts/2005/11/dinner-for-one/index.md:14` — `<txp:gho_permalink id="453">`
* `src/content/posts/2005/11/tesko-geht-auch-alles-den-bach-runter/index.md:16` — `<txp:gho_permalink id="240">`
* `src/content/posts/2005/11/thai-fuer-sprichwortfetischisten-ii/index.md:14` — `<txp:gho_permalink id="469">`
* `src/content/posts/2005/11/ueberwindung/index.md:18` — `<txp:gho_permalink id="481">`
* `src/content/posts/2005/11/wuff-satanic-incarnation-remix/index.md:14` — `<txp:gho_permalink id="531">`
* `src/content/posts/2005/11/zahltag-klappe-2/index.md:14` — `<txp:gho_permalink id="445">`
* `src/content/posts/2005/11/zahltag-klappe-2-remix/index.md:14` — `<txp:gho_permalink id="451">`
* `src/content/posts/2005/12/der-grosse-regen-ii/index.md:14` — `<txp:gho_permalink id="540">`
* `src/content/posts/2005/12/dezember/index.md:18` — `<txp:gho_permalink id="454">`
* `src/content/posts/2006/01/regen-3/index.md:25` — `<txp:gho_permalink id="609">`
* `src/content/posts/2006/02/die-sache-mit-dem-bus/index.md:16` — `<txp:gho_permalink id="645">`
* `src/content/posts/2006/02/neuesvomwuschel/index.md:21` — `<txp:gho_permalink id="653">`
* `src/content/posts/2006/03/computerkauf-thaistyle-teil-i/index.md:14` — `<txp:gho_permalink id="658">`
* `src/content/posts/2006/03/computerkauf-thaistyle-teil-i/index.md:20` — `<txp:gho_permalink id="237">`
* `src/content/posts/2006/03/hier-der-titel/index.md:14` — `<txp:gho_permalink id="218">`
* `src/content/posts/2006/03/hier-der-titel/index.md:24` — `<txp:gho_permalink id="387">`
* `src/content/posts/2006/04/googlemap-wird-immer-schlechter/index.md:14` — `<txp:gho_permalink id="697">`
* `src/content/posts/2006/06/aufloesungserscheinungen/index.md:13` — `<txp:gho_permalink id="769">`
* `src/content/posts/2006/06/aufloesungserscheinungen/index.md:13` — `<txp:gho_permalink id="746">`
* `src/content/posts/2006/06/thaksin-spricht/index.md:17` — `<txp:gho_permalink id="668">`
* `src/content/posts/2006/07/raubbau-ii/index.md:14` — `<txp:gho_permalink id="797">`
* `src/content/posts/2006/07/raubbau-ii/index.md:26` — `<txp:gho_permalink id="691">`
* `src/content/posts/2006/07/referenzmarketing/index.md:14` — `<txp:gho_permalink id="817">`
* `src/content/posts/2006/07/rufnummernverteilung-in-thailand/index.md:5` — `<txp:gho_permalink id="743">`
* `src/content/posts/2006/07/stille-post/index.md:74` — `<txp:gho_permalink id="779">`
* `src/content/posts/2006/07/und-wieder-samui/index.md:15` — `<txp:gho_permalink id="419">`
* `src/content/posts/2006/07/wenig-lustig/index.md:16` — `<txp:gho_permalink>`
* `src/content/posts/2006/07/wie-es-vermutlich-weiter-gehen-wird/index.md:18` — `<txp:gho_permalink id="546">`
* `src/content/posts/2006/08/aus-9-mach-10/index.md:13` — `<txp:gho_permalink id="743">`
* `src/content/posts/2006/08/ausbrecher/index.md:13` — `<txp:gho_permalink id="860">`
* `src/content/posts/2006/08/ausbrecher/index.md:13` — `<txp:gho_permalink id="861">`
* `src/content/posts/2006/08/bewegt/index.md:26` — `<txp:gho_permalink id="838">`
* `src/content/posts/2006/08/diagnostiziert/index.md:13` — `<txp:gho_permalink id="850">`
* `src/content/posts/2006/08/ja-wo-laufen-sie-denn/index.md:37` — `<txp:gho_permalink id="1">`
* `src/content/posts/2006/08/ja-wo-laufen-sie-denn/index.md:37` — `<txp:gho_permalink id="143">`
* `src/content/posts/2006/08/ja-wo-laufen-sie-denn/index.md:37` — `<txp:gho_permalink id="296">`
* `src/content/posts/2006/08/ja-wo-laufen-sie-denn/index.md:37` — `<txp:gho_permalink id="353">`
* `src/content/posts/2006/08/ja-wo-laufen-sie-denn/index.md:37` — `<txp:gho_permalink id="780">`
* `src/content/posts/2006/08/mopednews/index.md:13` — `<txp:gho_permalink id="856">`
* `src/content/posts/2006/08/service-sms/index.md:17` — `<txp:gho_permalink id="824">`
* `src/content/posts/2006/08/unschuldig-unschuldig/index.md:13` — `<txp:gho_permalink id="841">`
* `src/content/posts/2006/09/123/index.md:13` — `<txp:gho_permalink id="877">`
* `src/content/posts/2006/09/123/index.md:13` — `<txp:gho_permalink id="454">`
* `src/content/posts/2006/09/123/index.md:15` — `<txp:gho_permalink id="877">`
* `src/content/posts/2006/09/crackdown-on-the-eight-story/index.md:17` — `<txp:gho_permalink id="743">`
* `src/content/posts/2006/09/crackdown-on-the-eight-story/index.md:18` — `<txp:gho_permalink id="823">`
* `src/content/posts/2006/09/crackdown-on-the-eight-story/index.md:19` — `<txp:gho_permalink id="844">`
* `src/content/posts/2006/09/crackdown-on-the-eight-story/index.md:26` — `<txp:gho_permalink id="844">`
* `src/content/posts/2006/09/der-beschuetzer-film/index.md:13` — `<txp:gho_permalink id="882">`
* `src/content/posts/2006/09/der-tag-der-acht/index.md:17` — `<txp:gho_permalink id="743">`
* `src/content/posts/2006/09/der-tag-der-acht/index.md:18` — `<txp:gho_permalink id="823">`
* `src/content/posts/2006/09/der-tag-der-acht/index.md:19` — `<txp:gho_permalink id="844">`
* `src/content/posts/2006/09/scherben/index.md:13` — `<txp:gho_permalink id="872">`
* `src/content/posts/2006/09/updates-2/index.md:25` — `<txp:gho_permalink id="802">`
* `src/content/posts/2006/09/updates-8/index.md:15` — `<txp:gho_permalink id="938">`
* `src/content/posts/2006/09/updates-8/index.md:24` — `<txp:gho_permalink id="938">`
* `src/content/posts/2006/10/arc-cdrm-cdr-cns/index.md:17` — `<txp:gho_permalink id="922">`
* `src/content/posts/2006/10/arc-cdrm-cdr-cns/index.md:18` — `<txp:gho_permalink id="950">`
* `src/content/posts/2006/10/blogfarm-n0ll7ieben-bekraeftigung/index.md:14` — `<txp:gho_permalink id="968">`
* `src/content/posts/2006/10/chulalongkorn-day-2/index.md:13` — `<txp:gho_permalink id="439">`
* `src/content/posts/2006/10/gebt-mir-feedback/index.md:17` — `<txp:gho_permalink id="985">`
* `src/content/posts/2006/10/ich-mag-meine-website-nicht-so-ganz/index.md:17` — `<txp:gho_permalink id="602">`
* `src/content/posts/2006/10/massenflucht/index.md:13` — `<txp:gho_permalink id="962">`
* `src/content/posts/2006/10/massenflucht/index.md:19` — `<txp:gho_permalink id="769">`
* `src/content/posts/2006/10/massenflucht/index.md:19` — `<txp:gho_permalink id="746">`
* `src/content/posts/2006/10/massenflucht/index.md:19` — `<txp:gho_permalink id="777">`
* `src/content/posts/2006/10/neue-visabestimmungen-seit-1-oktober/index.md:13` — `<txp:gho_permalink id="939">`
* `src/content/posts/2006/10/thai-rak-thai-verliert-mitglieder/index.md:16` — `<txp:gho_permalink id="802">`
* `src/content/posts/2006/10/thai-rak-thai-verliert-mitglieder/index.md:16` — `<txp:gho_permalink id="950">`
* `src/content/posts/2006/11/ihr-privates-kleines-stueck-trauminsel/index.md:26` — `<txp:gho_permalink id="691">`
* `src/content/posts/2006/11/keanu-reeves-thailands-ist-tot/index.md:22` — `<txp:gho_permalink id="135">`
* `src/content/posts/2006/11/kriegsrechtsaufhebung/index.md:16` — `<txp:gho_permalink id="1019">`
* `src/content/posts/2006/11/thaksin-auf-reisen-wieder/index.md:14` — `<txp:gho_permalink id="1007">`

### Gho skype

* `src/content/posts/2005/12/hoeren/index.md:17` — `<txp:gho_skype name="kollitsch" lang="de" />`

### Permlink

* `src/content/posts/2005/07/visacard-fuer-3-euro/index.md:14` — `<txp:permlink id="242">`
* `src/content/posts/2005/07/visacard-fuer-3-euro/index.md:14` — `<txp:permlink id="243">`
* `src/content/posts/2005/07/visacard-fuer-3-euro/index.md:14` — `<txp:permlink id="272">`
* `src/content/posts/2007/06/neue-alte-hosen/index.md:15` — `<txp:permlink id="1282>`
* `src/content/posts/2007/11/katastrophengebiet/index.md:23` — `<txp:permlink id="544">`
* `src/content/posts/2007/11/katastrophengebiet/index.md:23` — `<txp:permlink id="540">`
* `src/content/posts/2009/02/makha-bucha-day-4/index.md:13` — `<txp:permlink id="641">`
* `src/content/posts/2009/02/makha-bucha-day-4/index.md:13` — `<txp:permlink id="84">`
* `src/content/posts/2009/05/babypanda-in-chiang-mai/index.md:16` — `<txp:permlink id="1196">`
* `src/content/posts/2009/11/fettnaepfe/index.md:13` — `<txp:permlink id="1125">`

### Smallmap

* `src/content/posts/2007/01/san-luang-dia/index.md:13` — `<txp:smallmap lat="12.675684" lng="101.070533" width="200" height="200" zoom="18" />`

### Thai

* `src/content/posts/2006/12/engel-und-daemonen/index.md:12` — `<txp:thai title="??" phonetic="dtohn" >`

### Thumbnail

* `src/content/posts/2007/08/nix-buddha/index.md:12` — `<txp:thumbnail id="237" style="float:left;margin-right:10px;" />`
* `src/content/posts/2009/04/precursor/index.md:13` — `<txp:thumbnail class="flickr" id="263" wraptag="div" />`
* `src/content/posts/2009/06/braenne-braenne/index.md:14` — `<txp:thumbnail id="269" link="y" />`
* `src/content/posts/2009/06/jazz-im-karma-ressort/index.md:13` — `<txp:thumbnail class="flickr" id="266" wraptag="div" link="1" />`
* `src/content/posts/2009/06/thailand-goes-panda/index.md:21` — `<txp:thumbnail id="268" link="y" />`
* `src/content/posts/2009/06/thailand-goes-panda/index.md:29` — `<txp:thumbnail id="267" link="y" />`
* `src/content/posts/2009/07/und-das-musst-du-machen-wenn-du-schlaefst/index.md:16` — `<txp:thumbnail id="270" link="y" />`
* `src/content/posts/2009/12/seriously-frohes-fest/index.md:13` — `<txp:thumbnail class="flickr" id="273" wraptag="div" />`
* `src/content/posts/2010/06/auftakt-der-fussballweltmeisterschaft-in-bangkok/index.md:14` — `<txp:thumbnail id="278" />`

### Zem contact

* `src/content/posts/2005/12/kontaktformular/index.md:13` — `<txp:zem_contact mailto="<schreibblogade@gmail.com>`

### Zem contact email

* `src/content/posts/2005/12/kontaktformular/index.md:15` — `<txp:zem\_contact\_email label="Emailadresse" break=" " required="1" />`

### Zem contact serverinfo

* `src/content/posts/2005/12/kontaktformular/index.md:25` — `<txp:zem\_contact\_serverinfo name="REMOTE_ADDR" label="IP" />`
* `src/content/posts/2005/12/kontaktformular/index.md:27` — `<txp:zem\_contact\_serverinfo name="REQUEST_URI" label="Request-Uri" />`
* `src/content/posts/2005/12/kontaktformular/index.md:29` — `<txp:zem\_contact\_serverinfo name="USER_AGENT" label="User-Agent" />`

### Zem contact submit

* `src/content/posts/2005/12/kontaktformular/index.md:23` — `<txp:zem\_contact\_submit label="Nachricht senden" />`

### Zem contact text

* `src/content/posts/2005/12/kontaktformular/index.md:17` — `<txp:zem\_contact\_text label="Name" break=" " required="1" />`
* `src/content/posts/2005/12/kontaktformular/index.md:19` — `<txp:zem\_contact\_text label="Thema" break=" " />`

### Zem contact textarea

* `src/content/posts/2005/12/kontaktformular/index.md:21` — `<txp:zem\_contact\_textarea label="Nachricht" />`

### Misspelled closing tag

* `src/content/posts/2010/12/das-wetter-3/index.md:13` — `<a href="1931">mehr zum Eimerma?</txp:permink>`; preserve wording and remove the broken link wrapper.

## Validation and scope exception

The owner explicitly authorised preserving existing prose despite the required language checks failing. The language check reported 370 grammar findings, plus spelling and orthography findings, across the 119 migrated posts. These are existing editorial debt, not evidence that the removed tags were restored. No blanket language suppressions or spelling-dictionary changes were added.

The scoped link check reported 77 errors among 144 requests, including disappeared historical sources and existing missing local resources. Newly restored images were checked directly against local files. Existing source links remain unchanged; their failures are retained under the issue rather than silently removed.

Obsolete `publisher.textpattern` markers were cleared with the publisher CLI after the source scan proved that no tags remained. Some markers were already stale on posts without tags; clearing them does not claim that those posts received a full editorial review.

The full `npm run check` quality gate and production build passed. All 384 unit tests passed, including archive tag scanning, local-image checks, and the multi-paragraph footnote regression. Browser checks against the built output verified the long dialogue footnote, nested-note content, a decoded restored image, and the replacement contact link. Citation-date validation reported no findings in the 119 migrated posts. The publisher tag filter matched zero posts, and the content scan found no opening or closing Textpattern tags.

The normal pre-commit hook also runs the failing archive language and link checks. Those checks were run separately and their failures recorded; this migration uses the owner-authorised language exception and preserves historical source links. The commit skips that hook invocation without changing the hook configuration. Two additional posts had only stale Textpattern markers removed; no other editorial review is claimed for them.

## Literal editorial cues

On 10 October 2026, the owner confirmed that the theatrical angle-bracket cues in `2006/02/derchef`, `2007/04/kommunikation-2`, and `2005/07/blindes-huehnchen-findet-korn` are literal text rather than HTML components. Their opening and closing cues now use Markdown inline code, preserving the wording and the original paragraphs. Browser checks verified all seven cues and the absence of unknown HTML elements. The owner reviewed the result and approved removing the corresponding audit section.

The owner explicitly authorised preserving the historical prose and a scoped check exception for this formatting-only change. The content-language checks reported 29 spelling findings and 30 grammar findings; Vale reported no findings. The grammar findings include a false positive suggesting quotation marks instead of the newly visible literal angle brackets. The scoped link check also reported two existing `http://die.schreibbloga.de/` references as unsupported; those historical destinations remain unchanged. Citation-date validation reported no findings. The production build and the standard `npm run check` gate passed, including all 409 tests. This exception applies only to this three-post cue conversion, not future editorial changes or the owner's other uncommitted posts. The commit skips its pre-commit hook invocation; the hook configuration remains unchanged. Cleanup is tracked in [the legacy-markup issue](https://github.com/davidsneighbour/samui-samui.de/issues/1804).

## Empty container cleanup

On 10 October 2026, the owner removed 25 empty legacy containers. A scan of all Markdown and MDX content verified that no empty legacy `div` containers remain. The resolved inventory section was removed. Cleanup is tracked by [the remaining-markup issue](https://github.com/davidsneighbour/samui-samui.de/issues/1804).

The owner explicitly authorised preserving historical prose with a scoped check exception for these 25 container removals. Content-language checks reported 31 spelling findings and 21 grammar findings; Vale reported no findings. The production build and `npm run check` passed, including all 409 tests. This exception applies only to the empty-container cleanup, not future edits. The commit skips its pre-commit hook invocation without changing the hook configuration.

The follow-up temple-post cleanup converts the nine stations into a Markdown list and removes the obsolete map-return links and their HTML wrappers. The concluding reference to the ninth station is plain text. The historical prose and excerpt remain unchanged under the owner-approved prose-preservation exception for this cleanup; a custom map is deferred until the owner reviews the year. The resolved map-navigation entry was removed from the audit.
