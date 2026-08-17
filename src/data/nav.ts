export interface NavItem {
  label: string;
  href: string;
}

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Operating Thesis", href: "/thesis" },
  { label: "Ecosystem", href: "/ecosystem" },
  { label: "Notes", href: "/notes" },
  { label: "Artifacts", href: "/artifacts" },
  { label: "The Ledger", href: "/ledger" },
  { label: "Live Systems", href: "/systems" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerNav: NavItem[] = [...primaryNav];

export const footerLegal: NavItem[] = [{ label: "Privacy", href: "/privacy" }];

export const primaryCta = { label: "Discuss a system", href: "/contact" };
export const secondaryCta = { label: "Explore the ecosystem", href: "/ecosystem" };
