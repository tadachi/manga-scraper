![Travis Logo](https://travis-ci.org/tadachi/manga-scraper.svg?branch=master "Travis Build")

###Manga-Scraper

#### Description
Get a json representation of references to manga and manga images from mangafox-like websites' CDNs.

#### npm
Visit https://www.npmjs.com/package/manga-scraper to see it on npm.

#### Install
```
npm install -g manga-scraper
```config.json

#### Usage
```
PS C:\Users\tadachi\git\manga-scraper> mangascraper --help

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

This is an example of what you would get when you run the --json command and look for shingeki_no_kyojin:
[shingeki_no_kyojin.json](https://raw.githubusercontent.com/tadachi/manga-scraper/master/manga_json/shingeki_no_kyojin.json)