var pathFn = require('path'),
  fs = require('fs'),
  imageSize = require('image-size'),
  _ = require('lodash'),
  stylus = require('stylus'),
  nodes = stylus.nodes,
  utils = require('./utils'),
  SpriteMap = require('./nodes/sprite-map'),
  SpriteFile = require('./nodes/sprite-file');

var Sprite = module.exports = function(options){
  var baseDir = options.base_dir,
    imageDir = pathFn.join(baseDir, options.image_dir),
    cacheDir = pathFn.join(baseDir, options.cache_dir),
    baseUrl = options.base_url,
    imageUrl = baseUrl + options.image_url,
    defaultLayout = options.layout,
    defaultSpacing = options.spacing;

  var imageInfo = function(path){
    var src = pathFn.join(imageDir, path),
      exist = fs.existsSync(src);

    return exist ? imageSize(src) : {};
  };

  return {
    spriteMap: function(path, layout, spacing){
      utils.assertString(path, 'path');
      if (layout) utils.assertString(layout, 'layout');
      if (spacing) utils.assertType(spacing, 'unit', 'spacing');

      return new SpriteMap({
        path: path.string,
        imageDir: imageDir,
        cacheDir: cacheDir,
        layout: layout ? layout.string : defaultLayout,
        spacing: spacing ? spacing.val : defaultSpacing
      });
    },
    spriteUrl: function(map){
      utils.assertType(map, 'spritemap', 'map');

      return new nodes.Literal('url("' + imageUrl + '/' + map.id + '.png")');
    },
    spriteFile: function(map, name){
      utils.assertType(map, 'spritemap', 'map');
      utils.assertString(name, 'name');

      var file = new SpriteFile(map.file(name.string));
      if (!file) throw new Error('File "' + name.string + '" not found');

      return utils.coerce(file, true);
    },
    spriteFilePath: function(map, name){
      utils.assertType(map, 'spritemap', 'map');
      utils.assertString(name, 'name');

      var file = map.file(name.string);
      if (!file) throw new Error('File "' + name.string + '" not found');

      return file.path;
    },
    spritePosition: function(map, name, offsetX, offsetY){
      utils.assertType(map, 'spritemap', 'map');
      utils.assertString(name, 'name');
      if (offsetX) utils.assertType(offsetX, 'unit', 'offset-x');
      if (offsetY) utils.assertType(offsetY, 'unit', 'offset-y');

      var file = map.file(name.string);
      if (!file) throw new Error('File "' + name.string + '" not found');

      var x = new nodes.Unit(-file.x, 'px'),
        y = new nodes.Unit(-file.y, 'px');

      return [offsetX ? x.operate('+', offsetX) : x, offsetY ? y.operate('+', offsetY) : y];
    },
    imageWidth: function(path){
      utils.assertString(path, 'path');

      var info = imageInfo(path.string);

      return new nodes.Unit(info.width, 'px');
    },
    imageHeight : function(path){
      utils.assertString(path, 'path');

      var info = imageInfo(path.string);

      return new nodes.Unit(info.height, 'px');
    },
    imageUrl: function(path){
      utils.assertString(path, 'path');

      return new nodes.Literal('url("' + imageUrl + '/' + path.string + '")');
    },
    retinaFilePath: function(path, modifier){
      utils.assertString(path, 'path');
      if (modifier) utils.assertString(modifier, 'modifier');

      return utils.retinaFilePath(path.string, modifier ? modifier.string : '@2x');
    },
    retinaSpriteMap: function(path, path2x, layout, spacing){
      utils.assertString(path, 'path');
      if (path2x) utils.assertString(path2x, 'path2x');
      if (layout) utils.assertString(layout, 'layout');
      if (spacing) utils.assertType(spacing, 'unit', 'spacing');

      var options = {
        imageDir: imageDir,
        cacheDir: cacheDir,
        layout: layout ? layout.string : defaultLayout,
        spacing: spacing ? spacing.val : defaultSpacing
      };

      return [
        new SpriteMap(_.extend({
          path: path2x ? path.string : path.string.replace(/\*(\.\w+)$/, '!(*@2x)$1')
        }, options)),
        new SpriteMap(_.extend({
          path: path2x ? path2x.string : utils.retinaFilePath(path.string, '@2x'),
          suffix: '@2x'
        }, options, {spacing: options.spacing * 2}))
      ];
    }
  };
};