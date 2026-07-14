import type { PrivilegeGlossary } from "@/lib/privilegeGlossary";
import { privilegesToTags, displayTag, tagMeaning, privilegeTier } from "@/lib/privilegeTags";
import styles from "./RaceCard.module.css";

interface PrivilegeTagsProps {
  privileges: string | null;
  glossary: PrivilegeGlossary;
  /** Tags unchecked in Quick filters — hidden from the row but runner stays visible. */
  hiddenTags?: string[];
}

/** Read-only abbreviated tags under a horse name (editing lives in Quick filters). */
export function PrivilegeTags({ privileges, glossary, hiddenTags = [] }: PrivilegeTagsProps) {
  const hidden = new Set(hiddenTags);
  const tags = privilegesToTags(privileges).filter((tag) => !hidden.has(tag));
  if (tags.length === 0) return null;

  return (
    <div className={styles.privTagRow}>
      {tags.map((tag) => {
        const tier = privilegeTier(tag);
        const tierClass = tier === "must" ? styles.privTagMust : styles.privTagGood;
        return (
          <span key={tag} className={`${styles.privTag} ${tierClass}`} title={tagMeaning(tag, glossary)}>
            {displayTag(tag, glossary)}
          </span>
        );
      })}
    </div>
  );
}
