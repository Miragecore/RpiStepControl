

<script>
	import Navi from './Navigator.svelte';
	//export let name;

	let CurrentConfig = {
		controlType : 'rotary',
		gearA1 : 3.3,
		gearB : 4.4,
		PR : 100.1
	};

	let number;
    let inputNumber;

    const request = async (endpoint) => {
    const resp = await fetch(`http://localhost:8000/api${endpoint}`);
    const result = await resp.json();
    return result;
  };

  const getNumberFromBackend = async (no) => {
    const result = await request(`/post/${no}`);
    number = result.data;
  };

  const getCurrentConfig = async () => {
	  const result = await request('/currentConfig');
	  CurrentConfig = result;
  };

  const getSetConfig = async (cf) => {
	  const result = await request('/setConfig/${cf}');
	  //CurrentConfig = result;
  };

</script>
<Navi/>
<main>
	<input bind:value={inputNumber}>
	<button type="button" on:click={() => getNumberFromBackend(inputNumber)}>submit</button>
	<input bind:value={number}>
	<button type="button" on:click={() => getCurrentConfig()}>GetCurrentConfig</button>
	<input bind:value={CurrentConfig.controlType}>
	<input bind:value={CurrentConfig.gearA1}>
	<input bind:value={CurrentConfig.gearB}>
	<input bind:value={CurrentConfig.PR}>
	<button type="button" on:click={() => getCurrentConfig()}>Set</button>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>