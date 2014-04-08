var pathFn = require('path'),
  _ = require('lodash'),
  fs = require('fs'),
  imageSize = require('image-size'),
  glob = require('glob'),
  Canvas = require('canvas'),
  Image = Canvas.Image,
  stylus = require('stylus'),
  nodes = stylus.nodes,
  utils = stylus.utils;

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

var Sprite = module.exports = function(options){
  var baseDir = options.base_dir,
    imageDir = pathFn.join(baseDir, options.image_dir),
    cachePath = pathFn.join(baseDir, options.cache_path),
    baseUrl = options.base_url,
    imageUrl = baseUrl + options.image_url,
    layout = options.layout,
    cache = {};

  var globOptions = {
    cwd: imageDir
  };

  var loadCache = function(){
    var exist = fs.existsSync(cachePath);

    if (exist){
      cache = require(cachePath);
    } else {
      cache = {
        files: {},
        lists: {},
        sprites: {}
      };
    }
  };

  var saveCache = function(){
    fs.writeFileSync(cachePath, JSON.stringify(cache));
  };

  var getFileCache = function(path){
    return cache.files[path];
  };

  var imageInfo = function(path){
    var data = getFileCache(path),
      src = pathFn.join(imageDir, path),
      exist = fs.existsSync(src);

    if (!exist){
      data = null;
      return {};
    }

    var stats = fs.statSync(src),
      mtime = stats.mtime.getTime();

    if (data && data.mtime === mtime){
      return data;
    }

    var size = imageSize(src);

    data = {
      mtime: mtime,
      width: size.width,
      height: size.height
    };

    return data;
  };

  var spriteFn = function(path){
    //
  };

  loadCache();

  return {
    spriteMap: function(path){
      utils.assertString(path, 'path');

      var val = path.val,
        list = cache.lists[val],
        files = glob.sync(val, globOptions),
        changed = [],
        statObj = {},
        images = [];

      if (!files.length){
        return;
      }

      // Check whether files are modified or not
      files.forEach(function(file){
        var data = getFileCache(file),
          src = pathFn.join(imageDir, file),
          stats = statObj[file] = fs.statSync(src);

        if (!data || data.mtime !== stats.mtime.getTime()){
          changed.push(file);
        }
      });

      if (!changed.length && list && JSON.stringify(list.files) === JSON.stringify(files)){
        return spriteFn(val);
      }

      // Read files
      var maxWidth = 0,
        maxHeight = 0,
        totalWidth = 0,
        totalHeight = 0;

      files.forEach(function(file){
        var src = pathFn.join(imageDir, file),
          buf = fs.readFileSync(src),
          size = imageSize(buf),
          data = getFileCache(file),
          width = size.width,
          height = size.height;

        data = {
          mtime: statObj[file].mtime,
          width: width,
          height: height
        };

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

      var x = 0,
        y = 0,
        canvas,
        ctx;

      var sprite = cache.sprites[val] = {
        id: generateId(val),
        map: {}
      };

      switch (layout){
        case 'horizontal':
          canvas = new Canvas(totalWidth, maxHeight);
          ctx = canvas.getContext('2d');

          images.forEach(function(data){
            var img = new Image();
            img.src = data.buffer;
            ctx.drawImage(img, x, y, data.width, data.height);

            sprite.map[data.file] = {
              x: x,
              y: y
            };

            x += data.width;
          });

          break;

        case 'diagonal':
          canvas = new Canvas(totalWidth, totalHeight);
          ctx = canvas.getContext('2d');

          images.forEach(function(data){
            var img = new Image();
            img.src = data.buffer;
            ctx.drawImage(img, x, y, data.width, data.height);

            sprite.map[data.file] = {
              x: x,
              y: y
            };

            x += data.width;
            y += data.height;
          });

          break;

        default: // vertical
          canvas = new Canvas(maxWidth, totalHeight);
          ctx = canvas.getContext('2d');

          images.forEach(function(data){
            var img = new Image();
            img.src = data.buffer;
            ctx.drawImage(img, x, y, data.width, data.height);

            sprite.map[data.file] = {
              x: x,
              y: y
            };

            y += data.height;
          });
      }

      fs.writeFileSync(pathFn.join(imageDir, sprite.id + '.png'), canvas.toBuffer());
      images.length = 0;

      return spriteFn(val);
    },
    imageWidth: function(path){
      utils.assertString(path, 'path');

      var info = imageInfo(path.val);

      return new nodes.Unit(info.width, 'px');
    },
    imageHeight : function(path){
      utils.assertString(path, 'path');

      var info = imageInfo(path.val);

      return new nodes.Unit(info.height, 'px');
    },
    imageUrl: function(path){
      utils.assertString(path, 'path');

      return new nodes.Literal('url("' + imageUrl + '/' + path.val + '")');
    }
  };
};