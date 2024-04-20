import { AnimatedSprite, Application, Assets, Container, Sprite, Texture} from 'pixi.js';
import { gameConfig } from '../stores/gameConfigStore'
import * as Enums from '../enums'
export class Projectile {
    private _projectile: AnimatedSprite
    private _projectileSpeed: number
    private _app: Application
    private _type: Enums.ProjectileType
    private _destination: {x: number, y: number} = {x: 0, y:0};
    private _startPosition:  {x: number, y: number} = {x: 0, y:0};
    constructor(app: Application, projectile: AnimatedSprite, speed: number, type: Enums.ProjectileType){
        this._app = app
        this._projectile = projectile
        this._type = type
        this._projectileSpeed = speed
        this._createProjectile()
    }
    private _createProjectile(){
        this._projectile.anchor.set(0.5, 0.5)
        this._projectile.scale.set(1.5)
        this._projectile.x = 0
        this._projectile.y = 0
        this._projectile.animationSpeed = 0.5
        this._projectile.zIndex = 1  
    }
    public setDestination(cursor, avatarPosition: {x: number, y:number}){
        this._app.stage.addChildAt(this._projectile, 1)  
        this._projectile.x = avatarPosition.x
        this._projectile.y = avatarPosition.y  
        this._startPosition.x = avatarPosition.x 
        this._startPosition.y = avatarPosition.y
        this._destination.x = cursor.x
        this._destination.y = cursor.y
        console.log(this._destination)
        this._projectile.gotoAndPlay(0)    
    }
    public moveProjectile(delta: any){
        let dx = (this._destination.x - this._startPosition.x);
        let dy = ( this._destination.y - this._startPosition.y);
        let distance =  Math.sqrt(dx * dx + dy * dy);
        let xSpeed = dx / distance;
        let ySpeed = dy / distance;  
        this._projectile.x += this._projectileSpeed * xSpeed * delta.deltaTime;
        this._projectile.y += this._projectileSpeed * ySpeed * delta.deltaTime;
    }
    public setZindex(z) {
        this._projectile.zIndex = z
    }
    public playing(){        
        return this._projectile.playing
    }
}
