class LangFeature {
    consume(tokens) {
        while (tokens.length) {
            if (tokens[0] === 'let') {
                tokens = new LetFeature().consume(tokens)
                continue
            }

            tokens = new ExprFeature().consume(tokens)
        }
    }

    handler() {

    }
}

class LetFeature {
    consume(tokens) {
        
    }

    handler() {

    }
}

class ExprFeature {
    consume(tokens) {

    }

    handler() {

    }
}

module.exports = {
    let: new LetFeature(),

}