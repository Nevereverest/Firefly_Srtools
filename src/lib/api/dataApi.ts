import type { ASGroupDetail, AvatarDetail, AvatarHeavyDetail, ChangelogItemType, LightConeDetail, Metadata, MetadataCore, MOCGroupDetail, MonsterDetail, PeakGroupDetail, PFGroupDetail, RelicSetDetail } from "@/types";

async function getData<T>(name: string, label: string): Promise<T> {
    try {
        const res = await fetch(`/api/data/${name}`);
        if (!res.ok) throw new Error(`/api/data/${name} responded ${res.status}`);
        return await res.json() as T;
    } catch (error) {
        console.error(`Failed to fetch ${label}:`, error);
        throw error;
    }
}

export const getMetadataApi = () => getData<MetadataCore>("metadata_core", "metadata");
export const getStageApi = () => getData<Metadata["Stage"]>("metadata_stage", "stage");
export const getAvatarListApi = () => getData<Record<string, AvatarDetail>>("avatar_index", "Avatars");
export const getAvatarDetailApi = (id: number | string) => getData<AvatarHeavyDetail>(`avatar_detail_${id}`, "avatar detail");
export const getLightconeListApi = () => getData<Record<string, LightConeDetail>>("lightcone", "lightcones");
export const getRelicSetListApi = () => getData<Record<string, RelicSetDetail>>("relic", "relics");
export const getMonsterListApi = () => getData<Record<string, MonsterDetail>>("monster", "monster");
export const getASEventListApi = () => getData<Record<string, ASGroupDetail>>("as", "AS");
export const getPFEventListApi = () => getData<Record<string, PFGroupDetail>>("pf", "PF");
export const getMOCEventListApi = () => getData<Record<string, MOCGroupDetail>>("moc", "MOC");
export const getPeakEventListApi = () => getData<Record<string, PeakGroupDetail>>("peak", "peak");
export const getChangelog = () => getData<ChangelogItemType[]>("changelog", "changelog");
