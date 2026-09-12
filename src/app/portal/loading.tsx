export default function PortalLoading() {
  return (
    <div className="min-h-screen bg-[#FFF8EA] font-sans animate-pulse">
      <header className="bg-yec-brown text-white h-[72px] flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-20">
        <div className="h-8 w-32 bg-[#DDD3C7]/20 rounded-md"></div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-24 bg-[#DDD3C7]/20 rounded-md"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Progress Tracker Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#DDD3C7] p-6 space-y-4">
          <div className="h-6 w-48 bg-[#DDD3C7] rounded-md"></div>
          <div className="flex justify-between items-center mt-6 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#DDD3C7] -z-0"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 z-10 bg-white px-2">
                <div className="h-10 w-10 bg-[#DDD3C7] rounded-full"></div>
                <div className="h-4 w-20 bg-[#DDD3C7] rounded-md"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Section Skeleton */}
        <div className="space-y-6">
          <div className="h-10 w-64 bg-[#DDD3C7] rounded-md"></div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-[#DDD3C7] p-6 space-y-4">
            <div className="h-6 w-48 bg-[#DDD3C7] rounded-md"></div>
            <div className="h-4 w-full bg-[#DDD3C7] rounded-md"></div>
            <div className="h-4 w-3/4 bg-[#DDD3C7] rounded-md"></div>
            
            <div className="h-32 w-full bg-[#DDD3C7] rounded-xl mt-6"></div>
          </div>
        </div>
      </main>
    </div>
  )
}
