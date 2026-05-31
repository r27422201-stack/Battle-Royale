export interface Entity {
  id: string;
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  color: string;
  type: 'player' | 'enemy';
  name?: string;
  vx: number;
  vy: number;
}

export interface Bullet {
  id: number;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  damage: number;
  life: number;
}

export interface Obstacle {
  x: number;
  y: number;
  radius: number;
  type: string;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animId: number = 0;
  private running: boolean = false;
  
  // Game state
  public player: Entity;
  public enemies: Entity[] = [];
  public bullets: Bullet[] = [];
  public obstacles: Obstacle[] = [];
  public zone = { x: 2000, y: 2000, radius: 2500 };
  
  private worldSize = 4000;
  private bulletIdCounter = 0;

  // Input
  private keys: Record<string, boolean> = {};
  private mouse = { x: 0, y: 0, down: false };
  public touchMove = { x: 0, y: 0 };
  public touchAim = { x: 0, y: 0, shooting: false };
  public joysticks = {
    left: { active: false, baseX: 0, baseY: 0, currX: 0, currY: 0 },
    right: { active: false, baseX: 0, baseY: 0, currX: 0, currY: 0 }
  };
  private activeTouches: Record<number, 'left' | 'right'> = {};

  // Callbacks
  private onStateUpdate: (hp: number, alive: number, zoneRad: number, kills: number, aliveTime: number) => void;
  private onGameOver: (placed: number, kills: number, aliveTime: number) => void;
  
  private startTime: number;
  private kills: number = 0;
  
  // For smooth camera
  private camX: number = 0;
  private camY: number = 0;

  constructor(
    canvas: HTMLCanvasElement, 
    onStateUpdate: (hp: number, alive: number, zoneRad: number, kills: number, aliveTime: number) => void,
    onGameOver: (placed: number, kills: number, aliveTime: number) => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onStateUpdate = onStateUpdate;
    this.onGameOver = onGameOver;
    this.startTime = Date.now();

    // Init player
    this.player = {
      id: 'player',
      x: Math.random() * 1000 + 1500,
      y: Math.random() * 1000 + 1500,
      radius: 15,
      hp: 100,
      maxHp: 100,
      speed: 4,
      color: '#ff5500', // Neon Orange primary
      type: 'player',
      name: 'AGENT_X',
      vx: 0, vy: 0
    };

    // Generate trees/obstacles
    this.obstacles = Array.from({ length: 80 }).map(() => ({
      x: Math.random() * this.worldSize,
      y: Math.random() * this.worldSize,
      radius: 30 + Math.random() * 40,
      type: 'tree'
    }));

    // Generate enemies (Bots)
    this.enemies = Array.from({ length: 49 }).map((_, i) => ({
      id: `bot_${i}`,
      x: Math.random() * this.worldSize,
      y: Math.random() * this.worldSize,
      radius: 15,
      hp: 100,
      maxHp: 100,
      speed: 2 + Math.random() * 1.5,
      color: '#ef4444', 
      type: 'enemy',
      name: `Player_${Math.floor(Math.random()*9000)+1000}`,
      vx: 0, vy: 0
    }));

    this.bindEvents();
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  private bindEvents() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mouseup', this.handleMouseUp);
    
    // Touch Events
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    this.canvas.addEventListener('touchcancel', this.handleTouchEnd, { passive: false });
  }

  private unbindEvents() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.handleTouchEnd);
    window.removeEventListener('resize', this.resize);
  }

  private handleKeyDown(e: KeyboardEvent) { this.keys[e.key.toLowerCase()] = true; }
  private handleKeyUp(e: KeyboardEvent) { this.keys[e.key.toLowerCase()] = false; }
  private handleMouseMove(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }
  private handleMouseDown(e: MouseEvent) { if (e.button === 0) this.mouse.down = true; }
  private handleMouseUp(e: MouseEvent) { if (e.button === 0) this.mouse.down = false; }

  private handleTouchStart(e: TouchEvent) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        if (x < this.canvas.width / 2) {
            this.activeTouches[touch.identifier] = 'left';
            this.joysticks.left = { active: true, baseX: x, baseY: y, currX: x, currY: y };
        } else {
            this.activeTouches[touch.identifier] = 'right';
            this.joysticks.right = { active: true, baseX: x, baseY: y, currX: x, currY: y };
        }
    }
  }
  
  private handleTouchMove(e: TouchEvent) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const side = this.activeTouches[touch.identifier];
        if (!side) continue;
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.joysticks[side].currX = x;
        this.joysticks[side].currY = y;
        
        const maxR = 40;
        let dx = x - this.joysticks[side].baseX;
        let dy = y - this.joysticks[side].baseY;
        const dist = Math.hypot(dx, dy);
        if (dist > maxR) {
            dx = (dx / dist) * maxR;
            dy = (dy / dist) * maxR;
        }
        if (side === 'left') {
            this.touchMove = { x: dx / maxR, y: dy / maxR };
        } else if (side === 'right') {
            const active = (dist > 10);
            this.touchAim = { x: dx / maxR, y: dy / maxR, shooting: active };
        }
    }
  }

  private handleTouchEnd(e: TouchEvent) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const side = this.activeTouches[touch.identifier];
        if (side === 'left') {
            this.joysticks.left.active = false;
            this.touchMove = { x: 0, y: 0 };
        } else if (side === 'right') {
            this.joysticks.right.active = false;
            this.touchAim = { x: 0, y: 0, shooting: false };
        }
        delete this.activeTouches[touch.identifier];
    }
  }

  private resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public start() {
    this.running = true;
    this.loop();
  }

  public stop() {
    this.running = false;
    cancelAnimationFrame(this.animId);
    this.unbindEvents();
  }

  // --- GAME LOGIC ---

  private fireBullet(entity: Entity, targetX: number, targetY: number) {
    const dx = targetX - entity.x;
    const dy = targetY - entity.y;
    const angle = Math.atan2(dy, dx);
    const speed = 15;
    
    // Add inaccuracy for bots, perfectly precise for player
    const variance = entity.type === 'player' ? 0 : (Math.random() - 0.5) * 0.2;

    this.bullets.push({
      id: this.bulletIdCounter++,
      ownerId: entity.id,
      x: entity.x + Math.cos(angle + variance) * entity.radius * 1.5,
      y: entity.y + Math.sin(angle + variance) * entity.radius * 1.5,
      vx: Math.cos(angle + variance) * speed,
      vy: Math.sin(angle + variance) * speed,
      speed: speed,
      damage: 15 + Math.random() * 5,
      life: 60 // 60 frames TTL
    });
  }

  private resolveCircleCollisions(ent: Entity, other: {x: number, y: number, radius: number}) {
    const dx = ent.x - other.x;
    const dy = ent.y - other.y;
    const dist = Math.hypot(dx, dy);
    const minD = ent.radius + other.radius;
    if (dist > 0 && dist < minD) {
      const overlap = minD - dist;
      ent.x += (dx / dist) * overlap;
      ent.y += (dy / dist) * overlap;
    }
  }

  private update() {
    if (!this.running) return;

    // Shrink zone
    if (this.zone.radius > 50) {
      this.zone.radius -= 0.3; // Approx 18u per sec at 60fps
    }

    // --- PLAYER MOVEMENT ---
    let dx = this.touchMove.x; 
    let dy = this.touchMove.y;
    if (this.keys['w']) dy -= 1;
    if (this.keys['s']) dy += 1;
    if (this.keys['a']) dx -= 1;
    if (this.keys['d']) dx += 1;
    
    // Normalize diagonal if using keyboard over 1
    const length = Math.hypot(dx, dy);
    if (length > 1) {
      dx /= length;
      dy /= length;
    }
    this.player.x += dx * this.player.speed;
    this.player.y += dy * this.player.speed;

    // Player Shooting
    if (this.player.hp > 0) {
      const isShooting = this.mouse.down || this.touchAim.shooting;
      if (isShooting && Math.random() < 0.2) {
        if (this.touchAim.shooting && (this.touchAim.x !== 0 || this.touchAim.y !== 0)) {
           const targetX = this.player.x + this.touchAim.x * 100;
           const targetY = this.player.y + this.touchAim.y * 100;
           this.fireBullet(this.player, targetX, targetY);
        } else if (this.mouse.down) {
           const worldMouseX = this.mouse.x + this.camX;
           const worldMouseY = this.mouse.y + this.camY;
           this.fireBullet(this.player, worldMouseX, worldMouseY);
        }
      }
    }

    // Zone damage
    const allEntities = [this.player, ...this.enemies];

    // --- UPDATE ENEMIES (AI) ---
    this.enemies.forEach(bot => {
      // Very simple Bot AI
      
      // Check zone distance
      const toZoneD = Math.hypot(bot.x - this.zone.x, bot.y - this.zone.y);
      let target: Entity | null = null;
      let minD = Infinity;

      // Find closest enemy for combat (within 800 units)
      allEntities.forEach(ent => {
        if (ent.id !== bot.id && ent.hp > 0) {
          const d = Math.hypot(ent.x - bot.x, ent.y - bot.y);
          if (d < minD && d < 800) {
            minD = d;
            target = ent;
          }
        }
      });

      if (toZoneD > this.zone.radius - 50) {
        // Run towards zone center desperately
        bot.x += (this.zone.x - bot.x) / toZoneD * bot.speed * 1.5;
        bot.y += (this.zone.y - bot.y) / toZoneD * bot.speed * 1.5;
      } else if (target) {
        // Combat! Move to engage or keep distance
        if (minD > 300) {
          bot.x += (target.x - bot.x) / minD * bot.speed;
          bot.y += (target.y - bot.y) / minD * bot.speed;
        } else if (minD < 150) {
           // back away
           bot.x -= (target.x - bot.x) / minD * bot.speed;
           bot.y -= (target.y - bot.y) / minD * bot.speed;
        }
        
        // Shoot occasionally
        if (Math.random() < 0.03) { // 3% chance per frame = approx 1-2 shots per sec
          this.fireBullet(bot, target.x, target.y);
        }
      } else {
        // Random wandering (just add random jitter)
        bot.x += (Math.random() - 0.5) * bot.speed;
        bot.y += (Math.random() - 0.5) * bot.speed;
      }
    });

    // --- ZONE DAMAGE (1 dmg every ~15 frames = 4dmg/sec) ---
    if (Math.random() < 0.06) {
      allEntities.forEach(ent => {
        const d = Math.hypot(ent.x - this.zone.x, ent.y - this.zone.y);
        if (d > this.zone.radius) {
          ent.hp -= 2; // Zone hits hard!
        }
      });
    }

    // --- UPDATE BULLETS ---
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life -= 1;

      if (b.life <= 0) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Check collision with trees (blocking bullets)
      let hitTree = false;
      for (const tree of this.obstacles) {
        if (Math.hypot(b.x - tree.x, b.y - tree.y) < tree.radius) {
          hitTree = true;
          break;
        }
      }
      if (hitTree) {
         this.bullets.splice(i, 1);
         continue;
      }

      // Check collision with entities
      let hitEnt = false;
      for (const ent of allEntities) {
        if (ent.id !== b.ownerId && ent.hp > 0) {
          if (Math.hypot(b.x - ent.x, b.y - ent.y) < ent.radius + 5) {
            ent.hp -= b.damage;
            hitEnt = true;
            if (ent.hp <= 0 && b.ownerId === 'player') {
              this.kills++; // Player scored a kill
            }
            break;
          }
        }
      }
      if (hitEnt) {
        this.bullets.splice(i, 1);
      }
    }

    // --- COLLISIONS (Entity vs Entity/Trees) ---
    allEntities.forEach(ent => {
       // Keep in world bounds
       ent.x = Math.max(0, Math.min(this.worldSize, ent.x));
       ent.y = Math.max(0, Math.min(this.worldSize, ent.y));

       // vs Trees
       for (const tree of this.obstacles) {
         this.resolveCircleCollisions(ent, tree);
       }

       // vs Other Entities
       for (const other of allEntities) {
         if (ent !== other) {
           this.resolveCircleCollisions(ent, other);
         }
       }
    });

    // --- REMOVE DEAD ---
    const initialEnemyCount = this.enemies.length;
    this.enemies = this.enemies.filter(e => e.hp > 0);
    const aliveCount = this.enemies.length + (this.player.hp > 0 ? 1 : 0);

    // Callbacks
    const secondsAlive = Math.floor((Date.now() - this.startTime) / 1000);
    this.onStateUpdate(this.player.hp, aliveCount, this.zone.radius, this.kills, secondsAlive);

    // Check Win/Loss
    if (this.player.hp <= 0) {
      this.running = false;
      this.onGameOver(aliveCount, this.kills, secondsAlive);
      return;
    }
    if (aliveCount === 1) { // Only player left
      this.running = false;
      this.onGameOver(1, this.kills, secondsAlive);
      return;
    }
  }

  // --- RENDER LOGIC ---
  private draw() {
    if (!this.ctx) return;
    const { canvas, ctx } = this;
    
    // Clear canvas
    ctx.fillStyle = '#0f172a'; // Deep dark slate background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate camera target (centered on player)
    this.camX = this.player.x - canvas.width / 2;
    this.camY = this.player.y - canvas.height / 2;

    ctx.save();
    ctx.translate(-this.camX, -this.camY);

    // Context is now in world coordinates

    // Draw Grid (Floor aesthetics)
    ctx.strokeStyle = '#1e293b'; // slate-800
    ctx.lineWidth = 1;
    const gridSize = 100;
    const startX = Math.floor(this.camX / gridSize) * gridSize;
    const startY = Math.floor(this.camY / gridSize) * gridSize;
    
    ctx.beginPath();
    for (let x = startX; x < this.camX + canvas.width; x += gridSize) {
      if (x < 0 || x > this.worldSize) continue;
      ctx.moveTo(x, Math.max(0, this.camY));
      ctx.lineTo(x, Math.min(this.worldSize, this.camY + canvas.height));
    }
    for (let y = startY; y < this.camY + canvas.height; y += gridSize) {
      if (y < 0 || y > this.worldSize) continue;
      ctx.moveTo(Math.max(0, this.camX), y);
      ctx.lineTo(Math.min(this.worldSize, this.camX + canvas.width), y);
    }
    ctx.stroke();

    // Draw Safe Zone bounds
    // Instead of drawing the circle, draw the "Storm" outside the circle
    // Creating an inverted circle mask is easiest via clipping or simply heavy stroke.
    ctx.beginPath();
    ctx.arc(this.zone.x, this.zone.y, this.zone.radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)'; // Red storm edge
    ctx.lineWidth = 10;
    ctx.stroke();

    // Draw a big semi-transparent red area outside the zone
    // We draw a huge square covering world, cut a hole in it
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.beginPath();
    ctx.rect(0, 0, this.worldSize, this.worldSize);
    ctx.arc(this.zone.x, this.zone.y, this.zone.radius, 0, Math.PI * 2, true);
    ctx.fill();

    // Draw obstacles (Trees/Rocks)
    this.obstacles.forEach(obs => {
      // Simple geometric trees (hexagons or green circles)
      ctx.beginPath();
      ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#064e3b'; // emerald-900 (dark green block)
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#022c22';
      ctx.stroke();
    });

    // Draw bullets
    ctx.fillStyle = '#fbbf24'; // Gold bullets
    this.bullets.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
      // Trail
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - b.vx * 2, b.y - b.vy * 2);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw entities helper
    const drawEntity = (ent: Entity) => {
      ctx.beginPath();
      ctx.arc(ent.x, ent.y, ent.radius, 0, Math.PI * 2);
      ctx.fillStyle = ent.color;
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Face direction (if player, face mouse or touch aim location)
      let faceAngle = 0;
      if (ent.type === 'player') {
         if (this.touchAim.shooting || (this.touchAim.x !== 0 || this.touchAim.y !== 0)) {
             faceAngle = Math.atan2(this.touchAim.y, this.touchAim.x);
         } else {
             faceAngle = Math.atan2((this.mouse.y + this.camY) - ent.y, (this.mouse.x + this.camX) - ent.x);
         }
      } else {
         faceAngle = Math.atan2(ent.vy, ent.vx);
      }

      ctx.beginPath();
      ctx.moveTo(ent.x, ent.y);
      ctx.lineTo(ent.x + Math.cos(faceAngle) * ent.radius * 1.5, ent.y + Math.sin(faceAngle) * ent.radius * 1.5);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      ctx.stroke();

      // HP Bar (only if not full or is player)
      if (ent.hp < ent.maxHp || ent.type === 'player') {
        const barWidth = 30;
        ctx.fillStyle = '#000';
        ctx.fillRect(ent.x - barWidth/2, ent.y - ent.radius - 12, barWidth, 4);
        ctx.fillStyle = ent.type === 'player' ? '#10b981' : '#ef4444'; // Green for self, red for enemy hp
        ctx.fillRect(ent.x - barWidth/2, ent.y - ent.radius - 12, barWidth * Math.max(0, ent.hp / ent.maxHp), 4);
      }

      // Name
      if (ent.name && ent.type !== 'player') {
         ctx.fillStyle = '#9ca3af';
         ctx.font = '10px JetBrains Mono';
         ctx.textAlign = 'center';
         ctx.fillText(ent.name, ent.x, ent.y - ent.radius - 18);
      }
    };

    // Draw enemies
    this.enemies.forEach(drawEntity);

    // Draw player
    if (this.player.hp > 0) {
      drawEntity(this.player);
      // Player name and crosshair logic
      ctx.fillStyle = '#ff5500';
      ctx.font = 'bold 12px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(this.player.name || '', this.player.x, this.player.y - this.player.radius - 18);
    }

    ctx.restore(); // Reset view to screen coordinates

    // Screen-space drawing (Mouse Crosshair)
    if (!this.joysticks.right.active && !this.joysticks.left.active) {
      ctx.beginPath();
      ctx.arc(this.mouse.x, this.mouse.y, 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.moveTo(this.mouse.x - 12, this.mouse.y);
      ctx.lineTo(this.mouse.x + 12, this.mouse.y);
      ctx.moveTo(this.mouse.x, this.mouse.y - 12);
      ctx.lineTo(this.mouse.x, this.mouse.y + 12);
      ctx.stroke();
    }

    // Touch Joysticks
    const drawJoy = (joy: {active:boolean, baseX:number, baseY:number, currX:number, currY:number}, color: string) => {
      if (!joy.active) return;
      ctx.beginPath();
      ctx.arc(joy.baseX, joy.baseY, 40, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();
       
      let dx = joy.currX - joy.baseX;
      let dy = joy.currY - joy.baseY;
      const dist = Math.hypot(dx, dy);
      if (dist > 40) { dx = (dx/dist)*40; dy = (dy/dist)*40; }
       
      ctx.beginPath();
      ctx.arc(joy.baseX + dx, joy.baseY + dy, 18, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    };
    
    drawJoy(this.joysticks.left, 'rgba(255, 255, 255, 0.6)');
    drawJoy(this.joysticks.right, 'rgba(255, 85, 0, 0.7)');
  }

  private loop = () => {
    this.update();
    this.draw();
    if (this.running) {
      this.animId = requestAnimationFrame(this.loop);
    }
  }
}
