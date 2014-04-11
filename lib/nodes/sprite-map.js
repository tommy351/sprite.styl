var pathFn = require('path'),
  pathSep = pathFn.sep,
  fs = require('fs'),
  imageSize = require('image-size'),
  glob = require('glob'),
  Canvas = require('canvas'),
  Image = Canvas.Image,
  stylus = require('stylus'),
  nodes = stylus.nodes,
  Cache = require('../cache'),
  utils = require('../utils');

var generateId = function(path){
  return pathFn.dirname(path).replace(/\/|\\/g, '_') + '-' + utils.uid(12);
};

var SpriteMap = module.exports = function SpriteMap(options){
  var path = this.path = options.path,
    imageDir = this.imageDir = options.imageDir,
    cacheDir = this.cacheDir = options.cacheDir,
    layout = this.layout = options.layout,
    spacing = this.spacing = options.spacing,
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
    this.map = cache.map = {};
  }

  this.init();
};

SpriteMap.prototype.__proto__ = nodes.Node.prototype;

SpriteMap.prototype.init = function(){
  var imageDir = this.imageDir,
    layout = this.layout,
    spacing = this.spacing,
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
  if (Object.keys(map).join() === files.join()){
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

  if (!changed) return;

  var maxWidth = 0,
    maxHeight = 0,
    totalWidth = 0,
    totalHeight = 0,
    images = [];

  files.forEach(function(file){
    var path = src[file],
      buf = fs.readFileSync(path),
      size = imageSize(buf),
      width = size.width,
      height = size.height;

    if (width > maxWidth) maxWidth = width;
    if (height > maxHeight) maxHeight = height;

    totalWidth += width;
    totalHeight += height;

    images.push({
      file: file,
      buffer: buf,
      width: width,
      height: height
    });
  });

  var canvasWidth = 0,
    canvasHeight = 0;

  switch (layout){
    case 'horizontal':
      canvasWidth = totalWidth + spacing * (length - 1);
      canvasHeight = maxHeight;
      break;

    case 'diagonal':
      canvasWidth = totalWidth + spacing * (length - 1);
      canvasHeight = totalHeight + spacing * (length - 1);
      break;

    default:
      canvasWidth = maxWidth;
      canvasHeight = totalHeight + spacing * (length - 1);
  }

  var canvas = new Canvas(canvasWidth, canvasHeight),
    ctx = canvas.getContext('2d'),
    x = 0,
    y = 0;

  images.forEach(function(data){
    var img = new Image(),
      width = data.width,
      height = data.height;

    img.src = data.buffer;
    ctx.drawImage(img, x, y, width, height);

    map[data.file] = {
      x: x,
      y: y,
      width: width,
      height: height,
      mtime: mtime[data.file]
    };

    if (layout === 'horizontal' || layout === 'diagonal') x += width + spacing;
    if (layout !== 'horizontal') y += height + spacing;
  });

  fs.writeFileSync(pathFn.join(imageDir, this.id + '.png'), canvas.toBuffer());
  images.length = 0;

  this.cache.save();
};

SpriteMap.prototype.findFile = function(name){
  var map = this.map,
    keys = Object.keys(map);

  for (var i = 0, mapLength = keys.length; i < mapLength; i++){
    var path = keys[i],
      ext = pathFn.extname(path),
      extLength = ext.length,
      split = path.split(pathSep),
      splitLength = split.length;

    for (var j = 0; j < splitLength; j++){
      var str = split.slice(j, splitLength).join(pathSep);

      if (str === name || str.substring(0, str.length - extLength) === name){
        return map[path];
      }
    }
  }
};

SpriteMap.prototype.position = function(name, offsetX, offsetY){
  offsetX = offsetX || 0;
  offsetY = offsetY || 0;

  var file = this.findFile(name);

  return {
    x: file ? -file.x - offsetX : 0,
    y: file ? -file.y - offsetY : 0
  };
};