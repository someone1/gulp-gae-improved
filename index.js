'use strict';

var through = require('through2'),
  gutil = require('gulp-util'),
  spawn = require('child_process').spawn,
  builtin_gae = require('google-app-engine')(),
  objectAssign = require('object-assign'),
  PluginError = gutil.PluginError,
  File = gutil.File;


module.exports = function (script, options) {
  var defaults = {
    commands: [],
    async: true,
    gae_dir: builtin_gae
  }

  var conf = objectAssign({}, defaults, options);

  if (['dev_appserver.py', 'appcfg.py'].indexOf(script) == -1) {
    throw new PluginError('gulp-gae', 'Invalid script ' + script + '. Supported scripts are dev_appserver.py and appcfg.py');
  }

  function parseParams(params) {
    var p = [];
    for (var key in params) {
      if (key === 'commands') continue;
      if (key === 'gae_dir') continue;
      if (key === 'async') continue;

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

  function runScript(file, args, cb) {
    var scriptArgs = args.concat(parseParams(conf));
    gutil.log('[gulp-gae-improved]', scriptArgs);
    var proc = spawn(conf.gae_dir + '/' + file, scriptArgs);

    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);

    process.on('exit', function(){
      stopScript(proc);
    });
    if (conf.async) {
      cb();
    } else {
      proc.on('exit', cb);
    }
  }

  function stopScript(proc) {
    gutil.log('[gulp-gae-improved]', 'stopping script');
    proc.kill('SIGHUP');
  }

  function bufferContents(file, enc, next) {
    var appYamlPath = file.path,
      args;

    if (script == 'dev_appserver.py') {
      args = [appYamlPath];
    } else if (script == 'appcfg.py') {
      args = conf.commands.concat([appYamlPath]);
    }

    runScript(script, args, next);
  }

  function endStream(cb) {
    cb();
    return;
  }

  return through.obj(bufferContents, endStream);
};
