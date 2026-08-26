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

    const handlerSaveRelic = () => {
        setError("");
        const avatar = avatars[avatarSelected?.ID?.toString() || ""];
        if (!selectedRelicSet || !selectedMainStat || !selectedRelicLevel || !selectedRelicSlot) {
            setError(transI18n("pleaseSelectAllOptions"));
            return;
        };

        if (listSelectedSubStats.find((item) => item.affixId === "")) {
            setError(transI18n("pleaseSelectAllSubStats"));
            return;
        };

        if (avatar) {
            const profileIndex = avatar.profileSelect;
            const currentProfile = avatar.profileList[profileIndex];
            if (currentProfile) {
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
        }
        setIsOpenRelic(false);

        toast.success(transI18n("relicSavedSuccessfully"));
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Panel: Main Stat & Set Configuration */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="p-4 sm:p-5 rounded-2xl bg-base-200/50 border border-base-content/10 shadow-xs space-y-4">
                        <div className="pb-3 border-b border-base-content/10">
                            <h2 className="text-base font-bold text-primary flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-primary rounded-full"></span>
                                {transI18n("mainSettings")}
                            </h2>
                        </div>

                        <div className="space-y-3.5">
                            {/* Main Stat Picker */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-base-content/75 mb-1.5">
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
                                <label className="block text-xs font-bold uppercase tracking-wider text-base-content/75 mb-1.5">
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

                            {/* Set Bonus Display */}
                            <div className="py-2 px-1 text-xs border-t border-b border-base-content/10">
                                {selectedRelicSet !== "" && mapRelicSet[selectedRelicSet] ? (
                                    Object.entries(mapRelicSet[selectedRelicSet].Skills).map(([key, value]) => (
                                        <div key={key} className="mb-2 last:mb-0 space-y-0.5">
                                            <span className="font-bold text-amber-500">{key}-Piece:</span>
                                            <div
                                                className="text-base-content/80 leading-relaxed pl-1"
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
                                    <p className="text-base-content/40 italic py-1">{transI18n("pleaseSelectASet")}</p>
                                )}
                            </div>

                            {/* Effect Bonus & Level */}
                            <div className="space-y-3 pt-1">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="text-base-content/75">{transI18n("effectBonus")}:</span>
                                    <span className="font-mono text-primary font-bold text-sm">+{effectBonus}</span>
                                </div>

                                <div className="space-y-1.5">
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
                                        className="text-xs text-error font-bold text-center bg-error/10 p-2 rounded-lg border border-error/20"
                                    >
                                        {error}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            {/* Save Button */}
                            <button
                                onClick={handlerSaveRelic}
                                className="btn btn-primary w-full rounded-xl font-bold shadow-xs mt-2"
                            >
                                {transI18n("save")}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Sub Stats Configurator */}
                <div className="lg:col-span-7 space-y-3">
                    {/* Header with Total Rolls & Randomizers */}
                    <div className="p-3 rounded-2xl bg-base-200/50 border border-base-content/10 flex flex-wrap items-center justify-between gap-2 shadow-xs">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-base-content/75">{transI18n("totalRoll")}:</span>
                            <span className="text-sm font-mono font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                                {listSelectedSubStats.reduce((a, b) => a + b.rollCount, 0)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                className="btn btn-xs btn-outline btn-primary rounded-lg font-semibold"
                                onClick={randomizeStats}
                            >
                                {transI18n("randomizeStats")}
                            </button>
                            <button
                                className="btn btn-xs btn-outline btn-accent rounded-lg font-semibold"
                                onClick={randomizeRolls}
                            >
                                {transI18n("randomizeRolls")}
                            </button>
                        </div>
                    </div>

                    {/* 4 Sub-Stat Slots */}
                    <div className="space-y-2.5">
                        {listSelectedSubStats.map((v, index) => (
                            <div key={index} className="p-3.5 rounded-2xl bg-base-200/40 border border-base-content/10 space-y-2.5 shadow-xs">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex-1">
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
                                    <div className="px-3 py-1 rounded-xl bg-base-100 border border-base-content/10 text-right min-w-24 shadow-xs">
                                        <span className="text-sm font-mono font-extrabold text-primary block">
                                            +{calcAffixBonus(subAffixOptions[v.affixId], v.stepCount, v.rollCount)}{mappingStats?.[subAffixOptions[v.affixId]?.Property]?.unit || ""}
                                        </span>
                                        <span className="text-[11px] text-base-content/60 font-mono font-semibold">
                                            Roll: {v.rollCount} | Step: {v.stepCount}
                                        </span>
                                    </div>
                                </div>

                                {/* Up / Down Steppers */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                                    {/* Up Rolls */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-success">
                                            <ChevronUp className="w-3.5 h-3.5" />
                                            <span>{transI18n("upRoll")}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {[0, 1, 2].map((stepOffset) => (
                                                <button
                                                    key={stepOffset}
                                                    onClick={() => handleSubStatChange(v.affixId, index, v.rollCount + 1, v.stepCount + stepOffset)}
                                                    className="btn btn-xs btn-success rounded-xl font-mono font-bold shadow-xs"
                                                >
                                                    +{calcAffixBonus(subAffixOptions[v.affixId], v.stepCount + stepOffset, v.rollCount + 1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Down Rolls */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-error">
                                            <ChevronDown className="w-3.5 h-3.5" />
                                            <span>{transI18n("downRoll")}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {[0, 1, 2].map((stepOffset) => (
                                                <button
                                                    key={stepOffset}
                                                    onClick={() => handleSubStatChange(v.affixId, index, Math.max(v.rollCount - 1, 0), Math.max(v.stepCount - stepOffset, 0))}
                                                    className="btn btn-xs btn-error rounded-xl font-mono font-bold shadow-xs"
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
                                        className="btn btn-ghost btn-xs text-warning hover:bg-warning/10 rounded-lg text-xs font-bold"
                                        onClick={() => handlerRollback(index)}
                                    >
                                        {transI18n("rollBack")}
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-xs text-error hover:bg-error/10 rounded-lg text-xs font-bold"
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
