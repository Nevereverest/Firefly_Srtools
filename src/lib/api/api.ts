import { ASGroupDetail, ChangelogItemType, AvatarDetail, FreeSRJson, LightConeDetail, MOCGroupDetail, MonsterDetail, PeakGroupDetail, PFGroupDetail, PSResponse, RelicSetDetail } from "@/types";
import axios from 'axios';
import { unpackData } from '../data/packedData';
import { ExtraData, Metadata } from "@/types";

export async function getMetadataApi(): Promise<Metadata> {
    try {
        const res = await axios.get<Metadata>(`/api/data/metadata?encoding=strings-v1`);
        return unpackData(res.data);
    } catch (error: unknown) {
        console.error('Failed to fetch metadata:', error);
        throw error;
    }
}

export async function getAvatarListApi(): Promise<Record<string, AvatarDetail>> {
    try {
        const res = await axios.get<Record<string, AvatarDetail>>(`/api/data/avatar?encoding=strings-v1`);
        return unpackData(res.data);
    } catch (error) {
        console.error('Failed to fetch Avatars:', error);
        throw error;
    }
}

export async function getLightconeListApi(): Promise<Record<string, LightConeDetail>> {
    try {
        const res = await axios.get<Record<string, LightConeDetail>>(`/api/data/lightcone?encoding=strings-v1`);
        return unpackData(res.data);
    } catch (error) {
        console.error('Failed to fetch lightcones:', error);
        throw error;
    }
}

export async function getRelicSetListApi(): Promise<Record<string, RelicSetDetail>> {
    try {
        const res = await axios.get<Record<string, RelicSetDetail>>(`/api/data/relic?encoding=strings-v1`);
        return unpackData(res.data);
    } catch (error) {
        console.error('Failed to fetch relics:', error);
        throw error;
    }
}

export async function getMonsterListApi(): Promise<Record<string, MonsterDetail>> {
    try {
        const res = await axios.get<Record<string, MonsterDetail>>(`/api/data/monster?encoding=strings-v1`);
        return unpackData(res.data);
    } catch (error) {
        console.error('Failed to fetch monster:', error);
        throw error;
    }
}

export async function getASEventListApi(): Promise<Record<string, ASGroupDetail>> {
    try {
        const res = await axios.get<Record<string, ASGroupDetail>>(`/api/data/as?encoding=strings-v1`);
        return unpackData(res.data);
    } catch (error) {
        console.error('Failed to fetch AS:', error);
        throw error;
    }
}

export async function getPFEventListApi(): Promise<Record<string, PFGroupDetail>> {
    try {
        const res = await axios.get<Record<string, PFGroupDetail>>(`/api/data/pf?encoding=strings-v1`);
        return unpackData(res.data);
    } catch (error) {
        console.error('Failed to fetch PF:', error);
        throw error;
    }
}

export async function getMOCEventListApi(): Promise<Record<string, MOCGroupDetail>> {
    try {
        const res = await axios.get<Record<string, MOCGroupDetail>>(`/api/data/moc?encoding=strings-v1`);
        return unpackData(res.data);
    } catch (error) {
        console.error('Failed to fetch MOC:', error);
        throw error;
    }
}

export async function getPeakEventListApi(): Promise<Record<string, PeakGroupDetail>> {
    try {
        const res = await axios.get<Record<string, PeakGroupDetail>>(`/api/data/peak?encoding=strings-v1`);
        return unpackData(res.data);
    } catch (error) {
        console.error('Failed to fetch peak:', error);
        throw error;
    }
}

export async function getChangelog(): Promise<ChangelogItemType[]> {
    try {
        const res = await axios.get<ChangelogItemType[]>(`/api/data/changelog`);
        return unpackData(res.data);
    } catch (error) {
        console.error('Failed to fetch changelog:', error);
        throw error;
    }
}

const HTML_LIKE = /^\s*</;

export function looksLikeHtml(value: string): boolean {
    return HTML_LIKE.test(value);
}

export function normalizePsResponse(body: unknown, httpStatus = 200): PSResponse {
    if (typeof body === "string") {
        return { status: httpStatus, message: body.trim() };
    }

    if (body && typeof body === "object") {
        const raw = body as { status?: unknown; message?: unknown; extra_data?: ExtraData; error?: unknown };

        // Shape used by /api/proxy and by several servers for failures.
        if (typeof raw.error === "string" && raw.error) {
            return { status: 400, message: raw.error };
        }

        const status = typeof raw.status === "number" ? raw.status : Number(raw.status);
        return {
            status: Number.isFinite(status) && status > 0 ? status : httpStatus,
            message: typeof raw.message === "string" ? raw.message : JSON.stringify(body),
            extra_data: raw.extra_data,
        };
    }

    return { status: httpStatus, message: "" };
}

async function postAndNormalize(url: string, payload: unknown): Promise<PSResponse | string> {
    try {
        const response = await axios.post(url, payload);
        return normalizePsResponse(response.data, response.status);
    } catch (error: unknown) {
        const axiosError = error as { response?: { status: number; data: unknown }; message?: string };
        if (axiosError.response) {
            return normalizePsResponse(axiosError.response.data, axiosError.response.status);
        }
        return axiosError.message || "Unknown error";
    }
}

export async function SendDataToServer(
    username: string,
    password: string,
    serverUrl: string,
    data?: FreeSRJson,
    extraData?: ExtraData
): Promise<PSResponse | string> {
    return postAndNormalize(`${serverUrl}`, { username, password, data, extra_data: extraData });
}

export async function SendDataToMarch7thHoney(
    username: string,
    password: string,
    serverUrl: string,
    data?: FreeSRJson
): Promise<PSResponse | string> {
    return postAndNormalize(`${serverUrl}`, { username, password, data });
}

export async function SendDataThroughProxy({ data }: { data: Record<string, unknown> | unknown }) {
    try {
        const response = await axios.post(`/api/proxy`, typeof data === "object" && data !== null ? { ...data } : data)
        return response.data;
    } catch (error: unknown) {
        const body = (error as { response?: { data?: unknown } })?.response?.data;
        if (body && typeof body === "object" && typeof (body as { error?: unknown }).error === "string") {
            return new Error((body as { error: string }).error);
        }
        return error;
    }
}