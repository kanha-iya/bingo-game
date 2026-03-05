import { Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, PlayCircle, Crown, History, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

type Props = {
  open: boolean
}

const Sidebar = ({ open }: Props) => {

  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Play Match", path: "/play", icon: PlayCircle },
    { name: "Subscription", path: "/subscription", icon: Crown },
    { name: "Match History", path: "/history", icon: History },
    { name: "Settings", path: "/settings", icon: Settings }
  ]

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className={`bg-black text-white h-screen transition-all duration-300
        ${open ? "w-64" : "w-16"} flex flex-col`}>

      <div className="p-4 font-bold text-xl border-b border-gray-700">
        {open ? "Bingo" : "B"}
      </div>

      <div className="flex-1 p-2 space-y-2">

        {menu.map((item) => {

          const Icon = item.icon
          const active = location.pathname === item.path

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg
              ${active ? "bg-gray-800" : "hover:bg-gray-800"}`}
            >
              <Icon size={20} />
              {open && item.name}
            </Link>
          )
        })}

      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 p-4 hover:bg-red-600"
      >
        <LogOut size={20}/>
        {open && "Logout"}
      </button>

    </div>
  )
}

export default Sidebar