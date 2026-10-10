import type { SocialCardData, TemplateHelpers } from "../../types/templates.ts";

export default function (
    this: TemplateHelpers,
    { title, description, date, section, site }: SocialCardData,
) {
    const label =
        section === "posts" ? "POSTS / 文章" : section === "notes" ? "NOTES / 筆記" : "TECH / 技術";
    const fontSize = title.length > 48 ? 44 : title.length > 32 ? 54 : title.length > 16 ? 64 : 80;
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                width: 1200,
                height: 630,
                padding: "56px 72px",
                background: "#fcfaf4",
                color: "#284b63",
                fontFamily: "Noto Sans TC",
                borderTop: "10px solid #284b63",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 52,
                            height: 52,
                            borderRadius: 14,
                            background: "#284b63",
                            color: "#fcfaf4",
                            fontSize: 32,
                        }}
                    >
                        F
                    </div>
                    <div style={{ display: "flex", fontSize: 30, letterSpacing: -1 }}>
                        {site.name}
                    </div>
                </div>
                <div style={{ display: "flex", fontSize: 22, color: "#4e4e4e" }}>{label}</div>
            </div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    flex: 1,
                    padding: "32px 0",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        fontSize,
                        lineHeight: 1.35,
                        letterSpacing: -1,
                        color: "#2b2b2b",
                        wordBreak: "break-word",
                    }}
                >
                    {title}
                </div>
                {description && (
                    <div
                        style={{
                            display: "flex",
                            fontSize: 25,
                            lineHeight: 1.6,
                            marginTop: 22,
                            color: "#4e4e4e",
                        }}
                    >
                        {description.length > 72 ? description.slice(0, 72) + "..." : description}
                    </div>
                )}
            </div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "1px solid #d8ddd6",
                    paddingTop: 22,
                    fontSize: 20,
                }}
            >
                <div style={{ display: "flex" }}>程式・生活・心靈成長</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    {date && (
                        <div style={{ display: "flex", color: "#4e4e4e" }}>
                            {this.dateISO(date)}
                        </div>
                    )}
                    <div
                        style={{
                            display: "flex",
                            width: 32,
                            height: 8,
                            borderRadius: 4,
                            background: "#84a59d",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
