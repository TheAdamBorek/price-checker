"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
	const router = useRouter();
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ password: password.trim() }),
			});

			if (response.ok) {
				router.push("/");
				router.refresh();
			} else {
				setError("Invalid password");
			}
		} catch {
			setError("An error occurred");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
			<div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
				<h1 className="font-extrabold text-4xl tracking-tight">
					Price Checker
				</h1>
				<form
					className="flex w-full max-w-sm flex-col gap-4"
					onSubmit={handleSubmit}
				>
					<input
						className="rounded-lg bg-white/10 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
						disabled={isLoading}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Enter password"
						type="password"
						value={password}
					/>
					{error && <p className="text-center text-red-400">{error}</p>}
					<button
						className="rounded-lg bg-[hsl(280,100%,70%)] px-4 py-3 font-semibold transition hover:bg-[hsl(280,100%,60%)] disabled:cursor-not-allowed disabled:opacity-50"
						disabled={isLoading || !password}
						type="submit"
					>
						{isLoading ? "Logging in..." : "Login"}
					</button>
				</form>
			</div>
		</main>
	);
}
