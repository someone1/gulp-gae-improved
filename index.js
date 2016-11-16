'use strict';

var through = require('through2'),
  path = require('path'),
  gutil = require('gulp-util'),
  spawn = require('child_process').spawn,
  builtin_gae = require('google-app-engine')(),
  objectAssign = require('object-assign'),
  PluginError = gutil.PluginError,
  File = gutil.File;


module.exports = function (script, options, callback) {
  var defaults = {
    commands: [],
    gae_dir: builtin_gae
  }

  const conf = objectAssign({}, defaults, options);

  var proc;

  if (['dev_appserver.py', 'appcfg.py'].indexOf(script) == -1) {
    throw new PluginError('gulp-gae', 'Invalid script ' + script + '. Supported scripts are dev_appserver.py and appcfg.py');
  }

  function parseParams(params) {
    var p = [];
    for (var key in params) {
      if (key === 'commands') continue;
      if (key === 'gae_dir') continue;

      var value = params[key];
      if (value === undefined) {
        // Value-less parameters.
        p.push('--' + key);
      } else {
        p.push('--' + key + '=' + value);
      }
    }
    return p;
  }

  function runScript(file, args, params, cb) {
    var scriptArgs = args.concat(parseParams(params));
    gutil.log('[gulp-gae]', scriptArgs);
    proc = spawn(conf.gae_dir + '/' + file, scriptArgs);
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
    cb && cb();
  }

  function stopScript() {
    gutil.log('[gulp-gae]', 'stopping script');
    proc && proc.kill('SIGHUP');
    proc = null;
    callback && callback();
  }

  function bufferContents(file, enc, cb) {
    var appYamlPath = path.dirname(file.path),
      shouldWait = false,
      args;

    if (script == 'dev_appserver.py') {
      args = [appYamlPath];
    } else if (script == 'appcfg.py') {
      args = conf.commands.concat([appYamlPath]);
      shouldWait = true;
    }

    runScript(script, args, conf, cb);

    process.on('exit', stopScript);
  }

  function endStream(cb) {
    cb();
    return;
  }

  return through.obj(bufferContents, endStream);
};
