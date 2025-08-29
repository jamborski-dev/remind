import { createFileRoute } from "@tanstack/react-router";
import ReminderApp from "../components/ReminderApp"; // we’ll put the code here

export const Route = createFileRoute("/")({
	component: ReminderApp,
});
