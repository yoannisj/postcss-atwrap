const postcss = require('postcss');

function findStart(endRule, ruleName)
{
  ruleName = ruleName || endRule.params;

  let prev = endRule.prev();

  // loop over previous rules
  while (prev)
  {
    // if previous rule is a '@at-start' rule
    if (prev.type == 'atrule' && prev.name == 'at-start')
    {
      // and matches given '@at-end' rule
      if (prev.params.startsWith(ruleName)) {
        return prev;
      }
    }

    prev = prev.prev();
  }
}

module.exports = postcss.plugin('atwrap', function atwrap(opts) {

  opts = opts || {};

  return function(css, res) {

    css.walkAtRules('at-end', function(endRule) {

      // find matching '@at-start' rule before current '@at-end' rule
      const ruleName = endRule.params.trim().split(/\s+/)[0];

      // throw warning and interrupt if '@at-end' does not define rule name
      if (!ruleName || ruleName.length == 0) {
        endRule.warn(res, "Could not determine '@at-end' rule name.");
        return;
      }

      const startRule = findStart(endRule, ruleName);

      // throw warning and interrupt if no '@at-start' rule was found
      if (startRule === undefined) {
        endRule.warn(res, "Could not find '@at-start' rule matching '@at-end' rule.");
        return;
      }

      let parent = endRule.parent;
      let wrapped = [];

      // collect sibling rules between '@at-start' and '@at-end'
      parent.each(function(rule) {

        let index = rule.parent.index(rule);
        if (index > startRule.parent.index(startRule) && index < endRule.parent.index(endRule))  {
          // collect rule
          wrapped.push(rule.clone());
          // remove it from parent
          rule.remove();
        }

      });

      // remove ruleName from params given to '@at-start' rule
      const ruleParams = startRule.params.replace(ruleName, '').trim();

      // create new atRule to contain selected children
      let atRule = postcss.atRule({
        name: ruleName,
        params: ruleParams
      });

      // add new at-rule to the parent
      parent.insertAfter(endRule, atRule);

      // re-inject wrapped rules
      wrapped.forEach(function(rule) {
        atRule.append(rule);
      });

      // remove old '@at-start' and '@at-end' rules
      startRule.remove();
      endRule.remove();
    });

    return css;

  };

});