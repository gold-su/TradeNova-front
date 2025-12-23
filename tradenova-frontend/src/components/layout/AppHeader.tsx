import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AppHeader() {
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
            <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
                {/* Left: logo + mobile menu */}
                <div className="flex items-center gap-2">
                    <button
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-background/40 hover:bg-accent md:hidden"
                        aria-label="Open menu"
                        onClick={() => setOpen((v) => !v)}
                    >
                        <span className="text-lg">☰</span>
                    </button>

                    <Link to="/" className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-primary/20 ring-1 ring-primary/30" />
                        <span className="font-semibold tracking-tight">TradeNova</span>
                    </Link>
                </div>

                {/* Middle: search + nav */}
                <div className="hidden flex-1 items-center gap-3 md:flex">
                    <div className="relative w-[320px] lg:w-[380px]">
                        <Input
                            placeholder="Search (Ctrl+K)"
                            className="h-9 bg-background/40"
                        />
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            ⌘K
                        </span>
                    </div>

                    <nav className="ml-2 flex items-center gap-6 text-sm text-muted-foreground">
                        <Link className="hover:text-foreground" to="/products">Products</Link>
                        <Link className="hover:text-foreground" to="/guide">Guide</Link>
                        <Link className="hover:text-foreground" to="/pricing">Pricing</Link>
                        <Link className="hover:text-foreground" to="/community">Community</Link>
                    </nav>
                </div>

                {/* Right: locale + auth */}
                <div className="ml-auto flex items-center gap-2">
                    <button
                        className="hidden h-9 items-center gap-2 rounded-md border border-border/60 px-3 text-sm text-muted-foreground hover:bg-accent md:inline-flex"
                        aria-label="Language"
                    >
                        🌐 <span>EN</span>
                    </button>

                    <Button variant="ghost" asChild className="hidden md:inline-flex">
                        <Link to="/login">Log in</Link>
                    </Button>

                    <Button asChild className={cn("rounded-full px-5")}>
                        <Link to="/signup">Get started</Link>
                    </Button>
                </div>
            </div>

            {/* Mobile dropdown */}
            {open && (
                <div className="border-t border-border/60 bg-background/80 px-4 py-3 md:hidden">
                    <div className="mb-3">
                        <Input placeholder="Search" className="h-9 bg-background/40" />
                    </div>
                    <div className="grid gap-2 text-sm">
                        <Link to="/products" onClick={() => setOpen(false)}>Products</Link>
                        <Link to="/guide" onClick={() => setOpen(false)}>Guide</Link>
                        <Link to="/pricing" onClick={() => setOpen(false)}>Pricing</Link>
                        <Link to="/community" onClick={() => setOpen(false)}>Community</Link>
                        <div className="mt-2 flex gap-2">
                            <Button variant="outline" asChild className="flex-1">
                                <Link to="/login">Log in</Link>
                            </Button>
                            <Button asChild className="flex-1">
                                <Link to="/signup">Get started</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
