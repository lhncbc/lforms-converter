if(typeof LForms === 'undefined') {
  LForms = {};
}

describe('Using Evaluator()', function() {
  "use strict";
  var parser = LForms.sklParser;
  
  var exp1 = '@a AND @b OR NOT @c';
  // ==> (@a AND @b) OR (NOT @c)
  it(exp1, function() {
    var expr = parser.parse(exp1);
    expect(expr.accept(new LForms.Evaluator(), ['@a', '@b'])).toBeTruthy();
    expect(expr.accept(new LForms.Evaluator(), ['@c'])).toBeFalsy();
    expect(expr.accept(new LForms.Evaluator(), [])).toBeTruthy();
  });

  var exp2 = '(@a = @a) AND NOT (@b > @c) OR NOT (@c >= @b)';
  // ==> ((@a AND @c) AND (NOT (@b > @c))) OR (NOT (@c >= @b))
  it(exp2, function() {
    var expr = parser.parse(exp2);
    // Evaluator is a test implementation to verify the tree traversal and expression 
    // validity.
    // Pass in the list of valid TOKEN_VARs for traversal. Note that any non listed nodes 
    // visited evaluates to false.
    expect(expr.accept(new LForms.Evaluator(), ['@a', '@b', '@c'])).toBeTruthy();
    expect(expr.accept(new LForms.Evaluator(), ['@c', '@b'])).toBeFalsy();
    expect(expr.accept(new LForms.Evaluator(), [])).toBeTruthy();
  });

  // double negation
  var exp3 = 'NOT NOT @a';
  // ==> NOT (NOT @a)
  it(exp3, function() {
    var expr = parser.parse(exp3);
    expect(expr.accept(new LForms.Evaluator(), ['@a'])).toBeTruthy();
    expect(expr.accept(new LForms.Evaluator(), ['@b'])).toBeFalsy();
  });

  var exp4 = 'NOT @a1A';
  it(exp4 + ' is false', function() {
    var expr = parser.parse(exp4);
    expect(expr.accept(new LForms.Evaluator(), ['@a1A'])).toBeFalsy();
  });

  it('throws exception on parse error', function() {
    var exceptionFunc = function() {
      parser.parse(
        // line,token_start_col
        "          \n" + // 1
        "          \n" + // 2
        "  a       \n" + // 3,3
        "    OR    \n" + // 4,5
        "      c   \n" + // 5,7
        "         AND"     // 6,9
        ///0123456789
      );
    };
    expect(exceptionFunc).toThrowError(
      "Parse error on line 6:\n" +
      "...   c            AND\n" +
      "----------------------^\n" +
      "Expecting 'TOKEN_NOT', 'TOKEN_LPAREN', 'TOKEN_STR', 'TOKEN_DOUBLE_QUOTE', 'TOKEN_SINGLE_QUOTE', got 'EOF'");
    try {
      exceptionFunc();
      throw new Error('Should fail');
    }
    catch (error) {
      expect(error.hash).toEqual({
        text: '',
        token: 'EOF',
        line: 5,
        loc: { first_line: 6, last_line: 6, first_column: 9, last_column: 12 },
        expected: [ '\'TOKEN_NOT\'', '\'TOKEN_LPAREN\'', '\'TOKEN_STR\'', '\'TOKEN_DOUBLE_QUOTE\'', '\'TOKEN_SINGLE_QUOTE\'' ]
      });
    }
  });
});

describe('Using testData with SkipLogicConditionParser()', function() {
  "use strict";
  for(var test in testData) {
    // it() is async. Passing 'test' variable in multiple invocations result in 
    // referring to unpredictable values in the variable. Hence this indirection.
    (function(input) {
      it(input, function() {
        var sklParser = new LForms.SkipLogicConditionParser();
        expect(testData[input].expected).toEqual(sklParser.parse(input));
        if(testData[input].warnings) {
          expect(testData[input].warnings).toEqual(sklParser.warnings);
        }
        if(testData[input].error) {
          expect(testData[input].error).toEqual(sklParser.error);
        }
      });
    })(test);
  }
});

   