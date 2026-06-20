import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
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
          color: "white",
          padding: 72,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            color: "#E7B933",
            fontWeight: 900,
          }}
        >
          <span>SOCIAL VOTING ARENA</span>
          <span>A OR B</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 104, lineHeight: 0.9, fontWeight: 1000 }}>
            VS ARENA
          </div>
          <div style={{ maxWidth: 930, fontSize: 42, lineHeight: 1.25, color: "#d8d8df" }}>
            사람들은 뭘 선택했을까?
          </div>
          <div style={{ maxWidth: 930, fontSize: 28, lineHeight: 1.35, color: "#92929d" }}>
            A/B 중 하나를 고르고, 다른 사람들의 선택과 의견을 확인해보세요.
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, fontSize: 30, fontWeight: 900 }}>
          <span style={{ background: "#A53A4A", padding: "16px 24px" }}>A에 한 표</span>
          <span style={{ background: "#2D6A9F", padding: "16px 24px" }}>B에 한 표</span>
          <span style={{ background: "#E7B933", color: "#090b10", padding: "16px 24px" }}>
            현재 민심 보기
          </span>
        </div>
      </div>
    ),
    size
  );
}
