// app/api/media/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import { MediaResourceType } from "@prisma/client";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const folder = (formData.get("folder") as string) || "harshyt";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");

        if (!isVideo && !isImage) {
            return NextResponse.json(
                { error: "Only image or video files are allowed" },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await uploadBufferToCloudinary(buffer, {
            folder,
            resourceType: isVideo ? "video" : "image",
        });

        const media = await prisma.media.create({
            data: {
                publicId: result.public_id,
                secureUrl: result.secure_url,
                resourceType: isVideo ? MediaResourceType.VIDEO : MediaResourceType.IMAGE,
                originalName: result.original_filename ?? file.name,
                format: result.format,
                width: result.width,
                height: result.height,
                duration: result.duration,
                folder,
            },
        });

        return NextResponse.json({ media }, { status: 201 });
    } catch (err) {
        console.error("Upload error:", err);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}