![Travis Logo](https://travis-ci.org/tadachi/manga-scraper.svg?branch=master "Travis Build")

###Manga-Scraper

#### Description
Get a json representation of references to manga and manga images from mangafox-like websites' CDNs.

You can use this json to download manga and build your own personal collection.

Use https://github.com/tadachi/manga-front and host it on a server to read manga from anywhere.

#### npm
Visit https://www.npmjs.com/package/manga-scraper to see it on npm.

#### Install
```

npm install -g manga-scraper

mangascraper -s

```

#### Example Run
```

mangascraper --json http://mangafox.me/manga/sidonia_no_kishi/

mangascraper --download http://mangafox.me/manga/sidonia_no_kishi/

```


#### Usage
```

PS C:\Users\tadachi\git\manga-scraper> mangascraper --help

Usage: index [options]

Options:

  -h, --help                                     output usage information
  -V, --version                                  output the version number
  -s, --setup                                    Make folders, config file with defaults. Make backups before using.
  -j, --json [http://mangafox.me/manga/naruto/]  Download manga json.
  -d, --download [manga_json/naruto.json]        Download images using manga json made from this app.
  -u, --update [manga_json/naruto.json]          Update manga json file.
  -i, --index [manga_json/naruto.json]           Make index files. e.g: manga_json/naruto_index.json
  --index_list                                   Make a master index file (See https://github.com/tadachi/manga-front)

  --index_batch                                  Make index json for all mangas in manga_json directory
  --json_batch                                   Download manga json for all mangas in manga.txt file.
  --download_batch                               Download manga images from manga json.
  -v, --version                                  Get current version of program
```

#### Example JSON from Mangafox

This is an example of what you would get when you run the --json command and look for shingeki_no_kyojin:
[shingeki_no_kyojin.json](https://raw.githubusercontent.com/tadachi/manga-scraper/master/manga_json/shingeki_no_kyojin.json)