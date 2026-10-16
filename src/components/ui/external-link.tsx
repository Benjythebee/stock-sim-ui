import type { AnchorHTMLAttributes } from "react";

/** A link that opens in a new tab, without giving that page access to this one. */
export const ExternalLink = (props: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel'>) => (
    <a target="_blank" rel="noopener noreferrer" {...props} />
);
