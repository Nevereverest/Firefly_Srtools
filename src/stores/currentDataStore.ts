import { AvatarDetail, BaseTypeData, Metadata } from '@/types'
import { create } from 'zustand'

interface CurrentDataState {
    avatarSelected: AvatarDetail | null;
    skillIDSelected: string | null;
    avatarSearch: string;
    lightconeSearch: string;
    mapAvatarElementActive: Record<string, boolean>;
    mapAvatarPathActive: Record<string, boolean>;
    mapLightconePathActive: Record<string, boolean>;
    mapLightconeRankActive: Record<string, boolean>;
    setSettingData: (newMetaData: Metadata) => void;
    setAvatarSelected: (avatar: AvatarDetail | null) => void;
    setSkillIDSelected: (skillID: string | null) => void;
    setAvatarSearch: (avatarSearch: string) => void;
    setLightconeSearch: (lightconeSearch: string) => void;
    setMapAvatarElementActive: (mapAvatarElementActive: Record<string, boolean>) => void;
    setMapAvatarPathActive: (mapAvatarPathActive: Record<string, boolean>) => void;
    setMapLightconePathActive: (mapLightconePathActive: Record<string, boolean>) => void;
    setMapLightconeRankActive: (mapLightconeRankActive: Record<string, boolean>) => void;
    setResetDataLightcone: (avtarSeleted: AvatarDetail| null, baseType: Record<string, BaseTypeData>) => void;
}

const useCurrentDataStore = create<CurrentDataState>((set) => ({
    avatarSelected: null,
    skillIDSelected: null,
    mapAvatarElementActive: {},
    mapAvatarPathActive: {},
    mapLightconePathActive: {},
    mapLightconeRankActive: {"3": false, "4": false, "5": false },
    avatarSearch: "",
    lightconeSearch: "",
    setSettingData: (newMetaData: Metadata) => set({ 
        mapAvatarElementActive: Object.fromEntries(Object.keys(newMetaData.DamageType).map(key => [key, false])) as Record<string, boolean>,
        mapAvatarPathActive: Object.fromEntries(Object.keys(newMetaData.BaseType).map(key => [key, false])) as Record<string, boolean>,
        mapLightconePathActive: Object.fromEntries(Object.keys(newMetaData.BaseType).map(key => [key, false])) as Record<string, boolean>,
    }),
    setAvatarSearch: (avatarSearch: string) => set({ avatarSearch }),
    setLightconeSearch: (lightconeSearch: string) => set({ lightconeSearch }),
    setAvatarSelected: (avatar: AvatarDetail | null) => set({ avatarSelected: avatar }),
    setSkillIDSelected: (skillID: string | null) => set({ skillIDSelected: skillID }),
    setMapAvatarElementActive: (mapAvatarElementActive: Record<string, boolean>) => set({ mapAvatarElementActive }),
    setMapAvatarPathActive: (mapAvatarPathActive: Record<string, boolean>) => set({ mapAvatarPathActive }),
    setMapLightconePathActive: (mapLightconePathActive: Record<string, boolean>) => set({ mapLightconePathActive }),
    setMapLightconeRankActive: (mapLightconeRankActive: Record<string, boolean>) => set({ mapLightconeRankActive }),
    setResetDataLightcone: (avtarSeleted: AvatarDetail| null, baseType: Record<string, BaseTypeData>) => {
        const newListPath: Record<string, boolean> = Object.fromEntries(Object.keys(baseType).map(key => [key, false]))
        const newListRank: Record<string, boolean> = {"3": false, "4": false, "5": false }
        if (avtarSeleted) {
            newListPath[avtarSeleted.BaseType] = true
        }
        set({ mapLightconeRankActive: newListRank })
        set({ mapLightconePathActive: newListPath })
    }
}))

export default useCurrentDataStore;