var gulp = require('gulp'),
  gae = require('../');


gulp.task('gae-serve', function () {
  gulp.src('app/app.yaml')
    .pipe(gae('dev_appserver.py', {
      port: 8081,
      host: '0.0.0.0',
      admin_port: 8001,
      admin_host: '0.0.0.0'
    }));
});


gulp.task('gae-deploy', function () {
  return gulp.src('app/app.yaml')
    .pipe(gae('appcfg.py', {
      commands: ['update'],
      version: 'dev',
      async: false,
      oauth2: undefined // for value-less parameters
    }));
});


gulp.task('default', ['gae-serve']);
