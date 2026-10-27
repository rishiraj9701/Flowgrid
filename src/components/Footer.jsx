import React from 'react'

/**
 * Minimal, elegant developer attribution footer.
 * Matches existing light and dark themes across Landing and Dashboard pages.
 */
const Footer = ({ className = '', variant = 'dashboard' }) => {
    const isLanding = variant === 'landing'

    const dividerClass = isLanding
        ? 'border-zinc-200/70 dark:border-zinc-800/60'
        : 'border-slate-200/90 dark:border-slate-800/80'

    const textClass = isLanding
        ? 'text-zinc-500 dark:text-zinc-400'
        : 'text-slate-500 dark:text-slate-400'

    const linkClass = isLanding
        ? 'text-zinc-700 dark:text-zinc-200 decoration-zinc-400 dark:decoration-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:decoration-blue-600 dark:hover:decoration-blue-400'
        : 'text-slate-700 dark:text-slate-200 decoration-slate-400 dark:decoration-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:decoration-blue-600 dark:hover:decoration-blue-400'

    return (
        <footer className={`w-full text-center ${className}`}>
            <div className={`border-t ${dividerClass} pt-6`}>
                <p className={`text-xs sm:text-sm tracking-normal ${textClass}`}>
                    Designed &amp; Developed by{' '}
                    <a
                        href="https://rishirajshukla.netlify.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-medium underline underline-offset-4 transition-colors ${linkClass}`}
                    >
                        Rishi Raj Shukla
                    </a>
                </p>
            </div>
        </footer>
    )
}

export default Footer
