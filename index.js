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
    quiet: true,
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
      if (key === 'quiet') continue;

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
    if(!conf.quiet) gutil.log('[gulp-gae-improved]', "\n", scriptArgs);
    var proc = spawn(conf.gae_dir + '/' + file, scriptArgs);
    var stream = this;

    // Listen for the admin server to tell that we are ready
    proc.stderr.on('data', function(chunk){
      var message = chunk.toString();

      if (!conf.quiet) process.stdout.write(message);

      var stripLog = function(message) {
        return message.replace(/^.*\]\s/g, '');
      };

      if (message.match(/Starting admin server at/g)) {
        if (conf.quiet) gutil.log('[gulp-gae-improved]', stripLog(message));

        gutil.log('[gulp-gae-improved]', 'ready');
        // Push process to stream, asynchronously or not
        if (conf.async) {
          stream.push(proc);
          cb();
        } else {
          proc.on('exit', function(){
            stream.push(proc);
            cb();
          });
        }
      } else if(message.match(/Starting/g) && conf.quiet) {
        gutil.log('[gulp-gae-improved]', stripLog(message));
      }
    });

    process.on('exit', function(){
      stopScript(proc);
    });
  }

  function stopScript(proc) {
    gutil.log('[gulp-gae-improved]', 'stopping script');
    proc.kill('SIGHUP');
  }

  function bufferContents(file, enc, next) {
    var appYamlPath = file.path,
      args;

    if (script == 'dev_appserver.py') {
      args = [appYamlPath].concat(conf.commands);
    } else if (script == 'appcfg.py') {
      args = conf.commands.concat([appYamlPath]);
    }

    runScript.call(this, script, args, next);
  }

  function endStream(cb) {
    cb();
    return;
  }

  return through.obj(bufferContents, endStream);
};
