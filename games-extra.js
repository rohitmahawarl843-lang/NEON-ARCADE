/* ========== EXTRA 5 NEW ARCADE GAMES ========== */

/* 1. SPACE INVADER / NEON SHOOTER */
function init_spaceshooter(panel) {
  panel.innerHTML = `
    <div class="center">
      <div class="score">Score: <span id="spaceScore">0</span> | Lives: <span id="spaceLives">3</span> | Wave: <span id="spaceWave">1</span></div>
      <canvas id="spaceCanvas" width="320" height="420"></canvas>
      <div class="msg">Left/Right/A/D se move karo, Space/Tap se shoot karo!</div>
    </div>`;

  const canvas = document.getElementById('spaceCanvas');
  const ctx = canvas.getContext('2d');
  let player = { x: 160, y: 380, w: 26, h: 26, speed: 5 };
  let lasers = [];
  let enemies = [];
  let stars = Array(30).fill(0).map(() => ({ x: Math.random() * 320, y: Math.random() * 420, s: Math.random() * 2 + 1 }));
  let score = 0, lives = 3, wave = 1, over = false, frame = 0;
  let keys = {};

  function spawnWave() {
    enemies = [];
    const rows = Math.min(4, 2 + Math.floor(wave / 2));
    const cols = 5;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        enemies.push({
          x: 40 + c * 55,
          y: 40 + r * 35,
          w: 24,
          h: 20,
          hp: 1,
          type: r % 2 === 0 ? '👾' : '🛸',
          color: r % 2 === 0 ? '#ff2e9a' : '#00e5ff'
        });
      }
    }
  }

  function shoot() {
    if (over) return;
    lasers.push({ x: player.x, y: player.y - 12, speed: 8 });
    if (window.retroAudio) window.retroAudio.laser();
  }

  function keyHandler(e) {
    keys[e.key] = true;
    if (e.code === 'Space') {
      e.preventDefault();
      shoot();
    }
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
  }
  function keyUpHandler(e) { keys[e.key] = false; }

  function clickHandler(e) {
    if (over) {
      restart();
    } else {
      shoot();
    }
  }

  document.addEventListener('keydown', keyHandler);
  document.addEventListener('keyup', keyUpHandler);
  canvas.addEventListener('click', clickHandler);

  function restart() {
    score = 0; lives = 3; wave = 1; over = false; lasers = [];
    player.x = 160;
    document.getElementById('spaceScore').textContent = 0;
    document.getElementById('spaceLives').textContent = 3;
    document.getElementById('spaceWave').textContent = 1;
    spawnWave();
  }

  let enemyDir = 1;
  let enemySpeed = 1;

  function step() {
    frame++;
    // Stars
    stars.forEach(s => {
      s.y += s.s;
      if (s.y > 420) { s.y = 0; s.x = Math.random() * 320; }
    });

    if (!over) {
      if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.x -= player.speed;
      if (keys['ArrowRight'] || keys['d'] || keys['D']) player.x += player.speed;
      player.x = Math.max(16, Math.min(304, player.x));

      // Lasers
      lasers.forEach(l => l.y -= l.speed);
      lasers = lasers.filter(l => l.y > -10);

      // Enemies movement
      let hitEdge = false;
      enemies.forEach(e => {
        e.x += enemyDir * (enemySpeed + wave * 0.2);
        if (e.x < 15 || e.x > 305) hitEdge = true;
      });
      if (hitEdge) {
        enemyDir *= -1;
        enemies.forEach(e => e.y += 12);
      }

      // Lasers hit enemies
      lasers.forEach(l => {
        enemies.forEach(e => {
          if (!e.dead && Math.abs(l.x - e.x) < e.w && Math.abs(l.y - e.y) < e.h) {
            e.dead = true;
            l.y = -100;
            score += 25;
            document.getElementById('spaceScore').textContent = score;
            if (window.retroAudio) window.retroAudio.hit();
          }
        });
      });

      enemies = enemies.filter(e => !e.dead);

      // Wave cleared
      if (enemies.length === 0) {
        wave++;
        document.getElementById('spaceWave').textContent = wave;
        if (window.retroAudio) window.retroAudio.victory();
        if (window.arcadeHub) window.arcadeHub.triggerConfetti();
        spawnWave();
      }

      // Enemies reach bottom
      enemies.forEach(e => {
        if (e.y > 360 || Math.hypot(e.x - player.x, e.y - player.y) < 22) {
          lives--;
          document.getElementById('spaceLives').textContent = lives;
          if (window.retroAudio) window.retroAudio.explosion();
          if (lives <= 0) {
            over = true;
            setBest('spaceshooter', score);
            if (window.arcadeHub) window.arcadeHub.addXP(score);
          } else {
            e.y -= 80;
          }
        }
      });
    }

    // Render
    ctx.fillStyle = '#080816';
    ctx.fillRect(0, 0, 320, 420);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    stars.forEach(s => ctx.fillRect(s.x, s.y, s.s, s.s));

    // Player
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - 14);
    ctx.lineTo(player.x - 14, player.y + 12);
    ctx.lineTo(player.x, player.y + 6);
    ctx.lineTo(player.x + 14, player.y + 12);
    ctx.closePath();
    ctx.fill();

    // Lasers
    ctx.fillStyle = '#ffd23f';
    lasers.forEach(l => {
      ctx.fillRect(l.x - 2, l.y, 4, 10);
    });

    // Enemies
    enemies.forEach(e => {
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.type, e.x, e.y);
    });

    if (over) {
      ctx.fillStyle = 'rgba(10, 10, 22, 0.85)';
      ctx.fillRect(0, 140, 320, 120);
      ctx.fillStyle = '#ff2e9a';
      ctx.font = 'bold 20px "Press Start 2P", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', 160, 185);
      ctx.fillStyle = '#fff';
      ctx.font = '14px sans-serif';
      ctx.fillText('Final Score: ' + score, 160, 215);
      ctx.fillText('Tap/Click to play again', 160, 240);
    }
  }

  restart();
  const iv = setInterval(step, 20);
  return () => {
    clearInterval(iv);
    document.removeEventListener('keydown', keyHandler);
    document.removeEventListener('keyup', keyUpHandler);
    canvas.removeEventListener('click', clickHandler);
  };
}

/* 2. BRICK BREAKER / BREAKOUT */
function init_breakout(panel) {
  panel.innerHTML = `
    <div class="center">
      <div class="score">Score: <span id="bbScore">0</span> | Lives: <span id="bbLives">3</span></div>
      <canvas id="bbCanvas" width="320" height="380"></canvas>
      <div class="msg">Mouse / Touch / Arrows se paddle slide karo</div>
    </div>`;

  const canvas = document.getElementById('bbCanvas');
  const ctx = canvas.getContext('2d');
  const paddle = { x: 130, y: 350, w: 64, h: 10, speed: 6 };
  let ball = { x: 160, y: 300, vx: 3, vy: -3, r: 5 };
  let bricks = [];
  let score = 0, lives = 3, over = false, won = false;
  const colors = ['#ff2e9a', '#7b5cff', '#00e5ff', '#ffd23f', '#00ff88'];

  function createBricks() {
    bricks = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 6; c++) {
        bricks.push({
          x: 18 + c * 48,
          y: 35 + r * 22,
          w: 42,
          h: 16,
          color: colors[r],
          pts: (5 - r) * 10
        });
      }
    }
  }

  function mouseHandler(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (320 / rect.width);
    paddle.x = Math.max(0, Math.min(320 - paddle.w, mx - paddle.w / 2));
  }

  function touchHandler(e) {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) mouseHandler(touch);
  }

  canvas.addEventListener('mousemove', mouseHandler);
  canvas.addEventListener('touchmove', touchHandler, { passive: false });
  canvas.addEventListener('click', () => { if (over || won) restart(); });

  function restart() {
    paddle.x = 130;
    ball = { x: 160, y: 300, vx: 3.2 * (Math.random() > 0.5 ? 1 : -1), vy: -3.5, r: 5 };
    score = 0; lives = 3; over = false; won = false;
    document.getElementById('bbScore').textContent = 0;
    document.getElementById('bbLives').textContent = 3;
    createBricks();
  }

  function step() {
    if (!over && !won) {
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Wall bounces
      if (ball.x - ball.r <= 0 || ball.x + ball.r >= 320) {
        ball.vx *= -1;
        if (window.retroAudio) window.retroAudio.click();
      }
      if (ball.y - ball.r <= 0) {
        ball.vy *= -1;
        if (window.retroAudio) window.retroAudio.click();
      }

      // Paddle bounce
      if (ball.y + ball.r >= paddle.y && ball.y - ball.r <= paddle.y + paddle.h &&
          ball.x >= paddle.x && ball.x <= paddle.x + paddle.w) {
        const hitPos = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
        ball.vx = hitPos * 4.5;
        ball.vy = -Math.abs(ball.vy);
        if (window.retroAudio) window.retroAudio.jump();
      }

      // Brick collisions
      for (let i = bricks.length - 1; i >= 0; i--) {
        const b = bricks[i];
        if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w &&
            ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
          ball.vy *= -1;
          score += b.pts;
          document.getElementById('bbScore').textContent = score;
          bricks.splice(i, 1);
          if (window.retroAudio) window.retroAudio.score();
          break;
        }
      }

      if (bricks.length === 0) {
        won = true;
        setBest('breakout', score);
        if (window.retroAudio) window.retroAudio.victory();
        if (window.arcadeHub) window.arcadeHub.triggerConfetti();
      }

      // Bottom fall
      if (ball.y > 380) {
        lives--;
        document.getElementById('bbLives').textContent = lives;
        if (window.retroAudio) window.retroAudio.hit();
        if (lives <= 0) {
          over = true;
          setBest('breakout', score);
        } else {
          ball.x = paddle.x + paddle.w / 2;
          ball.y = 300;
          ball.vy = -3.5;
          ball.vx = (Math.random() - 0.5) * 4;
        }
      }
    }

    // Render
    ctx.fillStyle = '#0e0e1e';
    ctx.fillRect(0, 0, 320, 380);

    // Bricks
    bricks.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 6;
      ctx.fillRect(b.x, b.y, b.w, b.h);
    });
    ctx.shadowBlur = 0;

    // Paddle
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

    // Ball
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();

    if (over || won) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 130, 320, 100);
      ctx.fillStyle = won ? '#00ff88' : '#ff2e9a';
      ctx.font = 'bold 18px "Press Start 2P", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(won ? 'VICTORY!' : 'GAME OVER', 160, 175);
      ctx.fillStyle = '#fff';
      ctx.font = '14px sans-serif';
      ctx.fillText('Score: ' + score + ' - Tap to retry', 160, 205);
    }
  }

  restart();
  const iv = setInterval(step, 20);
  return () => {
    clearInterval(iv);
    canvas.removeEventListener('mousemove', mouseHandler);
    canvas.removeEventListener('touchmove', touchHandler);
  };
}

/* 3. DOODLE NEON JUMP */
function init_neonjump(panel) {
  panel.innerHTML = `
    <div class="center">
      <div class="score">Height: <span id="jumpScore">0</span>m</div>
      <canvas id="jumpCanvas" width="300" height="420"></canvas>
      <div class="msg">Left/Right arrows ya tilt/click se jump karo!</div>
    </div>`;

  const canvas = document.getElementById('jumpCanvas');
  const ctx = canvas.getContext('2d');
  let player = { x: 140, y: 300, vx: 0, vy: -9, r: 12 };
  let platforms = [];
  let score = 0, maxHeight = 0, over = false, camY = 0;
  let keys = {};

  function makePlatform(y) {
    return {
      x: Math.random() * 220,
      y: y,
      w: 60,
      h: 12,
      color: Math.random() < 0.2 ? '#ffd23f' : '#00e5ff',
      isSpring: Math.random() < 0.15
    };
  }

  function restart() {
    player = { x: 140, y: 320, vx: 0, vy: -8, r: 12 };
    platforms = [{ x: 120, y: 380, w: 80, h: 12, color: '#00e5ff' }];
    for (let y = 320; y > -400; y -= 65) {
      platforms.push(makePlatform(y));
    }
    score = 0; maxHeight = 0; over = false; camY = 0;
    document.getElementById('jumpScore').textContent = 0;
  }

  function keyHandler(e) {
    keys[e.key] = true;
    if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  }
  function keyUpHandler(e) { keys[e.key] = false; }

  document.addEventListener('keydown', keyHandler);
  document.addEventListener('keyup', keyUpHandler);
  canvas.addEventListener('click', (e) => {
    if (over) restart();
    else {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      player.vx = clickX < rect.width / 2 ? -5 : 5;
    }
  });

  function step() {
    if (!over) {
      if (keys['ArrowLeft'] || keys['a']) player.vx = -4.5;
      else if (keys['ArrowRight'] || keys['d']) player.vx = 4.5;
      else player.vx *= 0.88;

      player.x += player.vx;
      if (player.x < 0) player.x = 300;
      if (player.x > 300) player.x = 0;

      player.vy += 0.28;
      player.y += player.vy;

      // Platform bounce
      if (player.vy > 0) {
        platforms.forEach(p => {
          if (player.x > p.x && player.x < p.x + p.w &&
              player.y + player.r >= p.y && player.y + player.r <= p.y + p.h + 6) {
            player.vy = p.isSpring ? -13 : -8.5;
            if (window.retroAudio) {
              if (p.isSpring) window.retroAudio.powerup();
              else window.retroAudio.jump();
            }
          }
        });
      }

      // Camera follow
      if (player.y < camY + 180) {
        const diff = (camY + 180) - player.y;
        camY -= diff;
        score = Math.floor(Math.abs(camY) / 10);
        document.getElementById('jumpScore').textContent = score;
        setBest('neonjump', score);
      }

      // Generate new platforms
      const highestPlat = platforms.reduce((min, p) => Math.min(min, p.y), 400);
      if (highestPlat > camY - 200) {
        platforms.push(makePlatform(highestPlat - (55 + Math.random() * 25)));
      }

      // Remove fallen platforms
      platforms = platforms.filter(p => p.y < camY + 460);

      // Fall to death
      if (player.y > camY + 440) {
        over = true;
        setBest('neonjump', score);
        if (window.retroAudio) window.retroAudio.gameOver();
      }
    }

    // Render
    ctx.fillStyle = '#100e26';
    ctx.fillRect(0, 0, 300, 420);

    ctx.save();
    ctx.translate(0, -camY);

    // Platforms
    platforms.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      if (p.isSpring) {
        ctx.fillStyle = '#ff2e9a';
        ctx.fillRect(p.x + p.w / 2 - 6, p.y - 6, 12, 6);
      }
    });

    // Player
    ctx.fillStyle = '#ff2e9a';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x - 4, player.y - 4, 3, 3);
    ctx.fillRect(player.x + 2, player.y - 4, 3, 3);

    ctx.restore();

    if (over) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 160, 300, 100);
      ctx.fillStyle = '#ff2e9a';
      ctx.font = 'bold 18px "Press Start 2P", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FELL DOWN!', 150, 200);
      ctx.fillStyle = '#fff';
      ctx.font = '14px sans-serif';
      ctx.fillText('Height: ' + score + 'm - Click to retry', 150, 230);
    }
  }

  restart();
  const iv = setInterval(step, 20);
  return () => {
    clearInterval(iv);
    document.removeEventListener('keydown', keyHandler);
    document.removeEventListener('keyup', keyUpHandler);
  };
}

/* 4. SPEED TYPIST / NEON RUSH */
function init_typerush(panel) {
  panel.innerHTML = `
    <div class="center">
      <div class="score">Score: <span id="typeScore">0</span> | Lives: <span id="typeLives">5</span> | WPM: <span id="typeWpm">0</span></div>
      <canvas id="typeCanvas" width="320" height="340"></canvas>
      <input type="text" id="typeInput" placeholder="Type here..." autocomplete="off" style="margin-top:12px; width:220px; font-size:16px;">
      <div class="msg">Falling words type karo zameen pe girne se pehle!</div>
    </div>`;

  const canvas = document.getElementById('typeCanvas');
  const ctx = canvas.getContext('2d');
  const input = document.getElementById('typeInput');
  const wordBank = ['NEON', 'FAST', 'LASER', 'CYBER', 'BEAT', 'POWER', 'PULSE', 'STORM', 'BLAST', 'DRIVE', 'HYPER', 'LIGHT', 'SUPER', 'TURBO', 'RETRO', 'FLASH', 'SPACE', 'CODE', 'GLOW', 'SURGE'];

  let words = [];
  let score = 0, lives = 5, wordsTyped = 0, over = false, frame = 0;
  let startTime = Date.now();

  function spawnWord() {
    const text = wordBank[Math.floor(Math.random() * wordBank.length)];
    words.push({
      text,
      x: 30 + Math.random() * 200,
      y: 0,
      speed: 1 + Math.random() * 1.2 + (score * 0.05),
      color: ['#00e5ff', '#ff2e9a', '#ffd23f', '#00ff88'][Math.floor(Math.random() * 4)]
    });
  }

  input.addEventListener('input', () => {
    if (over) return;
    const val = input.value.trim().toUpperCase();
    const idx = words.findIndex(w => w.text === val);
    if (idx !== -1) {
      score += val.length * 10;
      wordsTyped++;
      words.splice(idx, 1);
      input.value = '';
      document.getElementById('typeScore').textContent = score;
      const mins = (Date.now() - startTime) / 60000;
      document.getElementById('typeWpm').textContent = Math.round(wordsTyped / Math.max(0.1, mins));
      setBest('typerush', score);
      if (window.retroAudio) window.retroAudio.score();
    }
  });

  input.focus();

  function restart() {
    words = []; score = 0; lives = 5; wordsTyped = 0; over = false; frame = 0;
    startTime = Date.now();
    document.getElementById('typeScore').textContent = 0;
    document.getElementById('typeLives').textContent = 5;
    document.getElementById('typeWpm').textContent = 0;
    input.value = '';
    input.focus();
  }

  function step() {
    frame++;
    if (!over) {
      if (frame % Math.max(40, 90 - Math.floor(score / 50)) === 0) {
        spawnWord();
      }

      words.forEach(w => w.y += w.speed);

      // Hit bottom
      words.forEach(w => {
        if (w.y > 320) {
          w.dead = true;
          lives--;
          document.getElementById('typeLives').textContent = lives;
          if (window.retroAudio) window.retroAudio.hit();
          if (lives <= 0) {
            over = true;
            setBest('typerush', score);
            if (window.retroAudio) window.retroAudio.gameOver();
          }
        }
      });
      words = words.filter(w => !w.dead);
    }

    ctx.fillStyle = '#0b0c1e';
    ctx.fillRect(0, 0, 320, 340);

    // Ground line
    ctx.strokeStyle = '#ff2e9a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 320);
    ctx.lineTo(320, 320);
    ctx.stroke();

    // Words
    words.forEach(w => {
      ctx.fillStyle = w.color;
      ctx.font = 'bold 16px "Press Start 2P", monospace';
      ctx.fillText(w.text, w.x, w.y);
    });

    if (over) {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 100, 320, 120);
      ctx.fillStyle = '#ff2e9a';
      ctx.font = 'bold 18px "Press Start 2P", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OUT OF LIVES!', 160, 140);
      ctx.fillStyle = '#fff';
      ctx.font = '14px sans-serif';
      ctx.fillText('Final Score: ' + score, 160, 170);
      ctx.fillText('Click to Restart', 160, 195);
    }
  }

  canvas.addEventListener('click', () => { if (over) restart(); });
  restart();
  const iv = setInterval(step, 20);
  return () => {
    clearInterval(iv);
  };
}

/* 5. COLOR SWITCH / ORBIT RING */
function init_colorswitch(panel) {
  panel.innerHTML = `
    <div class="center">
      <div class="score">Score: <span id="csScore">0</span></div>
      <canvas id="csCanvas" width="300" height="400"></canvas>
      <div class="msg">Click / Space se ball jump karao, matching color se pass karo!</div>
    </div>`;

  const canvas = document.getElementById('csCanvas');
  const ctx = canvas.getContext('2d');
  const colors = ['#00e5ff', '#ff2e9a', '#ffd23f', '#7b5cff'];

  let ball = { x: 150, y: 320, vy: 0, color: colors[0] };
  let rings = [];
  let score = 0, over = false, camY = 0;

  function makeRing(y) {
    return {
      y: y,
      r: 60,
      angle: 0,
      speed: 0.03 * (Math.random() > 0.5 ? 1 : -1),
      passed: false
    };
  }

  function jump() {
    if (over) { restart(); return; }
    ball.vy = -6.5;
    if (window.retroAudio) window.retroAudio.jump();
  }

  function restart() {
    ball = { x: 150, y: 320, vy: 0, color: colors[Math.floor(Math.random() * colors.length)] };
    rings = [makeRing(180), makeRing(0), makeRing(-180)];
    score = 0; over = false; camY = 0;
    document.getElementById('csScore').textContent = 0;
  }

  canvas.addEventListener('click', jump);
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); jump(); }
  });

  function step() {
    if (!over) {
      ball.vy += 0.26;
      ball.y += ball.vy;

      // Rotate rings
      rings.forEach(r => r.angle += r.speed);

      // Camera follow
      if (ball.y < camY + 220) {
        camY = ball.y - 220;
      }

      // Check scoring and collisions
      rings.forEach(r => {
        if (!r.passed && ball.y < r.y) {
          r.passed = true;
          score++;
          document.getElementById('csScore').textContent = score;
          setBest('colorswitch', score);
          ball.color = colors[Math.floor(Math.random() * colors.length)];
          if (window.retroAudio) window.retroAudio.score();
          rings.push(makeRing(r.y - 180));
        }

        // Collision check near ring boundaries
        const dist = Math.abs(ball.y - r.y);
        if (dist > r.r - 12 && dist < r.r + 12) {
          // Determine which color segment ball is passing through
          // Segment angle at top (ball passing down/up through x=150)
          const angleNorm = ((r.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const segmentIdx = Math.floor(((angleNorm + Math.PI / 2) % (Math.PI * 2)) / (Math.PI / 2));
          const hitColor = colors[segmentIdx % 4];
          if (hitColor !== ball.color) {
            over = true;
            setBest('colorswitch', score);
            if (window.retroAudio) window.retroAudio.hit();
          }
        }
      });

      // Bottom fall
      if (ball.y > camY + 420) {
        over = true;
        setBest('colorswitch', score);
      }
    }

    ctx.fillStyle = '#0a0a18';
    ctx.fillRect(0, 0, 300, 400);

    ctx.save();
    ctx.translate(0, -camY);

    // Draw rings
    rings.forEach(r => {
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(150, r.y, r.r, r.angle + i * Math.PI / 2, r.angle + (i + 1) * Math.PI / 2);
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = 10;
        ctx.stroke();
      }
    });

    // Draw ball
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (over) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 150, 300, 100);
      ctx.fillStyle = '#ff2e9a';
      ctx.font = 'bold 18px "Press Start 2P", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('COLOR MISMATCH!', 150, 190);
      ctx.fillStyle = '#fff';
      ctx.font = '14px sans-serif';
      ctx.fillText('Score: ' + score + ' - Tap to retry', 150, 220);
    }
  }

  restart();
  const iv = setInterval(step, 20);
  return () => {
    clearInterval(iv);
  };
}
