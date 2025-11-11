import { CardanoWallet } from "@meshsdk/react";
export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 p-4 bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="font-light text-3xl text-neutral-100">
            Consume If Signed Application
          </span>
        </div>
        <div className="text-customFonts text-xl font-light">
          <div className="mesh-dark">
            <CardanoWallet isDark={true} />
          </div>
        </div>
      </div>
    </nav>
  );
}
