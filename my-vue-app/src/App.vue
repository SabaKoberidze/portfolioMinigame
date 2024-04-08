<template>
  <div ref="pixiContainer"></div>
</template>

<script setup lang="ts">
import { AnimatedSprite, Application, Assets, Sprite, Texture} from 'pixi.js';
import {ref, onMounted } from 'vue';
import { Avatar } from './gameComponents/avatar';
import {Backgrounds} from './gameComponents/background'
import { gameConfig } from './stores/gameConfigStore'
let pixiContainer = ref()
let gameScale: number
let gameWidth: number 
let gameHeight: number
var keyState: any[] = [];
let app: Application
let avatar: Avatar
let backgrounds: Backgrounds
let animatedAvatar: AnimatedSprite
let idleAvatar: AnimatedSprite
let basicAttack: AnimatedSprite
let gameConfigStore = gameConfig()
gameWidth = gameConfigStore.width
gameHeight = gameConfigStore.height

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
    backgrounds = new Backgrounds(app)
    avatar = new Avatar(app, animatedAvatar, idleAvatar, basicAttack)
    addEvents()
    app.ticker.add(() => {
      avatar.movement(keyState)       
    }); 
    resize()     
})
function addEvents() {
  window.addEventListener("keydown", (e: any)=>{
    keyEventLogger(e, true)  
    avatar.movingStateChecker(e.keyCode, true) 
  });
  window.addEventListener("keyup",  (e: any)=>{
    keyEventLogger(e, false)
    avatar.movingStateChecker(e.keyCode, false)
  });
  window.addEventListener("resize", (event) => {
    resize()
  });

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
  gameScale = innerWidth / gameConfigStore.width
  app.renderer.resize(innerWidth, gameConfigStore.height * innerWidth / gameConfigStore.width)
  app.stage.scale.set(gameScale)
}
</script>

