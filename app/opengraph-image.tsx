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
          background: "#08090d",
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
          <span>COMMENT WAR ARENA</span>
          <span>LIVE VS</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 104, lineHeight: 0.9, fontWeight: 1000 }}>
            VS ARENA
          </div>
          <div style={{ maxWidth: 900, fontSize: 42, lineHeight: 1.25, color: "#d8d8df" }}>
            남들 싸우는 거 구경하다 못 참겠으면 바로 참전.
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, fontSize: 30, fontWeight: 900 }}>
          <span style={{ background: "#A53A4A", padding: "16px 24px" }}>내 편 들기</span>
          <span style={{ background: "#2D6A9F", padding: "16px 24px" }}>댓글 전쟁</span>
          <span style={{ background: "#E7B933", color: "#08090d", padding: "16px 24px" }}>
            단톡방 투척용
          </span>
        </div>
      </div>
    ),
    size
  );
}
