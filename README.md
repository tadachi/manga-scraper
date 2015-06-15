![Travis Logo](https://travis-ci.org/tadachi/manga-scraper.svg?branch=master "Travis Build")

MangaFox
MangaTown

## Example JSON format:
https://raw.githubusercontent.com/tadachi/manga-scraper/master/mangafox_json/shingeki_no_kyojin.json

##Mangafox Spec:

#### Directory of All Mangafox's Manga:
http://mangafox.me/manga/

#### Example URL/API format:

mangafox.me/manga/:manga_name/:volume/:chapter/  
mangafox.me/manga/azure_dream/v01/c001  
mangafox.me/manga/ore_monogatari/v02/c004/  

#### Page URL format:

mangafox.me/manga/ore_monogatari/v01/c001.1/1.html  
...  
mangafox.me/manga/ore_monogatari/v01/c001.1/12.html  
...  
mangafox.me/manga/ore_monogatari/v01/c001.1/33.html  
mangafox.me/manga/ore_monogatari/v01/c001.1/ <--- Comments or index.html  

#### Example CDN URL Format for Images:

a.mfcdn.net/store/manga/11421/02-004.0/compressed/o001.jpg  
a.mfcdn.net/store/manga/11421/02-004.0/compressed/o043.jpg  
a.mfcdn.net/store/manga/5716/01-001.0/compressed/ha_lapis_lazuli_blue_dream_00a.jpg <--- page 1  
a.mfcdn.net/store/manga/5716/01-001.0/compressed/ha_lapis_lazuli_blue_dream_00c.jpg <--- page 2  
...  
a.mfcdn.net/store/manga/5716/01-001.0/compressed/hyuri_hime_13_cover.jpg <--- page 38
