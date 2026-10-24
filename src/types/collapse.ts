
export interface CollapseRelicSubAffix {
    AffixID: number;
    Cnt: number;
    Step: number;
}

export interface CollapseRelicData {
    ItemID: number;
    Level: number;
    MainAffixID: number;
    SubAffixes: CollapseRelicSubAffix[];
}

export interface CollapseAvatarData {
    AvatarID: number;
    /** 0-6. There is no "leave alone": the server applies whatever it is told. */
    Rank: number;
    /** 0 = base form. Non-zero must exist in EnhancedAvatarExcel or the whole push fails. */
    EnhancedID: number;
    /** 0 = no light cone, which unequips the current one. */
    EquipmentID: number;
    /** 1-5, checked only when EquipmentID is non-zero. */
    EquipmentRank: number;
    /** An empty list strips every relic, so it is always sent even for an empty build. */
    Relics: CollapseRelicData[];
    /** An empty list clears every EX rank. */
    ExRankIDs: number[];
}

export interface CollapseConnectionRequest {
    Username: string;
    Password: string;
    Avatars: CollapseAvatarData[];
}

export interface CollapseConnectionResponse {
    retcode: number;
    message: string;
    data?: {
        avatars: number;
        created: number;
        updated: number;
        deleted: number;
        errors: string[];
    } | null;
}
