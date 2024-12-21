import type { Component } from 'solid-js'
import { Route, Router } from '@solidjs/router'
import Main from './main/main'
import Home from './home/home'
import Graph from '../graph/graph.tsx'

const App: Component = () => {
    return (
        <Router root={Main}>
            <Route path='/' component={Home} />
            <Route path=':id' component={Graph} />
        </Router>
    )
}

export default App
