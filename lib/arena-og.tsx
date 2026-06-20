import { ImageResponse } from "next/og";
import type { Arena } from "@/lib/arena-data";

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

const getOptionFontSize = (text: string) => {
  if (text.length > 20) return 34;
  if (text.length > 12) return 42;
  return 52;
};

export const renderArenaOgImage = (arena?: Arena) => {
  const title = arena?.title ?? "둘 중 하나만 골라.";
  const optionA = arena?.optionA ?? "내 선택 고르기";
  const optionB = arena?.optionB ?? "사람들 선택 보기";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#090b10",
          color: "#f4f4f5",
          padding: "54px 64px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 30, fontWeight: 900 }}>
            <span style={{ color: "#E7B933" }}>VS</span>
            <span style={{ marginLeft: 10 }}>ARENA</span>
          </div>
          <div style={{ fontSize: 22, color: "#9ca3af" }}>둘 중 하나만 골라</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              width: "100%",
              maxHeight: 112,
              overflow: "hidden",
              textAlign: "center",
              fontSize: title.length > 34 ? 36 : 44,
              lineHeight: 1.2,
              fontWeight: 900,
              wordBreak: "keep-all",
            }}
          >
            {title}
          </div>

          <div style={{ width: "100%", display: "flex", alignItems: "stretch", marginTop: 34 }}>
            <div
              style={{
                width: "46%",
                minHeight: 148,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                background: "#241318",
                border: "2px solid #A53A4A",
                padding: "20px 26px",
              }}
            >
              <span style={{ fontSize: 20, color: "#F0A0AA", fontWeight: 800 }}>A 선택</span>
              <span
                style={{
                  marginTop: 10,
                  maxHeight: 82,
                  overflow: "hidden",
                  fontSize: getOptionFontSize(optionA),
                  lineHeight: 1.08,
                  fontWeight: 900,
                  wordBreak: "keep-all",
                }}
              >
                {optionA}
              </span>
            </div>
            <div
              style={{
                width: "8%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#E7B933",
                fontSize: 34,
                fontWeight: 900,
              }}
            >
              VS
            </div>
            <div
              style={{
                width: "46%",
                minHeight: 148,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                background: "#101d29",
                border: "2px solid #2D6A9F",
                padding: "20px 26px",
              }}
            >
              <span style={{ fontSize: 20, color: "#8EC6F2", fontWeight: 800 }}>B 선택</span>
              <span
                style={{
                  marginTop: 10,
                  maxHeight: 82,
                  overflow: "hidden",
                  fontSize: getOptionFontSize(optionB),
                  lineHeight: 1.08,
                  fontWeight: 900,
                  wordBreak: "keep-all",
                }}
              >
                {optionB}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22 }}>
          <span style={{ color: "#E7B933", fontWeight: 800 }}>사람들은 뭘 선택했을까?</span>
          <span style={{ color: "#71717a" }}>vs-arena-two.vercel.app</span>
        </div>
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    }
  );
};
