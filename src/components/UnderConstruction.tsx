import { getTranslations } from "next-intl/server";
import { StarMark } from "./icons/StarMark";

/**
 * Shared body for every route CLAUDE.md lists but has no content for yet
 * (Routes: "a route that has no content yet renders the shared
 * UnderConstruction component with its own title passed as a prop"). One
 * component, one message — never a copied placeholder per page.
 */
export async function UnderConstruction({ title }: { title: string }) {
  const t = await getTranslations("common");

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-20 text-center md:px-10 md:py-28">
      <StarMark className="h-8 w-8 shrink-0 text-secondary" />
      <h1 className="text-[26px] font-normal text-primary md:text-[34px]">{title}</h1>
      <p className="max-w-[46ch] text-sm leading-[1.65] text-text-secondary md:text-base">
        {t("underConstruction")}
      </p>
    </div>
  );
}
