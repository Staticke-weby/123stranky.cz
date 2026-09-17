# AGENTS.md — 123stranky.cz

Poznámky a konvence pro další práci na projektu. Web je statický, stavěný na 11ty.
Komunikace i obsah webu je **česky**.

## Stack a příkazy

- 11ty v3 (`@11ty/eleventy`) — **jediná** závislost. Nunjucks šablony.
- `npm run dev` — vývojový server na `http://localhost:8080`
- `npm run build` — vygeneruje `_site/` (nasazuje se na GitHub Pages, viz níže)
- `npm run clean` — smaže `_site/`

Detached server (přežije mezi příkazy):
```powershell
Start-Process node -ArgumentList "node_modules/@11ty/eleventy/cmd.cjs","--serve","--port=8080" -WorkingDirectory "<projekt>" -PassThru
```
Pozor: `Start-Job` mezi jednotlivými voláními nástroje **nepřežije**.

## Struktura

```
src/
  src.json               # directory data: layout: base.njk pro všechny stránky
  _data/
    site.json            # název, URL, kontakty, pobočka, provozovatel, navigace
    packages.json        # Start/Business/Premium (hours, price, desc, cta, featured, badge)
    includes.json        # sdílený seznam "V každém balíčku"
    references.json      # reference (name, desc, url, image)
    demos.json           # ukázky: skupiny (name, desc) + items (title, url, image)
    services.json        # služby (icon, title, text)
    redirects.json       # přesměrování ze starých URL (from, to, note)
    lokalita.json        # 12 měst u Slaného pro /webove-stranky/<slug>/
    obor.json            # 16 oborů pro celou ČR pro /web-pro/<slug>/
  _includes/
    base.njk  head.njk  header.njk  footer.njk  icon.njk
    link-cards.njk       # mřížka odkazových karet (lokality/obory) – parametry přes {% set %}
    cenik-strip.njk  refs-strip.njk  faq-strip.njk   # sdílené sekce pro detailní stránky
  css/style.css
  js/main.js             # mobilní menu + stín hlavičky
  assets/                # favicon.svg, og-image.png, apple-touch-icon.png, reference/*.jpg, ukazky/*.jpg
  index.njk  proc.njk  cenik.njk  kontakt.njk  ukazky.njk  404.njk
  mapa-webu.njk                   # lidská mapa webu (všechny stránky na jednom místě)
  zpracovani-osobnich-udaju.njk   # právní text (přenesený ze starého webu)
  webove-stranky/index.njk        # rozcestník měst
  webove-stranky/lokalita.njk     # paginovaná šablona měst (permalink /webove-stranky/<slug>/)
  web-pro/index.njk               # rozcestník oborů
  web-pro/obor.njk                # paginovaná šablona oborů (permalink /web-pro/<slug>/)
  redirecty.njk  redirecty-bez-lomitka.njk   # generují přesměrovací stránky
  sitemap.njk  robots.njk
  CNAME                  # www.123stranky.cz (kopíruje se do kořene _site)
  .nojekyll              # vypne Jekyll na GitHub Pages (kopíruje se do kořene _site)
.github/workflows/pages.yml   # build + deploy na GitHub Pages
eleventy.config.js            # filtry, kolekce, transform relativeLinks (root-relative → relativní odkazy)
```

## Design / brand

- **Logo**: šedé „123" (`--brand-gray: #58595b`) + teal zkosený pás se „stránky." (v patičce se „123" zesvětlí na `#a8abb0`).
  - `.brand-badge` — `skewX(-14deg)` na `::before`, `margin-left` tak, aby pás sedl na „3" a **nepřekrýval ji**. Mezera mezi „123" a pásem být nemá (`.brand { gap: 0 }`).
  - Nikdy nepoužívej `display: grid` na `.brand-mark`/inline obsah s více uzly — rozpadne se na řádky. Používej `inline-flex`.
- **Barvy** (`:root` v `style.css`): `--brand: #0c7466` (AA pro text/tlačítka), `--brand-logo: #1a9e8f` (přesný teal loga, jen dekorativní), `--accent-ink: #0b7268`, `--dark: #0a1a18`, `--ink: #17191d`.
- **Kontrast**: web musí procházet **WCAG AA**. `--accent` (#00b8a0) neprochází na bílém — na světlé pozadí používej `--accent-ink`. Při změně barev vždy přepočítej kontrast.
  - Ověřené hodnoty: `--brand #0c7466` (5,67:1 na bílém), `--accent-ink #0b7268`, hvězdičky `#c47c00` (3,37:1 — min. 3:1 pro grafiku), `.cta-band` gradient `#0c7466 → #08544a` s textem `rgba(255,255,255,.9)` (4,92:1). Bílý radiální přeliv v CTA pásu kontrast snižoval, proto byl odstraněn.
- **Fonty**: Inter + Plus Jakarta Sans z Google Fonts (v `head.njk`).
- Průřezové prvky: `.eyebrow`, `.btn` (`btn-primary/-outline/-light/-ghost-light`), `.card`, `.section`/`section--soft`, `.step`, `.faq-item`, `.includes`, `.legal`/`.legal-toc` (právní text).

## Ceník a obchodní model

- **Jeden pokročilý web, balíčky se liší JEN časovým fondem.** Nikdy neuváděj počet stránek/podstránek.
- Balíčky: **Start 9 990 Kč (3 h)**, **Business 12 490 Kč (6 h, Nejoblíbenější)**, **Premium 15 990 Kč (10 h)**.
- Sazba **990 Kč/hod** — stejná v balíčku i nad rámec. Logika ceny: základ + hodiny.
- Platba **50 % při objednání, 50 % po dodání**, ceny **bez DPH**.
- Doplňky (jen tyto tři): prodloužení .CZ domény na 3 roky **1 490 Kč**, zprovoznění e-mailů **990 Kč**, správa webů a konzultace **990 Kč/hod**.
- Sdílené funkce balíčků jsou v `includes.json` (pole objektů `{ "text": "...", "highlight": true }`) a zobrazují se v sekci „V každém balíčku" na `/cenik/`. `highlight` zvýrazní bod tučně (např. „.CZ doména a hosting na 1. rok").
- **Kontaktní formulář se nedělá** (jen když je nutný) — používají se kontaktní tlačítka a výzvy k akci. Logo dodává klient, školení správy obsahu se nenabízí.

## Měření návštěvnosti

- **Umami** (self-hosted `navstevnost.pikapod.net`), konfigurace v `_data/site.json` pod `analytics` (`script` + `websiteId`). `head.njk` z toho vygeneruje `<script defer src="…" data-website-id="…">` na všech stránkách s layoutem (38 stránek) — **nepřesměrovací** stránky a `404` mají `layout: false`/redirect šablonu, takže skript nemají.
- Umami je **bez cookies** a nesbírá osobní údaje → není potřeba cookie lišta ani souhlas.
- **Kontaktní odkazy nesou události** (bez dalšího JS, Umami je sbírá z atributů): `data-umami-event="kontakt-telefon|kontakt-whatsapp|kontakt-email"` + `data-umami-event-misto="mobilni-lista|paticka|cta|kontakt|kontakt-osoby|kontakt-formular|sekce|mapa-webu"`. **Nový kontaktní odkaz musí atributy dostat taky**, jinak se v datech neobjeví (kontrola: v `_site/**/*.html` nesmí být `<a href="tel:|mailto:|wa.me/">` bez `data-umami-event`).
- Skript běží na všech doménách, takže se v datech objeví i `staticke-weby.github.io` a `localhost` (v Umami se dají odfiltrovat podle hostname). Když se má měřit jen na produkci, přidej do `head.njk` atribut `data-domains="www.123stranky.cz"`.
- **Návštěvnost se neměří na přesměrovacích stránkách** (staré URL) — jsou záměrně mimo layout.

## Kontakty a provozovatel (reálné)

- E-mail: `123stranky.cz@gmail.com`, telefon: `+420 731 819 760`
- WhatsApp: stejné číslo (`+420 731 819 760`), odkaz `https://wa.me/420731819760`
- **Předvyplněné odkazy** (v `site.json`): `emailHref` (mailto s předmětem i tělem poptávky) a `whatsappHref` (wa.me s textem). V šablonách se vždy používají tyto, nikdy ručně `mailto:{{ site.email }}`.
- **Mobilní lišta** `.mobile-bar` (v `base.njk`, zobrazená ≤620 px): přilepená dole s ikonami Zavolat / WhatsApp / E-mail. `body { padding-bottom: 72px }` v tom breakpointu, aby nepřekrývala patičku.
- Osoby: Ing. Kamila Baloun (Key Account Manager), Ing. Petr Baloun (Web Developer)
- Pobočka: Tuřany 77, 273 79 Tuřany u Slaného
- Provozovatel: HELL SOLUTIONS s.r.o., Budějovická 601, 140 00 Praha 4, IČO 28697278, DIČ CZ28697278

## Reference

- `src/_data/references.json` + obrázky v `src/assets/reference/*.jpg`.
- Náhledy se generují jako **screenshoty** přes headless Chrome (viz níže), ukládají se jako JPEG (800×500, kvalita 78).
- Odkazy na reference mají `target="_blank" rel="noopener"`.

## Ukázky

- Stránka `/ukazky/` (`src/ukazky.njk`) vypisuje demo stránky **podle oboru** (Restaurace a jídlo, Zdraví a krása, Služby a řemesla, Oslavy a akce) — zdroj je nabídka `landingpage.cz`, obory mají po dvou designech (`-ds`/`-ms` = jiná firma i copy, ne dvě varianty téhož).
- Data v `src/_data/demos.json`: pole témat (`name`, `desc`, `items[]` s `title`/`url`/`image`).
- Náhledy v `src/assets/ukazky/*.jpg` (800×500, `lp-<slug>.jpg`) — screenshoty přes headless Chrome.
- **Doména (landingpage.cz) se nepropaguje** — žádné odkazy na její homepage, žádné názvy domén v textu. Odkazuje se jen na konkrétní ukázkové stránky (`target="_blank" rel="noopener"`). Odkazy na `staticweb.cz` ani na `/crm-*`, `/srovnani-*` (404) sem nepatří.
- Karty používají `.showcase` / `.showcase-item` (stejné jako reference), na mobilu 1 sloupec.
- **Aktualizace nabídky (recept)**: zdrojem pravdy je `https://www.landingpage.cz/sitemap.xml`, ne homepage — ta v „Související" vypisuje i stránky, které v nabídce nejsou. U každé URL ověřit 200; mrtvé slugy se objevují postupně (našel jsem `/crm-pro-servisni-firmy`, `/staticke-webove-stranky` a `/srovnani-crm-2026` — všechny 404, ale v datech ještě byly). `-ds`/`-ms` = **dva designy téhož oboru** (jiná firma i copy; `-ds` delší, 10–15 sekcí, `-ms` kratší, 7–13), ne dvě varianty jednoho webu.
- **Náhledy** se generují z živých stránek na 1280×800 (poměr 16:10, stejný jako `aspect-ratio` karty) a zmenšují na 800×500 JPEG q78; jméno `lp-<slug>.jpg` podle URL. Při odebrání ukázky náhled z `src/assets/ukazky/` smazat a dát `npm run clean` — build `_site` nečistí (gotcha 13), takže by se staré JPEG nasazovaly dál.
- Po každé aktualizaci zkontrolovat: karet = `items` v JSON, každý `image` existuje v `_site`, v `_site/**/*.html` není `staticweb.cz` ani odkaz na homepage, a **externí** odkazy vrací 200 (interní audit je nekontroluje).
- Skupina s jedinou kartou nechává v třísloupcové mřížce prázdné místo vpravo — buď ji spojit s jinou, nebo to nechat (konzistentní).

## Gotchas (na co jsem narazil)

1. **Nunjucks filtry**: argumenty jsou v závorkách, ne Liquid dvojtečkou. `{{ x | date: "%Y" }}` NEFUNGUJE.
   Vlastní filtry: `absoluteUrl`, `year`, `isoDate`, `initials`.
2. **`layout: false`** je nutné v `sitemap.njk` a `robots.njk`, jinak se obalí do `base.njk`.
3. **`src/src.json`** nastavuje layout všem stránkám; stránky, které ho nechtějí, ho přepíšou.
4. **CSS specificita**: nepiš široké selektory jako `.site-nav a` — přebijí `.btn` (barvu i padding). Používej `.site-nav ul a`.
5. **Seznam „V každém balíčku“** (`.includes-list`): sloupce přes `repeat(auto-fit, minmax(340px, 1fr))` + `align-items: start` a text položky v `<span>` s `min-width: 0` / `overflow-wrap: anywhere`. Když se bod zalomí do 2 řádků, vznikne v řádku mezera — proto radši méně sloupců a kratší texty.
6. **Ikona hvězdičky** se vykresluje plná (`icon.njk` má pro `name == 'star'` `fill="currentColor"`); ostatní ikony jsou jen tahy.
7. **Sticky hlavička**: `html { scroll-padding-top: 88px }`, aby kotvy/skip-link nepodlézaly.
8. **Breakpointy**: 1024 (mřížky na 2 sloupce), 980 (skrytí navigace do hamburgeru), 768 (osoby + tabulka doplňků do 1 sloupce/karet), 620 (1 sloupec, mobilní lišta).
9. **Hero/CTA jsou světlé** (ne tmavé). Tmavý je jen `.cta-band` v brand tealu a `.site-footer`.
10. **Mobil (≤768 px)**: `.people` se skládá do 1 sloupce a `.price-table` se mění na karty (skrytý `thead`, každý `<tr>` = blok). Bez toho tabulka přetéká do strany a osoby se mačkají ve 2 sloupcích.
11. **Headless Chrome ignoruje malé `--window-size`** (pod ~500 px použije výchozí okno). Pro test skutečného mobilu použij pomocnou stránku s `<iframe style="width:390px">` na `_site/_mobiletest.html` (po testu smazat).
12. **Ikonové fonty**: v `icon.njk` mají plnou výplň jen `star` a `whatsapp` (`{% set solid = ... %}`); ostatní jsou tahy. Novou výplňovou ikonu přidej do `solid`.
13. **`npm run build` nečistí `_site`** — po přejmenování nebo smazání šablony tam zůstane starý výstup (a vypadá to, že nový slug nefunguje). Po rename vždy `npm run clean` + build.
14. **Šablony přesměrování nesmí začínat podtržítkem** — 11ty soubory/dirs s `_` ignoruje, takže `redirecty.njk` (ne `_redirecty.njk`).
15. **Redirect na cestu, která na webu už existuje**, shodí build (`DuplicatePermalinkOutputError`). Proto `/kontakt` (bez lomítka) redirect nemá — řeší ho GitHub Pages přes directory index.
16. **Diakritika v PowerShellu**: české znaky v příkazech se v shellu rozbijí, takže `-match`/`Contains` pak vrátí 0 shod (vypadá to jako chyba v datech). V příkazech používej ASCII úryvky (`zprac`, `vod`, `uk`) a soubory porovnávej přes `[System.IO.File]::ReadAllText($p,[Text.Encoding]::UTF8)`; `Get-Content` v konzoli zobrazuje mojibake i u správných UTF-8 souborů.
17. **Diakritika ve jméně souboru** funguje i na GitHub Pages: request `/uk%C3%A1zky` se dekóduje na `ukázky` a najde `ukázky.html` / `ukázky/index.html` (proto generujeme obě varianty redirectu).
18. **Paginované stránky nejsou v kolekcích**, dokud nemá paginace `addAllPagesToCollections: true`. Bez toho `collections.sitemapPages` vidí od každé šablony **jen první** vygenerovanou stránku (sitemap pak měla 10 URL místo 36). Platí pro `lokalita.njk` i `obor.njk`.
19. **`{% set %}` platí pro celý zbytek šablony** — proměnné nastavené pro jeden `{% include %}` musí další include vždy přenastavit (i na `false`), jinak zdědí staré hodnoty. Týká se hlavně parametrů `link-*.njk`.
20. **Interní odkazy v šablonách jsou root-relative** (`/kontakt/`) a teprve transform `relativeLinks` z nich při buildu udělá relativní (`../kontakt/`). Nikdy nepočítej hloubku ručně a nepiš `../` přímo do šablony — rozbilo by to build na kořeni domény. Nový atribut s cestou musíš přidat do regexu v transformu.
21. **Ukládání JPEG přes .NET**: `$bmp.Save($path, $codec, (New-Object System.Drawing.Imaging.EncoderParameters(0)))` spadne na `Parameter is not valid` — bez parametrů použij `Save($path, [System.Drawing.Imaging.ImageFormat]::Jpeg)`, s kvalitou až `EncoderParameters(1)` (`EncoderParameter(Quality, 78)`). Stejně tak `New-Object System.Drawing.Rectangle(0,0,$w,$h)` s výrazem uvnitř rozbije parsování — hodnoty předpočítej do proměnných (viz i OG obrázky).

## Kontrola kvality (audit)

Opakovaně použitelný postup (skripty se píšou dočasně a mažou):

1. **Kontrast** — Node skript: spočítat WCAG poměr pro všechny dvojice text/pozadí včetně alfakanálu (`over(fg, alpha, bg)`; práh 4,5:1 pro text, 3:1 pro velký text/grafiku).
2. **Struktura/SEO/přístupnost** — Node skript nad `_site/**/*.html`: 1× `h1`, žádné skoky v nadpisech, žádná duplicitní `id`, každý odkaz/tlačítko má název, `img` má `alt`, `nav` má `aria-label`, `target="_blank"` má `rel="noopener"`, délka meta description.
3. **Tenký obsah** — ve stejném skriptu spočítat slova v `<main>` (bez `svg`/`script`, tagy pryč) a hlídat **≥ 500 slov** u detailních stránek lokalit/oborů; zároveň zkontrolovat, že `title` a canonical sedí na URL.
4. **Odkazy a JSON-LD** — projít všechny `href="/..."` a ověřit, že cíl existuje v `_site` (pozor: indexovat i ne-HTML soubory, jinak `css`/`assets` hlásí falešné chyby), a `JSON.parse` na každý `<script type="application/ld+json">` (externí odkazy tenhle audit nekontroluje — ty se ověřují zvlášť, vrací 200).
5. **Mobil** — viz iframe trik v gotcha 11, pak zkontrolovat header/hamburger, zalamování a přesahy.

## Vizuální kontrola (headless Chrome)

Chrome je na `C:\Program Files\Google\Chrome\Application\chrome.exe` (i Edge). Screenshot:
```powershell
& $chrome --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 --window-size=1240,140 --screenshot=$out "http://localhost:8080/"
```
- `--window-size` je v **CSS px při scale 1**. S `--force-device-scale-factor=2` je to ve device px — breakpointy testuj při scale 1.
- **Google cookie lišta**: foť vyšší okno (např. `1280,1250`) a ořízni jen horní část (`0..800`) — lišta je fixovaná dole.
- Ořez/zmenšení přes .NET `System.Drawing` (na Windows funguje; `Graphics.DrawImage` + `InterpolationMode.HighQualityBicubic`).
- Server se musí před screenshotem nechat doběhnout (`Start-Sleep 3`).
- **Text ze starého Google Sites** se dá vytáhnout přes `--dump-dom` (obsah se renderuje až JS, v `Invoke-WebRequest` je jen JSON payload):
  ```powershell
  & $chrome --headless=new --disable-gpu --virtual-time-budget=8000 --dump-dom $url | Out-File $out -Encoding utf8
  ```
  Pak strip `<script>/<style>`, nahradit tagy za `\n`, `[System.Net.WebUtility]::HtmlDecode` a odstranit soft hyphen `U+00AD`. Staré adresy zjistíš z `href="(/...)"` v HTML starého webu (Google Sites používá cesty bez lomítka na konci).

## OG obrázky (náhledy při sdílení)

- Celý web sdílí **jeden** náhled `src/assets/og-image.png` (1200×630). Stránka ho může přebít front matter `ogImage` + `ogImageAlt` (teď to nikde využité není), jinak `head.njk` použije fallback a alt `{{ site.name }} — {{ site.tagline }}`.
- `head.njk` z toho staví `og:image` (`type/width/height/alt`), `twitter:image:alt` a `primaryImageOfPage` v JSON-LD.
- Generují se dočasným PowerShell skriptem (.NET `System.Drawing`). Skládají se ze dvou částí:
  - **Levá**: světlé pozadí v barvách webu (`#FFFFFF → #EAF1F0`, jako hero), jemná teal záře `#1A9E8F` přes `PathGradientBrush` a mřížka `rgba(12,116,102,.08)` — **žádná cizí zelená ani černá**, vždy jen paleta webu; titulek tmavým inkoustem `#14181B` PJS 700 (66 px, max 3 řádky, baseline posledního řádku vždy 370 px — počet řádků se „věší" nahoru); akcentová linka `#12B3A2` na y=400; podtitulek Inter 400 28 px `#565F5E` (baseline 466); tři „chips" (bílé pilulky, teal text `#0B7268`) v y=500.
    - Logo je **1:1 přepočet z webu** (scale 1,44 z `1.55rem`) a na světlém pozadí vypadá stejně jako v hlavičce: „123" `#58595B`, PJS **800**, letter-spacing −0,02 em / −0,01 em, odznak `#1a9e8f` se `skewX(-14°)`, radius 7 px a paddingem `4px 15px 5px 9px`, mezera mezi „123" a odznakem 6 px. Kontrola měřením: odznak/„123" = 3,48, výška/kapka = 1,80, mezera 8 px.
    - GDI+ neumí letter-spacing → text loga se kreslí znak po znaku (`TrackW`/`Draw-Track`). Pozor na souřadnice: text v odznaku se kreslí **uvnitř transformace**, takže baseline musí být lokální (od horního okraje odznaku), ne globální.
  - **Pravá**: karta „prohlížeče" (x 696, y 132, 452×350) se světýlky a URL v mono fontu; obsah karty se mění podle stránky (hero + nav, ceník s cenami, mřížka ukázek, kontakty, check-list).
- **Fonty**: Inter a Plus Jakarta Sans na Windows nainstalované nejsou, stahují se jako statické TTF (`https://gwfh.mranftl.com/api/fonts/<rodina>?download=zip&subsets=latin,latin-ext&formats=ttf&variants=regular,600,700`) a načítají přes `PrivateFontCollection` — každá váha zvlášť (jinak GDI+ sáhne po špatném řezu, např. italic). Mono texty jedou na `C:\Windows\Fonts\consola.ttf`.
- **Pozor**: `New-Object Rectangle($x, $y + 10, $w, $h)` rozbije parsování (PowerShell udělá z `$y + 10, $w, $h` pole) — aritmetiku vždy předpočítej do proměnné. `Measure` je alias na `Measure-Object`, vlastní funkci proto pojmenuj jinak (`Text-Width`). `$g.Save()` vrací `GraphicsState` — volat `$g.Restore($state)`, jinak zůstane posun a text uteče. Text se umisťuje přes baseline (`Draw-At`), ne přes levý horní roh.
- Při změně claimu, taglinu nebo textu v obrázku OG náhledy přegeneruj. Umístění textu se ladí skenem řádků podle luminance (kde začíná/končí pás textu).

## SEO

- `head.njk` generuje canonical, OG/Twitter, JSON-LD (`ProfessionalService`, `WebSite`, `WebPage`) a doplňkové meta tagy (`author`, `googlebot` s `max-image-preview:large`, `theme-color`, `color-scheme`, ikony).
- OG/Twitter náhled pro sdílení je **jeden pro celý web** (`assets/og-image.png`); stránka ho může přebít front matter `ogImage` + `ogImageAlt`; viz sekce „OG obrázky“ níže.
- `sitemap.xml` (kolekce `sitemapPages`) a `robots.txt` se generují šablonami. Lidská obdoba je `/mapa-webu/` (vypisuje hlavní stránky, všech 12 měst, 16 oborů + odkaz na XML sitemap) a je odkazovaná z patičky.
- Každá stránka: právě 1× `h1`, meta description cca 50–165 znaků, `noindex` u 404.
- **Slugy jsou ASCII bez diakritiky**: `/cenik/`, `/ukazky/`, `/proc/`, `/kontakt/`, `/zpracovani-osobnich-udaju/`. Diakritické URL (starý web) se přesměrovávají — viz tabulka výše.
- **Přejmenování slugu** = přejmenovat soubor v `src/` + upravit `_data/site.json` (navigace), odkazy v šablonách a tento soubor. Redirect přidávej jen k URL, které byly **reálně nasazené** (nepublikovaný slug redirect nepotřebuje).

## SEO — lokality a obory

Cíl: být relevantní tvůrce webů pro **města a obce kolem Slaného** (Praha se neřeší, tam je konkurence) a zároveň cílit **oborové dotazy na celou ČR**.

| silo | URL | data | šablona | rozcestník |
| --- | --- | --- | --- | --- |
| města | `/webove-stranky/<slug>/` | `_data/lokalita.json` (12) | `webove-stranky/lokalita.njk` | `/webove-stranky/` |
| obory | `/web-pro/<slug>/` | `_data/obor.json` (16) | `web-pro/obor.njk` | `/web-pro/` |

- Slugy obou sil jsou **ASCII bez diakritiky** (`/webove-stranky/kralupy-nad-vltavou/`, `/web-pro/remeslniky/`).
- **Lokality** mají jen 12 měst, ne každou vesnici — okolní obce jsou vypsané v textu (`villages` + `villagesNote`). Důvod: samostatná stránka pro každou obec by byla tenký obsah.
- **Žádná stránka nesmí být tenká**: každá má vlastní intro, „s čím se potýkáte“, checklist, FAQ (5) a vlastní závěr. Praktický limit je **500+ slov** v `<main>` (měřeno Node skriptem, viz „Kontrola kvality“); reálně se držíme na 750–950 slovech.
- Data lokalit obsahují i **mluvnické tvary** `in` („ve Slaném“), `to` („do Slaného“), `gen` („Slaného“) — šablony je vkládají do textů, takže se nemusí skloňovat ručně. `short` je první věta `description` pro karty v mřížce.
- **Přidání další lokality/oboru** = přidat objekt do JSON (uniklý slug, `title`, `description` 50–165 znaků, `intro[]`, `faq[]`) a nic víc — rozcestník, sitemap i karty se vygenerují samy. `short` (u oboru i `label`, `meta`) si vygeneruj stejným způsobem jako první větu `description`.
- Interní prolinkování (kraulovatelnost): homepage → oba rozcestníky → detaily; detaily → 3 sousední (`nearby`) / 3 související obory (`related`) → oba rozcestníky; oba rozcestníky jsou i v patičce na všech stránkách.
- Sdílené bloky jsou v `_includes/`: `link-cards.njk` (mřížka odkazů), `cenik-strip.njk`, `refs-strip.njk`, `faq-strip.njk`. Parametry se předávají **přes `{% set %}` v rodičovské šabloně** před `{% include %}` (scope se sdílí) — vždy nastav všechny (`linkSet`, `linkSlugs`, `linkSoft`, `linkLimit`, `linkExclude`, `linkCtaHref`, `linkCtaLabel`), protože hodnoty zůstávají v scope a nevypsané by zdědily předchozí.
- `eleventyComputed` v obou paginovaných šablonách plní `title`/`description` z dat (front matter sám o sobě `{{ }}` nevyhodnocuje).
- CSS pro nové bloky: `.prose`, `.local-note`, `.link-grid`/`.link-card`, `.tag-list`/`.tag` (`--links` = klikací), `.check-list--2` (dvousloupcový checklist), `.features--3`, `.cta-row`. Na 768 px se `check-list--2`/`features--3` srovnají do jednoho sloupce, na 620 px i `link-grid`.

## Nasazení (GitHub Pages)

- Repozitář: `https://github.com/Staticke-weby/123stranky.cz` (veřejný, výchozí branch `main`), lokálně `origin`. GitHub Pages jsou zapnuté (Source = GitHub Actions); web běží na `https://staticke-weby.github.io/123stranky.cz/`, vlastní doména `www.123stranky.cz` se teprve nastavuje (DNS na ni zatím míří na starý Google Sites). `gh` (GitHub CLI) na stroji **není** — pracuje se přes `git` + web GitHubu.
- Nasadit ručně: `git push origin main` (běží workflow `.github/workflows/pages.yml`: build `_site` → `actions/upload-pages-artifact` → `actions/deploy-pages`).
- Akce ve workflow musí cílit na **Node 24** (`checkout@v5`, `setup-node@v5`, `configure-pages@v6`, `upload-pages-artifact@v5`, `deploy-pages@v5`). Starší verze běží na Node 20 a GitHub u nich hlásí deprecation warning (`target Node.js 20 but are being forced to run on Node.js 24`).
- Vlastní doména: `src/CNAME` = `www.123stranky.cz` (kopíruje se do kořene `_site`), ale **nasadit ji musíš v Settings → Pages → Custom domain** — při deployi přes Actions se soubor `CNAME` do nastavení nepropíše (nasazený `/CNAME` je prázdný, dokud doména není vyplněná v nastavení). `site.url` je `https://www.123stranky.cz`, canonical, OG i sitemap míří na www.
- **Web funguje z kořene domény i z podadresáře.** V šablonách se interní odkazy píšou root-relative (`/kontakt/`), ale transform `relativeLinks` v `eleventy.config.js` je při buildu přepíše na relativní podle hloubky stránky (`./`, `../`, `../../`). Díky tomu funguje jak `https://www.123stranky.cz/…`, tak `https://staticke-weby.github.io/123stranky.cz/…`. Když přidáš nový atribut s cestou (`data-bg`, `srcset`…), musíš ho přidat i do regexu v transformu.
- DNS je na **Cloudflare** (NS `ajay.ns`/`zoe.ns.cloudflare.com`, provoz přes Google Sites). Pro GitHub Pages:
  - apex `123stranky.cz`: `A` na `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (+ volitelně `AAAA 2606:50c0:8000::153` … `::803`)
  - `www`: `CNAME` na `staticke-weby.github.io`
  - Nejdřív nechat **DNS only** (šedý mrak), ať GitHub vystaví certifikát, pak teprve případně zapnout proxy. Zapnout **Enforce HTTPS**.
- **Přesměrování ze starých URL** (GitHub Pages neumí serverové redirecty): `_data/redirects.json` + šablony `redirecty.njk` (`/{{ from }}/index.html`) a `redirecty-bez-lomitka.njk` (`/{{ from }}.html`). Generují se obě varianty, protože se liší chování statického serveru. Stránka má `meta refresh`, `canonical` na cíl a `noindex`.
- Namapované staré adresy (Google Sites, ověřeno, že vracely 200):

  | stará URL | nová URL |
  | --- | --- |
  | `/123stranky` | `/` |
  | `/reference` | `/#reference` |
  | `/ukázky` | `/ukazky/` |
  | `/poptávka` | `/kontakt/` |
  | `/návod-na-weby-google` | `/` |
  | `/zpracování-osobních-údajů` | `/zpracovani-osobnich-udaju/` |

  `/kontakt` (bez lomítka) **nemá** vlastní redirect — řeší ho sám GitHub Pages přes directory index (`/kontakt` → `/kontakt/`).
- Pozor: redirect pro cestu, která už na webu existuje, shodí build na `DuplicatePermalinkOutputError`.
- `404.html` na GitHub Pages funguje automaticky, není potřeba nic nastavovat.

## TODO (nedodělané)

- Kontaktní formulář (web je zatím bez formuláře — jen e-mail/telefon).
- **Soukromí vs. měření**: na webu běží Umami (bez cookies), ale právní text na `/zpracovani-osobnich-udaju/` zmiňuje jen Google Analytics/Ads a Facebook pixel (doslovné znění ze starého webu). Mělo by se doplnit, že se návštěvnost měří přes Umami — **rozhodnutí je na firmě** (text se nemění bez jejího souhlasu).
- Právní text na `/zpracovani-osobnich-udaju/` je **doslovné znění ze starého webu** (Google Sites) — neměnit formulace, jen struktura je nová (`.legal` + `.legal-toc` = obsah s kotvami). Zachované jsou i původní údaje: správce `Hell Solutions s.r.o.`, `info@hellsolutions.cz`, `+420605540167`, adresa `Tuřany 77, 27379 Tuřany`, účinnost `20.3.2024`, zmínky o Google cookies (Analytics, Ads, Facebook pixel) a okně „Nastavení cookies". Kontakt na webu je `123stranky.cz@gmail.com` / `+420 731 819 760` → **rozpor, měla by ho potvrdit/opravit firma**.
- Zvážit self-hosted fonty místo Google Fonts (nyní se Inter + Plus Jakarta Sans načítají z `fonts.googleapis.com` v `head.njk`).
- Získat skutečné citace od klientů (recenze jsou zatím smyšlené, přiřazené k referenčním firmám: MUCHOVA, Rychlé Čištění Praha, Biorezonance BICOM).
