import { redirect } from "next/navigation";

export default function Home() {
  // Redirecting the root page to the dynamic route for our main tournament
  redirect("/t/copa-futuro");
}
