import { mpv } from "./playerService.js";

/**
 * Replace current queue with file list.
 * mpv playlist becomes the queue.
 */
export async function setQueue(filePaths: string[], startIndex = 0, shuffle = false) {
  const client = await mpv();

  let list = [...filePaths];
  if (shuffle) list = fisherYates(list);

  // replace with first
  if (list.length === 0) return;

  await client.send(["loadfile", list[0], "replace"]);

  // append rest
  for (let i = 1; i < list.length; i++) {
    await client.send(["loadfile", list[i], "append"]);
  }

  // jump to startIndex if needed
  if (startIndex > 0 && startIndex < list.length) {
    // set playlist-pos
    await client.send(["set_property", "playlist-pos", startIndex]);
  }

  // ensure playing
  await client.send(["set_property", "pause", false]);

  return { count: list.length, shuffle };
}

export async function nextTrack() {
  const client = await mpv();
  return client.send(["playlist-next", "force"]);
}

export async function prevTrack() {
  const client = await mpv();
  return client.send(["playlist-prev", "force"]);
}

export async function pause(p: boolean) {
  const client = await mpv();
  return client.send(["set_property", "pause", p]);
}

export async function stop() {
  const client = await mpv();
  // stop playback (clears current)
  return client.send(["stop"]);
}

export async function setVolume(vol01to100: number) {
  const v = Math.max(0, Math.min(100, Math.round(vol01to100)));
  const client = await mpv();
  return client.send(["set_property", "volume", v]);
}

function fisherYates<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
