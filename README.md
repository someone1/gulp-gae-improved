gulp-gae
========

# Installation
`npm install gulp-gae --save-dev`

# Usage
```javascript
var gulp = require('gulp'),
  gae = require('gulp-gae');


gulp.task('gae-serve', function () {
  gulp.src('app/app.yaml')
    .pipe(gae('serve', {
      port: 8081,
      host: '0.0.0.0',
      admin_port: 8001,
      admin_host: '0.0.0.0'
    }));
});


gulp.task('gae-deploy', function () {
  gulp.src('app/app.yaml')
    .pipe(gae({
      port: 8081,
      host: '0.0.0.0',
      admin_port: 8001,
      admin_host: '0.0.0.0'
    }));
});

```