<script lang="ts">
  import { createBubbler } from "svelte/legacy";

  const bubble = createBubbler();
  import PlayFilled from "carbon-icons-svelte/lib/PlayFilled.svelte";
  import type {
    WebFeedEntry,
    WebFeedMediaContent,
    WebFeedMediaObject,
  } from "$lib/types";
  // import { fetch, ResponseType } from "@tauri-apps/api/http";
  import { onMount, onDestroy } from "svelte";

  interface Props {
    entry: WebFeedEntry;
  }

  let { entry }: Props = $props();

  let media = $state([]);
  let mediaObjects: WebFeedMediaObject[] = entry.media.map((obj) => obj);
  let mediaContent: WebFeedMediaContent[] = mediaObjects.flatMap((m) =>
    m.content.map((c) => c)
  );

  async function getMedia(media, isThumbnail = false) {
    let mediaObj = {
      url: media.url,
      element: null,
      thumbnail_for: null,
      content_type: media.content_type,
    };
    if (isThumbnail) {
      mediaObj.thumbnail_for = media.url;
    }
    return mediaObj;
  }

  async function loadMedia(mc, idx: number) {
    media[idx] = await getMedia(mc);
    media = media;
  }

  onMount(async () => {
    // let resp = await fetch(link, {
    //   method: "GET",
    //   timeout: 30,
    //   responseType: ResponseType.Text,
    // });
    for await (const mc of mediaContent) {
      media = [...media, await getMedia(mc, true)];
    }
  });

  onDestroy(() => {});
</script>

{#each media as mediaObj, idx (mediaObj.url)}
  {#if mediaObj.thumbnail_for}
    <div
      bind:this={mediaObj.element}
      onclick={() => loadMedia(mediaObj, idx)}
      onkeypress={bubble("keypress")}
    >
      {#if typeof mediaObj.thumbnail_url === "string"}
        <img src={mediaObj.thumbnail_url} alt="" />
      {:else}
        <PlayFilled size={32} />
      {/if}
    </div>
  {:else if mediaObj.content_type.includes("audio/")}
    <audio bind:this={mediaObj.element} controls src={mediaObj.url}></audio>
  {:else if mediaObj.content_type.includes("image/")}
    <img bind:this={mediaObj.element} src={mediaObj.url} alt={mediaObj.url} />
  {:else if mediaObj.content_type.includes("video/")}
    <video bind:this={mediaObj.element} controls src={mediaObj.url}>
      <track kind="captions" />
    </video>
  {/if}
{/each}

<style>
  img {
    height: 150px;
    width: 150px;
    object-fit: cover;
  }
  video {
    height: auto;
    width: 100%;
    object-fit: contain;
  }
</style>
