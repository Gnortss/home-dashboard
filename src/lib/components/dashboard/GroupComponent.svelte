<script lang="ts">
    import { TopicNode } from "../../../utils";

  let groupName = "Group";
  let settingsOpen = false;
</script>

<div class="card min-w-80 m-2">
  <div class="card-header">
    <div class="flex flex-nowrap justify-between">
      {#if settingsOpen}
        <form on:submit|preventDefault>
          <div class="input-group input-group-divider grid-cols-[1fr_auto]">
            <input type="text" placeholder="Room Name" bind:value={groupName}/>
            <button type="submit" class="variant-filled-secondary" on:click={_ => settingsOpen = !settingsOpen}>Submit</button>
          </div>
        </form>
      {:else}
        <h4>
          {groupName}
        </h4>
      {/if}
      <button type="button" class="btn-icon variant-filled flex-none ml-4" on:click={_ => settingsOpen = !settingsOpen}>S</button>
    </div>
  </div>
  <section class="p-4">
    <div class="grid grid-cols-3 gap-4">
      <slot></slot>
    </div>
  </section>
</div>
