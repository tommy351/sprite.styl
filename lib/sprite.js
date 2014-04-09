var pathFn = require('path'),
  fs = require('fs'),
  imageSize = require('image-size'),
  stylus = require('stylus'),
  nodes = stylus.nodes,
  utils = stylus.utils,
  SpriteMap = require('./nodes/sprite-map');

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
      utils.assertType(map, 'spritemap', map);

      return new nodes.Literal('url("' + imageUrl + '/' + map.id + '.png")');
    },
    spritePosition: function(map, name, offsetX, offsetY){
      utils.assertType(map, 'spritemap', map);
      utils.assertString(name, 'name');
      if (offsetX) utils.assertType(offsetX, 'unit', 'offsetX');
      if (offsetY) utils.assertType(offsetY, 'unit', 'offsetY');

      var position = map.position(name.string, offsetX ? offsetX.val : 0, offsetY ? offsetY.val : 0);

      return [new nodes.Unit(position.x, 'px'), new nodes.Unit(position.y, 'px')];
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
    }
  };
};