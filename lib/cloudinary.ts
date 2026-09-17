
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export type CloudinaryResourceType = "image" | "video" | "auto";

interface UploadOptions {
    folder?: string;
    resourceType?: CloudinaryResourceType;
}

interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    resource_type: string;
    format: string;
    width?: number;
    height?: number;
    duration?: number;
    original_filename: string;
    bytes: number;
}

export function uploadBufferToCloudinary(
    buffer: Buffer,
    { folder = "uploads", resourceType = "auto" }: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: resourceType },
            (error, result) => {
                if (error || !result) return reject(error ?? new Error("Cloudinary upload failed"));
                resolve(result as CloudinaryUploadResult);
            }
        );
        stream.end(buffer);
    });
}

export async function destroyCloudinaryAsset(
    publicId: string,
    resourceType: "image" | "video" = "image"
) {
    return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export default cloudinary;