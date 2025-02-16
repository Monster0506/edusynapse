import type React from "react"

interface CalloutProps {
  className?: string
  children: React.ReactNode
}

export const Callout: React.FC<CalloutProps> = ({ className, children }) => {
  return <div className={`rounded-lg border border-gray-200 bg-background-50 p-4 ${className}`}>{children}</div>
}

