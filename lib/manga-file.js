fs = require('fs');

exports.readMangaFile = readMangaFile;
exports.readMangaFileSync = readMangaFileSync;
exports.ReadFileException = ReadFileException;
exports.exists = exists;
exports.existsSync = existsSync;
exports.FileDoesNotExistException = FileDoesNotExistException;

/*
Windows: \r\n
*nix: \n
* */
var EOL = require('os').EOL;

/**
 * Read EOL separated lines into an array asynchronously.
 *
 * @param file_path
 * @param callback
 */
function readMangaFile(file_path, callback) {
    try {
        fs.readFile(file_path, 'utf8', function (err, data) {

            if (err) {
                var message = 'There was an error in reading the file.';
                throw new ReadFileException(message, err);
            } else {
                var data = data.toString().split(EOL);
                callback(data);
            }
        });
    } catch (err) {
        console.log(err.message);
        console.log(err);
    }
}

/**
 * Read EOL separated lines into an array synchronously or with blocking.
 *
 * @param file_path
 * @param callback
 */
function readMangaFileSync(file_path, callback) {
    try {
        return fs.readFileSync(file_path, 'utf8').toString().split(EOL);
    } catch (err) {
        console.log(err);
    }
}



/**
 * Check if file exists. Uses fs.access not existsSync or exists.
 *
 * @param file
 * @param callback
 */
function exists(file, callback) {
    fs.access(file, fs.R_OK, function(err) {
        if (err) {
            callback(false);
        } else {
            callback(true);
        }
    });
}

/**
 * Check if file exists. Uses fs.access not existsSync or exists.
 *
 *
 * @param file
 * @param callback
 * returns false or undefined
 */
function existsSync(file) {
    fs.accessSync(file, fs.R_OK);
}

/*
 * Exceptions
 */

function ReadFileException(message, args) {
    this.args = args;
    this.message = message;
    this.name = 'ChaptersPagesNotEqualException';
}

function FileDoesNotExistException(message, args) {
    this.args = args;
    this.message = message;
    this.name = 'FileDoesNotExistException';
}
