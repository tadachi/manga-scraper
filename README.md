![Travis Logo](https://travis-ci.org/tadachi/manga-scraper.svg?branch=master "Travis Build")

##Manga-Scraper

#### Description
Get a json representation of references to manga and manga images from mangafox-like websites' CDNs.

#### Usage
```
PS C:\Users\tadachi\git\manga-scraper> node index.js --help

  Usage: index [options]

  Options:

    -h, --help                                     output usage information
    -V, --version                                  output the version number
    -j, --json [http://mangafox.me/manga/naruto/]  Download manga json.
    -d, --download [manga_json/naruto.json]        Download images using manga json made from this app.
    -u, --update [manga_json/naruto.json]          Update manga json file.
    -v, --version                                  Get current version of program

```

#### Example JSON from Mangafox

This is an example of what you would get when you run the --json command and look for shingeki_no_kyojin.
[shingeki_no_kyojin.json](https://raw.githubusercontent.com/tadachi/manga-scraper/master/manga_json/shingeki_no_kyojin.json)

##Mangafox Spec:

This is what I gleamed from their website. Try visiting some of the urls below to get a sense of what MangaScraper looks for.

#### Directory of All Mangafox's Manga
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
