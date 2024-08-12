const { action, alert, widget } = require('./ui/index')

function register() {
    mc.listen('onUseItem', (player, item) => {
        if (item.type.includes('clock')) {
            showUi(player)
        }
    })
}

function showUi(player) {
    const ui1 = action('test', '你好', [
        {
            text: '是',
            onClick() {
                openUi2(this, player)
                player.tell('你好')
            }
        },
        {
            text: '否',
            onClick() {
                player.tell('你好2')
            }
        }
    ]).send(player)
}

function openUi2(ui, player) {
    const ui2 = ui.openAction('test2', '你不好', [
        {
            text: '是',
            onClick() {
                player.tell('你不好')
            }
        },
        {
            text: '否',
            onClick() {
                player.tell('你不好2')
            }
        }
    ]).send(player)
}

register()