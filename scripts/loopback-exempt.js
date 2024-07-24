const cp = require('child_process')
const McName = 'microsoft.minecraftuwp_8wekyb3d8bbwe'

function exempt() {
    cp.execSync(`CheckNetIsolation LoopbackExempt -a -n="${McName}"`)
}

function check() {
    return new Promise(resolve => {
        const child = cp.exec('CheckNetIsolation LoopbackExempt -s')
        
        child.stdout.on('data', data => {
            data = data.toString()
            if (data.includes(McName)) {
                resolve(true)
            }
        })

        child.on('exit', () => resolve(false))
    })
}

async function doExempt() {
    if (await check()) {
        console.log('Has been exempted before.')
        return
    }

    exempt()
    console.log('Already exempted.')
}

doExempt()