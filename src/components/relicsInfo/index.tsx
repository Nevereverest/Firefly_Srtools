"use client";
import MountOnOpen from "../mountOnOpen";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import useUserDataStore from "@/stores/userDataStore";
import { useTranslations } from "next-intl";
import RelicCard, { slotIconMap } from "../card/relicCard";
import useModelStore from '@/stores/modelStore';
import { replaceByParam } from '@/helper';
import useRelicMakerStore from '@/stores/relicMakerStore';
import { ModalConfig } from "@/types";
import useCurrentDataStore from "@/stores/currentDataStore";
import useDetailDataStore from "@/stores/detailDataStore";
import { getLocaleName } from '@/helper';
import useLocaleStore from "@/stores/localeStore";
import { useShallow } from 'zustand/react/shallow';
import { Trash2, SlidersHorizontal } from "lucide-react";
import { toast } from "react-toastify";

import ModalLoading from "../modalLoading";

const RelicMaker = dynamic(() => import("../relicBar"), {
  ssr: false,
  loading: () => <ModalLoading message="Loading Relic Creator..." />
});

export default function RelicsInfo() {

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
    setIsOpenQuickView
  } = useModelStore(
    useShallow((state) => ({
      isOpenRelic: state.isOpenRelic,
      setIsOpenRelic: state.setIsOpenRelic,
      setIsOpenQuickView: state.setIsOpenQuickView,
    }))
  )
  const transI18n = useTranslations("DataPage")

  const getSlotName = (slot: string) => {
    const slotKey = slotIconMap[slot]?.key;
    return slotKey && transI18n.has(slotKey) ? transI18n(slotKey) : slot;
  };
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

  const userAvatar = useUserDataStore(state => state.avatars[avatarSelected?.ID ?? ""])
  const setAvatar = useUserDataStore(state => state.setAvatar)

  const [relicSlotToDelete, setRelicSlotToDelete] = useState<string | null>(null);

  const handleShow = (modalId: string) => {
    const modal = document.getElementById(modalId) as HTMLDialogElement | null;
    if (modal) {
      modal.classList.add("modal-open");
      modal.setAttribute("open", "true");
    }
  };

  const handleCloseModal = (modalId: string) => {
    const modal = document.getElementById(modalId) as HTMLDialogElement | null;
    if (modal) {
      modal.classList.remove("modal-open");
      modal.removeAttribute("open");
    }
  };


  const getRelic = useCallback((slot: string) => {
    const avatar = userAvatar;
    if (avatar) {
      const profile = avatar.profileList?.[avatar.profileSelect] ?? avatar.profileList?.[0];
      return profile?.relics?.[slot] || null;
    }
    return null;
  }, [userAvatar]);

  const handlerDeleteRelic = (slot: string) => {
    const avatar = userAvatar;
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

  const requestDeleteRelic = (slot: string) => {
    setRelicSlotToDelete(slot);
    handleShow("delete_relic_confirm_modal");
  };

  const handleConfirmDelete = () => {
    if (relicSlotToDelete) {
      handlerDeleteRelic(relicSlotToDelete);
      toast.success(transI18n("relicDeletedSuccessfully"));
      handleCloseModal("delete_relic_confirm_modal");
      setRelicSlotToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    handleCloseModal("delete_relic_confirm_modal");
    setRelicSlotToDelete(null);
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
  }

  const relicEffects = useMemo(() => {
    const avatar = userAvatar;
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
  }, [userAvatar]);

  const modalConfigs: ModalConfig[] = [
    {
      id: "action_detail_modal",
      title: transI18n("changeRelic"),
      isOpen: isOpenRelic,
      onClose: () => {
        setIsOpenRelic(false);
      },
      content: <RelicMaker />
    }
  ];

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isOpenRelic) setIsOpenRelic(false);
        if (relicSlotToDelete) setRelicSlotToDelete(null);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpenRelic, relicSlotToDelete, setIsOpenRelic]);

  useEffect(() => {
    if (!selectedRelicSlot) {
      setSelectedRelicSlot("1");
    }
  }, [selectedRelicSlot, setSelectedRelicSlot]);

  const selectedRelic = selectedRelicSlot ? getRelic(selectedRelicSlot) : null;
  const isSelectedRelicEquipped = Boolean(selectedRelic);

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
                type="button"
                onClick={() => {
                  setIsOpenQuickView(true);
                }}
                className="btn btn-sm btn-outline btn-primary rounded-xl font-bold shadow-xs cursor-pointer"
              >
                {transI18n("quickView")}
              </button>
            </div>

            {/* 6-Slot Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {["1", "2", "3", "4", "5", "6"].map((item, index) => (
                <div
                  key={index}
                  onClick={() => handlerChangeRelic(item)}
                  className={`group relative rounded-xl transition-all duration-200 cursor-pointer ${selectedRelicSlot === item
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-base-100 shadow-md"
                    : "hover:ring-1 hover:ring-base-content/20"
                    }`}
                >
                  <RelicCard
                    slot={item}
                    avatarId={avatarSelected?.ID.toString() || ""}
                  />

                  {/* Micro Actions */}
                  <div className="absolute top-1.5 right-1.5 flex gap-1 z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlerChangeRelic(item);
                      }}
                      className="w-6 h-6 rounded-lg bg-primary text-primary-content shadow-xs hover:scale-110 active:scale-95 transition-all hidden sm:flex items-center justify-center border border-white/20 cursor-pointer opacity-0 group-hover:opacity-100"
                      title={transI18n("changeRelic")}
                    >
                      <SlidersHorizontal className="w-3 h-3 stroke-[2.2]" />
                    </button>

                    {getRelic(item) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          requestDeleteRelic(item);
                        }}
                        className="w-7 h-7 sm:w-6 sm:h-6 rounded-lg bg-rose-500 text-white shadow-xs hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-white/20 cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100 [@media(hover:none)]:opacity-95"
                        title={transI18n("deleteRelic")}
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-3 sm:h-3 stroke-[2.2]" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions Bar */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={!selectedRelicSlot}
                onClick={() => handlerChangeRelic(selectedRelicSlot)}
                className="btn btn-primary btn-sm rounded-xl font-bold gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{transI18n("changeRelic")}</span>
              </button>

              <button
                type="button"
                disabled={!selectedRelicSlot || !isSelectedRelicEquipped}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedRelicSlot) {
                    requestDeleteRelic(selectedRelicSlot);
                  }
                }}
                className="btn btn-outline btn-error hover:btn-error btn-sm rounded-xl font-bold gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                <Trash2 className="w-4 h-4" />
                <span>{transI18n("deleteRelic")}</span>
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
                                {transI18n("pieceBonus", { count: requireNum })}
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
      {modalConfigs.map(({ id, title, isOpen, onClose, content }) => (
        <dialog key={id} id={id} className={`modal ${isOpen ? "modal-open" : ""}`} open={isOpen}>
          <div className="modal-box w-11/12 max-w-[94vw] xl:max-w-340 max-h-[90vh] my-auto flex flex-col bg-base-100 text-base-content border border-base-content/10 shadow-2xl rounded-2xl p-0 overflow-hidden">
            <div className="sticky top-0 z-20 flex items-center justify-between px-3.5 sm:px-6 py-2 sm:py-2.5 border-b border-base-content/10 bg-base-100 shrink-0">
              <h3 className="font-bold text-base sm:text-xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary via-accent to-secondary">
                {title}
              </h3>
              <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors cursor-pointer"
                onClick={onClose}
              >
                ✕
              </button>
            </div>

            <div className="p-2 sm:p-3.5 overflow-y-auto flex-1">
              <MountOnOpen open={isOpen}>{content}</MountOnOpen>
            </div>
          </div>
          <div className="modal-backdrop bg-black/60 cursor-pointer" onClick={onClose} />
        </dialog>
      ))}

      {/* Delete Relic Confirmation Modal */}
      <dialog id="delete_relic_confirm_modal" className={`modal modal-bottom sm:modal-middle ${relicSlotToDelete ? "modal-open" : ""}`} open={Boolean(relicSlotToDelete)}>
        <div className="modal-box max-w-md bg-base-100/95 border border-white/10 shadow-2xl rounded-2xl p-6 overflow-hidden relative">
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-rose-500/15 rounded-full" />

          <div className="relative z-10 text-center space-y-4">
            {/* Rose Icon Badge */}
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(244,63,94,0.2)]">
              <Trash2 className="w-6 h-6 stroke-[1.75]" />
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h3 className="font-black text-lg text-base-content tracking-tight">
                {transI18n("deleteRelic")}
              </h3>
              <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed">
                {transI18n("deleteRelicConfirm")}{" "}
                <span className="font-bold text-amber-400 capitalize font-mono">
                  {relicSlotToDelete ? getSlotName(relicSlotToDelete) : ""}
                </span>
                ?
              </p>
            </div>

            {/* Relic Preview Card (if relic exists) */}
            {relicSlotToDelete && getRelic(relicSlotToDelete) && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-base-200/70 border border-white/10 text-left">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-base-300/60 border border-amber-500/30 shrink-0">
                  <Image
                    src={`${process.env.CDN_URL}/spriteoutput/relicfigures/IconRelic_${getRelic(relicSlotToDelete)?.relic_set_id}_${relicSlotToDelete}.png`}
                    alt={transI18n("relic")}
                    unoptimized
                    width={36}
                    height={36}
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-base-content truncate">
                    {getLocaleName(locale, mapRelicSet[getRelic(relicSlotToDelete)?.relic_set_id || ""]?.Name)}
                  </p>
                  <p className="text-[11px] text-base-content/60 font-mono">
                    +{getRelic(relicSlotToDelete)?.level} &bull; <span>{relicSlotToDelete ? getSlotName(relicSlotToDelete) : ""}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="flex-1 h-10 px-4 rounded-xl font-bold text-xs sm:text-sm bg-base-200 hover:bg-base-300 text-base-content/80 hover:text-base-content border border-white/10 transition-all cursor-pointer"
              >
                {transI18n("cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 h-10 px-4 rounded-xl font-bold text-xs sm:text-sm bg-linear-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-md shadow-rose-500/25 hover:shadow-rose-500/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{transI18n("confirmDelete")}</span>
              </button>
            </div>
          </div>
        </div>
        <div className="modal-backdrop bg-black/60 cursor-pointer" onClick={handleCancelDelete} />
      </dialog>
    </div>
  );
}
