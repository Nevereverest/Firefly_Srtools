import { ASGroupDetail, AvatarDetail, BaseTypeData, DamageTypeData, EliteData, HardLevelData, LightConeDetail, MainAffixData, Metadata, MOCGroupDetail, MonsterDetail, PeakGroupDetail, PFGroupDetail, RelicSetDetail, SkillMaxLevelData, StageData, SubAffixData } from '@/types'
import { create } from 'zustand'

interface DetailDataState {
  mapMonster: Record<string, MonsterDetail>
  mapRelicSet: Record<string, RelicSetDetail>
  mapAvatar: Record<string, AvatarDetail>
  mapLightCone: Record<string, LightConeDetail>
  mapAS: Record<string, ASGroupDetail>
  mapMoc: Record<string, MOCGroupDetail>
  mapPF: Record<string, PFGroupDetail>
  mapPeak: Record<string, PeakGroupDetail>
  baseType: Record<string, BaseTypeData>;
  damageType: Record<string, DamageTypeData>;
  mainAffix: Record<string, Record<string, MainAffixData>>;
  subAffix: Record<string, Record<string, SubAffixData>>;
  skillConfig: Record<string, SkillMaxLevelData>;
  stage: Record<string, StageData>;
  hardLevelConfig: Record<string, Record<string, HardLevelData>>;
  eliteConfig: Record<string, EliteData>;
  setMetaData: (newMetaData: Metadata) => void;
  setMapMonster: (newMonster: Record<string, MonsterDetail>) => void
  setMapRelicSet: (newRelicSet: Record<string, RelicSetDetail>) => void
  setMapAvatar: (newAvatar: Record<string, AvatarDetail>) => void
  setMapLightCone: (newLightCone: Record<string, LightConeDetail>) => void
  setMapAS: (newAS: Record<string, ASGroupDetail>) => void
  setMapMoc: (newMoc: Record<string, MOCGroupDetail>) => void
  setMapPF: (newPF: Record<string, PFGroupDetail>) => void
  setMapPeak: (newPeak: Record<string, PeakGroupDetail>) => void
}

const useDetailDataStore = create<DetailDataState>((set) => ({
  mapMonster: {},
  mapRelicSet: {},
  mapAvatar: {},
  mapLightCone: {},
  mapAS: {},
  mapMoc: {},
  mapPF: {},
  mapPeak: {},
  baseType: {},
  damageType: {},
  mainAffix: {},
  subAffix: {},
  skillConfig: {},
  stage: {},
  hardLevelConfig: {},
  eliteConfig: {},
  setMapMonster: (newMonster) => set({ mapMonster: newMonster }),
  setMapRelicSet: (newRelicSet) => set({ mapRelicSet: newRelicSet }),
  setMapAvatar: (newAvatar) => set({ mapAvatar: newAvatar }),
  setMapLightCone: (newLightCone) => set({ mapLightCone: newLightCone }),
  setMapAS: (newAS) => set({ mapAS: newAS }),
  setMapMoc: (newMoc) => set({ mapMoc: newMoc }),
  setMapPF: (newPF) => set({ mapPF: newPF }),
  setMapPeak: (newPeak) => set({ mapPeak: newPeak }),
  setMetaData: (newMetaData: Metadata) => set({ 
    baseType: newMetaData.BaseType,
    damageType: newMetaData.DamageType,
    mainAffix: newMetaData.MainAffix,
    subAffix: newMetaData.SubAffix,
    skillConfig: newMetaData.SkillConfig,
    stage: newMetaData.Stage,
    hardLevelConfig: newMetaData.HardLevelConfig,
    eliteConfig: newMetaData.EliteConfig,
  }),
}))

export default useDetailDataStore
