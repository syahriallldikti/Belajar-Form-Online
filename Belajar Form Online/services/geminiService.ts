
import { GoogleGenAI, Type } from "@google/genai";
import { AttendanceRecord } from "../types";

export const analyzeAttendance = async (records: AttendanceRecord[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const attendeeList = records.map(r => 
    `- Nama: ${r.name}, Instansi: ${r.institution}, Jabatan: ${r.position}`
  ).join('\n');

  const prompt = `
    Berikut adalah daftar hadir kegiatan "Tindak Lanjut LHP BPK RI Tahun 2024":
    ${attendeeList}
    
    Tolong berikan analisis singkat dalam Bahasa Indonesia:
    1. Ringkasan jumlah dan profil peserta secara umum.
    2. Analisis keberagaman instansi yang hadir dalam konteks kegiatan LHP BPK RI.
    3. Rekomendasi pesan tindak lanjut (follow-up) yang formal dan sesuai untuk koordinasi LHP melalui grup WhatsApp berdasarkan profil peserta.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Maaf, sistem AI sedang sibuk. Silakan coba analisis lagi nanti.";
  }
};
