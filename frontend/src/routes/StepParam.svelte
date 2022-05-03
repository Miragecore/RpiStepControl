
<script>

</script>
<h2>Step Motor Parameters</h2>

<form action="" method="get" class="step-motor-param">
    <div class="step-motor-param">
      <label for="control-type-select">Choose Control Type:</label>

      <select id="control-type-select">
        <!--
        <option value="">--Please choose an option--</option>
        -->
        <option value="rotary">Rotary</option>
        <option value="ball_screw">Ball Screw</option>
        <!--
        <option value="hamster">Hamster</option>
        <option value="parrot">Parrot</option>
        <option value="spider">Spider</option>
        <option value="goldfish">Goldfish</option>
        -->
    </select>
  </div>
  <div class="step-motor-param">
    <label for="gear_a1">GearA1: </label>
    <input type="range" name="gear_a1" id="gear_a1" min="0" max="100">
  </div>
  <div class="step-motor-param">
    <label for="gear_b">GearB: </label>
    <input type="range" name="gear_b" id="gear_b" min="0" max="100">
  </div>
  <div class="step-motor-param">
    <label for="per_rotation">Per Rotation: </label>
    <input type="number" name="per_rotation" id="per_rotation" required>
  </div>
  
  <div class="step-motor-param">
    <input type="submit" value="Set">
  </div>
</form>

<!--
<main>
	<input bind:value={inputNumber}>
	<button type="button" on:click={() => getNumberFromBackend(inputNumber)}>submit</button>
	<input bind:value={number}>
	<button type="button" on:click={() => getCurrentConfig()}>GetCurrentConfig</button>
	<input bind:value={CurrentConfig.controlType}>
	<input bind:value={CurrentConfig.gearA1}>
	<input bind:value={CurrentConfig.gearB}>
	<input bind:value={CurrentConfig.PR}>
	<button type="button" on:click={() => setCurrentConfig(CurrentConfig)}>Set</button>
</main>
-->
