import React from 'react'

const Navbar: React.FC = () => {
    return (
        <header className="w-full bg-white dark:bg-zinc-900 border-b dark:border-zinc-700 p-4 shadow-sm flex justify-between items-center">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Employee Card</h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
                © 2025 Petra T & D 
            </div>
        </header>
    )
}

export default Navbar
