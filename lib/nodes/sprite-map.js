var pathFn = require('path'),
  pathSep = pathFn.sep,
  fs = require('fs'),
  imageSize = require('image-size'),
  glob = require('glob'),
  _ = require('lodash'),
  Canvas = require('canvas'),
  Image = Canvas.Image,
  stylus = require('stylus'),
  nodes = stylus.nodes,
  Cache = require('../cache'),
  utils = require('../utils'),
  algorithms = require('../algorithms');

var generateId = function(path){
  return pathFn.dirname(path).replace(/\/|\\/g, '_') + '-' + utils.uid(12);
};

var SpriteMap = module.exports = function SpriteMap(options){
  var path = this.path = options.path,
    imageDir = this.imageDir = options.imageDir,
    cacheDir = this.cacheDir = options.cacheDir,
    layout = this.layout = utils.camelize(options.layout),
    spacing = this.spacing = options.spacing,
    suffix = this.suffix = options.suffix || '',
    cache = this.cache = new Cache(pathFn.join(cacheDir, utils.md5(path)));

  cache.load();

  if (cache.layout === layout && cache.spacing === spacing){
    this.id = cache.id;
    this.map = cache.map;
  } else {
    // Remove old sprite file
    if (cache.id){
      var oldFile = pathFn.join(imageDir, cache.id + '.png');

      if (fs.existsSync(oldFile)){
        fs.unlinkSync(oldFile);
      }
    }

    // Reset data if configs changed
    this.id = cache.id = generateId(path);
    cache.layout = layout;
    cache.spacing = spacing;
    cache.suffix = suffix;
    this.map = cache.map = [];
  }

  this.init();
};

SpriteMap.prototype.__proto__ = nodes.Node.prototype;

SpriteMap.prototype.init = function(){
  var imageDir = this.imageDir,
    layout = this.layout,
    map = this.map,
    files = glob.sync(this.path, {cwd: imageDir}),
    length = files.length,
    src = {},
    mtime = {},
    changed = true;

  if (!length) return;

  // Read stats
  files.forEach(function(file){
    var path = src[file] = pathFn.join(imageDir, file);
    mtime[file] = fs.statSync(path).mtime.getTime();
  });

  // Compare between old and new list
  if (_.pluck(map, 'path').join() === files.join()){
    // Compare mtime
    changed = false;

    for (var i = 0; i < length; i++){
      var file = files[i],
        stats = fs.statSync(src[file]);

      if (stats.mtime.getTime() !== mtime[file]){
        changed = true;
        break;
      }
    }
  }

  if (changed){
    map.length = 0;
  } else {
    return;
  }

  var images = [];

  files.forEach(function(file){
    var path = src[file],
      buf = fs.readFileSync(path),
      size = imageSize(buf),
      width = size.width,
      height = size.height;

    images.push({
      path: file,
      buffer: buf,
      width: size.width,
      height: size.height
    });
  });

  var result = (algorithms[layout] || algorithms.vertical)(this, images),
    canvas = new Canvas(result.width, result.height),
    ctx = canvas.getContext('2d');

  images.forEach(function(data){
    var img = new Image(),
      path = data.path,
      width = data.width,
      height = data.height,
      x = data.x,
      y = data.y;

    img.src = data.buffer;
    ctx.drawImage(img, x, y, width, height);

    map.push({
      path: path,
      x: x,
      y: y,
      width: width,
      height: height,
      mtime: mtime[path]
    });
  });

  fs.writeFileSync(pathFn.join(imageDir, this.id + '.png'), canvas.toBuffer());
  images.length = 0;

  this.cache.save();
};

SpriteMap.prototype.file = function(name){
  var map = this.map,
    suffix = this.suffix;

  for (var i = 0, mapLength = map.length; i < mapLength; i++){
    var item = map[i],
      path = item.path,
      ext = suffix + pathFn.extname(path),
      extLength = ext.length,
      split = path.split(pathSep),
      splitLength = split.length;

    for (var j = 0; j < splitLength; j++){
      var str = split.slice(j, splitLength).join(pathSep);

      if (str === name || str.substring(0, str.length - extLength) === name){
        return item;
      }
    }
  }
};