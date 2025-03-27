"use server"

import { auth, db } from "@/firebase/admin"
import { cookies } from "next/headers"

const ONE_WEEK = 60 * 60 * 24 * 7

export async function SignUp(params: SignUpParams) {
    const {uid, name, email} = params

    try {
        const userRecord = await db.collection('users').doc(uid).get()

        if(userRecord.exists) {
            return {
                success: false,
                message: 'User already exists, Please sign in instead'
            }
        }

        await db.collection('users').doc(uid).set({
            name: name,
            email: email
        })

        return {
            success: true,
            message: 'Account created successfully, Please sign in'
        }
    } catch (error: any) {
        console.log('Error creating a user', error)

        if(error.code === 'auth/emai-already-exists') {
            return {
                success: false,
                message: 'This email is already in use'
            }
        }

        return {
            success: false,
            message: 'Failed to create account'
        }
    }
}

export async function setSessionCookie(idToken: string){
    const cookieStore = await cookies()

    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: ONE_WEEK * 1000
    })

    cookieStore.set('session', sessionCookie, {
        maxAge: ONE_WEEK,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax'
    })
}

export async function signIn(params: SignInParams) {
    const {email, idToken} = params

    try {
        const userRecord = await auth.getUserByEmail(email)

        if(!userRecord) {
            return {
                success: false,
                message: 'User does not exists, Create an account instead'
            }
        }

        await setSessionCookie(idToken)
    } catch (error) {
        console.log('Error signing in', error)

        return {
            success: false,
            message: 'Failed to sign in to an account'
        }
    }
}

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if(!sessionCookie) {
        return null
    }

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true)

        const userRecord = await db.collection('users').doc(decodedClaims.uid).get()

        if(!userRecord.exists) {
            return null
        }

        return {
            ...userRecord.data(),
            id: userRecord.id
        } as User

    } catch (error) {
        console.log('Error getting current user', error)

        return null
    }
}

export async function isAuthenticated() {
    const user = await getCurrentUser()

    return !!user

}

export async function getInterviewByUserId(userId: string): Promise<Interview[] | null> {
    try {
        const interviews = await db
        .collection('interviews')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get()

        if(interviews.empty) {
            return null
        }

        return interviews.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id
        })) as Interview[]

    } catch (error) {
        console.log('Error getting interviews', error)

        return null
    }

}
export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
    const {limit = 20, userId} = params
    try {
        const interviews = await db
        .collection('interviews')
        .orderBy('createdAt', 'desc')
        .where('userId', '!=', userId)
        .limit(limit)
        .get()

        console.log({interviews})

        if(interviews.empty) {
            return null
        }

        return interviews.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id
        })) as Interview[]

    } catch (error) {
        console.log('Error getting interviews', error)

        return null
    }

}
