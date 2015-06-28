/**
 * manga-scraper.js
 */
var exports = module.exports;

// Debug in chrome. Disable in production.
//var nomo = require('node-monkey').start();

//http://mangafox.me/ajax/search.php?term=as
//curl 'http://mangafox.me/ajax/series.php' -H 'Cookie: mfsid=5h862gaebe5pmihi8f2lna0c25; mfvb_sessionhash=e8525e9c84106cb878722923a7b44ba8; __utmt=1; __unam=657356c-14d976fbc8e-601992af-127; mfvb_lastvisit=1432764724; __utma=18273573.497484044.1432764723.1432937761.1432940951.5; __utmb=18273573.4.10.1432940951; __utmc=18273573; __utmz=18273573.1432937761.4.4.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not'%'20provided)' -H 'Origin: http://mangafox.me' -H 'Accept-Encoding: gzip, deflate' -H 'Accept-Language: en-US,en;q=0.8' -H 'User-Agent: Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36' -H 'Content-Type: application/x-www-form-urlencoded' -H 'Accept: application/json, text/javascript, */*; q=0.01' -H 'Referer: http://mangafox.me/manga/' -H 'X-Requested-With: XMLHttpRequest' -H 'Connection: keep-alive' --data 'sid=12988' --compressed

var cheerio = require('cheerio');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var URI = require('URIjs');
var path = require('path');
var jsonfile = require('jsonfile');
var fs = require('fs');
var async = require('async');
var manga_file = require('./manga-file');

/**
 * @constructor
 */
var MangaFoxScraper = function() {};

MangaFoxScraper.prototype = {};

MangaFoxScraper.prototype = Object.create(MangaFoxScraper.prototype);

exports.count = count;
exports.pad = pad;
exports.MangaFoxScraper = MangaFoxScraper;
exports.MangaFox = MangaFox;
exports.getVolumeFromUrl = getVolumeFromUrl;
exports.getMangaNameFromUrl = getMangaNameFromUrl;
exports.getChapterFromUrl = getChapterFromUrl;
exports.saveMangaAsJson = saveMangaAsJson;


/**
 *
 * @param manga_url
 * @param chapter_urls
 * @param chapter_image_urls
 * @param titles
 * @constructor
 */
function MangaFox(manga_url, chapter_urls, chapter_image_urls, titles) {
    this.manga_name = getMangaNameFromUrl(manga_url);
    this.manga_url = manga_url;
    this.chapter_urls = chapter_urls;
    this.volumes = {};
    this.filename = this.manga_name + '.json';

    try {
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
            if ( this.volumes[getVolumeFromUrl(chapter_urls[i])] != null ) { // Add volume to chapter.
                this.volumes[getVolumeFromUrl(chapter_urls[i])][getChapterFromUrl(chapter_urls[i])] = {'title': titles[i], 'img': chapter_image_urls[i]};
            } else { // Initialize the volume.
                this.volumes[getVolumeFromUrl(chapter_urls[i])] = {};
                this.volumes[getVolumeFromUrl(chapter_urls[i])][getChapterFromUrl(chapter_urls[i])] = {'title': titles[i], 'img': chapter_image_urls[i]};
            }
        }

        this.volumes.length = count(this.volumes);
    } catch (err) {
        console.log(err);
        return;
    }

}

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

/**
 * input:
 * output: [directory of manga from Mangafox]
 *
 * @returns {bluebird promise}
 */
MangaFoxScraper.prototype.getMangaIndexUrlsPromise = function(url) {
    var mangafox_index_url = 'http://mangafox.me/manga/';

    if (url != null) { mangafox_index_url = url;}


    var alpha_list =
        [
            //'#idx_\\#',
            '#idx_a',
            '#idx_b',
            '#idx_c',
            '#idx_d',
            '#idx_e',
            '#idx_f',
            '#idx_g',
            '#idx_h',
            '#idx_i',
            '#idx_j',
            '#idx_k',
            '#idx_l',
            '#idx_m',
            '#idx_n',
            '#idx_o',
            '#idx_p',
            '#idx_q',
            '#idx_r',
            '#idx_s',
            '#idx_t',
            '#idx_u',
            '#idx_v',
            '#idx_w',
            '#idx_x',
            '#idx_y',
            '#idx_z'
        ];

    var alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

    return new Promise(function (resolve, reject) {
        var execute = function(error, response, html) {
            var urls = {};
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);

                for (var i = 0; i < alpha_list.length; i++) {
                    var index = [];
                    var selector = alpha_list[i] + ' li a'; // '#idx_a li a' ... '#idx_c li a' ...

                    $(selector).each(function(i, elem) {
                        index.push($(this).attr('href'))
                    });
                    urls[alphabet[i]] = index;
                }

                urls['length'] = count(urls);
                resolve(urls);
            } else {
                reject({'error': error, 'response': response});
            }
        };

        request(mangafox_index_url, execute).catch(function(err) {
            err['url'] = mangafox_index_url;
            console.log(err);
        });
    });

};


/**
 * input: 'http://mangafox.me/manga/azure_dream/v01/c007/'
 * output: promise with [urls, titles]
 *
 * @param mangafox_url
 *
 * @returns {bluebird promise}
 */
MangaFoxScraper.prototype.getChapterUrlsPromise = function(mangafox_url){
    return new Promise(function (resolve, reject) {
            var execute = function(error, response, html) {
                var urls = [];
                var titles = [];
                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(html);

                    $('.tips').each(function(i, elem) {
                        urls.push($(this).attr('href'))

                        if ($(this).siblings().length >= 1) {
                            titles.push($(this).siblings('.title.nowrap').text());
                        } else {
                            titles.push('');
                        }
                    });

                    resolve({'urls': urls, 'titles': titles});
                } else {
                    reject({'error': error, 'response': response});
                }
            };

            request(mangafox_url, execute).catch(function(err) {
                err['url'] = mangafox_url;
                console.log(err);
            });
    });

};

/**
 * input: 'http://mangafox.me/manga/azure_dream/v01/c007/'
 * output: promise with [page_numbers]
 *
 * @param mangafox_chapter_url
 * @returns {bluebird promise}
 */
MangaFoxScraper.prototype.getPageNumbersPromise = function(mangafox_chapter_url) {
    return new Promise(function(resolve, reject) {
        var execute = function(error, response, html) {
            var page_numbers = [];
            var temp_numbers = [];
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);

                $('.m option').each(function(i, elem) {
                    temp_numbers.push($(this).attr('value'))
                });

                // Mangafox lists page numbers twitch on the top and bottom of image.
                // You need to cut it in half and subtract by firstPromise taking into account comments page.
                for (var i = 0; i < (temp_numbers.length/2-1); i++) { // -1 for the comments page.
                    page_numbers.push(temp_numbers[i]);
                }

                resolve(page_numbers);

            } else {
                reject({'error': error, 'response': response});
            }
        };

        request(mangafox_chapter_url, execute).catch(function(err) {
            err['url'] = mangafox_chapter_url;
            console.log(err);
        });
    });
};

/**
 * input: 'http://mangafox.me/manga/azure_dream/v01/c007/1.html' ...
 * output: http://a.mfcdn.net/store/manga/5716/01-001.0/compressed/ha_lapis_lazuli_blue_dream_01.jpg ...
 *
 * @param mangafox_chapter_page_url
 *
 * @returns {bluebird promise}
 */
MangaFoxScraper.prototype.getImageUrlPromise= function(mangafox_chapter_page_url, opts) {

    var options = {
        'timeout': 10000 // 10 seconds
    }

    return new Promise(function(resolve, reject) {
        // Debug. Use this to prevent requests to mangafox for Debugging purposes only.
        //resolve(mangafox_chapter_page_url);
        // Production. Disable this if you are debugging outside of this function as this takes up alot of compute time.
        var execute = function (error, response, html) {
            var chapter = 0;
            var page = 0;
            var chapter_array_aligned = 0;
            var page_array_aligned = 0;
            var volume = 0;

            if (opts['volume']) { volume = opts['volume']; }
            if (opts['chapter']) { chapter = opts['chapter']; }
            if (opts['page']) { page = opts['page']; }
            if (opts['chapter_array_aligned']) { chapter_array_aligned = opts['chapter_array_aligned']; }
            if (opts['page_array_aligned']) { page_array_aligned = opts['page_array_aligned']; }

            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);
                var image_url = {'volume': volume, 'chapter': chapter, 'chapter_array_aligned': chapter_array_aligned,
                    'page': page, 'page_array_aligned': page_array_aligned,  'src': $('#image').attr('src')};
                console.log(image_url);
                resolve(image_url);
            } else {
                if (!error) {
                    var error = {}
                }
                error['volume'] = volume;
                error['url'] = mangafox_chapter_page_url;
                error['chapter'] = chapter;
                error['page'] = page;
                error['chapter_array_aligned'] = chapter_array_aligned;
                error['page_array_aligned'] = page_array_aligned;
                console.log(error);
                reject(error);
            }
        };



        request(mangafox_chapter_page_url, options, execute).catch(function(err) {
            err['url'] = mangafox_chapter_page_url;
            console.log(err);
        });
    });

};

/**
 * input: Mangafox Object, 'mangafox_json'
 * output: mangafox_json/manga_name.json with image references
 *
 * @param mangafox
 * @param directory
 */
function saveMangaAsJson(mangafox, directory, callback) {
    try {
        // Is it a existing directory?
        manga_file.exists(directory, function(exists) {
            if (exists) {
                var file = path.join(directory, mangafox['filename']);
                // Debug
                console.log('Saving JSON file... ' + file);
                jsonfile.writeFileSync(file, mangafox);
                callback(true);
            } else {
                var message = directory + ' does not exist.';
                throw new DirectoryDoesNotExistException(message, directory);
                callback(false);
            }
        });

    } catch (err) {
        callback(false);
        console.log(err);
    }

}

/**
 * input: 'http://mangafox.me/manga/gto_paradise_lost/'
 * output: gto_paradise_lost
 *
 * @param mangafox_url
 */
function getMangaNameFromUrl(mangafox_url) {
    var url = URI(mangafox_url);
    //console.log(url.pathname().split('/'));
    return url.pathname().split('/')[2];
}

/**
 * input: http://mangafox.me/manga/owari_no_seraph/v01/c001/
 * output: v01
 *
 * @param mangafox_url
 * @returns {*}
 */
function getVolumeFromUrl(mangafox_url) {
    var url = URI(mangafox_url);
    //console.log(url.pathname().split('/'));
    if (url.pathname().split('/').length < 6) {
        return 'v' + pad(0, 2);
    } else { //>= 6
        return url.pathname().split('/')[3]
    }
}

/**
 * input: http://mangafox.me/manga/owari_no_seraph/v01/c001/
 * output: c001
 *
 * @param mangafox_url
 * @returns {*}
 */
function getChapterFromUrl(mangafox_url) {
    var url = URI(mangafox_url);
    //console.log(url.pathname().split('/'));
    if (url.pathname().split('/').length < 6) {
        return url.pathname().split('/')[3]
    } else { //>= 6
        return url.pathname().split('/')[4]
    }
}

/**
 *
 * @param num
 * @param digits
 * @returns {string}
 */
function pad(num, digits) {
    return ('000' + num).substr(-digits);
}

/**
 *
 * @param obj
 * @returns {number}
 */
function count(obj) {
    var count=0;
    for(var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            ++count;
        }
    }
    return count;
}

exports.ChaptersPagesNotEqualException = ChaptersPagesNotEqualException;
exports.Array2LenMustBeGreaterException = Array2LenMustBeGreaterException;
exports.ChaptersTitlesLengthNotEqual = ChaptersTitlesLengthNotEqual;

/*
Exceptions
*/
function ChaptersPagesNotEqualException(message, args) {
    this.args = args;
    this.message = message;
    this.name = 'ChaptersPagesNotEqualException';
}

function ParametersNullException(message, args) {
    this.args = args;
    this.message = message;
    this.name = 'ParametersNullException';
}

function ChaptersTitlesLengthNotEqual(message, args) {
    this.args = args;
    this.message = message;
    this.name = 'ChaptersTitlesLengthNotEqual';
}

function ArraysDoNotMatch(message, args) {
    this.args = args;
    this.message = message;
    this.name = 'ChaptersTitlesLengthNotEqual';
}

function Array2LenMustBeGreaterException(message, args) {
    this.args = args;
    this.message = message;
    this.name = 'Array2LenMustBeGreaterException';
}

function DirectoryDoesNotExistException(message, args) {
    this.args = args;
    this.message = message;
    this.name = 'DirectoryDoesNotExistException';
}
