interface EmptyStateProps {
  message?: string
  height?: number
}

export function EmptyState({ message = "No data available", height = 300 }: EmptyStateProps) {
  return (
    <div className="h-[300px] flex items-center justify-center text-muted-foreground" style={{ height }}>
      {message}
    </div>
  )
}