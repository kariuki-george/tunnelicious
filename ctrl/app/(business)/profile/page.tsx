"use client";

import {
  AccountSettingsCards,
  DeleteAccountCard,
  SecuritySettingsCards,
} from "@daveyplate/better-auth-ui";

export default function SettingsPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold  m-2">Account</h2>
        <AccountSettingsCards />
        <br />
        <DeleteAccountCard />
      </div>
      <div>
        <h2 className="text-2xl font-bold  m-2">Security</h2>
        <SecuritySettingsCards />{" "}
      </div>
    </div>
  );
}
