"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const AnimatedBackground = () => {
	return (
		<>
			{/* Animated gradient background - made more subtle */}
			<div
				className="fixed inset-0 bg-gradient-to-br from-black via-red-950 to-slate-950"
				style={{
					animation: "pulse 12s ease-in-out infinite",
					animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
				}}
			/>

			{/* Floating particles - much dimmer */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				{[...Array(20)].map((_, i) => (
					<div
						key={i}
						className="absolute w-1 h-1 bg-red-400/8 rounded-full animate-float"
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
							animationDelay: `${Math.random() * 10}s`,
							animationDuration: `${15 + Math.random() * 10}s`,
						}}
					/>
				))}

				{/* Larger floating elements - much dimmer */}
				{[...Array(8)].map((_, i) => (
					<div
						key={`large-${i}`}
						className="absolute w-2 h-2 bg-red-500/4 rounded-full animate-float-slow"
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
							animationDelay: `${Math.random() * 15}s`,
							animationDuration: `${20 + Math.random() * 15}s`,
						}}
					/>
				))}
			</div>

			{/* Gradient overlay with shifting colors - much more subtle */}
			<div className="fixed inset-0 bg-gradient-to-r from-transparent via-red-900/2 to-transparent animate-gradient-shift" />
		</>
	);
};

export default function QRGrid({ qrCodes }: { qrCodes: QRItemType[] }) {
	// const qrCodes = [
	// 	{ id: 1, name: "Website Link", url: "https://example.com" },
	// 	{ id: 2, name: "Contact Info", url: "mailto:contact@example.com" },
	// 	{
	// 		id: 3,
	// 		name: "WiFi Password",
	// 		url: "WIFI:T:WPA;S:MyNetwork;P:password123;;",
	// 	},
	// 	{ id: 4, name: "Phone Number", url: "tel:+1234567890" },
	// 	{ id: 5, name: "Location", url: "geo:37.7749,-122.4194" },
	// 	{ id: 6, name: "Social Media", url: "https://twitter.com/example" },
	// 	{ id: 7, name: "App Store", url: "https://apps.apple.com/app/example" },
	// 	{ id: 8, name: "Payment Link", url: "https://pay.example.com/invoice123" },
	// ];

	const handleDownload = (qrCode: QRItemType) => {
		// In a real app, this would generate and download the actual QR code
		console.log(`Downloading QR code for: ${qrCode.title}`);
		const fileName = `${qrCode.title}.png`;
		const filePath = qrCode.qrPath; // path relative to the public folder

		// Create a temporary link
		const link = document.createElement("a");
		link.href = filePath;
		link.download = fileName;

		// Append to the document and click
		document.body.appendChild(link);
		link.click();

		// Clean up
		document.body.removeChild(link);
	};

	return (
		<div className="relative min-h-screen p-6">
			<AnimatedBackground />
			<div className="relative z-10 mx-auto max-w-7xl">
				{/* Header */}
				<div className="mb-8 text-center">
					<h1 className="mb-4 text-4xl font-bold text-red-100">موازی</h1>
				</div>

				{/* QR Code Grid */}
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{qrCodes.map((qrCode) => (
						<div
							key={qrCode.username}
							className="qr-card group relative overflow-hidden rounded-2xl bg-black/40 p-6 backdrop-blur-lg border border-red-900/20 transition-all duration-300 hover:bg-red-950/15 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/15 hover:border-red-700/30"
						>
							{/* QR Code Image */}
							<div className="mb-4 flex justify-center">
								<div className="rounded-xl bg-white p-4 shadow-lg">
									<Image
										src={qrCode.qrPath}
										alt={`QR Code for ${qrCode.title}`}
										width={120}
										height={120}
										className="h-30 w-30"
									/>
								</div>
							</div>

							{/* QR Code Info */}
							<div className="mb-4 text-center">
								<h3 className="mb-2 text-lg font-semibold text-red-100">
									{qrCode.title}
								</h3>
								<p className="text-sm text-red-200/70 truncate">{qrCode.url}</p>
							</div>

							{/* Download Button */}
							<Button
								onClick={() => handleDownload(qrCode)}
								className="w-full bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 text-white border-0 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-red-500/25"
								size="sm"
							>
								<Download className="mr-2 h-4 w-4" />
								دانلود
							</Button>
						</div>
					))}
				</div>

				{/* Footer */}
				<div className="mt-12 text-center">
					<p className="text-red-300/60">
						{"Click download to save your QR codes locally"}
					</p>
				</div>
			</div>
		</div>
	);
}
