<template>
  <div ref="pixiContainer"></div>
</template>

<script setup lang="ts">
import { AnimatedSprite, Application, Assets, Sprite, Spritesheet, Texture} from 'pixi.js';
import {ref, onMounted } from 'vue';
let pixiContainer = ref()


var keyState = [];
const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const MOVE_SPEED = 3;
let animatedAvatar: AnimatedSprite
let isMoving = false
let direction = true
// create a logging function
const keyEventLogger =  function (e: any, type: boolean) { 
  (keyState[e.keyCode] as any) = e.type == 'keydown';
  isMoving = type
}
window.addEventListener("keydown", (e: any)=>{
  keyEventLogger(e, true)  
  movingStateChecker(e.keyCode, true)
});
window.addEventListener("keyup",  (e: any)=>{
  keyEventLogger(e, false)
  movingStateChecker(e.keyCode, false)
});


// define something to move
var player = {y : 100, x: 100};


// in the main loop;

onMounted(async () => {
    const app = new Application();
    await app.init({ width: innerWidth, height: innerWidth, background:'white'});
    // Append the PixiJS canvas to the component's container
    pixiContainer.value.appendChild(app.canvas);
    await preload()
     
    animatedAvatar.anchor.set(0.5,0.5)
    animatedAvatar.animationSpeed = MOVE_SPEED/6
    animatedAvatar.scale.set(3)
    animatedAvatar.play()
    animatedAvatar.stop()
    app.stage.addChild(animatedAvatar);


    //// Animate the sprite
    app.ticker.add(() => {
      //bunny.rotation += 0.01;
      movement(animatedAvatar)      
    });
    //// define keys and an array to keep key states



    //app.start();
})
function movingStateChecker(key: number, keyDown: boolean) {
  let moving = false
  keyState.forEach(state => {
    if(state === true){
      moving = true
    }
  })
  if(moving){
    animatedAvatar.play()
  }else{
    animatedAvatar.stop()
  }
  if(keyDown){
    if(key === KEY_RIGHT){
    animatedAvatar.scale.x = Math.abs(animatedAvatar.scale.x)
    }else if(key === KEY_LEFT){
      animatedAvatar.scale.x = -Math.abs(animatedAvatar.scale.x)
    }
  }  
}
function movement(bunny) {
        isMoving = true
        if (keyState[KEY_UP]) {
          bunny.y -= MOVE_SPEED;
        } 
        if (keyState[KEY_DOWN]) {
          bunny.y += MOVE_SPEED;
        }
        if (keyState[KEY_LEFT]) {
          bunny.x -= MOVE_SPEED;          
        }
        if (keyState[KEY_RIGHT]) {
          bunny.x += MOVE_SPEED;
        }
}
async function preload()
{
  const assets = [
    { alias: 'bunny', src: 'assets/bunny.png' },  
    { alias: 'avatar', src: 'assets/avatar/avatar.png' },    
    { alias: 'avatarAnim', src: 'assets/avatar/avatar.json' },  
  ];
  await Assets.load(assets);

  animatedAvatar = loadAnimations(Texture.from('avatarAnim')) 
}
function loadAnimations(anim: any): AnimatedSprite {
  let frames: Texture[] = [] 
  Object.keys(anim.data.frames).forEach(frame=>{
    const texture = Texture.from(frame);
    frames.push(texture)
  })
  return new AnimatedSprite(frames)
}

</script>

