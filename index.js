#! /usr/bin/env node
// /usr/bin/env node tells node that it should run from here through the commandline.

// Debug in chrome. Disable in production.
var nomo = require('node-monkey').start();

var manga_script = require('./lib/manga-script.js');
var manga_scraper = require('./lib/manga-scraper.js');
var manga_file = require('./lib/manga-file.js');
var manga_downloader = require('./lib/manga-downloader.js');

// package.json
var pjson = require('./package.json');

// commander.js
var program = require('commander');

/*
 * Defaults
 */




/*
 * commander.js
 */
program
    .version(pjson.version)
    .option('-s, --setup', 'Make folders, config file with defaults. Make backups before using.')
    .option('-j, --json [http://mangafox.me/manga/naruto/]', 'Download manga json.')
    .option('-d, --download [manga_json/naruto.json]', 'Download images using manga json made from this app.')
    .option('-u, --update [manga_json/naruto.json]', 'Update manga json file.')
    .option('-i, --index [manga_json/naruto.json]', 'Make index files. e.g: manga_json/naruto_index.json')
    .option('--index_list', 'Make a master index file (See https://github.com/tadachi/manga-front)')
    .option('--index_batch', 'Make index json for all mangas in manga_json directory')
    .option('--json_batch', 'Download manga json for all mangas in manga.txt file.')
    .option('--download_batch', 'Download manga images from manga json.')
    //.option('-c, --check', 'Check config.json for errors.')
    .option('-v, --version', 'Get current version of program')
    .parse(process.argv);

if (program['version']) {
    console.log(pjson.name + ': ' + pjson.version);
}

if (program['setup']) {
    manga_script.setup();
}

// Begin.
var opts = manga_file.readJsonConfigFile('config.json');

if (program['json']) {
    var manga_url = program.json;
    // Debug
    //console.log(manga_url);
    //var mfs = new manga_scraper.MangaFoxScraper();
    //mfs.getPageNumbersPromise(manga_url).then(function(page_numbers) {
    //   console.log(page_numbers);
    //});
    manga_script.getMangaJson(manga_url, opts, function(done) {
        console.log(done);
        // Done
    })
}

if (program['download']) {
    var json_file = program.download;
    // Debug
    //console.log(manga_url);
    //var mfs = new manga_scraper.MangaFoxScraper();
    //mfs.getPageNumbersPromise(manga_url).then(function(page_numbers) {
    //   console.log(page_numbers);
    //});
    manga_downloader.downloadManga(json_file, opts, function(done) {
        console.log(done);
    });
}

if (program['update']) {
    var json_file = program.update;
    // Debug
    //var mfs = new manga_scraper.MangaFoxScraper();
    //var opts = {};
    //mfs.getImageUrl(json_file, opts, function(image_url) {
    //   console.log(image_url);
    //});
    manga_script.updateMangaJson(json_file, opts, function(done) {
        //done
    });
}

if (program['index']) {
    var json_file = program.index;
    manga_script.getMangaIndexJson(json_file, opts, function(done) {
        console.log(done + '\n\n');
    });
}

if (program['index_list']) {
    manga_script.getMangaIndexJsonList(opts, function(done) {
        //Done
    });
}

if (program['json_batch']) {
    manga_script.getMangaJsonInList('manga.txt', opts, function(done) {
        //Done
    });
}

if (program['index_batch']) {
    manga_script.getIndexesForAllMangaJson(opts);
}

if (program['download_batch']) {
    manga_script.downloadImagesForAllManga(opts);
}

// Debug
//console.log(program);

/*
 Scraper
 */
//var manga_url = 'http://mangafox.me/manga/macchi_shoujo/'; // 2 chapters Works.;
//var manga_url = 'http://mangafox.me/manga/owari_no_seraph/';
//var manga_url = 'http://mangafox.me/manga/shingeki_no_kyojin/';
//var manga_url = 'http://mangafox.me/manga/sidonia_no_kishi/';
//var manga_url = 'http://mangafox.me/manga/asu_no_yoichi/';
//var manga_url = 'http://mangafox.me/manga/ichiban_ushiro_no_daimaou/';
//var manga_url = 'http://mangafox.me/manga/liar_game/';
//var manga_url = 'http://mangafox.me/manga/naruto_gaiden_the_seventh_hokage/';
//var manga_url = 'http://mangafox.me/manga/another_world_it_exists/';
//var manga_url = 'http://mangafox.me/manga/tokyo_ghoul_re/';
//var manga_url = 'http://mangafox.me/manga/fairy_tail/'; // 400+ chapters.
//var manga_url = 'http://mangafox.me/manga/hack_link/'; // 18 chapters.
//
//manga_script.getMangaJson(manga_url, opts, function(done) {
//    console.log(done);
//});

/*
 Download
 */
//var manga_downloader = new manga_downloader.MangaDownloader();

//var manga_json = 'manga_json/owari_no_seraph.json';
//var manga_json = 'manga_json/sidonia_no_kishi.json';
//var manga_json = 'manga_json/ichiban_ushiro_no_daimaou.json';
//var manga_json = 'manga_json/macchi_shoujo.json';
//var manga_json = 'manga_json/tokyo_ghoul_re.json';
//var manga_json = 'manga_json/another_world_it_exists.json';
//var manga_json = 'tests/test_manga_json/test_owari_no_seraph.json';

//manga_downloader.downloadManga(manga_json, opts, function(done) {
//    console.log(done);
//});

/*
 Update
 */
//var json_file = 'tests/test_naruto_gaiden_the_seventh_hokage_old.json';
//var json_file = 'tests/test_manga_json/test_owari_no_seraph.json';
//var json_file = 'manga_json/naruto_gaiden_the_seventh_hokage.json';
//var json_file = 'manga_json/owari_no_seraph.json';

//manga_script.updateMangaJson(json_file, opts, function(done) {
//    console.log(done);
//});

/*
 Build Index
 */
//var json_file = 'manga_json/another_world_it_exists.json';
//var json_file = 'manga_json/owari_no_seraph.json';
//var json_file = 'manga_json/ichiban_ushiro_no_daimaou.json';
//var json_file = 'manga_json/sidonia_no_kishi.json';


//manga_script.getMangaIndexJson(json_file, opts, function(done) {
//    console.log(done + '\n\n');
//});

//manga_script.getMangaIndexJsonList(opts, function(done) {
//    console.log(done+ '\n\n');
//});

/*
 Batch scrape, download, update, build index
 */
//var manga_list_file = 'manga.txt';
//var manga_json_dir = 'manga_json';
//var manga_json_dir = 'tests/test_manga_json';
//var manga_list_file = 'tests/test_manga.txt';

//manga_script.getMangaJsonInList(manga_list_file, opts);
//mnaga_script.updateMangaJsonInList(manga_json_dir, opts);

