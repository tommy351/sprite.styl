var stylus = require('stylus'),
  sprite = require('../lib'),
  fs = require('fs'),
  pathFn = require('path'),
  glob = require('glob'),
  async = require('async'),
  _ = require('lodash'),
  handlebars = require('handlebars'),
  crypto = require('crypto'),
  should = require('chai').should();

var findCases = function(path){
  return fs.readdirSync(path).filter(function(file){
    return pathFn.extname(file) === '.styl';
  }).map(function(file){
    return file.replace('.styl', '');
  });
};

var renderStyl = function(path, content, callback){
  var style = stylus(content)
    .use(sprite({
      base_dir: __dirname
    }))
    .set('filename', path);

  style.render(callback);
};

var compareStyl = function(path, callback){
  async.auto({
    styl: function(next){
      fs.readFile(path + '.styl', 'utf8', next);
    },
    css: function(next){
      fs.readFile(path + '.css', 'utf8', next);
    },
    render: ['styl', 'css', function(next, results){
      renderStyl(path + '.styl', results.styl, function(err, result){
        if (err) return next(err);

        result.should.eql(results.css);
        next();
      });
    }]
  }, callback);
};

var checksum = function(path, callback){
  var stream = fs.createReadStream(path),
    shasum = crypto.createHash('sha1');

  stream.on('data', function(data){
    shasum.update(data);
  }).on('end', function(){
    callback(null, shasum.digest('hex'));
  }).on('error', callback);
};

describe('integration', function(){
  var casePath = pathFn.join(__dirname, 'cases'),
    cases = findCases(casePath);

  cases.forEach(function(test){
    it(test, function(done){
      compareStyl(pathFn.join(casePath, test), done);
    });
  });
});

describe('sprites', function(){
  var spritePath = pathFn.join(__dirname, 'sprites'),
    imagePath = pathFn.join(__dirname, 'images'),
    cases = findCases(spritePath),
    files = [];

  before(function(done){
    fs.readdir(imagePath, function(err, list){
      if (err) throw err;

      files = list;
      done();
    });
  });

  cases.forEach(function(test){
    it(test, function(done){
      var path = pathFn.join(spritePath, test);

      async.auto({
        styl: function(next){
          fs.readFile(path + '.styl', 'utf8', next);
        },
        render: ['styl', function(next, results){
          renderStyl(path + '.styl', results.styl, next);
        }],
        id: ['render', function(next){
          fs.readdir(imagePath, function(err, list){
            if (err) return next(err);

            var id = _.difference(list, files)[0].replace('.png', '');
            files = list;

            next(null, id);
          });
        }],
        css: function(next){
          fs.readFile(path + '.css', 'utf8', next);
        },
        compare: ['render', 'id', 'css', function(next, results){
          var css = handlebars.compile(results.css)({id: results.id});

          css.should.eql(results.render);
          next();
        }],
        img: ['id', function(next, results){
          checksum(pathFn.join(imagePath, results.id + '.png'), next);
        }],
        sprite: function(next){
          checksum(path + '.png', next);
        },
        checksum: ['img', 'sprite', function(next, results){
          results.img.should.eql(results.sprite);
          next();
        }]
      }, done);
    });
  });

  after(function(done){
    glob(pathFn.join(imagePath, 'icons-*.png'), function(err, files){
      if (err) throw err;

      async.each(files, function(file, next){
        fs.unlink(file, next);
      }, done);
    });
  });
});