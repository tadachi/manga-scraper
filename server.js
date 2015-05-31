//var nomo = require('node-monkey').start();

//http://mangafox.me/ajax/search.php?term=as
//curl "http://mangafox.me/ajax/series.php" -H "Cookie: mfsid=5h862gaebe5pmihi8f2lna0c25; mfvb_sessionhash=e8525e9c84106cb878722923a7b44ba8; __utmt=1; __unam=657356c-14d976fbc8e-601992af-127; mfvb_lastvisit=1432764724; __utma=18273573.497484044.1432764723.1432937761.1432940951.5; __utmb=18273573.4.10.1432940951; __utmc=18273573; __utmz=18273573.1432937761.4.4.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not"%"20provided)" -H "Origin: http://mangafox.me" -H "Accept-Encoding: gzip, deflate" -H "Accept-Language: en-US,en;q=0.8" -H "User-Agent: Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36" -H "Content-Type: application/x-www-form-urlencoded" -H "Accept: application/json, text/javascript, */*; q=0.01" -H "Referer: http://mangafox.me/manga/" -H "X-Requested-With: XMLHttpRequest" -H "Connection: keep-alive" --data "sid=12988" --compressed

// Manga directory with every manga.

var request = require('request');
var cheerio = require('cheerio');
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

//request('http://mangafox.me/manga/', function (error, response, html) {
//    if (!error && response.statusCode == 200) {
//        var $ = cheerio.load(html);
//
//        $('#idx_a li a').each(function(i, elem) {
//            console.log($(this).attr('href'));
//        });
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

request('http://mangafox.me/manga/hack_link/', function (error, response, html) {
    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);

        // Better method
        $('.tips').each(function(i, elem) {
            console.log($(this).attr('href'));
        });
    }
});

