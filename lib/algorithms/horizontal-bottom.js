module.exports = function(map, files){
  var spacing = map.spacing,
    length = files.length,
    x = 0,
    width = 0,
    height = 0,
    i = 0;

  // Get max height
  for (i = 0; i < length; i++){
    var fileHeight = files[i].height;
    if (fileHeight > height) height = fileHeight;
  }

  for (i = 0; i < length; i++){
    var file = files[i],
      fileWidth = file.width,
      fileHeight = file.height;

    width += fileWidth;

    file.x = x;
    file.y = height - fileHeight;

    x += fileWidth + spacing;
  };

  return {
    width: width + spacing * (length - 1),
    height: height
  };
};