"use client"

import * as React from "react"

import {
    Save,
    User,
    Globe,
    Bell,
    Plug,
    Shield,
    Upload,
    Link2,
    KeyRound,
    Trash2,
    CheckCircle2,
    Image as ImageIcon,
    Users,
    Mail,
    Send,
    X,
    RotateCw,
    Clock3,
} from "lucide-react"


type Tab = "profile" | "website" | "team" | "notifications" | "integrations" | "security"


type Role = "owner" | "admin" | "editor" | "viewer"


type Member = {
    id: number
    name: string
    email: string
    role: Role
    lastActive: string
}


type Invite = {
    id: number
    email: string
    role: Exclude<Role, "owner">
    sentAt: string
}


const roleMeta: Record<Exclude<Role, "owner">, {
    label: string
    description: string
}> = {
    admin: {
        label: "Admin",
        description: "Full access, including team and settings",
    },
    editor: {
        label: "Editor",
        description: "Edit website pages, videos, ideas and research",
    },
    viewer: {
        label: "Viewer",
        description: "Read-only access to the dashboard",
    },
}


const initialMembers: Member[] = [
    { id: 1, name: "Harsh Bhosale", email: "harsh@example.com", role: "owner", lastActive: "Now" },
    { id: 2, name: "Riya Deshmukh", email: "riya.editor@gmail.com", role: "editor", lastActive: "2 hrs ago" },
    { id: 3, name: "Kunal Patil", email: "kunal.research@gmail.com", role: "viewer", lastActive: "3 days ago" },
]


const initialInvites: Invite[] = [
    { id: 1, email: "video.editor@studio.in", role: "editor", sentAt: "Sep 29, 2026" },
]


const tabs: {
    id: Tab
    label: string
    icon: React.ElementType
}[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "website", label: "Website", icon: Globe },
    { id: "team", label: "Team & Access", icon: Users },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Plug },
    { id: "security", label: "Security", icon: Shield },
]


const integrations = [
    { name: "YouTube Data API", description: "Sync videos, stats and comments", connected: true },
    { name: "Cloudinary", description: "Image and video storage for the website", connected: true },
    { name: "Resend", description: "Send newsletter campaigns", connected: false },
    { name: "Google Analytics", description: "Website traffic analytics", connected: false },
]


export default function SettingsPage() {

    const [tab, setTab] =
        React.useState<Tab>("profile")

    const [saved, setSaved] =
        React.useState(false)


    /* PROFILE */

    const [name, setName] = React.useState("Harsh Bhosale")
    const [email, setEmail] = React.useState("harsh@example.com")
    const [bio, setBio] = React.useState("Independent journalist and YouTube creator covering policy, climate and the systems that shape India.")


    /* WEBSITE */

    const [siteTitle, setSiteTitle] = React.useState("Harsh Bhosale - YouTube")
    const [siteDescription, setSiteDescription] = React.useState("Stories that deserves a closer look")
    const [siteUrl, setSiteUrl] = React.useState("https://harshbhosale.com")
    const [maintenance, setMaintenance] = React.useState(false)
    const [indexing, setIndexing] = React.useState(true)


    /* NOTIFICATIONS */

    const [notifications, setNotifications] = React.useState({
        comments: true,
        contact: true,
        subscribers: false,
        weekly: true,
        sync: false,
    })


    /* TEAM */

    const [members, setMembers] = React.useState<Member[]>(initialMembers)
    const [invites, setInvites] = React.useState<Invite[]>(initialInvites)
    const [inviteEmail, setInviteEmail] = React.useState("")
    const [inviteRole, setInviteRole] = React.useState<Exclude<Role, "owner">>("editor")
    const [inviteError, setInviteError] = React.useState("")
    const [inviteOnly, setInviteOnly] = React.useState(true)
    const [require2fa, setRequire2fa] = React.useState(false)


    function sendInvite() {

        const email = inviteEmail.trim().toLowerCase()

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setInviteError("Enter a valid email address.")
            return
        }

        if (
            members.some((m) => m.email === email) ||
            invites.some((i) => i.email === email)
        ) {
            setInviteError("This person already has access or a pending invite.")
            return
        }

        setInvites((current) => [
            {
                id: Date.now(),
                email,
                role: inviteRole,
                sentAt: new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                }),
            },
            ...current,
        ])

        setInviteEmail("")
        setInviteError("")
    }


    function save() {
        setSaved(true)
        setTimeout(() => setSaved(false), 1600)
    }


    return (
        <div className="min-h-full bg-zinc-50 dark:bg-black">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">

                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-red-500">
                        Settings
                    </p>

                    <h1 className="text-lg font-semibold">
                        {tabs.find((t) => t.id === tab)?.label}
                    </h1>
                </div>

                <button
                    type="button"
                    onClick={save}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                    {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                    {saved ? "Saved" : "Save Changes"}
                </button>

            </header>


            {/* =====================================================
                MAIN
            ===================================================== */}

            <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-[240px_1fr]">

                {/* TABS */}

                <aside className="border-r border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">

                    {tabs.map((t) => {

                        const Icon = t.icon
                        const active = tab === t.id

                        return (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setTab(t.id)}
                                className={`mb-1 flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition ${active
                                    ? "border-red-500/30 bg-red-500/5 font-medium text-red-500"
                                    : "border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                    }`}
                            >
                                <Icon size={16} className={active ? "" : "text-zinc-400"} />
                                {t.label}
                            </button>
                        )
                    })}

                </aside>


                <main className="bg-white dark:bg-zinc-950">

                    <div className="mx-auto max-w-3xl p-6">

                        {/* =================================================
                            PROFILE
                        ================================================= */}

                        {tab === "profile" && (
                            <>
                                <EditorSection number="01" title="Avatar">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-xl font-semibold text-white">
                                            {name.charAt(0)}
                                        </div>
                                        <div>
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                                            >
                                                <Upload size={14} />
                                                Upload photo
                                            </button>
                                            <p className="mt-2 text-[11px] text-zinc-500">
                                                JPG or PNG, at least 400 × 400.
                                            </p>
                                        </div>
                                    </div>
                                </EditorSection>

                                <EditorSection number="02" title="Personal Information">
                                    <div className="space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Field label="Full Name">
                                                <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                                            </Field>
                                            <Field label="Email">
                                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                                            </Field>
                                        </div>
                                        <Field label="Bio">
                                            <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className={`${inputClass} resize-none leading-6`} />
                                        </Field>
                                    </div>
                                </EditorSection>
                            </>
                        )}


                        {/* =================================================
                            WEBSITE
                        ================================================= */}

                        {tab === "website" && (
                            <>
                                <EditorSection number="01" title="SEO">
                                    <div className="space-y-4">
                                        <Field label="Site Title">
                                            <input value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} className={inputClass} />
                                        </Field>
                                        <Field label="Meta Description">
                                            <textarea rows={3} value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} className={`${inputClass} resize-none leading-6`} />
                                        </Field>
                                        <Field label="Site URL">
                                            <div className="relative">
                                                <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                                <input value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} className={`${inputClass} pl-9`} />
                                            </div>
                                        </Field>
                                    </div>
                                </EditorSection>

                                <EditorSection number="02" title="Branding">
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {["Logo", "Favicon"].map((label) => (
                                            <div
                                                key={label}
                                                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-8 text-center dark:border-zinc-700 dark:bg-zinc-900"
                                            >
                                                <ImageIcon size={22} className="text-zinc-400" />
                                                <p className="mt-2 text-sm font-medium">{label}</p>
                                                <button
                                                    type="button"
                                                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                                                >
                                                    <Upload size={14} />
                                                    Upload
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </EditorSection>

                                <EditorSection number="03" title="Visibility">
                                    <div className="space-y-3">
                                        <SettingRow title="Allow Search Engines" description="Let Google and others index your website">
                                            <Toggle checked={indexing} onChange={setIndexing} />
                                        </SettingRow>
                                        <SettingRow title="Maintenance Mode" description="Show a maintenance page to visitors">
                                            <Toggle checked={maintenance} onChange={setMaintenance} />
                                        </SettingRow>
                                    </div>
                                </EditorSection>
                            </>
                        )}


                        {/* =================================================
                            TEAM & ACCESS
                        ================================================= */}

                        {tab === "team" && (
                            <>
                                <EditorSection number="01" title="Invite to Dashboard">

                                    <p className="-mt-2 mb-4 text-xs leading-5 text-zinc-500">
                                        Invited people can sign in to the dashboard only with the email
                                        address you invite. Anyone else is blocked, even if they have the link.
                                    </p>

                                    <div className="flex flex-col gap-2 sm:flex-row">

                                        <div className="relative flex-1">
                                            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                            <input
                                                type="email"
                                                value={inviteEmail}
                                                onChange={(e) => {
                                                    setInviteEmail(e.target.value)
                                                    setInviteError("")
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") sendInvite()
                                                }}
                                                placeholder="name@example.com"
                                                className={`${inputClass} pl-9`}
                                            />
                                        </div>

                                        <select
                                            value={inviteRole}
                                            onChange={(e) => setInviteRole(e.target.value as Exclude<Role, "owner">)}
                                            className={`${inputClass} sm:w-36`}
                                        >
                                            {(Object.keys(roleMeta) as Exclude<Role, "owner">[]).map((role) => (
                                                <option key={role} value={role}>
                                                    {roleMeta[role].label}
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            type="button"
                                            onClick={sendInvite}
                                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                                        >
                                            <Send size={15} />
                                            Invite
                                        </button>

                                    </div>

                                    {inviteError && (
                                        <p className="mt-2 text-xs text-red-500">
                                            {inviteError}
                                        </p>
                                    )}

                                    <p className="mt-2 text-[11px] text-zinc-500">
                                        {roleMeta[inviteRole].label}: {roleMeta[inviteRole].description}
                                    </p>

                                </EditorSection>


                                <EditorSection number="02" title={`Members (${members.length})`}>

                                    <div className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">

                                        {members.map((member) => (

                                            <div key={member.id} className="flex items-center gap-3 px-4 py-3">

                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold dark:bg-zinc-900">
                                                    {member.name.charAt(0)}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {member.name}
                                                    </p>
                                                    <p className="truncate text-xs text-zinc-500">
                                                        {member.email} · {member.lastActive}
                                                    </p>
                                                </div>

                                                {member.role === "owner" ? (
                                                    <span className="rounded-md bg-red-500/10 px-2 py-1 text-[10px] font-medium text-red-500">
                                                        Owner
                                                    </span>
                                                ) : (
                                                    <>
                                                        <select
                                                            value={member.role}
                                                            onChange={(e) =>
                                                                setMembers((current) =>
                                                                    current.map((m) =>
                                                                        m.id === member.id
                                                                            ? { ...m, role: e.target.value as Role }
                                                                            : m
                                                                    )
                                                                )
                                                            }
                                                            className="rounded-md border border-zinc-200 bg-transparent px-2 py-1.5 text-xs dark:border-zinc-800"
                                                        >
                                                            {(Object.keys(roleMeta) as Exclude<Role, "owner">[]).map((role) => (
                                                                <option key={role} value={role}>
                                                                    {roleMeta[role].label}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        <button
                                                            type="button"
                                                            aria-label="Remove access"
                                                            onClick={() =>
                                                                setMembers((current) => current.filter((m) => m.id !== member.id))
                                                            }
                                                            className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </>
                                                )}

                                            </div>

                                        ))}

                                    </div>

                                </EditorSection>


                                <EditorSection number="03" title={`Pending Invites (${invites.length})`}>

                                    {invites.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-zinc-300 px-5 py-8 text-center dark:border-zinc-700">
                                            <Mail size={20} className="mx-auto text-zinc-400" />
                                            <p className="mt-2 text-xs text-zinc-500">
                                                No pending invites.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {invites.map((invite) => (
                                                <div
                                                    key={invite.id}
                                                    className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
                                                >
                                                    <Clock3 size={15} className="shrink-0 text-zinc-400" />

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium">
                                                            {invite.email}
                                                        </p>
                                                        <p className="text-xs text-zinc-500">
                                                            {roleMeta[invite.role].label} · Sent {invite.sentAt}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-white"
                                                    >
                                                        <RotateCw size={12} />
                                                        Resend
                                                    </button>

                                                    <button
                                                        type="button"
                                                        aria-label="Revoke invite"
                                                        onClick={() =>
                                                            setInvites((current) => current.filter((i) => i.id !== invite.id))
                                                        }
                                                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                                                    >
                                                        <X size={15} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </EditorSection>


                                <EditorSection number="04" title="Sign-in Rules">
                                    <div className="space-y-3">
                                        <SettingRow
                                            title="Invited emails only"
                                            description="Only the owner and invited members can sign in. Everyone else is denied."
                                        >
                                            <Toggle checked={inviteOnly} onChange={setInviteOnly} />
                                        </SettingRow>
                                        <SettingRow
                                            title="Require two-factor authentication"
                                            description="Members must verify with a second factor before entering the dashboard"
                                        >
                                            <Toggle checked={require2fa} onChange={setRequire2fa} />
                                        </SettingRow>
                                    </div>
                                </EditorSection>
                            </>
                        )}


                        {/* =================================================
                            NOTIFICATIONS
                        ================================================= */}

                        {tab === "notifications" && (
                            <EditorSection number="01" title="Email Notifications">
                                <div className="space-y-3">
                                    {([
                                        ["comments", "New Comments", "When someone comments on your videos"],
                                        ["contact", "Contact Form", "When a visitor submits the contact form"],
                                        ["subscribers", "New Subscribers", "When someone joins your newsletter"],
                                        ["weekly", "Weekly Summary", "A weekly report of channel performance"],
                                        ["sync", "Sync Errors", "When YouTube sync fails"],
                                    ] as const).map(([key, title, description]) => (
                                        <SettingRow key={key} title={title} description={description}>
                                            <Toggle
                                                checked={notifications[key]}
                                                onChange={(checked) => setNotifications({ ...notifications, [key]: checked })}
                                            />
                                        </SettingRow>
                                    ))}
                                </div>
                            </EditorSection>
                        )}


                        {/* =================================================
                            INTEGRATIONS
                        ================================================= */}

                        {tab === "integrations" && (
                            <EditorSection number="01" title="Connected Services">
                                <div className="space-y-3">
                                    {integrations.map((item) => (
                                        <div
                                            key={item.name}
                                            className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
                                                    <Plug size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{item.name}</p>
                                                    <p className="mt-0.5 text-xs text-zinc-500">{item.description}</p>
                                                </div>
                                            </div>

                                            {item.connected ? (
                                                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-[11px] font-medium text-green-600">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                                    Connected
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="shrink-0 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                                                >
                                                    Connect
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </EditorSection>
                        )}


                        {/* =================================================
                            SECURITY
                        ================================================= */}

                        {tab === "security" && (
                            <>
                                <EditorSection number="01" title="Password">
                                    <div className="space-y-4">
                                        <Field label="Current Password">
                                            <input type="password" className={inputClass} />
                                        </Field>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Field label="New Password">
                                                <input type="password" className={inputClass} />
                                            </Field>
                                            <Field label="Confirm Password">
                                                <input type="password" className={inputClass} />
                                            </Field>
                                        </div>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                                        >
                                            <KeyRound size={14} />
                                            Update Password
                                        </button>
                                    </div>
                                </EditorSection>

                                <EditorSection number="02" title="Danger Zone">
                                    <div className="flex flex-col gap-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-red-500">
                                                Delete all website content
                                            </p>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                Permanently remove pages, media and settings. This can&apos;t be undone.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    </div>
                                </EditorSection>
                            </>
                        )}

                    </div>

                </main>

            </div>

        </div>
    )
}


/* =============================================================
   EDITOR SECTION
============================================================= */

function EditorSection({
    number,
    title,
    children,
}: {
    number: string
    title: string
    children: React.ReactNode
}) {

    return (
        <section className="mb-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">

            <div className="mb-5 flex items-center gap-3">

                <span className="text-[10px] font-semibold tracking-widest text-red-500">
                    {number}
                </span>

                <h2 className="text-sm font-semibold">
                    {title}
                </h2>

            </div>

            {children}

        </section>
    )
}


/* =============================================================
   FIELD
============================================================= */

function Field({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) {

    return (
        <div className="space-y-2">

            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {label}
            </label>

            {children}

        </div>
    )
}


/* =============================================================
   SETTING ROW
============================================================= */

function SettingRow({
    title,
    description,
    children,
}: {
    title: string
    description: string
    children: React.ReactNode
}) {

    return (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">

            <div>
                <p className="text-sm font-medium">
                    {title}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                    {description}
                </p>
            </div>

            {children}

        </div>
    )
}


/* =============================================================
   TOGGLE
============================================================= */

function Toggle({
    checked,
    onChange,
}: {
    checked: boolean
    onChange: (value: boolean) => void
}) {

    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative h-5 w-9 shrink-0 rounded-full transition ${checked
                ? "bg-red-600"
                : "bg-zinc-300 dark:bg-zinc-700"
                }`}
        >
            <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${checked
                    ? "left-[18px]"
                    : "left-0.5"
                    }`}
            />
        </button>
    )
}


const inputClass = `
    w-full
    rounded-lg
    border
    border-zinc-200
    bg-white
    px-3
    py-2.5
    text-sm
    outline-none
    focus:border-red-500
    focus:ring-2
    focus:ring-red-500/10
    dark:border-zinc-800
    dark:bg-zinc-900
`
