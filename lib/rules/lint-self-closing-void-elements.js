'use strict';

/*
 Disallows self-closing void elements

 ```
 {{! good }}
 <hr>

 {{! bad}}
 <hr />
 ```

 The following values are valid configuration:

   * boolean -- `true` for enabled / `false` for disabled
 */

const Rule = require('./base');
/**
 * [Specs of Void Elements]{@link https://www.w3.org/TR/html-markup/syntax.html#void-element}
 * @type {Object}
 */
const VOID_TAGS = {
  area: true,
  base: true,
  br: true,
  col: true,
  command: true,
  embed: true,
  hr: true,
  img: true,
  input: true,
  keygen: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true
};

module.exports = class LogSelfClosingVoidElements extends Rule {
  parseConfig(config) {
    let configType = typeof config;

    let errorMessage = 'The self-closing-void-element rule accepts one of the following values.\n ' +
      '  * boolean - `true` to enable and `false` to disable\n' +
      '  * `"require" - checks for closing tags in void elements\n`' +
      '\nYou specified `' + config + '`';

    switch(configType) {
    case 'boolean':
      return config;
    case 'string':
      if (config === 'require') {
        return config;
      } else {
        throw new Error(errorMessage);
      }
    case 'undefined':
      return true;
    default:
      throw new Error(errorMessage);
    }
  }
  visitor() {
    return {
      ElementNode(node) {
        if (VOID_TAGS[node.tag]) {
          let source = this.sourceForNode(node).trim();
          let sourceEndTwoCharacters = source.slice(source.length - 2);
          let isSelfClosingRequired = this.config === 'require';
          let shouldLogError = isSelfClosingRequired ? sourceEndTwoCharacters !== '/>' : sourceEndTwoCharacters === '/>';

          if (shouldLogError) {
            let expected = isSelfClosingRequired ? `${source.slice(0, -1)}/>` : `${source.slice(0, -2)}>`;

            this.log({
              message: isSelfClosingRequired ? 'Self-closing a void element is required' : 'Self-closing a void element is redundant',
              line: node.loc.start.line,
              column: node.loc.start.column,
              source: source,
              fix: {
                text: expected
              }
            });
          }
        }
      }
    };
  }
};
