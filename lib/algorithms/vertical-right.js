module.exports = function(map, files){
  var spacing = map.spacing,
    length = files.length,
    y = 0,
    width = 0,
    height = 0,
    i = 0;

  // Get max width
  for (i = 0; i < length; i++){
    var fileWidth = files[i].width;
    if (fileWidth > width) width = fileWidth;
  }

  for (i = 0; i < length; i++){
    var file = files[i],
      fileWidth = file.width,
      fileHeight = file.height;

    height += fileHeight;

    file.x = width - fileWidth;
    file.y = y;

    y += fileHeight + spacing;
  }

  return {
    width: width,
    height: height + spacing * (length - 1)
  };
};