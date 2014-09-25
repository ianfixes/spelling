/*jslint plusplus: true */
'use strict';

module.exports = function (dictionary) {

    var dict = [],
        ALPHABETS = "abcdefghijklmnopqrstuvwxyz'".split(""),
        ETX = String.fromCharCode(3);   //End of Text Character


    function insert(word, rank) {

        var i,
            subDict = dict,
            letters;

        if (rank !== undefined && typeof rank !== 'number') {
            throw new TypeError('Word\'s rank must be a number');
        }

        if (word === undefined) {
            throw new TypeError('Word cannot be undefined');
        }

        word = word.toString().toLowerCase();

        letters = word.split('');

        for (i = 0; i < letters.length; i++) {

            if (!subDict[letters[i]]) {
                subDict[letters[i]] = {};
            }

            subDict = subDict[letters[i]];
        }

        //Store only the rank of the word.
        if (rank !== undefined) {
            subDict[ETX] = rank;
        } else {
            subDict[ETX] = (subDict[ETX]) ? subDict[ETX] + 1 : 1;
        }
    }


    function lookup(word, opts) {

        var i,
            letters,
            subDict = dict,
            result = {};

        opts = opts || {};

        if (opts.suggest === undefined) {
            opts.suggest = true;
        }

        word = word.toString().toLowerCase();

        //Ignore numbers
        if (!Number.isNaN(+word)) {
            return {found: true, word: word, rank: 0};
        }


        letters = word.split('');

        for (i = 0; i < letters.length && subDict; i++) {

            subDict = subDict[letters[i]];

        }

        result.found = (subDict && subDict[ETX]) ? true : false;
        result.word = word;

        if (result.found) {
            result.rank = subDict[ETX];
        } else if (opts.suggest) {
            result.suggestions = suggest(word, opts);
        }

        return result;
    }


    function remove(word) {

        if (lookup(word, {sugget: false}).found) {
            insert(word, 0);
        }
    }


    function edits(word) {

        var i,
            j,
            edit,
            results = [],
            opts = {suggest: false};

        //Deleting one letter
        for (i = 0; i < word.length; i++) {
            edit = (word.slice(0, i) + word.slice(i + 1));
            edit = lookup(edit, opts);
            if (edit.found) {
                results.push(edit);
            }
        }

        //Swaping letters
        for (i = 0; i < word.length - 1; i++) {
            edit = (word.slice(0, i) + word.slice(i + 1, i + 2) + word.slice(i, i + 1) + word.slice(i + 2));

            edit = lookup(edit, opts);
            if (edit.found) {
                results.push(edit);
            }
        }

        //Replacing one letter
        for (i = 0; i < word.length; i++) {

            for (j = 0; j < ALPHABETS.length; j++) {
                edit = (word.slice(0, i) + ALPHABETS[j] + word.slice(i + 1));
                edit = lookup(edit, opts);
                if (edit.found) {
                    results.push(edit);
                }
            }
        }

        //Inserting one letter
        for (i = 0; i <= word.length; i++) {

            for (j = 0; j < ALPHABETS.length; j++) {
                edit = (word.slice(0, i) + ALPHABETS[j] + word.slice(i));
                edit = lookup(edit, opts);
                if (edit.found) {
                    results.push(edit);
                }
            }
        }

        return results;
    }


    function equal(word) {
        return this.word === word.word;
    }


    function suggest(word, opts) {

        var i,
            suggestions = [],
            edit1 = [],
            edit2 = [],
            suggestionsLimit = opts.suggestionsLimit || 10;

        opts = opts || {};

        word = word.toString().toLowerCase();

        edit1 = edits(word);

        for (i = 0; i < edit1.length && edit1.length < suggestionsLimit; i++) {
            edit2 = edit2.concat(edits(edit1[i].word));
        }

        edit1 = edit1.sort(function (word1, word2) {
            return word2.rank - word1.rank;
        });

        edit2 = edit2.sort(function (word1, word2) {
            return word2.rank - word1.rank;
        });

        for (i = 0; i < edit1.length && suggestions.length < suggestionsLimit; i++) {
            if (!suggestions.some(equal, edit1[i])) {
                suggestions.push(edit1[i]);
            }
        }

        for (i = 0; i < edit2.length && suggestions.length < suggestionsLimit; i++) {
            if (!suggestions.some(equal, edit2[i])) {
                suggestions.push(edit2[i]);
            }
        }

        return suggestions;
    }


    function fetchWords(subDict, prefix) {

        var key,
            results = [];

        for (key in subDict) {

            if (subDict.hasOwnProperty(key) && subDict[key][ETX]) {
                results.push({word: prefix + key, rank: subDict[key][ETX]});
            }
        }

        return results;
    }


    function doSearch(prefix, opts) {

        var i,
            key,
            letters,
            subDict = dict,
            results = [];


        opts = opts || {};

        if (opts.depth === undefined) {
            opts.depth = 3;
        }


        if (!opts.depth) {
            return results;
        }

        prefix = prefix.toString().toLowerCase();

        letters = prefix.split('');

        for (i = 0; i < letters.length && subDict; i++) {
            subDict = subDict[letters[i]];
        }

        if (!subDict) {
            return results;
        }

        results = results.concat(fetchWords(subDict, prefix));

        for (key in subDict) {
            if (subDict.hasOwnProperty(key)) {
                results = results.concat(doSearch(prefix + key, {depth: opts.depth - 1}));
            }
        }

        return results;
    }


    function search(prefix, opts) {

        var results,
            word;

        results = doSearch(prefix, opts);

        word = lookup(prefix, {suggest: false});

        if (word.found) {
            results.push({word: prefix, rank: word.rank});
        }

        return results.sort(function (word1, word2) {return word2.rank - word1.rank; });

    }


    function build() {

        if (dictionary !== undefined && typeof dictionary === 'string') {
            var i,
                words = dictionary.split(' ');

            for (i = 0; i < words.length; i++) {
                insert(words[i], +words[++i]);
            }

            dictionary = '';
        }
    }

    build();

    return {

        insert: insert,
        lookup: lookup,
        remove: remove,
        search: search
    };

};
