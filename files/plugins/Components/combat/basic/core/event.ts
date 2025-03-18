import { eventCenter } from "scripts-rpc/func/input"
import { EventInputStream } from "../generic/event-stream"

export const em = eventCenter({ enableWatcher: true })
export const es = EventInputStream.get(em)