/**
 * manga-downloader.js
 */

// Debug in chrome. Disable in production.
//var nomo = require('node-monkey').start();

var exports = module.exports;
var fs = require('fs');
var request = require('request');
var async = require('async');

var url = require('url');
var path = require('path');

var mf = require('./manga-file');

/**
 * @constructor
 */
const MB = 1048576; //1048576 - bytes in  1 Megabyte.

exports.downloadManga = downloadManga;
exports.MB = MB;

/**
 * Input: manga_json
 *
 * Downloads all volumes of a manga using json built with a scraper.
 * Saves it into a directory called manga.
 *
 * @param manga_json
 * @param opts
 * @param callback
 */
function downloadManga(manga_json, opts, callback) {

    // manga_json['volumes']['v00']['c000']['img']
    // manga_json['volumes']['v00']['c000']['title']
    var manga_json = loadJSON(manga_json);
    var manga_name = manga_json['manga_name']; // 'owari_no_seraph'
    var manga_url = manga_json['manga_url']; // 'http://www.mangafox.me/owari_no_seraph
    var parallel = false;
    var parallel_limit = 2;

    //if (opts['parallel']) parallel = opts['parallel'];
    //if (opts['parallel_limit']) parallel_limit = opts['parallel_limit'];

    var dir = path.join('manga',manga_name);
    //console.log(dir); // manga/owari_no_seraph

    mf.makeDir(dir);

    var success = '';
    var volume_dir = '';
    var chapter_dir = '';
    var title = '';
    var image_urls = '';
    var file_name = '';
    var asyncDownloadTasks = [];

    console.log('Downloading + ' + manga_url + ' Images...');

    for (var volume in manga_json['volumes']) {
        if (volume != 'length') {
            volume_dir = path.join(dir, volume); // manga/owari_no_seraph/v00 ... manga/owari_no_seraph/v01 ...
            success = mf.makeDir(volume_dir);
            if (success) {
                //console.log("  " + volume_dir); // Debug.
                for (var chapter in manga_json['volumes'][volume]) {
                    chapter_dir = path.join(volume_dir, chapter); // manga/owari_no_seraph/v00/c000 ... manga/owari_no_seraph/v01/c001 ...
                    title = manga_json['volumes'][volume][chapter]['title'];
                    image_urls = manga_json['volumes'][volume][chapter]['img'];
                    if (mf.makeDir(chapter_dir)) {
                        //console.log("  " + "  " + chapter_dir); // Debug.
                        var i = 1;
                        image_urls.forEach(function(image_url) {
                            file_name = path.join(chapter_dir, pad(i,3)) + '.jpg';
                            i++;
                            //console.log("  " + "  " + "  " + file_name); // Debug
                            //console.log("  " + "  " + "  " + image_url); // Debug

                            (function(img_url, f_name) { // Closure to pass data down to async array.
                                asyncDownloadTasks.push(
                                    function(callback) {
                                        download(img_url, f_name, function(data) {
                                            callback(null, data);
                                        })
                                    }
                                );
                            })(image_url, file_name);
                        })
                    }
                }
            }
        }
    }

    console.time(manga_url);

    if (parallel) {
        async.parallel(asyncDownloadTasks, parallel_limit, function(err, results) {
            console.log('Errors:');
            console.log(err);
            console.log('Results:');
            console.log(results);
            console.timeEnd(manga_url);
            callback(true);
        });
    } else {
        console.log('Downloading via async.series...');
        async.series(asyncDownloadTasks, function(err, results) {
            console.log('Errors:');
            console.log(err);
            console.log('Results:');
            console.log(results);
            console.timeEnd(manga_url);
            callback(true);
        });
    }

    function download(url, file_name, callback){
        var message = '';

        var options = {
            method: 'GET',
            uri: url,
            gzip: false
        };

        var cur = 0;
        var len = 0;

        var data = {};
        data['code'] = '';
        data['url'] = url;
        data['file_name'] = file_name;
        data['error'] = '';
        data['size'] = '';

        // Check if file exists.
        try {
            fs.exists(file_name, function(exists) {
                if (!exists) { // If there's no such file, download it.
                    // Download file.
                    request(options, function (error, response, body) {
                    })
                        .on('error', function(err) {
                            data['file_name'] = file_name;
                            data['code'] = 'ERROR';
                            data['error'] = err;
                            data['size'] = cur;
                            console.log(data); // Debug
                            //throw new DownloadException('There was an error downloading file.', data);
                        })
                        .on('response', function(response) {
                            len = parseInt(response.headers['content-length'], 10);
                            response.on('data', function(chunk) {
                                cur += chunk.length;
                                // Send progress to client
                            })
                        })
                        .pipe(fs.createWriteStream(file_name))
                        .on('close', function() { // emitted by fs.createWriteStream
                            data['code'] = 'SUCCESS';
                            data['size'] = cur;
                            console.log(data['code']); // Debug
                            callback(data);
                        });
                } else {
                    data['code'] = 'EXISTS';
                    //console.log(data); // Debug
                    callback(data);
                }
            });
        } catch (err) {
            console.log(err);
            callback(data);
        }


    }

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
     *
     * @param num
     * @param digits
     * @returns {string}
     */
    function pad(num, digits) {
        return ('000' + num).substr(-digits);
    }

};

/*
 Exceptions
 */
function DownloadException(message, args) {
    this.args = args;
    this.message = message;
    this.name = 'DownloadException';
}