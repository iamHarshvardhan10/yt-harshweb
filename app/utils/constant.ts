export const featuredVideos = [
    {
        id: "video-001",
        title: "Why Mumbai Floods Every Monsoon",
        description:
            "An investigation into Mumbai's drainage system, flooding, and the decisions behind the city's recurring waterlogging.",
        category: "Investigation",
        thumbnail: "/thumbnails/01thumb.jpg",
        youtubeUrl: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
        publishedAt: "2026-08-20",
        duration: "18:42",
        featured: true,
    },
    {
        id: "video-002",
        title: "The Truth Behind India's E20 Fuel",
        description:
            "What does E20 actually mean for your vehicle, mileage, fuel efficiency, and India's ethanol blending policy?",
        category: "Explainer",
        thumbnail: "/thumbnails/02thumb.jpg",
        youtubeUrl: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
        publishedAt: "2026-08-12",
        duration: "14:35",
        featured: true,
    },
    {
        id: "video-003",
        title: "How Singapore Controls Urban Flooding",
        description:
            "A look at how Singapore uses drainage infrastructure, technology, sensors, and planning to manage heavy rainfall.",
        category: "Investigation",
        thumbnail: "/thumbnails/03thumb.jpg",
        youtubeUrl: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
        publishedAt: "2026-08-05",
        duration: "16:20",
        featured: true,
    },
    {
        id: "video-004",
        title: "Where Does Your Education Money Go?",
        description:
            "Understanding India's education spending, government budgets, and the changing share of public expenditure.",
        category: "Explainer",
        thumbnail: "/thumbnails/01thumb.jpg",
        youtubeUrl: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
        publishedAt: "2026-07-28",
        duration: "12:48",
        featured: true,
    },
    {
        id: "video-005",
        title: "Mumbai's Drainage System Explained",
        description:
            "Why does Mumbai struggle with waterlogging despite decades of drainage projects? We break down how the city's drainage network works.",
        category: "Investigation",
        thumbnail: "/thumbnails/02thumb.jpg",
        youtubeUrl: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
        publishedAt: "2026-07-20",
        duration: "20:15",
        featured: true,
    },
    {
        id: "video-006",
        title: "The Hidden Cost of India's Infrastructure",
        description:
            "From massive budgets to unfinished projects, we examine where infrastructure spending goes and what taxpayers actually get.",
        category: "Investigation",
        thumbnail: "/thumbnails/03thumb.jpg",
        youtubeUrl: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
        publishedAt: "2026-07-14",
        duration: "17:36",
        featured: true,
    },

];



export type ContentType = "video" | "short";


export const videos = [
    ...featuredVideos.map((video) => ({ ...video, type: "video" as ContentType })),
    {
        id: "short-001",
        title: "What Happened in Nepal?",
        description: "The glacier collapse explained in under a minute.",
        category: "Climate",
        thumbnail: "/thumbnails/01thumb.jpg",
        youtubeUrl: "https://www.youtube.com/shorts/YOUR_SHORT_ID",
        publishedAt: "2026-09-24",
        duration: "00:48",
        featured: false,
        type: "short" as ContentType,
    },
    {
        id: "short-002",
        title: "Can One Glacier Cause a Flash Flood?",
        description: "How glacial lakes burst and why the Himalayas are at risk.",
        category: "Climate",
        thumbnail: "/thumbnails/02thumb.jpg",
        youtubeUrl: "https://www.youtube.com/shorts/YOUR_SHORT_ID",
        publishedAt: "2026-09-18",
        duration: "00:52",
        featured: false,
        type: "short" as ContentType,
    },
    {
        id: "short-003",
        title: "E20 in 60 Seconds",
        description: "What ethanol blending actually does to your fuel tank.",
        category: "Explainer",
        thumbnail: "/thumbnails/03thumb.jpg",
        youtubeUrl: "https://www.youtube.com/shorts/YOUR_SHORT_ID",
        publishedAt: "2026-09-10",
        duration: "00:59",
        featured: false,
        type: "short" as ContentType,
    },
    {
        id: "short-004",
        title: "Why Mumbai's Drains Overflow",
        description: "A 25 mm/hr design limit in a city that gets 50+.",
        category: "Investigation",
        thumbnail: "/thumbnails/01thumb.jpg",
        youtubeUrl: "https://www.youtube.com/shorts/YOUR_SHORT_ID",
        publishedAt: "2026-09-02",
        duration: "00:45",
        featured: false,
        type: "short" as ContentType,
    },
    {
        id: "short-005",
        title: "Where Paper Leaks Start",
        description: "The weakest link in India's exam system.",
        category: "Investigation",
        thumbnail: "/thumbnails/02thumb.jpg",
        youtubeUrl: "https://www.youtube.com/shorts/YOUR_SHORT_ID",
        publishedAt: "2026-08-26",
        duration: "00:55",
        featured: false,
        type: "short" as ContentType,
    },
];


export type Investigation = {
    slug: string
    title: string
    summary: string
    body: string[]
    category: string
    date: string
    thumbnail: string
    youtubeUrl: string
    youtubeId: string
    duration: string
    pdfUrl: string
    pdfSize: string
    pages: number
    readTime: string
    keyFindings: string[]
}


export const investigations: Investigation[] = [
    {
        slug: "why-mumbai-floods-every-monsoon",
        title: "Why Mumbai Floods Every Monsoon",
        summary:
            "A 1993 drainage masterplan, a 25 mm/hr design limit, and three decades of delays. We trace why India's financial capital still goes underwater every year.",
        body: [
            "Every monsoon, the same images return: submerged local trains, stranded commuters and flooded homes. Mumbai's problem is not only the rain, it is a drainage network designed for a city that no longer exists.",
            "The BRIMSTOWAD masterplan, first drafted in 1993, identified the city's storm water drains as capable of handling just 25 mm of rain per hour. Mumbai now regularly sees more than double that.",
            "We reviewed municipal budgets, project timelines and rainfall records to understand where the money went, which projects stalled, and what it would take to fix the system.",
        ],
        category: "Infrastructure",
        date: "2026-09-12",
        thumbnail: "/thumbnails/01thumb.jpg",
        youtubeUrl: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
        youtubeId: "YOUR_VIDEO_ID",
        duration: "18:42",
        pdfUrl: "#",
        pdfSize: "8.4 MB",
        pages: 42,
        readTime: "25 min",
        keyFindings: [
            "Drains designed for 25 mm/hr; peak rainfall now exceeds 50 mm/hr",
            "Key pumping stations delayed by over a decade",
            "Mangrove loss reduced natural flood buffers across the coastline",
        ],
    },
    {
        slug: "truth-behind-india-e20-fuel",
        title: "The Truth Behind India's E20 Fuel",
        summary:
            "What does 20% ethanol blending mean for your vehicle, your mileage and India's energy security? We read the roadmap so you don't have to.",
        body: [
            "India's shift to E20 petrol is one of the fastest fuel transitions in the world. But for millions of vehicle owners, the change arrived with little explanation.",
            "We examined the NITI Aayog roadmap, manufacturer compatibility data and independent mileage tests to separate fact from fear.",
            "The result is a clearer picture of who benefits, who pays, and what questions remain unanswered.",
        ],
        category: "Energy",
        date: "2026-09-08",
        thumbnail: "/thumbnails/02thumb.jpg",
        youtubeUrl: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
        youtubeId: "YOUR_VIDEO_ID",
        duration: "14:35",
        pdfUrl: "#",
        pdfSize: "6.2 MB",
        pages: 31,
        readTime: "18 min",
        keyFindings: [
            "Older vehicles may see a 3–6% drop in mileage",
            "Rubber seals and fuel lines are the main compatibility risk",
            "Ethanol blending reduces crude imports but raises food-vs-fuel concerns",
        ],
    },
    {
        slug: "nepal-glacier-collapse-india-flood-risk",
        title: "Nepal Glacier Collapse & India's Flood Risk",
        summary:
            "Glacial lakes across the Himalayas are growing. We map the risk and ask whether India's early warning systems are ready.",
        body: [
            "When a glacial lake bursts, the flood can travel hundreds of kilometres downstream within hours. The Himalayas hold thousands of such lakes, and many are expanding.",
            "Using satellite imagery and risk assessments from ICIMOD, we identify the lakes that pose the greatest danger to Indian communities.",
            "We also look at what went wrong in recent disasters, and what early warning systems could have changed.",
        ],
        category: "Environment",
        date: "2026-09-05",
        thumbnail: "/thumbnails/03thumb.jpg",
        youtubeUrl: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
        youtubeId: "YOUR_VIDEO_ID",
        duration: "16:20",
        pdfUrl: "#",
        pdfSize: "11.8 MB",
        pages: 56,
        readTime: "32 min",
        keyFindings: [
            "47 glacial lakes classified as potentially dangerous",
            "Several warning systems were installed but not operational",
            "Downstream dams increase the scale of potential damage",
        ],
    },
    {
        slug: "tripura-dependence-on-bangladesh",
        title: "How Dependent Is Tripura on Bangladesh?",
        summary:
            "Trade routes, power supply and transit corridors: we examine how closely Tripura's economy is tied to its neighbour.",
        body: [
            "Surrounded on three sides by Bangladesh, Tripura's geography shapes its economy. Many of its supply lines run through its neighbour.",
            "We look at trade data, transit agreements and infrastructure projects to understand how deep that dependence runs.",
            "And we ask what happens to the state when relations between the two countries change.",
        ],
        category: "Geopolitics",
        date: "2026-09-02",
        thumbnail: "/thumbnails/01thumb.jpg",
        youtubeUrl: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
        youtubeId: "YOUR_VIDEO_ID",
        duration: "12:48",
        pdfUrl: "#",
        pdfSize: "5.6 MB",
        pages: 28,
        readTime: "16 min",
        keyFindings: [
            "Chittagong port access cuts freight distance by over 1,000 km",
            "Tripura exports surplus power to Bangladesh",
            "Border trade hubs remain underused due to policy friction",
        ],
    },
];


export const metrics = [
    {
        id: "01",
        title: "Monthly Visits",
        value: "120K+",
    },
    {
        id: "02",
        title: "Return Listeners",
        value: "85%",
    },
    {
        id: "03",
        title: "Published Episodes",
        value: "250+",
    },
    {
        id: "04",
        title: "Average Watch Time",
        value: "15min",
    }
]