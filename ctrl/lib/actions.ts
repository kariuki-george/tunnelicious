"use server";

import { APIError } from "better-auth/api";
import { redirect } from "next/navigation";
import { auth } from "./auth";

interface State {
  error: boolean;
  message?: string | null;
}

export const signup = async (_prevState: State, formdata: FormData) => {
  const data = {
    email: formdata.get("email") as string,
    password: formdata.get("pwd") as string,
    firstname: formdata.get("firstname") as string,
    lastname: formdata.get("lastname") as string,
  };

  const { email, password, firstname, lastname } = data;

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: `${firstname} ${lastname}`,
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      console.error(error);
      switch (error.status) {
        case "UNPROCESSABLE_ENTITY":
          return { message: "User already exists", error: true };
        case "BAD_REQUEST":
          return { message: "Invalid email.", error: true };
        default:
          console.error("signup with email and password failed", error);
          return { message: "something went wrong", error: true };
      }
    }
    console.log("signup with email and password failed", error);
    return { message: "something went wrong", error: true };
  }

  redirect("/personal");
};
export const signin = async (_prevState: State, formdata: FormData) => {
  const data = {
    email: formdata.get("email") as string,
    password: formdata.get("pwd") as string,
  };

  const { email, password } = data;

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      switch (error.status) {
        case "NOT_FOUND":
          return {
            message: "User with the provided email not found",
            error: true,
          };
        case "BAD_REQUEST":
          return { message: "Invalid credentials provided.", error: true };
        case "UNAUTHORIZED":
          return { message: "Invalid credentials provided.", error: true };
        default:
          console.error("signup with email and password failed", error);
          return { message: "something went wrong", error: true };
      }
    }
    console.log("signin with email and password failed", error);
    return { message: "something went wrong", error: true };
  }

  redirect("/personal");
};
