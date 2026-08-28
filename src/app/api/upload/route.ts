import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "Credenciales de Cloudinary no configuradas" }, { status: 500 });
    }

    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    const folder = "flores";

    // Generar firma SHA-1
    const signatureStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureStr).digest("hex");

    // Preparar formData para Cloudinary
    const cloudinaryFormData = new FormData();
    const blob = new Blob([buffer], { type: file.type });
    cloudinaryFormData.append("file", blob, file.name);
    cloudinaryFormData.append("api_key", apiKey);
    cloudinaryFormData.append("timestamp", timestamp);
    cloudinaryFormData.append("folder", folder);
    cloudinaryFormData.append("signature", signature);

    // Determinar el resource_type ("image" o "video")
    const resourceType = file.type.startsWith("video") ? "video" : "image";

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Cloudinary error:", result);
      return NextResponse.json({ error: result.error?.message || "Error al subir a Cloudinary" }, { status: 500 });
    }

    return NextResponse.json({
      url: result.secure_url,
      format: result.format,
      resource_type: result.resource_type,
    });
  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
