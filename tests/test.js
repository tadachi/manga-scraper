var manga_scraper = require('../lib/manga-scraper.js');

exports.testPad = function(test) {
    var str1 = manga_scraper.pad(2,3);
    var str2 = manga_scraper.pad(13,4);
    var str3 = manga_scraper.pad(114,2);
    var str4 = manga_scraper.pad(2,1);
    var str5 = manga_scraper.pad(2,0);
    var str6 = manga_scraper.pad(2,-1);
    var str7 = manga_scraper.pad(2,-2);
    var str8 = manga_scraper.pad(2,-3);

    test.equals(str1, '002');
    test.equals(str2, '0013');
    test.equals(str3, '14');
    test.equals(str4, '2');
    test.equals(str5, '0002');
    test.equals(str6, '002');
    test.equals(str7, '02');
    test.equals(str8, '2');
    test.done();
};

exports.testCount = function(test) {
    var json = {
        "manga_name": "macchi_shoujo",
        "chapter_urls": [
            "http://mangafox.me/manga/macchi_shoujo/v01/c000/",
            "http://mangafox.me/manga/macchi_shoujo/v01/c001/"
        ],
        "filename": "macchi_shoujo.json"
    }

    test.equals(manga_scraper.count(json), 3);

    test.done();
};