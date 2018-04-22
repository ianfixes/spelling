spelling [![Build Status](https://travis-ci.org/ianfixes/spelling.svg?branch=master)](https://travis-ci.org/ianfixes/spelling) [![npm version](https://badge.fury.io/js/spelling.svg)](https://badge.fury.io/js/spelling)
========

> A spelling checker that provides words suggestions, and the facility to search for words with a specific prefix.

## Install
```
$ npm install --save spelling
```

# Usage
```
var spelling = require('./'),
    dictionary = require('./dictionaries/en_US.js');

var dict = new spelling(dictionary);

console.log(dict.lookup('yes'));
//{ found: true, word: 'yes', rank: 5398 }

console.log(dict.lookup('hei'));
/*
{ found: false,
  word: 'hei',
  suggestions:
   [ { found: true, word: 'he', rank: 38410 },
     { found: true, word: 'her', rank: 14182 },
     { found: true, word: 'hey', rank: 529 },
     { found: true, word: 'hi', rank: 398 },
     { found: true, word: 'heir', rank: 76 },
     { found: true, word: 'hen', rank: 34 },
     { found: true, word: 'hep', rank: 31 },
     { found: true, word: 'hem', rank: 21 },
     { found: true, word: 'hew', rank: 12 },
     { found: true, word: 'hex', rank: 9 } ] }
*/

console.log(dict.lookup('hey'));
//{ found: true, word: 'hey', rank: 529 }

console.log(dict.lookup('yellows'));
/*
{ found: false,
  word: 'yellows',
  suggestions:
   [ { found: true, word: 'yellow', rank: 380 },
     { found: true, word: 'yellowy', rank: 2 },
     { found: true, word: 'fellow', rank: 551 },
     { found: true, word: 'bellow', rank: 36 },
     { found: true, word: 'mellow', rank: 32 } ] }
*/

console.log(dict.lookup('colleage', {suggest: false}));
//{ found: false, word: 'colleage' }

console.log(dict.search('manu'));
/*
[ { word: 'manual', rank: 395 },
  { word: 'manure', rank: 19 },
  { word: 'manumit', rank: 2 },
  { word: 'manuel', rank: 1 },
  { word: 'manuela', rank: 1 } ]
*/

console.log(dict.search('manu', {depth: 8}));
/*
[ { word: 'manuscript', rank: 752 },
  { word: 'manual', rank: 395 },
  { word: 'manufacturer', rank: 211 },
  { word: 'manufacture', rank: 82 },
  { word: 'manure', rank: 19 },
  { word: 'manumit', rank: 2 },
  { word: 'manumission', rank: 2 },
  { word: 'manumitted', rank: 2 },
  { word: 'manumitting', rank: 2 },
  { word: 'manuela', rank: 1 },
  { word: 'manuel', rank: 1 } ]
*/

```

## Custom Dictionaries

If you'd prefer to receive suggestions on people or place names (for which there is no apparent "rank"), you can simply supply an array of those names.

```
var spelling = require('./');

var dict = new spelling(['wilkes-barre', 'philadelphia']);

console.log(dict.lookup('wilkes barre'));
//{ found: false, word: 'wilkes-barre', rank: 1 }
```

Otherwise, the dictionary format is one big string of pairs, space delimited: `word1 rank1 word2 rank2 [...]` where the ranks are integers.

# API
## .lookup(word, [opts])

Perform dictionary lookup for the given word/words.

### Parameters
`{String|Array} word`

The word/words array on which perform dictionary lookup.

`{Object} [opts]`

`opts` is an optional object contains options to alter the lookup behavior.
##### options
`{boolean} suggest`, default `true`

`suggest` specifies whether to give suggestions if the lookup failed to find the word in the dictionary.

### Example
```
console.log(dict.lookup('yes'));
//{ found: true, word: 'yes', rank: 5398 }

console.log(dict.lookup('hei'));
/*
{ found: false,
  word: 'hei',
  suggestions:
   [ { found: true, word: 'he', rank: 38410 },
     { found: true, word: 'her', rank: 14182 },
     { found: true, word: 'hey', rank: 529 },
     { found: true, word: 'hi', rank: 398 },
     { found: true, word: 'heir', rank: 76 },
     { found: true, word: 'hen', rank: 34 },
     { found: true, word: 'hep', rank: 31 },
     { found: true, word: 'hem', rank: 21 },
     { found: true, word: 'hew', rank: 12 },
     { found: true, word: 'hex', rank: 9 } ] }
*/
console.log(dict.lookup('hei’, {suggest: false}));
/*
{ found: false, word: 'hei'}
*/

```
## .search(prefix, [opts]);
Perform dictionary search for words that start with the supplied prefix, the search depth can be specified to limit the search result.

### Parameters
`{String} prefix`

The search prefix.

`{Object} [opts]`

`opts` is an optional object contains options to alter the search behavior.
##### options
`{Number} depth` ,default is `3`.

the search depth which specify how deep the search is inside the dictionary tree, in another word, how many extra letters the result words have than the prefix.
### Example
```
 dict.search('man', {depth: 2});
[ { word: 'many', rank: 12758 },
  { word: 'man', rank: 3913 },
  { word: 'mania', rank: 66 },
  { word: 'manic', rank: 61 },
  { word: 'manly', rank: 36 },
  { word: 'manor', rank: 31 },
  { word: 'mane', rank: 14 },
  { word: 'mango', rank: 12 },
  { word: 'manna', rank: 9 },
  { word: 'manse', rank: 8 },
  { word: 'mange', rank: 7 },
  { word: 'mangy', rank: 6 },
  { word: 'manta', rank: 4 },
  { word: 'manky', rank: 4 },
  { word: 'mani', rank: 1 },
  { word: 'manet', rank: 1 },
  { word: 'manx', rank: 1 },
  { word: 'mandy', rank: 1 },
  { word: 'mann', rank: 1 },
  { word: 'man\'s', rank: 1 } ]
```



## .insert(word, [rank])
Insert a new word into the dictionary, optionally specify the word’s rank
### Parameters
`{String} word`

The `word` to be added into the dictionary.

`{Number} [rank]`

the word’s rank. The rank affects the suggestion and the search where words with higher ranks appear first.
In case the rank is not supplied, the default rank is 1, if the word is not already in the dictionary, or increment the current word’s rank by 1 if the word is already added.

## .remove(word)
Remove word from the dictionary.
### Parameters
`{String} word`

The `word` to be removed from the dictionary.

# Authors
`spelling` was written by [Ahmed AlSahaf](https://github.com/asahaf) but is now maintained here.
