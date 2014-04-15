module.exports = function(map, files){
  var spacing = map.spacing,
    length = files.length,
    x = 0,
    width = 0,
    height = 0;

  for (var i = 0; i < length; i++){
    var file = files[i],
      fileWidth = file.width,
      fileHeight = file.height;

    width += fileWidth;
    if (fileHeight > height) height = fileHeight;

    file.x = x;
    file.y = 0;

    x += fileWidth + spacing;
  }

  return {
    width: width + spacing * (length - 1),
    height: height
  };
};