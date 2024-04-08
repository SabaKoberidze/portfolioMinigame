import { AnimatedSprite, Application, Assets, Container, Sprite, Texture} from 'pixi.js';
import { gameConfig } from '../stores/gameConfigStore'
export class Avatar {
    private _app: Application
    private _gameConfigStore: any
    private _walkingAnimation: AnimatedSprite
    private _idleAnimation: AnimatedSprite
    private _basicAttack: AnimatedSprite
    private _avatarContainer: Container
    private _moveSpeed = 6
    private KEY_UP = 38;
    private KEY_DOWN = 40;
    private KEY_LEFT = 37;
    private KEY_RIGHT = 39;
    private SPACEBAR = 32;
    private keyState: any[] = [];
    constructor(app: Application ,walkingAnimation: AnimatedSprite, idleAnimation: AnimatedSprite,  basicAttack: AnimatedSprite){
        this._app = app
        this._walkingAnimation = walkingAnimation
        this._idleAnimation = idleAnimation
        this._basicAttack = basicAttack
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
        
        
        this._walkingAnimation.anchor.set(0.5,0.5)
        this._walkingAnimation.animationSpeed = this._moveSpeed/10 

        this._idleAnimation.anchor.set(0.5,0.5)
        this._idleAnimation.animationSpeed = 0.05        
        this._avatarContainer.addChild(this._idleAnimation)    
            
        this._basicAttack.anchor.set(0, 0.5)
        this._basicAttack.scale.set(1.05, 1)
        this._basicAttack.alpha = 0
        this._basicAttack.x = 0
        this._basicAttack.y = this._avatarContainer.scale.y * 15
        this._basicAttack.loop = false
        this._basicAttack.animationSpeed = 1.5 
        this._basicAttack.onComplete = () => { 
            this._basicAttack.alpha = 0
        }       

        this._idleAnimation.play()
    }

    public movingStateChecker(key: number, keyDown: boolean) {
        if(this.keyState[this.SPACEBAR]) {
            this._playBasicAttack()   
        }
        console.log(key)
        let moving = false
        this.keyState.forEach((state,index) => {
          if(state === true && (index=== this.KEY_LEFT || index === this.KEY_RIGHT || index === this.KEY_DOWN || index === this.KEY_UP)){
            moving = true
          }
        })
        if(moving){
            this._avatarContainer.removeChild(this._idleAnimation)
            this._avatarContainer.addChild( this._walkingAnimation);
            this._avatarContainer.addChildAt( this._basicAttack,1)
            this._walkingAnimation.play()
        }else{
            this._avatarContainer.removeChild( this._walkingAnimation);
            this._avatarContainer.addChild(this._idleAnimation);
            this._avatarContainer.addChildAt( this._basicAttack,1)
            this._idleAnimation.play()
        }
        if(keyDown){
          if(key === this.KEY_RIGHT){
            this._avatarContainer.scale.x = Math.abs(this._avatarContainer.scale.x)
          }else if(key === this.KEY_LEFT){
            this._avatarContainer.scale.x = -Math.abs(this._avatarContainer.scale.x)
          }
        } else{
          if(key === this.KEY_RIGHT && this.keyState[this.KEY_LEFT] === true){
            this._avatarContainer.scale.x = -Math.abs(this._avatarContainer.scale.x)
          }else if(key === this.KEY_LEFT && this.keyState[this.KEY_RIGHT] === true){
            this._avatarContainer.scale.x = Math.abs(this._avatarContainer.scale.x)
          }
        }
    }
    public movement(keyState: boolean[]) {
    this.keyState = keyState
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
    }
    private _playBasicAttack(){       
    this._basicAttack.alpha = 1
    !this._basicAttack.playing &&  this._basicAttack.gotoAndPlay(0)              
    }
      
}
