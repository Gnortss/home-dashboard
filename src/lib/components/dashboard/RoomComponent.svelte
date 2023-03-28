<script lang="ts">
  import { TopicNode, type MqttMessage } from "../../../utils";
  
  let selectedRoom: string = "";

  export let messages = new TopicNode("");

  let roomMessages: Map<string, MqttMessage> = new Map();
  $: rooms = messages.allRooms;
  $: {
    if (selectedRoom === "" || selectedRoom === undefined) {
      selectedRoom = rooms.keys().next().value;
    }
  }
  $: {
    let __room = rooms.get(selectedRoom);
    roomMessages = __room !== undefined ? __room.allLatestSubtopicMessages : new Map();
  }
  let settingsOpen = false;

</script>

<div class="card w-80 m-2">
  <div class="card-header">
    <div class="flex flex-nowrap justify-between">
      {#if settingsOpen}
        <select class="select flex-grow" bind:value={selectedRoom} on:change={_ => settingsOpen = false}>
          {#each [...rooms] as [name, room], i}
            <option value={name}>
              {room.topic}
            </option>
          {/each}
        </select>
      {:else if selectedRoom}
        <h4>
          {rooms.get(selectedRoom)?.topic}
        </h4>
      {/if}
      <button type="button" class="btn-icon variant-filled flex-none ml-4" on:click={_ => settingsOpen = !settingsOpen}>S</button>
    </div>
  </div>
  <section class="p-4">
    {#if selectedRoom}
      {#if [...roomMessages.keys()].length != 0}
        <table class="table">
          {#each [...roomMessages] as [topic, msg]}
            <tr>
              <td>{topic}</td>
              <td>{msg.payload?.value}</td>
            </tr>
          {/each}
          </table>
      {:else}
        <p>How empty o.O</p>
      {/if}
    {/if}  
  </section>
</div>

<!-- <Col {xs} style="min-width: 304px">
  <Card style="height: 100%">
    <CardHeader style="min-height: 55px">
      <div style="float: left;">
        {#if settingsOpen}
          <select class="form-select" bind:value={selectedRoom} on:change={_ => settingsOpen = false}>
            {#each [...rooms] as [name, room], i}
              <option value={name}>
                {room.topic}
              </option>
            {/each}
          </select>
        {:else if selectedRoom}
          <h4>
            {rooms.get(selectedRoom)?.topic}
          </h4>
        {/if}
      </div>
      <Button style="float:right;" color="light" on:click={_ => settingsOpen = !settingsOpen}>
        <Icon name={settingsOpen ? "gear-fill" : "gear"} />
      </Button>
    </CardHeader>
    <CardBody>
      {#if selectedRoom}
        {#if roomMessages.length != 0}
          <Table borderless>
            {#each [...roomMessages] as [topic, msg]}
              <tr>
                <td>{topic}</td>
                <td>{msg.payload.value}</td>
              </tr>
            {/each}
          </Table>
        {:else}
          <p>How empty o.O</p>
        {/if}
      {/if}
    </CardBody>
  </Card>
</Col> -->
