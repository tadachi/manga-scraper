// Debug in chrome. Disable in production.
var nomo = require('node-monkey').start();

var ms = require('./lib/manga-scraper.js');
var Promise = require('bluebird');
var URI = require('URIjs');
var path = require('path');

console.log(ms.pad(20, 2));
mfs = new ms.MangaFoxScraper();
console.log(mfs.getMangaIndexUrlsPromise());

//var manga_url = 'http://mangafox.me/manga/azure_dream/';
//var manga_url = 'http://mangafox.me/manga/hack_link/';
//var manga_url = 'http://mangafox.me/manga/macchi_shoujo/'; // Works.
//var manga_url = 'http://mangafox.me/manga/gto_paradise_lost/';
//var manga_url = 'http://mangafox.me/manga/owari_no_seraph/';
//var manga_url = 'http://mangafox.me/manga/shingeki_no_kyojin/';
//var manga_url = 'http://mangafox.me/manga/naruto/';
//var manga_url = 'http://mangafox.me/manga/sidonia_no_kishi/';
//var manga_url = 'http://mangafox.me/manga/asu_no_yoichi/';
//var manga_url = 'http://mangafox.me/manga/ichiban_ushiro_no_daimaou/';
var manga_url = 'http://mangafox.me/manga/liar_game/';

run();

function run() {
    var mfs = new ms.MangaFoxScraper();
    var promise = mfs.getChapterUrlsPromise(manga_url);
    // STEP 1:
    promise.then( function(urls_titles) {

        console.time(manga_url);

        var urls = urls_titles[0];
        var titles = urls_titles[1];

        urls = urls.sort(); // Sort urls before processing.
        titles = titles.reverse(); // Reverse titles to match sorted urls.

        var promises = [];

        urls.forEach(function (url) {
            promises.push(mfs.getPageNumbersPromise(url));
        });

        return [urls, titles, promises]; // Passed down.

    })// STEP 2:
        .spread( function (urls, titles, promises) {

            var chapter_urls = [];
            var chapter_page_urls = [];

            return Promise.all(promises).then( function (page_numbers) { // Passed Down.
                if (urls.length == page_numbers.length) {
                    for (var i = 0; i < page_numbers.length; i++) {
                        var url = new URI(urls[i]); // ==> 'http://mangafox.me/manga/azure_dream/v01/c001/1.html' ...

                        // Set chapter urls.
                        chapter_urls.push(path.dirname(url.toString()) + '/') // ==> http://mangafox.me/manga/azure_dream/v01/c007/ ...
                    }
                } else {
                    var message = 'chapter_urls and chapter_page_numbers length not equal for this manga.';
                    throw new ChaptersPagesNotEqualException(message, urls);
                }

                var ext = '.html';
                for (i = 0; i < chapter_urls.length; i++) { // chapter_urls.length == page_numbers.length
                    var chapter_pages = []
                    for (var j = 0; j < page_numbers[i].length; j++) {
                        chapter_pages.push(chapter_urls[i] + page_numbers[i][j] + ext); // ==> http://mangafox.me/manga/azure_dream/v01/c001/1.html .. 2.html .. 3.html ..
                    }
                    chapter_page_urls.push(chapter_pages);
                }
            }).catch(function (err) {
                console.log(err);
            }).then( function() {

                return [chapter_urls, chapter_page_urls, titles]; // Passed down.
            })

        })
        .spread( function (chapter_urls, chapter_page_urls, titles){
            var promises = [];

            // Gather promises for image downloads that failed previously.
            for (var i = 0; i < chapter_page_urls.length; i++) {
                var chapter = ms.getChapterFromUrl(chapter_page_urls[i][0]);
                var volume = ms.getVolumeFromUrl(chapter_page_urls[i][0]);
                for (var j = 0; j < chapter_page_urls[i].length; j++) {
                    var opts = {'volume': volume, 'chapter': chapter, 'chapter_array_aligned': i,
                        'page': (j+1), 'page_array_aligned': (j)};

                    promises.push(mfs.getImageUrlPromise(chapter_page_urls[i][j], opts)); // int ms.

                }
            }

            return Promise.settle(promises).then( function (image_urls) {

                // rejections['_settledValue']['volume']
                // rejections['_settledValue']['chapter']
                // rejections['_settledValue']['chapter_array_aligned']
                // rejections['_settledValue']['page']
                // rejections['_settledValue']['page_array_aligned']
                // rejections['_settledValue']['url']
                var rejections = image_urls.filter(function(el){ return el.isRejected(); });

                // Debug
                //console.log('Rejections:');
                //console.log(rejections);

                // Debug
                console.log('image_urls:');
                console.log(image_urls);

                var chapter_image_urls = [];

                // Initialize Arrays;
                for (i = 0; i < chapter_page_urls.length; i++) {
                    chapter_image_urls[i] = [];
                }

                var last = null;
                for (var chapter_count = 0, i = 0; i < image_urls.length; i++) {
                    var curr = image_urls[i]['_settledValue']['chapter'];

                    if (i > 0) { last = image_urls[i-1]['_settledValue']['chapter'];
                    } else { last = image_urls[i]['_settledValue']['chapter']; }

                    if (curr != last) {
                        last = curr;
                        chapter_count++;
                    }
                    chapter_image_urls[chapter_count].push(image_urls[i]['_settledValue']['src']);
                }

                // Passed down.
                return [chapter_urls, chapter_page_urls, chapter_image_urls, rejections, titles]
            })

        })
        .spread( function(chapter_urls, chapter_page_urls, chapter_image_urls, rejections, titles) {
            var promises = [];

            // Gather promises of failed downloads.
            for (var i = 0; i < rejections.length; i++) {
                var volume = rejections[i]['_settledValue']['volume'];
                var chapter = rejections[i]['_settledValue']['chapter'];
                var chapter_array_aligned = rejections[i]['_settledValue']['chapter_array_aligned'];
                var page = rejections[i]['_settledValue']['page'];
                var page_array_aligned = rejections[i]['_settledValue']['page_array_aligned'];
                var url = rejections[i]['_settledValue']['url'];

                var opts = {
                    'volume': volume,
                    'chapter': chapter,
                    'chapter_array_aligned': chapter_array_aligned,
                    'page': page,
                    'page_array_aligned': page_array_aligned
                };
                promises.push(mfs.getImageUrlPromise(url, opts)); // int ms.
            }

            // Retry downloading failed downloads.
            Promise.all(promises).then(function (rejected_images) {

                // Debug
                console.log('rejected_images: ');
                console.log(rejected_images);

                // Finally build or mangafox object with all references to each page of each chapter of each volume, etc.
                var mangafox = new ms.MangaFox(manga_url, chapter_urls, chapter_image_urls, titles);

                // Add the missing/failed pages.
                // mangafox['volumes']['volume']['chapter']['img'][i]
                for (var i = 0; i < rejected_images.length; i++) {
                    var volume = rejected_images[i]['volume'];
                    var chapter = rejected_images[i]['chapter'];
                    var page = rejected_images[i]['page_array_aligned'];
                    //mangafox.volumes.volume.chapter.img[i] = src
                    mangafox['volumes'][volume][chapter]['img'][page] = rejected_images[i]['src'];
                }

                // Debug.
                console.log(mangafox);
                console.timeEnd(manga_url);

                // Save file.
                ms.saveMangaAsJson(mangafox, 'mangafox_json');
            });

        });



}