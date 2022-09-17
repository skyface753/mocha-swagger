#!/usr/bin/env node

/**
 * Copyright (c) 2018-present, Lmntrx Tech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//   /!\ DO NOT MODIFY THIS FILE /!\
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// mochaswagger-gen is installed globally on people's computers. This means
// that it is extremely difficult to have them upgrade the version and
// because there's only one global version installed, it is very prone to
// breaking changes.
//
// If you need to add a new command, please add it to the scripts/ folder.
//
// The only reason to modify this file is to add more warnings and
// troubleshooting information for the `mochaswagger-gen` command.
//
// Do not make breaking changes! We absolutely don't want to have to
// tell people to update their global version of mochaswagger-gen.
//
// Also be careful with new language features.
// This file must work on Node 0.10+.
//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//   /!\ DO NOT MODIFY THIS FILE /!\
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

'use strict';

const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
const fs = require('fs');
const ProgressBar = require('progress');
const stripCom = require('strip-comments');

module.exports = (dir) => {
  const root = path.resolve(dir);
  const testDirName = path.basename(root);
  const testFileFormats = ['/**/*.js', '/**/*.ts'];
  let routes = [];
  testFileFormats.forEach((testFileFormat) => {
    let files = glob.sync(`${testDirName}/${testFileFormat}`);
    if (!files || files.length <= 0) {
      console.warn(
        chalk.magenta(
          `${testDirName} directory does not contain files matching pattern ${testFileFormat}`
        )
      );
      return null;
    }
    console.info(
      chalk.cyan(`Parsing files matching pattern ${testFileFormat}`)
    );
    var bar = new ProgressBar('  processing [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      total: files.length * 2,
      renderThrottle: 0,
    });
    files.forEach((file) => {
      processFile(stripCom(fs.readFileSync(file).toString()));
      bar.tick(2);
    });
  });

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  function conv_str_obj(str) {
    let retval = null;

    try {
      retval = JSON.parse(str.replace(/'/g, '"'));
    } catch (e) {
      // do nothing
    }

    if (retval) {
      retval = Object.entries(retval);
      return retval[0];
    } else {
      return str.split(',');
    }
  }

  function push_routes(data) {
    if (data !== null && data !== undefined && !Array.isArray(data)) {
      // console.log(data);
      routes.push(data);
      return true;
    } else {
      return false;
    }
  }

  async function processFile(data) {
    let http_regex_obj = {
      get: /get\(\s*(.*?)\s*\)/g,
      post: /post\(\s*(.*?)\s*\)/g,
      delete: /delete\(\s*(.*?)\s*\)/g,
      put: /put\(\s*(.*?)\s*\)/g,
      patch: /patch\(\s*(.*?)\s*\)/g,
    };
    let http_param_obj = {
      set: {
        regex: /set\(\s*(.*?)\s*\)/g, // Used to set headers: header
        param_type: 'header',
      },
      send: {
        regex: /send\(\s*(.*?)\s*\)/g, // Used to set payload: formData
        param_type: 'formData',
      },
      attach: {
        regex: /attach\(\s*(.*?)\s*\)/g, // Used to upload files: formData
        param_type: 'formData',
      },
      field: {
        regex: /attach\(\s*(.*?)\s*\)/g, // Used to upload files: formData
        param_type: 'formData',
      },
    };
    let http_res_obj = {
      expect: {
        regex: /expect\(\s*(.*?)\s*\)/g,
        regexStat: /expect\((.*?)\)\.to\.have\.status\((.*?)\);/g,
        regexBodyBool: /expect\(res\.body\.(.*?)\)\.to\.be\.(.*?);/g,
        regexBodyStr: /expect\(res\.body\.(.*?)\)\.to\.equal\((.*?)\);/g,
        param_type: 'response',
      },
    };
    let blocks = data.split('describe(');

    let local_routes = [];

    // asyncForEach(blocks, async (block) => {
    blocks.forEach((block) => {
      let lines = block.split('it(');
      let route = null;

      // asyncForEach(lines, async (line_val) => {
      lines.forEach((line_val, index) => {
        console.log(index);
        // debugger;
        // let line = line_val.replace(/\s/g, '');
        let line = line_val;
        let method = null;
        // Identify http request method

        // asyncForEach(Object.keys(http_regex_obj), async (key) => {
        Object.keys(http_regex_obj).forEach(async function (key) {
          let match = line.match(http_regex_obj[key]);

          if (match) {
            method = key;
            let parameters = [];

            let path = match[0].split(',')[0].split("'")[1];
            let responses = {};
            let http_param_obj_match = {};
            let routeStatusCode = null;
            // Responses
            Object.keys(http_res_obj).forEach(async function (key) {
              if (http_res_obj[key]['regex'].exec(line)) {
                if (http_res_obj[key]['regexStat'].exec(line)) {
                  for (let m of line.match(http_res_obj[key]['regexStat'])) {
                    console.log('Msatus', m);
                    let statusVar = m.split('expect(')[1].split(')')[0];
                    let statusCode = m.match(/\d+/)[0];
                    routeStatusCode = statusCode;
                    // responses.push({
                    //   statusVar: statusVar,
                    //   status: statusCode,
                    // });
                  }
                }
                if (http_res_obj[key]['regexBodyBool'].exec(line)) {
                  for (let m of line.match(
                    http_res_obj[key]['regexBodyBool']
                  )) {
                    let resBodyKey = m
                      .split('expect(res.body.')[1]
                      .split(')')[0];
                    let resBodyBool = m.split('to.be.')[1].split(';')[0];
                    // responses.push({
                    //   resBodyKey: resBodyKey,
                    //   resBodyBool: resBodyBool,
                    // });
                    let resBodyKeyArr = resBodyKey.split('.');
                    let resBodyKeyArrLen = resBodyKeyArr.length;
                    if (resBodyKeyArrLen === 1) {
                      responses[resBodyKey] = {
                        type: 'boolean',
                        example: resBodyBool,}
                    }else{
                      for (let i = 0; i < resBodyKeyArrLen; i++) {
                        if (i === 0) {
                          responses[resBodyKeyArr[i]] = {};
                        } else if (i === resBodyKeyArrLen - 1) {
                          responses[resBodyKeyArr[i]] = {
                            type: 'boolean',
                            example: resBodyBool,
                          };
                        } else {
                          responses[resBodyKeyArr[i]] = {};
                        }
                      }

                    }


                  }
                }
                // if (http_res_obj[key]['regexBodyStr'].exec(line)) {
                //   for (let m of line.match(http_res_obj[key]['regexBodyStr'])) {
                //     let resBodyKey = m
                //       .split('expect(res.body.')[1]
                //       .split(')')[0];
                //     let resBodyVal = m.split('to.equal(')[1].split(');')[0];
                   
                //       responses[resBodyKey] = resBodyVal;
                    
                //   }
                // }
              }
            });

            // asyncForEach(Object.keys(http_param_obj), async (key) => {
            Object.keys(http_param_obj).forEach(function (key) {
              // http_param_obj_match[key] = http_param_obj[key]['regex'].exec(line);
              if (http_param_obj[key]['regex'].exec(line)) {
                let matches = [];
                let m = null;

                for (m of line.match(http_param_obj[key]['regex'])) {
                  m = http_param_obj[key]['regex'].exec(m);

                  if (m) {
                    let name_var = conv_str_obj(m[1]);
                    if (!name_var) {
                      name_var = m[1];
                    }
                    let param_var = {
                      in: http_param_obj[key]['param_type'],
                      required: true,
                      type: 'string',
                      name: name_var[0],
                    };
                    if (name_var.length > 1) {
                      param_var['default'] = name_var[1];
                    }
                    parameters.push(param_var);
                  }
                }
              }
            });

            route = {
              method,
              path,
              parameters,
              responses,
              responseCode: routeStatusCode,
            };

            // console.log(route);
            let dustbin = await push_routes(route);
            // local_routes.push(route);
          }
        });
      });
    });

    // console.log(local_routes);
    return true;
  }
  return routes.filter(onlyUnique);
};
