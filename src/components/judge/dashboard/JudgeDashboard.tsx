"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { StageTabs, StageType } from "./StageTabs"
import { AssignedTeamTable, AssignedTeam } from "./AssignedTeamTable"
import { Button } from "@/components/ui/Button"
import { LogOut } from "lucide-react"

import { useRouter } from "next/navigation"
import { fetchApi } from "@/lib/api"

export function JudgeDashboard() {
  const router = useRouter()
  const [activeStage, setActiveStage] = React.useState<StageType>("BMC")
  const [teams, setTeams] = React.useState<AssignedTeam[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchTeams = async () => {
      setIsLoading(true)
      const res = await fetchApi<AssignedTeam[]>('/evaluations')
      if (res.success && res.data) {
        setTeams(res.data)
      }
      setIsLoading(false)
    }
    fetchTeams()
  }, [])
  
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Filter teams based on active stage
  const filteredTeams = teams.filter(team => team.stage === activeStage)

  const pendingCount = teams.filter(t => t.status === "PENDING").length
  const completedCount = teams.filter(t => t.status === "COMPLETED" || t.status === "LOCKED").length

  return (
    <div className="min-h-screen bg-[#FFF8EA] pb-12">
      {/* Header */}
      <header className="bg-yec-white border-b border-[#DDD3C7] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-bold text-yec-text">Portal Juri YEC</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-danger hover:text-danger hover:bg-danger/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </header>


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Summary Section */}
        <section>
          <h2 className="text-2xl font-serif font-bold text-yec-text mb-4">Ringkasan Tugas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-yec-white p-6 rounded-2xl border border-[#DDD3C7] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yec-text-muted">Menunggu Penilaian</p>
                <p className="text-3xl font-bold text-yec-amber mt-1">{pendingCount}</p>
              </div>
            </div>
            <div className="bg-yec-white p-6 rounded-2xl border border-[#DDD3C7] shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yec-text-muted">Selesai Dinilai</p>
                <p className="text-3xl font-bold text-success mt-1">{completedCount}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Assignments Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-yec-text">Daftar Tim</h2>
            <StageTabs 
              activeStage={activeStage} 
              onStageChange={setActiveStage}
              showPitching={true} // Set to true if there are pitching assignments
            />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-12 bg-yec-white rounded-2xl border border-[#DDD3C7]">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-yec-amber border-t-transparent" />
            </div>
          ) : (
            <AssignedTeamTable teams={filteredTeams} />
          )}
        </section>

      </main>
    </div>
  )
}
