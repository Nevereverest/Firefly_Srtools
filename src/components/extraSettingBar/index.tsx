'use client'
import { EyeOff, Eye, Hammer, RefreshCw, ShieldBan, User, Swords, SkipForward, BowArrow, Info, RouteIcon, Search, CupSoda, UsersIcon } from "lucide-react"
import useGlobalStore from '@/stores/globalStore'
import { useTranslations } from "next-intl"
import { getLocaleName, getNameChar } from "@/helper"
import useLocaleStore from "@/stores/localeStore"
import SelectCustomImage from "../select/customSelectImage"
import { useMemo, useState } from "react"
import useDetailDataStore from "@/stores/detailDataStore"
import Editor from "react-simple-code-editor"
import Prism from "prismjs"
import "prismjs/components/prism-lua"
import "prismjs/themes/prism-tomorrow.css"
import { SimpleAvatarCard } from "../card/simpleCharacterCard"
import { useShallow } from "zustand/react/shallow"

export default function ExtraSettingBar() {
  const { extraData, setExtraData, isEnableChangePath, setIsEnableChangePath, isEnableLua, setIsEnableLua } = useGlobalStore(
    useShallow((state) => ({
      extraData: state.extraData,
      setExtraData: state.setExtraData,
      isEnableChangePath: state.isEnableChangePath,
      setIsEnableChangePath: state.setIsEnableChangePath,
      isEnableLua: state.isEnableLua,
      setIsEnableLua: state.setIsEnableLua,
    }))
  )
  const transI18n = useTranslations("DataPage")
  const { mapAvatar, mapPeak, stage, baseType } = useDetailDataStore(
    useShallow((state) => ({
      mapAvatar: state.mapAvatar,
      mapPeak: state.mapPeak,
      stage: state.stage,
      baseType: state.baseType,
    }))
  )
  const { locale } = useLocaleStore(
    useShallow((state) => ({ locale: state.locale }))
  )
  const [showSearchStage, setShowSearchStage] = useState(false)
  const [showSearchLineup, setShowSearchLineup] = useState(false)
  const [isChildClick, setIsChildClick] = useState(false)
  const [stageSearchTerm, setStageSearchTerm] = useState("")
  const [stagePage, setStagePage] = useState(1)

  const pageSize = 30
  const stageList = useMemo(() => Object.values(stage), [stage])

  const term = stageSearchTerm.toLowerCase()

  const filteredStages = useMemo(() => stageList.filter((s) =>
    getLocaleName(locale, s.Name).toLowerCase().includes(term) ||
    String(s.ID).toLowerCase().includes(term)
  ), [stageList, term, locale])

  const paginatedStages = useMemo(() => filteredStages.slice(
    (stagePage - 1) * pageSize,
    stagePage * pageSize
  ), [filteredStages, stagePage, pageSize])

  const hasMorePages = useMemo(() => stagePage * pageSize < filteredStages.length, [stagePage, filteredStages])

  const onChangeSearch = (v: string) => {
    setStageSearchTerm(v)
    setStagePage(1)
  }

  return (
    <div className="space-y-6">
      {/* THEORY CRAFT */}
      {extraData?.theory_craft && (
        <div className="p-4 sm:p-5 rounded-2xl bg-base-200/60 border border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-base-content/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-primary rounded-full"></span>
              {transI18n("theoryCraft")}
            </h3>
            <div className="tooltip tooltip-left tooltip-info" data-tip={transI18n("detailTheoryCraft")}>
              <Info className="text-primary w-4 h-4 cursor-pointer" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-base-100/60 border border-white/5 flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <Hammer className="text-primary w-4 h-4" />
              <span className="text-xs sm:text-sm font-semibold">{transI18n("theoryCraftMode")}</span>
            </label>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={extraData?.theory_craft?.mode}
              onChange={(e) => {
                setExtraData({
                  ...extraData,
                  theory_craft: {
                    hp: extraData?.theory_craft?.hp || {},
                    cycle_count: extraData?.theory_craft?.cycle_count || 1,
                    mode: e.target.checked,
                    stage_id: extraData?.theory_craft?.stage_id || 0
                  }
                })
              }}
            />
          </div>

          {extraData?.theory_craft?.mode && (
            <div className="space-y-3 pt-1">
              {/* Cycle Count */}
              <div className="p-3.5 rounded-xl bg-base-100/60 border border-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="text-info w-4 h-4" />
                  <span className="text-xs sm:text-sm font-semibold">{transI18n("cycleCount")}</span>
                </div>
                <input
                  type="number"
                  className="input input-sm input-bordered w-24 rounded-xl text-center font-mono font-bold"
                  value={extraData?.theory_craft?.cycle_count}
                  onChange={(e) =>
                    setExtraData({
                      ...extraData,
                      theory_craft: {
                        hp: extraData?.theory_craft?.hp || {},
                        cycle_count: Number(e.target.value) || 1,
                        mode: extraData?.theory_craft?.mode || false,
                        stage_id: extraData?.theory_craft?.stage_id || 0
                      }
                    })
                  }
                  min="1"
                />
              </div>

              {/* Stage Selection */}
              <div className="p-3.5 rounded-xl bg-base-100/60 border border-white/5 space-y-2">
                <div className="flex items-center gap-2">
                  <RouteIcon className="text-info w-4 h-4" />
                  <span className="text-xs sm:text-sm font-semibold">{transI18n("stage")}</span>
                </div>
                <div className="relative">
                  <button
                    className="btn btn-sm btn-outline w-full rounded-xl flex items-center justify-between text-xs sm:text-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isChildClick) {
                        setShowSearchStage(pre => !pre)
                      }
                      setIsChildClick(false)
                    }}
                  >
                    <span className="truncate">
                      {getLocaleName(locale, stageList.find((s) => s.ID.toString() === extraData?.theory_craft?.stage_id?.toString())?.Name) || transI18n("selectStage")}
                    </span>
                    <Search className="w-3.5 h-3.5 shrink-0 ml-2" />
                  </button>

                  {showSearchStage && (
                    <div onClick={(e) => e.stopPropagation()} className="absolute top-full mt-2 w-full z-50 bg-base-100 border border-base-content/15 rounded-2xl p-3.5 shadow-2xl space-y-3">
                      <input
                        type="search"
                        className="input input-sm input-bordered w-full rounded-xl text-xs"
                        placeholder={transI18n("searchStage")}
                        value={stageSearchTerm}
                        onChange={(e) => onChangeSearch(e.target.value)}
                        autoFocus
                      />

                      <div className="max-h-56 overflow-y-auto space-y-1 pr-1 text-xs">
                        {paginatedStages.length > 0 ? (
                          paginatedStages.map((stage) => (
                            <div
                              key={stage.ID}
                              className="p-2 hover:bg-primary/20 rounded-xl cursor-pointer transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                setIsChildClick(true)

                                if (extraData?.theory_craft?.stage_id !== Number(stage.ID)) {
                                  setExtraData({
                                    ...extraData,
                                    theory_craft: {
                                      stage_id: Number(stage.ID),
                                      cycle_count: extraData?.theory_craft?.cycle_count ?? 1,
                                      mode: extraData?.theory_craft?.mode ?? false,
                                      hp: extraData?.theory_craft?.hp ?? {},
                                      custom_lineup: extraData?.theory_craft?.custom_lineup ?? []
                                    }
                                  })
                                }
                                setShowSearchStage(pre => !pre)
                                onChangeSearch("")
                              }}
                            >
                              {getLocaleName(locale, stage.Name)}
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-center py-4 text-base-content/40">{transI18n("noStageFound")}</div>
                        )}
                      </div>

                      {paginatedStages.length > 0 && (
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                          <button
                            disabled={stagePage === 1}
                            className="btn btn-xs btn-outline rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation()
                              setStagePage(stagePage - 1)
                            }}
                          >
                            {transI18n("previous")}
                          </button>
                          <span className="text-[11px] font-mono text-base-content/50">Page {stagePage}</span>
                          <button
                            disabled={!hasMorePages}
                            className="btn btn-xs btn-outline rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation()
                              setStagePage(stagePage + 1)
                            }}
                          >
                            {transI18n("next")}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Lineup */}
              <div className="p-3.5 rounded-xl bg-base-100/60 border border-white/5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <UsersIcon className="text-info w-4 h-4" />
                  <span className="text-xs sm:text-sm font-semibold">{transI18n("customLineup")}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 min-h-16 p-2 bg-base-200/50 rounded-xl border border-white/5">
                  {(extraData?.theory_craft?.custom_lineup || []).map((avatarId) => {
                    const avatarData = mapAvatar[avatarId];
                    if (!avatarData) return null;
                    return (
                      <SimpleAvatarCard
                        key={`selected-${avatarId}`}
                        data={avatarData}
                        showRemoveHover={true}
                        onClick={() => {
                          const newLineup = (extraData?.theory_craft?.custom_lineup || []).filter(id => id !== avatarId);
                          setExtraData({
                            ...extraData,
                            theory_craft: {
                              stage_id: extraData?.theory_craft?.stage_id ?? 30118121,
                              cycle_count: extraData?.theory_craft?.cycle_count ?? 1,
                              mode: extraData?.theory_craft?.mode ?? false,
                              hp: extraData?.theory_craft?.hp ?? {},
                              custom_lineup: newLineup
                            }
                          });
                        }}
                      />
                    );
                  })}

                  <button
                    className="btn btn-outline btn-square border-dashed w-14 h-14 sm:w-16 sm:h-16 rounded-xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSearchLineup(pre => !pre);
                    }}
                  >
                    +
                  </button>
                </div>

                {showSearchLineup && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 w-full z-50 bg-base-100 border border-base-content/15 rounded-2xl p-4 shadow-2xl space-y-3"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-base-content/10">
                      <span className="font-bold text-xs">{transI18n("selectedCharacters")}</span>
                      <button className="btn btn-xs btn-circle btn-ghost" onClick={() => setShowSearchLineup(false)}>✕</button>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1">
                      {Object.values(mapAvatar).map((avatar) => {
                        const currentLineup = extraData?.theory_craft?.custom_lineup || [];
                        const isSelected = currentLineup.includes(avatar.ID.toString());

                        return (
                          <SimpleAvatarCard
                            key={avatar.ID}
                            data={avatar}
                            isSelected={isSelected}
                            onClick={() => {
                              const idStr = avatar.ID.toString();
                              let newLineup = [...currentLineup];

                              if (isSelected) {
                                newLineup = newLineup.filter(id => id !== idStr);
                              } else {
                                newLineup.push(idStr);
                              }

                              setExtraData({
                                ...extraData,
                                theory_craft: {
                                  stage_id: extraData?.theory_craft?.stage_id ?? 30118121,
                                  cycle_count: extraData?.theory_craft?.cycle_count ?? 1,
                                  mode: extraData?.theory_craft?.mode ?? false,
                                  hp: extraData?.theory_craft?.hp ?? {},
                                  custom_lineup: newLineup
                                }
                              });
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MULTIPATH CHAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-base-200/60 border border-white/10 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-base-content/10">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
              {transI18n("multipathCharacter")}
            </h3>
            <div className="tooltip tooltip-bottom tooltip-info" data-tip={transI18n("detailMultipathCharacter")}>
              <Info className="text-primary w-4 h-4 cursor-pointer" />
            </div>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={isEnableChangePath}
            onChange={(e) => setIsEnableChangePath(e.target.checked)}
          />
        </div>

        {isEnableChangePath && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-base-100/60 border border-white/5 space-y-2">
              <div className="flex items-center gap-2">
                <User className="text-warning w-4 h-4" />
                <span className="text-xs font-semibold">{transI18n("mainPath")}</span>
              </div>
              <SelectCustomImage
                customSet={Object.values(mapAvatar).filter((it) => extraData?.multi_path?.multi_path_main?.includes(Number(it.ID))).map((it) => ({
                  value: it.ID.toString(),
                  label: getNameChar(locale, transI18n, it),
                  imageUrl: `${process.env.CDN_URL}/${baseType?.[it.BaseType]?.Icon}`
                }))}
                excludeSet={[]}
                selectedCustomSet={extraData?.multi_path?.main?.toString() || ""}
                placeholder={transI18n("selectAMainStat")}
                setSelectedCustomSet={(it) => {
                  if (!it) return
                  setExtraData({
                    ...extraData,
                    multi_path: {
                      march_7: extraData?.multi_path?.march_7 || 1001,
                      main: Number(it) || 8001,
                      multi_path_main: extraData?.multi_path?.multi_path_main || [],
                      multi_path_march_7: extraData?.multi_path?.multi_path_march_7 || []
                    },
                    lua: extraData?.lua || null
                  })
                }}
              />
            </div>

            <div className="p-3.5 rounded-xl bg-base-100/60 border border-white/5 space-y-2">
              <div className="flex items-center gap-2">
                <BowArrow className="text-info w-4 h-4" />
                <span className="text-xs font-semibold">{transI18n("march7Path")}</span>
              </div>
              <SelectCustomImage
                customSet={Object.values(mapAvatar).filter((it) => extraData?.multi_path?.multi_path_march_7?.includes(Number(it.ID))).map((it) => ({
                  value: it.ID.toString(),
                  label: getNameChar(locale, transI18n, it),
                  imageUrl: `${process.env.CDN_URL}/${baseType?.[it.BaseType]?.Icon}`
                }))}
                excludeSet={[]}
                selectedCustomSet={extraData?.multi_path?.march_7?.toString() || ""}
                placeholder={transI18n("selectAMainStat")}
                setSelectedCustomSet={(it) => {
                  if (!it) return
                  setExtraData({
                    ...extraData,
                    multi_path: {
                      march_7: Number(it) || 1001,
                      main: extraData?.multi_path?.main || 8001,
                      multi_path_main: extraData?.multi_path?.multi_path_main || [],
                      multi_path_march_7: extraData?.multi_path?.multi_path_march_7 || []
                    },
                    lua: extraData?.lua || null
                  })
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* CHALLENGE */}
      <div className="p-4 sm:p-5 rounded-2xl bg-base-200/60 border border-white/10 shadow-lg space-y-4">
        <div className="pb-2 border-b border-base-content/10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
            {transI18n("challenge")}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-base-100/60 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Swords className="text-error w-4 h-4" />
                <span className="text-xs font-semibold">{transI18n("anomalyArbitration")}</span>
              </div>
              <div className="tooltip tooltip-bottom tooltip-info" data-tip={transI18n("detailChallengePeak")}>
                <Info className="text-primary w-3.5 h-3.5 cursor-pointer" />
              </div>
            </div>
            <select
              value={extraData?.challenge?.challenge_peak_group_id || ""}
              className="select select-sm select-bordered w-full rounded-xl text-xs"
              onChange={(e) =>
                setExtraData({
                  ...extraData,
                  challenge: {
                    skip_node: extraData?.challenge?.skip_node || 0,
                    challenge_peak_group_id: parseInt(e.target.value) || 0,
                    challenge_peak_group_id_list: extraData?.challenge?.challenge_peak_group_id_list || []
                  },
                  lua: extraData?.lua || null
                })
              }
            >
              {Object.values(mapPeak).filter(event => extraData?.challenge?.challenge_peak_group_id_list?.includes(Number(event.ID))).map(event => (
                <option key={event.ID} value={event.ID}>
                  {getLocaleName(locale, event.Name)} ({event.ID})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3.5 rounded-xl bg-base-100/60 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SkipForward className="text-warning w-4 h-4" />
                <span className="text-xs font-semibold">{transI18n("skipNode")}</span>
              </div>
              <div className="tooltip tooltip-bottom tooltip-info" data-tip={transI18n("detailSkipNode")}>
                <Info className="text-primary w-3.5 h-3.5 cursor-pointer" />
              </div>
            </div>
            <select
              value={extraData?.challenge?.skip_node || "0"}
              className="select select-sm select-bordered w-full rounded-xl text-xs"
              onChange={(e) =>
                setExtraData({
                  ...extraData,
                  challenge: {
                    challenge_peak_group_id: extraData?.challenge?.challenge_peak_group_id || 0,
                    challenge_peak_group_id_list: extraData?.challenge?.challenge_peak_group_id_list || [],
                    skip_node: parseInt(e.target.value) || 0
                  },
                  lua: extraData?.lua || null
                })
              }
            >
              <option value="0">{transI18n("disableSkip")}</option>
              <option value="1">{transI18n("skipNode1")}</option>
              <option value="2">{transI18n("skipNode2")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* EXTRA FEATURES */}
      <div className="p-4 sm:p-5 rounded-2xl bg-base-200/60 border border-white/10 shadow-lg space-y-4">
        <div className="pb-2 border-b border-base-content/10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
            {transI18n("extraFeatures")}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {extraData?.setting?.hide_ui !== undefined && (
            <div className="p-3.5 rounded-xl bg-base-100/60 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {extraData?.setting?.hide_ui
                  ? <EyeOff className="text-warning w-4 h-4" />
                  : <Eye className="text-success w-4 h-4" />
                }
                <span className="text-xs font-semibold">{transI18n("hideUI")}</span>
                <div className="tooltip tooltip-bottom tooltip-info" data-tip={transI18n("detailHiddenUi")}>
                  <Info className="text-primary w-3.5 h-3.5 cursor-pointer" />
                </div>
              </div>

              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={extraData?.setting?.hide_ui}
                onChange={(e) =>
                  setExtraData({
                    ...extraData,
                    setting: {
                      hide_ui: e.target.checked,
                      censorship: extraData?.setting?.censorship || false,
                      cm: extraData?.setting?.cm || false,
                      first_person: extraData?.setting?.first_person || false
                    }
                  })
                }
              />
            </div>
          )}

          {extraData?.setting?.censorship !== undefined && (
            <div className="p-3.5 rounded-xl bg-base-100/60 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldBan className="text-error w-4 h-4" />
                <span className="text-xs font-semibold">{transI18n("disableCensorship")}</span>
                <div className="tooltip tooltip-bottom tooltip-info" data-tip={transI18n("detailDisableCensorship")}>
                  <Info className="text-primary w-3.5 h-3.5 cursor-pointer" />
                </div>
              </div>

              <input
                type="checkbox"
                className="toggle toggle-accent toggle-sm"
                checked={extraData?.setting?.censorship}
                onChange={(e) =>
                  setExtraData({
                    ...extraData,
                    setting: {
                      censorship: e.target.checked,
                      hide_ui: extraData?.setting?.hide_ui || false,
                      cm: extraData?.setting?.cm || false,
                      first_person: extraData?.setting?.first_person || false
                    }
                  })
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* LUA EDITOR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-base-200/60 border border-white/10 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-base-content/10">
          <div className="flex items-center gap-2">
            <CupSoda className="text-primary w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Lua Scripting</h3>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={isEnableLua}
            onChange={(e) => setIsEnableLua(e.target.checked)}
          />
        </div>

        {isEnableLua && (
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-inner">
            <Editor
              value={extraData?.lua || ""}
              onValueChange={(code) =>
                setExtraData({
                  ...extraData,
                  lua: code
                })
              }
              highlight={(code) => Prism.highlight(code, Prism.languages.lua, "lua")}
              padding={16}
              textareaClassName="outline-none font-mono"
              className="text-xs font-mono min-h-60 bg-[#161822] text-white"
              style={{
                background: "#161822",
                color: "#e2e8f0",
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
