<script lang="ts">
  import Meta from "./Meta.svelte";
  import {
    Button,
    ButtonSet,
    Dropdown,
    ListItem,
    TextInput,
    Column,
    UnorderedList,
  } from "carbon-components-svelte";
  import { onMount, onDestroy } from "svelte";

  interface Props {
    readonly: boolean;
    meta?: { [k: string]: any };
    depth?: number;
  }

  let { readonly, meta = $bindable({}), depth = 0 }: Props = $props();
  let new_meta_key: string = $state("");
  let new_meta_index: number = $state(0);
  let meta_types = [
    { id: 0, text: "string", value: "" },
    { id: 1, text: "object", value: {} },
    { id: 2, text: "custom", value: [] },
  ];

  function addMeta() {
    meta[new_meta_key] = meta_types[new_meta_index].value;
  }

  function removeMeta(k: string) {
    let temp = meta;
    delete temp[k];
    meta = temp;
  }

  function isObject(o: any) {
    return o !== null && typeof o === "object" && Array.isArray(o) === false;
  }

  onMount(() => {});

  onDestroy(() => {});
</script>

<UnorderedList nested={depth > 0}>
  {#each Object.keys(meta) as k}
    <ListItem>
      <ButtonSet>
        <Column sm={1} md={1} lg={1}>
          <div>
            {k}:
          </div>
        </Column>

        <Column sm={8} md={8} lg={8}>
          {#if isObject(meta[k])}
            <Meta meta={meta[k]} {readonly} depth={depth + 1} />
          {:else if Array.isArray(meta[k])}
            {meta[k]}
          {:else if typeof meta[k] === "string"}
            <TextInput
              size="sm"
              inline
              placeholder=""
              bind:value={meta[k]}
              {readonly}
            />
          {:else}
            else: {meta[k]}
          {/if}
        </Column>

        {#if !readonly}
          <Column sm={1} md={1} lg={1}>
            <Button size="small" on:click={() => removeMeta(k)}>delete</Button>
          </Column>
        {/if}
      </ButtonSet>
    </ListItem>
  {/each}
</UnorderedList>

<br />
{#if !readonly}
  <ButtonSet>
    <Dropdown
      type="inline"
      size="sm"
      titleText="new entry type"
      bind:selectedId={new_meta_index}
      items={meta_types}
    />
    <TextInput
      class="input"
      size="sm"
      placeholder="key"
      bind:value={new_meta_key}
    />
    <Button class="button" size="small" on:click={addMeta}>add entry</Button>
  </ButtonSet>
{/if}
