"use client";

import {
	Pause,
	PauseCircle,
	Play,
	PlayCircle,
	ToggleLeft,
	ToggleRight,
	X,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";

export default function PageContent({ data }: { data: PageDataType }) {
	const [isPlaying, setIsPlaying] = useState(false);
	const audioRef = useRef<HTMLAudioElement>(null);
	// const [progressIndex, setProgressIndex] = useState(0);
	const [, setHoveredImage] = useState<number | null>(null);
	const [isCompareMode, setIsCompareMode] = useState(true);
	const [sliderPosition, setSliderPosition] = useState(50);
	const [audioIntensity, setAudioIntensity] = useState(0);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const animationFrameRef = useRef<number>(0);

	// Video state
	const [isVideoPlaying, setIsVideoPlaying] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);

	// Lightbox state
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxImage, setLightboxImage] = useState<{
		id: number;
		caption: string;
		image: string;
	} | null>(null);
	const [zoomLevel, setZoomLevel] = useState(1);
	const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [pinchStart, setPinchStart] = useState({
		distance: 0,
		zoom: 1,
		midpoint: { x: 0, y: 0 },
	});
	const [isPinching, setIsPinching] = useState(false);
	const imageContainerRef = useRef<HTMLDivElement>(null);

	const togglePlayPause = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play();
			}
			setIsPlaying(!isPlaying);
		}
	};

	const toggleVideoPlayPause = () => {
		if (videoRef.current) {
			if (isVideoPlaying) {
				videoRef.current.pause();
			} else {
				videoRef.current.play();
			}
			setIsVideoPlaying(!isVideoPlaying);
		}
	};

	const handleSliderChange = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const percentage = (x / rect.width) * 100;
		setSliderPosition(Math.max(0, Math.min(100, percentage)));
	};

	const handleSliderDrag = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.buttons === 1) {
			handleSliderChange(e);
		}
	};

	// Lightbox functions
	const openLightbox = (image: {
		id: number;
		caption: string;
		image: string;
	}) => {
		setLightboxImage(image);
		setLightboxOpen(true);
		setZoomLevel(1);
		setPanPosition({ x: 0, y: 0 });
		document.body.style.overflow = "hidden";
	};

	const closeLightbox = () => {
		setLightboxOpen(false);
		setLightboxImage(null);
		setZoomLevel(1);
		setPanPosition({ x: 0, y: 0 });
		document.body.style.overflow = "unset";
	};

	const handleZoomIn = () => {
		setZoomLevel((prev: number) => Math.min(prev * 1.5, 5));
	};

	const handleZoomOut = () => {
		setZoomLevel((prev: number) => Math.max(prev / 1.5, 0.5));
		if (zoomLevel <= 1) {
			setPanPosition({ x: 0, y: 0 });
		}
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		if (zoomLevel > 1) {
			setIsDragging(true);
			setDragStart({
				x: e.clientX - panPosition.x,
				y: e.clientY - panPosition.y,
			});
		}
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (isDragging && zoomLevel > 1) {
			setPanPosition({
				x: e.clientX - dragStart.x,
				y: e.clientY - dragStart.y,
			});
		}
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	// Calculate distance between two touch points
	const getDistance = (touch1: Touch, touch2: Touch) => {
		return Math.sqrt(
			Math.pow(touch2.clientX - touch1.clientX, 2) +
				Math.pow(touch2.clientY - touch1.clientY, 2)
		);
	};

	// Calculate midpoint between two touch points
	const getMidpoint = (touch1: Touch, touch2: Touch) => {
		return {
			x: (touch1.clientX + touch2.clientX) / 2,
			y: (touch1.clientY + touch2.clientY) / 2,
		};
	};

	// Handle touch start for pinch zoom
	const handleTouchStart = (e: React.TouchEvent) => {
		if (e.touches.length === 1 && zoomLevel > 1) {
			// Single touch - pan
			e.preventDefault();
			const touch = e.touches.item(0);
			setIsDragging(true);
			setIsPinching(false);
			setDragStart({
				x: touch.clientX - panPosition.x,
				y: touch.clientY - panPosition.y,
			});
		} else if (e.touches.length === 2) {
			// Two touches - pinch to zoom
			e.preventDefault();
			const touch1 = e.touches.item(0) as Touch;
			const touch2 = e.touches.item(1) as Touch;
			const distance = getDistance(touch1, touch2);
			const midpoint = getMidpoint(touch1, touch2);

			// Get container bounds for relative positioning
			const containerRect = imageContainerRef.current?.getBoundingClientRect();
			if (containerRect) {
				// Calculate midpoint relative to container and adjust for current zoom and pan
				const relativeX = midpoint.x - containerRect.left;
				const relativeY = midpoint.y - containerRect.top;

				setPinchStart({
					distance,
					zoom: zoomLevel,
					midpoint: { x: relativeX, y: relativeY },
				});
			}

			setIsPinching(true);
			setIsDragging(false);
		}
	};

	// Handle touch move for pinch zoom
	const handleTouchMove = (e: React.TouchEvent) => {
		if (e.touches.length === 1 && isDragging && zoomLevel > 1) {
			// Single touch - pan
			e.preventDefault();
			const touch = e.touches.item(0);
			setPanPosition({
				x: touch.clientX - dragStart.x,
				y: touch.clientY - dragStart.y,
			});
		} else if (e.touches.length === 2 && isPinching) {
			// Two touches - pinch to zoom
			e.preventDefault();
			const touch1 = e.touches.item(0) as Touch;
			const touch2 = e.touches.item(1) as Touch;
			const currentDistance = getDistance(touch1, touch2);
			const scale = currentDistance / pinchStart.distance;

			// Calculate new zoom level based on pinch scale
			const newZoom = Math.max(0.5, Math.min(5, pinchStart.zoom * scale));

			// Get current midpoint
			const currentMidpoint = getMidpoint(touch1, touch2);
			const containerRect = imageContainerRef.current?.getBoundingClientRect();

			if (containerRect) {
				// Calculate current midpoint relative to container
				const currentRelativeX = currentMidpoint.x - containerRect.left;
				const currentRelativeY = currentMidpoint.y - containerRect.top;

				// Adjust pan position to keep the pinch midpoint stable
				if (newZoom > 1) {
					// Calculate how much the midpoint has moved
					const midpointDeltaX = currentRelativeX - pinchStart.midpoint.x;
					const midpointDeltaY = currentRelativeY - pinchStart.midpoint.y;

					// Adjust pan position to compensate for midpoint movement and zoom change
					setPanPosition((prev: { x: number; y: number }) => ({
						x: prev.x + midpointDeltaX * 0.5,
						y: prev.y + midpointDeltaY * 0.5,
					}));
				} else {
					// Reset pan position when zoomed out to 1x or less
					setPanPosition({ x: 0, y: 0 });
				}
			}

			setZoomLevel(newZoom);
		}
	};

	// Handle touch end
	const handleTouchEnd = (e: React.TouchEvent) => {
		e.preventDefault();
		setIsDragging(false);
		setIsPinching(false);

		// If zoomed out to 1x or less, reset pan position
		if (zoomLevel <= 1) {
			setPanPosition({ x: 0, y: 0 });
		}
	};

	// Keyboard controls for lightbox
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (lightboxOpen) {
				switch (e.key) {
					case "Escape":
						closeLightbox();
						break;
					case "+":
					case "=":
						handleZoomIn();
						break;
					case "-":
						handleZoomOut();
						break;
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [lightboxOpen]);

	// // Audio analysis setup
	// useEffect(() => {
	// 	const setupAudioAnalysis = async () => {
	// 		if (audioRef.current && !analyserRef.current) {
	// 			try {
	// 				audioContextRef.current = new (window.AudioContext ||
	// 					(window as any).webkitAudioContext)();
	// 				const source = audioContextRef.current.createMediaElementSource(
	// 					audioRef.current
	// 				);
	// 				analyserRef.current = audioContextRef.current.createAnalyser();

	// 				analyserRef.current.fftSize = 256;
	// 				source.connect(analyserRef.current);
	// 				analyserRef.current.connect(audioContextRef.current.destination);
	// 			} catch (error) {
	// 				console.log("Audio analysis not available:", error);
	// 			}
	// 		}
	// 	};

	// 	setupAudioAnalysis();
	// }, []);

	// // Audio intensity monitoring
	// useEffect(() => {
	// 	const updateAudioIntensity = () => {
	// 		if (analyserRef.current && isPlaying) {
	// 			const bufferLength = analyserRef.current.frequencyBinCount;
	// 			const dataArray = new Uint8Array(bufferLength);
	// 			analyserRef.current.getByteFrequencyData(dataArray);

	// 			// Calculate average intensity
	// 			const average =
	// 				dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
	// 			const normalizedIntensity = average / 255;

	// 			setAudioIntensity(normalizedIntensity);
	// 		} else {
	// 			setAudioIntensity(0);
	// 		}

	// 		animationFrameRef.current = requestAnimationFrame(updateAudioIntensity);
	// 	};

	// 	if (isPlaying) {
	// 		updateAudioIntensity();
	// 	} else {
	// 		setAudioIntensity(0);
	// 	}

	// 	return () => {
	// 		if (animationFrameRef.current) {
	// 			cancelAnimationFrame(animationFrameRef.current);
	// 		}
	// 	};
	// }, [isPlaying]);

	// Calculate reactive glow styles
	const getReactiveGlowStyle = (
		baseOpacity: number,
		layer: "outer" | "middle" | "inner"
	) => {
		const intensityMultiplier =
			layer === "outer" ? 1.4 : layer === "middle" ? 1.1 : 0.7;
		const reactiveOpacity =
			baseOpacity + audioIntensity * 0.4 * intensityMultiplier;
		const reactiveScale = 1 + audioIntensity * 0.1 * intensityMultiplier;

		return {
			opacity: Math.min(reactiveOpacity, 0.8),
			transform: `scale(${reactiveScale})`,
			transition: "opacity 0.1s ease-out, transform 0.1s ease-out",
		};
	};

	// const handleSeek = (index: number) => {
	//   const audio = audioRef.current;
	//   if (!audio || !audio.duration) return;
	//   const time = (index / defaultWaveform.length) * audio.duration;
	//   audio.currentTime = time;
	// };

	return (
		<>
			<div className="container mx-auto px-4 py-4 pb-36 relative z-10">
				{/* Art Title Section */}
				<div className="text-center mb-6">
					<h1
						className={`py-2 text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-${
							data.color ?? "red"
						}-100 to-${
							data.color ?? "red"
						}-200 bg-clip-text text-transparent mb-4`}
					>
						{data.title}
					</h1>
					{data.subtitle ? (
						<p className="text-lg md:text-xl text-gray-300 font-light tracking-wide">
							{data.subtitle}
						</p>
					) : (
						""
					)}
				</div>

				{/* Mode Toggle */}
				{data.artwork_new ? (
					<>
						<div className="flex justify-center mb-4">
							<div className="backdrop-blur-xl bg-gray-800/40 rounded-full p-2 shadow-lg border border-gray-700/50">
								<Button
									onClick={() => setIsCompareMode(!isCompareMode)}
									variant="ghost"
									className="flex items-center gap-2 text-white hover:bg-white/10 rounded-full px-4 py-2"
								>
									{isCompareMode ? (
										<ToggleRight
											className={`w-5 h-5 text-${data.color ?? "red"}-400`}
										/>
									) : (
										<ToggleLeft className="w-5 h-5 text-gray-400" />
									)}
									<span className="text-sm font-medium">
										{isCompareMode ? "مقایسه" : "نمایش جدا"}
									</span>
								</Button>
							</div>
						</div>

						{/* Images Section */}
						<div className="max-w-2xl mx-auto">
							{isCompareMode ? (
								/* Compare Mode */
								<div className="mb-20">
									<div className="relative group">
										{/* Audio-reactive circular glows */}
										<div
											className={`absolute -inset-4 bg-${
												data.color ?? "red"
											}-600/10 rounded-full blur-3xl ${
												!isPlaying ? "animate-breathe-outer" : ""
											}`}
											style={
												isPlaying ? getReactiveGlowStyle(0.3, "outer") : {}
											}
										></div>
										<div
											className={`absolute -inset-2 bg-${
												data.color ?? "red"
											}-500/15 rounded-full blur-2xl ${
												!isPlaying ? "animate-breathe-middle" : ""
											}`}
											style={
												isPlaying ? getReactiveGlowStyle(0.2, "middle") : {}
											}
										></div>
										<div
											className={`absolute -inset-1 bg-${
												data.color ?? "red"
											}-400/20 rounded-full blur-xl ${
												!isPlaying ? "animate-breathe-inner" : ""
											}`}
											style={
												isPlaying ? getReactiveGlowStyle(0.1, "inner") : {}
											}
										></div>

										<div className="relative aspect-auto overflow-hidden rounded-lg transform transition-all duration-300 ease-in-out group-hover:scale-[1.02]">
											{/* Before Image (Right side) */}
											<img
												src={data.artwork_new}
												alt={data.title}
												className="w-full h-full object-cover"
											/>

											{/* After Image (Left side) with clip */}
											<div
												className="absolute inset-0 overflow-hidden"
												style={{
													clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
												}}
											>
												<img
													src={data.artwork_org}
													alt="Original Artwork"
													className="w-full h-full object-cover"
												/>
											</div>

											{/* Slider */}
											<div
												className="absolute inset-0 cursor-col-resize touch-none"
												onMouseDown={handleSliderChange}
												onMouseMove={handleSliderDrag}
												onTouchStart={(e) => {
													e.preventDefault();
													const touch = e.touches.item(0);
													const rect = e.currentTarget.getBoundingClientRect();
													const x = touch.clientX - rect.left;
													const percentage = (x / rect.width) * 100;
													setSliderPosition(
														Math.max(0, Math.min(100, percentage))
													);
												}}
												onTouchMove={(e) => {
													e.preventDefault();
													const touch = e.touches.item(0);
													const rect = e.currentTarget.getBoundingClientRect();
													const x = touch.clientX - rect.left;
													const percentage = (x / rect.width) * 100;
													setSliderPosition(
														Math.max(0, Math.min(100, percentage))
													);
												}}
											>
												<div
													className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
													style={{ left: `${sliderPosition}%` }}
												>
													<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
														<div
															className={`w-4 h-4 bg-${
																data.color ?? "red"
															}-600 rounded-full`}
														></div>
													</div>
												</div>
											</div>

											{/* Labels */}
											<div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
												<p className="text-white text-sm font-medium">
													Original Artwork
												</p>
											</div>
											<div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
												<p className="text-white text-sm font-medium">
													My Artwork
												</p>
											</div>
										</div>
									</div>
								</div>
							) : (
								/* Side-by-Side Mode */
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-20">
									{[
										{
											id: 1,
											caption: "Original Artwork",
											image: data.artwork_org,
										},
										{ id: 2, caption: data.title, image: data.artwork_new },
									].map((item) => (
										<div
											key={item.id}
											className="relative group cursor-pointer"
											onMouseEnter={() => setHoveredImage(item.id)}
											onMouseLeave={() => setHoveredImage(null)}
											onClick={() => openLightbox(item)}
										>
											{/* Audio-reactive circular glows */}
											<div
												className={`absolute -inset-4 bg-${
													data.color ?? "red"
												}-600/10 rounded-full blur-3xl ${
													!isPlaying ? "animate-breathe-outer" : ""
												}`}
												style={
													isPlaying ? getReactiveGlowStyle(0.3, "outer") : {}
												}
											></div>
											<div
												className={`absolute -inset-2 bg-${
													data.color ?? "red"
												}-500/15 rounded-full blur-2xl ${
													!isPlaying ? "animate-breathe-middle" : ""
												}`}
												style={
													isPlaying ? getReactiveGlowStyle(0.2, "middle") : {}
												}
											></div>
											<div
												className={`absolute -inset-1 bg-${
													data.color ?? "red"
												}-400/20 rounded-full blur-xl ${
													!isPlaying ? "animate-breathe-inner" : ""
												}`}
												style={
													isPlaying ? getReactiveGlowStyle(0.1, "inner") : {}
												}
											></div>

											<div className="relative">
												<div className="aspect-auto overflow-hidden rounded-lg transform transition-all duration-300 ease-in-out group-hover:scale-[1.02] group-hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]">
													<img
														src={item.image}
														alt={item.caption}
														className="w-full h-full object-cover"
													/>
													<div
														className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
													></div>
													{/* Click indicator */}
													<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
														<div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
															<ZoomIn className="w-6 h-6 text-white" />
														</div>
													</div>
												</div>
												<div className="mt-3 text-center">
													<p className="text-gray-300 text-sm font-medium tracking-wide group-hover:text-white transition-colors duration-300">
														{item.caption}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</>
				) : (
					""
				)}

				{/* Artist Statement Section */}
				{data.statement ? (
					<div className="max-w-3xl mx-auto mb-20">
						<div className="backdrop-blur-xl bg-gray-800/30 rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
							{/* <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 bg-gradient-to-r from-red-300 to-red-100 bg-clip-text text-transparent">
								استیتمنت
							</h2> */}
							<div className="prose prose-lg prose-invert max-w-none">
								<p
									className="text-gray-300 leading-relaxed mb-4 rtl-text text-justify"
									dangerouslySetInnerHTML={{ __html: data.statement }}
								/>
							</div>
						</div>
					</div>
				) : (
					""
				)}

				{/* Video Section */}
				{data.video ? (
					<div className="max-w-3xl mx-auto mb-32">
						<div className="text-center mb-8">
							{/* <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-red-300 to-red-100 bg-clip-text text-transparent">
							فرآینده
						</h2> */}
							{/* <p className="text-gray-300 text-lg">
      Watch the transformation unfold from classical masterpiece to digital interpretation
    </p> */}
						</div>

						<div className="relative group">
							{/* Video glow effects */}
							<div
								className={`absolute -inset-6 bg-${
									data.color ?? "red"
								}-600/10 rounded-2xl blur-2xl animate-breathe-outer`}
							></div>
							<div
								className={`absolute -inset-4 bg-${
									data.color ?? "red"
								}-500/15 rounded-2xl blur-xl animate-breathe-middle`}
							></div>

							<div className="relative backdrop-blur-xl bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
								<div className="relative aspect-video overflow-hidden rounded-lg">
									<video
										ref={videoRef}
										className="w-full h-full object-cover"
										onPlay={() => setIsVideoPlaying(true)}
										onPause={() => setIsVideoPlaying(false)}
										onEnded={() => setIsVideoPlaying(false)}
										poster={data.artwork_org}
									>
										<source src={data.video} type="video/mp4" />
										Your browser does not support the video element.
									</video>

									{/* Video overlay controls */}
									<div
										className={`absolute inset-0 bg-black/20 ${
											isVideoPlaying ? "opacity-0" : ""
										} group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center`}
									>
										<Button
											onClick={toggleVideoPlayPause}
											size="lg"
											className="rounded-full w-16 h-16 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30"
										>
											{isVideoPlaying ? (
												<PauseCircle className="w-8 h-8" />
											) : (
												<PlayCircle className="w-8 h-8" />
											)}
										</Button>
									</div>
								</div>

								<div className="mt-4 text-center">
									<p className="text-gray-400 text-sm">سخنان هنرمند</p>
								</div>
							</div>
						</div>
					</div>
				) : (
					""
				)}

				{/* Audio Player Section */}
				{data.sound ? (
					<div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
						{/* <div className="flex items-end gap-[2px] h-16 cursor-pointer">
    {defaultWaveform.map((height, idx) => (
      <div
        key={idx}
        onClick={() => handleSeek(idx)}
        className={`w-[4px] rounded-full transition-all duration-150 ${
          idx <= progressIndex ? 'bg-[#1db954]' : 'bg-gray-700'
        }`}
        style={{ height: `${height * 4}px` }}
      />
    ))}
  </div> */}
						<div className="relative">
							{/* Audio-reactive circular glow for audio player */}
							<div
								className={`absolute -inset-8 bg-${
									data.color ?? "red"
								}-600/15 rounded-full blur-3xl ${
									!isPlaying ? "animate-breathe-audio" : ""
								}`}
								style={isPlaying ? getReactiveGlowStyle(0.4, "outer") : {}}
							></div>
							<div
								className={`absolute -inset-6 bg-${
									data.color ?? "red"
								}-500/20 rounded-full blur-2xl ${
									!isPlaying ? "animate-breathe-middle" : ""
								}`}
								style={isPlaying ? getReactiveGlowStyle(0.3, "middle") : {}}
							></div>

							<div className="backdrop-blur-xl bg-gray-800/40 rounded-full p-6 border border-gray-700/50 flex items-center justify-center relative">
								<div
									className={`absolute inset-0 rounded-full bg-gradient-to-r from-${
										data.color ?? "red"
									}-600/20 to-${data.color ?? "red"}-500/20 animate-pulse-slow`}
								></div>
								<Button
									onClick={togglePlayPause}
									size="lg"
									className="rounded-full w-16 h-16 bg-gradient-to-br from-white to-gray-200 text-gray-900 hover:from-gray-100 hover:to-white shadow-md transform transition-transform duration-200 hover:scale-105 z-10"
								>
									{isPlaying ? (
										<Pause
											className={`w-6 h-6 text-${data.color ?? "red"}-900`}
										/>
									) : (
										<Play
											className={`w-6 h-6 ml-1 text-${data.color ?? "red"}-900`}
										/>
									)}
								</Button>
							</div>
						</div>
						{/* <WaveformAudioPlayer src={data.sound} /> */}

						{/* Hidden Audio Element */}
						<audio
							ref={audioRef}
							onEnded={() => setIsPlaying(false)}
							onPause={() => setIsPlaying(false)}
							onPlay={() => setIsPlaying(true)}
							crossOrigin="anonymous"
							autoPlay
							muted
						>
							<source src={data.sound} type="audio/mpeg" />
							Your browser does not support the audio element.
						</audio>
					</div>
				) : (
					""
				)}
			</div>
			{/* Lightbox Modal */}
			{lightboxOpen && lightboxImage && (
				<div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center">
					{/* Close button */}
					<Button
						onClick={closeLightbox}
						variant="ghost"
						size="lg"
						className="absolute top-4 right-4 z-[110] text-white hover:bg-white/10 rounded-full p-3"
					>
						<X className="w-6 h-6" />
					</Button>

					{/* Zoom controls */}
					<div className="absolute top-4 left-4 z-[110] flex gap-2">
						<Button
							onClick={handleZoomIn}
							variant="ghost"
							size="lg"
							className="text-white hover:bg-white/10 rounded-full p-3"
							disabled={zoomLevel >= 5}
						>
							<ZoomIn className="w-5 h-5" />
						</Button>
						<Button
							onClick={handleZoomOut}
							variant="ghost"
							size="lg"
							className="text-white hover:bg-white/10 rounded-full p-3"
							disabled={zoomLevel <= 0.5}
						>
							<ZoomOut className="w-5 h-5" />
						</Button>
					</div>

					{/* Zoom level indicator */}
					<div className="absolute bottom-4 left-4 z-[110] bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
						<p className="text-white text-sm font-medium">
							{Math.round(zoomLevel * 100)}%
						</p>
					</div>

					{/* Image caption */}
					<div className="absolute bottom-4 right-4 z-[110] bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
						<p className="text-white text-sm font-medium">
							{lightboxImage.caption}
						</p>
					</div>

					{/* Image container */}
					<div
						ref={imageContainerRef}
						className="relative w-full h-full flex items-center justify-center overflow-hidden"
						onMouseDown={handleMouseDown}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						onMouseLeave={handleMouseUp}
						onTouchStart={handleTouchStart}
						onTouchMove={handleTouchMove}
						onTouchEnd={handleTouchEnd}
						style={{
							cursor:
								zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "default",
						}}
					>
						<div
							className="relative transition-transform duration-200 ease-out"
							style={{
								transform: `scale(${zoomLevel}) translate(${
									panPosition.x / zoomLevel
								}px, ${panPosition.y / zoomLevel}px)`,
							}}
						>
							<img
								src={lightboxImage.image}
								alt={lightboxImage.caption}
								width={800}
								height={800}
								className="max-w-[90vw] max-h-[90vh] object-contain"
								draggable={false}
							/>
						</div>
					</div>

					{/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[110] bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
    <p className="text-white text-[0.6rem] text-center">
      Use +/- keys or buttons to zoom <br />
      Drag to pan when zoomed <br />
      ESC to close
    </p>
  </div> */}
				</div>
			)}
		</>
	);
}
