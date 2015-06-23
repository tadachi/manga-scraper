var manga_scraper = require('../lib/manga-scraper.js');
var Promise = require('bluebird');
var manga_downloader = require('../lib/manga-downloader.js');
var manga_file = require('../lib/manga-file.js');

exports.testPad = function(test) {
    var str1 = manga_scraper.pad(2,3);
    var str2 = manga_scraper.pad(13,4);
    var str3 = manga_scraper.pad(114,2);
    var str4 = manga_scraper.pad(2,1);
    var str5 = manga_scraper.pad(2,0);
    var str6 = manga_scraper.pad(2,-1);
    var str7 = manga_scraper.pad(2,-2);
    var str8 = manga_scraper.pad(2,-3);

    test.equals(str1, '002');
    test.equals(str2, '0013');
    test.equals(str3, '14');
    test.equals(str4, '2');
    test.equals(str5, '0002');
    test.equals(str6, '002');
    test.equals(str7, '02');
    test.equals(str8, '2');
    test.done();
};

exports.testCount = function(test) {
    var test_json1 = {
        'manga_name': 'macchi_shoujo',
        'chapter_urls': [
            'http://mangafox.me/manga/macchi_shoujo/v01/c000/',
            'http://mangafox.me/manga/macchi_shoujo/v01/c001/'
        ],
        'filename': 'macchi_shoujo.json'
    };
    var test_json2 = {};
    var test_json3 = {};
    for (var i = 0; i < 100; i++) {
        test_json3[i] = i;
    }

    test.equals(manga_scraper.count(test_json1), 3);
    test.equals(manga_scraper.count(test_json2), 0);
    test.equals(manga_scraper.count(test_json3), 100);

    test.done();
};

exports.testReadMangaFileSync = function(test) {
    var data = manga_file.readMangaFileSync('test_manga.txt');
    test.equals(data[0], 'http://mangafox.me/manga/shingeki_no_kyojin/');
    test.equals(data.length, 9);
    test.done(); // test.done must be outside for the callback to work.

};

exports.testReadMangaFile = function(test) {

    manga_file.readMangaFile('test_manga.txt', function(data) {
        test.equals(data[0], 'http://mangafox.me/manga/shingeki_no_kyojin/');
        test.equals(data.length, 9);
        test.done(); // test.done must be outside for the callback to work.
    });

};

exports.testSaveMangaAsJson = function(test) {
    var manga_url = 'http://mangafox.me/manga/shingeki_no_kyojin/';
    var chapter_urls = [
        'http://mangafox.me/manga/shingeki_no_kyojin/v00/c000/1.html',
        'http://mangafox.me/manga/shingeki_no_kyojin/v01/c001/1.html'
    ];
    var titles = [
        'One Shot',
        'First draft [storyboard] for Chapter 1'
    ];
    var chapter_image_urls = [
        [
            'http://a.mfcdn.net/store/manga/9011/00-000.0/compressed/v001.jpg',
            'http://a.mfcdn.net/store/manga/9011/00-000.0/compressed/v002.jpg',
            'http://a.mfcdn.net/store/manga/9011/00-000.0/compressed/v003.jpg',
            'http://a.mfcdn.net/store/manga/9011/00-000.0/compressed/v004.jpg',
            'http://a.mfcdn.net/store/manga/9011/00-000.0/compressed/v005.jpg',
        ],
        [
            'http://a.mfcdn.net/store/manga/9011/01-001.0/compressed/k1.9001e.jpg',
            'http://a.mfcdn.net/store/manga/9011/01-001.0/compressed/k1.9002e.jpg',
            'http://a.mfcdn.net/store/manga/9011/01-001.0/compressed/k1.9003e.jpg',
            'http://a.mfcdn.net/store/manga/9011/01-001.0/compressed/k1.9004e.jpg',
            'http://a.mfcdn.net/store/manga/9011/01-001.0/compressed/k1.9005e.jpg',
        ]
    ];

    var mangafox = new manga_scraper.MangaFox(manga_url, chapter_urls, chapter_image_urls, titles);
    mangafox['filename'] = 'test.json';
    manga_scraper.saveMangaAsJson(mangafox, './');

    manga_file.exists('test.json', function(exists) {
        console.log(exists);
        test.equals(exists, true);
        test.done();
    });



};

