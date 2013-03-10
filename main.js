pixscale  = 6;
tswidth  = 250.5;
tsheight = 400.5;

gridOn             = true;
axesOn             = true;
cursorOn           = true;
tileRestrictOn     = true;
checkerboardOn     = true;
fullCheckerboardOn = false;


xoffset     = 0;
yoffset     = 0;
lastX       = 0;
lastY       = 0;
primarycolorid   = 1;
secondarycolorid = 2;
mousedown   = false;
spacedown   = false;
position    = false;
confirmexit = false;
currentTool = 'pencil';
rendercount = 0;
trcoord     = {x: 0, y: 0};
clipboardtile = false;
clipprevtool = 'cuttile';  

doc = {
  tilesize: 8,
  stage: {},
  tiles: {},
  palette: [
    [  0,  0,  0,255], // Black
    [255,255,255,255], // White
    [255,  0,  0,255], // Red
    [  0,255,  0,255], // Green
    [  0,  0,255,255], // Blue
    [  0,255,255,255], // Cyan
    [255,255,  0,255], // Yellow
    [255,  0,255,255], // Magenta
    [255,255,255,255],
    [255,255,255,255],
    [255,255,255,255],
    [255,255,255,255],
    [255,255,255,255],
    [255,255,255,255],
    [255,255,255,255],
    [255,255,255,255],
    [255,255,255,255],
    [255,255,255,255],
    [255,255,255,255],
    [255,255,255,255]
  ],
  
  tilecounter: 0,
  
  
  addTile: function() {
    this.tilecounter++;
    var t = [];
    for (var i = 0; i < this.tilesize; i++) {
      t[i] = [];
      for (var j = 0; j < this.tilesize; j++) {
        t[i][j] = [0,0,0,0]; // Transparent black
      }
    }
    
    this.tiles[this.tilecounter] = t;
    redraw();
    confirmexit = true;
    return this.tilecounter;
  },
  removeTile: function(id) {
    delete this.tiles[id];
    confirmexit = true;
  },
  setTilePixel: function(id, x, y, pixel) {
    if(!this.tiles[id] || x >= this.tilesize || y >= this.tilesize){
      return false;
    }
    this.tiles[id][x][y] = pixel;
    redraw();
    confirmexit = true;
    return true;
  },


  stageTile: function(x, y, tile) {
    if (!this.stage[x]) {
      this.stage[x] = {};
    }
    this.stage[x][y] = tile;
    confirmexit = true;
    redraw();
  },
  unstageTile: function(x, y) {
    if(this.stage[x]) {
      if(this.stage[x][y]) {
        delete this.stage[x][y];
      }
    }
    confirmexit = true;
    redraw();
  },
  stageCoordToTileID: function(x, y) {
    if (!this.stage[x] || !this.stage[x][y]) {
      return false;
    }
    
    return this.stage[x][y];
  },
  save: function(name) {
    if (!name){
      name = "doc1";
    }
    window.localStorage.setItem(name, JSON.stringify(this));
    confirmexit = false;
  },
  load: function(name) {
    if (!name){
      name = "doc1";
    }
    obj = JSON.parse(localStorage.getItem(name));
    if (!obj) {
      return false;
    }
    for(var key in obj) {
      this[key] = obj[key];
    }
    redraw();
    this.showPalette();
    confirmexit = false;
    return true;
  },
  
  showPalette: function() {
    for (var n = 1; n <= 20; n++) {
      var c = this.palette[n-1];
      var selector = '#palette-' + n;
      $(selector).css('background-color', 'rgba('+c[0]+','+c[1]+','+c[2]+','+c[3]+')');
      
      if (n == primarycolorid && n == secondarycolorid) {
        $(selector).text("PS");
      } else if (n == primarycolorid) {
        $(selector).text("P");
      } else if (n == secondarycolorid) {
        $(selector).text("S");
      } else {
        $(selector).text("");
      }
    }
  }
}

tools = {
  pencil:    function(tileid, position, color) {
    if (!tileid) {
      tileid = doc.addTile();
      doc.stageTile(position.tile.x, position.tile.y, tileid);
    }
    doc.setTilePixel(tileid, position.tilepixel.x, position.tilepixel.y, color);
  },
  eraser:    function(tileid, position, color) {
    if (!tileid) {
      tileid = doc.addTile();
      doc.stageTile(position.tile.x, position.tile.y, tileid);
    }
    doc.setTilePixel(tileid, position.tilepixel.x, position.tilepixel.y, [0,0,0,0]);
  },
  unstage:   function(tileid, position, color) {
    doc.unstageTile(position.tile.x, position.tile.y);
  },
  cuttile:   function(tileid, position, color) {
    clipboardtile = tileid;
    doc.unstageTile(position.tile.x, position.tile.y);
    setTool('pastetile');
  },
  copytile:  function(tileid, position, color) {
    clipboardtile = tileid;
    setTool('pastetile');
  },
  pastetile: function(tileid, position, color) {
    tileRestrictOn = false;
    if (clipboardtile) {
      doc.stageTile(position.tile.x, position.tile.y, clipboardtile);
    }
  },
}


function redraw() {
  var startTime = new Date().getTime();
  
  rendercount++;
  

  
  // Check constraints
  var stagesize = 100 * tileWidth();
  if (xoffset > stagesize)
    xoffset = stagesize;
  if (xoffset < -1 * stagesize)
    xoffset = -1 * stagesize;
  if (yoffset > stagesize)
    yoffset = stagesize;
  if (yoffset < -1 * stagesize)
    yoffset = -1 * stagesize;
    
  
  // Reset canvas and adjust size
  canvas.width  = window.innerWidth - $(".left.bar").width();
  canvas.height = window.innerHeight - $(".top.bar").height();
  
  // Background color
  cv.fillStyle = "#fff";
  cv.fillRect(0, 0, canvas.width, canvas.height);
  
  if (fullCheckerboardOn && pixscale > 5) {
    // This does not run by default
    var cbox = xoffset % pixscale;
    var cboy = yoffset % pixscale;
    var cbs  = pixscale / 2;
    
    if (cbox > 0) {
      cbox = -1 * pixscale + cbox;
    }
    if (cboy > 0) {
      cboy = -1 * pixscale + cboy;
    }
      
    cv.fillStyle = "#eee";
    
    for(var i = -1; i < canvas.width + pixscale; i += pixscale) {
      for(var j = -1; j < canvas.height + pixscale; j += pixscale) {
        cv.fillRect(i + cbox, j + cboy, cbs, cbs);
        cv.fillRect(i + cbox + cbs, j + cboy + cbs, cbs, cbs);
      }   
    }
    
  }
  
  
  ////////////////////
  // DRAW THE STAGE //
  ////////////////////
  
  // Draw tiles
  $.each(doc.stage, function(x, ar){
    $.each(ar, function(y, t){
      if (t && doc.tiles[t]) {
        drawTile(doc.tiles[t], x, y, pixscale);
      }
    });
  });
  
  // Draw grid
  if (gridOn) {
    cv.beginPath();
    cv.strokeStyle = "#888";
    cv.lineWidth = 1;
    if (pixscale >= 3){
      

      var xcoord = xoffset % tileWidth() - tileWidth();
      for (var i = 0; i < canvas.width + tileWidth(); i = i + tileWidth()) {
        xcoord = xcoord + tileWidth();

        cv.moveTo(xcoord + 0.5, 0);
        cv.lineTo(xcoord + 0.5, canvas.height);
      }
      var ycoord = yoffset % tileWidth() - tileWidth();
      for (var i = 0; i < canvas.height + tileWidth(); i = i + tileWidth()) {
        ycoord = ycoord + tileWidth();

        cv.moveTo(0, ycoord + 0.5);
        cv.lineTo(canvas.width, ycoord + 0.5);
      }
    }
    cv.stroke();
  }


  // Draw axes
  if (axesOn) {
    cv.beginPath();
    cv.strokeStyle = "#f00";
    cv.lineWidth = 1;
    cv.moveTo(xoffset + 0.5, 0);
    cv.lineTo(xoffset + 0.5, canvas.height);
    cv.moveTo(0, yoffset  + 0.5);
    cv.lineTo(canvas.width, yoffset + 0.5);
    cv.stroke();
  }
    
  // Draw tile cursor
  if (cursorOn && position) {
    cv.beginPath();
    cv.strokeStyle = "#000";
    cv.lineWidth = 2;
    
    var initx = position.tile.x * tileWidth() + xoffset;
    var inity = position.tile.y * tileWidth() + yoffset;
    cv.strokeRect(initx, inity, tileWidth(), tileWidth());
  }
  
  
  
  ////////////////////////
  // DRAW THE TILESHEET //
  ////////////////////////
  
  // Box thing
  cv.fillStyle   = "black";
  cv.strokeStyle = "black";
  cv.lineWidth   = 1;
  
  cv.fillRect(canvas.width - tswidth, canvas.height - tsheight, tswidth, tsheight);
  cv.strokeRect(canvas.width - tswidth, canvas.height - tsheight, tswidth, tsheight);
  
  // Tiles
  var tct = 0;
  var ss = 2;
  for (i = 0; i <= 10 ; i++) {
    for (j = 0; j <= 10; j++) {
      tct++;
      var xloc = canvas.width - tswidth + 0.5 + i * ss * doc.tilesize;
      var yloc = canvas.height - tsheight + 0.5  + j * ss * doc.tilesize;
      if (!doc.tiles[tct])
        break;
      cv.fillStyle   = "white";
      cv.fillRect(xloc, yloc, ss * doc.tilesize, ss * doc.tilesize);
      drawTileRaw(doc.tiles[tct], xloc, yloc, ss);
    }
  }
  
  
  
  
  
  // Record time/framerate
  var stopTime = new Date().getTime();
  var renderTime = stopTime - startTime;
  var framerate = Math.round(1.0 / (renderTime / 1000));
  $('#framerate').text("Render Time: " + renderTime + "ms");
}

function drawTileRaw(tiledata, gx, gy, scale) {
  for (var i=0; i < doc.tilesize; i++) {
    for (var j=0; j < doc.tilesize; j++) {
      var pixel = tiledata[j][i];
      cv.fillStyle = "rgba(" + pixel[0] + ", "+ pixel[1] + ", "+ pixel[2] + ", "+ pixel[3] + ")";
      var x = gx + j * scale;
      var y = gy + i * scale;
      cv.fillRect(x, y, scale, scale);
    }
  }
}

function drawTile(tiledata, gridx, gridy, pixscale) {
  if (checkerboardOn && pixscale > 5) {
    var cbs  = pixscale / 2;
    
    cv.fillStyle = "#eee";
    
    for(var i = 0; i < tileWidth(); i += pixscale) {
      for(var j = 0; j < tileWidth(); j += pixscale) {
        cv.fillRect(xoffset + gridx * tileWidth() +  i,       yoffset + gridy * tileWidth() + j,       cbs, cbs);
        cv.fillRect(xoffset + gridx * tileWidth() + i + cbs,  yoffset + gridy * tileWidth() + j + cbs, cbs, cbs);
      }   
    }
    
  }
  drawTileRaw(tiledata, xoffset + gridx * tileWidth(), yoffset + gridy * tileWidth(), pixscale);
}

function getCursorPosition (e) {
  if (typeof e.pageX !== 'undefined' && typeof e.pageY !== 'undefined') {
    var x = e.pageX;
    var y = e.pageY;
  } else {
    var x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    var y = e.clientY + document.body.scrollTop  + document.documentElement.scrollTop;
  }

  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;

  // Absolute (correct for scroll)
  var xa = x - xoffset;
  var ya = y - yoffset;
  
  // Absolute - tile pixel (and for scale)
  var xs = Math.floor(xa / pixscale);
  var ys = Math.floor(ya / pixscale);
  
  // Find tile coord
  var xt = Math.floor(xs / doc.tilesize);
  var yt = Math.floor(ys / doc.tilesize);
  
  // And the pixel within that tile
  var xp = xs % doc.tilesize;
  var yp = ys % doc.tilesize;
  if (xp < 0)
    xp = doc.tilesize + xp;
  if (yp < 0)
    yp = doc.tilesize + yp;
  
  coord = {
    tile: {x: xt, y: yt },
    tilepixel: {x: xp , y: yp},
    absolute: {x: xs, y: ys},
    raw: {x: x, y: y}
  };
  
  $('#tilecoord').text('Tile: (' + xt + ',' + yt + ')');
  $('#tilepix').text('Pixel: (' + xp + ',' + yp + ')');
  return coord;
}

function tileWidth(){
  return doc.tilesize * pixscale;
}



$(function() {
  window.canvas = document.getElementById('editcanvas')
  window.cv = canvas.getContext('2d');
  
  doc.load();
  xoffset = (canvas.width - tswidth + 0.5) / 2 ;
  yoffset = canvas.height / 2;
  redraw();
  
  $(canvas).mousedown(function(e) {
    position = getCursorPosition(e);
    mousedown = true;
    
    trcoord = position.tile;
    
    applyCurrentTool(e);

    lastX = 0;
    lastY = 0;
  }).mouseup(function(e) {       
    mousedown = false;
  });
  
  $(document).keydown('space', function () {
    spacedown = true;
  }).keyup('space', function () {
    spacedown = false;
  });
  
  $(canvas).mousemove(function(e){
    if (spacedown && mousedown) {
      // Scroll
      var X = e.pageX;
      var Y = e.pageY;
      if (!lastX || !lastY) {
        lastX = X;
        lastY = Y;
      }
      
      xoffset = xoffset - (lastX - X);
      yoffset = yoffset - (lastY - Y);
      
      lastX = X;
      lastY = Y;
      
      redraw();
    } else {
      position = getCursorPosition(e);
      
      if ((position.tile.x == trcoord.x && position.tile.y == trcoord.y) || !tileRestrictOn) {
        applyCurrentTool(e);
      }
      redraw();
    }
  });
  
  $(canvas).mousewheel(function (e, delta) {
    e.preventDefault();
    
    var scalemin = 1;
    var scalemax = 100;
    var zoomunit = 1;
    
    if (delta > 0)
      pixscale += zoomunit * Math.sqrt(pixscale);
    else if (delta < 0)
      pixscale -= zoomunit * Math.sqrt(pixscale);
    
    pixscale = Math.round(pixscale);
    if (pixscale < scalemin) { 
      pixscale = scalemin;
    } else if (pixscale > scalemax) {
      pixscale = scalemax;
    } 
         
    xoffset = Math.round(position.raw.x - (position.absolute.x + 0.5) * pixscale);
    yoffset = Math.round(position.raw.y - (position.absolute.y + 0.5) * pixscale); 
    
    //# Make sure cursor stays under mouse
    position = getCursorPosition(e);
    
    redraw();
  });
  
  $('.palette-color').mousedown(function(e) {
    var id = e.target.id;
    id = +id.substr(8);
    if (e.which == 1) {
      primarycolorid = id;
    } else if (e.which == 3) {
      secondarycolorid = id;
    }
    
    doc.showPalette();
  });
  
  $('.tool').mousedown(function(e) {
    setTool(e.target.id.substr(8));
  });
  
  
  $('#set-pri-col').ColorPicker({
    onSubmit: function(hsb, hex, rgb, el) {
      var c = [rgb.r, rgb.g, rgb.b, 255];
      doc.palette[primarycolorid - 1] = c;
      confirmexit = true;
      doc.showPalette();
      $(el).ColorPickerHide();
    },
    onBeforeShow: function () {
      var c = doc.palette[primarycolorid - 1];
		  $(this).ColorPickerSetColor({r: c[0], g: c[1], b: c[2]});
	  }
  });
  $('#set-sec-col').ColorPicker({
    onSubmit: function(hsb, hex, rgb, el) {
      var c = [rgb.r, rgb.g, rgb.b, 255];
      doc.palette[secondarycolorid - 1] = c;
      confirmexit = true;
      doc.showPalette();
      $(el).ColorPickerHide();
    },
    onBeforeShow: function () {
      var c = doc.palette[secondarycolorid - 1];
		  $(this).ColorPickerSetColor({r: c[0], g: c[1], b: c[2]});
	  }
  });
  
  $('#menubar>li>span').click(function(e){
    e.preventDefault();
    $(e.target).next().toggle();
  }).on('selectstart', function(e){
    e.preventDefault();
  });
  
  $('#menubar>li>.dropdown').hide();
  $('#menu-file-save').click(function(e) { doc.save(); $('#menu-file').hide() });
  $('#menu-file-load').click(function(e) { doc.load(); $('#menu-file').hide() });
  
  window.onresize = function(e) {
    position = getCursorPosition(e);
    redraw();
  }  
  
  window.oncontextmenu = function() { return false };
  
  window.onbeforeunload = confirmExit;
  function confirmExit(){
    if (confirmexit) {
      spacedown = false;
      return "You have unsaved changes.";
    }
  }
  
});

function applyCurrentTool(e) {
  var tileid = doc.stageCoordToTileID(position.tile.x, position.tile.y);
  
  if (mousedown && !spacedown) { 
    // Clicking but not scrolling: apply tool
    
    if (e.which == 1) {
      // Left click
      var color = doc.palette[primarycolorid-1]; 
    } else { //if (e.which == 3) {
      // Right click
      var color = doc.palette[secondarycolorid-1]; 
    }
    tools[currentTool](tileid, position, color);
    confirmexit = true;
  }
}

function setTool(tool){
  $('.tool').removeClass('selected');
  $('#toolkit-'+tool).addClass('selected');
  tileRestrictOn = true;
  currentTool = tool;
}
