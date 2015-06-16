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
var mkdirp = require('mkdirp');

var http = require('http');
var url = require('url');
/**
 * @constructor
 */
var MangaDownloader = function() {};

MangaDownloader.prototype = {};

MangaDownloader.prototype = Object.create(MangaDownloader.prototype);

var MB = 1048576; //1048576 - bytes in  1 Megabyte.

MangaDownloader.prototype.downloadManga = function(manga_json) {
    manga_json = loadJSON(manga_json);
    var manga_name = manga_json['manga_name'];
    var manga_url = manga_json['manga_url'];
    // manga_json['volumes']['v00']['c000']['img']
    // manga_json['volumes']['v00']['c000']['title']

    var dir = 'manga/test';

    // Make directory
    mkdirp(dir, function (err) {
        if (err) console.error(err)
        else console.log(dir + ' created.');
    });

    var url = 'http://a.mfcdn.net/store/manga/9011/00-000.0/compressed/v001.jpg';
    var file_name = 'manga/test/jpeg.jpg';

    download(url, file_name, function(){
        console.log('done');
    });

    function download(url, file_name, callback){
        var options = {
            method: 'GET',
            uri: url,
            gzip: false
        }

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

};

var md = new MangaDownloader();

md.downloadManga('mangafox_json/macchi_shoujo.json');