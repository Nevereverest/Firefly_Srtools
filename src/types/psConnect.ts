import { ExtraData } from "./extraData";
import { FreeSRJson } from "./srtools";

export enum PSConnectType {
  FireflyGo = "FireflyGo",
  RobinSR = "RobinSR",
  March7thHoney = "March7thHoney",
  Collapse = "Collapse",
  Other = "Other",
}

export interface ProxyPayload {
    username?: string;
    password?: string;
    serverUrl: string;
    data?: FreeSRJson;
}

export interface ProxyResponse {
    error?: string;
    message?: string;
    data?: unknown;
}

/** What a server reported it actually changed (Collapse answers with this per push). */
export interface PushStats {
    avatars: number;
    created: number;
    updated: number;
    deleted: number;
}

export interface PSResponse {
    status: number;
    message: string;
    extra_data?: ExtraData
    /** Non-fatal problems the server reported while still applying the rest. */
    warnings?: string[]
    stats?: PushStats
    /** Collapse's own verdict; the HTTP status alone cannot tell probes from failures. */
    retcode?: number
}

export enum ConnectErrorCode {
  PrivateHostUseLocal = "PRIVATE_HOST_USE_LOCAL",
}

export interface ActionResult {
    success: boolean;
    message: string;
    code?: ConnectErrorCode;
    /** Applied, but the server skipped some entries; shown without failing the action. */
    warning?: string;
    stats?: PushStats;
}
