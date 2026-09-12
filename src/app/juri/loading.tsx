export default function JuriLoading() {
  return (
    <div className="min-h-screen bg-[#FFF8EA] pb-12 animate-pulse">
      {/* Header Skeleton */}
      <header className="bg-yec-white border-b border-[#DDD3C7] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="h-6 w-48 bg-[#DDD3C7] rounded-md"></div>
          <div className="h-8 w-24 bg-[#DDD3C7] rounded-md"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Summary Section */}
        <section>
          <div className="h-8 w-48 bg-[#DDD3C7] rounded-md mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-yec-white p-6 rounded-2xl border border-[#DDD3C7] shadow-sm flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-[#DDD3C7] rounded-md"></div>
                  <div className="h-10 w-16 bg-[#DDD3C7] rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Assignments Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="h-8 w-32 bg-[#DDD3C7] rounded-md"></div>
            <div className="h-10 w-64 bg-[#DDD3C7] rounded-md"></div>
          </div>
          
          <div className="w-full h-64 bg-yec-white rounded-2xl border border-[#DDD3C7] shadow-sm p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 w-full bg-[#DDD3C7] rounded-md"></div>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}
