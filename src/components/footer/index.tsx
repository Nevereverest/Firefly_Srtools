export default function Footer() {
    return (
        <footer className="w-full border-t border-base-content/10 bg-base-100 py-6 px-4 mt-auto">
            <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-base-content/60 font-medium">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-base-content/80">Firefly Shelter</span>
                    <span>•</span>
                    <span>S Game Toolkit</span>
                </div>
                <div className="flex items-center gap-2">
                    <span>© {new Date().getFullYear()}</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-full bg-base-200 text-base-content/70 border border-white/5">Next.js & DaisyUI</span>
                </div>
            </div>
        </footer>
    )
}
