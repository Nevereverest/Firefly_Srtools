import { ExtraData } from "./extraData";
import { FreeSRJson } from "./srtools";

export enum PSConnectType {
  FireflyGo = "FireflyGo",
  RobinSR = "RobinSR",
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

export interface PSResponse {
    status: number;
    message: string;
    extra_data?: ExtraData
}

export interface ActionResult {
    success: boolean;
    message: string;
}