import mqtt, { MqttClient, type IClientOptions } from "mqtt";
import { 
  PUBLIC_DEVICE_ID,
  PUBLIC_MQTT_HOST, 
  PUBLIC_MQTT_PORT
} from '$env/static/public';

export function initMQTTClient(onConnectCB: Function, onMessageCB: Function, onErrorCB: Function, onCloseCB: Function) : MqttClient {
  let clientId = PUBLIC_DEVICE_ID + "_" + Math.floor(Math.random() * 10000);
  let mqtt_options : IClientOptions = {
    clientId: clientId,
    servers: [
      {
        host: PUBLIC_MQTT_HOST,
        port: Number(PUBLIC_MQTT_PORT),
        protocol: 'ws',
      },
    ],
    path: '/',
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    rejectUnauthorized: false,
  };

  const client = mqtt.connect(mqtt_options);
  client.on('connect', onConnectCB);
  client.on('message', onMessageCB);
  client.on('error', onErrorCB);
  client.on('close', onCloseCB);

  return client;
}

export interface MqttMessage {
  topic: string,
  payload: Object,
  receivedTimestamp:  Number,
}

export class TopicNode {
  absoluteTopic: string;
  topic: string;
  parent: TopicNode | undefined;
  subtopics: TopicNode[];
  messages: MqttMessage[];
  constructor(absoluteTopic: string, parent: TopicNode | undefined = undefined) {
    this.absoluteTopic = absoluteTopic;
    this.parent = parent;
    let tmp = absoluteTopic.split('/');
    this.topic = absoluteTopic.length === 0 ? "" : tmp[tmp.length - 1];
    this.subtopics = [];
    this.messages = [];
  }

  isLeafNode(): boolean {
    return this.subtopics.length == 0;
  }

  hasMessages(): boolean {
    return this.messages.length != 0;
  }

  get allRooms(): Map<string, TopicNode> {
    let roomsMap = new Map();
    for (const node of this.allLeafNodes) {
      let parent = node.parent;
      if (parent != undefined)
        roomsMap.set(parent.absoluteTopic, parent);
    }
    return roomsMap;
  }

  get allLeafNodes(): TopicNode[] {
    let traverse = (n: TopicNode): TopicNode[] => {
      let ret: TopicNode[] = [];

      if(n.isLeafNode()) {
        if (n.hasMessages())
          ret.push(n);
        return ret;
      }

      for (const subtopic of n.subtopics)
        ret = [...ret, ...traverse(subtopic)];

      return ret;
    };
    
    return traverse(this);
  }

  get lastMessage(): MqttMessage | undefined {
    if (!this.hasMessages())
      return undefined
    return this.messages[this.messages.length - 1];
  }

  get allLatestSubtopicMessages(): Map<string, MqttMessage> {
    let ret: Map<string, MqttMessage> = new Map();

    for (const subtopic of this.subtopics) {
      let msg = subtopic.lastMessage;
      if (msg !== undefined)
        ret.set(subtopic.topic, msg);
    }

    return ret;
  }

  addMessage(msg: MqttMessage) {
    // this is the correct node... add this msg
    if(this.absoluteTopic === msg.topic) {
      this.messages.push(msg);
      return;
    }

    let next = (this.absoluteTopic.length == 0 ? msg.topic : msg.topic.substring(this.absoluteTopic.length + 1)).split('/')[0];
    // check if subtopic exists
    let nextNode = this.subtopics.find(e => e.topic === next);
    // otherwise create it
    if(nextNode === undefined) {
      const subtopic = this.absoluteTopic.length == 0 ? next : this.absoluteTopic + '/' + next;
      nextNode = new TopicNode(subtopic, this);
      this.subtopics.push(nextNode);
    }
    // try adding message to next node
    nextNode.addMessage(msg);
  }

  getAllTopics(): string[] {
    let ret: string[] = [];
    if(this.messages.length != 0) {
      ret.push(this.absoluteTopic);
    }
    for (const subtopic of this.subtopics) {
      ret.push(...subtopic.getAllTopics());
    }
    return ret;
  }

  toString() {
    return "[" + this.absoluteTopic + ", subtopics: " + this.subtopics.length + ", messages: " + this.messages.length + "]";
  }
}