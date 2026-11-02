"use client";

import RelicsInfo from "@/components/relicsInfo";
import { NeedRelic } from "@/components/requireData";

export default function RelicsInfoPage() {
  return (
    <div className="w-full">
      <NeedRelic variant="page">
        <RelicsInfo></RelicsInfo>
      </NeedRelic>
    </div>
  );
}
