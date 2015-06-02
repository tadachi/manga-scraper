//var nomo = require('node-monkey').start();

//http://mangafox.me/ajax/search.php?term=as
//curl "http://mangafox.me/ajax/series.php" -H "Cookie: mfsid=5h862gaebe5pmihi8f2lna0c25; mfvb_sessionhash=e8525e9c84106cb878722923a7b44ba8; __utmt=1; __unam=657356c-14d976fbc8e-601992af-127; mfvb_lastvisit=1432764724; __utma=18273573.497484044.1432764723.1432937761.1432940951.5; __utmb=18273573.4.10.1432940951; __utmc=18273573; __utmz=18273573.1432937761.4.4.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not"%"20provided)" -H "Origin: http://mangafox.me" -H "Accept-Encoding: gzip, deflate" -H "Accept-Language: en-US,en;q=0.8" -H "User-Agent: Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36" -H "Content-Type: application/x-www-form-urlencoded" -H "Accept: application/json, text/javascript, */*; q=0.01" -H "Referer: http://mangafox.me/manga/" -H "X-Requested-With: XMLHttpRequest" -H "Connection: keep-alive" --data "sid=12988" --compressed

// Manga directory with every manga.

var request = require('request');
var cheerio = require('cheerio');
var promise = require('promise');
var q = require('q');
var URI = require('URIjs');
var path = require('path');
//
//var alpha_list =
//    [
//        'idx_#',
//        'idx_a',
//        'idx_b',
//        'idx_c',
//        'idx_d',
//        'idx_e',
//        'idx_f',
//        'idx_g',
//        'idx_h',
//        'idx_i'
//    ]

/*
...
http://mangafox.me/manga/azrael_park_jung_yul/
http://mangafox.me/manga/azrael_s_edge/
http://mangafox.me/manga/azuke_honya/
http://mangafox.me/manga/azumanga_daioh/
http://mangafox.me/manga/azumanga_daioh_hoshuu_hen/
http://mangafox.me/manga/azumi/
http://mangafox.me/manga/azure_dream/
...
*/

request('http://mangafox.me/manga/', function (error, response, html) {
    var urls = [];
    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);

        $('#idx_a li a').each(function(i, elem) {
            urls.push($(this).attr('href'))
        });
        return urls;
    }
});

/**
 *
 * @constructor
 */
var MangaFoxScraper = function() {
    this.chapter_urls = null;
    this.chapter_page_urls = null;
}


MangaFoxScraper.prototype = {
    setChapterUrls:function(chapter_urls) {
        this.chapter_urls = chapter_urls;
    },
    getChapterUrls:function() {
        return this.chapter_urls;
    },
    setChapterPageUrls:function(chapter_page_urls) {
        this.chapter_page_urls = chapter_page_urls;
    },
    getChapterPageUrls:function() {
        return this.chapter_page_urls;
    }
};

MangaFoxScraper.prototype = Object.create(MangaFoxScraper.prototype);

/*
...
http://mangafox.me/manga/hack_link/v02/c013.5/1.html
http://mangafox.me/manga/hack_link/v02/c013/1.html
http://mangafox.me/manga/hack_link/v02/c012/1.html
http://mangafox.me/manga/hack_link/v02/c011/1.html
http://mangafox.me/manga/hack_link/v02/c010/1.html
http://mangafox.me/manga/hack_link/v02/c009/1.html
http://mangafox.me/manga/hack_link/v02/c008/1.html
http://mangafox.me/manga/hack_link/v02/c007/1.html
http://mangafox.me/manga/hack_link/v01/c006.5/1.html
...
*/

/**
 *
 * @param mangafox_url
 * @param callback
 * @callback urls;
 */
MangaFoxScraper.prototype.getChapterUrlsPromise = function(mangafox_url){

    var promise = new Promise(function(resolve, reject) {
        var execute = function(error, response, html) {
            var urls = [];
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);

                $('.tips').each(function(i, elem) {
                    urls.push($(this).attr('href'))
                });
                resolve(urls);
            } else {
                reject(error);
            }
        };

        request(mangafox_url, execute);
    });

    return promise;

};



/*
'http://mangafox.me/manga/azure_dream/v01/c007/1.html',
'http://mangafox.me/manga/azure_dream/v01/c006/1.html',
'http://mangafox.me/manga/azure_dream/v01/c005/1.html',
'http://mangafox.me/manga/azure_dream/v01/c004/1.html',
'http://mangafox.me/manga/azure_dream/v01/c003/1.html',
'http://mangafox.me/manga/azure_dream/v01/c002/1.html',
'http://mangafox.me/manga/azure_dream/v01/c001/1.html'
*/

/*
 1
 2
 3
 4
 5
 ...
 38
*/
MangaFoxScraper.prototype.getPageNumbersPromise = function(mangafox_chapter_url) {
    var promise = new Promise(function(resolve, reject) {
        var execute = function(error, response, html) {
            var page_numbers = [];
            var temp_numbers = [];
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);

                $('.m option').each(function(i, elem) {
                    temp_numbers.push($(this).attr('value'))
                });

                // Mangafox lists page numbers twitch on the top and bottom of image.
                // You need to cut it in half and subtract by one taking into account comments page.
                for (var i = 0; i < (temp_numbers.length/2-1); i++) { // -1 for the comments page.
                    page_numbers.push(temp_numbers[i]);
                }

                resolve(page_numbers);

            } else {
                reject(error);
            }
        };

        request(mangafox_chapter_url, execute);
    });

    return promise;
}

/*
http://a.mfcdn.net/store/manga/5716/01-001.0/compressed/ha_lapis_lazuli_blue_dream_03.jpg
http://a.mfcdn.net/store/manga/5716/01-001.0/compressed/ha_lapis_lazuli_blue_dream_04.jpg

http://a.mfcdn.net/store/manga/5716/01-004.0/compressed/ilililicious.jpg
http://a.mfcdn.net/store/manga/5716/01-004.0/compressed/inostalgia_01.jpg
*/
var scraper1 = new MangaFoxScraper();

one = scraper1.getChapterUrlsPromise("http://mangafox.me/manga/azure_dream/");

// First html page of chapters.
one.then( function(urls)  {
    var chapter_urls = [];
    var chapter_page_urls = [];

    urls = urls.sort(); // Sort urls before processing.
    var promises = [];

    urls.forEach( function(url) {
        promises.push(scraper1.getPageNumbersPromise(url));
    });

    // Page numbers for each chapters.
    // promises and urls are the same length.
    q.all(promises).then(
        function(page_numbers) {
            if (urls.length == page_numbers.length) {
                for (var i = 0; i < page_numbers.length; i++) {
                    var url = new URI(urls[i]); // ==> "http://mangafox.me/manga/azure_dream/v01/c001/1.html" ...

                    // Set chapter urls.
                    chapter_urls.push(path.dirname(url.toString()) + "/") // ==> http://mangafox.me/manga/azure_dream/v01/c007/ ...
                }
            } else {
                throw ChaptersPagesNotEqualException("chapter_urls and chapter_page_numbers length not equal for this manga.")
            }

            var ext = ".html";
            for (i = 0; i < chapter_urls.length; i++) { // chapter_urls.length == page_numbers.length
                var chapter_pages = []
                for (var e = 0; e < page_numbers[i].length; e++) {
                    chapter_pages.push(chapter_urls[i] + page_numbers[i][e] + ext); // ==> http://mangafox.me/manga/azure_dream/v01/c001/1.html .. 2.html .. 3.html ..
                }
                chapter_page_urls.push(chapter_pages);
            }

        }
    ).finally(function() {
        scraper1.setChapterUrls(chapter_urls);
        scraper1.setChapterUrls(chapter_page_urls);

        console.log(scraper1.getChapterUrls());
    });
});

/*
exceptions
*/
function ChaptersPagesNotEqualException(message) {
    this.message = message;
    this.name = "ChaptersPagesNotEqualException";
}