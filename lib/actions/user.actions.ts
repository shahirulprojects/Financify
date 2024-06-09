"use server";
import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId, parseStringify } from "../utils";
import {
  CountryCode,
  ProcessorTokenCreateRequest,
  ProcessorTokenCreateRequestProcessorEnum,
  Products,
} from "plaid";
import { plaidClient } from "../plaid";
import { revalidatePath } from "next/cache";

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

export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: user.$id,
      },
      client_name: user.name,
      products: ["auth"] as Products[],
      language: "en",
      country_codes: ["US"] as CountryCode[],
    };

    const response = await plaidClient.linkTokenCreate(tokenParams);

    return parseStringify({ linkToken: response.data.link_token });
  } catch (error) {
    console.log(error);
  }
};

export const exchangePublicToken = async ({
  publicToken,
  user,
}: exchangePublicTokenProps) => {
  try {
    // exchange public token for access token and item ID
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    // extract the access token and the item id from the response that we have just gotten
    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // get account information from Plaid using the access token
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accountData = accountsResponse.data.accounts[0];

    // once we have the access token and the accountData, we can create a processor token for Dwolla
    // create a processor token for Dwolla using the access token and account ID (accountData contains account ID)

    const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
    };

    const processorTokenResponse = await plaidClient.processorTokenCreate(
      request
    );
    const processorToken = processorTokenResponse.data.processor_token;

    // create a funding source URL for the account using the Dwolla customer ID,processor token, and bank name
    // think of this as connecting the payment processing functionality to our specific bank account so that it can send and receive funds
    // the addFundingSource is a special server action coming from Dwolla
    const fundingSourceUrl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name,
    });

    // if the funding source URL is not created, throw an error
    if (!fundingSourceUrl) throw Error;

    // if the funding source URL successfully created, we will create a bank account using the user ID,item ID, account ID, access token, funding source URL, and sharable ID so users can transfer money between different accounts
    await createBankAccount({
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl,
      sharableId: encryptId(accountData.account_id),
    });

    // revalidate the path to reflect the changes (will be redirected to the home page)
    revalidatePath("/");

    // return a success message
    return parseStringify({
      publicTokenExchange: "complete",
    });
  } catch (error) {
    console.log("An error occured while creating exchanging token:", error);
  }
};
