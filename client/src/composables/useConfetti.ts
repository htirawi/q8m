import confetti from "canvas-confetti";

export function useConfetti() {
  /**
   * Trigger a celebration confetti animation
   */
  function celebrate() {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }

  /**
   * Trigger a simple burst of confetti
   */
  function burst(options?: confetti.Options) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      zIndex: 9999,
      ...options,
    });
  }

  /**
   * Trigger confetti from the sides (for achievements)
   */
  function fireworks() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }

  /**
   * Trigger confetti rain from the top
   */
  function rain(duration = 2000) {
    const animationEnd = Date.now() + duration;
    const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e"];

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0 },
        colors,
        zIndex: 9999,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0 },
        colors,
        zIndex: 9999,
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }

  /**
   * Trigger emoji confetti
   */
  function emoji(emojis: string[], options?: confetti.Options) {
    const scalar = 2;
    const emoji = confetti.shapeFromText({
      text: emojis[Math.floor(Math.random() * emojis.length)],
      scalar,
    });

    confetti({
      shapes: [emoji],
      particleCount: 50,
      spread: 100,
      origin: { y: 0.6 },
      scalar,
      zIndex: 9999,
      ...options,
    });
  }

  /**
   * Trigger a continuous cannon blast
   */
  function cannon() {
    const end = Date.now() + 3 * 1000;
    const colors = ["#6366f1", "#8b5cf6"];

    (function blast() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
        zIndex: 9999,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
        zIndex: 9999,
      });

      if (Date.now() < end) {
        requestAnimationFrame(blast);
      }
    })();
  }

  /**
   * Clear all confetti
   */
  function clear() {
    confetti.reset();
  }

  return {
    celebrate,
    burst,
    fireworks,
    rain,
    emoji,
    cannon,
    clear,
  };
}
