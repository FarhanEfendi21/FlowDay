/**
 * Utility to handle smooth circular reveal theme transitions using the View Transitions API.
 */
export const toggleThemeWithTransition = (
  newTheme: string,
  setTheme: (theme: string) => void,
  event?: React.MouseEvent | MouseEvent | any
) => {
  // Fallback for browsers that don't support View Transitions
  if (!(document as any).startViewTransition) {
    setTheme(newTheme);
    return;
  }

  // Get the click position, or default to center of screen
  const x = event?.clientX ?? window.innerWidth / 2;
  const y = event?.clientY ?? window.innerHeight / 2;
  
  // Calculate the distance to the farthest corner
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  // Start the transition
  const transition = (document as any).startViewTransition(() => {
    setTheme(newTheme);
  });

  // Animation logic
  transition.ready.then(() => {
    const isDark = newTheme === "dark";
    
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 500,
        easing: "ease-in-out",
        // The reveal effect works by animating the "new" view on top of the "old" one
        pseudoElement: "::view-transition-new(root)",
      }
    );
  });
};
