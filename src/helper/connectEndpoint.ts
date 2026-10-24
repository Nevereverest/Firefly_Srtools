import { PSConnectType } from "@/types"

const FIREFLYGO_SYNC_URL = "http://localhost:21000/sync"
const ROBINSR_SYNC_URL = "http://localhost:21000/srtools"

/**
 * Connection types whose endpoint lives under a fixed path on the host the user
 * types. People paste either the bare host or the full endpoint, so the suffix is
 * only added when it is not already there.
 */
const PATH_SUFFIX: Record<string, string> = {
    [PSConnectType.March7thHoney]: "/sr-tools",
    [PSConnectType.Collapse]: "/query_connection",
}

export const withScheme = (serverUrl: string): string => {
    if (!serverUrl.startsWith("http://") && !serverUrl.startsWith("https://")) {
        return `http://${serverUrl}`
    }
    return serverUrl
}

const normalizeBase = (serverUrl: string): string => withScheme(serverUrl.trim()).replace(/\/+$/, "")

const hasPathSuffix = (url: string, suffix: string): boolean => {
    // Compare the pathname only, so query strings and trailing slashes cannot fool it.
    try {
        return new URL(url).pathname.replace(/\/+$/, "").toLowerCase().endsWith(suffix)
    } catch {
        return url.replace(/[?#].*$/, "").replace(/\/+$/, "").toLowerCase().endsWith(suffix)
    }
}

/**
 * Resolves the URL a connection type posts to.
 *
 * March7thHoney and Collapse accept either the bare host (`http://host:8080`) or the
 * full endpoint (`http://host:8080/sr-tools`, `http://host:3125/query_connection`),
 * and both must work, so the suffix is only appended when it is missing.
 */
export const buildConnectUrl = (connectionType: string, serverUrl: string): string => {
    if (connectionType === PSConnectType.FireflyGo) return FIREFLYGO_SYNC_URL
    if (connectionType === PSConnectType.RobinSR) return ROBINSR_SYNC_URL

    const suffix = PATH_SUFFIX[connectionType]
    if (suffix) {
        const base = normalizeBase(serverUrl)
        return hasPathSuffix(base, suffix) ? base : `${base}${suffix}`
    }

    return withScheme(serverUrl)
}
