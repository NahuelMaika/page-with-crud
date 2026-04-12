import AuthForm from "@/components/auth/AuthForm";
import Image from "next/image";

export default function Home() {
  return (
    <div className="pt-12">
      <AuthForm type="sign-in" />
    </div>
  );
}
