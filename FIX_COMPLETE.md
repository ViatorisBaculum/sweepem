# Fix for Tutorial Modal Back Button Scaling Issue

## Problem

The back button on the first and second pages of the tutorial modal is being incorrectly scaled, likely due to it being part of the flex layout of the modal content.

## Root Cause

The back button is being inserted as a direct child of the modal container, which makes it part of the flex layout. When the content changes between pages, the flex layout affects the button's size.

## Solution

The fix involves ensuring the back button maintains consistent sizing regardless of content.

### CSS Changes

Add the following CSS rule to ensure the back button maintains consistent sizing:

```css
/* Ensure tutorial back button maintains consistent sizing */
.tutorial-modal .icon-btn.back {
	flex: 0 0 auto; /* Prevent flex sizing */
	width: 3em;
	height: 3em;
	margin-bottom: 1rem;
}
```

### JavaScript Changes

Modify how the back button is inserted in the tutorial modal to ensure it's properly positioned:

In `src/content.ts`, in the `showTutorial` function:

```typescript
// Add custom button to cancel the tutorial
tutorialModal.addCustomButton(
	"",
	() => {
		tutorialModal.destroyModal();
		showInitialModal();
	},
	{ classes: ["icon-btn", "back"], position: "start" }
);

// Move the back button to the beginning of the modal content
const modalElement = document.querySelector(".tutorial-modal");
if (modalElement) {
	const backButton = document.querySelector(".back") as HTMLElement;
	if (backButton) {
		// Ensure the back button is properly positioned and styled
		backButton.style.flex = "0 0 auto";
		backButton.style.width = "3em";
		backButton.style.height = "3em";
		backButton.style.marginBottom = "1rem";
		modalElement.insertBefore(backButton, modalElement.firstChild);
	}
}
```

## Alternative Solution

Wrap the back button in a container to isolate it from the flex layout:

```typescript
// Create a container for the back button to isolate it from flex layout
const backButtonContainer = document.createElement("div");
backButtonContainer.style.position = "relative";
backButtonContainer.style.marginBottom = "1rem";

// Add custom button to cancel the tutorial
tutorialModal.addCustomButton(
	"",
	() => {
		tutorialModal.destroyModal();
		showInitialModal();
	},
	{ classes: ["icon-btn", "back"], position: "start" }
);

// Move the back button to the beginning of the modal content
const modalElement = document.querySelector(".tutorial-modal");
if (modalElement) {
	const backButton = document.querySelector(".back") as HTMLElement;
	if (backButton) {
		// Wrap the back button in a container
		backButtonContainer.appendChild(backButton);
		modalElement.insertBefore(backButtonContainer, modalElement.firstChild);
	}
}
```

## Implementation Steps

1. Switch to Code mode to implement the CSS changes
2. Add the CSS rule to app.css
   // Wrap the back button in a container
   backButtonContainer.appendChild(backButton);
   showInitialModal();
   }, { classes: ["icon-btn", "back"], position: 'start' });

// Move the back button to the beginning of the modal content
const modalElement = document.querySelector('.tutorial-modal');
if (modalElement) {
const backButton = document.querySelector(".back") as HTMLElement;
if (backButton) {
tutorialModal.addCustomButton("", () => {
tutorialModal.destroyModal();
showInitialModal();
}, { classes: ["icon-btn", "back"], position: 'start' });

// Move the back button to the beginning of the modal content
const modalElement = document.querySelector('.tutorial-modal');
if (modalElement) {

// Add custom button to cancel the tutorial
tutorialModal.addCustomButton("", () => {
tutorialModal.destroyModal();
showInitialModal();
}, { classes: ["icon-btn", "back"], position: 'start' });

// Move the back button to the beginning of the modal content
const modalElement = document.querySelector('.tutorial-modal');
if (modalElement) {

```

```
