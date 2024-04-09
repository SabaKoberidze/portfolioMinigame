import { AnimatedSprite, Application, Assets, Container, Sprite, Texture} from 'pixi.js';
import { gameConfig } from '../stores/gameConfigStore'
import * as Enums from '../enums'
export class Enemy {
    private _app: Application
    private _gameConfigStore: any
    private _idleKnight: AnimatedSprite
    private _enemyContainer: Container
    private _direction: boolean
    constructor(app: Application , walkingKnight: AnimatedSprite){
        this._app = app
        this._idleKnight = walkingKnight
        this._gameConfigStore = gameConfig()
    }
    public createEnemy(enemyType: Enums.EnemyType){
        this._enemyContainer = new Container()
        this._app.stage.addChild(this._enemyContainer)
        this._enemyContainer.scale.set(1.5)
        this._enemyContainer.x = this._gameConfigStore.width/2 -  (this._enemyContainer.width)/ 2
        this._enemyContainer.y = this._gameConfigStore.height/2 -  (this._enemyContainer.height) / 2
        this._enemyContainer.sortableChildren = true    
        this._idleKnight.anchor.set(0.5,0.5)
        this._idleKnight.animationSpeed = 1
        this._enemyContainer.addChild(this._idleKnight)        
        this._enemyContainer.zIndex = this._enemyContainer.y + (this._enemyContainer.height / 2)
    }
    public getHitBox(){
        return {
          x: this._enemyContainer.x,
          y: this._enemyContainer.y + (this._enemyContainer.height / 2),
          width: this._enemyContainer.scale.x,
          direction: this._direction,
         //hitWidth: this._basicAttack.width * this._avatarContainer.scale.x        
        }
    }  
}