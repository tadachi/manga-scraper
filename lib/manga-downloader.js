/**
 * manga-downloader.js
 */

// Debug in chrome. Disable in production.
var nomo = require('node-monkey').start();

var exports = module.exports;
var http = require('http');
var fs = require('fs');
var Promise = require("bluebird");
var request = require('request');

var http = require('http');
var url = require('url');
var path = require('path');
/**
 * @constructor
 */
var MangaDownloader = function() {};

MangaDownloader.prototype = {};

MangaDownloader.prototype = Object.create(MangaDownloader.prototype);

MangaDownloader.prototype.downloadManga = function(manga_json) {
    manga_json = loadJSON(manga_json);
    var manga_name = manga_json['manga_name'];
    var manga_url = manga_json['manga_url'];
    // manga_json['volumes']['v00']['c000']['img']
    // manga_json['volumes']['v00']['c000']['title']

    var dir = path.join('manga',manga_name);
    console.log(dir);
    for (var volume in manga_json['volumes']) {
        var volume_dir = "";
        if (volume != 'length') {
            volume_dir = path.join(dir, volume); // manga/owari_no_seraph/v00 ... manga/owari_no_seraph/v01 ...
            var success = makeDir(volume_dir);
            if (success) {
                //console.log("  " + volume_dir); // Debug.
                for (var chapter in manga_json['volumes'][volume]) {

                    var chapter_dir = path.join(volume_dir, chapter); // manga/owari_no_seraph/v00/c000 ... manga/owari_no_seraph/v01/c001 ...
                    var title = manga_json['volumes'][volume][chapter]['title'];
                    var images = manga_json['volumes'][volume][chapter]['img'];
                    if (makeDir(chapter_dir)) {
                        //console.log("  " + "  " + chapter_dir); // Debug.
                        for (var i = 0; i < images.length; i++) {
                            var file = path.join(chapter_dir, pad(i,3)) + '.jpg';
                            console.log(" " + "  " + "  " + file);
                        }
                    }
                }
            }
        }
    }

    var url = 'http://a.mfcdn.net/store/manga/9011/00-000.0/compressed/v001.jpg';
    var file_name = 'manga/test/jpeg.jpg';

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

    function makeDir(path) {
        try {
            fs.mkdirSync(path);
            return true;
        } catch(e) {
            if ( e.code == 'EEXIST' ) {
                return true;
            } else {
                console.log(e);
                return false;
            }


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


};

MangaDownloader.prototype.makeDownloadPromise = function(url, file_name) {

    return new Promise(function(resolve, reject) {
        // Debug. Use this to prevent requests to mangafox for Debugging purposes only.
        //resolve(mangafox_chapter_page_url);
        // Production. Disable this if you are debugging outside of this function as this takes up alot of compute time.

    });

    function download(url, file_name, callback){
        var options = {
            method: 'GET',
            uri: url,
            gzip: false
        };

        var cur = 0;
        var len = 0;

        request(options, function (error, response, body) {
        })
        .on('response', function(response) {
            len = parseInt(response.headers['content-length'], 10);
            response.on('data', function(chunk) {
                cur += chunk.length;
                // Send progress to client
            })

        })
        .pipe(fs.createWriteStream(file_name))
        .on('close', callback);
    };
};

/**
 *
 * @param path
 * @return boolean
 */
MangaDownloader.prototype.makeDirectory = function(path) {
    // Make directory
    try {
        fs.mkdirSync(path);
        return true;
    } catch(e) {
        if ( e.code != 'EEXIST' ) {
            return true;
        } else {
            console.log(e);
            return false;
        }
    }
};

var MB = 1048576; //1048576 - bytes in  1 Megabyte.
var dir = 'manga/test';

var md = new MangaDownloader();

md.downloadManga('mangafox_json/owari_no_seraph.json');
