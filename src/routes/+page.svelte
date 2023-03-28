<script lang="ts">
	import type { OnCloseCallback, OnConnectCallback, OnErrorCallback, OnMessageCallback } from "mqtt";
  import { initMQTTClient, TopicNode } from "../utils";
  import RoomComponent from "$lib/components/dashboard/RoomComponent.svelte";

	let connected = undefined;
  let messages = new TopicNode("");
  
  const onConnect : OnConnectCallback = () => {
    console.log(`MQTT connected`);
    connected = client.connected;
    const topic = '#';
    client.subscribe(topic, function (err) {
      if (err) {
        console.error(err);
      } else {
        console.log(`MQTT subscribed on topic '${topic}'`);
      }
    });
  };

  const onMessage : OnMessageCallback = (topic: string, payload: any) => {
    const msg = payload.toString();
		console.log("RECEIVED MESSAGE", topic, JSON.parse(msg));
    messages.addMessage({
      topic,
      payload: JSON.parse(msg),
      receivedTimestamp: Date.now()
    });
    messages = messages; // trigger
  };

  const onError : OnErrorCallback = (err: Error) => {
    console.log('MQTT', err);
    client.end();
    connected = client.connected;
  };

  const onClose : OnCloseCallback = () => {
    console.log('MQTT disconnected');
    connected = client.connected;
  }

  export const client = initMQTTClient(
    onConnect,
    onMessage,
    onError,
    onClose,
  )
</script>

<div class="container h-full mx-auto flex justify-center items-center">
	<RoomComponent messages={messages}/>
	<RoomComponent messages={messages}/>
</div>
