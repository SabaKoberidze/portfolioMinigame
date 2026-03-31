import { AnimatedSprite, Application, Container } from 'pixi.js';
import { gameConfig } from '../stores/gameConfigStore'
import * as Enums from '../enums'

export class Enemy {
    private _app: Application
    private _gameConfigStore: any
    private _idleKnight: AnimatedSprite
    private _enemyContainer: Container
    private _hp: number = 3
    private _knockbackVelocity: {x: number, y: number} = {x: 0, y: 0}
    private _moveSpeed: number = 2.5
    private _hitFlashTimer: number = 0
    private _contactCooldown: number = 0

    constructor(app: Application, walkingKnight: AnimatedSprite) {
        this._app = app
        this._idleKnight = walkingKnight
        this._gameConfigStore = gameConfig()
    }

    public createEnemy(enemyType: Enums.EnemyType, spawnX?: number, spawnY?: number) {
        this._enemyContainer = new Container()
        this._app.stage.addChild(this._enemyContainer)
        this._enemyContainer.scale.set(0.8)
        this._enemyContainer.x = spawnX ?? this._gameConfigStore.width / 2
        this._enemyContainer.y = spawnY ?? this._gameConfigStore.height / 2
        this._enemyContainer.sortableChildren = true
        this._idleKnight.anchor.set(0.5, 0.5)
        this._idleKnight.animationSpeed = 1
        this._enemyContainer.addChild(this._idleKnight)
        this._enemyContainer.zIndex = this._enemyContainer.y + (this._enemyContainer.height / 2)
        this._idleKnight.play()
    }

    public takeDamage(amount: number, playerX: number) {
        this._hp -= amount
        this._idleKnight.tint = 0xFF4444
        this._hitFlashTimer = 14
        const dir = this._enemyContainer.x > playerX ? 1 : -1
        this._knockbackVelocity.x = dir * 20
        this._knockbackVelocity.y = -7
    }

    // Returns true when the player should take contact damage this frame
    public update(delta: any, playerPos: {x: number, y: number}): boolean {
        if (!this._enemyContainer || this._hp <= 0) return false

        // Hit flash countdown
        if (this._hitFlashTimer > 0) {
            this._hitFlashTimer--
            if (this._hitFlashTimer <= 0) {
                this._idleKnight.tint = 0xFFFFFF
            }
        }

        // Apply knockback with friction
        this._enemyContainer.x += this._knockbackVelocity.x
        this._enemyContainer.y += this._knockbackVelocity.y
        this._knockbackVelocity.x *= 0.82
        this._knockbackVelocity.y *= 0.82
        if (Math.abs(this._knockbackVelocity.x) < 0.5) this._knockbackVelocity.x = 0
        if (Math.abs(this._knockbackVelocity.y) < 0.5) this._knockbackVelocity.y = 0

        // Chase player (suppressed during knockback)
        if (Math.abs(this._knockbackVelocity.x) < 3) {
            const dx = playerPos.x - this._enemyContainer.x
            const dy = playerPos.y - this._enemyContainer.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist > 40) {
                this._enemyContainer.x += (dx / dist) * this._moveSpeed
                this._enemyContainer.y += (dy / dist) * this._moveSpeed
                // Flip to face player
                this._enemyContainer.scale.x = dx > 0 ? 0.8 : -0.8
            }
        }

        // Clamp to screen bounds
        const hw = Math.abs(this._enemyContainer.width / 2)
        const hh = this._enemyContainer.height / 2
        this._enemyContainer.x = Math.max(hw, Math.min(this._gameConfigStore.width - hw, this._enemyContainer.x))
        this._enemyContainer.y = Math.max(hh, Math.min(this._gameConfigStore.height - hh, this._enemyContainer.y))

        // Update zIndex
        this._enemyContainer.zIndex = this._enemyContainer.y + (this._enemyContainer.height / 2)

        // Contact damage (60-frame cooldown between hits)
        if (this._contactCooldown > 0) {
            this._contactCooldown--
        }
        const cdx = this._enemyContainer.x - playerPos.x
        const cdy = this._enemyContainer.y - playerPos.y
        if (Math.sqrt(cdx * cdx + cdy * cdy) < 60 && this._contactCooldown === 0) {
            this._contactCooldown = 60
            return true
        }
        return false
    }

    public getHp() { return this._hp }

    public destroy() {
        if(this._enemyContainer) {
            this._app.stage.removeChild(this._enemyContainer)
            this._enemyContainer.destroy()
        }
    }

    public getPosition() {
        return { x: this._enemyContainer.x, y: this._enemyContainer.y }
    }

    public getHitBox() {
        return {
            x: this._enemyContainer.x,
            y: this._enemyContainer.y + (this._enemyContainer.height / 2),
            width: this._enemyContainer.width,
            direction: false,
        }
    }
}
