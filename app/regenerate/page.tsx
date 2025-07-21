import db from "@/database/db";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";

const qrDir = path.join(process.cwd(), "public", "qrcodes");
const domain = process.env.DOMAIN || "https://movazi.nabidam.ir";

async function ensureQR(user: UserType): Promise<QRItemType> {
	const filePath = path.join(qrDir, `${user.username}.png`);
	const fileUrl = `/qrcodes/${user.username}.png`;
	const fullUrl = `${domain}/${user.username}`;

	await QRCode.toFile(filePath, fullUrl, {
		errorCorrectionLevel: "H",
		width: 2000,
		margin: 1,
	});

	return {
		username: user.username,
		title: user.title,
		qrPath: fileUrl,
		url: fullUrl,
	};
}

export default async function Regenerate() {
	// Ensure the qrcodes directory exists
	if (!fs.existsSync(qrDir)) {
		fs.mkdirSync(qrDir, { recursive: true });
	}

	const usernames = db
		.prepare("SELECT username, title FROM pages")
		.all() as UserType[];

	const qrItems: QRItemType[] = [];

	for (const user of usernames) {
		const item = await ensureQR(user);
		qrItems.push(item);
	}

	return <p>QR Codes regenerated successfully.</p>;
}
