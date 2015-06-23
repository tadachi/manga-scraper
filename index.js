// Debug in chrome. Disable in production.
var nomo = require('node-monkey').start();

var ms = require('./lib/manga-scraper.js');
var md = require('./lib/manga-downloader.js');
var mf = require('./lib/manga-file.js');

var Promise = require('bluebird');
var URI = require('URIjs');
var path = require('path');
var jsonfile = require('jsonfile');
var fs = require('fs');

// commander.js
var program = require('commander');

var manga_list_file = 'tests/test_manga.txt';
//var manga_list_file = 'manga.txt';

var opts = {
    'dry': false,
    'JSON_only': false,
    'overwrite': false
};

program
.version('0.0.1')
.parse(process.argv);

// Scraper
mfs = new ms.MangaFoxScraper();

//var manga_url = 'http://mangafox.me/manga/macchi_shoujo/'; // Works.;
//var manga_url = 'http://mangafox.me/manga/owari_no_seraph/';
//var manga_url = 'http://mangafox.me/manga/shingeki_no_kyojin/';
//var manga_url = 'http://mangafox.me/manga/sidonia_no_kishi/';
//var manga_url = 'http://mangafox.me/manga/asu_no_yoichi/';
//var manga_url = 'http://mangafox.me/manga/ichiban_ushiro_no_daimaou/';
//var manga_url = 'http://mangafox.me/manga/liar_game/';
//var manga_url = 'http://mangafox.me/manga/naruto_gaiden_the_seventh_hokage/';
//var manga_url = 'http://mangafox.me/manga/another_world_it_exists/';
//var manga_url = 'http://mangafox.me/manga/tokyo_ghoul_re/';
var manga_url = 'http://mangafox.me/manga/fairy_tail/';

//getMangaJson(manga_url);

// Download
var manga_downloader = new md.MangaDownloader();

//var manga_json = 'mangafox_json/owari_no_seraph.json';
//var manga_json = 'mangafox_json/sidonia_no_kishi.json';
//var manga_json = 'mangafox_json/macchi_shoujo.json';
//var manga_json = 'mangafox_json/another_world_it_exists.json';
var manga_json = 'tests/test_owari_no_seraph_old.json';
//manga_downloader.downloadManga(manga_json);

var json_file = 'tests/test_naruto_gaiden_the_seventh_hokage_old.json';
//var json_file = 'mangafox_json/naruto_gaiden_the_seventh_hokage.json';
//var json_file = 'mangafox_json/owari_no_seraph.json';
//updateMangaJson(json_file, opts);

getMangaJsonInList(manga_list_file, opts);

function getMangaJsonInList(manga_list_file, opts) {
    var overwrite = false;
    if (opts.overwrite) { overwrite = opts.overwrite;}

    try {
        mf.exists(manga_list_file, function(exists) {
            if (!exists) {
                var message = manga_list_file + ' does not exist';
                throw new mf.FileDoesNotExistException(message, manga_list_file);
            }
        });
        // ...
        // http://mangafox.me/manga/shingeki_no_kyojin/
        // http://mangafox.me/manga/sidonia_no_kishi/
        // http://mangafox.me/manga/asu_no_yoichi/
        // ...
        var manga_urls = mf.readMangaFileSync(manga_list_file);
        var ext = '.json';
        var dir = 'mangafox_json';
        var tasks = [];
        console.log(manga_urls);
        var promise = new Promise(function (resolve) {
            manga_urls.forEach( function(manga_url) {
                var file = path.join(dir, ms.getMangaNameFromUrl(manga_url) + ext); // eg. shingeki_no_kyojin.json

                if (!fs.existsSync(file)) {
                    tasks.push(manga_url);
                }

            });
            resolve(tasks);
        });

        promise.then(function (tasks) {
            console.log(tasks);
        });

    } catch (err) {
        console.log(err);
    }
}

function getMangaJson(manga_url) {
    var dry = false;
    if (opts['dry']) dry = opts['dry'];

    console.log('Downloading ' + manga_url + ' JSON...');
    console.time('download json' + manga_url);
    var mfs = new ms.MangaFoxScraper();
    var promise = mfs.getChapterUrlsPromise(manga_url);

    // STEP 1:
    promise.then( function(urls_titles) {

        var urls = urls_titles['urls'];
        var titles = urls_titles['titles'];

        //Debug
        //console.log(urls);
        //console.log(titles);

        urls = urls.sort(); // Sort urls before processing.
        titles = titles.reverse(); // Reverse titles to match sorted urls.

        var promises = [];

        urls.forEach(function (url) {
            promises.push(mfs.getPageNumbersPromise(url));
        });

        return [urls, titles, promises]; // Passed down.

    })// STEP 2:
    .spread( function (urls, titles, promises) {

        var chapter_urls = urls;
        var temp_page_urls = [];
        var chapter_page_urls = [];

        return Promise.all(promises).then( function (page_numbers) { // Passed Down.
            if (urls.length === page_numbers.length) {
                for (var i = 0; i < page_numbers.length; i++) {
                    // Old
                    var url = new URI(urls[i]); // ==> 'http://mangafox.me/manga/azure_dream/v01/c001/1.html' ...

                    // Set chapter urls.
                    temp_page_urls.push(path.dirname(url.toString()) + '/') // ==> ... http://mangafox.me/manga/azure_dream/v01/c007/ ...
                }
            } else {
                var message = 'chapter_urls and chapter_page_numbers length not equal for this manga.';
                throw new mfs.ChaptersPagesNotEqualException(message, urls);
            }

            var ext = '.html';
            for (i = 0; i < temp_page_urls.length; i++) { // chapter_urls.length == page_numbers.length.
                var chapter_pages = []
                for (var j = 0; j < page_numbers[i].length; j++) {
                    chapter_pages.push(temp_page_urls[i] + page_numbers[i][j] + ext); // ==> http://mangafox.me/manga/azure_dream/v01/c001/1.html .. 2.html .. 3.html ..
                }
                chapter_page_urls.push(chapter_pages);
            }
        }).then( function() {
            //Debug
            //console.log(chapter_urls);
            //console.log(chapter_page_urls);

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

                promises.push(mfs.getImageUrlPromise(chapter_page_urls[i][j], opts));

            }
        }

        return Promise.settle(promises).then( function (image_urls) {
            var chapter_image_urls = [];

            // rejections['_settledValue']['volume']
            // rejections['_settledValue']['chapter']
            // rejections['_settledValue']['chapter_array_aligned']
            // rejections['_settledValue']['page']
            // rejections['_settledValue']['page_array_aligned']
            // rejections['_settledValue']['url']
            var rejections = image_urls.filter(function(el){ return el.isRejected(); });

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

            // Debug
            //console.log('Rejections:');
            //console.log(rejections);
            //console.log('image_urls:');
            //console.log(image_urls);
            console.log('chapter_image_urls:');
            console.log(chapter_image_urls);

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
            promises.push(mfs.getImageUrlPromise(url, opts));
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
            console.log('Mangafox Object:');
            console.log(mangafox);
            console.timeEnd('download json' + manga_url);

            if (dry) {
                console.log('Dry run. JSON not saved');
            } else {
                // Save file.
                ms.saveMangaAsJson(mangafox, 'mangafox_json');
            }

        });

    }).catch(function (err) {
        console.log(err.message);
        console.log(err);
    });
}

/**
 *
 * @param json_file
 * @param opts
 */
function updateMangaJson(json_file, opts) {
    console.log('Updating ' + manga_url + ' JSON,,,');
    var dry = false;
    if (opts['dry']) var dry = opts['dry'];

    var mfs = new ms.MangaFoxScraper();
    var manga_json = loadJSON(json_file);
    var manga_url = manga_json['manga_url'];
    var chapter_urls_promise = mfs.getChapterUrlsPromise(manga_json['manga_url']);

    console.time('update json' + manga_url);

    chapter_urls_promise.then( function(titles_chapter_urls) {
        var manga_name = json_file['manga_name'];
        var old_chapters_urls = manga_json['chapter_urls'].sort();
        var new_chapters_urls = titles_chapter_urls['urls'].sort(); // caseInsensitive to true.
        var titles = titles_chapter_urls['titles'];
        var new_titles = [];
        var promises = [];
        // Update chapter_urls
        manga_json['chapter_urls'] = new_chapters_urls;

        var update_chapters = getNonDuplicates(old_chapters_urls, new_chapters_urls);

        if (!update_chapters) {
            var message = 'No chapters to update for ' + json_file ;
            throw new NoChaptersToUpdateException(message, [json_file]);
        }
        manga_json['chapter_urls'] = new_chapters_urls;

        if (titles.length != new_chapters_urls.length) {
            var message = 'New Chapters and titles length are not equal. Something may have happened with the web requests.';
            throw new ms.ChaptersTitlesLengthNotEqual(message, [new_chapters_urls, titles]);
        }

        var title_url = {};
        for (var i = 0; i < titles.length; i++) {
            title_url[new_chapters_urls[i]] = titles[i];
        }
        for (i = 0; i < update_chapters.length; i++) {
            new_titles.push(title_url[update_chapters[i]]);
        }
        // Debug
        //console.log(old_chapters_urls);
        //console.log(new_chapters_urls);
        //console.log(titles);
        //console.log(new_titles);
        //console.log(manga_json);

        update_chapters.forEach(function(url) {
            promises.push(mfs.getPageNumbersPromise(url));
        });

        return Promise.all(promises).then( function(page_numbers) {
            var chapter_page_urls = [];
            var temp_page_urls = [];

            if (update_chapters.length === page_numbers.length) {
                for (var i = 0; i < page_numbers.length; i++) {
                    // Old
                    var url = new URI(update_chapters[i]); // ==> 'http://mangafox.me/manga/azure_dream/v01/c001/1.html' ...

                    // Set chapter urls.
                    temp_page_urls.push(path.dirname(url.toString()) + '/') // ==> ... http://mangafox.me/manga/azure_dream/v01/c007/ ...
                }
            } else {
                var message = 'chapter_urls and chapter_page_numbers length not equal for this manga.';
                var args = {'update_chapters': update_chapters};
                throw new ms.ChaptersPagesNotEqualException(message, args);
            }
            var ext = '.html';
            for (i = 0; i < temp_page_urls.length; i++) { // chapter_urls.length == page_numbers.length.
                var chapter_pages = [];
                for (var j = 0; j < page_numbers[i].length; j++) {
                    chapter_pages.push(temp_page_urls[i] + page_numbers[i][j] + ext); // ==> http://mangafox.me/manga/azure_dream/v01/c001/1.html .. 2.html .. 3.html ..
                }
                chapter_page_urls.push(chapter_pages);
            }

            return [update_chapters, chapter_page_urls, new_titles]; // Passed down.

        })
    })
    .spread( function( chapter_urls, chapter_page_urls, titles) {
        var promises = [];

        //Debug
        //console.log(chapter_urls);
        //console.log(chapter_page_urls);
        //console.log(titles);

        // Gather promises for image downloads that failed previously.
        for (var i = 0; i < chapter_page_urls.length; i++) {
            var chapter = ms.getChapterFromUrl(chapter_page_urls[i][0]);
            var volume = ms.getVolumeFromUrl(chapter_page_urls[i][0]);
            for (var j = 0; j < chapter_page_urls[i].length; j++) {
                var opts = {'volume': volume, 'chapter': chapter, 'chapter_array_aligned': i,
                    'page': (j+1), 'page_array_aligned': (j)};

                promises.push(mfs.getImageUrlPromise(chapter_page_urls[i][j], opts));

            }
        }

        return Promise.settle(promises).then( function (image_urls) {
            var chapter_image_urls = [];
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
            //console.log('image_urls:');
            //console.log(image_urls);

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
            return [chapter_urls, chapter_page_urls, chapter_image_urls, rejections, titles];
        });

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

            promises.push(mfs.getImageUrlPromise(url, opts));
        }

        // Retry downloading failed downloads.
        Promise.all(promises).then(function (rejected_images) {

            //Debug
            //console.log(chapter_urls);
            //console.log(chapter_page_urls);
            //console.log(chapter_image_urls);
            //console.log(rejections);
            //console.log(titles);

            // Debug
            //console.log('rejected_images: ');
            //console.log(rejected_images);

            // Debug.
            //console.log('chapter_urls: ' + chapter_urls.length);
            //console.log('chapter_image_urls: ' + chapter_image_urls.length);
            //console.log('titles: ' + titles.length);
            //console.log(chapter_image_urls);
            if (titles.length != chapter_urls.length) {
                var message = 'Chapters and titles length are not equal. Something may have happened with the web requests.';
                throw new ChaptersTitlesLengthNotEqual(message, [chapter_urls, titles, chapter_image_urls]);
            }

            // Set volumes and chapters for each src url.
            for (var i = 0; i < (chapter_image_urls.length); i++) {
                if ( manga_json['volumes'][ms.getVolumeFromUrl(chapter_urls[i])] != null ) { // Add volume to chapter.
                    manga_json['volumes'][ms.getVolumeFromUrl(chapter_urls[i])][ms.getChapterFromUrl(chapter_urls[i])] = {'title': titles[i], 'img': chapter_image_urls[i]};
                } else { // Initialize the volume.
                    manga_json['volumes'][ms.getVolumeFromUrl(chapter_urls[i])] = {};
                    manga_json['volumes'][ms.getVolumeFromUrl(chapter_urls[i])][ms.getChapterFromUrl(chapter_urls[i])] = {'title': titles[i], 'img': chapter_image_urls[i]};
                }
            }

            manga_json['volumes']['length'] = ms.count(manga_json['volumes']-1); // -1 because of length

            // Add the missing/failed pages.
            // mangafox['volumes']['volume']['chapter']['img'][i]
            for (i = 0; i < rejected_images.length; i++) {
                var volume = rejected_images[i]['volume'];
                var chapter = rejected_images[i]['chapter'];
                var page = rejected_images[i]['page_array_aligned'];
                //mangafox.volumes.volume.chapter.img[i] = src
                manga_json['volumes'][volume][chapter]['img'][page] = rejected_images[i]['src'];
            }

            // Debug.
            console.log('manga_json: ');
            console.log(manga_json);
            console.time('update json' + manga_url);

            // Save file.
            if (dry) {
                console.log('Dry run. JSON not saved');
            } else {
                saveFile(json_file, manga_json);
            }

        });

    })
    .catch(function (err) {
        console.log(err.message);
        console.log(err);
    });

    function loadJSON(json_file) {
        try {
            // Default encoding is utf8.
            if (typeof (encoding) == 'undefined') { encoding = 'utf8'; }

            // Read file synchronously.
            var contents = fs.readFileSync(json_file, encoding);

            // Parse contents as JSON,
            return JSON.parse(contents);

        } catch (err) {
            throw err;
        }
    }

    /**
     * Save data as JSON.
     *
     * @param file
     * @param directory
     */
    function saveFile(file_name, data) {
        try {
            // Debug
            console.log('Saving JSON file... ' + file_name);
            console.log(data);
            jsonfile.writeFileSync(file_name, data);

        }
        catch (err) {
            console.log(err);
        }
    }

    /**
     * input [1,2,3], [1,2,3,4,5,6]
     * output [4,5,6]
     *
     * Get the non duplicates between an old array and an updated array of the old array.
     * Arrays must be sorted and be the same up to the the second array[first_array.length].
     *
     * Returns false if the arrays length match.
     *
     * @param array1
     * @param array2
     * @returns *
     */
    function getNonDuplicates(array1, array2) {
        var new_items = [];
        if (array1.length == array2.length) {

            return false;
        } else {
            try {
                if (array2.length > array1.length) {

                    for (var i = 0, j = 0; i < array2.length; i++) {
                        if (array1[j]) {
                            if (array1[j] != array2[i]) {
                                new_items.push(array2[i]);
                            }
                            j++;
                        } else {
                            new_items.push(array2[i]);
                        }
                    }
                    return new_items;
                } else {
                    var args = {'array1_length': array1.length, 'array2_length': array2.length};

                    throw new ms.Array2LenMustBeGreaterException('array2 must have greater length than array1.', args);
                }
            } catch(err) {
                console.log(err);
            }
        }
    }
}

/*
 Exceptions
 */
function NoChaptersToUpdateException(message, args) {
    this.args = args;
    this.message = message;
    this.name = 'NoChaptersToUpdateException';
}
