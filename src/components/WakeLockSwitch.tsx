import { useEffect, useState } from "react";
import { BsDisplay } from "react-icons/bs";
import { FaLock, FaLockOpen } from "react-icons/fa6";
import { WakeLockButton } from "./ReminderApp.styled";

interface WakeLockSwitchProps {
	acquire: () => Promise<void>;
	release: () => Promise<void>;
}

export function WakeLockSwitch({ acquire, release }: WakeLockSwitchProps) {
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		const onVisibility = async () => {
			if (document.visibilityState === "visible" && enabled) {
				await acquire();
			}
		};
		document.addEventListener("visibilitychange", onVisibility);
		return () => document.removeEventListener("visibilitychange", onVisibility);
	}, [enabled, acquire]);

	return (
		<WakeLockButton
			type="button"
			$enabled={enabled}
			onClick={async () => {
				if (!enabled) {
					await acquire();
					setEnabled(true);
				} else {
					await release();
					setEnabled(false);
				}
			}}
			title={
				enabled
					? "Screen locked awake - click to unlock"
					: "Screen can sleep - click to lock awake"
			}
		>
			<BsDisplay />
			{enabled ? <FaLock /> : <FaLockOpen />}
		</WakeLockButton>
	);
}
