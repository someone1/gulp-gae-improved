gulp-gae-improved
========

Note: This is a fork from maciejzasada's repository gulp-gae:  https://github.com/maciejzasada/gulp-gae

We created this new repository due to the need of some additional changes...

========

# Installation
`npm install gulp-gae-improved --save-dev`

# Usage
```javascript
var gulp = require('gulp'),
  gae = require('gulp-gae-improved');

// Optionally you can omit gae_dir parameter to use built-in appengine library
var gae_dir = '/home/user/google-appengine';
gulp.task('gae-serve', function () {
  gulp.src('app/app.yaml')
    .pipe(gae('dev_appserver.py', [], {
      port: 8081,
      host: '0.0.0.0',
      admin_port: 8001,
      admin_host: '0.0.0.0'
    }, gae_dir));
});


gulp.task('gae-deploy', function () {
  gulp.src('app/app.yaml')
    .pipe(gae('appcfg.py', ['update'], {
      version: 'dev',
      oauth2: undefined // for value-less parameters
    }));
});


gulp.task('default', ['gae-serve']);

```

For a working example see the `test` folder.
