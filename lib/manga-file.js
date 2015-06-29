var fs = require('fs');
var jsonfile = require('jsonfile');
var path = require('path');

exports.readMangaFile = readMangaFile;
exports.readMangaFileSync = readMangaFileSync;
exports.ReadFileException = ReadFileException;
exports.exists = exists;
exports.existsSync = existsSync;
exports.makeDir = makeDir;
exports.FileDoesNotExistException = FileDoesNotExistException;
exports.readJsonConfigFile = readJsonConfigFile;
exports.readJsonFilesInDirSync = readJsonFilesInDirSync;
exports.loadJSON = loadJSON;
exports.saveFileSync = saveFileSync;


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
 * readJsonFileSync
 */
function readJsonFilesInDirSync(directory) {
    var files = fs.readdirSync(directory);
    var json_files = [];
    if (files) {
        for (var i = 0; i < files.length; i++) {
            if (path.extname(files[i]) == '.json')
                json_files.push(files[i]);
        }
    }

    return json_files;
}

/**
 * Read JSON file. Synchronous
 */
function readJsonConfigFile(file_path) {
    var config_json = jsonfile.readFileSync(file_path);
    var error = {};
    if ( typeof(config_json['dry']) !== 'boolean')
        error['dry'] = {'value': config_json['dry'], 'type':typeof(config_json['dry']), 'expecting': 'boolean'};

    if ( typeof(config_json['JSON_only']) !== 'boolean')
        error['JSON_only'] = {'value': config_json['JSON_only'],
            'type':typeof(config_json['JSON_only']),
            'expecting': 'boolean'};

    if ( typeof(config_json['overwrite']) !== 'boolean')
        error['overwrite'] = {'value': config_json['overwrite'],
            'type':typeof(config_json['overwrite']),
            'expecting': 'boolean'};

    if ( typeof(config_json['json_directory']) !== 'string' )
        error['json_directory'] = {'value': config_json['json_directory'],
            'type':typeof(config_json['json_directory']),
            'expecting': 'string'};

    if ( typeof(config_json['manga_directory']) !== 'string' )
        error['manga_directory'] = {'value': config_json['manga_directory'],
            'type':typeof(config_json['manga_directory']),
            'expecting': 'string'};

    if ( typeof(config_json['manga_list_file']) !== 'string' )
        error['manga_list_file'] = {'value': config_json['manga_list_file'],
            'type':typeof(config_json['manga_list_file']),
            'expecting': 'string'};

    if ( typeof(config_json['timeout']) !== 'number' )
        error['timeout'] = {'value': config_json['timeout'],
            'type':typeof(config_json['timeout']),
            'expecting': 'number'};

    if ( typeof(config_json['promise_delay']) !== 'number' )
        error['promise_delay'] = {'value': config_json['promise_delay'],
            'type':typeof(config_json['promise_delay']),
            'expecting': 'number'};

    if ( typeof(config_json['parallel']) !== 'boolean' )
        error['parallel'] = {'value': config_json['promise_delay'],
            'type':typeof(config_json['parallel']),
            'expecting': 'boolean'};

    if ( typeof(config_json['parallel_limit']) !== 'number' )
        error['parallel_limit'] = {'value': config_json['parallel_limit'],
            'type':typeof(config_json['parallel_limit']),
            'expecting': 'number'};


    try {
        if (isEmpty(error)) {
            return config_json;
        } else {
            console.log(error);
            var message = file_path + ' is not a proper config file';
            throw new NotProperConfigFileException(message, error);
        }
    }
    catch (err) {
        console.log(err.message);
        console.log(err);
    }

    function isEmpty(obj) {
        return Object.keys(obj).length === 0;
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
 * @param file
 * @param callback
 * returns false or undefined
 */
function existsSync(file) {
    fs.accessSync(file, fs.R_OK);
}

/**
 * Make a directory
 *
 * @param path
 * @returns {boolean}
 */
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
 * Save data as JSON. Synchronous.
 *
 * @param file
 * @param directory
 */
function saveFileSync(file_name, data) {
    try {
        // Debug
        console.log('Saving JSON file... ' + file_name);
        jsonfile.writeFileSync(file_name, data);

    }
    catch (err) {
        console.log(err);
    }
}

/**
 * Load JSON in file to data in utf8.
 *
 * @param json_file
 * @returns {*}
 */
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

function NotProperConfigFileException(message, args) {
    this.args = args;
    this.message = message;
    this.name = 'NotProperConfigFileException';
}
