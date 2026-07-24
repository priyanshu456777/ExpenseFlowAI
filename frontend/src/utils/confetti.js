import confetti from 'canvas-confetti';

/**
 * Fires a brief, tasteful confetti burst using the brand color palette.
 * Used to celebrate a settlement being fully confirmed — a small moment
 * of delight for finishing what is otherwise a chore (paying people back).
 */
export const celebrateSettlement = () => {
  const colors = ['#6366F1', '#8B5CF6', '#10B981'];

  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors,
    disableForReducedMotion: true,
  });

  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
      disableForReducedMotion: true,
    });
  }, 150);
};
