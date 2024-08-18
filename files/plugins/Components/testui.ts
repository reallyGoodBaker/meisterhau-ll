import { Alert } from "@ui/form/alert"
import { Export } from "@ui/form/decorator"
import { Widget } from "@ui/form/index"

@Export('main')
class MyWidget extends Widget<Alert.State> {
    render() {
        return [
            Alert.View('test', 'content'),
            Alert.ApplyButton('是', pl => {
                pl.tell('yes')
                Alert.start(MyWidget, pl)
            }),
            Alert.CancelButton('否', pl => {
                pl.tell('no')
                this.back(pl)
            }),
        ]
    }
}

mc.listen('onJump', pl => {
    Alert.start(MyWidget, pl)
})