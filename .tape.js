module.exports = {

  'wraps-nodes-in-atrule': {
    'message': 'Wraps nodes betwen `@at-start` and `@at-end` in new `@` rule',
    'fixtures': './test/stylesheets',
    'source': 'stylesheets/source/wrap-nodes-in-atrule.css',
    'expect': 'stylesheets/output/wrap-nodes-in-atrule.css',
  }

};