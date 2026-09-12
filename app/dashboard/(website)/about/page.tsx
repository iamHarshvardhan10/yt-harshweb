
"use client"

import * as React from "react"

import {
    Plus,
    GripVertical,
    MoreHorizontal,
    Image as ImageIcon,
    Video,
    Type,
    Trash2,
    Upload,
    ChevronDown,
    ChevronUp,
    Save,
    LayoutPanelTop,
    Play,
} from "lucide-react"


type MediaItem = {
    id: number
    type: "image" | "video"
    name: string
    url: string
}


type AboutSection = {
    id: number
    title: string
    eyebrow: string
    heading: string
    content: string
    layout: "text-left" | "text-right" | "center"
    showOnHome: boolean
    visible: boolean
    media: MediaItem[]
}


const initialSections: AboutSection[] = [
    {
        id: 1,
        title: "Who We Are",
        eyebrow: "ABOUT US",
        heading: "Stories that deserve a closer look.",
        content:
            "We investigate the decisions, systems and consequences that shape the world around us. Our work focuses on making complex issues understandable through research, evidence and visual storytelling.",
        layout: "text-left",
        showOnHome: true,
        visible: true,
        media: [
            {
                id: 1,
                type: "image",
                name: "harsh-investigation.jpg",
                url: "/about-1.webp",
            },
            {
                id: 2,
                type: "image",
                name: "research-room.jpg",
                url: "/about-2.webp",
            },
        ],
    },

    {
        id: 2,
        title: "Why We Investigate",
        eyebrow: "OUR APPROACH",
        heading: "Look beyond the headline.",
        content:
            "Every major story has layers. We look at the data, documents, decisions and people behind an issue to understand what is really happening.",
        layout: "text-right",
        showOnHome: false,
        visible: true,
        media: [
            {
                id: 3,
                type: "video",
                name: "investigation-process.mp4",
                url: "/investigation.mp4",
            },
        ],
    },

    {
        id: 3,
        title: "Our Work",
        eyebrow: "THE WORK",
        heading: "Research. Investigate. Explain.",
        content:
            "From public policy and infrastructure to climate, technology and society, our stories aim to connect the facts with the people affected by them.",
        layout: "text-left",
        showOnHome: true,
        visible: true,
        media: [
            {
                id: 4,
                type: "image",
                name: "field-report.jpg",
                url: "/about-3.webp",
            },
            {
                id: 5,
                type: "video",
                name: "field-report.mp4",
                url: "/field-report.mp4",
            },
        ],
    },
]


export default function AboutPage() {

    const [sections, setSections] =
        React.useState<AboutSection[]>(initialSections)

    const [selectedId, setSelectedId] =
        React.useState<number>(1)

    const selectedSection =
        sections.find((section) => section.id === selectedId)


    /* =========================================================
       UPDATE SECTION
    ========================================================= */

    function updateSection(
        id: number,
        updates: Partial<AboutSection>
    ) {
        setSections((current) =>
            current.map((section) =>
                section.id === id
                    ? { ...section, ...updates }
                    : section
            )
        )
    }


    /* =========================================================
       ADD SECTION
    ========================================================= */

    function addSection() {

        const newSection: AboutSection = {
            id: Date.now(),
            title: "New Section",
            eyebrow: "NEW SECTION",
            heading: "Add your heading",
            content: "Start writing your content here.",
            layout: "text-left",
            showOnHome: false,
            visible: true,
            media: [],
        }

        setSections((current) => [
            ...current,
            newSection,
        ])

        setSelectedId(newSection.id)
    }


    /* =========================================================
       DELETE SECTION
    ========================================================= */

    function deleteSection(id: number) {

        setSections((current) =>
            current.filter((section) => section.id !== id)
        )

        if (selectedId === id) {

            const next = sections.find(
                (section) => section.id !== id
            )

            if (next) {
                setSelectedId(next.id)
            }
        }
    }


    return (
        <div className="min-h-full bg-zinc-50 dark:bg-black">


            {/* =====================================================
                HEADER
            ===================================================== */}

            <header
                className="
                    sticky
                    top-0
                    z-30
                    flex
                    h-16
                    items-center
                    justify-between
                    border-b
                    border-zinc-200
                    bg-white/95
                    px-6
                    backdrop-blur
                    dark:border-zinc-800
                    dark:bg-zinc-950/95
                "
            >

                <div>

                    <p className="text-xs font-medium uppercase tracking-widest text-red-500">
                        Website
                    </p>

                    <h1 className="text-lg font-semibold">
                        About Page
                    </h1>

                </div>


                <div className="flex items-center gap-3">

                    <button
                        className="
                            flex
                            items-center
                            gap-2
                            rounded-lg
                            bg-red-600
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-white
                            hover:bg-red-700
                        "
                    >

                        <Save size={16} />

                        Save Changes

                    </button>

                </div>

            </header>


            {/* =====================================================
                MAIN
            ===================================================== */}

            <div
                className="
                    grid
                    min-h-[calc(100vh-64px)]
                    lg:grid-cols-[280px_1fr]
                "
            >


                {/* ===================================================
                    SECTION LIST
                =================================================== */}

                <aside
                    className="
                        border-r
                        border-zinc-200
                        bg-white
                        dark:border-zinc-800
                        dark:bg-zinc-950
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            border-b
                            border-zinc-200
                            px-4
                            py-4
                            dark:border-zinc-800
                        "
                    >

                        <div>

                            <p className="text-sm font-semibold">
                                Page Sections
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                                {sections.length} sections
                            </p>

                        </div>


                        <button
                            onClick={addSection}
                            className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-lg
                                bg-red-600
                                text-white
                                hover:bg-red-700
                            "
                        >

                            <Plus size={16} />

                        </button>

                    </div>


                    <div className="p-3">

                        {sections.map((section, index) => {

                            const active =
                                selectedId === section.id

                            return (

                                <button
                                    key={section.id}
                                    onClick={() =>
                                        setSelectedId(section.id)
                                    }
                                    className={`
                                        mb-2
                                        flex
                                        w-full
                                        items-center
                                        gap-3
                                        rounded-lg
                                        border
                                        p-3
                                        text-left
                                        transition

                                        ${active
                                            ? "border-red-500/30 bg-red-500/5"
                                            : "border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                        }
                                    `}
                                >

                                    <GripVertical
                                        size={15}
                                        className="shrink-0 text-zinc-400"
                                    />


                                    <div
                                        className="
                                            flex
                                            h-9
                                            w-9
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-md
                                            bg-zinc-100
                                            dark:bg-zinc-900
                                        "
                                    >

                                        <LayoutPanelTop size={16} />

                                    </div>


                                    <div className="min-w-0 flex-1">

                                        <p className="truncate text-sm font-medium">
                                            {index + 1}. {section.title}
                                        </p>

                                        <p className="mt-1 text-[10px] text-zinc-500">

                                            {section.showOnHome
                                                ? "Shown on Home"
                                                : "About page only"}

                                        </p>

                                    </div>


                                    {section.showOnHome && (
                                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                    )}

                                </button>

                            )
                        })}


                        <button
                            onClick={addSection}
                            className="
                                mt-2
                                flex
                                w-full
                                items-center
                                justify-center
                                gap-2
                                rounded-lg
                                border
                                border-dashed
                                border-zinc-300
                                py-3
                                text-xs
                                font-medium
                                text-zinc-500
                                hover:border-zinc-400
                                hover:bg-zinc-50
                                dark:border-zinc-700
                                dark:hover:bg-zinc-900
                            "
                        >

                            <Plus size={14} />

                            Add Section

                        </button>

                    </div>

                </aside>


                {/* ===================================================
                    EDITOR
                =================================================== */}

                {selectedSection && (

                    <main
                        className="
                            overflow-y-auto
                            bg-white
                            dark:bg-zinc-950
                        "
                    >

                        <div className="mx-auto max-w-4xl p-6">


                            {/* SECTION HEADER */}

                            <div className="mb-7 flex items-start justify-between">

                                <div>

                                    <p className="text-xs font-medium uppercase tracking-widest text-red-500">

                                        Section{" "}
                                        {sections.findIndex(
                                            (s) =>
                                                s.id === selectedSection.id
                                        ) + 1}

                                    </p>

                                    <h2 className="mt-1 text-lg font-semibold">
                                        {selectedSection.title}
                                    </h2>

                                </div>


                                <button
                                    onClick={() =>
                                        deleteSection(selectedSection.id)
                                    }
                                    className="
                                        rounded-lg
                                        p-2
                                        text-zinc-400
                                        hover:bg-red-50
                                        hover:text-red-500
                                        dark:hover:bg-red-950/30
                                    "
                                >

                                    <Trash2 size={16} />

                                </button>

                            </div>


                            {/* =================================================
                                CONTENT
                            ================================================= */}

                            <EditorGroup
                                number="01"
                                title="Content"
                            >

                                <Field label="Section Name">

                                    <input
                                        value={selectedSection.title}
                                        onChange={(e) =>
                                            updateSection(
                                                selectedSection.id,
                                                {
                                                    title: e.target.value,
                                                }
                                            )
                                        }
                                        className={inputClass}
                                    />

                                </Field>


                                <Field label="Eyebrow">

                                    <input
                                        value={selectedSection.eyebrow}
                                        onChange={(e) =>
                                            updateSection(
                                                selectedSection.id,
                                                {
                                                    eyebrow: e.target.value,
                                                }
                                            )
                                        }
                                        className={inputClass}
                                    />

                                </Field>


                                <Field label="Heading">

                                    <textarea
                                        rows={3}
                                        value={selectedSection.heading}
                                        onChange={(e) =>
                                            updateSection(
                                                selectedSection.id,
                                                {
                                                    heading: e.target.value,
                                                }
                                            )
                                        }
                                        className={textareaClass}
                                    />

                                </Field>


                                <Field label="Content">

                                    <textarea
                                        rows={7}
                                        value={selectedSection.content}
                                        onChange={(e) =>
                                            updateSection(
                                                selectedSection.id,
                                                {
                                                    content: e.target.value,
                                                }
                                            )
                                        }
                                        className={textareaClass}
                                    />

                                </Field>

                            </EditorGroup>


                            {/* =================================================
                                LAYOUT
                            ================================================= */}

                            <EditorGroup
                                number="02"
                                title="Layout"
                            >

                                <p className="mb-3 text-xs text-zinc-500">
                                    Choose how content and media are arranged.
                                </p>


                                <div className="grid grid-cols-3 gap-2">

                                    <LayoutButton
                                        active={
                                            selectedSection.layout === "text-left"
                                        }
                                        onClick={() =>
                                            updateSection(
                                                selectedSection.id,
                                                {
                                                    layout: "text-left",
                                                }
                                            )
                                        }
                                        label="Text Left"
                                    />


                                    <LayoutButton
                                        active={
                                            selectedSection.layout === "text-right"
                                        }
                                        onClick={() =>
                                            updateSection(
                                                selectedSection.id,
                                                {
                                                    layout: "text-right",
                                                }
                                            )
                                        }
                                        label="Text Right"
                                    />


                                    <LayoutButton
                                        active={
                                            selectedSection.layout === "center"
                                        }
                                        onClick={() =>
                                            updateSection(
                                                selectedSection.id,
                                                {
                                                    layout: "center",
                                                }
                                            )
                                        }
                                        label="Centered"
                                    />

                                </div>

                            </EditorGroup>


                            {/* =================================================
                                MEDIA
                            ================================================= */}

                            <EditorGroup
                                number="03"
                                title="Media"
                            >

                                <div className="mb-4 flex items-center justify-between">

                                    <div>

                                        <p className="text-sm font-medium">
                                            Section Media
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-500">
                                            Images and videos can be combined.
                                        </p>

                                    </div>


                                    <button
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            rounded-lg
                                            border
                                            border-zinc-200
                                            px-3
                                            py-2
                                            text-xs
                                            font-medium
                                            hover:bg-zinc-100
                                            dark:border-zinc-800
                                            dark:hover:bg-zinc-900
                                        "
                                    >

                                        <Upload size={14} />

                                        Add Media

                                    </button>

                                </div>


                                <div className="space-y-2">

                                    {selectedSection.media.map((media) => (

                                        <div
                                            key={media.id}
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                                rounded-lg
                                                border
                                                border-zinc-200
                                                p-2
                                                dark:border-zinc-800
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    h-12
                                                    w-20
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    overflow-hidden
                                                    rounded-md
                                                    bg-zinc-900
                                                "
                                            >

                                                {media.type === "video" ? (
                                                    <Play
                                                        size={16}
                                                        className="text-white"
                                                        fill="white"
                                                    />
                                                ) : (
                                                    <ImageIcon
                                                        size={17}
                                                        className="text-white"
                                                    />
                                                )}

                                            </div>


                                            <div className="min-w-0 flex-1">

                                                <p className="truncate text-xs font-medium">
                                                    {media.name}
                                                </p>

                                                <p className="mt-1 text-[10px] text-zinc-500">

                                                    {media.type === "video"
                                                        ? "Video"
                                                        : "Image"}

                                                </p>

                                            </div>


                                            <button
                                                className="
                                                    text-zinc-400
                                                    hover:text-red-500
                                                "
                                            >

                                                <MoreHorizontal size={16} />

                                            </button>

                                        </div>

                                    ))}


                                    {selectedSection.media.length === 0 && (

                                        <div
                                            className="
                                                rounded-lg
                                                border
                                                border-dashed
                                                border-zinc-300
                                                px-5
                                                py-8
                                                text-center
                                                dark:border-zinc-700
                                            "
                                        >

                                            <ImageIcon
                                                size={22}
                                                className="mx-auto text-zinc-400"
                                            />

                                            <p className="mt-2 text-xs font-medium">
                                                No media added
                                            </p>

                                            <p className="mt-1 text-[11px] text-zinc-500">
                                                Add images or videos to this section.
                                            </p>

                                        </div>

                                    )}

                                </div>

                            </EditorGroup>


                            {/* =================================================
                                HOMEPAGE VISIBILITY
                            ================================================= */}

                            <EditorGroup
                                number="04"
                                title="Homepage"
                            >

                                <div
                                    className="
                                        rounded-xl
                                        border
                                        border-zinc-200
                                        p-4
                                        dark:border-zinc-800
                                    "
                                >

                                    <div className="flex items-start justify-between gap-4">

                                        <div>

                                            <div className="flex items-center gap-2">

                                                <p className="text-sm font-medium">
                                                    Show on Homepage
                                                </p>

                                            </div>

                                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                                                Display this About section on your
                                                homepage as well.
                                            </p>

                                        </div>


                                        <Toggle
                                            checked={selectedSection.showOnHome}
                                            onChange={(checked) =>
                                                updateSection(
                                                    selectedSection.id,
                                                    {
                                                        showOnHome: checked,
                                                    }
                                                )
                                            }
                                        />

                                    </div>


                                    {selectedSection.showOnHome && (

                                        <div className="mt-4 rounded-lg bg-red-500/5 p-3">

                                            <p className="text-xs font-medium text-red-500">
                                                Homepage enabled
                                            </p>

                                            <p className="mt-1 text-[11px] leading-5 text-zinc-500">
                                                This section will be available to render
                                                on the public homepage.
                                            </p>

                                        </div>

                                    )}

                                </div>

                            </EditorGroup>


                            {/* =================================================
                                VISIBILITY
                            ================================================= */}

                            <EditorGroup
                                number="05"
                                title="Visibility"
                            >

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-sm font-medium">
                                            Publish Section
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-500">
                                            Hide this section without deleting it.
                                        </p>

                                    </div>


                                    <Toggle
                                        checked={selectedSection.visible}
                                        onChange={(checked) =>
                                            updateSection(
                                                selectedSection.id,
                                                {
                                                    visible: checked,
                                                }
                                            )
                                        }
                                    />

                                </div>

                            </EditorGroup>

                        </div>

                    </main>

                )}

            </div>

        </div>
    )
}


/* =============================================================
   EDITOR GROUP
============================================================= */

function EditorGroup({
    number,
    title,
    children,
}: {
    number: string
    title: string
    children: React.ReactNode
}) {

    return (
        <section className="border-t border-zinc-200 pt-6 dark:border-zinc-800">

            <div className="mb-5 flex items-center gap-3">

                <span className="text-[10px] font-semibold tracking-widest text-red-500">
                    {number}
                </span>

                <h3 className="text-sm font-semibold">
                    {title}
                </h3>

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
        <div className="mb-5 space-y-2">

            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {label}
            </label>

            {children}

        </div>
    )
}


/* =============================================================
   LAYOUT BUTTON
============================================================= */

function LayoutButton({
    active,
    onClick,
    label,
}: {
    active: boolean
    onClick: () => void
    label: string
}) {

    return (
        <button
            onClick={onClick}
            className={`
                rounded-lg
                border
                px-2
                py-3
                text-xs
                font-medium
                transition

                ${active
                    ? "border-red-500 bg-red-500/5 text-red-500"
                    : "border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                }
            `}
        >

            {label}

        </button>
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
            className={`
                relative
                h-5
                w-9
                shrink-0
                rounded-full
                transition

                ${checked
                    ? "bg-red-600"
                    : "bg-zinc-300 dark:bg-zinc-700"
                }
            `}
        >

            <span
                className={`
                    absolute
                    top-0.5
                    h-4
                    w-4
                    rounded-full
                    bg-white
                    shadow
                    transition

                    ${checked
                        ? "left-[18px]"
                        : "left-0.5"
                    }
                `}
            />

        </button>
    )
}


/* =============================================================
   INPUT
============================================================= */

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


/* =============================================================
   TEXTAREA
============================================================= */

const textareaClass = `
    w-full
    resize-none
    rounded-lg
    border
    border-zinc-200
    bg-white
    px-3
    py-2.5
    text-sm
    leading-6
    outline-none
    focus:border-red-500
    focus:ring-2
    focus:ring-red-500/10
    dark:border-zinc-800
    dark:bg-zinc-900
`
