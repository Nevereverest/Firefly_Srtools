import { getLocaleName, replaceByParam } from "@/helper";
import { AvatarStore, SkillDetail, SkillTreePoint } from "@/types";
import ExtraEffectList from "../extraInfo";

export const SkillDescription = ({ skill, locale, avatarData, skillInfo }: {
    skill: SkillDetail,
    locale: string,
    avatarData: AvatarStore,
    skillInfo: SkillTreePoint
}) => {
    const levelKey = avatarData?.data.skills?.[skillInfo?.PointID]?.toString() || "";
    const params = skill.Level[levelKey]?.Param || [];
    const descHtml = getLocaleName(locale, skill.Desc) || getLocaleName(locale, skill.SimpleDesc);

    const extraList = Object.values(skill.Extra).length > 0
        ? skill.Extra
        : skill?.SimpleExtra || {};

    return (
        <div className="flex flex-col gap-2">
            <div className="space-y-2 pb-2">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-primary/80 rounded-sm" />
                    <div 
                        className="text-lg font-bold tracking-wide text-foreground uppercase" 
                        dangerouslySetInnerHTML={{ __html: replaceByParam(getLocaleName(locale, skill.Name), []) }} 
                    />
                </div>
                
                <div 
                    className="text-[15px] leading-relaxed text-foreground/90 pl-3 border-l border-transparent"
                    dangerouslySetInnerHTML={{ __html: replaceByParam(descHtml, params) }} 
                />
            </div>

            {Object.keys(extraList).length > 0 && (
                <ExtraEffectList extras={extraList} locale={locale} />
            )}
        </div>
    );
};