// Debug in chrome. Disable in production.
//var nomo = require('node-monkey').start();

var manga_scraper = require('../lib/manga-scraper.js');
var Promise = require('bluebird');

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
        "manga_name": "macchi_shoujo",
        "chapter_urls": [
            "http://mangafox.me/manga/macchi_shoujo/v01/c000/",
            "http://mangafox.me/manga/macchi_shoujo/v01/c001/"
        ],
        "filename": "macchi_shoujo.json"
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

exports.testGetNonDuplicates = function(test) {
    var array1 = [1,2,3];
    var array2 = [1,2,3,4,5];
    var new_array = manga_scraper.getNonDuplicates(array1,array2);

    test.equals(new_array.length, [4,5].length);
    test.equals(new_array[0], [4,5][0]);
    test.equals(new_array[1], [4,5][1]);
    test.done();

};


exports.testGetMangaIndexUrlsPromiseResolve = function(test) {
    var mfs = new manga_scraper.MangaFoxScraper();
    var promise = mfs.getMangaIndexUrlsPromise();

    promise.then(function(results) {
        test.equals(results.length, 26);
        test.done();
    })
};

exports.testGetMangaIndexUrlsPromiseReject = function(test) {
    var mfs = new manga_scraper.MangaFoxScraper();
    var promise1 = mfs.getMangaIndexUrlsPromise('http://mangafox.me/mang/');
    var promise2 = mfs.getMangaIndexUrlsPromise('http://mangaox.me/mang/');

    var promises = [];
    promises.push(promise1);
    promises.push(promise2);

    Promise.settle(promises).then( function(err) {
        test.equals(err[0]['_settledValue']['response']['statusCode'], 404);
        test.equals(err[1]['_settledValue']['error']['code'], 'ENOTFOUND');
        test.done();
    })
};

