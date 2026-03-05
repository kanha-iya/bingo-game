import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { loginUser } from "@/services/auth.service"
import { useAuth } from "@/context/AuthContext"

const Login = () => {

  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    email: "",
    password: ""
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {

      setLoading(true)

      const res = await loginUser(form)

      const { user, token } = res.data;
      login(user, token)

      navigate("/dashboard")

    } catch (error) {
      console.log(error)
      alert("Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">

      <Card className="w-[400px]">

        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Login
          </CardTitle>
        </CardHeader>

        <CardContent>

          <form onSubmit={handleSubmit} className="space-y-4">

            <Input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />

            <Input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />

            <Button className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>

          </form>

          <p className="text-center text-sm mt-4">

            Don't have an account?{" "}

            <Link to="/register" className="text-blue-500">
              Register
            </Link>

          </p>

        </CardContent>

      </Card>

    </div>
  )
}

export default Login