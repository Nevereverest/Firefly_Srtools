import type useCurrentDataStore from "@/stores/currentDataStore";
import type useDetailDataStore from "@/stores/detailDataStore";
import type { ChangelogItemType } from "@/types";

// Type-only imports: the gate can also be tested without mounting React/stores.
type DetailState = ReturnType<typeof useDetailDataStore.getState>;
type SettingsState = ReturnType<typeof useCurrentDataStore.getState>;
type InitialData = {
  metadata?: import("@/types").Metadata;
  avatars?: DetailState["mapAvatar"];
  lightcones?: DetailState["mapLightCone"];
  relics?: DetailState["mapRelicSet"];
  monsters?: DetailState["mapMonster"];
  pf?: DetailState["mapPF"];
  moc?: DetailState["mapMoc"];
  as?: DetailState["mapAS"];
  peak?: DetailState["mapPeak"];
  changelog?: ChangelogItemType[];
};

export function isInitialDataReady(
  data: InitialData,
  detail: DetailState,
  settings: Pick<SettingsState, "avatarSelected">,
  changelog: ChangelogItemType[],
): boolean {
  const metadata = data.metadata;
  return !!metadata && !!settings.avatarSelected &&
    detail.baseType === metadata.BaseType &&
    detail.damageType === metadata.DamageType &&
    detail.mainAffix === metadata.MainAffix &&
    detail.subAffix === metadata.SubAffix &&
    detail.skillConfig === metadata.SkillConfig &&
    detail.stage === metadata.Stage &&
    detail.hardLevelConfig === metadata.HardLevelConfig &&
    detail.eliteConfig === metadata.EliteConfig &&
    detail.mapAvatar === data.avatars &&
    detail.mapLightCone === data.lightcones &&
    detail.mapRelicSet === data.relics &&
    detail.mapMonster === data.monsters &&
    detail.mapPF === data.pf &&
    detail.mapMoc === data.moc &&
    detail.mapAS === data.as &&
    detail.mapPeak === data.peak &&
    changelog === data.changelog;
}
