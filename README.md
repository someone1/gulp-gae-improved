gulp-gae-improved
========

Note: This is a fork from maciejzasada's repository gulp-gae:  https://github.com/maciejzasada/gulp-gae

We created this new repository due to the need of some additional changes...

========

# Installation
`npm install gulp-gae-improved --save-dev`

# Usage
```javascript
gae('script', options, [exitCallback]);
```

```javascript
var gulp = require('gulp'),
  gae = require('gulp-gae-improved');

gulp.task('gae-serve', function () {
  gulp.src('app/app.yaml')
    .pipe(gae('dev_appserver.py', {
      port: 8081,
      host: '0.0.0.0',
      admin_port: 8001,
      admin_host: '0.0.0.0'
    }));
});

// In the next example the gulp tasks are blocked until done
gulp.task('gae-deploy', function (done) {
  gulp.src('app/app.yaml')
    .pipe(gae('appcfg.py', {
      commands: ['update'],
      version: 'dev',
      oauth2: undefined, // for value-less parameters
      oauth2_refresh_token: 'jfd90834jf90j4&Y#*&#4lojhfi83'
    }, done));
});


gulp.task('default', ['gae-serve']);
```
For a working example see the `test` folder.

# Options

1. **commands**: Array of commands to execute (like: ['help', 'update']), defaults to [];
2. **gae_dir**: Path to appengine library, defaults to built-in
3. All default parameters from both `appcfg.py` and `dev_appserver`
