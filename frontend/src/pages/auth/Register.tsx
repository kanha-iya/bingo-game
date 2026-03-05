import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { registerUser } from "@/services/auth.service"

const Register = () => {

  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault()

    try {

      setLoading(true)

      await registerUser(form)

      navigate("/login")

    } catch (error) {

      console.log(error)
      alert("Registration failed")

    } finally {

      setLoading(false)

    }

  }

  return (

    <div className="flex justify-center items-center min-h-screen bg-gray-100">

      <Card className="w-[400px]">

        <CardHeader>

          <CardTitle className="text-center text-2xl">
            Register
          </CardTitle>

        </CardHeader>

        <CardContent>
    
          <form onSubmit={handleSubmit} className="space-y-4">

            <Input
              name="username"
              placeholder="Username"
              onChange={handleChange}
              required
            />

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

            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              required
            />

            <Button className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Register"}
            </Button>

          </form>

          <p className="text-center text-sm mt-4">

            Already have an account?{" "}

            <Link to="/login" className="text-blue-500">
              Login
            </Link>

          </p>

        </CardContent>

      </Card>

    </div>

  )
}

export default Register