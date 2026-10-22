"use client"
import { looksLikeHtml, normalizePsResponse, SendDataThroughProxy, SendDataToMarch7thHoney, SendDataToServer } from "@/lib/api/api"
import { isPrivateUrl } from "@/lib/net/ipRules"
import useConnectStore from "@/stores/connectStore"
import useUserDataStore from "@/stores/userDataStore"
import { converterToFreeSRJson } from "./converterToFreeSRJson"
import useGlobalStore from "@/stores/globalStore"
import { ActionResult, ConnectErrorCode, ExtraData, FreeSRJson, ProxyPayload, PSConnectType, PSResponse } from "@/types"


const withScheme = (serverUrl: string): string => {
    if (!serverUrl.startsWith("http://") && !serverUrl.startsWith("https://")) {
        return `http://${serverUrl}`
    }
    return serverUrl
}

const getUrlQuery = (connectionType: PSConnectType | string, serverUrl: string): string => {
    if (connectionType === PSConnectType.FireflyGo) return "http://localhost:21000/sync"
    if (connectionType === PSConnectType.RobinSR) return "http://localhost:21000/srtools"
    if (connectionType === PSConnectType.March7thHoney) {
        return `${withScheme(serverUrl.trim()).replace(/\/+$/, "")}/sr-tools`
    }

    return withScheme(serverUrl)
}

const sendData = (
    connectionType: PSConnectType | string,
    username: string,
    password: string,
    urlQuery: string,
    data?: FreeSRJson,
    extraData?: ExtraData
): Promise<PSResponse | string> => {
    if (connectionType === PSConnectType.March7thHoney) {
        return SendDataToMarch7thHoney(username, password, urlQuery, data)
    }
    return SendDataToServer(username, password, urlQuery, data, extraData)
}

const sendThroughProxy = async (payload: ProxyPayload): Promise<PSResponse | string> => {
    const result = await SendDataThroughProxy({ data: { ...payload, method: "POST" } })
    if (result instanceof Error) return result.message
    return normalizePsResponse(result, 200)
}

const requestServer = (
    connectionType: PSConnectType | string,
    privateType: string,
    serverUrl: string,
    username: string,
    password: string,
    data?: FreeSRJson,
    extraData?: ExtraData
): Promise<PSResponse | string> => {
    if (connectionType === PSConnectType.Other && privateType === "Server") {
        return sendThroughProxy({ username, password, serverUrl, data })
    }

    return sendData(connectionType, username, password, getUrlQuery(connectionType, serverUrl), data, extraData)
}

const handleServerResponse = (
    response: PSResponse | string,
    setIsConnectPS: (val: boolean) => void,
    onSuccess: (extraData?: ExtraData) => void
): ActionResult => {
    if (typeof response === "string") {
        setIsConnectPS(false)
        return { success: false, message: response }
    }
    if (response.status < 200 || response.status >= 300) {
        setIsConnectPS(false)
        return { success: false, message: response.message || `HTTP ${response.status}` }
    }
   
    if (looksLikeHtml(response.message)) {
        setIsConnectPS(false)
        return { success: false, message: response.message }
    }

    setIsConnectPS(true)
    onSuccess(response.extra_data)
    return { success: true, message: "" }
}

const needsLocalMode = (connectionType: PSConnectType | string, privateType: string, serverUrl: string): boolean =>
    connectionType === PSConnectType.Other &&
    privateType === "Server" &&
    isPrivateUrl(serverUrl)

const privateHostResult = (): ActionResult => ({
    success: false,
    message: "This address is on your local network, switch to Local mode to connect directly.",
    code: ConnectErrorCode.PrivateHostUseLocal,
})


export const connectToPS = async (): Promise<ActionResult> => {
    const { connectionType, privateType, serverUrl, username, password } = useConnectStore.getState()
    const { setExtraData, setIsConnectPS } = useGlobalStore.getState()

    if (needsLocalMode(connectionType, privateType, serverUrl)) return privateHostResult()

    const response = await requestServer(connectionType, privateType, serverUrl, username, password)

    return handleServerResponse(response, setIsConnectPS, (extraData) => {
        if (!extraData) return
        setExtraData(extraData)
    })
}

export const syncDataToPS = async (): Promise<ActionResult> => {
    const { connectionType, privateType, serverUrl, username, password } = useConnectStore.getState()
    const { extraData, setIsConnectPS, setExtraData, isEnableChangePath, isEnableLua } = useGlobalStore.getState()
    const { avatars, battle_type, moc_config, pf_config, as_config, ce_config, peak_config } = useUserDataStore.getState()

    if (needsLocalMode(connectionType, privateType, serverUrl)) return privateHostResult()

    const data = converterToFreeSRJson(avatars, battle_type, moc_config, pf_config, as_config, ce_config, peak_config)

    const payloadExtra: PSResponse['extra_data'] = structuredClone(extraData)
    if (payloadExtra) {
        if (!isEnableChangePath) payloadExtra.multi_path = undefined
        if (!isEnableLua) payloadExtra.lua = null
    }

    const response = await requestServer(connectionType, privateType, serverUrl, username, password, data, payloadExtra)

    return handleServerResponse(response, setIsConnectPS, (responseExtraData) => {
        if (!responseExtraData) return
        const newData = structuredClone(responseExtraData)
        newData.lua = extraData?.lua || null
        setExtraData(newData)
    })
}
