<template>
  <div ref="pixiContainer"></div>
</template>

<script setup lang="ts">
import { AnimatedSprite, Application, Assets, Container, Sprite, Texture} from 'pixi.js';
import {ref, onMounted } from 'vue';
let pixiContainer = ref()
let gameScale: number
let gameWidth: number = 1920
let gameHeight: number = 1080

var keyState: any[] = [];
const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const SPACEBAR = 32;
const MOVE_SPEED = 5;
let app: Application
let animatedAvatar: AnimatedSprite
let idleAvatar: AnimatedSprite
let basicAttack: AnimatedSprite
let rockBackground: Sprite
let avatarContainer: Container

const keyEventLogger =  function (e: any, type: boolean) { 
  (keyState[e.keyCode] as any) = e.type == 'keydown';  
}
window.addEventListener("keydown", (e: any)=>{
  keyEventLogger(e, true)  
  movingStateChecker(e.keyCode, true)
  if(keyState[SPACEBAR]) {
    basicAttack.alpha = 1
    !basicAttack.playing && basicAttack.gotoAndPlay(0)    
  }
});
window.addEventListener("keyup",  (e: any)=>{
  keyEventLogger(e, false)
  movingStateChecker(e.keyCode, false)
});


onMounted(async () => {
    app = new Application();
    await app.init({
      width: gameWidth, 
      height: gameHeight, 
      background:'white',
      resolution: devicePixelRatio,
      autoDensity: true,
      });
    // Append the PixiJS canvas to the component's container
    pixiContainer.value.appendChild(app.canvas);
    await preload()

    resize() 
    
    rockBackground = Sprite.from('floor1')
    rockBackground.setSize(gameWidth, gameWidth)    
    rockBackground.anchor.set(0,0)
    app.stage.addChild(rockBackground);
    
    avatarContainer = new Container()

    app.stage.addChild(avatarContainer)
    avatarContainer.scale.set(1)
    avatarContainer.x = gameWidth/2 -  (avatarContainer.width)/ 2
    avatarContainer.y = gameHeight/2 -  (avatarContainer.height) / 2
    avatarContainer.sortableChildren = true

    animatedAvatar.anchor.set(0.5,0.5)
    animatedAvatar.animationSpeed = MOVE_SPEED/10
    idleAvatar.anchor.set(0.5,0.5)
    idleAvatar.animationSpeed = 0.05
    
    avatarContainer.addChild(idleAvatar)
    
    basicAttack.anchor.set(0, 0.5)
    basicAttack.scale.set(1, 1)
    basicAttack.alpha = 0
    basicAttack.x = 0
    basicAttack.y = avatarContainer.scale.y * 10
    basicAttack.loop = false
    basicAttack.animationSpeed = 1.5

    basicAttack.onComplete = () => { 
      basicAttack.alpha = 0
    }
    
    idleAvatar.play()

    // Animate the sprite
    app.ticker.add(() => {
      //bunny.rotation += 0.01;
      movement(avatarContainer)           
    });
    // define keys and an array to keep key states



    window.addEventListener("resize", (event) => {
      resize()
    });
})

function movingStateChecker(key: number, keyDown: boolean) {
  let moving = false
  keyState.forEach((state,index) => {
    if(state === true && (index=== KEY_LEFT || index === KEY_RIGHT || index === KEY_DOWN || index === KEY_UP)){
      moving = true
    }
  })
  if(moving){
    avatarContainer.removeChild(idleAvatar)
    avatarContainer.addChild(animatedAvatar);
    avatarContainer.addChildAt(basicAttack,1)
    animatedAvatar.play()
  }else{
    avatarContainer.removeChild(animatedAvatar);
    avatarContainer.addChild(idleAvatar);
    avatarContainer.addChildAt(basicAttack,1)
    idleAvatar.play()
  }
  if(keyDown){
    if(key === KEY_RIGHT){
      avatarContainer.scale.x = Math.abs(avatarContainer.scale.x)
    }else if(key === KEY_LEFT){
      avatarContainer.scale.x = -Math.abs(avatarContainer.scale.x)
    }
  } else{
    if(key === KEY_RIGHT && keyState[KEY_LEFT] === true){
      avatarContainer.scale.x = -Math.abs(avatarContainer.scale.x)
    }else if(key === KEY_LEFT && keyState[KEY_RIGHT] === true){
      avatarContainer.scale.x = Math.abs(avatarContainer.scale.x)
    }
  }
}
function movement(bunny: Container) {
  if (keyState[KEY_UP]) {
       (rockBackground.y < bunny.y - bunny.height/2) && (bunny.y -= MOVE_SPEED);
      } 
      if (keyState[KEY_DOWN]) {
        (rockBackground.height + rockBackground.y >= bunny.y + bunny.height / 2) && (bunny.y += MOVE_SPEED);
      }
      if (keyState[KEY_LEFT]) {
        (rockBackground.x <= bunny.x - bunny.width / 3) && (bunny.x -= MOVE_SPEED);          
      }
      if (keyState[KEY_RIGHT]) {
        (rockBackground.width + rockBackground.x >= bunny.x + bunny.width / 3) && (bunny.x += MOVE_SPEED);
      }
}
async function preload() {
  const assets = [ 
    { alias: 'avatarIdle', src: 'assets/avatar/idleAvatar.json' }, 
    { alias: 'avatarAnim', src: 'assets/avatar/avatarWalk.json' }, 
    { alias: 'basicAttack', src: 'assets/avatar/basicAttack.json' },   
    { alias: 'rockGround', src: 'assets/backgrounds/rockGround.png' },    
    { alias: 'floor1', src: 'assets/backgrounds/floor1.png' },    
  ];
  await Assets.load(assets);

  animatedAvatar = loadAnimations('avatarAnim') 
  idleAvatar = loadAnimations('avatarIdle')
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
  gameScale = innerWidth / 1920
  app.renderer.resize(innerWidth, innerHeight * gameScale)
  app.stage.scale.set(gameScale)
}
</script>

