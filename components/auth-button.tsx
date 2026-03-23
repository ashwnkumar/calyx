import Link from "next/link";
import { Button } from "./ui/button";
import { LogoutButton } from "./logout-button";

export function AuthButton({ isLoggedIn }: { isLoggedIn: boolean }) {
  return isLoggedIn ? (
    <div className="flex items-center gap-4">
      <LogoutButton />
    </div>
  ) : (
    <Button asChild size="sm" variant={"default"}>
      <Link href="/login">Sign in</Link>
    </Button>
  );
}
