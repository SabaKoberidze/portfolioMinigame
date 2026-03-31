<template>
  <div ref="pixiContainer"></div>
</template>

<script setup lang="ts">
import { AnimatedSprite, Application, Assets, Graphics, Sprite, Text, Texture} from 'pixi.js';
import {ref, onMounted } from 'vue';
import { Avatar } from './gameComponents/avatar';
import {Backgrounds} from './gameComponents/background'
import { gameConfig } from './stores/gameConfigStore'
import { Enemy } from './gameComponents/enemy';
import * as Enums from './enums'
let pixiContainer = ref()
let gameScale: number
let gameWidth: number 
let gameHeight: number
let keyState: any[] = [];
let cursor: {x: number, y: number}={x:0,y:0}
let app: Application
let avatar: Avatar
let enemies: Enemy[] = []
let backgrounds: Backgrounds
let animatedAvatar: AnimatedSprite
let idleAvatar: AnimatedSprite
let basicAttack: AnimatedSprite
let avatarJump: AnimatedSprite
let knightIdle: AnimatedSprite
let gameConfigStore = gameConfig()
gameWidth = gameConfigStore.width
gameHeight = gameConfigStore.height
let playerHpText: Text
let enemyCountText: Text
let gameOver = false

const keyEventLogger =  function (e: any, type: boolean) { 
  (keyState[e.keyCode] as any) = e.type == 'keydown';  
}

onMounted(async () => {
    app = new Application();
    await app.init({
      width: gameWidth, 
      height: gameHeight, 
      background:'white',
      resolution: devicePixelRatio,
      autoDensity: true,
      });
    pixiContainer.value.appendChild(app.canvas);
    await preload()
    app.stage.interactive = true
    app.stage.on("pointermove", (e)=>{
      let pos = e.global 
      cursor.x = pos.x / gameScale
      cursor.y = pos.y / gameScale
    })
    backgrounds = new Backgrounds(app)
    avatar = new Avatar(app, animatedAvatar, idleAvatar, basicAttack, avatarJump)
    avatar.onBasicAttack(()=>{
      const avatarHitBox = avatar.getHitBox()
      for(const e of enemies) {
        if(e.getHp() <= 0) continue
        const enemyHitBox = e.getHitBox()
        let hit = false
        if(avatarHitBox.direction){
          if(avatarHitBox.x <= enemyHitBox.x && avatarHitBox.x + avatarHitBox.hitWidth > enemyHitBox.x - enemyHitBox.width / 2 && Math.abs(avatarHitBox.y - enemyHitBox.y) < 100){
            hit = true
          }
        }else{
          if(avatarHitBox.x >= enemyHitBox.x && avatarHitBox.x - avatarHitBox.hitWidth < enemyHitBox.x + enemyHitBox.width / 2 && Math.abs(avatarHitBox.y - enemyHitBox.y) < 100){
            hit = true
          }
        }
        if(hit) {
          e.takeDamage(1, avatarHitBox.x)
          if(e.getHp() <= 0) {
            e.destroy()
            enemies.splice(enemies.indexOf(e), 1)
            enemyCountText.text = `Enemies: ${enemies.length}`
            setTimeout(() => { if(!gameOver) spawnEnemies(1) }, 3000)
          }
        }
      }
    })

    spawnEnemies(8)

    // HP display texts
    playerHpText = new Text({ text: 'HP: 5', style: { fill: 0x00ff00, fontSize: 32, fontWeight: 'bold', stroke: { color: 0x000000, width: 4 } } })
    playerHpText.x = 20
    playerHpText.y = 20
    playerHpText.zIndex = 9999
    app.stage.addChild(playerHpText)

    enemyCountText = new Text({ text: `Enemies: ${enemies.length}`, style: { fill: 0xff4444, fontSize: 32, fontWeight: 'bold', stroke: { color: 0x000000, width: 4 } } })
    enemyCountText.x = gameWidth - 220
    enemyCountText.y = 20
    enemyCountText.zIndex = 9999
    app.stage.addChild(enemyCountText)

    addEvents()
    app.ticker.add((delta) => {
      if(gameOver) return
      avatar.movement(keyState, cursor, delta)
      const playerPos = avatar.getPosition()
      const dashing = avatar.isDashing()
      for(const e of enemies) {
        if(e.getHp() <= 0) continue
        const playerHit = e.update(delta, playerPos)
        if(playerHit && !dashing) {
          avatar.takeDamage(1, e.getPosition())
          const newHp = avatar.getHp()
          playerHpText.text = `HP: ${newHp}`
          if(newHp <= 0) { showEndScreen(false); return }
        }
      }
    });
    resize()
})
function spawnEnemies(count: number) {
  for(let i = 0; i < count; i++) {
    const knightAnim = loadAnimations('knightIdle')
    const e = new Enemy(app, knightAnim)
    // Spawn at random screen edges so they close in on the player
    let x: number, y: number
    if(Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 60 : gameWidth - 60
      y = 80 + Math.random() * (gameHeight - 160)
    } else {
      x = 80 + Math.random() * (gameWidth - 160)
      y = Math.random() < 0.5 ? 60 : gameHeight - 60
    }
    e.createEnemy(Enums.EnemyType.Knight, x, y)
    enemies.push(e)
    if(enemyCountText) enemyCountText.text = `Enemies: ${enemies.length}`
  }
}
function showEndScreen(won: boolean) {
  gameOver = true
  const overlay = new Graphics()
  overlay.rect(0, 0, gameWidth, gameHeight).fill({ color: 0x000000, alpha: 0.6 })
  overlay.zIndex = 10000
  app.stage.addChild(overlay)

  const label = new Text({
    text: won ? 'YOU WIN!' : 'YOU LOSE',
    style: {
      fill: won ? 0xFFD700 : 0xFF4444,
      fontSize: 120,
      fontWeight: 'bold',
      stroke: { color: 0x000000, width: 8 }
    }
  })
  label.anchor.set(0.5)
  label.x = gameWidth / 2
  label.y = gameHeight / 2
  label.zIndex = 10001
  app.stage.addChild(label)
}
function addEvents() {
  window.addEventListener("keydown", (e: any)=>{
    keyEventLogger(e, true)  
    avatar.movingStateChecker(e.keyCode, true) 
  });
  window.addEventListener("keyup",  (e: any)=>{
    keyEventLogger(e, false)
    avatar.movingStateChecker(e.keyCode, false)
  });
  window.addEventListener("click",  (e: any)=>{
    keyEventLogger(e, false)
    avatar.playBasicAttack()
  });
  window.addEventListener("resize", (event) => {
    resize()
  });
  window.addEventListener('contextmenu', function(ev) {
    ev.preventDefault();
    let fireBall = loadAnimations('fireBall')
    avatar.playFireBall(cursor, fireBall)
    return false;
  }, false);
}
async function preload() {
  const assets = [ 
    { alias: 'avatarIdle', src: 'assets/avatar/idleAvatar.json' }, 
    { alias: 'avatarAnim', src: 'assets/avatar/avatarWalk.json' }, 
    { alias: 'basicAttack', src: 'assets/avatar/basicAttack.json' },   
    { alias: 'fireBall', src: 'assets/avatar/fireBall.json' },  
    { alias: 'avatarJump', src: 'assets/avatar/avatarJump.json' },   
    { alias: 'knightIdle', src: 'assets/enemy/knight/knightIdle.json' }, 
    { alias: 'rockGround', src: 'assets/backgrounds/rockGround.png' },    
    { alias: 'floor1', src: 'assets/backgrounds/floor1.png' },    
  ];
  await Assets.load(assets);


  knightIdle = loadAnimations('knightIdle') 
  animatedAvatar = loadAnimations('avatarAnim') 
  idleAvatar = loadAnimations('avatarIdle')
  avatarJump = loadAnimations('avatarJump')
  basicAttack = loadAnimations('basicAttack')
}
function loadAnimations(animationFormat: string): AnimatedSprite {
  let anim: any = Texture.from(animationFormat)
  let frames: Texture[] = [] 
  Object.keys(anim.data.frames).forEach(frame=>{
    const texture = Texture.from(frame);
    frames.push(texture)
  })
  return new AnimatedSprite(frames)
}
function resize(){
  gameScale = innerWidth / gameConfigStore.width
  app.renderer.resize(innerWidth, gameConfigStore.height * innerWidth / gameConfigStore.width)
  app.stage.scale.set(gameScale)
}
</script>

