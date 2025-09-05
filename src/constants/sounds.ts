// Sound configuration for reminder notifications
export interface SoundConfig {
	id: string;
	name: string;
	type: OscillatorType;
	frequency: number;
	duration: number;
	volume: number;
	fadeInDuration: number;
	fadeOutDuration: number;
}

export const SOUND_CONFIGS: SoundConfig[] = [
	{
		id: "classic",
		name: "Classic Ping",
		type: "sine",
		frequency: 880, // A5
		duration: 0.6,
		volume: 0.2,
		fadeInDuration: 0.01,
		fadeOutDuration: 0.6,
	},
	{
		id: "gentle",
		name: "Gentle Bell",
		type: "sine",
		frequency: 523, // C5
		duration: 1.0,
		volume: 0.15,
		fadeInDuration: 0.1,
		fadeOutDuration: 0.9,
	},
	{
		id: "urgent",
		name: "Urgent Alert",
		type: "square",
		frequency: 1000,
		duration: 0.3,
		volume: 0.25,
		fadeInDuration: 0.005,
		fadeOutDuration: 0.2,
	},
	{
		id: "soft",
		name: "Soft Chime",
		type: "triangle",
		frequency: 659, // E5
		duration: 1.2,
		volume: 0.12,
		fadeInDuration: 0.2,
		fadeOutDuration: 1.0,
	},
	{
		id: "digital",
		name: "Digital Beep",
		type: "square",
		frequency: 1319, // E6
		duration: 0.4,
		volume: 0.18,
		fadeInDuration: 0.01,
		fadeOutDuration: 0.3,
	},
	{
		id: "warm",
		name: "Warm Tone",
		type: "sawtooth",
		frequency: 440, // A4
		duration: 0.8,
		volume: 0.16,
		fadeInDuration: 0.05,
		fadeOutDuration: 0.7,
	},
	{
		id: "bright",
		name: "Bright Ding",
		type: "sine",
		frequency: 1760, // A6
		duration: 0.5,
		volume: 0.2,
		fadeInDuration: 0.01,
		fadeOutDuration: 0.4,
	},
	{
		id: "deep",
		name: "Deep Bell",
		type: "sine",
		frequency: 220, // A3
		duration: 1.5,
		volume: 0.22,
		fadeInDuration: 0.1,
		fadeOutDuration: 1.3,
	},
	{
		id: "crisp",
		name: "Crisp Click",
		type: "square",
		frequency: 2000,
		duration: 0.2,
		volume: 0.15,
		fadeInDuration: 0.002,
		fadeOutDuration: 0.15,
	},
	{
		id: "mellow",
		name: "Mellow Hum",
		type: "triangle",
		frequency: 330, // E4
		duration: 1.0,
		volume: 0.14,
		fadeInDuration: 0.3,
		fadeOutDuration: 0.7,
	},
];

// Play a sound based on configuration
export async function playSound(config: SoundConfig): Promise<void> {
	try {
		const AudioContextCtor =
			(
				window as Window &
					typeof globalThis & { webkitAudioContext?: typeof AudioContext }
			).AudioContext ||
			(
				window as Window &
					typeof globalThis & { webkitAudioContext?: typeof AudioContext }
			).webkitAudioContext;
		if (!AudioContextCtor) return;

		const audioContext = new AudioContextCtor();
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();

		oscillator.type = config.type;
		oscillator.frequency.value = config.frequency;

		gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(
			config.volume,
			audioContext.currentTime + config.fadeInDuration,
		);
		gainNode.gain.exponentialRampToValueAtTime(
			0.0001,
			audioContext.currentTime + config.fadeOutDuration,
		);

		oscillator.connect(gainNode).connect(audioContext.destination);
		oscillator.start();
		oscillator.stop(audioContext.currentTime + config.duration);
	} catch {
		// ignore autoplay or construction errors
	}
}

// Get sound config by ID
export function getSoundConfig(id: string): SoundConfig {
	return SOUND_CONFIGS.find((config) => config.id === id) || SOUND_CONFIGS[0];
}

// Default sound ID
export const DEFAULT_SOUND_ID = "classic";
