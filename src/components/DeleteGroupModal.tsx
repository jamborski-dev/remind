import type { ReminderGroup } from "../store";
import { Modal } from "./Modal";
import { Button } from "./ReminderApp.styled";
import { Flex } from "./design-system/layout/Flex";

interface DeleteGroupModalProps {
	groupToDelete: ReminderGroup | null;
	setGroupToDelete: (group: ReminderGroup | null) => void;
	deleteGroup: (group: ReminderGroup) => void;
}

const CenterText = ({
	children,
	className,
	style,
}: {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
}) => (
	<div
		style={{
			textAlign: "center",
			margin: "1rem 0",
			fontSize: className === "small" ? "0.875rem" : "1rem",
			color: className === "small" ? "#6b7280" : "inherit",
			...style,
		}}
	>
		{children}
	</div>
);

export function DeleteGroupModal({
	groupToDelete,
	setGroupToDelete,
	deleteGroup,
}: DeleteGroupModalProps) {
	return (
		<Modal open={!!groupToDelete}>
			{groupToDelete && (
				<div>
					<CenterText>
						<h3>Delete Group</h3>
					</CenterText>
					<CenterText>
						Are you sure you want to delete "{groupToDelete.title}"?
					</CenterText>
					<CenterText className="small" style={{ marginTop: "0.5rem" }}>
						This will permanently delete {groupToDelete.items.length} item
						{groupToDelete.items.length !== 1 ? "s" : ""} and cannot be undone.
					</CenterText>
					<Flex wrap="wrap" gap="0.5rem" justifyContent="center">
						<Button type="button" onClick={() => setGroupToDelete(null)}>
							Cancel
						</Button>
						<Button
							type="button"
							$variant="danger"
							onClick={() => deleteGroup(groupToDelete)}
						>
							Delete Group
						</Button>
					</Flex>
				</div>
			)}
		</Modal>
	);
}
