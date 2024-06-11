"use server";
// because we want to do server action so we have to use the "use server"
import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import {
  CountryCode,
  ProcessorTokenCreateRequest,
  ProcessorTokenCreateRequestProcessorEnum,
  Products,
} from "plaid";
import { plaidClient } from "../plaid";
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

// instead of typing process.env for each environment variables, we can do it like this
const {
  APPWRITE_DATABASE_ID: DATABASE_ID, // how to read it: APPWRITE_DATABASE_ID will be renamed as DATABASE_ID and it is coming from process.env
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

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

export const signUp = async ({ password, ...userData }: SignUpParams) => {
  // we do password, ...userData because we dont want to include the password in or document, therefore we have to extract it from the userData
  const { email, firstName, lastName } = userData;

  let newUserAccount;

  try {
    // Create a user account
    const { account, database } = await createAdminClient();

    // this is for creating a user information in the database.The ID, email, password, firstName, and lastName are the only ones that will be shown in the user collection in the database
    newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );

    // tips: when making a function, make sure that it is atomic meaning that if it succeeds, it has to succeed until the end.If it fails, it has to fail right there and must not continue
    // this is what we doing here, we check if each step is successful or not first before continuing to the next step

    // if the newUseraccount failed to be created, it will throw an error and exits the function
    if (!newUserAccount) throw new Error("Error creating user");

    // if the newUseraccount creation is successful, we will create a dwolla customer url
    const dwollaCustomerUrl = await createDwollaCustomer({
      ...userData, // spread the userData
      type: "personal", // set the type to personal
    });

    // if the dwollaCustomerUrl failed to be created, it will throw an error and exits the function
    if (!dwollaCustomerUrl) throw new Error("Error creating Dwolla customer");

    // if the dwollaCustomerUrl creation is successful, we will extract the dwolla customer id
    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

    const newUser = await database.createDocument(
      DATABASE_ID!, // specify which database (in this case the financify database)
      USER_COLLECTION_ID!, // specify which collection that we will add the document
      ID.unique(), // assigned an id for the document
      // specify what information that we need in the document
      {
        ...userData,
        userId: newUserAccount.$id,
        dwollaCustomerId,
        dwollaCustomerUrl,
      }
    );

    // create a session. This session can be seen at the appwrite tab at the auth. Do note that the session will be stored in the auth, not database
    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    // we do it like this because in NextJS we cannot passed a large object through server action, we have to stringify it first
    return parseStringify(newUser);
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
      client_name: `${user.firstName}${user.lastName}`,
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

export const createBankAccount = async ({
  userId,
  bankId,
  accountId,
  accessToken,
  fundingSourceUrl,
  sharableId,
}: createBankAccountProps) => {
  try {
    // create a bank account document within appwrite (meaning that we create a banking record in our database)
    const { database } = await createAdminClient();

    const bankAccount = await database.createDocument(
      DATABASE_ID!, // the ! is to let typescript know that it exists and not undefined
      BANK_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        bankId,
        accountId,
        accessToken,
        fundingSourceUrl,
        sharableId,
      }
    );

    return parseStringify(bankAccount);
  } catch (error) {}
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
