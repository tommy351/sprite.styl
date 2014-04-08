var stylus = require('stylus'),
  sprite = require('../lib'),
  fs = require('fs'),
  path = require('path'),
  should = require('chai').should();

var casePath = path.join(__dirname, 'cases');

var cases = fs.readdirSync(casePath).filter(function(file){
  return path.extname(file) === '.styl';
}).map(function(file){
  return file.replace('.styl', '');
});

describe('Stylesheets', function(){
  cases.forEach(function(test){
    it(test, function(done){
      var testPath = path.join(casePath, test),
        styl = fs.readFileSync(testPath + '.styl', 'utf8'),
        css = fs.readFileSync(testPath + '.css', 'utf8');

      var style = stylus(styl)
        .use(sprite({
          base_dir: __dirname
        }))
        .set('filename', path);

      style.render(function(err, result){
        if (err) throw err;

        result.should.eql(css);
      });

      done();
    });
  });
});