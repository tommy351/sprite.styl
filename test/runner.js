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

var casePath = pathFn.join(__dirname, 'cases'),
  spritePath = pathFn.join(__dirname, 'sprites'),
  algorithmPath = pathFn.join(__dirname, 'algorithms'),
  imagePath = pathFn.join(__dirname, 'images'),
  cachePath = pathFn.join(__dirname, '.stylus_cache');

var md5 = function(str){
  return crypto.createHash('md5').update(str).digest('hex');
};

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

var getSpriteId = function(path, callback){
  fs.readFile(pathFn.join(cachePath, md5(path)), 'utf8', function(err, content){
    if (err) return callback(err);

    var obj = JSON.parse(content);

    callback(null, obj.id);
  });
};

var compareImage = function(a, b, callback){
  async.map([a, b], checksum, function(err, results){
    if (err) return callback(err);

    results[0].should.eql(results[1]);
    callback();
  });
};

describe('integration', function(){
  var cases = findCases(casePath);

  cases.forEach(function(test){
    it(test, function(done){
      compareStyl(pathFn.join(casePath, test), done);
    });
  });
});

describe('sprites', function(){
  var cases = _.difference(findCases(spritePath), ['retina-sprite']),
    algorithms = findCases(algorithmPath);

  before(function(done){
    fs.readdir(imagePath, function(err, list){
      if (err) throw err;

      imageFiles = list;
      done();
    });
  });

  algorithms.forEach(function(test){
    it(test, function(done){
      var path = pathFn.join(algorithmPath, test);

      async.auto({
        styl: function(next){
          fs.readFile(path + '.styl', 'utf8', next);
        },
        render: ['styl', function(next, results){
          renderStyl(path + '.styl', results.styl, next);
        }],
        id: ['render', function(next){
          getSpriteId('icons/*.png', next);
        }],
        css: function(next){
          fs.readFile(path + '.css', 'utf8', next);
        },
        compare: ['render', 'id', 'css', function(next, results){
          var css = handlebars.compile(results.css)(results);

          results.render.should.eql(css);
          next();
        }],
        img: ['id', function(next, results){
          compareImage(pathFn.join(imagePath, results.id + '.png'), path + '.png', next);
        }]
      }, done);
    });
  });

  it('retina-sprite', function(done){
    var path = pathFn.join(spritePath, 'retina-sprite');

    async.auto({
      styl: function(next){
        fs.readFile(path + '.styl', 'utf8', next);
      },
      render: ['styl', function(next, results){
        renderStyl(path + '.styl', results.styl, next);
      }],
      id: ['render', function(next){
        getSpriteId('retina/!(*@2x).png', next);
      }],
      id2x: ['render', function(next){
        getSpriteId('retina/*@2x.png', next);
      }],
      css: function(next){
        fs.readFile(path + '.css', 'utf8', next);
      },
      compare: ['render', 'id', 'id2x', 'css', function(next, results){
        var css = handlebars.compile(results.css)(results);

        results.render.should.eql(css);
        next();
      }],
      img: ['id', function(next, results){
        compareImage(pathFn.join(imagePath, results.id + '.png'), path + '.png', next);
      }],
      img2x: ['id2x', function(next, results){
        compareImage(pathFn.join(imagePath, results.id2x + '.png'), path + '@2x.png', next);
      }]
    }, done);
  });

  cases.forEach(function(test){
    it(test, function(done){
      compareStyl(pathFn.join(spritePath, test), done);
    });
  });

  after(function(done){
    async.auto({
      sprites: function(next){
        glob(pathFn.join(imagePath, '*.png'), next);
      },
      removeSprites: ['sprites', function(next, results){
        async.each(results.sprites, function(file, next){
          fs.unlink(file, next);
        }, next);
      }],
      cache: function(next){
        fs.readdir(cachePath, next);
      },
      removeCache: ['cache', function(next, results){
        async.each(results.cache, function(file, next){
          fs.unlink(pathFn.join(cachePath, file), next);
        }, next);
      }],
      removeCacheDir: ['removeCache', function(next){
        fs.rmdir(cachePath, next);
      }]
    }, done);
  });
});