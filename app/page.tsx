import { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from './components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Login - UMeet',
  description: 'Login to your UMeet account',
}

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">UMeet</h1>
          <p className="text-gray-600">Watch YouTube together with friends</p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
          <LoginForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-primary-600 hover:text-primary-500">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
} 