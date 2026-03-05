import { useState } from "react"
import { Menu } from "lucide-react"
import Sidebar from "./Sidebar"

const DashboardLayout = ({ children }: any) => {

  const [open, setOpen] = useState(true)

  return (
    <div className="flex">

      <Sidebar open={open} />

      <div className="flex-1 bg-gray-100 min-h-screen">

        <div className="p-4 border-b flex items-center gap-4 bg-white">

          <button onClick={() => setOpen(!open)}>
            <Menu size={22}/>
          </button>

          <h1 className="font-semibold text-lg">
            Bingo Dashboard
          </h1>

        </div>

        <div className="p-6">
          {children}
        </div>

      </div>

    </div>
  )
}

export default DashboardLayout