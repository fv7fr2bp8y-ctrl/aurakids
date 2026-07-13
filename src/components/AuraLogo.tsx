import Image from "next/image";

const LOGO = "https://cdthqixswrcxkyodzdjp.supabase.co/storage/v1/object/public/story-images/logo-mark-v3.png";

export default function AuraLogo({ size = 36 }: { size?: number }) {
  return (
    <Image src={LOGO} alt="AuraKids" width={size} height={size} unoptimized
      style={{ borderRadius: "50%", display: "block" }} />
  );
}
