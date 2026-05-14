window.GameLevels = (function () {
  var W = 800, H = 600;
  var cache = {};
  var _rngFn = Math.random;

  var LEVELS = [
    { id: 1, name: '城市黄昏', theme: '城市', diffCount: 3, timeLimit: 120, diffRadius: 35, difficulty: 1 },
    { id: 2, name: '花园小径', theme: '自然', diffCount: 3, timeLimit: 120, diffRadius: 35, difficulty: 1 },
    { id: 3, name: '温馨客厅', theme: '室内', diffCount: 3, timeLimit: 120, diffRadius: 30, difficulty: 1 },
    { id: 4, name: '霓虹街巷', theme: '城市', diffCount: 5, timeLimit: 90, diffRadius: 28, difficulty: 2 },
    { id: 5, name: '湖畔清晨', theme: '自然', diffCount: 5, timeLimit: 90, diffRadius: 25, difficulty: 2 },
    { id: 6, name: '书房一角', theme: '室内', diffCount: 5, timeLimit: 90, diffRadius: 25, difficulty: 2 },
    { id: 7, name: '未来都市', theme: '城市', diffCount: 7, timeLimit: 60, diffRadius: 22, difficulty: 3 },
    { id: 8, name: '深林秘境', theme: '自然', diffCount: 7, timeLimit: 60, diffRadius: 20, difficulty: 3 },
    { id: 9, name: '厨房忙碌', theme: '室内', diffCount: 7, timeLimit: 60, diffRadius: 18, difficulty: 3 },
    { id: 10, name: '终极挑战', theme: '混合', diffCount: 9, timeLimit: 45, diffRadius: 16, difficulty: 4 }
  ];

  function _rng(seed) {
    var s = seed;
    return function () {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function _drawSky(ctx, r, colors) {
    var grad = ctx.createLinearGradient(0, 0, 0, H * 0.6);
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(0.5, colors[1]);
    grad.addColorStop(1, colors[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H * 0.6);
  }

  function _drawGround(ctx, color1, color2) {
    var grad = ctx.createLinearGradient(0, H * 0.55, 0, H);
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
  }

  function _drawCloud(ctx, x, y, size, color) {
    ctx.fillStyle = color || 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size * 0.8, y - size * 0.3, size * 0.7, 0, Math.PI * 2);
    ctx.arc(x + size * 1.5, y, size * 0.85, 0, Math.PI * 2);
    ctx.arc(x - size * 0.6, y + size * 0.1, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  function _drawStar(ctx, x, y, size, color) {
    ctx.fillStyle = color || '#FFFDE7';
    ctx.beginPath();
    for (var i = 0; i < 5; i++) {
      var angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      var method = i === 0 ? 'moveTo' : 'lineTo';
      ctx[method](x + size * Math.cos(angle), y + size * Math.sin(angle));
    }
    ctx.closePath();
    ctx.fill();
  }

  function _drawTree(ctx, x, y, trunkH, canopyR, trunkColor, canopyColor) {
    ctx.fillStyle = trunkColor || '#5D4037';
    ctx.fillRect(x - 8, y - trunkH, 16, trunkH);
    ctx.fillStyle = canopyColor || '#2E7D32';
    ctx.beginPath();
    ctx.arc(x, y - trunkH - canopyR * 0.5, canopyR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - canopyR * 0.5, y - trunkH, canopyR * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + canopyR * 0.5, y - trunkH, canopyR * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  function _drawBuilding(ctx, x, y, w, h, color, windowColor) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y - h, w, h);
    ctx.fillStyle = windowColor || '#FFF9C4';
    var ww = 8, wh = 10, gap = 16;
    for (var wy = y - h + 15; wy < y - 10; wy += wh + gap) {
      for (var wx = x + 10; wx < x + w - 10; wx += ww + gap) {
        if (_rngFn() > 0.2) {
          ctx.fillRect(wx, wy, ww, wh);
        }
      }
    }
  }

  function _drawFlower(ctx, x, y, size, petalColor, centerColor) {
    ctx.fillStyle = petalColor;
    for (var i = 0; i < 5; i++) {
      var angle = (i * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.arc(x + Math.cos(angle) * size * 0.5, y + Math.sin(angle) * size * 0.5, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = centerColor || '#FFC107';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  function _drawRect(ctx, x, y, w, h, color, radius) {
    ctx.fillStyle = color;
    if (radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(x, y, w, h);
    }
  }

  function _drawCircle(ctx, x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function _drawEllipse(ctx, x, y, rx, ry, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function _drawMoon(ctx, x, y, r, color) {
    ctx.fillStyle = color || '#FFF9C4';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0D1B2A';
    ctx.beginPath();
    ctx.arc(x + r * 0.3, y - r * 0.1, r * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  function _drawSun(ctx, x, y, r) {
    var grad = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
    grad.addColorStop(0, '#FFF176');
    grad.addColorStop(0.3, '#FFD54F');
    grad.addColorStop(1, 'rgba(255,183,77,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function _drawMountain(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w / 2, y - h);
    ctx.lineTo(x + w, y);
    ctx.closePath();
    ctx.fill();
  }

  function _drawFence(ctx, x, y, w, color) {
    ctx.fillStyle = color || '#8D6E63';
    for (var fx = x; fx < x + w; fx += 30) {
      ctx.fillRect(fx, y - 30, 6, 30);
      ctx.beginPath();
      ctx.moveTo(fx, y - 30);
      ctx.lineTo(fx + 3, y - 40);
      ctx.lineTo(fx + 6, y - 30);
      ctx.fill();
    }
    ctx.fillRect(x, y - 20, w, 4);
    ctx.fillRect(x, y - 10, w, 4);
  }

  function _drawLamp(ctx, x, y, color) {
    ctx.fillStyle = '#455A64';
    ctx.fillRect(x - 3, y - 80, 6, 80);
    ctx.fillStyle = color || '#FFD54F';
    ctx.beginPath();
    ctx.arc(x, y - 85, 12, 0, Math.PI * 2);
    ctx.fill();
    var grad = ctx.createRadialGradient(x, y - 85, 0, x, y - 85, 40);
    grad.addColorStop(0, 'rgba(255,213,79,0.4)');
    grad.addColorStop(1, 'rgba(255,213,79,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y - 85, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  function _drawCar(ctx, x, y, color) {
    ctx.fillStyle = color;
    _drawRect(ctx, x, y - 20, 70, 20, color, 4);
    _drawRect(ctx, x + 10, y - 38, 50, 20, color, 4);
    ctx.fillStyle = '#B3E5FC';
    ctx.fillRect(x + 14, y - 36, 18, 14);
    ctx.fillRect(x + 38, y - 36, 18, 14);
    ctx.fillStyle = '#212121';
    _drawCircle(ctx, x + 15, y, 8, '#212121');
    _drawCircle(ctx, x + 55, y, 8, '#212121');
    ctx.fillStyle = '#757575';
    _drawCircle(ctx, x + 15, y, 4, '#757575');
    _drawCircle(ctx, x + 55, y, 4, '#757575');
  }

  function _drawBird(ctx, x, y, size) {
    ctx.strokeStyle = '#37474F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - size, y + size * 0.3);
    ctx.quadraticCurveTo(x - size * 0.3, y - size * 0.5, x, y);
    ctx.quadraticCurveTo(x + size * 0.3, y - size * 0.5, x + size, y + size * 0.3);
    ctx.stroke();
  }

  function _drawWindow(ctx, x, y, w, h, frameColor, glassColor) {
    ctx.fillStyle = frameColor || '#5D4037';
    ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
    ctx.fillStyle = glassColor || '#B3E5FC';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = frameColor || '#5D4037';
    ctx.fillRect(x + w / 2 - 1.5, y, 3, h);
    ctx.fillRect(x, y + h / 2 - 1.5, w, 3);
  }

  function _drawDoor(ctx, x, y, w, h, color) {
    ctx.fillStyle = color || '#5D4037';
    _drawRect(ctx, x, y, w, h, color, 3);
    ctx.fillStyle = '#FFD54F';
    _drawCircle(ctx, x + w - 12, y + h / 2, 4, '#FFD54F');
  }

  function _drawTable(ctx, x, y, w, h, color) {
    ctx.fillStyle = color || '#6D4C41';
    ctx.fillRect(x, y, w, 6);
    ctx.fillRect(x + 10, y + 6, 6, h);
    ctx.fillRect(x + w - 16, y + 6, 6, h);
  }

  function _drawBook(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#FFF8E1';
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    ctx.fillStyle = color;
    ctx.fillRect(x + w * 0.4, y, w * 0.2, h);
  }

  function _drawVase(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 8, y);
    ctx.quadraticCurveTo(x - 15, y - 20, x - 10, y - 35);
    ctx.lineTo(x - 6, y - 40);
    ctx.lineTo(x + 6, y - 40);
    ctx.lineTo(x + 10, y - 35);
    ctx.quadraticCurveTo(x + 15, y - 20, x + 8, y);
    ctx.closePath();
    ctx.fill();
  }

  function _drawCup(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 20);
    ctx.lineTo(x - 8, y);
    ctx.lineTo(x + 8, y);
    ctx.lineTo(x + 10, y - 20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(x - 6, y - 18, 5, 12);
  }

  function _drawPicture(ctx, x, y, w, h, frameColor, innerColor) {
    ctx.fillStyle = frameColor || '#5D4037';
    ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
    ctx.fillStyle = innerColor || '#E8F5E9';
    ctx.fillRect(x, y, w, h);
  }

  function _drawCurtain(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w * 0.8, y + h);
    ctx.lineTo(x + w * 0.2, y + h);
    ctx.closePath();
    ctx.fill();
  }

  function _drawPot(ctx, x, y, potColor, plantColor) {
    ctx.fillStyle = potColor || '#8D6E63';
    ctx.beginPath();
    ctx.moveTo(x - 15, y - 10);
    ctx.lineTo(x - 12, y + 10);
    ctx.lineTo(x + 12, y + 10);
    ctx.lineTo(x + 15, y - 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = plantColor || '#4CAF50';
    ctx.beginPath();
    ctx.arc(x, y - 18, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - 10, y - 12, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 10, y - 12, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  function _drawClock(ctx, x, y, r, color, handColor) {
    ctx.fillStyle = color || '#ECEFF1';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#455A64';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = handColor || '#F44336';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - r * 0.7);
    ctx.lineWidth = 3;
    ctx.strokeStyle = handColor || '#F44336';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + r * 0.5, y);
    ctx.strokeStyle = '#455A64';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#455A64';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  function _drawRug(ctx, x, y, w, h, color1, color2) {
    ctx.fillStyle = color1;
    _drawRect(ctx, x, y, w, h, color1, 4);
    ctx.fillStyle = color2;
    _drawRect(ctx, x + 8, y + 8, w - 16, h - 16, color2, 2);
    ctx.fillStyle = color1;
    _drawRect(ctx, x + 16, y + 16, w - 32, h - 32, color1, 1);
  }

  function _drawSofa(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    _drawRect(ctx, x, y, w, h, color, 6);
    _drawRect(ctx, x - 10, y + 5, 15, h - 10, color, 4);
    _drawRect(ctx, x + w - 5, y + 5, 15, h - 10, color, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    _drawRect(ctx, x + 10, y + 5, w - 20, h * 0.4, 'rgba(255,255,255,0.1)', 3);
  }

  function _drawLampItem(ctx, x, y, shadeColor) {
    ctx.fillStyle = '#455A64';
    ctx.fillRect(x - 3, y, 6, 40);
    ctx.fillStyle = shadeColor;
    ctx.beginPath();
    ctx.moveTo(x - 20, y - 5);
    ctx.lineTo(x + 20, y - 5);
    ctx.lineTo(x + 12, y - 30);
    ctx.lineTo(x - 12, y - 30);
    ctx.closePath();
    ctx.fill();
  }

  function _drawStove(ctx, x, y, w, h) {
    ctx.fillStyle = '#78909C';
    _drawRect(ctx, x, y, w, h, '#78909C', 4);
    ctx.fillStyle = '#37474F';
    _drawRect(ctx, x + 5, y + 5, w - 10, h * 0.4, '#37474F', 2);
    _drawCircle(ctx, x + w * 0.25, y + h * 0.7, 8, '#455A64');
    _drawCircle(ctx, x + w * 0.75, y + h * 0.7, 8, '#455A64');
  }

  function _drawFridge(ctx, x, y, w, h, color) {
    ctx.fillStyle = color || '#ECEFF1';
    _drawRect(ctx, x, y, w, h, color || '#ECEFF1', 4);
    ctx.fillStyle = '#B0BEC5';
    ctx.fillRect(x + w - 8, y + h * 0.3, 4, 10);
    ctx.fillRect(x + w - 8, y + h * 0.6, 4, 10);
    ctx.fillStyle = '#CFD8DC';
    ctx.fillRect(x + 4, y + 4, w - 8, h * 0.35);
  }

  function _drawSink(ctx, x, y) {
    ctx.fillStyle = '#B0BEC5';
    _drawRect(ctx, x - 25, y - 15, 50, 30, '#B0BEC5', 8);
    ctx.fillStyle = '#78909C';
    _drawEllipse(ctx, x, y, 18, 10, '#78909C');
    ctx.fillStyle = '#90A4AE';
    ctx.fillRect(x - 3, y - 35, 6, 25);
    ctx.beginPath();
    ctx.arc(x, y - 35, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  function _drawPlate(ctx, x, y, r, color) {
    ctx.fillStyle = color || '#ECEFF1';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#B0BEC5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.7, 0, Math.PI * 2);
    ctx.stroke();
  }

  function _drawNeonSign(ctx, x, y, text, color) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.fillStyle = color;
    ctx.font = 'bold 24px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
  }

  function _drawNeonRect(ctx, x, y, w, h, color) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    ctx.shadowBlur = 0;
  }

  function _drawRain(count) {
    return function (c) {
      c.strokeStyle = 'rgba(100,181,246,0.4)';
      c.lineWidth = 1;
      for (var i = 0; i < count; i++) {
        var rx = _rngFn() * W;
        var ry = _rngFn() * H;
        c.beginPath();
        c.moveTo(rx, ry);
        c.lineTo(rx - 3, ry + 15);
        c.stroke();
      }
    };
  }

  function _drawWater(ctx, x, y, w, h, color) {
    ctx.fillStyle = color || '#1565C0';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (var wy = y; wy < y + h; wy += 12) {
      ctx.beginPath();
      for (var wx = x; wx < x + w; wx += 2) {
        var yy = wy + Math.sin(wx * 0.05 + wy * 0.1) * 3;
        if (wx === x) ctx.moveTo(wx, yy);
        else ctx.lineTo(wx, yy);
      }
      ctx.lineTo(x + w, wy + 6);
      ctx.lineTo(x, wy + 6);
      ctx.fill();
    }
  }

  function _drawPath(ctx, points, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (var i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();
  }

  function _drawButterfly(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x - 8, y - 5, 8, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 8, y - 5, 8, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#37474F';
    ctx.fillRect(x - 1, y - 8, 2, 12);
  }

  function _drawMushroom(ctx, x, y, size, capColor) {
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(x - size * 0.15, y - size * 0.3, size * 0.3, size * 0.5);
    ctx.fillStyle = capColor || '#F44336';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.3, size * 0.5, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    _drawCircle(ctx, x - size * 0.15, y - size * 0.45, size * 0.08, '#FFFFFF');
    _drawCircle(ctx, x + size * 0.2, y - size * 0.5, size * 0.06, '#FFFFFF');
  }

  function _drawRock(ctx, x, y, size, color) {
    ctx.fillStyle = color || '#78909C';
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.ellipse(x - size * 0.2, y - size * 0.15, size * 0.3, size * 0.2, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  var sceneRenderers = {
    1: function (ctx) {
      _drawSky(ctx, null, ['#FF6F00', '#FF8F00', '#FFB300']);
      _drawGround(ctx, '#5D4037', '#3E2723');
      _drawSun(ctx, 650, 100, 40);
      _drawCloud(ctx, 100, 80, 30);
      _drawCloud(ctx, 400, 60, 25);
      _drawCloud(ctx, 600, 100, 20);
      _drawBuilding(ctx, 50, 340, 80, 180, '#546E7A', '#FFF9C4');
      _drawBuilding(ctx, 150, 340, 100, 220, '#78909C', '#FFF9C4');
      _drawBuilding(ctx, 270, 340, 70, 150, '#455A64', '#FFF9C4');
      _drawBuilding(ctx, 360, 340, 90, 200, '#607D8B', '#FFF9C4');
      _drawBuilding(ctx, 470, 340, 110, 250, '#546E7A', '#FFF9C4');
      _drawBuilding(ctx, 600, 340, 85, 170, '#78909C', '#FFF9C4');
      _drawBuilding(ctx, 700, 340, 100, 190, '#455A64', '#FFF9C4');
      _drawCar(ctx, 100, 380, '#F44336');
      _drawCar(ctx, 500, 390, '#2196F3');
      _drawLamp(ctx, 250, 340, '#FFD54F');
      _drawLamp(ctx, 550, 340, '#FFD54F');
      _drawFence(ctx, 0, 450, 800, '#8D6E63');
      _drawFlower(ctx, 50, 470, 8, '#E91E63', '#FFC107');
      _drawFlower(ctx, 150, 475, 6, '#FF5722', '#FFC107');
      _drawFlower(ctx, 350, 468, 7, '#9C27B0', '#FFC107');
      _drawFlower(ctx, 550, 472, 8, '#E91E63', '#FFC107');
      _drawFlower(ctx, 700, 470, 6, '#FF5722', '#FFC107');
      _drawBird(ctx, 300, 50, 12);
      _drawBird(ctx, 340, 40, 10);
    },
    2: function (ctx) {
      _drawSky(ctx, null, ['#81D4FA', '#B3E5FC', '#E1F5FE']);
      _drawGround(ctx, '#66BB6A', '#388E3C');
      _drawSun(ctx, 680, 80, 35);
      _drawCloud(ctx, 120, 70, 35);
      _drawCloud(ctx, 450, 50, 28);
      _drawMountain(ctx, -50, 330, 300, 180, '#81C784');
      _drawMountain(ctx, 200, 330, 350, 220, '#66BB6A');
      _drawMountain(ctx, 500, 330, 350, 160, '#81C784');
      _drawPath(ctx, [[0, 500], [200, 480], [400, 500], [600, 480], [800, 500]], '#D7CCC8', 30);
      _drawTree(ctx, 80, 400, 60, 35, '#5D4037', '#2E7D32');
      _drawTree(ctx, 250, 420, 50, 28, '#5D4037', '#388E3C');
      _drawTree(ctx, 600, 390, 70, 40, '#5D4037', '#1B5E20');
      _drawTree(ctx, 720, 410, 55, 32, '#5D4037', '#2E7D32');
      _drawFlower(ctx, 100, 460, 8, '#E91E63', '#FFC107');
      _drawFlower(ctx, 180, 470, 6, '#FF5722', '#FFC107');
      _drawFlower(ctx, 320, 455, 7, '#9C27B0', '#FFC107');
      _drawFlower(ctx, 480, 465, 8, '#E91E63', '#FFC107');
      _drawFlower(ctx, 650, 458, 6, '#FF5722', '#FFC107');
      _drawButterfly(ctx, 200, 380, '#FF9800');
      _drawButterfly(ctx, 500, 350, '#E91E63');
      _drawMushroom(ctx, 350, 460, 20, '#F44336');
      _drawMushroom(ctx, 550, 470, 15, '#FF9800');
      _drawFence(ctx, 0, 530, 800, '#8D6E63');
      _drawBird(ctx, 350, 60, 10);
      _drawBird(ctx, 380, 50, 8);
    },
    3: function (ctx) {
      ctx.fillStyle = '#FFF8E1';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(0, 0, W, 15);
      ctx.fillRect(0, H - 15, W, 15);
      ctx.fillStyle = '#D7CCC8';
      ctx.fillRect(0, 0, 15, H);
      ctx.fillRect(W - 15, 0, 15, H);
      _drawRug(ctx, 200, 420, 400, 120, '#E91E63', '#F8BBD0');
      _drawSofa(ctx, 250, 350, 300, 80, '#5C6BC0');
      _drawWindow(ctx, 100, 80, 100, 80, '#5D4037', '#B3E5FC');
      _drawCurtain(ctx, 85, 60, 55, 120, '#E91E63');
      _drawCurtain(ctx, 160, 60, 55, 120, '#E91E63');
      _drawWindow(ctx, 600, 80, 100, 80, '#5D4037', '#B3E5FC');
      _drawCurtain(ctx, 585, 60, 55, 120, '#E91E63');
      _drawCurtain(ctx, 660, 60, 55, 120, '#E91E63');
      _drawPicture(ctx, 350, 80, 80, 60, '#5D4037', '#C8E6C9');
      _drawClock(ctx, 500, 100, 25, '#ECEFF1', '#F44336');
      _drawTable(ctx, 80, 300, 120, 60, '#6D4C41');
      _drawVase(ctx, 140, 280, '#E91E63');
      _drawLampItem(ctx, 680, 300, '#FFD54F');
      _drawPot(ctx, 50, 540, '#8D6E63', '#4CAF50');
      _drawPot(ctx, 740, 540, '#8D6E63', '#4CAF50');
      _drawBook(ctx, 100, 290, 20, 15, '#F44336');
      _drawBook(ctx, 105, 278, 18, 14, '#2196F3');
    },
    4: function (ctx) {
      ctx.fillStyle = '#0D1B2A';
      ctx.fillRect(0, 0, W, H);
      _drawMoon(ctx, 680, 80, 30, '#FFF9C4');
      for (var si = 0; si < 30; si++) {
        _drawStar(ctx, _rngFn() * W, _rngFn() * H * 0.4, 2 + _rngFn() * 2);
      }
      _drawGround(ctx, '#1A237E', '#0D1B2A');
      _drawBuilding(ctx, 30, 380, 80, 250, '#1A237E');
      _drawBuilding(ctx, 120, 380, 100, 300, '#283593');
      _drawBuilding(ctx, 230, 380, 70, 200, '#1A237E');
      _drawBuilding(ctx, 310, 380, 90, 280, '#283593');
      _drawBuilding(ctx, 410, 380, 110, 320, '#1A237E');
      _drawBuilding(ctx, 530, 380, 80, 230, '#283593');
      _drawBuilding(ctx, 620, 380, 90, 260, '#1A237E');
      _drawBuilding(ctx, 720, 380, 80, 240, '#283593');
      _drawNeonSign(ctx, 160, 200, 'BAR', '#00F5FF');
      _drawNeonSign(ctx, 460, 180, 'HOTEL', '#A855F7');
      _drawNeonRect(ctx, 320, 250, 60, 40, '#F472B6');
      _drawNeonRect(ctx, 540, 280, 50, 35, '#00F5FF');
      _drawLamp(ctx, 200, 380, '#00F5FF');
      _drawLamp(ctx, 500, 380, '#A855F7');
      _drawCar(ctx, 100, 420, '#F44336');
      _drawCar(ctx, 550, 430, '#2196F3');
      _drawFence(ctx, 0, 480, 800, '#37474F');
    },
    5: function (ctx) {
      _drawSky(ctx, null, ['#FF8A65', '#FFAB91', '#FFE0B2']);
      _drawMountain(ctx, -50, 350, 300, 200, '#5D4037');
      _drawMountain(ctx, 200, 350, 400, 250, '#6D4C41');
      _drawMountain(ctx, 500, 350, 350, 180, '#5D4037');
      _drawWater(ctx, 0, 350, 800, 100, '#1565C0');
      _drawGround(ctx, '#66BB6A', '#388E3C');
      _drawSun(ctx, 400, 100, 45);
      _drawCloud(ctx, 150, 80, 30);
      _drawCloud(ctx, 550, 60, 25);
      _drawTree(ctx, 60, 460, 60, 35, '#5D4037', '#2E7D32');
      _drawTree(ctx, 700, 450, 55, 30, '#5D4037', '#388E3C');
      _drawFlower(ctx, 120, 490, 7, '#E91E63', '#FFC107');
      _drawFlower(ctx, 300, 495, 6, '#FF5722', '#FFC107');
      _drawFlower(ctx, 500, 488, 8, '#9C27B0', '#FFC107');
      _drawFlower(ctx, 650, 492, 7, '#E91E63', '#FFC107');
      _drawBird(ctx, 250, 70, 10);
      _drawBird(ctx, 280, 60, 8);
      _drawRock(ctx, 200, 460, 15, '#78909C');
      _drawRock(ctx, 600, 455, 12, '#90A4AE');
      _drawMushroom(ctx, 450, 485, 18, '#F44336');
      _drawFence(ctx, 0, 530, 800, '#8D6E63');
    },
    6: function (ctx) {
      ctx.fillStyle = '#EFEBE9';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(0, 0, W, 12);
      ctx.fillRect(0, H - 12, W, 12);
      ctx.fillRect(0, 0, 12, H);
      ctx.fillRect(W - 12, 0, 12, H);
      _drawRug(ctx, 250, 430, 300, 100, '#5C6BC0', '#9FA8DA');
      _drawTable(ctx, 50, 320, 150, 80, '#6D4C41');
      _drawBook(ctx, 80, 305, 25, 18, '#F44336');
      _drawBook(ctx, 85, 290, 22, 16, '#2196F3');
      _drawBook(ctx, 90, 276, 20, 15, '#4CAF50');
      _drawCup(ctx, 160, 310, '#ECEFF1');
      _drawVase(ctx, 120, 280, '#7B1FA2');
      _drawWindow(ctx, 300, 60, 90, 70, '#5D4037', '#B3E5FC');
      _drawCurtain(ctx, 285, 40, 50, 110, '#5C6BC0');
      _drawCurtain(ctx, 355, 40, 50, 110, '#5C6BC0');
      _drawPicture(ctx, 500, 70, 70, 50, '#5D4037', '#FFECB3');
      _drawClock(ctx, 650, 90, 28, '#ECEFF1', '#F44336');
      _drawSofa(ctx, 550, 350, 200, 70, '#795548');
      _drawLampItem(ctx, 500, 340, '#FFD54F');
      _drawPot(ctx, 30, 550, '#8D6E63', '#4CAF50');
      _drawPot(ctx, 760, 550, '#8D6E63', '#66BB6A');
      _drawDoor(ctx, 680, 440, 60, 120, '#5D4037');
    },
    7: function (ctx) {
      ctx.fillStyle = '#0A0E1A';
      ctx.fillRect(0, 0, W, H);
      for (var si = 0; si < 50; si++) {
        _drawStar(ctx, _rngFn() * W, _rngFn() * H * 0.5, 1 + _rngFn() * 2);
      }
      _drawMoon(ctx, 120, 70, 25, '#E0E0E0');
      _drawGround(ctx, '#1A1A2E', '#0A0E1A');
      _drawBuilding(ctx, 20, 400, 70, 200, '#16213E');
      _drawBuilding(ctx, 100, 400, 90, 280, '#1A1A2E');
      _drawBuilding(ctx, 200, 400, 80, 240, '#16213E');
      _drawBuilding(ctx, 290, 400, 100, 320, '#1A1A2E');
      _drawBuilding(ctx, 400, 400, 75, 260, '#16213E');
      _drawBuilding(ctx, 480, 400, 95, 300, '#1A1A2E');
      _drawBuilding(ctx, 585, 400, 85, 220, '#16213E');
      _drawBuilding(ctx, 680, 400, 120, 340, '#1A1A2E');
      _drawNeonSign(ctx, 150, 220, 'CYBER', '#00F5FF');
      _drawNeonSign(ctx, 450, 180, 'NEON', '#A855F7');
      _drawNeonSign(ctx, 640, 200, '2077', '#F472B6');
      _drawNeonRect(ctx, 210, 270, 50, 30, '#00F5FF');
      _drawNeonRect(ctx, 510, 250, 60, 35, '#A855F7');
      _drawNeonRect(ctx, 700, 280, 45, 30, '#F472B6');
      _drawLamp(ctx, 180, 400, '#00F5FF');
      _drawLamp(ctx, 400, 400, '#A855F7');
      _drawLamp(ctx, 600, 400, '#F472B6');
      _drawCar(ctx, 80, 440, '#00BCD4');
      _drawCar(ctx, 500, 450, '#E91E63');
      _drawFence(ctx, 0, 490, 800, '#263238');
    },
    8: function (ctx) {
      _drawSky(ctx, null, ['#1B5E20', '#2E7D32', '#4CAF50']);
      _drawGround(ctx, '#33691E', '#1B5E20');
      _drawTree(ctx, 60, 400, 80, 50, '#3E2723', '#1B5E20');
      _drawTree(ctx, 180, 420, 70, 45, '#3E2723', '#2E7D32');
      _drawTree(ctx, 320, 380, 90, 55, '#3E2723', '#1B5E20');
      _drawTree(ctx, 500, 410, 75, 48, '#3E2723', '#2E7D32');
      _drawTree(ctx, 650, 390, 85, 52, '#3E2723', '#1B5E20');
      _drawTree(ctx, 750, 420, 65, 40, '#3E2723', '#2E7D32');
      _drawCloud(ctx, 200, 60, 25);
      _drawCloud(ctx, 500, 40, 20);
      _drawSun(ctx, 700, 80, 30);
      _drawMushroom(ctx, 100, 460, 22, '#F44336');
      _drawMushroom(ctx, 250, 470, 18, '#FF9800');
      _drawMushroom(ctx, 400, 455, 20, '#E91E63');
      _drawMushroom(ctx, 580, 465, 16, '#F44336');
      _drawMushroom(ctx, 700, 460, 19, '#FF9800');
      _drawFlower(ctx, 130, 480, 6, '#E91E63', '#FFC107');
      _drawFlower(ctx, 350, 475, 7, '#FF5722', '#FFC107');
      _drawFlower(ctx, 550, 482, 5, '#9C27B0', '#FFC107');
      _drawButterfly(ctx, 200, 350, '#FF9800');
      _drawButterfly(ctx, 450, 320, '#E91E63');
      _drawButterfly(ctx, 650, 340, '#2196F3');
      _drawRock(ctx, 150, 490, 18, '#607D8B');
      _drawRock(ctx, 450, 495, 14, '#78909C');
      _drawRock(ctx, 680, 488, 16, '#607D8B');
      _drawFence(ctx, 0, 540, 800, '#5D4037');
    },
    9: function (ctx) {
      ctx.fillStyle = '#FFF3E0';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(0, 0, W, 10);
      ctx.fillRect(0, H - 10, W, 10);
      ctx.fillRect(0, 0, 10, H);
      ctx.fillRect(W - 10, 0, 10, H);
      _drawStove(ctx, 50, 200, 120, 150);
      _drawFridge(ctx, 50, 30, 70, 160, '#ECEFF1');
      _drawSink(ctx, 250, 250);
      _drawTable(ctx, 350, 300, 200, 80, '#6D4C41');
      _drawPlate(ctx, 400, 290, 20, '#ECEFF1');
      _drawPlate(ctx, 460, 285, 18, '#FFF9C4');
      _drawCup(ctx, 500, 285, '#ECEFF1');
      _drawCup(ctx, 380, 280, '#FFCCBC');
      _drawPot(ctx, 600, 290, '#8D6E63', '#4CAF50');
      _drawWindow(ctx, 300, 40, 80, 60, '#5D4037', '#B3E5FC');
      _drawWindow(ctx, 500, 40, 80, 60, '#5D4037', '#B3E5FC');
      _drawCurtain(ctx, 285, 20, 45, 100, '#FF8A65');
      _drawCurtain(ctx, 345, 20, 45, 100, '#FF8A65');
      _drawCurtain(ctx, 485, 20, 45, 100, '#FF8A65');
      _drawCurtain(ctx, 545, 20, 45, 100, '#FF8A65');
      _drawClock(ctx, 700, 60, 25, '#ECEFF1', '#F44336');
      _drawDoor(ctx, 700, 400, 60, 150, '#5D4037');
      _drawRug(ctx, 300, 450, 200, 80, '#FF8A65', '#FFAB91');
      _drawVase(ctx, 650, 380, '#7B1FA2');
      _drawBook(ctx, 200, 240, 20, 15, '#F44336');
      _drawLampItem(ctx, 680, 300, '#FFD54F');
    },
    10: function (ctx) {
      ctx.fillStyle = '#0A0E1A';
      ctx.fillRect(0, 0, W, H);
      for (var si = 0; si < 60; si++) {
        _drawStar(ctx, _rngFn() * W, _rngFn() * H * 0.4, 1 + _rngFn() * 2);
      }
      _drawMoon(ctx, 650, 60, 22, '#E0E0E0');
      _drawGround(ctx, '#1A1A2E', '#0A0E1A');
      _drawBuilding(ctx, 20, 350, 60, 250, '#16213E');
      _drawBuilding(ctx, 90, 350, 80, 300, '#1A1A2E');
      _drawBuilding(ctx, 180, 350, 70, 220, '#16213E');
      _drawBuilding(ctx, 260, 350, 90, 280, '#1A1A2E');
      _drawBuilding(ctx, 360, 350, 75, 240, '#16213E');
      _drawBuilding(ctx, 445, 350, 85, 310, '#1A1A2E');
      _drawBuilding(ctx, 540, 350, 70, 200, '#16213E');
      _drawBuilding(ctx, 620, 350, 80, 260, '#1A1A2E');
      _drawBuilding(ctx, 710, 350, 90, 290, '#16213E');
      _drawNeonSign(ctx, 130, 180, 'X', '#00F5FF');
      _drawNeonSign(ctx, 310, 160, 'Z', '#A855F7');
      _drawNeonSign(ctx, 490, 170, 'A', '#F472B6');
      _drawNeonSign(ctx, 660, 190, '!', '#00F5FF');
      _drawNeonRect(ctx, 200, 230, 40, 25, '#A855F7');
      _drawNeonRect(ctx, 400, 210, 45, 30, '#F472B6');
      _drawNeonRect(ctx, 570, 240, 35, 25, '#00F5FF');
      _drawLamp(ctx, 150, 350, '#00F5FF');
      _drawLamp(ctx, 350, 350, '#A855F7');
      _drawLamp(ctx, 550, 350, '#F472B6');
      _drawLamp(ctx, 720, 350, '#00F5FF');
      _drawCar(ctx, 80, 400, '#00BCD4');
      _drawCar(ctx, 400, 410, '#E91E63');
      _drawCar(ctx, 600, 405, '#FFD54F');
      _drawFence(ctx, 0, 460, 800, '#263238');
      _drawTree(ctx, 50, 500, 40, 25, '#3E2723', '#1B5E20');
      _drawTree(ctx, 750, 510, 35, 20, '#3E2723', '#2E7D32');
    }
  };

  var diffGenerators = {
    1: function () {
      return [
        { x: 176, y: 145, radius: 35, type: 'COLOR_CHANGE', description: '建筑窗户颜色变化' },
        { x: 535, y: 385, radius: 35, type: 'OBJECT_REMOVED', description: '汽车颜色变化' },
        { x: 115, y: 100, radius: 35, type: 'COLOR_CHANGE', description: '云朵位置变化' }
      ];
    },
    2: function () {
      return [
        { x: 200, y: 382, radius: 35, type: 'OBJECT_REMOVED', description: '蝴蝶消失' },
        { x: 350, y: 460, radius: 35, type: 'COLOR_CHANGE', description: '蘑菇颜色变化' },
        { x: 680, y: 80, radius: 35, type: 'OBJECT_REMOVED', description: '太阳光芒变化' }
      ];
    },
    3: function () {
      return [
        { x: 140, y: 260, radius: 30, type: 'COLOR_CHANGE', description: '花瓶颜色变化' },
        { x: 500, y: 100, radius: 30, type: 'COLOR_CHANGE', description: '时钟颜色变化' },
        { x: 390, y: 110, radius: 30, type: 'COLOR_CHANGE', description: '画框内容变化' }
      ];
    },
    4: function () {
      return [
        { x: 160, y: 200, radius: 28, type: 'COLOR_CHANGE', description: '霓虹灯颜色变化' },
        { x: 460, y: 180, radius: 28, type: 'COLOR_CHANGE', description: 'HOTEL标志变化' },
        { x: 350, y: 270, radius: 25, type: 'COLOR_CHANGE', description: '霓虹框颜色变化' },
        { x: 135, y: 410, radius: 28, type: 'COLOR_CHANGE', description: '汽车颜色变化' },
        { x: 500, y: 365, radius: 25, type: 'COLOR_CHANGE', description: '路灯颜色变化' }
      ];
    },
    5: function () {
      return [
        { x: 200, y: 465, radius: 25, type: 'OBJECT_REMOVED', description: '石头消失' },
        { x: 450, y: 485, radius: 25, type: 'COLOR_CHANGE', description: '蘑菇颜色变化' },
        { x: 400, y: 100, radius: 25, type: 'OBJECT_REMOVED', description: '太阳大小变化' },
        { x: 120, y: 490, radius: 25, type: 'COLOR_CHANGE', description: '花朵颜色变化' },
        { x: 350, y: 60, radius: 25, type: 'OBJECT_REMOVED', description: '鸟消失' }
      ];
    },
    6: function () {
      return [
        { x: 120, y: 260, radius: 25, type: 'COLOR_CHANGE', description: '花瓶颜色变化' },
        { x: 650, y: 90, radius: 25, type: 'COLOR_CHANGE', description: '时钟颜色变化' },
        { x: 160, y: 300, radius: 22, type: 'COLOR_CHANGE', description: '杯子颜色变化' },
        { x: 535, y: 95, radius: 25, type: 'COLOR_CHANGE', description: '画框内容变化' },
        { x: 100, y: 290, radius: 22, type: 'COLOR_CHANGE', description: '书本颜色变化' }
      ];
    },
    7: function () {
      return [
        { x: 150, y: 220, radius: 22, type: 'COLOR_CHANGE', description: 'CYBER标志变化' },
        { x: 450, y: 180, radius: 22, type: 'COLOR_CHANGE', description: 'NEON标志变化' },
        { x: 640, y: 200, radius: 22, type: 'COLOR_CHANGE', description: '2077标志变化' },
        { x: 235, y: 285, radius: 20, type: 'COLOR_CHANGE', description: '霓虹框变化' },
        { x: 540, y: 267, radius: 20, type: 'COLOR_CHANGE', description: '霓虹框变化' },
        { x: 115, y: 430, radius: 22, type: 'COLOR_CHANGE', description: '汽车颜色变化' },
        { x: 400, y: 365, radius: 20, type: 'COLOR_CHANGE', description: '路灯颜色变化' }
      ];
    },
    8: function () {
      return [
        { x: 100, y: 460, radius: 20, type: 'COLOR_CHANGE', description: '蘑菇颜色变化' },
        { x: 250, y: 470, radius: 18, type: 'COLOR_CHANGE', description: '蘑菇颜色变化' },
        { x: 200, y: 352, radius: 20, type: 'OBJECT_REMOVED', description: '蝴蝶消失' },
        { x: 450, y: 322, radius: 18, type: 'OBJECT_REMOVED', description: '蝴蝶消失' },
        { x: 150, y: 492, radius: 18, type: 'OBJECT_REMOVED', description: '石头消失' },
        { x: 130, y: 480, radius: 18, type: 'COLOR_CHANGE', description: '花朵颜色变化' },
        { x: 700, y: 80, radius: 20, type: 'OBJECT_REMOVED', description: '太阳变化' }
      ];
    },
    9: function () {
      return [
        { x: 110, y: 220, radius: 18, type: 'COLOR_CHANGE', description: '灶台变化' },
        { x: 250, y: 230, radius: 18, type: 'COLOR_CHANGE', description: '水龙头变化' },
        { x: 400, y: 290, radius: 18, type: 'COLOR_CHANGE', description: '盘子颜色变化' },
        { x: 500, y: 285, radius: 16, type: 'COLOR_CHANGE', description: '杯子颜色变化' },
        { x: 200, y: 240, radius: 16, type: 'COLOR_CHANGE', description: '书本颜色变化' },
        { x: 700, y: 60, radius: 18, type: 'COLOR_CHANGE', description: '时钟颜色变化' },
        { x: 650, y: 360, radius: 18, type: 'COLOR_CHANGE', description: '花瓶颜色变化' }
      ];
    },
    10: function () {
      return [
        { x: 130, y: 180, radius: 16, type: 'COLOR_CHANGE', description: '霓虹X变化' },
        { x: 310, y: 160, radius: 16, type: 'COLOR_CHANGE', description: '霓虹Z变化' },
        { x: 490, y: 170, radius: 16, type: 'COLOR_CHANGE', description: '霓虹A变化' },
        { x: 660, y: 190, radius: 16, type: 'COLOR_CHANGE', description: '霓虹!变化' },
        { x: 220, y: 242, radius: 16, type: 'COLOR_CHANGE', description: '霓虹框变化' },
        { x: 422, y: 225, radius: 16, type: 'COLOR_CHANGE', description: '霓虹框变化' },
        { x: 115, y: 390, radius: 16, type: 'COLOR_CHANGE', description: '汽车颜色变化' },
        { x: 635, y: 395, radius: 16, type: 'COLOR_CHANGE', description: '汽车颜色变化' },
        { x: 150, y: 315, radius: 16, type: 'COLOR_CHANGE', description: '路灯变化' }
      ];
    }
  };

  var diffAppliers = {
    1: function (ctx) {
      ctx.fillStyle = '#F44336';
      ctx.fillRect(168, 140, 8, 10);
      ctx.fillRect(184, 140, 8, 10);
      ctx.fillStyle = '#2196F3';
      _drawCar(ctx, 500, 390, '#4CAF50');
      _drawCloud(ctx, 100, 100, 30);
    },
    2: function (ctx) {
      _drawFlower(ctx, 200, 385, 7, '#FF9800', '#FFC107');
      _drawMushroom(ctx, 350, 460, 20, '#2196F3');
      _drawSun(ctx, 680, 80, 25);
    },
    3: function (ctx) {
      _drawVase(ctx, 140, 280, '#2196F3');
      _drawClock(ctx, 500, 100, 25, '#ECEFF1', '#2196F3');
      _drawPicture(ctx, 350, 80, 80, 60, '#5D4037', '#FFCDD2');
    },
    4: function (ctx) {
      _drawNeonSign(ctx, 160, 200, 'BAR', '#A855F7');
      _drawNeonSign(ctx, 460, 180, 'HOTEL', '#F472B6');
      _drawNeonRect(ctx, 320, 250, 60, 40, '#00F5FF');
      _drawCar(ctx, 100, 420, '#4CAF50');
      _drawLamp(ctx, 500, 380, '#F472B6');
    },
    5: function (ctx) {
      _drawFlower(ctx, 200, 465, 8, '#FF9800', '#FFC107');
      _drawMushroom(ctx, 450, 485, 18, '#2196F3');
      _drawSun(ctx, 400, 100, 30);
      _drawFlower(ctx, 120, 490, 7, '#2196F3', '#FFC107');
      _drawBird(ctx, 350, 60, 10);
    },
    6: function (ctx) {
      _drawVase(ctx, 120, 280, '#F44336');
      _drawClock(ctx, 650, 90, 28, '#ECEFF1', '#2196F3');
      _drawCup(ctx, 160, 310, '#FFD54F');
      _drawPicture(ctx, 500, 70, 70, 50, '#5D4037', '#C8E6C9');
      _drawBook(ctx, 100, 290, 20, 15, '#4CAF50');
    },
    7: function (ctx) {
      _drawNeonSign(ctx, 150, 220, 'CYBER', '#A855F7');
      _drawNeonSign(ctx, 450, 180, 'NEON', '#F472B6');
      _drawNeonSign(ctx, 640, 200, '2077', '#00F5FF');
      _drawNeonRect(ctx, 210, 270, 50, 30, '#A855F7');
      _drawNeonRect(ctx, 510, 250, 60, 35, '#F472B6');
      _drawCar(ctx, 80, 440, '#F44336');
      _drawLamp(ctx, 400, 400, '#00F5FF');
    },
    8: function (ctx) {
      _drawMushroom(ctx, 100, 460, 22, '#2196F3');
      _drawMushroom(ctx, 250, 470, 18, '#4CAF50');
      _drawFlower(ctx, 200, 355, 6, '#2196F3', '#FFC107');
      _drawFlower(ctx, 450, 325, 7, '#FF9800', '#FFC107');
      _drawFlower(ctx, 150, 495, 6, '#FF9800', '#FFC107');
      _drawFlower(ctx, 130, 480, 6, '#2196F3', '#FFC107');
      _drawSun(ctx, 700, 80, 25);
    },
    9: function (ctx) {
      ctx.fillStyle = '#F44336';
      ctx.fillRect(55, 205, 110, 30);
      ctx.fillStyle = '#FFD54F';
      ctx.beginPath();
      ctx.arc(250, 215, 10, 0, Math.PI * 2);
      ctx.fill();
      _drawPlate(ctx, 400, 290, 20, '#FFD54F');
      _drawCup(ctx, 500, 285, '#4CAF50');
      _drawBook(ctx, 200, 240, 20, 15, '#FF9800');
      _drawClock(ctx, 700, 60, 25, '#ECEFF1', '#2196F3');
      _drawVase(ctx, 650, 380, '#F44336');
    },
    10: function (ctx) {
      _drawNeonSign(ctx, 130, 180, 'X', '#A855F7');
      _drawNeonSign(ctx, 310, 160, 'Z', '#F472B6');
      _drawNeonSign(ctx, 490, 170, 'A', '#00F5FF');
      _drawNeonSign(ctx, 660, 190, '!', '#A855F7');
      _drawNeonRect(ctx, 200, 230, 40, 25, '#F472B6');
      _drawNeonRect(ctx, 400, 210, 45, 30, '#00F5FF');
      _drawCar(ctx, 80, 400, '#F44336');
      _drawCar(ctx, 600, 405, '#4CAF50');
      _drawLamp(ctx, 150, 350, '#A855F7');
    }
  };

  function generateLevel(levelId) {
    var levelDef = LEVELS.find(function (l) { return l.id === levelId; });
    if (!levelDef) return null;

    if (!cache[levelId]) {
      var canvasA = document.createElement('canvas');
      canvasA.width = W;
      canvasA.height = H;
      var ctxA = canvasA.getContext('2d');

      var canvasB = document.createElement('canvas');
      canvasB.width = W;
      canvasB.height = H;
      var ctxB = canvasB.getContext('2d');

      var renderer = sceneRenderers[levelId];
      if (renderer) {
        _rngFn = _rng(levelId * 7919 + 42);
        renderer(ctxA);
        _rngFn = _rng(levelId * 7919 + 42);
        renderer(ctxB);
      }
      _rngFn = Math.random;

      var applier = diffAppliers[levelId];
      if (applier) {
        applier(ctxB);
      }

      var diffs = diffGenerators[levelId] ? diffGenerators[levelId]() : [];

      cache[levelId] = {
        id: levelDef.id,
        name: levelDef.name,
        theme: levelDef.theme,
        timeLimit: levelDef.timeLimit,
        difficulty: levelDef.difficulty,
        diffCount: levelDef.diffCount,
        imageA: canvasA.toDataURL('image/png'),
        imageB: canvasB.toDataURL('image/png'),
        diffTemplates: diffs.map(function (d, i) {
          return {
            id: i + 1,
            x: d.x,
            y: d.y,
            radius: d.radius || levelDef.diffRadius,
            type: d.type,
            description: d.description
          };
        })
      };
    }

    var cached = cache[levelId];
    var result = {
      id: cached.id,
      name: cached.name,
      theme: cached.theme,
      timeLimit: cached.timeLimit,
      difficulty: cached.difficulty,
      diffCount: cached.diffCount,
      imageA: cached.imageA,
      imageB: cached.imageB,
      differences: cached.diffTemplates.map(function (d) {
        return Object.assign({}, d, { found: false, hinted: false });
      })
    };
    return result;
  }

  function getLevelDef(levelId) {
    return LEVELS.find(function (l) { return l.id === levelId; });
  }

  function getAllLevels() {
    return LEVELS;
  }

  function clearCache() {
    cache = {};
  }

  return {
    generateLevel: generateLevel,
    getLevelDef: getLevelDef,
    getAllLevels: getAllLevels,
    clearCache: clearCache,
    WIDTH: W,
    HEIGHT: H
  };
})();
