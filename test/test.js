"use strict";

var expect = require("chai").expect,
  spelling = require("../"),
  en_US = require("../dictionaries/en_US");


describe("Test inserting words into the dictionary", function () {
  it("insert a new word", function () {
    var dict = new spelling();

    dict.insert("hello");
    expect(dict.lookup("hello").found).to.equal(true);
  });

  it("insert a new word with a rank", function () {
    var dict = new spelling(),
      rank = 500;

    dict.insert("hello", rank);
    expect(dict.lookup("hello").rank).to.equal(rank);
  });

  it("insert the same word multiple times (should increase the rank by 1 for each insert)", function () {
    var dict = new spelling(),
      count = 5,
      i = 0;

    for (i; i < count; i++) {
      dict.insert("hello");
    }

    expect(dict.lookup("hello").rank).to.equal(count);
  });

  it("modify the word's rank", function () {
    var dict = new spelling(),
      newRank = 16;

    dict.insert("hello");
    dict.insert("hello", newRank);
    expect(dict.lookup("hello").rank).to.equal(newRank);
  });
});

describe("Test removing words from the dictionary", function () {
  it("remove a word from the dictionary", function () {
    var dict = new spelling();

    dict.insert("hello");
    dict.remove("hello");
    expect(dict.lookup("hello").found).to.equal(false);
  });

  it("remove a word that's not available in the dictionary", function () {
    var dict = new spelling();

    dict.remove("hello");
    expect(dict.lookup("hello").found).to.equal(false);
  });
});

describe("Test words lookup", function () {
  it("word lookup with a hit", function () {
    var dict = new spelling();

    dict.insert("hello");
    expect(dict.lookup("hello").found).to.equal(true);
  });

  it("word lookup with a miss without suggestion", function () {
    var dict = new spelling();

    dict.insert("hello");
    expect(dict.lookup("hell", { suggest: false }).found).to.equal(false);
  });

  it("word lookup with a miss with suggestion", function () {
    var dict = new spelling(),
      result;

    dict.insert("hello");
    result = dict.lookup("hell");
    expect(result.found).to.equal(false);
    expect(result.suggestions[0].word).to.equal("hello");
  });

  it("word suggestions should be sorted by rank", function () {
    var dict = new spelling(),
      result;

    dict.insert("yell", 100);
    dict.insert("help", 200);
    dict.insert("hell", 400);
    result = dict.lookup("hel");
    expect(result.found).to.equal(false);
    expect(result.suggestions[0].word).to.equal("hell");
    expect(result.suggestions[1].word).to.equal("help");
    expect(result.suggestions[2].word).to.equal("yell");
  });

  it("words that are more close to the original word, appear first sorted by rank", function () {
    var dict = new spelling(),
      result;

    dict.insert("hello", 100);
    dict.insert("help", 200);
    dict.insert("jello", 400);
    result = dict.lookup("hell");
    expect(result.found).to.equal(false);
    expect(result.suggestions[0].word).to.equal("help");
    expect(result.suggestions[1].word).to.equal("hello");
    expect(result.suggestions[2].word).to.equal("jello");
  });

  it("perform lookup for a list of words", function () {
    var dict = new spelling(),
      results;

    dict.insert("yell", 100);
    dict.insert("help", 200);
    dict.insert("hell", 400);
    results = dict.lookup(["yell", "help", "hell"]);
    expect(results.length).to.equal(3);
    expect(results[0].found).to.equal(true);
    expect(results[1].found).to.equal(true);
    expect(results[2].found).to.equal(true);
  });

});

describe("Test word search", function () {

  it("word search with default depth", function () {
    var dict = new spelling(),
      results;

    dict.insert("yell", 100);
    dict.insert("hell");
    results = dict.search("h");
    expect(results.length).to.equal(1);
    expect(results[0].word).to.equal("hell");
  });

  it("word search results should be sorted by rank", function () {
    var dict = new spelling(),
      results;

    dict.insert("yell", 100);
    dict.insert("help", 200);
    dict.insert("hell", 400);
    results = dict.search("h");
    expect(results.length).to.equal(2);
    expect(results[0].word).to.equal("hell");
    expect(results[1].word).to.equal("help");
  });

  it("word search with depth '2' (limit the search)", function () {
    var dict = new spelling(),
      results;

    dict.insert("yell", 100);
    dict.insert("hello", 600);
    dict.insert("help", 200);
    dict.insert("hell", 400);
    results = dict.search("he", { depth: 2 });
    expect(results.length).to.equal(2);
    expect(results[0].word).to.equal("hell");
    expect(results[1].word).to.equal("help");
  });

  it("word search with depth '9'", function () {
    var dict = new spelling(),
      results;

    dict.insert("yell", 100);
    dict.insert("hello", 600);
    dict.insert("help", 200);
    dict.insert("hell", 400);
    dict.insert("helloworld!", 300);
    dict.insert("helloworld!!", 500);
    results = dict.search("he", { depth: 9 });
    expect(results.length).to.equal(4);
    expect(results[0].word).to.equal("hello");
    expect(results[1].word).to.equal("hell");
    expect(results[2].word).to.equal("helloworld!");
    expect(results[3].word).to.equal("help");
  });
});

describe("Test loading and building the dictionary", function () {
  it("words lookup on the loaded dictionary", function () {
    var dict = new spelling(en_US);

    expect(dict.lookup("hello").found).to.equal(true);
    expect(dict.lookup("welcome").found).to.equal(true);
    expect(dict.lookup("you").found).to.equal(true);
    expect(dict.lookup("he").found).to.equal(true);
    expect(dict.lookup("she").found).to.equal(true);
    expect(dict.lookup("are").found).to.equal(true);
  });

  it("words lookup on an array-based dictionary", function () {
    var dict = new spelling(["wilkes-barre", "philadelphia"]);

    expect(dict.lookup("hello").found).to.equal(false);
    expect(dict.lookup("wilkes-barre").found).to.equal(true);
    var result = dict.lookup("wilkes barre");
    expect(result.found).to.equal(false);
    expect(result.suggestions[0].word).to.equal("wilkes-barre");
  });

  it("doesn't attempt to handle trailing spaces", function () {
    var dict = new spelling(["cape cod", "hyannis"]);

    expect(dict.lookup("cape-cod").found).to.equal(false);
    expect(dict.lookup("cape cod").found).to.equal(true);
    var result = dict.lookup("cape cod ");
    //expect(result.found).to.equal(false);
    expect(result.suggestions).to.equal(undefined);
  });

  it("handles hyphens", function () {
    var dict = new spelling(["cape cod", "hyannis"]);

    expect(dict.lookup("cape-cod").found).to.equal(false);
    expect(dict.lookup("cape cod").found).to.equal(true);
    var result = dict.lookup("cape-cod");
    expect(result.found).to.equal(false);
    expect(result.suggestions[0].word).to.equal("cape cod");
  });
});
