'use server';

import { ID, Query, AppwriteException } from "node-appwrite";
import { 
    BUCKET_ID,
    DATABASE_ID,
    ENDPOINT,
    USERS_COLLECTION_ID,
    PROJECT_ID,
    databases,
    storage,
    users,
} from "../appwrite.config";
import { parseStringify } from "../utils";

// Create AppWrite User
export const createUser = async (user: CreateUserParams) => {
    try {
        // Create new user -> https://appwrite.io/docs/references/1.5.x/server-nodejs/users#create
        const newUser = await users.create(
            ID.unique(),
            user.email,
            user.phone, 
            undefined,
            user.name
        );

        return parseStringify(newUser);
    } catch (error) {
        // Check existing user
        const appWriteError = error as AppwriteException;
        
        if(appWriteError && appWriteError.code === 409) {
            const existingUser = await users.list([
                Query.equal('email', [user.email]),
            ]);

            return existingUser.users[0];
        }
        console.error('An error occurred while creating a new user:', error)
    }
};

export const getUser = async (userId: string) => {
    try {
        const user = await users.get(userId)
        return parseStringify(user);
    } catch (error) {
        console.log(error)
    }
}