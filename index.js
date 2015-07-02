// Debug in chrome. Disable in production.
var nomo = require('node-monkey').start();

var manga_script = require('./lib/manga-script.js');
var manga_file = require('./lib/manga-file.js');
var manga_downloader = require('./lib/manga-downloader.js');

// package.json
var pjson = require('./package.json');

// commander.js
var program = require('commander');

/*
 * Defaults
 */

var opts = manga_file.readJsonConfigFile('config.json');
//var opts = {
//    'dry': false, // When downloading singular, do not download anything, not even JSON.
//    'JSON_only': false, // When batch processing, only download the json, do not download images.
//    'overwrite': false, // Overwrite images. Even if they exist.
//    'json_directory': 'manga_json',
//    'manga_directory': 'manga',
//    'manga_list_file': 'manga.txt',
//    'timeout': 5000, // manga_scraper
//    'parallel': true,
//    'parallel_limit': 5
//};

/*
 * commander.js stub
 */
program
    .version('0.1.0')
    .option('-d, --download', 'get line feed separated list of manga to download.')
    .option('-u, --update', 'Update line feed separated list of manga.')
    .option('-c, --check', 'Check config.json for errors')
    .option('-v, --version', 'Get current version of program')
    .parse(process.argv);

if (program['download'])
    console.log('test');

if (program['update'])
    console.log('test2');

if (program['version'])
    console.log(pjson.version);

console.log(program);

/*
 Scraper
 */
//var manga_url = 'http://mangafox.me/manga/macchi_shoujo/'; // 2 chapters Works.;
//var manga_url = 'http://mangafox.me/manga/owari_no_seraph/';
//var manga_url = 'http://mangafox.me/manga/shingeki_no_kyojin/';
var manga_url = 'http://mangafox.me/manga/sidonia_no_kishi/';
//var manga_url = 'http://mangafox.me/manga/asu_no_yoichi/';
//var manga_url = 'http://mangafox.me/manga/ichiban_ushiro_no_daimaou/';
//var manga_url = 'http://mangafox.me/manga/liar_game/';
//var manga_url = 'http://mangafox.me/manga/naruto_gaiden_the_seventh_hokage/';
//var manga_url = 'http://mangafox.me/manga/another_world_it_exists/';
//var manga_url = 'http://mangafox.me/manga/tokyo_ghoul_re/';
//var manga_url = 'http://mangafox.me/manga/fairy_tail/'; // 400+ chapters.
//var manga_url = 'http://mangafox.me/manga/hack_link/'; // 18 chapters.

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

manga_script.getMangaIndexJsonList(opts, function(done) {
    console.log(done+ '\n\n');
});


/*
 Batch scrape, download, update, build index
 */
var manga_list_file = 'manga.txt';
var manga_json_dir = 'manga_json';
//var manga_json_dir = 'tests/test_manga_json';
//var manga_list_file = 'tests/test_manga.txt';

//manga_script.getMangaJsonInList(manga_list_file, opts);
//mnaga_script.updateMangaJsonInList(manga_json_dir, opts);

