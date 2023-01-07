import type { Message } from "ipfs-http-client/pubsub/subscribe";
import type { QueryResult } from "tauri-plugin-sql-api";
import { Comment } from "./flatbuffers/messages_generated";
import { flatbuffers } from "flatbuffers/js/flatbuffers";
import { ipfs } from "./core";
// import { peerIdFromPeerId } from "@libp2p/peer-id";
import { select, execute } from "./db";

const subscriptions = new Map();
function subscriptionStore() {
  const subscribe = (topic: string, inReplyTo: string, handler: any) => {
    const topicSubs = subscriptions.get(topic) || new Map();
    topicSubs.set(inReplyTo, handler);
    subscriptions.set(topic, topicSubs);
    return () => {
      const topicSubs = subscriptions.get(topic) || new Map();
      topicSubs.delete(inReplyTo);
    };
  };

  const set = (topic: string, inReplyTo: string, message: any) => {
    const topicSubs = subscriptions.get(topic) || new Map();
    const fn = topicSubs.get(inReplyTo) || (() => {});
    fn(message);
  };

  return { subscribe, set };
}

export const pubsubHandler = subscriptionStore();

export async function globalPubsubHandler(message: Message) {
  let topic = message.topic;
  // let parsed = JSON.parse(new TextDecoder().decode(message.data));
  // let inReplyTo = String(parsed["inReplyTo"]);
  const buff = new flatbuffers.ByteBuffer(message.data);
  const comment = Comment.getRootAsComment(buff);
  const inReplyTo: string | null = comment.inReplyTo();
  if (inReplyTo != null) {
    pubsubHandler.set(topic, inReplyTo, message);
  }
}

export async function getTopicsFromDB() {
  console.log("getTopicsFromDB");
  const rows: object[] = await select("SELECT * FROM topics");
  return rows.map((e) => e["topic"]);
}

export async function insertTopicIntoDB(topic: string): Promise<QueryResult> {
  console.log("insertTopicIntoDB: ", topic);
  return await execute("INSERT INTO topics (topic) VALUES ($1)", [topic]);
}

export async function deleteTopicFromDB(topic: string): Promise<QueryResult> {
  console.log("deleteTopicFromDB: ", topic);
  return await execute("DELETE FROM topics WHERE topic = ?", [topic]);
}

export function createComment(inReplyTo: string, body: string): Uint8Array {
  let builder = new flatbuffers.Builder();
  let messageOffset = Comment.createComment(
    builder,
    builder.createString(inReplyTo),
    builder.createString(body)
  );
  builder.finish(messageOffset);
  return builder.asUint8Array();
}

export function parseComment(data: Uint8Array) {
  let buff = new flatbuffers.ByteBuffer(data);
  let comment = Comment.getRootAsComment(buff);
  return {
    inReplyTo: comment.inReplyTo(),
    body: comment.body(),
  };
}
