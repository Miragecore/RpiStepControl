// Components
import Home from './routes/Home.svelte'
import Name from './routes/Name.svelte'
import Wild from './routes/Wild.svelte'
import About from './routes/About.svelte'
import Movie from './routes/Movie.svelte'
import StepParam from './routes/StepParam.svelte'
import Monitor from './routes/Monitor.svelte'

import NotFound from './routes/NotFound.svelte'
import { params } from 'svelte-spa-router'


// Export the route definition object
export default {
    // Exact path
    '/': Home,
    '/Monitor': Monitor,

    // Using named parameters, with last being optional
    '/hello/:first/:last?': Name,

    // Wildcard parameter
    // Included twice to match both `/wild` (and nothing after) and `/wild/*` (with anything after)
    '/wild': Wild,
    '/wild/*': Wild,

    '/movie/:id' : Movie,

    '/about/:id' : About,

    '/param' : StepParam,

    // Catch-all, must be last
    '*': NotFound,
}
