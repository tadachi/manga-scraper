var manga_scraper = require('../lib/manga-scraper.js');
var Promise = require('bluebird');
var manga_downloader = require('../lib/manga-downloader.js');
var manga_file = require('../lib/manga-file.js');

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
