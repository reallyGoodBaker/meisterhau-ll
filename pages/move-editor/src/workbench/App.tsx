import { Show, type Component } from 'solid-js'
import { Route, Router } from '@solidjs/router'
import Main from './main/main.tsx'
import Home from './home/home.tsx'
import Graph from '../graph/graph.tsx'
import { ContextMenuProvider } from './contextmenu/cmProvider.tsx'
import { useTab } from './main/pager.tsx'
import { bindUndoRedo } from './command/keyCommands.ts'

const [ tab ] = useTab()

bindUndoRedo()

const App: Component = () => {
    return (
        <ContextMenuProvider>
            <Router root={Main}>
                <Route path='/' component={Home} />
                <Show when={tab().path.startsWith('fsm/')}>
                    <Show when={tab().path} keyed>
                        <Route path='/fsm/:id' component={Graph} />
                    </Show>
                </Show>
            </Router>
        </ContextMenuProvider>
    )
}

export default App
