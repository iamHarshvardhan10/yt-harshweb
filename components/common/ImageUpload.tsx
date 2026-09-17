"use client"

import { CldUploadWidget } from "next-cloudinary"

interface ImageUploadProps {
    onUpload: (url: string, publicId: string) => void
}

export default function ImageUpload({
    onUpload,
}: ImageUploadProps) {
    return (
        <CldUploadWidget
            uploadPreset="harsh-website"
            onSuccess={(result) => {
                const info = result.info as {
                    secure_url: string
                    public_id: string
                }

                onUpload(
                    info.secure_url,
                    info.public_id
                )
            }}
        >
            {({ open }) => {
                return (
                    <button
                        type="button"
                        onClick={() => open()}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        Upload Image
                    </button>
                )
            }}
        </CldUploadWidget>
    )
}