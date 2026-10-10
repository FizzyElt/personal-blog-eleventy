import type { TemplateData } from "../../types/templates.ts";

export default function Footer({ site }: Pick<TemplateData, "site">) {
    return (
        <footer className="site-footer">
            <p className="footer-name">{site.name}</p>
            {site.footerLinks.length > 0 && (
                <ul className="footer-links" aria-label="個人連結">
                    {site.footerLinks.map((link) => (
                        <li key={link.url}>
                            <a href={link.url} rel="me">
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </footer>
    );
}
