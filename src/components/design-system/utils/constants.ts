// SIZE MAPPING
export const sizes = {
	xs: {
		padding: "0.25rem 0.5rem",
		fontSize: "0.75rem",
		borderRadius: "4px",
	},
	sm: {
		padding: "0.375rem 0.75rem",
		fontSize: "0.875rem",
		borderRadius: "4px",
	},
	md: {
		padding: "0.5rem 1rem",
		fontSize: "1rem",
		borderRadius: "6px",
	},
	lg: {
		padding: "0.625rem 1.25rem",
		fontSize: "1.125rem",
		borderRadius: "6px",
	},
	xl: {
		padding: "0.75rem 1.5rem",
		fontSize: "1.25rem",
		borderRadius: "8px",
	},
	"2xl": {
		padding: "1rem 2rem",
		fontSize: "1.375rem",
		borderRadius: "8px",
	},
	"3xl": {
		padding: "1.25rem 2.5rem",
		fontSize: "1.5rem",
		borderRadius: "10px",
	},
	"4xl": {
		padding: "1.5rem 3rem",
		fontSize: "1.75rem",
		borderRadius: "12px",
	},
} as const;

export type Size = keyof typeof sizes;

export const typographySizes = {
	xs: "0.75rem",
	sm: "0.875rem",
	md: "1rem",
	lg: "1.25rem",
	xl: "1.5rem",
	"2xl": "2rem",
	"3xl": "2.5rem",
	"4xl": "3rem",
} as const;
