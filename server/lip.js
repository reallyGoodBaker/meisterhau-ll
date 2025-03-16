const shell = require('shelljs')
const os = require('os')

class Lip {

    #exec(command, silent=false) {
        const { stderr, stdout } = shell.exec(command, { cwd: this.cwd, silent })
        if (stderr) {
            throw stderr
        }

        return stdout
    }

    constructor(cwd) {
        this.cwd = cwd
        if (!shell.which('lip')) {
            switch (os.platform()) {
                case 'win32':
                    this.#exec('winget install futrime.lip')
                    break
                case 'linux':
                    this.#exec('curl -fsSL https://raw.githubusercontent.com/futrime/lip/HEAD/scripts/install_linux.sh | sh')
                    break
                case 'darwin':
                    this.#exec('curl -fsSL https://raw.githubusercontent.com/futrime/lip/HEAD/scripts/install_macos.sh | sh')
                    break 
            }
        }
    }

    list() {
        return this.#exec('lip list', true)
    }

    /**
     * @param {string} package
     * @param {boolean} [silent]
     */
    install(pkg, silent=false) {
        this.#exec(`lip install -y ${pkg}`, silent)
    }

    /**
     * @param {string} pkg
     * @param {boolean} [silent]
     */
    upgrade(pkg, silent=false) {
        this.#exec(`lip install -U -y ${pkg}`, silent)
    }

    /**
     * @param {string} pkg
     */
    installOrUpdate(pkg) {
        process.stdout.write(`Installing ${pkg}... \r`)
        try {
            this.install(pkg, true)
        } catch (error) {
            try {
                this.upgrade(pkg, true)
            } catch (error) {
                process.stdout.write(`Failed to install or update ${pkg}. \n`)
                return
            }
        }
        process.stdout.write(`Installed ${pkg}. \n`)
    }
}

module.exports = {
    Lip
}