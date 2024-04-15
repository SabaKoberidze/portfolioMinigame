import { AnimatedSprite, Application, Assets, Container, Sprite, Texture} from 'pixi.js';
import { gameConfig } from '../stores/gameConfigStore'
export class Avatar {
    private _app: Application
    private _gameConfigStore: any
    private _walkingAnimation: AnimatedSprite
    private _idleAnimation: AnimatedSprite
    private _basicAttack: AnimatedSprite
    private _avatarJump: AnimatedSprite
    private _fireball: AnimatedSprite
    private _avatarContainer: Container
    private _direction: boolean
    private _isJumping: boolean
    private _moving: boolean
    private _moveSpeed = 6
    private _fireBallSpeed = 15
    private KEY_UP = 87;
    private KEY_DOWN = 83;
    private KEY_LEFT = 65;
    private KEY_RIGHT = 68;
    private SPACEBAR = 32;
    private keyState: any[] = [];
    private _onBasicAttack: () => void;
    private _destination: {x: number, y: number} = {x: 0, y:0};
    private _startPosition:  {x: number, y: number} = {x: 0, y:0};
    constructor(app: Application ,walkingAnimation: AnimatedSprite, idleAnimation: AnimatedSprite,  basicAttack: AnimatedSprite, avatarJump:AnimatedSprite, avatarFireBall: AnimatedSprite){
        this._app = app
        this._walkingAnimation = walkingAnimation
        this._idleAnimation = idleAnimation
        this._basicAttack = basicAttack
        this._avatarJump = avatarJump
        this._fireball = avatarFireBall
        this._gameConfigStore = gameConfig()
        this._createAvatar()
    }
    private _createAvatar(){
      this._avatarContainer = new Container()
      this._app.stage.addChild(this._avatarContainer)
      this._avatarContainer.scale.set(1)
      // this._avatarContainer.x = this._gameConfigStore.width/2 -  (this._avatarContainer.width)/ 2
      // this._avatarContainer.y = this._gameConfigStore.height/2 -  (this._avatarContainer.height) / 2
      this._avatarContainer.sortableChildren = true 
      this._avatarContainer.zIndex = 1
      
      
      this._walkingAnimation.anchor.set(0.5,0.5)
      this._walkingAnimation.animationSpeed = Math.abs(this._moveSpeed/10) 

      this._idleAnimation.anchor.set(0.5,0.5)
      this._idleAnimation.animationSpeed = 0.05        

      this._avatarJump.anchor.set(0.5,0.5)
      this._avatarJump.animationSpeed = 0.5
      this._avatarJump.loop = false  
      this._avatarJump.onComplete = () => {
        this._isJumping = false
        this._avatarJump.alpha = 0
        this._moveSpeed = 6
        this._animationManager()
      }  

      this._avatarContainer.addChild(this._idleAnimation)    
          
      this._basicAttack.anchor.set(0, 0.5)
      this._basicAttack.scale.set(1, 1)
      this._basicAttack.alpha = 0
      this._basicAttack.x = 0
      this._basicAttack.y = 0
      this._basicAttack.loop = false
      this._basicAttack.animationSpeed = 1.5 
      this._basicAttack.zIndex = 2
      this._basicAttack.onComplete = () => { 
          this._basicAttack.alpha = 0
      }       
      this._fireball.anchor.set(0.5, 0.5)
      this._fireball.scale.set(1.5)
      this._fireball.alpha = 0
      this._fireball.x = 0
      this._fireball.y = 0
      this._fireball.animationSpeed = 0.5
      this._fireball.zIndex = 1
      this._fireball.onComplete = () => { 
        this._basicAttack.alpha = 0
      }
      this._app.stage.addChildAt(this._fireball, 1)  
      this._idleAnimation.play()
    }

    public movingStateChecker(key: number, keyDown: boolean) {
        if(key === this.SPACEBAR && keyDown) {
            this._playAvatarJump()   
        }                   
        this._moving = false
        this.keyState.forEach((state,index) => {
          if(state === true && (index=== this.KEY_LEFT || index === this.KEY_RIGHT || index === this.KEY_DOWN || index === this.KEY_UP)){
            this._moving  = true
          }
        })


       this._animationManager()              
    }
    public movement(keyState: boolean[], cursor: {x: number, y:number}, delta) {
      (cursor.x > this._avatarContainer.x ?  this._direction = true : this._direction = false)
      if(!this._direction){
        this._avatarContainer.scale.x = -Math.abs(this._avatarContainer.scale.x)
        this._walkingAnimation.animationSpeed =  -this._moveSpeed/10
      }else{
        this._avatarContainer.scale.x = Math.abs(this._avatarContainer.scale.x)
        this._walkingAnimation.animationSpeed =  this._moveSpeed/10
      }
      this.keyState = keyState
      this._avatarContainer.zIndex = this._avatarContainer.y + (this._avatarContainer.height / 2)
      this._fireball.zIndex = this._avatarContainer.y + this._avatarContainer.height / 2 + 1
      if (this.keyState[this.KEY_UP]) {
          (this._avatarContainer.y -= this._moveSpeed);
      } 
      if (this.keyState[this.KEY_DOWN]) {
          (this._avatarContainer.y += this._moveSpeed);
      }
      if (this.keyState[this.KEY_LEFT]) {
          (this._avatarContainer.x -= this._moveSpeed);          
      }
      if (this.keyState[this.KEY_RIGHT]) {
          (this._avatarContainer.x += this._moveSpeed);
      }

      if(this._fireball.playing){
        let dx = (this._destination.x - this._startPosition.x);
        let dy = ( this._destination.y - this._startPosition.y);
        let distance =  Math.sqrt(dx * dx + dy * dy);
        let xSpeed = dx / distance;
        let ySpeed = dy / distance;  
        this._fireball.x += this._fireBallSpeed * xSpeed * delta.deltaTime;
        this._fireball.y += this._fireBallSpeed * ySpeed * delta.deltaTime;
      }
    }
    public playBasicAttack(){         
      if(!this._basicAttack.playing){
        this._basicAttack.alpha = 1
        this._basicAttack.gotoAndPlay(0)     
        this._onBasicAttack()      
      }            
    }
    public playFireBall(cursor){
      console.log(cursor)
      if(!this._fireball.playing){
        this._fireball.alpha = 1
        this._fireball.x = this._avatarContainer.x
        this._fireball.y = this._avatarContainer.y  
        this._startPosition.x = this._avatarContainer.x 
        this._startPosition.y = this._avatarContainer.y
        this._destination.x = cursor.x
        this._destination.y = cursor.y
        this._fireball.gotoAndPlay(0)    
      } 
    }
    private _playAvatarJump(){     
      if(!this._avatarJump.playing)  {
        this._isJumping = true
        this._avatarJump.alpha = 1
        this._avatarJump.gotoAndPlay(0)     
        this._moveSpeed = 20
      }
    
      //this._onBasicAttack()        
    }
    private _animationManager(){
      if(this._isJumping){
        this._avatarContainer.removeChild(this._idleAnimation)
        this._avatarContainer.removeChild( this._walkingAnimation)
        this._avatarContainer.addChild(this._avatarJump);
      }else if(this._moving){
          this._avatarContainer.removeChild(this._idleAnimation)
          this._avatarContainer.addChild( this._walkingAnimation);
          this._walkingAnimation.play()
      }else{
          this._avatarContainer.removeChild( this._walkingAnimation);
          this._avatarContainer.addChild(this._idleAnimation);
          this._idleAnimation.play()
      }
      this._avatarContainer.addChildAt(this._basicAttack, 1)        
    }
    public getHitBox(){
      return {
        x: this._avatarContainer.x,
        y: this._avatarContainer.y + (this._avatarContainer.height / 2),
        direction: this._direction,
        width: this._avatarContainer.width,
        hitWidth: this._basicAttack.width        
      }
    }
    public onBasicAttack(callback: () => void){
      this._onBasicAttack = callback
    } 
}
