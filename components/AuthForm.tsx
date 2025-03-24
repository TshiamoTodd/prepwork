"use client"
import React from 'react'

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form
} from "@/components/ui/form"
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import FormField from './FormField'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase/client'
import { signIn, SignUp } from '@/lib/auth.action'
import {Loader2} from 'lucide-react'
 


const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === 'sign-up' ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6),
  }) 
}

const AuthForm = ({type}: {type: FormType}) => {
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()
  const formSchema = authFormSchema(type)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })
 
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      if (type === 'sign-up') {
        const {name, email, password} = values

        const userCredentials = await createUserWithEmailAndPassword(auth, email, password)

        const result = await SignUp({
          uid: userCredentials.user.uid,
          name: name!,
          email: email!,
          password: password!
        })

        if (!result?.success) {
          toast.error(result?.message)
          return
        }

        toast.success('Account created successfully. Please sign in')
        router.push('/sign-in')
      } else {
        const {email, password} = values

        const userCredentials = await signInWithEmailAndPassword(auth, email, password)

        const idToken = await userCredentials.user.getIdToken()

        if(!idToken) {
          toast.error('Sign in failed')
          return
        }

        await signIn({
          email, idToken
        })

        toast.success('Signed in successfully')
        router.push('/')
      }
    } catch (error) {
      console.error(error)
      toast.error(`There was an errror ${error}`)
      
    } finally {
      setLoading(false)
    }
  }

  const isSignIn = type === 'sign-in'

  return (
    <div className='card-border lg:min-w-[566px]'>
        <div className='flex flex-col gap-6 card py-14 px-10'>
            <div className='flex flex-row gap-2 justify-center'>
                <Image src='/logo.svg' width={38} height={32} alt='logo'/>
                <h2 className='text-primary-100'>PrepWork</h2>
            </div>
            <h3 className='text-center'>Practice job interview with AI</h3>
        
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full mt-4 form">
                    {!isSignIn && (
                      <FormField 
                        control={form.control} 
                        name="name" 
                        label="Name" 
                        placeholder="Your name" 
                      />
                    )}
                    <FormField 
                        control={form.control} 
                        name="email" 
                        label="Email" 
                        placeholder="Your email address"
                        type='email' 
                    />
                    <FormField 
                        control={form.control} 
                        name="password" 
                        label="Password" 
                        placeholder="Enter your Password" 
                        type='password'
                    />
                    <Button type="submit" className='btn'>{loading ? <Loader2 className='animate-spin size-4'/> : isSignIn ? 'Sign In ' : 'Create an account'}</Button>
                </form>
            </Form>
            <p className='text-center'>
              {isSignIn ? 'No account yet? ' : 'Already have an account? '}
              <Link href={!isSignIn ? '/sign-in' : '/sign-up'} className='text-user-primary font-bold ml-1'>{!isSignIn ? 'Sign in' : 'Sign up'}</Link>
            </p>
      </div>
    </div>
  )
}

export default AuthForm