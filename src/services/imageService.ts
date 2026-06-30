import { auth } from "./firebase";

async function getHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (user) {
    const token = await user.getIdToken();
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function generateTherapistAvatar(): Promise<string | null> {
  try {
    const headers = await getHeaders();
    const response = await fetch("/api/gemini/generate-avatar", {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Erro ao gerar avatar: ${response.statusText}`);
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error("Erro ao gerar avatar via servidor:", error);
    return null;
  }
}

export async function generateNewsImage(theme: string): Promise<string | null> {
  try {
    const headers = await getHeaders();
    const response = await fetch("/api/gemini/generate-news-image", {
      method: "POST",
      headers,
      body: JSON.stringify({ theme }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao gerar imagem de notícia: ${response.statusText}`);
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error("Erro ao gerar imagem de notícia via servidor:", error);
    return null;
  }
}
