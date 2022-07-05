<h1>Step Control</h1>
<div>
	<!-- Navigation links -->
    <a href="#/">
		<button class="favorite styled"
        		type="button">
    			Home
		</button>
	</a>
	<a href="#/Monitor">
		<button class="favorite styled"
        		type="button">
    			Monitor
		</button>
	</a>
	<a href="#/param">
		<button class="favorite styled"
        		type="button">
    			Step Param
		</button>
	</a>
    <a href="#/hello/svelte/good">
		<button class="favorite styled"
        		type="button">
    			Say Hi!!
		</button>
	</a>
    <a href="#/wild/card/card2/333">
		<button class="favorite styled"
        		type="button">
    			Wild
		</button>
	</a>
	<a href="#/movie/1">
		<button class="favorite styled"
        		type="button">
    			Movie
		</button>
	</a>
	<a href="#/about/2">
		<button class="favorite styled"
        		type="button">
    			About
		</button>
	</a>
	<!--
    <a href="#/does/not/exist">
		<button class="favorite styled"
        		type="button">
    			Not Found
		</button>
	</a>
	-->
</div>
<div>
	<!-- Show the router -->
	<Router {routes} />
</div>

<script>
// Import the router component
// Normally, this would be: `import Router from 'svelte-spa-router'`
import Router from 'svelte-spa-router'
// Import the list of routes
import routes from './routes'
</script>