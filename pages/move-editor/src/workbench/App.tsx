import type { Component } from 'solid-js'
import { Route, Router } from '@solidjs/router'
import Main from './main/main.tsx'
import Home from './home/home.tsx'
import Graph from '../graph/graph.tsx'
import { ContextMenuProvider } from './contextmenu/cmProvider.tsx'

const App: Component = () => {
    return (
        <ContextMenuProvider>
            <Router root={Main}>
                <Route path='/' component={Home} />
                <Route path=':id' component={Graph} />
            </Router>
        </ContextMenuProvider>
    )
}

export default App
