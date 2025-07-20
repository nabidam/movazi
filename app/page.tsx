import db from "@/database/db";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import Image from "next/image";
import QRGrid from "@/components/QRGrid";

const qrDir = path.join(process.cwd(), "public", "qrcodes");
const domain = "https://movazi.nabidam.ir";

async function ensureQR(user: UserType): Promise<QRItemType> {
	const filePath = path.join(qrDir, `${user.username}.png`);
	const fileUrl = `/qrcodes/${user.username}.png`;
	const fullUrl = `${domain}/${user.username}`;

	if (!fs.existsSync(filePath)) {
		await QRCode.toFile(filePath, fullUrl, {
			errorCorrectionLevel: "H",
			width: 2000,
		});
	}

	return {
		username: user.username,
		title: user.title,
		qrPath: fileUrl,
		url: fullUrl,
	};
}

export default async function HomePage() {
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

	return <QRGrid qrCodes={qrItems} />;
}
