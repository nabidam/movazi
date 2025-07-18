import PageContent from "@/components/PageContent";
import db from "@/database/db";
import { notFound } from "next/navigation";

export function generateViewport() {
	return {
		width: "device-width",
		initialScale: 1,
		maximumScale: 1,
		userScalable: false,
	};
}

export default async function page({
	params,
}: {
	params: Promise<{ username: string }>;
}) {
	const { username } = await params;

	const row = (await db
		.prepare(
			`SELECT username, title, subtitle, artwork_org, artwork_new, statement, video, sound
       FROM pages WHERE username = ?`
		)
		.get(username)) as PageDataType;
	//   const post = await getPost(slug)

	if (!row) {
		notFound();
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 text-white">
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 to-transparent animate-pulse-slow pointer-events-none"></div>

			<PageContent data={row} />
		</div>
	);
}
