/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useCallback, useEffect, useMemo } from "react";
import RelicMaker from "../relicBar";
import useUserDataStore from "@/stores/userDataStore";
import { useTranslations } from "next-intl";
import RelicCard from "../card/relicCard";
import useModelStore from '@/stores/modelStore';
import { replaceByParam } from '@/helper';
import useRelicMakerStore from '@/stores/relicMakerStore';
import QuickView from "../quickView";
import { ModalConfig } from "@/types";
import useCurrentDataStore from "@/stores/currentDataStore";
import useDetailDataStore from "@/stores/detailDataStore";
import { getLocaleName } from '@/helper';
import useLocaleStore from "@/stores/localeStore";
import { useShallow } from 'zustand/react/shallow';

export default function RelicsInfo() {
  const { avatars, setAvatar } = useUserDataStore(
    useShallow((state) => ({
      avatars: state.avatars,
      setAvatar: state.setAvatar,
    }))
  )
  const {
    setSelectedRelicSlot,
    selectedRelicSlot,
    setSelectedMainStat,
    setSelectedRelicSet,
    setSelectedRelicLevel,
    setListSelectedSubStats,
    resetHistory,
    resetSubStat,
    listSelectedSubStats,
  } = useRelicMakerStore(
    useShallow((state) => ({
      setSelectedRelicSlot: state.setSelectedRelicSlot,
      selectedRelicSlot: state.selectedRelicSlot,
      setSelectedMainStat: state.setSelectedMainStat,
      setSelectedRelicSet: state.setSelectedRelicSet,
      setSelectedRelicLevel: state.setSelectedRelicLevel,
      setListSelectedSubStats: state.setListSelectedSubStats,
      resetHistory: state.resetHistory,
      resetSubStat: state.resetSubStat,
      listSelectedSubStats: state.listSelectedSubStats,
    }))
  )

  const {
    isOpenRelic,
    setIsOpenRelic,
    isOpenQuickView,
    setIsOpenQuickView
  } = useModelStore(
    useShallow((state) => ({
      isOpenRelic: state.isOpenRelic,
      setIsOpenRelic: state.setIsOpenRelic,
      isOpenQuickView: state.isOpenQuickView,
      setIsOpenQuickView: state.setIsOpenQuickView,
    }))
  )
  const transI18n = useTranslations("DataPage")
  const { avatarSelected } = useCurrentDataStore(
    useShallow((state) => ({
      avatarSelected: state.avatarSelected,
    }))
  )
  const { mapRelicSet, subAffix } = useDetailDataStore(
    useShallow((state) => ({
      mapRelicSet: state.mapRelicSet,
      subAffix: state.subAffix,
    }))
  )
  const { locale } = useLocaleStore(
    useShallow((state) => ({
      locale: state.locale,
    }))
  )

  const handleShow = (modalId: string) => {
    const modal = document.getElementById(modalId) as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    }
  };

  // Close modal handler
  const handleCloseModal = (modalId: string) => {
    const modal = document.getElementById(modalId) as HTMLDialogElement | null;
    if (modal) {
      modal.close();
    }
  };


  const getRelic = useCallback((slot: string) => {
    const avatar = avatars[avatarSelected?.ID.toString() || ""];
    if (avatar) {
      const profile = avatar.profileList?.[avatar.profileSelect] ?? avatar.profileList?.[0];
      return profile?.relics?.[slot] || null;
    }
    return null;
  }, [avatars, avatarSelected]);

  const handlerDeleteRelic = (slot: string) => {
    const avatarKey = avatarSelected?.ID.toString() || "";
    const avatar = avatars[avatarKey];
    if (avatar) {
      const profileIndex = avatar.profileSelect;
      const currentProfile = avatar.profileList?.[profileIndex];
      if (currentProfile) {
        const newRelics = { ...currentProfile.relics };
        delete newRelics[slot];
        const newProfileList = [...avatar.profileList];
        newProfileList[profileIndex] = {
          ...currentProfile,
          relics: newRelics,
        };
        setAvatar({
          ...avatar,
          profileList: newProfileList,
        });
      }
    }
  };

  const handlerChangeRelic = (slot: string) => {
    const relic = getRelic(slot)
    setSelectedRelicSlot(slot)
    resetSubStat()
    resetHistory(null)
    if (relic) {
      setSelectedMainStat(relic.main_affix_id.toString())
      setSelectedRelicSet(relic.relic_set_id.toString())
      setSelectedRelicLevel(relic.level)
      const newSubAffixes: { affixId: string, property: string, rollCount: number, stepCount: number }[] = [...listSelectedSubStats];
      relic.sub_affixes.forEach((item, index) => {
        if (newSubAffixes[index]) {
          newSubAffixes[index].affixId = item.sub_affix_id.toString();
          newSubAffixes[index].property = subAffix["5"]?.[item.sub_affix_id.toString()]?.Property || "";
          newSubAffixes[index].rollCount = item.count || 0;
          newSubAffixes[index].stepCount = item.step || 0;
        }
      })
      setListSelectedSubStats(newSubAffixes)
    } else {
      setSelectedMainStat("")
      setSelectedRelicSet("")
      setSelectedRelicLevel(15)
      const newSubAffixes: { affixId: string, property: string, rollCount: number, stepCount: number }[] = [...listSelectedSubStats];
      newSubAffixes.forEach((item) => {
        item.affixId = ""
        item.property = ""
        item.rollCount = 0
        item.stepCount = 0
      })

      setListSelectedSubStats(newSubAffixes)
    }
    setIsOpenRelic(true)
    handleShow("action_detail_modal")
  }

  const relicEffects = useMemo(() => {
    const avatar = avatars[avatarSelected?.ID.toString() || ""];
    const relicCount: { [key: string]: number } = {};
    const currentProfile = avatar?.profileList?.[avatar?.profileSelect] ?? avatar?.profileList?.[0];
    if (currentProfile?.relics) {
      for (const relic of Object.values(currentProfile.relics)) {
        if (relic) {
          relicCount[relic.relic_set_id] = (relicCount[relic.relic_set_id] || 0) + 1;
        }
      }
    }
    const listEffects: { key: string, count: number }[] = [];
    Object.entries(relicCount).forEach(([key, value]) => {
      if (value >= 2) {
        listEffects.push({ key: key, count: value });
      }
    });
    return listEffects;
  }, [avatars, avatarSelected]);

  const modalConfigs: ModalConfig[] = [
    {
      id: "action_detail_modal",
      title: transI18n("changeRelic") || "Cài đặt di vật",
      isOpen: isOpenRelic,
      onClose: () => {
        setIsOpenRelic(false)
        handleCloseModal("action_detail_modal")
      },
      content: <RelicMaker />
    },
    {
      id: "quick_view_modal",
      title: transI18n("quickView").toUpperCase(),
      isOpen: isOpenQuickView,
      onClose: () => {
        setIsOpenQuickView(false)
        handleCloseModal("quick_view_modal")
      },
      content: <QuickView />
    }
  ]

  // Handle ESC key to close modal
  useEffect(() => {
    for (const item of modalConfigs) {
      if (!item?.isOpen) {
        handleCloseModal(item?.id || "")
      }
    }
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        for (const item of modalConfigs) {
          handleCloseModal(item?.id || "")
        }
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpenRelic]);

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Section - Relic Equipment Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-2xl p-4 sm:p-6 border border-base-content/10 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-base-content/10">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2.5">
                <div className="w-1.5 h-5 bg-linear-to-b from-primary to-accent rounded-full"></div>
                <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-accent font-bold tracking-tight">
                  {transI18n("relics")}
                </span>
              </h2>

              <button
                onClick={() => {
                  setIsOpenQuickView(true)
                  handleShow("quick_view_modal")
                }}
                className="btn btn-sm btn-outline btn-primary rounded-xl font-bold shadow-xs"
              >
                {transI18n("quickView")}
              </button>
            </div>

            {/* 6-Slot Grid completely free of box-in-box */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-4">
              {["1", "2", "3", "4", "5", "6"].map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    if (item === selectedRelicSlot) {
                      setSelectedRelicSlot("")
                    } else {
                      setSelectedRelicSlot(item)
                    }
                    handlerChangeRelic(item)
                  }}
                  className={`relative group flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 cursor-pointer ${
                    item === selectedRelicSlot
                      ? "bg-primary/5 rounded-2xl ring-1.5 ring-primary/40"
                      : "hover:bg-base-content/5"
                  }`}
                >
                  <RelicCard
                    slot={item}
                    avatarId={avatarSelected?.ID.toString() || ""}
                  />

                  {/* Micro Actions */}
                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlerChangeRelic(item)
                      }}
                      className="btn btn-xs btn-circle btn-primary shadow-xs"
                      title={transI18n("changeRelic")}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M4 20h4l10.293-10.293a1 1 0 000-1.414l-2.586-2.586a1 1 0 00-1.414 0L4 16v4z" />
                      </svg>
                    </button>

                    {getRelic(item) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (window.confirm(`${transI18n("deleteRelicConfirm")} ${item}?`)) {
                            handlerDeleteRelic(item)
                          }
                        }}
                        className="btn btn-xs btn-circle btn-error shadow-xs"
                        title={transI18n("deleteRelic")}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3m5 0H4" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions Bar */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                disabled={!selectedRelicSlot}
                onClick={() => handlerChangeRelic(selectedRelicSlot)}
                className="btn btn-primary btn-sm rounded-xl font-bold shadow-xs"
              >
                {transI18n("changeRelic")}
              </button>
              <button
                disabled={!selectedRelicSlot}
                onClick={(e) => {
                  e.stopPropagation()
                  if (window.confirm(`${transI18n("deleteRelicConfirm")} ${selectedRelicSlot}?`)) {
                    handlerDeleteRelic(selectedRelicSlot)
                  }
                }}
                className="btn btn-ghost btn-sm text-error hover:bg-error/20 rounded-xl"
              >
                {transI18n("deleteRelic")}
              </button>
            </div>
          </div>
        </div>

        {/* Right Section - Set Effects Showcase */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-4 sm:p-6 border border-base-content/10 shadow-xs space-y-4">
            <div className="pb-3 border-b border-base-content/10">
              <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2.5">
                <div className="w-1.5 h-5 bg-linear-to-b from-amber-400 to-amber-600 rounded-full"></div>
                <span className="bg-clip-text text-transparent bg-linear-to-r from-amber-400 to-amber-600 font-bold tracking-tight">
                  {transI18n("setEffects")}
                </span>
              </h3>
            </div>

            {relicEffects.length > 0 ? (
              <div className="divide-y divide-base-content/10">
                {relicEffects.map((setEffect, index) => {
                  const relicInfo = mapRelicSet[setEffect.key];
                  if (!relicInfo) return null;
                  return (
                    <div key={index} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div
                          className="font-bold text-sm text-amber-500"
                          dangerouslySetInnerHTML={{
                            __html: replaceByParam(
                              getLocaleName(locale, relicInfo.Name),
                              []
                            )
                          }}
                        />
                        {setEffect.count && (
                          <span className="badge badge-primary badge-sm font-mono font-bold">
                            {setEffect.count} Pc
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 pt-1">
                        {Object.entries(relicInfo.Skills).map(([requireNum, value]) => {
                          if (Number(requireNum) > Number(setEffect.count)) return null;
                          return (
                            <div key={requireNum} className="text-xs space-y-0.5 pl-2 border-l-2 border-primary/40">
                              <div className="font-bold text-emerald-500">
                                {requireNum}-PC Bonus
                              </div>
                              <div
                                className="text-base-content/80 leading-relaxed"
                                dangerouslySetInnerHTML={{
                                  __html: replaceByParam(
                                    getLocaleName(locale, value.Desc),
                                    value.Param || []
                                  )
                                }}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-base-content/40 text-xs italic">
                {transI18n("noRelicEquipped")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {modalConfigs.map(({ id, title, onClose, content }) => (
        <dialog key={id} id={id} className="modal">
          <div className={`modal-box ${id === 'quick_view_modal' ? 'w-11/12 max-w-4xl' : 'w-11/12 max-w-[92vw] sm:max-w-[88vw]'} max-h-[90vh] bg-base-100 text-base-content border border-base-content/10 shadow-2xl rounded-2xl p-0 overflow-hidden`}>
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-base-content/10 bg-base-100">
              <h3 className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary via-accent to-secondary">
                {title}
              </h3>
              <button
                className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                onClick={onClose}
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
              {content}
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={onClose}>close</button>
          </form>
        </dialog>
      ))}
    </div>
  );
}
