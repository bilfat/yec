import { Card } from "@/components/ui/Card"

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-[#DDD3C7] rounded-md"></div>
        <div className="h-4 w-96 bg-[#DDD3C7] rounded-md"></div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-5 flex flex-col gap-3">
            <div className="h-4 w-24 bg-[#DDD3C7] rounded-md"></div>
            <div className="h-8 w-16 bg-[#DDD3C7] rounded-md"></div>
          </Card>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <Card className="p-6 h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-48 bg-[#DDD3C7] rounded-md"></div>
          <div className="h-10 w-32 bg-[#DDD3C7] rounded-md"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 w-full bg-[#DDD3C7] rounded-md"></div>
          ))}
        </div>
      </Card>
    </div>
  )
}
