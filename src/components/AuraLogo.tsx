import Image from "next/image";

const LOGO = "/brand/logo-mark-v5.webp";

export default function AuraLogo({ size = 36 }: { size?: number }) {
  return (
    <Image src={LOGO} alt="AuraKids" width={size} height={size} unoptimized
      style={{ borderRadius: "50%", display: "block" }} />
  );
}
