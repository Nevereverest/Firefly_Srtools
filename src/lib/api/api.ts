import { ASGroupDetail, ChangelogItemType, AvatarDetail, FreeSRJson, LightConeDetail, MOCGroupDetail, MonsterDetail, PeakGroupDetail, PFGroupDetail, PSResponse, RelicSetDetail } from "@/types";
import axios from 'axios';
import { unpackData } from '../data/packedData';
import { psResponseSchema } from "@/zod";
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

export async function SendDataToServer(
    username: string,
    password: string,
    serverUrl: string,
    data?: FreeSRJson,
    extraData?: ExtraData
): Promise<PSResponse | string> {
    try {
        const response = await axios.post(`${serverUrl}`, { username, password, data, extra_data: extraData })
        const parsed = psResponseSchema.safeParse(response.data)
        if (!parsed.success) {
            return "Invalid response schema";
        }
        return parsed.data;
    } catch (error: unknown) {
        return (error as Error)?.message || "Unknown error";
    }
}

export async function SendDataThroughProxy({ data }: { data: Record<string, unknown> | unknown }) {
    try {
        const response = await axios.post(`/api/proxy`, typeof data === "object" && data !== null ? { ...data } : data)
        return response.data;
    } catch (error: unknown) {
        return error;
    }
}