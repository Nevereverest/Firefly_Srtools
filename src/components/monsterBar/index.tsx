import MocBar from "./moc";
import useUserDataStore from "@/stores/userDataStore";
import PfBar from "./pf";
import Image from "next/image";
import AsBar from "./as";
import { useTranslations } from "next-intl";
import CeBar from "./ce";
import PeakBar from "./peak";
import { useShallow } from "zustand/react/shallow";

export default function MonsterBar() {
    const { battle_type, setBattleType } = useUserDataStore(
        useShallow((state) => ({
            battle_type: state.battle_type,
            setBattleType: state.setBattleType,
        }))
    )
    const transI18n = useTranslations("DataPage")

    const navItems = [
        { name: transI18n("memoryOfChaos"), icon: 'AbyssIcon01', value: 'MOC' },
        { name: transI18n("pureFiction"), icon: 'ChallengeStory', value: 'PF' },
        { name: transI18n("apocalypticShadow"), icon: 'ChallengeBoss', value: 'AS' },
        { name: transI18n("anomalyArbitration"), icon: 'ChallengePeakIcon', value: 'PEAK' },
        { name: transI18n("customEnemy"), icon: 'MonsterIcon', value: 'CE' },
        { name: transI18n("simulatedUniverse"), icon: 'SimulatedUniverse', value: 'SU' },

    ];


    return (
        <div className="w-full">
            {/* Header Navigation */}
            <nav className="border-b border-base-content/10 relative pb-3">
                <div className="flex items-center justify-center">
                    {/* Mobile Select */}
                    <div className="block md:hidden w-full">
                        <select
                            className="select select-bordered w-full"
                            value={battle_type.toUpperCase()}
                            onChange={(e) => setBattleType(e.target.value.toUpperCase())}
                        >
                            {navItems.map((item) => (
                                <option key={item.name} value={item.value.toUpperCase()}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Desktop Tabs */}
                    <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-2 w-full">
                        {navItems.map((item) => {
                            const isSelected = battle_type.toUpperCase() === item.value.toUpperCase()
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => setBattleType(item.value.toUpperCase())}
                                    className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer duration-300 flex items-center justify-center space-x-2 text-sm font-semibold border ${
                                        isSelected
                                            ? 'bg-success/20 border-warning shadow-lg text-base-content'
                                            : 'bg-base-200/20 hover:bg-base-200/40 border-transparent text-base-content/80'
                                    }`}
                                >
                                    <span
                                        className={
                                            isSelected
                                                ? ""
                                                : "theme-path-icon"
                                        }
                                        style={
                                            isSelected
                                                ? {
                                                    filter:
                                                        'brightness(0) saturate(100%) invert(63%) sepia(78%) saturate(643%) hue-rotate(1deg) brightness(93%) contrast(89%)',
                                                }
                                                : undefined
                                        }
                                    >
                                        <Image
                                            unoptimized
                                            crossOrigin="anonymous"
                                            src={`/icon/${item.icon}.webp`}
                                            alt={item.name}
                                            width={24}
                                            height={24}
                                            className="w-5 h-5 object-contain"
                                        />
                                    </span>
                                    <span>{item.name}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </nav>

            {(battle_type.toUpperCase() === "DEFAULT" || battle_type.toUpperCase() === "") && (
                <div className="container mx-auto px-4 py-8 text-center font-bold text-3xl">
                    {transI18n("noEventSelected")}
                </div>
            )}
            {battle_type.toUpperCase() === 'MOC' && <MocBar />}
            {battle_type.toUpperCase() === 'PF' && <PfBar />}
            {battle_type.toUpperCase() === 'AS' && <AsBar />}
            {battle_type.toUpperCase() === 'CE' && <CeBar />}
            {battle_type.toUpperCase() === 'PEAK' && <PeakBar />}
            {battle_type.toUpperCase() === 'SU' && (
                <div className="container mx-auto px-4 py-8 text-center font-bold text-3xl">
                    {transI18n("comingSoon")}
                </div>
            )}

        </div>
    )
}