import { Alert } from "@ui/form/alert"
import { Export } from "@ui/form/decorator"
import { Widget } from "@ui/form/index"
import { cmd } from "@utils/command"

@Export('main')
class MyWidget extends Widget<Alert.State> {

    static depth = 1

    render() {
        return [
            Alert.View('test', `stack ${ MyWidget.depth }`),
            Alert.Apply('new stack', pl => {
                MyWidget.depth ++
                pl.tell('yes')
                Alert.start(MyWidget, pl)
            }),
            Alert.Cancel('back', pl => {
                MyWidget.depth --
                pl.tell('no')
                this.back(pl)
            }),
        ]
    }
}

// mc.listen('onJump', pl => {
//     Alert.start(MyWidget, pl)
// })
cmd('testui', '测试ui').setup(register => {
    register('test1', (cmd, ori, out, res) => {
        Alert.start(MyWidget, ori.player!)
    })
})