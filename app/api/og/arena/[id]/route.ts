import { arenas } from "@/lib/arena-data";
import { renderArenaOgImage } from "@/lib/arena-og";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const arena = arenas.find((item) => item.id === Number(id));

  try {
    return renderArenaOgImage(arena);
  } catch {
    return Response.redirect(new URL("/opengraph-image", request.url), 302);
  }
}
