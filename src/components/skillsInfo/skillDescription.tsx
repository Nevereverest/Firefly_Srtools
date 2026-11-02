import { getLocaleName, replaceByParam } from "@/helper";
import { AvatarStore, SkillDetail, SkillTreePoint } from "@/types";
import ExtraEffectList from "../extraInfo";

export const SkillDescription = ({ skill, locale, avatarData, skillInfo, attackTypeLabel, skillEffectLabel }: {
    skill: SkillDetail,
    locale: string,
    avatarData: AvatarStore,
    skillInfo: SkillTreePoint,
    attackTypeLabel?: string,
    skillEffectLabel?: string
}) => {
    const levelKey = avatarData?.data.skills?.[skillInfo?.PointID]?.toString() || "";
    const params = skill.Level[levelKey]?.Param || [];
    const descHtml = getLocaleName(locale, skill.Desc) || getLocaleName(locale, skill.SimpleDesc);

    const extraList = Object.values(skill.Extra || {}).length > 0
        ? skill.Extra
        : skill?.SimpleExtra || {};

    const skillName = getLocaleName(locale, skill.Name);

    return (
        <div className="space-y-2.5">
            <h3 className="text-xl font-bold text-base-content tracking-tight">
                {skillName}
            </h3>

            {(attackTypeLabel || skillEffectLabel) && (
                <div className="text-sm font-bold text-primary flex items-center gap-1.5">
                    <span>{attackTypeLabel}</span>
                    {skillEffectLabel && (
                        <span className="text-primary/70 font-medium">({skillEffectLabel})</span>
                    )}
                </div>
            )}

            <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wide">
                <span className="w-1 h-3.5 bg-primary rounded-xs"></span>
                <span>{skillName}</span>
            </div>
            
            <div 
                className="text-xs sm:text-sm leading-relaxed text-base-content/85"
                dangerouslySetInnerHTML={{ __html: replaceByParam(descHtml, params) }} 
            />

            {Object.keys(extraList).length > 0 && (
                <ExtraEffectList extras={extraList} locale={locale} />
            )}
        </div>
    );
};