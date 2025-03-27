import { db } from "@/firebase/admin"

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

export async function getInterviewById(id: string): Promise<Interview | null> {
    try {
        const interview = await db
        .collection('interviews')
        .doc(id)
        .get()

        return interview.data() as Interview | null

    } catch (error) {
        console.log('Error getting interviews', error)

        return null
    }

}
