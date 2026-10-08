import { NextRequest, NextResponse } from "next/server";
import { MediaResourceType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import { withAdmin } from "@/lib/auth/dal";

/** POST /api/media/upload  (multipart: file, folder?) → uploads to Cloudinary and stores a Media row */
export const POST = withAdmin(uploadMedia);

async function uploadMedia(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        const folder =
            (formData.get("folder") as string | null) || process.env.CLOUDINARY_FOLDER || "harshyt";

        if (!(file instanceof File)) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");

        if (!isVideo && !isImage) {
            return NextResponse.json({ error: "Only image or video files are allowed" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const result = await uploadBufferToCloudinary(buffer, {
            folder,
            resourceType: isVideo ? "video" : "image",
        });

        const media = await prisma.media.create({
            data: {
                publicId: result.public_id,
                secureUrl: result.secure_url,
                resourceType: isVideo ? MediaResourceType.VIDEO : MediaResourceType.IMAGE,
                originalName: file.name || result.original_filename,
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
