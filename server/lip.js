const shell = require('shelljs')
const os = require('os')

class Lip {
    constructor() {
        if (!shell.which('lip')) {
            switch (os.platform()) {
                case 'win32':
                    shell.exec('winget install futrime.lip')
                    break
                case 'linux':
                    shell.exec('curl -fsSL https://raw.githubusercontent.com/futrime/lip/HEAD/scripts/install_linux.sh | sh')
                    break
                case 'darwin':
                    shell.exec('curl -fsSL https://raw.githubusercontent.com/futrime/lip/HEAD/scripts/install_macos.sh | sh')
                    break 
            }
        }
    }

    list() {
        return shell.exec('lip list', { silent: true }).stdout
    }

    /**
     * @param {string[]} packages 
     */
    install(...packages) {
        shell.exec(`lip install ${packages.join(' ')}`)
    }

    
}

module.exports = {
    Lip
}