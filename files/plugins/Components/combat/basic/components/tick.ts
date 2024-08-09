import { CustomComponent } from "../core/component"

export class Tick extends CustomComponent {
    static totalTick = 0
    
    get dt() {
        return Tick.totalTick
    }
}