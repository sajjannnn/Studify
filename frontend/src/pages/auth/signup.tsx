import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Eye, EyeOff, UserPlus, Sparkles, ArrowLeft } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Separator } from "../../components/ui/separator"
import { useRegister } from "../../hooks/use-auth"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignupForm = z.infer<typeof signupSchema>

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false)
  const registerMutation = useRegister()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = (data: SignupForm) => {
    const { confirmPassword: _, ...payload } = data
    void _
    registerMutation.mutate(payload, {
      onSuccess: () => navigate("/onboarding"),
    })
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-12 lg:flex"
      >
        <div>
          <Link to="/" className="flex items-center gap-2 text-white">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm opacity-80">Back to home</span>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Studify</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight text-white">
            Start your AI-powered<br />study journey
          </h2>
          <p className="text-lg text-white/70 max-w-md">
            Create your free account. Upload PDFs, generate notes with AI, and join a community of smart learners.
          </p>
          <div className="flex gap-4">
            {["Free", "AI-Powered", "Community"].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <p className="text-sm text-white/50">
          &copy; {new Date().getFullYear()} Studify. All rights reserved.
        </p>
      </motion.div>

      {/* Right Panel - Form */}
      <div className="flex w-full items-center justify-center p-4 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center lg:text-left">
            <Link to="/" className="mb-6 flex items-center justify-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">Studify</span>
            </Link>
            <h1 className="mt-6 text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="mt-2 text-muted-foreground">
              Fill in your details to get started
            </p>
          </div>

          <Card className="border-0 shadow-none sm:border sm:shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Sign Up</CardTitle>
              <CardDescription>Choose your preferred sign up method</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="mr-2 h-4 w-4"
                />
                Continue with Google
              </Button>

              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  OR
                </span>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  id="name"
                  label="Full Name"
                  placeholder="John Doe"
                  error={errors.name?.message}
                  {...register("name")}
                />

                <Input
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="you@university.edu"
                  error={errors.email?.message}
                  {...register("email")}
                />

                <div className="relative">
                  <Input
                    id="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    error={errors.password?.message}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <Input
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat your password"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Creating account...
                    </div>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>

                {registerMutation.error && (
                  <p className="text-sm text-destructive text-center">
                    {registerMutation.error.message}
                  </p>
                )}
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/auth/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
