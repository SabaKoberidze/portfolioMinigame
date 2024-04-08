import { AnimatedSprite, Application, Assets, Container, Sprite, Texture} from 'pixi.js';
import { gameConfig } from '../stores/gameConfigStore'
export class Backgrounds {
    private _rockBackground
    private _app: Application
    private _gameConfigStore: any;
    constructor(app: Application){
       this._app = app
       this._gameConfigStore = gameConfig()
       this._createBackground()
    }
   
    private _createBackground() {
        this._rockBackground = Sprite.from('floor1')
        this._rockBackground.setSize(this._gameConfigStore.width, this._gameConfigStore.width)    
        this._rockBackground.anchor.set(0,0)
        this._app.stage.addChild(this._rockBackground);    
    }     
}
