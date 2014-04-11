var pathFn = require('path'),
  pathSep = pathFn.sep,
  fs = require('fs'),
  imageSize = require('image-size'),
  glob = require('glob'),
  Canvas = require('canvas'),
  Image = Canvas.Image,
  stylus = require('stylus'),
  nodes = stylus.nodes;

var uid = function(length){
  var src = 'abcdefghijklmnopqrstuvwxyz0123456789',
    srcLen = src.length,
    result = '';

  for (var i = 0; i < length; i++){
    result += src[parseInt(Math.random() * srcLen, 10)];
  }

  return result;
};

var generateId = function(path){
  return pathFn.dirname(path).replace(/\/|\\/g, '_') + '-' + uid(12);
};

var SpriteMap = module.exports = function SpriteMap(options){
  this.path = options.path;
  this.imageDir = options.imageDir;
  this.cacheDir = options.cacheDir;
  this.layout = options.layout;
  this.spacing = options.spacing;
  this.id = generateId(this.path);
  this.map = [];
  this.width = 0;
  this.height = 0;

  this.init();
};

SpriteMap.prototype.__proto__ = nodes.Node.prototype;

// TODO cache
SpriteMap.prototype.init = function(){
  var imageDir = this.imageDir,
    layout = this.layout,
    spacing = this.spacing,
    files = glob.sync(this.path, {cwd: imageDir}),
    length = files.length,
    self = this;

  if (!length) return;

  var maxWidth = 0,
    maxHeight = 0,
    totalWidth = 0,
    totalHeight = 0,
    images = [];

  files.forEach(function(file){
    var src = pathFn.join(imageDir, file),
      buf = fs.readFileSync(src),
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

  var canvasWidth = this.width = 0,
    canvasHeight = this.height = 0;

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
    var img = new Image();
    img.src = data.buffer;
    ctx.drawImage(img, x, y, data.width, data.height);

    self.map.push({
      path: data.file,
      x: x,
      y: y
    });

    if (layout === 'horizontal' || layout === 'diagonal') x += data.width + spacing;
    if (layout !== 'horizontal') y += data.height + spacing;
  });

  fs.writeFileSync(pathFn.join(imageDir, this.id + '.png'), canvas.toBuffer());
  images.length = 0;
};

SpriteMap.prototype.findFile = function(name){
  var map = this.map;

  for (var i = 0, mapLength = map.length; i < mapLength; i++){
    var item = map[i],
      path = item.path,
      ext = pathFn.extname(path),
      extLength = ext.length,
      split = path.split(pathSep),
      splitLength = split.length;

    for (var j = 0; j < splitLength; j++){
      var str = split.slice(j, splitLength).join(pathSep);

      if (str === name || str.substring(0, str.length - extLength) === name){
        return map[i];
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