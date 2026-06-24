'use client'
import { motion } from "framer-motion"
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

export default function ExtraSettingBar() {
  const { extraData, setExtraData, isEnableChangePath, setIsEnableChangePath, isEnableLua, setIsEnableLua } = useGlobalStore()
  const transI18n = useTranslations("DataPage")
  const { mapAvatar, mapPeak, stage, baseType } = useDetailDataStore()
  const { locale } = useLocaleStore()
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
    <div className="px-4 sm:px-6 py-4 space-y-8">
      {extraData?.theory_craft && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            {transI18n("theoryCraft")}
            <div className="tooltip tooltip-info tooltip-bottom" data-tip={transI18n("detailTheoryCraft")}>
              <Info className="text-primary" size={20} />
            </div>
          </h3>

          <motion.div className="form-control bg-base-200 p-4 rounded-xl shadow">
            <label className="flex flex-wrap items-center cursor-pointer justify-start gap-3">
              <Hammer className="text-primary" size={20} />
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
                }

                }
              />
              <span className="label-text font-semibold">{transI18n("theoryCraftMode")}</span>
            </label>
          </motion.div>

          {extraData?.theory_craft?.mode && (
            <>
              <motion.div className="form-control bg-base-200 p-4 rounded-xl shadow">
                <label className="flex flex-wrap items-center justify-start gap-3">
                  <RefreshCw className="text-info" size={20} />
                  <span className="label-text font-semibold">{transI18n("cycleCount")}</span>
                  <input
                    type="number"
                    className="input input-primary"
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
                </label>
              </motion.div>

              <motion.div className="form-control bg-base-200 p-4 rounded-xl shadow">
                <label className="flex flex-wrap items-center justify-start gap-3">
                  <RouteIcon className="text-info" size={20} />
                  <span className="label-text font-semibold">{transI18n("stage")}</span>
                  <div className="relative">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="btn btn-outline w-full text-left flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!isChildClick) {
                            setShowSearchStage(pre => !pre)
                          }
                          setIsChildClick(false)
                        }}
                      >
                        <Search className="w-6 h-6" />
                        <span className="text-left"> {transI18n("stage")}: {getLocaleName(locale, stageList.find((s) => s.ID.toString() === extraData?.theory_craft?.stage_id?.toString())?.Name) || transI18n("selectStage")}</span>
                      </button>
                    </div>
                    {showSearchStage && (
                      <div onClick={(e) => e.stopPropagation()} className="absolute top-full mt-2 w-full z-50 border bg-base-200 border-slate-600 rounded-lg p-4 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">

                          <label className="input w-full">
                            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <g
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                strokeWidth="2.5"
                                fill="none"
                                stroke="currentColor"
                              >
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                              </g>
                            </svg>
                            <input
                              type="search" className="grow"
                              placeholder={transI18n("searchStage")}
                              value={stageSearchTerm}
                              onChange={(e) => onChangeSearch(e.target.value)}
                              autoFocus
                            />

                          </label>
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-1">
                          {paginatedStages.length > 0 ? (
                            <>
                              {paginatedStages.map((stage) => (
                                <div
                                  key={stage.ID}
                                  className="p-2 hover:bg-primary/20 rounded cursor-pointer"
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
                              ))}


                            </>
                          ) : (
                            <div className="text-sm text-center py-4">{transI18n("noStageFound")}</div>
                          )}
                        </div>
                        {paginatedStages.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <button
                              disabled={stagePage === 1}
                              className="btn btn-sm btn-outline btn-success mt-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                setStagePage(stagePage - 1)
                              }}
                            >
                              {transI18n("previous")}
                            </button>

                            <button
                              disabled={!hasMorePages}
                              className="btn btn-sm btn-outline btn-success mt-2"
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
                </label>
              </motion.div>
              <motion.div className="form-control bg-base-200 p-4 rounded-xl shadow relative">
                <div className="flex flex-col gap-3">
                  <label className="flex flex-wrap items-center justify-start gap-3">
                    <UsersIcon className="text-info" size={20} />
                    <span className="label-text font-semibold">{transI18n("customLineup")}</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2 min-h-20 p-2 bg-base-300 rounded-lg border border-base-content/10">
                    {(extraData?.theory_craft?.custom_lineup || []).length > 0 && (
                      (extraData?.theory_craft?.custom_lineup || []).map((avatarId) => {
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
                      })
                    )}

                    <button
                      className="btn btn-outline btn-square border-dashed w-16 h-16 sm:w-20 sm:h-20"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSearchLineup(pre => !pre);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>

                  {showSearchLineup && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 w-full z-50 border bg-base-200 border-slate-600 rounded-lg p-4 shadow-2xl"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-sm">{transI18n("selectedCharacters")}</span>
                        <button className="btn btn-sm btn-circle btn-error" onClick={() => setShowSearchLineup(false)}>X</button>
                      </div>

                      <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto p-1">
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
              </motion.div>
            </>
          )}
        </div>
      )}

      {/*MULTIPATH CHAR */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          {transI18n("multipathCharacter")}
          <div className="tooltip tooltip-info tooltip-bottom" data-tip={transI18n("detailMultipathCharacter")}>
            <Info className="text-primary" size={20} />
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={isEnableChangePath}
            onChange={(e) => setIsEnableChangePath(e.target.checked)}
          />
        </h3>
        {isEnableChangePath && (
          <>
            <motion.div className="form-control bg-base-200 p-4 rounded-xl shadow">
              <label className="flex items-center gap-3">
                <User className="text-warning" size={20} />
                <span className="label-text font-semibold">{transI18n("mainPath")}</span>
                <SelectCustomImage
                  customSet={Object.values(mapAvatar).filter((it) => extraData?.multi_path?.multi_path_main?.includes(Number(it.ID))).map((it) => ({
                    value: it.ID.toString(),
                    label: getNameChar(locale, transI18n, it),
                    imageUrl: `${process.env.CDN_URL}/${baseType?.[it.BaseType].Icon}`
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

              </label>
            </motion.div>

            <motion.div className="form-control bg-base-200 p-4 rounded-xl shadow">
              <label className="flex items-center gap-3">
                <BowArrow className="text-info" size={20} />
                <span className="label-text font-semibold">{transI18n("march7Path")}</span>
                <SelectCustomImage
                  customSet={Object.values(mapAvatar).filter((it) => extraData?.multi_path?.multi_path_march_7?.includes(Number(it.ID))).map((it) => ({
                    value: it.ID.toString(),
                    label: getNameChar(locale, transI18n, it),
                    imageUrl: `${process.env.CDN_URL}/${baseType?.[it.BaseType].Icon}`
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
              </label>
            </motion.div>
          </>
        )}
      </div>

      {/* CHALLENGE */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">{transI18n("challenge")}</h3>

        <motion.div className="form-control bg-base-200 p-4 rounded-xl shadow">
          <label className="flex items-center gap-3">
            <Swords className="text-error" size={20} />
            <span className="label-text font-semibold">{transI18n("anomalyArbitration")}</span>
            <div className="tooltip tooltip-info tooltip-bottom" data-tip={transI18n("detailChallengePeak")}>
              <Info className="text-primary" size={20} />
            </div>
            <select
              value={extraData?.challenge?.challenge_peak_group_id || ""}
              className="select select-error"
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
          </label>
        </motion.div>

        <motion.div className="form-control bg-base-200 p-4 rounded-xl shadow">
          <label className="flex items-center gap-3">
            <SkipForward className="text-warning" size={20} />
            <span className="label-text font-semibold">{transI18n("skipNode")}</span>
            <div className="tooltip tooltip-info tooltip-bottom" data-tip={transI18n("detailSkipNode")}>
              <Info className="text-primary" size={20} />
            </div>
            <select
              value={extraData?.challenge?.skip_node || "0"}
              className="select select-warning"
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
          </label>
        </motion.div>
      </div>

      {/*EXTRA FEATURES */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">{transI18n("extraFeatures")}</h3>

        {extraData?.setting?.hide_ui !== undefined && (
          <motion.div className="form-control bg-base-200 p-4 rounded-xl shadow">
            <label className="flex flex-wrap items-center cursor-pointer justify-start gap-3">
              {extraData?.setting?.hide_ui
                ? <EyeOff className="text-warning" size={20} />
                : <Eye className="text-success" size={20} />
              }

              <input
                type="checkbox"
                className="toggle toggle-secondary"
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
              <span className="label-text font-semibold">{transI18n("hideUI")}</span>
              <div className="tooltip tooltip-info tooltip-bottom" data-tip={transI18n("detailHiddenUi")}>
                <Info className="text-primary" size={20} />
              </div>
            </label>
          </motion.div>
        )}

        {extraData?.setting?.censorship !== undefined && (
          <motion.div className="form-control bg-base-200 p-4 rounded-xl shadow">
            <label className="flex flex-wrap items-center cursor-pointer justify-start gap-3">
              <ShieldBan className="text-error" size={20} />
              <input
                type="checkbox"
                className="toggle toggle-accent"
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
              <span className="label-text font-semibold">{transI18n("disableCensorship")}</span>
              <div className="tooltip tooltip-info tooltip-bottom" data-tip={transI18n("detailDisableCensorship")}>
                <Info className="text-primary" size={20} />
              </div>
            </label>
          </motion.div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          {"Lua"}
          <div className="tooltip tooltip-info tooltip-bottom">
            <CupSoda className="text-primary" size={20} />
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={isEnableLua}
            onChange={(e) => setIsEnableLua(e.target.checked)}
          />
        </h3>
        {isEnableLua && (
          <>
            <div className="form-control bg-base-200 p-4 rounded-xl shadow">
              <label className="label">
                <span className="label-text">Lua Script</span>
              </label>

              <div className="rounded-xl overflow-hidden border border-base-300">
                <Editor
                  value={extraData?.lua || ""}
                  onValueChange={(code) =>
                    setExtraData(
                      {
                        ...extraData,
                        lua: code
                      }
                    )
                  }
                  highlight={(code) => Prism.highlight(code, Prism.languages.lua, "lua")}
                  padding={16}
                  textareaClassName="outline-none"
                  className="text-sm font-mono min-h-75"
                  style={{
                    background: "#1e1e1e",
                    color: "#fff",
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  )
}
