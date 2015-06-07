var nomo = require('node-monkey').start();

//http://mangafox.me/ajax/search.php?term=as
//curl "http://mangafox.me/ajax/series.php" -H "Cookie: mfsid=5h862gaebe5pmihi8f2lna0c25; mfvb_sessionhash=e8525e9c84106cb878722923a7b44ba8; __utmt=1; __unam=657356c-14d976fbc8e-601992af-127; mfvb_lastvisit=1432764724; __utma=18273573.497484044.1432764723.1432937761.1432940951.5; __utmb=18273573.4.10.1432940951; __utmc=18273573; __utmz=18273573.1432937761.4.4.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not"%"20provided)" -H "Origin: http://mangafox.me" -H "Accept-Encoding: gzip, deflate" -H "Accept-Language: en-US,en;q=0.8" -H "User-Agent: Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36" -H "Content-Type: application/x-www-form-urlencoded" -H "Accept: application/json, text/javascript, */*; q=0.01" -H "Referer: http://mangafox.me/manga/" -H "X-Requested-With: XMLHttpRequest" -H "Connection: keep-alive" --data "sid=12988" --compressed

// Manga directory with every manga.

var cheerio = require('cheerio');
var Promise = require('bluebird');
var request = Promise.promisify(require("request"));
var URI = require('URIjs');
var path = require('path');

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
 * @constructor
 */
var MangaFoxScraper = function() {};

MangaFoxScraper.prototype = {};

MangaFoxScraper.prototype = Object.create(MangaFoxScraper.prototype);

/**
 * input: 'http://mangafox.me/manga/gto_paradise_lost/'
 * output:
 *
 * @param mangafox_url
 */
MangaFoxScraper.prototype.getMangaNameFromUrl = function(mangafox_url) {
    var url = URI(mangafox_url);
    //console.log(url.pathname().split("/"));
    return url.pathname().split("/")[2];
};

/**
 * input: http://mangafox.me/manga/owari_no_seraph/v01/c001/
 * output:
 *
 * @param mangafox_url
 * @returns {*}
 */
MangaFoxScraper.prototype.getVolumeFromUrl = function(mangafox_url) {
    var url = URI(mangafox_url);
    //console.log(url.pathname().split("/"));
    if (url.pathname().split("/").length < 6) {
        return "v" + pad(0, 2);
    } else { //>= 6
        return url.pathname().split("/")[3]
    }
};

/**
 * input: http://mangafox.me/manga/owari_no_seraph/v01/c001/
 * output:
 *
 * @param mangafox_url
 * @returns {*}
 */
MangaFoxScraper.prototype.getChapterFromUrl = function(mangafox_url) {
    var url = URI(mangafox_url);
    //console.log(url.pathname().split("/"));
    if (url.pathname().split("/").length < 6) {
        return url.pathname().split("/")[3]
    } else { //>= 6
        return url.pathname().split("/")[4]
    }
};



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

MangaFoxScraper.prototype.getMangaIndexUrlsPromise = function() {
    var mangafox_index_url = "http://mangafox.me/manga/";

    var alpha_list =
        [
            //"#idx_\\#",
            "#idx_a",
            "#idx_b",
            "#idx_c",
            "#idx_d",
            "#idx_e",
            "#idx_f",
            "#idx_g",
            "#idx_h",
            "#idx_i",
            "#idx_j",
            "#idx_k",
            "#idx_l",
            "#idx_m",
            "#idx_n",
            "#idx_o",
            "#idx_p",
            "#idx_q",
            "#idx_r",
            "#idx_s",
            "#idx_t",
            "#idx_u",
            "#idx_v",
            "#idx_w",
            "#idx_x",
            "#idx_y",
            "#idx_z"
        ];

    var alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

    return new Promise(function (resolve, reject) {
        var execute = function(error, response, html) {
            var urls = {};
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);

                for (var i = 0; i < alpha_list.length; i++) {
                    var index = [];
                    var selector = alpha_list[i] + " li a"; // "#idx_a li a" ... "#idx_c li a" ...
                    //console.log(selector);
                    $(selector).each(function(i, elem) {
                        index.push($(this).attr("href"))
                    });
                    urls[alphabet[i]] = index;
                }
                //$("#idx_a li a").each(function(i, elem) {
                //    urls.push($(this).attr('href'))
                //});
                urls["length"] = count(urls);
                resolve(urls);
            } else {
                reject(error);
            }
        };

        request(mangafox_index_url, execute).catch(function(err) {
            console.log(err);
        });
    });

    function count(obj) {
        var count=0;
        for(var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                ++count;
            }
        }
        return count;
    }
}

//request('http://mangafox.me/manga/', function (error, response, html) {
//    var urls = [];
//    if (!error && response.statusCode == 200) {
//        var $ = cheerio.load(html);
//
//        $("#idx_a li a").each(function(i, elem) {
//            urls.push($(this).attr('href'))
//        });
//        return urls;
//    }
//});

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
 *
 * @callback [urls, titles];
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
                            titles.push($(this).siblings(".title.nowrap").text());
                        } else {
                            titles.push("");
                        }
                    });

                    resolve([urls, titles]);
                } else {
                    reject(error);
                }
            };

            request(mangafox_url, execute).catch(function(err) {
                console.log(err);
            });
    });

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
    return new Promise(function(resolve, reject) {
        var execute = function(error, response, html) {
            var page_numbers = [];
            var temp_numbers = [];
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);

                $(".m option").each(function(i, elem) {
                    temp_numbers.push($(this).attr('value'))
                });

                // Mangafox lists page numbers twitch on the top and bottom of image.
                // You need to cut it in half and subtract by firstPromise taking into account comments page.
                for (var i = 0; i < (temp_numbers.length/2-1); i++) { // -1 for the comments page.
                    page_numbers.push(temp_numbers[i]);
                }

                resolve(page_numbers);

            } else {
                reject(error);
            }
        };

        request(mangafox_chapter_url, execute).catch(function(err) {
                console.log(err);
        });
    });
}

/**
 * input: 'http://mangafox.me/manga/azure_dream/v01/c007/1.html' ...
 * output: http://a.mfcdn.net/store/manga/5716/01-001.0/compressed/ha_lapis_lazuli_blue_dream_01.jpg ...
 *
 * @param mangafox_chapter_page_url
 */
MangaFoxScraper.prototype.getImageUrlPromise= function(mangafox_chapter_page_url) {
    return new Promise(function(resolve, reject) {
        // Debug.
        //resolve(mangafox_chapter_page_url);
        // Production.
        var execute = function (error, response, html) {
            var image_url = null;
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);

                image_url = $("#image").attr('src');

            } else {
                reject(error);
            }

            resolve(image_url);
        };

        request(mangafox_chapter_page_url, execute).catch(function(err) {
            console.log(err);
        });
    });

}

/*
http://a.mfcdn.net/store/manga/5716/01-001.0/compressed/ha_lapis_lazuli_blue_dream_03.jpg
http://a.mfcdn.net/store/manga/5716/01-001.0/compressed/ha_lapis_lazuli_blue_dream_04.jpg
...
http://a.mfcdn.net/store/manga/5716/01-004.0/compressed/ilililicious.jpg
http://a.mfcdn.net/store/manga/5716/01-004.0/compressed/inostalgia_01.jpg
*/
var mangaFoxScraper = new MangaFoxScraper();

//var manga_url = "http://mangafox.me/manga/azure_dream/";
//var manga_url = "http://mangafox.me/manga/hack_link/";
//var manga_url = "http://mangafox.me/manga/macchi_shoujo/"; // Works.
//var manga_url = "http://mangafox.me/manga/gto_paradise_lost/";
var manga_url = "http://mangafox.me/manga/owari_no_seraph/";
//var manga_url = "http://mangafox.me/manga/naruto/";
firstPromise = mangaFoxScraper.getChapterUrlsPromise(manga_url);

//test = mangaFoxScraper.getMangaIndexUrlsPromise();

//test.then( function(test) {
//    console.log(test);
//});

// STEP 1:
firstPromise.then( function(urls_titles) {

    console.time("mangafox");

    var urls = urls_titles[0];
    var titles = urls_titles[1];

    urls = urls.sort(); // Sort urls before processing.
    titles = titles.reverse(); // Reverse titles to match sorted urls.

    var promises = [];

    urls.forEach(function (url) {
        promises.push(mangaFoxScraper.getPageNumbersPromise(url));
    });

    return [urls, titles, promises]; // Passed down.

})
.spread( function (urls, titles, promises) {
    // These need to be filled.
    var chapter_urls = [];
    var chapter_page_urls = [];

    return Promise.all(promises).then( function (page_numbers) { // Passed Down.
        if (urls.length == page_numbers.length) {
            for (var i = 0; i < page_numbers.length; i++) {
                var url = new URI(urls[i]); // ==> "http://mangafox.me/manga/azure_dream/v01/c001/1.html" ...

                // Set chapter urls.
                chapter_urls.push(path.dirname(url.toString()) + "/") // ==> http://mangafox.me/manga/azure_dream/v01/c007/ ...
            }
        } else {
            throw new ChaptersPagesNotEqualException("chapter_urls and chapter_page_numbers length not equal for this manga.", urls);
        }

        var ext = ".html";
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

    for (var i = 0; i < chapter_page_urls.length; i++) {
        for (var j = 0; j < chapter_page_urls[i].length; j++) {
            promises.push(mangaFoxScraper.getImageUrlPromise(chapter_page_urls[i][j]).delay(200)); // int ms.
        }
    }

    return Promise.all(promises).then( function (image_urls) {
        var chapter_image_urls = [];

        // Initialize Arrays;
        for (i = 0; i < chapter_page_urls.length; i++) {
            chapter_image_urls[i] = [];
        }

        for (var chapter_count = 0, page_count = 0, i = 0; i < image_urls.length; i++) {

            chapter_image_urls[chapter_count].push(image_urls[i]);

            if (page_count == chapter_page_urls[chapter_count].length - 1)  {
                // Go to the next chapter.
                chapter_count++;
                // Reset our page counter.
                page_count = 0;
            } else {
                page_count++
            }
        }


        return [chapter_urls, chapter_page_urls, chapter_image_urls, titles]
    })

})
.spread( function(chapter_urls, chapter_page_urls, chapter_image_urls, titles) {
    var mangafox = new MangaFox(mangaFoxScraper.getMangaNameFromUrl(manga_url), chapter_urls, chapter_image_urls, titles);
    // Debug.
    console.log(mangafox);
    console.timeEnd("mangafox");

});

function MangaFox(manga_name, chapter_urls, chapter_image_urls, titles) {
    this.manga_name = manga_name;
    this.chapter_urls = chapter_urls;
    this.volumes = {};
    this.filename = this.manga_name + ".json";

    try {
        // Debug.
        //console.log("chapter_urls: " + chapter_urls.length);
        //console.log("chapter_image_urls: " + chapter_image_urls.length);
        //console.log("titles: " + titles.length);
        if (titles.length != chapter_urls.length) {
            var message = "Chapters and titles length are not equal. Something may have happened with the web requests.";
            throw new ChaptersTitlesLengthNotEqual(message, [chapter_urls, titles, chapter_image_urls]);
        }

        for (var i = 0; i < (chapter_image_urls.length); i++) {
            if ( this.volumes[mangaFoxScraper.getVolumeFromUrl(chapter_urls[i])] != null ) { // Add volume to chapter.
                this.volumes[mangaFoxScraper.getVolumeFromUrl(chapter_urls[i])][mangaFoxScraper.getChapterFromUrl(chapter_urls[i])] = {"title": titles[i], "img": chapter_image_urls[i]};
            } else { // Initialize the volume.
                this.volumes[mangaFoxScraper.getVolumeFromUrl(chapter_urls[i])] = {};
                this.volumes[mangaFoxScraper.getVolumeFromUrl(chapter_urls[i])][mangaFoxScraper.getChapterFromUrl(chapter_urls[i])] = {"title": titles[i], "img": chapter_image_urls[i]};
            }
        }

        this.volumes.length = count(this.volumes);
    } catch (err) {
        console.log(err);
        return;
    }

    function count(obj) {
        var count=0;
        for(var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                ++count;
            }
        }
        return count;
    }
}

/*
Exceptions
*/
function ChaptersPagesNotEqualException(message, args) {
    this.args = args;
    this.message = message;
    this.name = "ChaptersPagesNotEqualException";
}

function ParametersNullException(message, args) {
    this.args = args;
    this.message = message;
    this.name = "ParametersNullException";
}

function ChaptersTitlesLengthNotEqual(message, args) {
    this.args = args;
    this.message = message;
    this.name = "ChaptersTitlesLengthNotEqual";
}