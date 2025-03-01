import { Identifier } from 'estree';
import { walk } from 'estree-walker';
import MagicString from 'magic-string';
import { attachScopes } from '@rollup/pluginutils';
import { isReference, flatten } from '../utils/PluginUtils.js';
import { Plugin } from 'rollup';

export function pluginReplaceGalaceanLogic(): Plugin {
  return {
    name: 'replaceGalaceanLogic',
    transform(code: string, id: string) {
      if (id.indexOf('@galacean') > -1) {
        code = code.replace(
          `gl[_glKey] = extensionVal;`,
          `try { gl[_glKey] = extensionVal; } catch (e) { console.error(e); }`,
        );
        code = code.replace(
          `this._requireResult = {};`,
          `this._requireResult = Object.assign({}, $defaultWebGLExtensions)`,
        );
      }
      return { code, map: null };
    }
  };
}

export function pluginReplaceGalaceanImports(options: any = {}) {
  return {
    name: 'replaceGalaceanImports',
    transform(code: string,id: string) {
      if (id.indexOf('@galacean') > -1) {
        const regex = /import\s*{\s*[^}]*\s*}\s*from\s*(['"])(@galacean\/engine)\1;/g;
        const matches = code.match(regex);
        if (matches) {
          const match = matches[0];
          const imports = match.match(/(?<=^import\s*\{)[^}]+(?=\})/)?.[0].split(',').map((item: string) => item.trim());
          code = code.replace(match, `const galacean = require('./engine.js');`);

          const modulesCfg = imports.reduce((acc, curr) => {
            // Some modules may used aliases, such as import { WebGLEngine as t } from '@galacean/engine';
            let parsedImports = curr.split(/\s*as\s*/);
            let importName = curr, aliasImportName = curr;
            if (parsedImports.length === 2) {
                importName = parsedImports[0];
                aliasImportName = parsedImports[1];
            }
            acc[aliasImportName] = {
                refName: 'galacean',
                localNamePostfix: `.${importName}`,
                overwrite: true,
            };
            return acc;
          }, {});
          const modulesMap = new Map(Object.entries(modulesCfg));

          const firstpass = new RegExp(`(?:${imports.join('|')})`, 'g');
          const sourceMap = options.sourceMap !== false && options.sourcemap !== false;

          let ast = null;
          try {
            ast = this.parse(code);
          } catch (err) {
            this.warn({
              code: 'PARSE_ERROR',
              message: `rollup-plugin-inject: failed to parse ${id}. Consider restricting the plugin to particular files via options.include`,
            });
          }
          if (!ast) return null;
    
          let scope = attachScopes(ast, 'scope');
          const magicString = new MagicString(code);

          function handleReference(node, name, keypath) {
            let modCfg = modulesMap.get(keypath) as any;
            if (modCfg && modCfg.overwrite && !scope.contains(name)) {
              let { refName, localNamePostfix = '', overwrite } = modCfg;

              if (name !== keypath || overwrite) {
                magicString.overwrite(node.start, node.end, refName + localNamePostfix, {
                  storeName: true,
                });
              }

              return true;
            }

            return false;
          }

          walk(ast, {
            enter(node, parent) {
              const { start, end, scope: nodeScope } = node as any;
              if (sourceMap) {
                magicString.addSourcemapLocation(start);
                magicString.addSourcemapLocation(end);
              }

              if (nodeScope) {
                scope = nodeScope; // eslint-disable-line prefer-destructuring
              }

              // special case – shorthand properties. because node.key === node.value,
              // we can't differentiate once we've descended into the node
              if (node.type === 'Property' && node.shorthand) {
                const { name } = node.key as Identifier;
                handleReference(node, name, name);
                this.skip();
                return;
              }

              if (isReference(node, parent)) {
                const { name, keypath } = flatten(node);
                const handled = handleReference(node, name, keypath);
                if (handled) {
                  this.skip();
                }
              }
            },
            leave(node: any) {
              if (node.scope) {
                scope = scope.parent;
              }
            },
          });

          return {
            code: magicString.toString(),
            map: sourceMap ? magicString.generateMap({ hires: true }) : null,
          };
        }
      }
    }
  };
};
