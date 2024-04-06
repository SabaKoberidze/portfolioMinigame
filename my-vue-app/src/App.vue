<template>
  <div ref="pixiContainer"></div>
</template>

<script setup lang="ts">
import { AnimatedSprite, Application, Assets, Container, Sprite, Spritesheet, Texture} from 'pixi.js';
import {ref, onMounted } from 'vue';
let pixiContainer = ref()


var keyState: any[] = [];
const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const MOVE_SPEED = 5;
let animatedAvatar: AnimatedSprite
let idleAvatar: AnimatedSprite
let rockBackground: Sprite
let avatarContainer: Container
// create a logging function
const keyEventLogger =  function (e: any, type: boolean) { 
  (keyState[e.keyCode] as any) = e.type == 'keydown';
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
    await app.init({ width: 1000, height: 1000, background:'white'});
    // Append the PixiJS canvas to the component's container
    pixiContainer.value.appendChild(app.canvas);
    await preload()


    rockBackground = Sprite.from('rockGround')
    rockBackground.anchor.set(0,0)
    rockBackground.setSize(1000, 1000)    
    app.stage.addChild(rockBackground);
     
    avatarContainer = new Container()
    app.stage.addChild(avatarContainer)
    avatarContainer.x = app.canvas.width / 2 - animatedAvatar.width / 2
    avatarContainer.y = app.canvas.height / 2 - animatedAvatar.height / 2

    animatedAvatar.anchor.set(0.5,0.5)
    animatedAvatar.animationSpeed = MOVE_SPEED/10
    idleAvatar.anchor.set(0.5,0.5)
    idleAvatar.animationSpeed = 0.05
    
    avatarContainer.addChild(idleAvatar)
    avatarContainer.scale.set(3)

    //app.stage.addChild(animatedAvatar);


    //// Animate the sprite
    app.ticker.add(() => {
      //bunny.rotation += 0.01;
      movement(avatarContainer)      
    });
    //// define keys and an array to keep key states



    //app.start();
})
function movingStateChecker(key: number, keyDown: boolean) {
  let moving = false
  keyState.forEach((state,index) => {
    if(state === true && (index=== KEY_LEFT || index === KEY_RIGHT || index === KEY_DOWN || index === KEY_UP)){
      moving = true
    }
  })
  if(moving){
    avatarContainer.removeChild(avatarContainer.children[0]);
    avatarContainer.addChild(animatedAvatar);
    animatedAvatar.play()
  }else{
    avatarContainer.removeChild(avatarContainer.children[0]);
    avatarContainer.addChild(idleAvatar);
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
async function preload()
{
  const assets = [
    { alias: 'bunny', src: 'assets/bunny.png' },  
    { alias: 'avatar', src: 'assets/avatar/avatar.png' },    
    { alias: 'avatarIdle', src: 'assets/avatar/avatarIdle.json' }, 
    { alias: 'avatarAnim', src: 'assets/avatar/avatar.json' },  
    { alias: 'rockGround', src: 'assets/backgrounds/rockGround.png' },    
  ];
  await Assets.load(assets);

  animatedAvatar = loadAnimations('avatarAnim') 
  idleAvatar = loadAnimations('avatarIdle')
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

</script>

