'use strict';

var fs = require('fs');

module.exports = function (filePath) {

    return (function (filePath) {

        var dict = [],
            ALPHABET = "abcdefghijklmnopqrstuvwxyz'".split(""),
            ETX = String.fromCharCode(3);   //End of Text Character

        function insert(word, rank) {

            if (rank !== void 0 && typeof rank !== 'number') {
                throw new TypeError('Word\'s rank must be a number');
            }

            if (word === void 0) {
                throw new TypeError('Word cannot be undefined');
            }

            word = word.toString().toLowerCase();

            var letters = word.split('');

            var subDict = dict;

            for(var i = 0; i < letters.length; i++) {

                if (!subDict[letters[i]]) {

                    subDict[letters[i]] = {};
                }

                subDict = subDict[letters[i]];
            }

            //Store only the rank of the word.
            if (rank !== void 0) {
                subDict[ETX] = rank;
            }else {
                subDict[ETX] = (subDict[ETX])? subDict[ETX] + 1 : 1;
            }
        }

        function remove(word) {

            if (lookup(word, {sugget: false}).found) {
                insert(word, 0);
            }
        }

        function lookup(word, opts) {

            opts = opts || {};

            var result = {};

            word = word.toString().toLowerCase();

            //Ignore numbers
            if (!Number.isNaN(+word)) {
                return {found: true, word: word};
            }

            var letters = word.split('');

            var subDict = dict;

            for(var i = 0; i < letters.length && subDict; i++) {

                subDict = subDict[letters[i]];

            }

            result.found = (subDict && subDict[ETX])? true : false;
            result.word = word;

            if (result.found) {
                result.rank = subDict[ETX];
            }else if (opts.suggest === void 0 || opts.suggest) {
                result.suggestions = suggest(word, opts);
            }

            return result;
        }

        function edits(word) {

            var i,
                j,
                edit,
                results = [],
                opts = {suggest: false};

            //Deleting one letter
            for (i=0; i < word.length; i++){
                edit = (word.slice(0, i) + word.slice(i+1));
                edit = lookup(edit, opts);
                if (edit.found) {
                    results.push(edit);
                }
            }

            //Swaping letters
            for (i=0; i < word.length-1; i++){
                edit = (word.slice(0, i) + word.slice(i+1, i+2) + word.slice(i, i+1) + word.slice(i+2));

                edit = lookup(edit, opts);
                if (edit.found) {
                    results.push(edit);
                }
            }

            //Replacing one letter
            for (i = 0; i < word.length; i++){

                for (j = 0; j < ALPHABET.length; j++) {
                    edit = (word.slice(0, i) + ALPHABET[j] + word.slice(i+1));
                    edit = lookup(edit, opts);
                    if (edit.found) {
                        results.push(edit);
                    }
                }
            }

            //Inserting one letter
            for (i = 0; i <= word.length; i++) {

                for (j = 0; j < ALPHABET.length; j++) {
                    edit = (word.slice(0, i) + ALPHABET[j] + word.slice(i));
                    edit = lookup(edit, opts);
                    if (edit.found) {
                        results.push(edit);
                    }
                }
            }

            return results;
        };


        function suggest(word, opts) {

            opts = opts || {};

            var suggestions = [],
                edit1 = [],
                edit2 = [],
                suggestionsLimit = opts.suggestionsLimit || 10;

            word = word.toString().toLowerCase();

            edit1 = edits(word);

            for (var i = 0; i < edit1.length && edit1.length < suggestionsLimit; i++) {
                edit2 = edit2.concat(edits(edit1[i].word));
            }

            edit1 = edit1.sort(function (word1, word2) {
                return word2.rank - word1.rank;
            });

            edit2 = edit2.sort(function (word1, word2) {
                return word2.rank - word1.rank;
            });

            for (var i = 0; i < edit1.length && suggestions.length < suggestionsLimit; i++) {
                if (!suggestions.some(function (suggestion){ return suggestion.word === edit1[i].word;})) {
                    suggestions.push(edit1[i]);
                }
            }

            for (var i = 0; i < edit2.length && suggestions.length < suggestionsLimit; i++) {
                if (!suggestions.some(function (suggestion) { return suggestion.word === edit2[i].word; })){
                    suggestions.push(edit2[i]);
                }
            }

            return suggestions;
        }

        function search(prefix, opts) {

        }



        function build(filePath){

            var wordsString = fs.readFileSync(filePath).toString();

            var lines = wordsString.split('\n');
            var line;
            var word;

            for (var i = 0; i < lines.length; i++) {
                word = lines[i].split(' ');
                insert(word[0], +word[1]);
            }

        }

        if (filePath) {
            build(filePath);
        }


        return {

            insert: insert,
            lookup: lookup,
            remove: remove,
            search: search
        };



    }(filePath));
};