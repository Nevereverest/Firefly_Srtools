import { listCurrentLanguageApi } from "@/constant/constant";
import { AvatarDetail } from "@/types";
import { useTranslations } from "next-intl"

type TFunc = ReturnType<typeof useTranslations>
function cleanText(text: string): string {
  if (!text) return ""
  return text.replace(/<unbreak>(.*?)<\/unbreak>/g, "$1")
}

export function getNameChar(
  locale: string,
  t: TFunc,
  data: AvatarDetail | undefined
): string {
  if (!data) return "";

  if (!Object.prototype.hasOwnProperty.call(listCurrentLanguageApi, locale)) {
    return "";
  }

  const langKey = listCurrentLanguageApi[locale as keyof typeof listCurrentLanguageApi].toLowerCase();

  let text = data.Name[langKey] ?? "";

  if (!text) {
    text = data.Name["en"] ?? "";
  }

  if (data.ID > 8000) {
    text = `${t("trailblazer")} • ${t(data?.BaseType?.toLowerCase() ?? "")}`;
  }

  return cleanText(text)
}

export function getLocaleName(locale: string, data: Record<string, string> | undefined | null): string {
    if (!data) {
        return ""
    }
    
    if (!Object.prototype.hasOwnProperty.call(listCurrentLanguageApi, locale)) {
        return ""
    }

    const langKey = listCurrentLanguageApi[locale as keyof typeof listCurrentLanguageApi].toLowerCase();

    let text = data[langKey] ?? "";

    if (!text) {
        text = data["en"] ?? "";
    }
    
    return cleanText(text)
}

export function parseRuby(text: string): string {
    const rubyRegex = /\{RUBY_B#(.*?)\}(.*?)\{RUBY_E#\}/gs;
    return text.replace(rubyRegex, (_match, furigana, kanji) => {
        return `<ruby>${kanji}<rt>${furigana}</rt></ruby>`;
    });
}