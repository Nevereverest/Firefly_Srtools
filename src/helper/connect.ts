"use client"
import { SendDataThroughProxy, SendDataToServer } from "@/lib/api/api"
import useConnectStore from "@/stores/connectStore"
import useUserDataStore from "@/stores/userDataStore"
import { converterToFreeSRJson } from "./converterToFreeSRJson"
import { psResponseSchema } from "@/zod"
import useGlobalStore from "@/stores/globalStore"
import { ActionResult, ExtraData, ProxyPayload, ProxyResponse, PSConnectType, PSResponse } from "@/types"


const getUrlQuery = (connectionType: PSConnectType | string, serverUrl: string): string => {
    if (connectionType === PSConnectType.FireflyGo) return "http://localhost:21000/sync"
    if (connectionType === PSConnectType.RobinSR) return "http://localhost:21000/srtools"

    if (!serverUrl.startsWith("http://") && !serverUrl.startsWith("https://")) {
        return `http://${serverUrl}`
    }
    return serverUrl
}

const handleProxyRequest = async (payload: ProxyPayload): Promise<ActionResult> => {
    const response = await SendDataThroughProxy({ 
        data: { ...payload, method: "POST" } 
    }) as ProxyResponse | Error
    
    if (response instanceof Error) {
        return { success: false, message: response.message }
    }
    if (response.error) {
        return { success: false, message: response.error }
    }
    
    const parsed = psResponseSchema.safeParse(response.data)
    if (!parsed.success) {
        return { success: false, message: "Invalid response schema" }
    }
    
    return { success: true, message: "" }
}

const handleDirectServerResponse = (
    response: PSResponse | string, 
    setIsConnectPS: (val: boolean) => void, 
    onSuccess: (extraData?: ExtraData) => void
): ActionResult => {
    if (typeof response === "string") {
        setIsConnectPS(false)
        return { success: false, message: response }
    } 
    if (response.status !== 200) {
        setIsConnectPS(false)
        return { success: false, message: response.message }
    }
    
    setIsConnectPS(true)
    onSuccess(response?.extra_data)
    return { success: true, message: "" }
}


export const connectToPS = async (): Promise<ActionResult> => {
    const { connectionType, privateType, serverUrl, username, password } = useConnectStore.getState()
    const { setExtraData, setIsConnectPS } = useGlobalStore.getState()

    if (connectionType === "Other" && privateType === "Server") {
        return handleProxyRequest({ username, password, serverUrl, data: undefined })
    }

    const urlQuery = getUrlQuery(connectionType, serverUrl)
    const response = await SendDataToServer(username, password, urlQuery, undefined)

    return handleDirectServerResponse(response, setIsConnectPS, (extraData) => {
        setExtraData(extraData)
    })
}

export const syncDataToPS = async (): Promise<ActionResult> => {
    const { connectionType, privateType, serverUrl, username, password } = useConnectStore.getState()
    const { extraData, setIsConnectPS, setExtraData, isEnableChangePath, isEnableLua } = useGlobalStore.getState()
    const { avatars, battle_type, moc_config, pf_config, as_config, ce_config, peak_config } = useUserDataStore.getState()

    const data = converterToFreeSRJson(avatars, battle_type, moc_config, pf_config, as_config, ce_config, peak_config)

    if (connectionType === "Other" && privateType === "Server") {
        return handleProxyRequest({ username, password, serverUrl, data })
    }

    const urlQuery = getUrlQuery(connectionType, serverUrl)
    
    const payloadExtra: PSResponse['extra_data'] = structuredClone(extraData)
    if (payloadExtra) {
        if (!isEnableChangePath) payloadExtra.multi_path = undefined
        if (!isEnableLua) payloadExtra.lua = null
    }

    const response = await SendDataToServer(username, password, urlQuery, data, payloadExtra)

    return handleDirectServerResponse(response, setIsConnectPS, (responseExtraData) => {
        const newData = structuredClone(responseExtraData)
        if (newData) {
            newData.lua = extraData?.lua || null
        }
        setExtraData(newData)
    })
}