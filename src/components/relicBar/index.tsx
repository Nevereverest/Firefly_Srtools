"use client";
import useUserDataStore from '@/stores/userDataStore';
import { useEffect, useMemo, useState } from 'react';
import SelectCustomImage from '../select/customSelectImage';
import { calcAffixBonus, calcMainAffixBonus, randomPartition, randomStep, replaceByParam, getLocaleName } from '@/helper';
import { mappingStats } from '@/constant/constant';
import useModelStore from '@/stores/modelStore';
import useRelicMakerStore from '@/stores/relicMakerStore';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl'
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import useDetailDataStore from '@/stores/detailDataStore';
import useCurrentDataStore from '@/stores/currentDataStore';
import { RelicSetDetail, SubAffixData } from '@/types';
import useLocaleStore from '@/stores/localeStore';
import { mappingRelicSlot } from "@/constant/constant";
import { useShallow } from 'zustand/react/shallow';
import Image from "next/image";
import { slotIconMap } from '@/components/card/relicCard';

export default function RelicMaker() {
    const { avatars, setAvatar } = useUserDataStore(
        useShallow((state) => ({
            avatars: state.avatars,
            setAvatar: state.setAvatar,
        }))
    )
    const { avatarSelected } = useCurrentDataStore(
        useShallow((state) => ({
            avatarSelected: state.avatarSelected,
        }))
    )
    const { setIsOpenRelic } = useModelStore(
        useShallow((state) => ({
            setIsOpenRelic: state.setIsOpenRelic,
        }))
    )
    const { mainAffix, subAffix, mapRelicSet } = useDetailDataStore(
        useShallow((state) => ({
            mainAffix: state.mainAffix,
            subAffix: state.subAffix,
            mapRelicSet: state.mapRelicSet,
        }))
    )
    const { locale } = useLocaleStore(
        useShallow((state) => ({
            locale: state.locale,
        }))
    )
    const transI18n = useTranslations("DataPage")
    const {
        selectedRelicSlot,
        selectedRelicSet,
        selectedMainStat,
        listSelectedSubStats,
        selectedRelicLevel,
        preSelectedSubStats,
        setSelectedRelicSlot,
        setSelectedRelicSet,
        setSelectedMainStat,
        setSelectedRelicLevel,
        setListSelectedSubStats,
        resetHistory,
        popHistory,
        addHistory,
    } = useRelicMakerStore(
        useShallow((state) => ({
            selectedRelicSlot: state.selectedRelicSlot,
            selectedRelicSet: state.selectedRelicSet,
            selectedMainStat: state.selectedMainStat,
            listSelectedSubStats: state.listSelectedSubStats,
            selectedRelicLevel: state.selectedRelicLevel,
            preSelectedSubStats: state.preSelectedSubStats,
            setSelectedRelicSlot: state.setSelectedRelicSlot,
            setSelectedRelicSet: state.setSelectedRelicSet,
            setSelectedMainStat: state.setSelectedMainStat,
            setSelectedRelicLevel: state.setSelectedRelicLevel,
            setListSelectedSubStats: state.setListSelectedSubStats,
            resetHistory: state.resetHistory,
            popHistory: state.popHistory,
            addHistory: state.addHistory,
        }))
    )
    const [error, setError] = useState<string>("");

    const avatar = useMemo(() => {
        return avatars[avatarSelected?.ID?.toString() || ""];
    }, [avatars, avatarSelected]);

    const currentProfile = useMemo(() => {
        if (!avatar) return null;
        return avatar.profileList?.[avatar.profileSelect] ?? avatar.profileList?.[0] ?? null;
    }, [avatar]);

    const handleSwitchSlot = (newSlot: string) => {
        if (newSlot === selectedRelicSlot) return;
        setError("");
        setSelectedRelicSlot(newSlot);
        resetHistory(null);

        const relic = currentProfile?.relics?.[newSlot];
        if (relic) {
            setSelectedMainStat(relic.main_affix_id ? relic.main_affix_id.toString() : "");
            setSelectedRelicSet(relic.relic_set_id ? relic.relic_set_id.toString() : "");
            setSelectedRelicLevel(relic.level ?? 15);
            const newSubAffixes = [
                { affixId: "", property: "", rollCount: 0, stepCount: 0 },
                { affixId: "", property: "", rollCount: 0, stepCount: 0 },
                { affixId: "", property: "", rollCount: 0, stepCount: 0 },
                { affixId: "", property: "", rollCount: 0, stepCount: 0 }
            ];
            relic.sub_affixes?.forEach((item, index) => {
                if (newSubAffixes[index]) {
                    newSubAffixes[index].affixId = item.sub_affix_id ? item.sub_affix_id.toString() : "";
                    newSubAffixes[index].property = subAffix["5"]?.[item.sub_affix_id?.toString()]?.Property || "";
                    newSubAffixes[index].rollCount = item.count || 0;
                    newSubAffixes[index].stepCount = item.step || 0;
                }
            });
            setListSelectedSubStats(newSubAffixes);
        } else {
            setSelectedMainStat("");
            setSelectedRelicSet("");
            setSelectedRelicLevel(15);
            setListSelectedSubStats([
                { affixId: "", property: "", rollCount: 0, stepCount: 0 },
                { affixId: "", property: "", rollCount: 0, stepCount: 0 },
                { affixId: "", property: "", rollCount: 0, stepCount: 0 },
                { affixId: "", property: "", rollCount: 0, stepCount: 0 }
            ]);
        }
    };

    const relicSets = useMemo(() => {
        const listSet: Record<string, RelicSetDetail> = {};
        for (const [key, value] of Object.entries(mapRelicSet  || {})) {
            let isOk = false;
            for (const key2 of Object.keys(value.Parts)) {
                if (key2 == mappingRelicSlot?.[selectedRelicSlot]) {
                    isOk = true;
                    break;
                }
            }
            if (isOk) {
                listSet[key] = value;
            }
        }
        return listSet;
    }, [mapRelicSet , selectedRelicSlot]);

    const subAffixOptions = useMemo(() => {
        const listSet: Record<string, SubAffixData> = {};
        const subAffixMap = subAffix["5"];
        const mainAffixMap = mainAffix["5" + selectedRelicSlot]

        if (Object.keys(subAffixMap || {}).length === 0 || Object.keys(mainAffixMap || {}).length === 0) return listSet;

        for (const [key, value] of Object.entries(subAffixMap)) {
            if (value.Property !== mainAffixMap[selectedMainStat]?.Property) {
                listSet[key] = value;
            }
        }
        return listSet;
    }, [subAffix, mainAffix, selectedRelicSlot, selectedMainStat]);

    useEffect(() => {
        const subAffixMap = subAffix["5"];
        const mainAffixMap = mainAffix["5" + selectedRelicSlot];

        if (!subAffixMap || !mainAffixMap) return;

        const mainProp = mainAffixMap[selectedMainStat]?.Property;
        if (!mainProp) return;

        const newSubAffixes = structuredClone(listSelectedSubStats);
        let updated = false;

        for (let i = 0; i < newSubAffixes.length; i++) {
            if (newSubAffixes[i].property === mainProp) {
                newSubAffixes[i].affixId = "";
                newSubAffixes[i].property = "";
                newSubAffixes[i].rollCount = 0;
                newSubAffixes[i].stepCount = 0;
                updated = true;
            }
        }

        if (updated) setListSelectedSubStats(newSubAffixes);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMainStat, subAffix, mainAffix, selectedRelicSlot]);

    const exSubAffixOptions = useMemo(() => {
        const listSet: Record<string, SubAffixData> = {};
        const subAffixMap = subAffix["5"];
        const mainAffixMap = mainAffix["5" + selectedRelicSlot];

        if (!subAffixMap || !mainAffixMap) return listSet;

        for (const [key, value] of Object.entries(subAffixMap)) {
            const subAffix = listSelectedSubStats.find((item) => item.property === value.Property);
            if (subAffix && value.Property !== mainAffixMap[selectedMainStat]?.Property) {
                listSet[key] = value;
            }
        }
        return listSet;
    }, [subAffix, listSelectedSubStats, mainAffix, selectedRelicSlot, selectedMainStat]);

    const effectBonus = useMemo(() => {
        const affixSet = mainAffix?.["5" + selectedRelicSlot];
        if (!affixSet) return 0;

        const data = affixSet[selectedMainStat];
        if (!data) return 0;

        return calcMainAffixBonus(data, selectedRelicLevel);
    }, [mainAffix, selectedRelicSlot, selectedMainStat, selectedRelicLevel]);

    const handleSubStatChange = (key: string, index: number, rollCount: number, stepCount: number) => {
        setError("");
        const newSubAffixes = structuredClone(listSelectedSubStats);
        if (!subAffixOptions[key]) {
            newSubAffixes[index].affixId = "";
            newSubAffixes[index].property = "";
            newSubAffixes[index].rollCount = rollCount;
            newSubAffixes[index].stepCount = stepCount;
            setListSelectedSubStats(newSubAffixes);
            addHistory(index, newSubAffixes[index]);
            return;
        }
        newSubAffixes[index].affixId = key;
        newSubAffixes[index].property = subAffixOptions[key].Property;
        newSubAffixes[index].rollCount = rollCount;
        newSubAffixes[index].stepCount = stepCount;
        setListSelectedSubStats(newSubAffixes);
        addHistory(index, newSubAffixes[index]);
    };

    const handlerRollback = (index: number) => {
        setError("");
        if (!preSelectedSubStats[index]) return;

        const keys = Object.keys(preSelectedSubStats[index]);
        if (keys.length <= 1) return;

        const newSubAffixes = structuredClone(listSelectedSubStats);
        const listHistory = structuredClone(preSelectedSubStats[index]);
        const secondLastKey = listHistory.length - 2;
        const preSubAffixes = { ...listHistory[secondLastKey] };
        newSubAffixes[index].rollCount = preSubAffixes.rollCount;
        newSubAffixes[index].stepCount = preSubAffixes.stepCount;
        setListSelectedSubStats(newSubAffixes);
        popHistory(index);
    };

    const resetSubStat = (index: number) => {
        const newSubAffixes = structuredClone(listSelectedSubStats);
        resetHistory(index);
        newSubAffixes[index].affixId = "";
        newSubAffixes[index].property = "";
        newSubAffixes[index].rollCount = 0;
        newSubAffixes[index].stepCount = 0;
        setListSelectedSubStats(newSubAffixes);
    };

    const randomizeStats = () => {
        const newSubAffixes = structuredClone(listSelectedSubStats);
        const exKeys = Object.keys(exSubAffixOptions);
        for (let i = 0; i < newSubAffixes.length; i++) {
            const keys = Object.keys(subAffixOptions).filter((key) => !exKeys.includes(key));
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            exKeys.push(randomKey);
            const randomValue = subAffixOptions[randomKey];
            newSubAffixes[i].affixId = randomKey;
            newSubAffixes[i].property = randomValue.Property;
            newSubAffixes[i].rollCount = 0;
            newSubAffixes[i].stepCount = 0;
        }
        for (let i = 0; i < newSubAffixes.length; i++) {
            addHistory(i, newSubAffixes[i]);
        }
        setListSelectedSubStats(newSubAffixes);

    };

    const randomizeRolls = () => {
        const newSubAffixes = structuredClone(listSelectedSubStats);
        const randomRolls = randomPartition(9, listSelectedSubStats.length);
        for (let i = 0; i < listSelectedSubStats.length; i++) {
            newSubAffixes[i].rollCount = randomRolls[i];
            newSubAffixes[i].stepCount = randomStep(randomRolls[i]);
        }
        setListSelectedSubStats(newSubAffixes);
        for (let i = 0; i < newSubAffixes.length; i++) {
            addHistory(i, newSubAffixes[i]);
        }
    };

    const handlerSaveRelic = (closeModal: boolean = true) => {
        setError("");
        if (!selectedRelicSet || !selectedMainStat || !selectedRelicLevel || !selectedRelicSlot) {
            setError(transI18n("pleaseSelectAllOptions"));
            return;
        };

        if (listSelectedSubStats.find((item) => item.affixId === "")) {
            setError(transI18n("pleaseSelectAllSubStats"));
            return;
        };

        if (avatar && currentProfile) {
            const profileIndex = avatar.profileSelect;
            const newProfileList = [...avatar.profileList];
            newProfileList[profileIndex] = {
                ...currentProfile,
                relics: {
                    ...currentProfile.relics,
                    [selectedRelicSlot]: {
                        level: selectedRelicLevel,
                        relic_id: Number(`6${selectedRelicSet}${selectedRelicSlot}`),
                        relic_set_id: Number(selectedRelicSet),
                        main_affix_id: Number(selectedMainStat),
                        sub_affixes: listSelectedSubStats.map((item) => ({
                            sub_affix_id: Number(item.affixId),
                            count: item.rollCount,
                            step: item.stepCount
                        }))
                    }
                }
            };
            setAvatar({
                ...avatar,
                profileList: newProfileList
            });
        }
        if (closeModal) {
            setIsOpenRelic(false);
        }

        toast.success(transI18n("relicSavedSuccessfully"));
    }

    const renderSlotSwitcher = () => (
        <div className="p-2 sm:p-2.5 rounded-xl bg-base-200/50 border border-base-content/10 shadow-xs">
            <div className="flex items-center justify-between px-1 pb-1.5 border-b border-base-content/10 text-xs font-bold text-base-content/70">
                <span className="uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-primary rounded-full" />
                    {transI18n("slot")}
                </span>
                <span className="font-mono text-[11px] text-base-content/60">
                    {selectedRelicSlot && slotIconMap[selectedRelicSlot]?.key && transI18n.has(slotIconMap[selectedRelicSlot].key)
                        ? transI18n(slotIconMap[selectedRelicSlot].key)
                        : (selectedRelicSlot ? (slotIconMap[selectedRelicSlot]?.key || selectedRelicSlot) : "")}
                </span>
            </div>
            <div className="grid grid-cols-6 gap-1 sm:gap-1.5 pt-1.5">
                {["1", "2", "3", "4", "5", "6"].map((slotKey) => {
                    const isSelected = selectedRelicSlot === slotKey;
                    const equippedRelic = currentProfile?.relics?.[slotKey];
                    const slotInfo = slotIconMap[slotKey];
                    const slotName = slotInfo?.key && transI18n.has(slotInfo.key)
                        ? transI18n(slotInfo.key)
                        : (slotInfo?.key || slotKey);
                    const relicImgUrl = equippedRelic?.relic_set_id
                        ? `${process.env.CDN_URL}/spriteoutput/relicfigures/IconRelic_${equippedRelic.relic_set_id}_${slotKey}.png`
                        : slotInfo?.icon;

                    return (
                        <button
                            key={slotKey}
                            type="button"
                            onClick={() => handleSwitchSlot(slotKey)}
                            className={`relative group flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-lg border transition-all duration-150 cursor-pointer ${
                                isSelected
                                    ? "bg-primary text-primary-content border-primary shadow-xs shadow-primary/30 scale-[1.02] z-10"
                                    : equippedRelic
                                    ? "bg-base-100 hover:bg-base-200/80 border-base-content/15 text-base-content hover:border-primary/40"
                                    : "bg-base-100/40 hover:bg-base-100/80 border-dashed border-base-content/15 text-base-content/50 hover:border-base-content/30"
                            }`}
                            title={`${slotName}${equippedRelic ? ` (+${equippedRelic.level})` : ""}`}
                        >
                            <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center relative">
                                {relicImgUrl ? (
                                    <Image
                                        src={relicImgUrl}
                                        alt={slotName}
                                        unoptimized
                                        crossOrigin="anonymous"
                                        width={32}
                                        height={32}
                                        className={`w-6 h-6 sm:w-7 sm:h-7 object-contain transition-transform duration-150 ${
                                            isSelected ? "scale-105 drop-shadow-xs" : "group-hover:scale-105"
                                        } ${!equippedRelic && !isSelected ? "opacity-50" : ""}`}
                                    />
                                ) : null}
                                {equippedRelic && (
                                    <span
                                        className={`absolute -top-1 -right-1 text-[8px] font-mono font-black px-0.5 rounded-xs shadow-xs ${
                                            isSelected
                                                ? "bg-primary-content text-primary"
                                                : "bg-primary/20 text-primary border border-primary/30"
                                        }`}
                                    >
                                        +{equippedRelic.level}
                                    </span>
                                )}
                            </div>
                            <span
                                className={`text-[9px] sm:text-[10px] font-semibold truncate max-w-full text-center mt-0.5 leading-tight ${
                                    isSelected ? "text-primary-content font-bold" : "text-base-content/80"
                                }`}
                            >
                                {slotName}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="space-y-3">
            {/* On mobile / tablet (< lg:), Slot Switcher is shown at the top */}
            <div className="lg:hidden">
                {renderSlotSwitcher()}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
                {/* Left Panel: Main Stat & Set Configuration */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-2.5">
                    {/* Main Settings Card */}
                    <div className="p-3 sm:p-3.5 rounded-xl bg-base-200/50 border border-base-content/10 shadow-xs space-y-2.5">
                        <div className="pb-1.5 border-b border-base-content/10">
                            <h2 className="text-sm font-bold text-primary flex items-center gap-1.5">
                                <span className="w-1.5 h-3.5 bg-primary rounded-full"></span>
                                {transI18n("mainSettings")}
                            </h2>
                        </div>

                        <div className="space-y-2.5">
                            {/* Main Stat Picker */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-base-content/75 mb-1">
                                    {transI18n("mainStat")}
                                </label>
                                <SelectCustomImage
                                    customSet={Object.entries(mainAffix["5" + selectedRelicSlot] || {}).map(([key, value]) => ({
                                        value: key,
                                        label: mappingStats[value.Property].name + " " + mappingStats[value.Property].unit,
                                        imageUrl: `${process.env.CDN_URL}/${mappingStats[value.Property].icon}`
                                    }))}
                                    excludeSet={[]}
                                    selectedCustomSet={selectedMainStat}
                                    placeholder={transI18n("selectAMainStat")}
                                    setSelectedCustomSet={setSelectedMainStat}
                                />
                            </div>

                            {/* Relic Set Picker */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-base-content/75 mb-1">
                                    {transI18n("set")}
                                </label>
                                <SelectCustomImage
                                    customSet={Object.entries(relicSets).map(([key, value]) => ({
                                        value: key,
                                        label: getLocaleName(locale, value.Name),
                                        imageUrl: `${process.env.CDN_URL}/${value.Image.SetIconPath}`
                                    }))}
                                    excludeSet={[]}
                                    selectedCustomSet={selectedRelicSet}
                                    placeholder={transI18n("selectASet")}
                                    setSelectedCustomSet={setSelectedRelicSet}
                                />
                            </div>

                            {/* Set Bonus Display (Expanded height on desktop, with overflow-y-auto so text is never truncated) */}
                            <div className="py-2 px-2.5 text-xs border border-base-content/10 rounded-lg bg-base-100/50 max-h-48 xl:max-h-56 overflow-y-auto">
                                {selectedRelicSet !== "" && mapRelicSet[selectedRelicSet] ? (
                                    Object.entries(mapRelicSet[selectedRelicSet].Skills).map(([key, value]) => (
                                        <div key={key} className="mb-2 last:mb-0 space-y-0.5">
                                            <span className="font-bold text-amber-500 text-[11px]">{key}-Piece:</span>
                                            <div
                                                className="text-base-content/85 text-[11px] leading-relaxed pl-1"
                                                dangerouslySetInnerHTML={{
                                                    __html: replaceByParam(
                                                        getLocaleName(locale, value.Desc),
                                                        value.Param || []
                                                    )
                                                }}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-base-content/40 italic py-1 text-[11px]">{transI18n("pleaseSelectASet")}</p>
                                )}
                            </div>

                            {/* Effect Bonus & Level */}
                            <div className="space-y-2 pt-0.5">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="text-base-content/75">{transI18n("effectBonus")}:</span>
                                    <span className="font-mono text-primary font-bold text-sm">+{effectBonus}</span>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                        <span className="text-base-content/75">{transI18n("level")}</span>
                                        <span className="font-mono text-primary font-bold">+{selectedRelicLevel}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="15"
                                        value={selectedRelicLevel}
                                        onChange={(e) => setSelectedRelicLevel(parseInt(e.target.value))}
                                        className="range range-primary range-xs w-full"
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.p
                                        key="error"
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-xs text-error font-bold text-center bg-error/10 p-1.5 rounded-lg border border-error/20"
                                    >
                                        {error}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            {/* Save Actions: Save & Save and Close */}
                            <div className="grid grid-cols-2 gap-2 mt-1.5 pt-1 border-t border-base-content/10">
                                <button
                                    type="button"
                                    onClick={() => handlerSaveRelic(false)}
                                    className="btn btn-outline btn-primary btn-sm rounded-xl font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                                >
                                    {transI18n("save")}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlerSaveRelic(true)}
                                    className="btn btn-primary btn-sm rounded-xl font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                                >
                                    {transI18n("saveAndClose")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Slot Switcher (on lg+) + Sub Stats Configurator */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-2">
                    {/* On desktop (lg:), Slot Switcher is shown at the top of the right column */}
                    <div className="hidden lg:block">
                        {renderSlotSwitcher()}
                    </div>

                    {/* Header with Total Rolls & Randomizers */}
                    <div className="px-3 py-2 rounded-xl bg-base-200/50 border border-base-content/10 flex flex-wrap items-center justify-between gap-2 shadow-xs">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold uppercase tracking-wider text-base-content/85">{transI18n("totalRoll")}:</span>
                            <span className="text-sm font-mono font-bold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                                {listSelectedSubStats.reduce((a, b) => a + b.rollCount, 0)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="btn btn-xs sm:btn-sm btn-outline btn-primary rounded-lg font-bold text-xs sm:text-sm cursor-pointer"
                                onClick={randomizeStats}
                            >
                                {transI18n("randomizeStats")}
                            </button>
                            <button
                                type="button"
                                className="btn btn-xs sm:btn-sm btn-outline btn-accent rounded-lg font-bold text-xs sm:text-sm cursor-pointer"
                                onClick={randomizeRolls}
                            >
                                {transI18n("randomizeRolls")}
                            </button>
                        </div>
                    </div>

                    {/* 4 Sub-Stat Slots in 2x2 Grid on md+ screens, 1 column on smaller (mobile) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
                        {listSelectedSubStats.map((v, index) => (
                            <div key={index} className="p-2.5 sm:p-3 rounded-xl bg-base-200/40 border border-base-content/10 space-y-2.5 shadow-xs">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <SelectCustomImage
                                            customSet={Object.entries(subAffixOptions).map(([key, value]) => ({
                                                value: key,
                                                label: mappingStats[value.Property].name + " " + mappingStats[value.Property].unit,
                                                imageUrl: `${process.env.CDN_URL}/${mappingStats[value.Property].icon}`
                                            }))}
                                            excludeSet={Object.entries(exSubAffixOptions).map(([key, value]) => ({
                                                value: key,
                                                label: mappingStats[value.Property].name + " " + mappingStats[value.Property].unit,
                                                imageUrl: `${process.env.CDN_URL}/${mappingStats[value.Property].icon}`
                                            }))}
                                            selectedCustomSet={v.affixId}
                                            placeholder={transI18n("selectASubStat")}
                                            setSelectedCustomSet={(key) => handleSubStatChange(key, index, 0, 0)}
                                        />
                                    </div>

                                    {/* Stat Value Readout */}
                                    <div className="px-2.5 py-1 rounded-lg bg-base-100 border border-base-content/10 text-right min-w-22 shadow-xs shrink-0">
                                        <span className="text-sm sm:text-base font-mono font-black text-primary block leading-tight">
                                            +{calcAffixBonus(subAffixOptions[v.affixId], v.stepCount, v.rollCount)}{mappingStats?.[subAffixOptions[v.affixId]?.Property]?.unit || ""}
                                        </span>
                                        <span className="text-xs text-base-content/60 font-mono font-semibold">
                                            R: {v.rollCount} | S: {v.stepCount}
                                        </span>
                                    </div>
                                </div>

                                {/* Up / Down Steppers */}
                                <div className="grid grid-cols-2 gap-2 pt-0.5">
                                    {/* Up Rolls */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1 text-xs font-bold text-success leading-none">
                                            <ChevronUp className="w-3.5 h-3.5" />
                                            <span>{transI18n("upRoll")}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1">
                                            {[0, 1, 2].map((stepOffset) => (
                                                 <button
                                                    key={stepOffset}
                                                    type="button"
                                                    onClick={() => handleSubStatChange(v.affixId, index, v.rollCount + 1, v.stepCount + stepOffset)}
                                                    className="btn btn-xs btn-success rounded-lg font-mono font-bold shadow-xs px-1 text-xs sm:text-[13px] h-7 min-h-7 cursor-pointer"
                                                >
                                                    +{calcAffixBonus(subAffixOptions[v.affixId], v.stepCount + stepOffset, v.rollCount + 1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Down Rolls */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1 text-xs font-bold text-error leading-none">
                                            <ChevronDown className="w-3.5 h-3.5" />
                                            <span>{transI18n("downRoll")}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1">
                                            {[0, 1, 2].map((stepOffset) => (
                                                <button
                                                    key={stepOffset}
                                                    type="button"
                                                    onClick={() => handleSubStatChange(v.affixId, index, Math.max(v.rollCount - 1, 0), Math.max(v.stepCount - stepOffset, 0))}
                                                    className="btn btn-xs btn-error rounded-lg font-mono font-bold shadow-xs px-1 text-xs sm:text-[13px] h-7 min-h-7 cursor-pointer"
                                                >
                                                    -{calcAffixBonus(subAffixOptions[v.affixId], Math.max(v.stepCount - stepOffset, 0), Math.max(v.rollCount - 1, 0))}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Reset & Rollback actions */}
                                <div className="flex items-center justify-end gap-2 pt-1 border-t border-base-content/10">
                                    <button
                                        type="button"
                                        className="btn btn-ghost btn-xs text-warning hover:bg-warning/10 rounded-md text-xs sm:text-[13px] font-bold h-7 min-h-7 px-2.5 cursor-pointer"
                                        onClick={() => handlerRollback(index)}
                                    >
                                        {transI18n("rollBack")}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-ghost btn-xs text-error hover:bg-error/10 rounded-md text-xs sm:text-[13px] font-bold h-7 min-h-7 px-2.5 cursor-pointer"
                                        onClick={() => resetSubStat(index)}
                                    >
                                        {transI18n("reset")}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
