import { CustomComponent } from "../../core/component"
import { Fields, PublicComponent } from "../../core/config"

/** 状态组件 - 管理角色的战斗状态 */
@PublicComponent('status')
@Fields([
    'repulsible', 'stiffness', 'shocked', 'hegemony', 'isBlocking', 'isWaitingParry',
    'isWaitingDeflection', 'isDodging', 'noGore'
])
export class StatusComponent extends CustomComponent {
    /** 是否可被击退 */
    repulsible = true
    /** 玩家的硬直 */
    stiffness = 0
    /** 是否受到冲击 - 受到冲击的对象在碰到墙体时会造成短暂眩晕 */
    shocked = false
    /** 是否霸体状态 */
    hegemony = false
    /** 处于防御状态 */
    isBlocking = false
    /** 处于招架等待状态 */
    isWaitingParry = false
    /** 处于偏斜等待状态 */
    isWaitingDeflection = false
    /** 处于闪避状态 */
    isDodging = false
    /** 禁用血腥效果 */
    noGore = true
}
