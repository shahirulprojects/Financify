"use server";
import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../utils";

// because we want to do server action so we have to use the "use server"

export const signIn = async ({ email, password }: signInProps) => {
  try {
    // Mutation / Database / Make fetch call
    const { account } = await createAdminClient();

    const response = await account.createEmailPasswordSession(email, password);

    return parseStringify(response);
  } catch (error) {
    console.error("Error", error);
  }
};

export const signUp = async (userData: SignUpParams) => {
  const { email, password, firstName, lastName } = userData;
  try {
    // Create a user account
    const { account } = await createAdminClient();

    // this is for creating a user information in the database.The ID, email, password, firstName, and lastName are the only ones that will be shown in the user collection in the database
    const newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );

    // Create a session. This session can be seen at the appwrite tab at the user's info at the user collection collection
    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    // we do it like this because in NextJS we cannot passed a large object through server action, we have to stringify it first
    return parseStringify(newUserAccount);
  } catch (error) {
    console.error("Error", error);
  }
};

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();

    const user = await account.get();

    return parseStringify(user);
  } catch (error) {
    return null;
  }
}

export const logoutAccount = async () => {
  try {
    // get the account from the current session
    const { account } = await createSessionClient();

    // delete the session
    cookies().delete("appwrite-session");

    // delete the session for the current account
    await account.deleteSession("current");
  } catch (error) {
    return null;
  }
};
