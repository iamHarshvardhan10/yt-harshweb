"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"
import type { Media } from "@prisma/client"

import { api, useAction } from "@/components/dashboard/home/api"
import { EditorSection, MediaUpload, PrimaryButton, StatusText, TextField, inputClass, labelClass } from "@/components/dashboard/home/ui"
import type { Me } from "./SettingsManager"

type Saved = { user: { name: string; email: string; avatar: { secureUrl: string } | null } }

/** Lets the sidebar user menu update without a reload */
const announce = (detail: Partial<{ name: string; email: string; avatar: string | null }>) =>
    window.dispatchEvent(new CustomEvent("admin-profile", { detail }))

export default function ProfileTab({ me }: { me: Me }) {
    const router = useRouter()
    const [avatar, setAvatar] = React.useState<Media | null>(me.avatar)
    const [name, setName] = React.useState(me.name)
    const [email, setEmail] = React.useState(me.email)
    const [savedEmail, setSavedEmail] = React.useState(me.email)
    const [password, setPassword] = React.useState("")
    const save = useAction()

    const emailChanged = email.trim().toLowerCase() !== savedEmail

    async function saveAvatar(media: Media | null) {
        const { user } = await api<Saved>("/api/account", { method: "PATCH", json: { avatarId: media?.id ?? null } })
        setAvatar(media)
        announce({ avatar: user.avatar?.secureUrl ?? null })
        router.refresh()
    }

    function saveProfile() {
        save.run(async () => {
            const { user } = await api<Saved>("/api/account", {
                method: "PATCH",
                json: { name, email, ...(emailChanged && { currentPassword: password }) },
            })
            setSavedEmail(user.email)
            setEmail(user.email)
            setPassword("")
            announce({ name: user.name, email: user.email })
            router.refresh()
        }, emailChanged ? "Saved — sign in with your new email from now on" : "Saved")
    }

    return (
        <>
            <EditorSection number="01" title="Photo" description="Shown in the dashboard sidebar.">
                <MediaUpload
                    kind="image"
                    media={avatar}
                    compact
                    onUploaded={saveAvatar}
                    onRemove={avatar ? () => saveAvatar(null) : undefined}
                />
            </EditorSection>

            <EditorSection
                number="02"
                title="Personal Information"
                description="Your name appears on invites and emails you send to the team. The email is what you sign in with."
                actions={
                    <>
                        <StatusText status={save.status} />
                        <PrimaryButton pending={save.pending} onClick={saveProfile} disabled={!name.trim() || (emailChanged && !password)}>
                            <Save size={15} />
                            Save
                        </PrimaryButton>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField label="Full Name" value={name} onChange={setName} maxLength={80} />
                        <div className="space-y-2">
                            <label className={labelClass} htmlFor="profile-email">Sign-in email</label>
                            <input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                        </div>
                    </div>

                    {emailChanged && (
                        <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                            <label className={labelClass} htmlFor="profile-password">Current password</label>
                            <input
                                id="profile-password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClass}
                            />
                            <p className="text-[11px] text-zinc-500">
                                Needed to change your sign-in email. Your Google Authenticator entry keeps working.
                            </p>
                        </div>
                    )}
                </div>
            </EditorSection>
        </>
    )
}
