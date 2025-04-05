import { Metadata } from 'next'
import Link from 'next/link'
import SignUpForm from '../components/auth/SignUpForm'

export const metadata: Metadata = {
  title: 'Sign Up - UMeet',
  description: 'Create your UMeet account',
}

export default function SignUp() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join UMeet to watch videos together</p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
          <SignUpForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
} 