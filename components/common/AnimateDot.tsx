interface AnimatedDotTextProps {
    text: string,
    className?: string,
    textClassName?: string
}

export default function AnimatedDotText({ text, className, textClassName }: AnimatedDotTextProps) {
    return (
        <div className={`flex items-center  gap-3 ${className}`}>
            <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute w-3 h-3 rounded-full bg-white animate-pulse-dot" />

                <div className="absolute w-3 h-3 rounded-full border-2 border-white animate-ripple" />

                <div className="absolute w-3 h-3 rounded-full border-2 border-white animate-ripple [animation-delay:0.7s]" />

                <div className="absolute w-3 h-3 rounded-full border-2 border-white animate-ripple [animation-delay:1.4s]" />
            </div>

            <span className={`uppercase text-sm tracking-wider ${textClassName}`}>{text}</span>
        </div>
    )
}