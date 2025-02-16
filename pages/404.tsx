import type React from "react"
import Link from "next/link"

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-background p-8 rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold text-indigo-600 mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-4">Oops! Page not found</p>
        <p className="text-gray-600 mb-8">The page you are looking for might have been removed or doesn't exist.</p>
        <Link
          href="/"
          className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}

export default NotFound

